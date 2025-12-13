/**
 * @file routes/website.js
 * @description API routes per il sistema Website Builder
 * - Gestione siti web aziendali
 * - Pagine statiche con content management
 * - Integrazione con dm_files per immagini
 * - Catalogo prodotti sincronizzato con sistema esistente
 * @version 1.1 (Corretto e Riordinato)
 */
  
const express = require('express');
const router = express.Router();
const { verifyToken, hasPermission } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { dbPool } = require('../config/db');
const { knex } = require('../config/db'); // Importa knex per le transazioni

// Importazioni necessarie per S3
const {
  s3Client,
  PutObjectCommand,
  S3_BUCKET_NAME
} = require('../utils/s3Client');

// URL della CDN configurata su Cloudflare
const CDN_BASE_URL = 'https://cdn.operocloud.it';

// Middleware autenticazione
// TODO: Riattivare il middleware quando tutto funziona
// router.use(verifyToken); // DISATTIVATO PER DEBUG

// Mock user per debug - creare un utente fittizio quando l'autenticazione è disabilitata
const createMockUser = (req, res, next) => {
  if (!req.user) {
    req.user = {
      id: 1,
      id_ditta: 1,
      nome: 'Debug',
      cognome: 'User',
      livello: 90 // Admin per bypassare tutti i controlli
    };
  }
  next();
};

// Applica il mock user a tutte le rotte
router.use(createMockUser);

// Configurazione upload per immagini siti web
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file immagine sono ammessi'), false);
    }
  }
});

// ===============================================================
// API WEBSITE PRINCIPALI (Rotte Specifiche Prima)
// ===============================================================

/**
 * GET /api/website/eligible-companies
 * Recupera ditte eleggibili per nuovo sito (id_tipo_ditta = 1, senza sito)
 * NOTA: Questa rotta è stata spostata all'inizio per evitare conflitti con /:id
 */
router.get('/eligible-companies', async (req, res) => {
  try {
    console.log('Access request to eligible-companies (no auth required for debug)');
    const [companies] = await dbPool.execute(`
      SELECT
        d.id,
        d.ragione_sociale,
        d.p_iva,
        d.mail_1,
        d.citta,
        d.provincia,
        d.tel1,
        d.indirizzo
      FROM ditte d
      LEFT JOIN siti_web_aziendali sw ON d.id = sw.id_ditta
      WHERE sw.id_ditta IS NULL   -- Che non hanno già sito
        AND d.id_tipo_ditta = 1  -- Solo ditte eleggibili per sito
      ORDER BY d.ragione_sociale ASC
    `);

    res.json({
      success: true,
      companies: companies,
      total: companies.length
    });

  } catch (error) {
    console.error('Errore recupero ditte eleggibili:', error);
    res.status(500).json({ error: 'Errore nel recupero delle ditte disponibili' });
  }
});

/**
 * GET /api/website/list
 * Recupera lista siti web aziendali (con filtri utente)
 */
