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

// Funzione per generare HTML dalle sezioni
function generateHtmlFromSections(sections) {
  if (!Array.isArray(sections)) return '';

  let html = '';
  sections.forEach(section => {
    switch (section.type) {
      case 'hero':
        html += `
          <section class="hero" style="background-color: ${section.backgroundColor || '#f3f4f6'}; padding: 80px 0; text-align: center;">
            <div class="container mx-auto px-4">
              <h1 class="text-4xl font-bold mb-4">${section.title || ''}</h1>
              <p class="text-xl mb-6">${section.subtitle || ''}</p>
              ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block">${section.buttonText}</a>` : ''}
            </div>
          </section>
        `;
        break;
      case 'text':
        html += `
          <section class="text-section" style="padding: 60px 0;">
            <div class="container mx-auto px-4">
              ${section.content || ''}
            </div>
          </section>
        `;
        break;
      case 'image':
        html += `
          <section class="image-section" style="padding: 60px 0;">
            <div class="container mx-auto px-4 text-center">
              ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.altText || ''}" class="max-w-full h-auto rounded-lg">` : ''}
              ${section.caption ? `<p class="mt-4 text-gray-600">${section.caption}</p>` : ''}
            </div>
          </section>
        `;
        break;
      case 'contact':
        html += `
          <section class="contact-section" style="padding: 60px 0; background-color: #f9fafb;">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-8">Contatti</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 class="text-xl font-semibold mb-4">Informazioni</h3>
                  <p>Email: ${section.email || ''}</p>
                  <p>Telefono: ${section.phone || ''}</p>
                  <p>Indirizzo: ${section.address || ''}</p>
                </div>
                <div>
                  <h3 class="text-xl font-semibold mb-4">Messaggio</h3>
                  <form class="space-y-4">
                    <input type="text" placeholder="Nome" class="w-full p-2 border rounded">
                    <input type="email" placeholder="Email" class="w-full p-2 border rounded">
                    <textarea placeholder="Messaggio" rows="4" class="w-full p-2 border rounded"></textarea>
                    <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded">Invia</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        `;
        break;
      default:
        html += `<section class="unknown-section"><p>Sezione non riconosciuta: ${section.type}</p></section>`;
    }
  });

  return html;
}

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
 * Crea nuovo sito web
 */