router.get('/list', async (req, res) => {
  try {
    const { id_ditta, limit = 50, offset = 0, include_stats = true } = req.query;

    let whereClause = '';
    let params = [];

    if (id_ditta) {
      whereClause = 'WHERE sw.id_ditta = ?';
      params.push(id_ditta);
    }

    let query = `
      SELECT
        sw.id,
        sw.id_ditta,
        sw.subdomain,
        sw.domain_status,
        sw.template_id,
        sw.theme_config,
        sw.site_title,
        sw.site_description,
        sw.logo_url,
        sw.favicon_url,
        sw.enable_catalog,
        sw.catalog_settings,
        sw.created_at,
        sw.updated_at,
        d.ragione_sociale,
        d.id_tipo_ditta
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      ${whereClause}
      ORDER BY sw.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));
    const [websites] = await dbPool.execute(query, params);

    // ... (logica per le statistiche, mantenuta da una delle versioni originali)
    if (include_stats === 'true' && websites.length > 0) {
      const siteIds = websites.map(w => w.id);
      const [pagesCount] = await dbPool.execute(`SELECT id_sito_web, COUNT(*) as pages_count, SUM(is_published) as published_pages FROM pagine_sito_web WHERE id_sito_web IN (${siteIds.map(() => '?').join(',')}) GROUP BY id_sito_web`, siteIds);
      const [galleriesCount] = await dbPool.execute(`SELECT id_sito_web, COUNT(*) as galleries_count FROM wg_galleries WHERE id_sito_web IN (${siteIds.map(() => '?').join(',')}) AND is_active = 1 GROUP BY id_sito_web`, siteIds);
      const [imagesCount] = await dbPool.execute(`SELECT g.id_sito_web, COUNT(gi.id) as images_count FROM wg_galleries g LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria WHERE g.id_sito_web IN (${siteIds.map(() => '?').join(',')}) AND g.is_active = 1 GROUP BY g.id_sito_web`, siteIds);

      websites.forEach(website => {
        const siteId = website.id;
        website.theme_config = website.theme_config ? JSON.parse(website.theme_config) : {};
        website.catalog_settings = website.catalog_settings ? JSON.parse(website.catalog_settings) : {};
        const pagesStats = pagesCount.find(p => p.id_sito_web === siteId);
        const galleriesStats = galleriesCount.find(g => g.id_sito_web === siteId);
        const imagesStats = imagesCount.find(i => i.id_sito_web === siteId);
        website.stats = { pages_count: pagesStats ? pagesStats.pages_count : 0, published_pages: pagesStats ? pagesStats.published_pages : 0, galleries_count: galleriesStats ? galleriesStats.galleries_count : 0, images_count: imagesStats ? imagesStats.images_count : 0 };
      });
    } else {
      websites.forEach(website => {
        website.theme_config = website.theme_config ? JSON.parse(website.theme_config) : {};
        website.catalog_settings = website.catalog_settings ? JSON.parse(website.catalog_settings) : {};
      });
    }

    const [countResult] = await dbPool.execute(`SELECT COUNT(*) as total FROM siti_web_aziendali sw ${whereClause}`, whereClause ? [id_ditta] : []);

    res.json({ success: true, data: websites, pagination: { total: countResult[0].total, limit: parseInt(limit), offset: parseInt(offset), has_more: (parseInt(offset) + websites.length) < countResult[0].total } });

  } catch (error) {
    console.error('Errore recupero lista siti web:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero della lista siti web' });
  }
});

/**
 * POST /api/website/create
 * Crea nuovo sito web (con supporto AI opzionale)
 */
router.post('/create', async (req, res) => {
  const {
    ditta_id,
    subdomain,
    site_title,
    template_id = 1,
    theme_config,
    catalog_settings,
    ai_generated = false,
    ai_company_context = null,
    ai_template_suggestions = null
  } = req.body;
  try {
    const [ditta] = await dbPool.execute('SELECT ragione_sociale, id_tipo_ditta FROM ditte WHERE id = ?', [ditta_id]);
    if (ditta.length === 0) return res.status(404).json({ error: 'Ditta non trovata' });
    if (ditta[0].id_tipo_ditta !== 1) return res.status(403).json({ error: 'Questa ditta non è autorizzata ad avere un sito web (solo id_tipo_ditta = 1)' });

    const [existingSubdomain] = await dbPool.execute('SELECT COUNT(*) as count FROM siti_web_aziendali WHERE subdomain = ?', [subdomain]);
    if (existingSubdomain[0].count > 0) return res.status(400).json({ error: 'Subdomain già in uso' });

    const [existingSite] = await dbPool.execute('SELECT COUNT(*) as count FROM siti_web_aziendali WHERE id_ditta = ?', [ditta_id]);
    if (existingSite[0].count > 0) return res.status(400).json({ error: 'Questa ditta ha già un sito web associato' });

    const templateConfig = {
      template_id: template_id,
      theme_config: theme_config || { primary_color: '#0066cc', font_family: 'Inter, system-ui, sans-serif' },
      catalog_settings: catalog_settings || { enable_catalog: false, show_prices: false }
    };

    // AI metadata
    const aiMetadata = ai_generated ? {
      ai_generated: true,
      ai_company_context: ai_company_context,
      ai_model_version: 'z-ai-v1',
      ai_generation_metadata: {
        generated_at: new Date().toISOString(),
        template_suggestions: ai_template_suggestions || []
      }
    } : {
      ai_generated: false
    };

    const [result] = await dbPool.execute(`
      INSERT INTO siti_web_aziendali (
        id_ditta, subdomain, site_title, template_id, theme_config, catalog_settings,
        domain_status, ai_generated, ai_company_context, ai_model_version,
        ai_generation_metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, NOW())
    `, [
      ditta_id,
      subdomain,
      site_title || ditta[0].ragione_sociale,
      template_id,
      JSON.stringify(templateConfig.theme_config),
      JSON.stringify(templateConfig.catalog_settings),
      aiMetadata.ai_generated || false,
      aiMetadata.ai_company_context || null,
      aiMetadata.ai_model_version || null,
      JSON.stringify(aiMetadata.ai_generation_metadata || {})
    ]);

    const [newSite] = await dbPool.execute(`SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url FROM siti_web_aziendali sw JOIN ditte d ON sw.id_ditta = d.id WHERE sw.id = ?`, [result.insertId]);

    res.json({
      success: true,
      sito_id: result.insertId,
      message: `Sito web creato correttamente per ${ditta[0].ragione_sociale}${ai_generated ? ' (AI-generated)' : ''}`,
      url: `https://${subdomain}.operocloud.it`,
      website: {
        ...newSite[0],
        ai_metadata: aiMetadata
      }
    });

  } catch (error) {
    console.error('Errore creazione sito web:', error);
    if (error.code === 'ER_DUP_ENTRY') { res.status(400).json({ error: 'Subdomain già in uso' }); } else { res.status(500).json({ error: 'Errore nella creazione del sito web' }); }
  }
});

// ===============================================================
// API WEBSITE PER ID SITO (Rotte Parametriche)
// ===============================================================

/**
 * GET /api/website/by-company/:companyId
 * Recupera o crea sito web per azienda specifica (rinominato per evitare conflitti)
 */
router.get('/by-company/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    if (req.user.id_ditta !== parseInt(companyId) && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questa azienda' });
    }
    const [sites] = await dbPool.execute(`SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url FROM siti_web_aziendali sw JOIN ditte d ON sw.id_ditta = d.id WHERE sw.id_ditta = ?`, [companyId]);
    let website;
    if (sites.length === 0) {
      const [result] = await dbPool.execute(`INSERT INTO siti_web_aziendali (id_ditta, subdomain, site_title, domain_status, theme_config, created_at) VALUES (?, ?, ?, ?, ?, NOW())`, [companyId, `company${Date.now()}`, `Sito Web - ${req.user.nome} ${req.user.cognome}`, 'pending', JSON.stringify({ theme: 'professional', primary_color: '#3B82F6', secondary_color: '#1E40AF', font_family: 'Inter, system-ui, sans-serif' })]);
      const [newSite] = await dbPool.execute(`SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url FROM siti_web_aziendali sw JOIN ditte d ON sw.id_ditta = d.id WHERE sw.id = ?`, [result.insertId]);
      website = newSite[0];
    } else { website = sites[0]; }
    res.json({ success: true, website });
  } catch (error) { console.error('Errore recupero sito web:', error); res.status(500).json({ error: 'Errore nel recupero del sito web' }); }
});


/**
 * GET /api/website/:id
 * Recupera sito web aziendale completo
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [website] = await dbPool.execute(`SELECT sw.*, d.ragione_sociale, d.id_tipo_ditta FROM siti_web_aziendali sw JOIN ditte d ON sw.id_ditta = d.id WHERE sw.id = ?`, [id]);
    if (website.length === 0) return res.status(404).json({ success: false, error: 'Sito web non trovato' });
    const websiteData = website[0];
    const [pages] = await dbPool.execute(`SELECT id, titolo, slug, contenuto_html as contenuto, contenuto_json, meta_title, meta_description, is_published, menu_order as sort_order, created_at, updated_at, background_type, background_color, background_gradient, background_image, background_size, background_position, background_repeat, background_attachment, font_family, font_size, font_color, heading_font, heading_color, container_max_width, padding_top, padding_bottom, custom_css, style_config FROM pagine_sito_web WHERE id_sito_web = ? ORDER BY menu_order, titolo`, [websiteData.id]);
    const [galleries] = await dbPool.execute(`SELECT g.*, COUNT(gi.id) as numero_immagini FROM wg_galleries g LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria WHERE g.id_sito_web = ? AND g.is_active = 1 GROUP BY g.id ORDER BY g.sort_order, g.nome_galleria`, [websiteData.id]);
    const [imageCount] = await dbPool.execute(`SELECT COUNT(*) as total_images FROM wg_gallery_images gi JOIN wg_galleries g ON gi.id_galleria = g.id WHERE g.id_sito_web = ? AND g.is_active = 1`, [websiteData.id]);
    res.json({ success: true, website: { ...websiteData, template_config: websiteData.theme_config ? JSON.parse(websiteData.theme_config) : {}, catalog_settings: websiteData.catalog_settings ? JSON.parse(websiteData.catalog_settings) : {} }, pages: pages, galleries: galleries, images: [], settings: { catalog_settings: websiteData.catalog_settings ? JSON.parse(websiteData.catalog_settings) : {} } });
  } catch (error) { console.error('Errore recupero sito web:', error); res.status(500).json({ success: false, error: 'Errore nel recupero del sito web' }); }
});

/**
 * PUT /api/website/:websiteId
 * Aggiorna configurazione sito web
 */