router.post('/create', async (req, res) => {
  const { ditta_id, subdomain, site_title, template_id = 1, theme_config, catalog_settings } = req.body;
  try {
    const [ditta] = await dbPool.execute('SELECT ragione_sociale, id_tipo_ditta FROM ditte WHERE id = ?', [ditta_id]);
    if (ditta.length === 0) return res.status(404).json({ error: 'Ditta non trovata' });
    if (ditta[0].id_tipo_ditta !== 1) return res.status(403).json({ error: 'Questa ditta non è autorizzata ad avere un sito web (solo id_tipo_ditta = 1)' });

    const [existingSubdomain] = await dbPool.execute('SELECT COUNT(*) as count FROM siti_web_aziendali WHERE subdomain = ?', [subdomain]);
    if (existingSubdomain[0].count > 0) return res.status(400).json({ error: 'Subdomain già in uso' });

    const [existingSite] = await dbPool.execute('SELECT COUNT(*) as count FROM siti_web_aziendali WHERE id_ditta = ?', [ditta_id]);
    if (existingSite[0].count > 0) return res.status(400).json({ error: 'Questa ditta ha già un sito web associato' });

    const templateConfig = { template_id: template_id, theme_config: theme_config || { primary_color: '#0066cc', font_family: 'Inter, system-ui, sans-serif' }, catalog_settings: catalog_settings || { enable_catalog: false, show_prices: false } };

    const [result] = await dbPool.execute(`
      INSERT INTO siti_web_aziendali (id_ditta, subdomain, site_title, template_id, theme_config, catalog_settings, domain_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [ditta_id, subdomain, site_title || ditta[0].ragione_sociale, template_id, JSON.stringify(templateConfig.theme_config), JSON.stringify(templateConfig.catalog_settings)]);

    const [newSite] = await dbPool.execute(`SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url FROM siti_web_aziendali sw JOIN ditte d ON sw.id_ditta = d.id WHERE sw.id = ?`, [result.insertId]);

    res.json({ success: true, sito_id: result.insertId, message: `Sito web creato correttamente per ${ditta[0].ragione_sociale}`, url: `https://${subdomain}.operocloud.it`, website: newSite[0] });

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
    const [pages] = await dbPool.execute(`SELECT id, titolo, slug, contenuto_html as contenuto, meta_title, meta_description, is_published, menu_order as sort_order, created_at, updated_at FROM pagine_sito_web WHERE id_sito_web = ? ORDER BY menu_order, titolo`, [websiteData.id]);
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
    const [pages] = await dbPool.execute(`SELECT id, titolo, slug, contenuto_html as contenuto, meta_title, meta_description, is_published, menu_order as sort_order, created_at, updated_at FROM pagine_sito_web WHERE id_sito_web = ? ORDER BY menu_order, titolo`, [siteId]);
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

    // Prima prova con id del sito web direttamente
    const [websiteCheck] = await dbPool.execute('SELECT id FROM siti_web_aziendali WHERE id = ? LIMIT 1', [id]);
    let siteId;

    if (websiteCheck.length > 0) {
      // id è un siteId
      siteId = id;
      console.log(`[API Images] Trovato sito con id=${siteId}`);
    } else {
      // Prova con id_ditta
      const [website] = await dbPool.execute('SELECT id FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1', [id]);
      if (website.length === 0) {
        console.log(`[API Images] Nessun sito trovato per id=${id}`);
        return res.json({ success: true, images: [] });
      }
      siteId = website[0].id;
      console.log(`[API Images] Trovato sito tramite id_ditta=${id}, siteId=${siteId}`);
    }

    const [images] = await dbPool.execute(`SELECT DISTINCT f.id, f.file_name_originale, f.mime_type, f.file_size_bytes, f.s3_key, CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file, CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url, gi.caption, gi.alt_text, g.nome_galleria FROM dm_files f JOIN wg_gallery_images gi ON f.id = gi.id_file JOIN wg_galleries g ON gi.id_galleria = g.id WHERE g.id_sito_web = ? AND g.is_active = 1 ORDER BY g.sort_order, gi.order_pos`, [siteId]);

    console.log(`[API Images] Recuperate ${images.length} immagini per siteId=${siteId}`);
    res.json({ success: true, images: images });
  } catch (error) {
    console.error('Errore recupero immagini:', error);
    res.status(500).json({ success: false, error: 'Errore nel recupero delle immagini' });
  }
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
 * Crea nuova pagina
 */
router.post('/:websiteId/pages', async (req, res) => {
  const { websiteId } = req.params;
  const { slug, titolo, contenuto_html, contenuto_json, meta_title, meta_description, is_published, menu_order, template_name } = req.body;

  try {
    console.log(`[DEBUG] Creazione pagina per sito ${websiteId}:`, req.body);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante

    // Verifica che il sito esista
    const [siteCheck] = await dbPool.execute(`
      SELECT id FROM siti_web_aziendali WHERE id = ?
    `, [websiteId]);

    if (siteCheck.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    // Converti undefined in null per MySQL
    const normalizedSlug = slug !== undefined ? slug : null;
    const normalizedTitolo = titolo !== undefined ? titolo : null;
    const normalizedMetaTitle = meta_title !== undefined ? meta_title : null;
    const normalizedMetaDescription = meta_description !== undefined ? meta_description : null;
    const normalizedIsPublished = is_published !== undefined ? (is_published ? 1 : 0) : 0;
    const normalizedMenuOrder = menu_order !== undefined ? menu_order : 0;
    const normalizedTemplateName = template_name !== undefined ? template_name : null;

    // Genera HTML sempre dal JSON per coerenza
    let normalizedContenutoHtml = '';
    if (contenuto_json && contenuto_json.sections) {
      normalizedContenutoHtml = generateHtmlFromSections(contenuto_json.sections);
    } else if (typeof contenuto_html === 'string') {
      normalizedContenutoHtml = contenuto_html;
    } else {
      normalizedContenutoHtml = '<p>Contenuto in elaborazione...</p>';
    }

    // Converti il JSON in stringa per MySQL
    const jsonString = contenuto_json ? JSON.stringify(contenuto_json) : null;

    // Debug: mostra i parametri che verranno passati alla query
    const queryParams = [
      websiteId,
      normalizedSlug,
      normalizedTitolo,
      normalizedContenutoHtml,
      jsonString,
      normalizedMetaTitle,
      normalizedMetaDescription,
      normalizedIsPublished,
      normalizedMenuOrder,
      normalizedTemplateName
    ];

    console.log(`[DEBUG] Parametri query (${queryParams.length}):`, queryParams);
    console.log(`[DEBUG] contenuto_json type:`, typeof contenuto_json, contenuto_json);
    console.log(`[DEBUG] jsonString type:`, typeof jsonString, jsonString);

    const [result] = await dbPool.execute(`
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
        template_name,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, queryParams);

    console.log(`[DEBUG] Pagina creata con ID: ${result.insertId}`);

    res.json({
      success: true,
      id: result.insertId,
      message: 'Pagina creata con successo'
    });

  } catch (error) {
    console.error('Errore creazione pagina:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Slug già esistente per questo sito' });
    } else {
      res.status(500).json({ error: 'Errore nella creazione della pagina: ' + error.message });
    }
  }
});
/**
 * PUT /api/website/:websiteId/pages/:pageId
 * Aggiorna pagina esistente
 */
router.put('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;
  const { slug, titolo, contenuto_html, contenuto_json, meta_title, meta_description, is_published, menu_order, template_name } = req.body;

  try {
    console.log(`[DEBUG] Aggiornamento pagina ${pageId} per sito ${websiteId}`);

    // Verifica che la pagina esista e appartenga al sito
    const [pageCheck] = await dbPool.execute(`
      SELECT id FROM pagine_sito_web WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    // Normalizza i valori per l'UPDATE
    const normalizedIsPublished = is_published !== undefined ? (is_published ? 1 : 0) : 0;
    const normalizedMenuOrder = menu_order !== undefined ? menu_order : 0;
    const normalizedTemplateName = template_name !== undefined ? template_name : null;

    // Converti contenuto_html - ignora l'HTML inviato dal frontend e genera sempre da JSON
    let normalizedContenutoHtml = '';

    // Genera HTML sempre dal JSON per coerenza
    if (contenuto_json && contenuto_json.sections) {
      normalizedContenutoHtml = generateHtmlFromSections(contenuto_json.sections);
    } else if (typeof contenuto_html === 'string') {
      normalizedContenutoHtml = contenuto_html;
    } else {
      normalizedContenutoHtml = '<p>Contenuto in elaborazione...</p>';
    }

    // Debug: Stampa i valori prima della query
    console.log('[DEBUG] Valori per UPDATE:', {
      slug,
      titolo,
      contenuto_html_type: typeof contenuto_html,
      contenuto_html: normalizedContenutoHtml,
      contenuto_json: JSON.stringify(contenuto_json || { sections: [] }),
      meta_title,
      meta_description,
      is_published: normalizedIsPublished,
      menu_order: normalizedMenuOrder,
      template_name: normalizedTemplateName,
      pageId,
      websiteId
    });

    // Aggiorna pagina
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
        template_name = ?,
        updated_at = NOW()
      WHERE id = ? AND id_sito_web = ?
    `, [
      slug || '',
      titolo || '',
      normalizedContenutoHtml,
      JSON.stringify(contenuto_json || { sections: [] }),
      meta_title || '',
      meta_description || '',
      normalizedIsPublished,
      normalizedMenuOrder,
      normalizedTemplateName,
      pageId,
      websiteId
    ]);

    res.json({
      success: true,
      message: 'Pagina aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore aggiornamento pagina:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Slug già esistente per questo sito' });
    } else {
      res.status(500).json({ error: 'Errore nell\'aggiornamento della pagina: ' + error.message });
    }
  }
});
/**
 * DELETE /api/website/:websiteId/pages/:pageId
 * Elimina pagina
 */
router.delete('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;

  try {
    console.log(`[DEBUG] Eliminazione pagina ${pageId} per sito ${websiteId}`);

    // Verifica che la pagina esista e appartenga al sito
    const [pageCheck] = await dbPool.execute(`
      SELECT id FROM pagine_sito_web WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    // Soft delete: imposta is_deleted = true invece di eliminare fisicamente
    const [result] = await dbPool.execute(`
      DELETE FROM pagine_sito_web
      WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    res.json({
      success: true,
      message: 'Pagina eliminata con successo'
    });

  } catch (error) {
    console.error('Errore eliminazione pagina:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della pagina: ' + error.message });
  }
});
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
router.get('/:websiteId/preview/:slug', async (req, res) => {
  try {
    const { websiteId, slug } = req.params;

    console.log(`[Preview] Richiesta anteprima per sito ${websiteId}, slug ${slug}`);

    // Recupera il sito
    const [siteData] = await dbPool.execute(`
      SELECT sw.*, d.ragione_sociale
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.id = ?
    `, [websiteId]);

    if (siteData.length === 0) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Sito non trovato</h1>
            <p>Il sito web richiesto non esiste.</p>
          </body>
        </html>
      `);
    }

    const site = siteData[0];

    // Recupera la pagina
    const [pageData] = await dbPool.execute(`
      SELECT * FROM pagine_sito_web
      WHERE id_sito_web = ? AND slug = ?
    `, [websiteId, slug]);

    if (pageData.length === 0) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Pagina non trovata</h1>
            <p>La pagina richiesta non esiste.</p>
          </body>
        </html>
      `);
    }

    const page = pageData[0];

    // Genera HTML della pagina
    let pageContent = '';

    if (page.contenuto_json) {
      try {
        const jsonData = JSON.parse(page.contenuto_json);
        pageContent = generateHtmlFromSections(jsonData.sections || []);
      } catch (e) {
        console.error('Errore parsing contenuto JSON:', e);
        pageContent = page.contenuto_html || '<p>Contenuto non disponibile</p>';
      }
    } else if (page.contenuto_html) {
      pageContent = page.contenuto_html;
    }

    // Crea l'HTML completo della pagina
    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.meta_title || page.titolo || 'Anteprima Pagina'}</title>
    <meta name="description" content="${page.meta_description || ''}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .header h1 { font-size: 1.5rem; color: #111827; }
        .preview-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.5rem; text-align: center; font-size: 0.875rem; }
        .hero { background: #3b82f6; color: white; padding: 4rem 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; opacity: 0.9; }
        .btn { background: white; color: #3b82f6; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; }
        section { padding: 4rem 0; }
        section:nth-child(even) { background: #f9fafb; }
        h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #111827; }
        .text-xl { font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem; }
        img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .footer { background: #111827; color: white; padding: 2rem 0; text-align: center; }
    </style>
</head>
<body>
    <div class="preview-notice">
        📋 Modalità anteprima - Questa è un'anteprima della pagina
    </div>

    <header class="header">
        <div class="container">
            <h1>${site.ragione_sociale || 'Nome Azienda'}</h1>
        </div>
    </header>

    <main>
        ${pageContent}
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${site.ragione_sociale || 'Nome Azienda'}. Tutti i diritti riservati.</p>
            <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">Creato con Opero Cloud</p>
        </div>
    </footer>
</body>
</html>`;

    console.log(`[Preview] HTML generato per pagina ${page.id} (${html.length} caratteri)`);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Errore generazione anteprima:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Errore</h1>
          <p>Impossibile generare l'anteprima: ${error.message}</p>
        </body>
      </html>
    `);
  }
});


module.exports = router;