router.put('/:websiteId', async (req, res) => {
  const { websiteId } = req.params;
  const { section, data } = req.body;
  try {
    const [siteCheck] = await dbPool.execute('SELECT id FROM siti_web_aziendali WHERE id = ?', [websiteId]);
    if (siteCheck.length === 0) return res.status(404).json({ error: 'Sito web non trovato' });

    let updateField = ''; let updateValue = null;
    switch (section) {
      case 'basic': updateField = 'site_title = ?, site_description = ?, template_id = ?, domain_status = ?, logo_url = ?, favicon_url = ?'; updateValue = [data.site_title, data.site_description, data.template_id, data.domain_status, data.logo_url, data.favicon_url]; break;
      case 'template_config': updateField = 'theme_config = ?'; updateValue = [JSON.stringify(data)]; break;
      case 'catalog_settings': updateField = 'enable_catalog = ?, catalog_settings = ?'; updateValue = [data.enable_catalog ? 1 : 0, JSON.stringify(data.catalog_settings || {})]; break;
      case 'global_styles': updateField = 'theme_config = ?'; updateValue = [JSON.stringify({
        ...JSON.parse(data.existingThemeConfig || '{}'),
        background: {
          type: data.background_type || 'color',
          color: data.background_color || '#ffffff',
          gradient: data.background_gradient || null,
          image: data.background_image || null,
          size: data.background_size || 'cover',
          position: data.background_position || 'center',
          repeat: data.background_repeat || 'no-repeat',
          attachment: data.background_attachment || 'scroll'
        },
        typography: {
          fontFamily: data.font_family || 'Inter',
          fontSize: data.font_size || '16',
          fontColor: data.font_color || '#333333',
          headingFont: data.heading_font || 'Inter',
          headingColor: data.heading_color || '#1a1a1a'
        },
        colors: {
          primary: data.primary_color || '#3B82F6',
          secondary: data.secondary_color || '#64748B',
          accent: data.accent_color || '#EF4444',
          buttonBackground: data.button_background_color || '#3B82F6',
          buttonText: data.button_text_color || '#ffffff',
          link: data.link_color || '#2563EB'
        },
        layout: {
          containerMaxWidth: data.container_max_width || '1200px',
          paddingTop: data.padding_top || '60px',
          paddingBottom: data.padding_bottom || '60px'
        },
        customCss: data.custom_css || null
      })]; break;
      case 'ai_metadata': updateField = 'ai_generated = ?, ai_company_context = ?, ai_model_version = ?, ai_generation_metadata = ?'; updateValue = [data.ai_generated || false, data.ai_company_context || null, data.ai_model_version || null, data.ai_generation_metadata || null]; break;
      default: return res.status(400).json({ error: `Sezione non valida: ${section}` });
    }
    await dbPool.execute(`UPDATE siti_web_aziendali SET ${updateField}, updated_at = NOW() WHERE id = ?`, [...updateValue, websiteId]);
    res.json({ success: true, message: 'Configurazione aggiornata con successo' });
  } catch (error) { console.error('Errore aggiornamento sito web:', error); res.status(500).json({ error: 'Errore nell\'aggiornamento del sito web: ' + error.message }); }
});

/**
 * POST /api/website/:websiteId/publish
 * Pubblica sito web (cambia stato)
 */
router.post('/:websiteId/publish', async (req, res) => {
  const { websiteId } = req.params;
  try {
    const [site] = await dbPool.execute('SELECT sw.id, sw.id_ditta, sw.domain_status FROM siti_web_aziendali sw WHERE sw.id = ?', [websiteId]);
    if (site.length === 0) return res.status(404).json({ error: 'Sito web non trovato' });
    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    const newStatus = site[0].domain_status === 'active' ? 'inactive' : 'active';
    await dbPool.execute('UPDATE siti_web_aziendali SET domain_status = ?, updated_at = NOW() WHERE id = ?', [newStatus, websiteId]);
    res.json({ success: true, message: `Sito ${newStatus === 'active' ? 'pubblicato' : 'disattivato'} con successo`, status: newStatus });
  } catch (error) { console.error('Errore pubblicazione sito web:', error); res.status(500).json({ error: 'Errore nella pubblicazione del sito web' }); }
});

/**
 * GET /api/website/:id/pages
 * Recupera pagine del sito web (supporta sia id_ditta che id_sito_web)
 */
router.get('/:id/pages', async (req, res) => {
  try {
    const { id } = req.params; let siteId; let isDittaId = false;
    const [directSite] = await dbPool.execute('SELECT id, id_ditta FROM siti_web_aziendali WHERE id = ?', [id]);
    if (directSite.length > 0) { siteId = directSite[0].id; console.log(`API Pages: Trovato sito diretto con id_sito_web=${siteId}`); }
    else {
      const [website] = await dbPool.execute('SELECT id, id_ditta FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1', [id]);
      if (website.length > 0) { siteId = website[0].id; isDittaId = true; console.log(`API Pages: Trovato sito tramite id_ditta=${id}, siteId=${siteId}`); }
      else { console.log(`API Pages: Nessun sito trovato per id=${id}`); return res.json({ success: true, pages: [], meta: { site_id: null, is_ditta_id: false, message: 'Nessun sito web trovato' } }); }
    }
    const [pages] = await dbPool.execute(`SELECT id, titolo, slug, contenuto_html as contenuto, contenuto_json, meta_title, meta_description, is_published, menu_order as sort_order, created_at, updated_at, background_type, background_color, background_gradient, background_image, background_size, background_position, background_repeat, background_attachment, font_family, font_size, font_color, heading_font, heading_color, container_max_width, padding_top, padding_bottom, custom_css, style_config FROM pagine_sito_web WHERE id_sito_web = ? ORDER BY menu_order, titolo`, [siteId]);
    console.log(`API Pages: Recuperate ${pages.length} pagine per siteId=${siteId}`);
    res.json({ success: true, pages: pages, meta: { site_id: siteId, is_ditta_id: isDittaId, pages_count: pages.length } });
  } catch (error) { console.error('Errore recupero pagine:', error); res.status(500).json({ success: false, error: 'Errore nel recupero delle pagine' }); }
});

/**
 * GET /api/website/:id/images
 * Recupera immagini del sito web
 */
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const [website] = await dbPool.execute('SELECT id FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1', [id]);
    if (website.length === 0) return res.json({ images: [] });
    const siteId = website[0].id;
    const [images] = await dbPool.execute(`SELECT DISTINCT f.id, f.file_name_originale, f.mime_type, f.file_size_bytes, f.s3_key, CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file, CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url, gi.caption, gi.alt_text, g.nome_galleria FROM dm_files f JOIN wg_gallery_images gi ON f.id = gi.id_file JOIN wg_galleries g ON gi.id_galleria = g.id WHERE g.id_sito_web = ? AND g.is_active = 1 ORDER BY g.sort_order, gi.order_pos`, [siteId]);
    res.json({ success: true, images: images });
  } catch (error) { console.error('Errore recupero immagini:', error); res.status(500).json({ success: false, error: 'Errore nel recupero delle immagini' }); }
});

/**
 * GET /api/website/:id/catalog-settings
 * Recupera impostazioni catalogo
 */
router.get('/:id/catalog-settings', async (req, res) => {
  try {
    const { id } = req.params;
    const [website] = await dbPool.execute('SELECT catalog_settings FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1', [id]);
    const settings = website.length > 0 && website[0].catalog_settings ? JSON.parse(website[0].catalog_settings) : {};
    res.json({ success: true, settings: settings });
  } catch (error) { console.error('Errore recupero catalog settings:', error); res.json({ success: true, settings: {} }); }
});

// ===============================================================
// API PAGINE STATICHE
// ===============================================================
// ... (Incolla qui l'intera sezione "API PAGINE STATICHE" dal file originale, usando :websiteId come parametro)
// ...

/**
 * GET /api/website/:websiteId/pages/:pageId
 * Recupera singola pagina
 */
router.get('/:websiteId/pages/:pageId', async (req, res) => { /* ... implementazione ... */ });
/**
 * POST /api/website/:websiteId/pages
 * Crea nuova pagina (con supporto AI opzionale)
 */
router.post('/:websiteId/pages', async (req, res) => {
  const { websiteId } = req.params;
  const {
    slug,
    titolo,
    contenuto_html,
    contenuto_json,
    meta_title,
    meta_description,
    is_published,
    menu_order,
    background_type,
    background_color,
    background_gradient,
    background_image,
    background_size,
    background_position,
    background_repeat,
    background_attachment,
    font_family,
    font_size,
    font_color,
    heading_font,
    heading_color,
    container_max_width,
    padding_top,
    padding_bottom,
    custom_css,
    style_config,
    // AI enhancement fields
    ai_generated = false,
    ai_generation_prompt = null,
    ai_confidence_score = null,
    ai_content_sections = null,
    ai_enhancements = null,
    ai_seo_metadata = null,
    ai_optimized_for_mobile = false
  } = req.body;

  try {
    console.log(`[DEBUG] Creazione pagina per sito ${websiteId}:`, req.body);

    const [siteCheck] = await dbPool.execute(`
      SELECT id FROM siti_web_aziendali WHERE id = ?
    `, [websiteId]);

    if (siteCheck.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    const data = {
      slug,
      titolo,
      contenuto_html,
      contenuto_json,
      meta_title,
      meta_description,
      is_published,
      menu_order,
      background_type,
      background_color,
      background_gradient,
      background_image,
      background_size,
      background_position,
      background_repeat,
      background_attachment,
      font_family,
      font_size,
      font_color,
      heading_font,
      heading_color,
      container_max_width,
      padding_top,
      padding_bottom,
      custom_css,
      style_config,
      ai_generated,
      ai_generation_prompt,
      ai_confidence_score,
      ai_content_sections,
      ai_enhancements,
      ai_seo_metadata,
      ai_optimized_for_mobile
    };

    // Controlla se la pagina esiste già
    const [existingPage] = await dbPool.execute(
      'SELECT id FROM pagine_sito_web WHERE id_sito_web = ? AND slug = ?',
      [websiteId, data.slug]
    );

    let result;
    if (existingPage.length > 0) {
      // Aggiorna la pagina esistente
      console.log(`📝 Aggiorno pagina esistente: ${data.slug} per sito ${websiteId}`);
      [result] = await dbPool.execute(`
        UPDATE pagine_sito_web SET
          titolo = ?,
          contenuto_html = ?,
          contenuto_json = ?,
          meta_title = ?,
          meta_description = ?,
          menu_order = ?,
          ai_generated = ?,
          ai_generation_prompt = ?,
          ai_confidence_score = ?,
          ai_content_sections = ?,
          ai_enhancements = ?,
          ai_seo_metadata = ?,
          ai_optimized_for_mobile = ?,
          updated_at = NOW()
        WHERE id_sito_web = ? AND slug = ?
      `, [
        data.titolo,
        data.contenuto_html,
        data.contenuto_json,
        data.meta_title,
        data.meta_description,
        data.menu_order,
        data.ai_generated,
        data.ai_generation_prompt,
        data.ai_confidence_score,
        data.ai_content_sections,
        data.ai_enhancements,
        data.ai_seo_metadata,
        data.ai_optimized_for_mobile,
        websiteId,
        data.slug
      ]);
    } else {
      // Inserisci nuova pagina
      console.log(`➕ Creo nuova pagina: ${data.slug} per sito ${websiteId}`);
      [result] = await dbPool.execute(`
        INSERT INTO pagine_sito_web (
          id_sito_web,
          slug,
          titolo,
          contenuto_html,
          contenuto_json,
          meta_title,
          meta_description,
          is_published,
          menu_order,
          ai_generated,
          ai_generation_prompt,
          ai_confidence_score,
          ai_content_sections,
          ai_enhancements,
          ai_seo_metadata,
          ai_optimized_for_mobile,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
      websiteId,
      data.slug,
      data.titolo,
      data.contenuto_html,
      data.contenuto_json,
      data.meta_title,
      data.meta_description,
      data.is_published ? 1 : 0,
      data.menu_order || 0,
      data.ai_generated || false,
      data.ai_generation_prompt || null,
      data.ai_confidence_score || null,
      data.ai_content_sections || null,
      data.ai_enhancements || null,
      data.ai_seo_metadata || null,
      data.ai_optimized_for_mobile || false
    ]);

    }

    if (existingPage.length > 0) {
      console.log(`[DEBUG] Pagina aggiornata: ${data.slug} per sito ${websiteId}`);
    } else {
      console.log(`[DEBUG] Pagina creata con ID: ${result.insertId}`);
    }

    res.json({
      success: true,
      message: existingPage.length > 0 ? 'Pagina aggiornata con successo' : 'Pagina creata con successo',
      page: {
        id: result.insertId || existingPage[0].id,
        id_sito_web: websiteId,
        updated: existingPage.length > 0,
        ...data
      }
    });

  } catch (error) {
    console.error('Errore creazione pagina:', error);
    res.status(500).json({ error: 'Errore nella creazione della pagina: ' + error.message });
  }
});

/**
 * PUT /api/website/:websiteId/pages/:pageId
 * Aggiorna pagina
 */
router.put('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;

  // Validazione parametri
  if (!websiteId || !pageId) {
    return res.status(400).json({
      success: false,
      error: 'Parametri mancanti: websiteId e pageId sono richiesti'
    });
  }
  const {
    slug,
    titolo,
    contenuto_html,
    contenuto_json,
    meta_title,
    meta_description,
    is_published,
    menu_order,
    // Campi stile
    background_type,
    background_color,
    background_gradient,
    background_image,
    background_size,
    background_position,
    background_repeat,
    background_attachment,
    font_family,
    font_size,
    font_color,
    heading_font,
    heading_color,
    container_max_width,
    padding_top,
    padding_bottom,
    custom_css,
    style_config
  } = req.body || {};

  try {
    console.log(`[DEBUG] Aggiornamento pagina ${pageId} per sito ${websiteId}`);

    const [pageCheck] = await dbPool.execute(`
      SELECT id FROM pagine_sito_web WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    const data = {
      slug: slug || '',
      titolo: titolo || 'Pagina senza titolo',
      contenuto_html: contenuto_html || '',
      contenuto_json: contenuto_json || '{}',
      meta_title: meta_title || titolo || 'Pagina senza titolo',
      meta_description: meta_description || '',
      is_published: is_published !== undefined ? is_published : 0,
      menu_order: menu_order !== undefined ? menu_order : 0,
      // Campi stile
      background_type: background_type || 'color',
      background_color: background_color || '#ffffff',
      background_gradient: background_gradient || null,
      background_image: background_image || null,
      background_size: background_size || 'cover',
      background_position: background_position || 'center',
      background_repeat: background_repeat || 'no-repeat',
      background_attachment: background_attachment || 'scroll',
      font_family: font_family || 'Inter',
      font_size: font_size || '16',
      font_color: font_color || '#333333',
      heading_font: heading_font || 'Inter',
      heading_color: heading_color || '#1a1a1a',
      container_max_width: container_max_width || '1200px',
      padding_top: padding_top || '60px',
      padding_bottom: padding_bottom || '60px',
      custom_css: custom_css || null,
      style_config: JSON.stringify(style_config || {})
    };

  // Debug: verifica che tutti i parametri siano definiti
    console.log('[DEBUG] Parametri per SQL:', {
      slug: data.slug,
      titolo: data.titolo,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      pageId: pageId,
      websiteId: websiteId
    });

    const [result] = await dbPool.execute(`
      UPDATE pagine_sito_web SET
        slug = ?,
        titolo = ?,
        contenuto_html = ?,
        contenuto_json = ?,
        meta_title = ?,
        meta_description = ?,
        is_published = ?,
        menu_order = ?,
        background_type = ?,
        background_color = ?,
        background_gradient = ?,
        background_image = ?,
        background_size = ?,
        background_position = ?,
        background_repeat = ?,
        background_attachment = ?,
        font_family = ?,
        font_size = ?,
        font_color = ?,
        heading_font = ?,
        heading_color = ?,
        container_max_width = ?,
        padding_top = ?,
        padding_bottom = ?,
        custom_css = ?,
        style_config = ?,
        updated_at = NOW()
      WHERE id = ? AND id_sito_web = ?
    `, [
      data.slug,
      data.titolo,
      data.contenuto_html || '',
      typeof data.contenuto_json === 'string' ? data.contenuto_json : JSON.stringify(data.contenuto_json),
      data.meta_title,
      data.meta_description,
      data.is_published ? 1 : 0,
      data.menu_order || 0,
      data.background_type || 'color',
      data.background_color || '#ffffff',
      data.background_gradient || null,
      data.background_image || null,
      data.background_size || 'cover',
      data.background_position || 'center',
      data.background_repeat || 'no-repeat',
      data.background_attachment || 'scroll',
      data.font_family || 'Inter',
      data.font_size || '16',
      data.font_color || '#333333',
      data.heading_font || null,
      data.heading_color || '#1a1a1a',
      data.container_max_width || '1200px',
      data.padding_top || '60px',
      data.padding_bottom || '60px',
      data.custom_css || null,
      JSON.stringify(data.style_config || {}),
      pageId,
      websiteId
    ]);

    console.log(`[DEBUG] Pagina aggiornata: ${result.affectedRows} righe modificate`);

    res.json({
      success: true,
      message: 'Pagina aggiornata con successo',
      page: {
        id: pageId,
        id_sito_web: websiteId,
        ...data
      }
    });

  } catch (error) {
    console.error('Errore aggiornamento pagina:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della pagina: ' + error.message });
  }
});
/**
 * DELETE /api/website/:websiteId/pages/:pageId
 * Elimina pagina
 */
router.delete('/:websiteId/pages/:pageId', async (req, res) => { /* ... implementazione ... */ });
/**
 * POST /api/website/:websiteId/pages/:pageId/publish
 * Toggle pubblicazione pagina
 */
router.post('/:websiteId/pages/:pageId/publish', async (req, res) => { /* ... implementazione ... */ });


// ===============================================================
// API GALLERIE FOTOGRAFICHE
// ===============================================================
// ... (Incolla qui l'intera sezione "API GALLERIE FOTOGRAFICHE" dal file originale)
// ...

/**
 * GET /api/website/:siteId/galleries
 * Recupera tutte le gallerie di un sito web
 */
router.get('/:siteId/galleries', async (req, res) => { /* ... implementazione ... */ });
/**
 * POST /api/website/:siteId/galleries
 * Crea nuova galleria
 */
router.post('/:siteId/galleries', async (req, res) => { /* ... implementazione ... */ });
// ... e così via per tutte le altre rotte delle gallerie ...


// ===============================================================
// API UPLOAD IMMAGINI
// ===============================================================

/**
 * POST /api/website/:websiteId/upload
 * Carica immagine per il sito web
 */
router.post('/:websiteId/upload', upload.single('file'), async (req, res) => { /* ... implementazione ... */ });

/**
 * DELETE /api/website/:websiteId/images/:imageId
 * Elimina immagine dal sito web
 */
router.delete('/:websiteId/images/:imageId', async (req, res) => { /* ... implementazione ... */ });


// ===============================================================
// API PUBBLICHE (per visualizzazione frontend)
// ===============================================================
// ... (Incolla qui l'intera sezione "API PUBLICHE GALLERIE" dal file originale)
// ...

/**
 * GET /api/public/website/:siteId/galleries/:galleryId
 * Recupera galleria pubblica per visualizzazione sito
 */
router.get('/public/website/:siteId/galleries/:galleryId', async (req, res) => { /* ... implementazione ... */ });

/**
 * GET /api/website/:websiteId/preview/:slug
 * Genera anteprima HTML pagina per preview
 */
router.get('/:websiteId/preview/:slug', async (req, res) => { /* ... implementazione ... */ });


module.exports = router;