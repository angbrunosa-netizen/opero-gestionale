/**
 * @file routes/website.js
 * @description API routes per il sistema Website Builder
 * - Gestione siti web aziendali
 * - Pagine statiche con content management
 * - Integrazione con dm_files per immagini
 * - Catalogo prodotti sincronizzato con sistema esistente
 * @version 1.0
 */

const express = require('express');
const router = express.Router();
const { verifyToken, hasPermission } = require('../utils/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { dbPool } = require('../config/db');

// Middleware autenticazione
// TODO: Riattivare il middleware quando tutto funziona
// router.use(verifyToken);

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
// API SITI WEB
// ===============================================================

/**
 * GET /api/website/list
 * Recupera tutti i siti web dell'utente corrente
 */
router.get('/list', async (req, res) => {
  try {
    let whereClause = '';
    let params = [];

    // Temporaneamente per debug: mostriamo tutti i siti
    // TODO: Riattivare i controlli quando l'autenticazione è funzionante
    /*
    // Admin vede tutti i siti, altri utenti vedono solo siti della loro ditta
    if (req.user && req.user.livello >= 90) {
      // Admin: tutti i siti
      whereClause = '1=1';
    } else if (req.user) {
      // Utente normale: solo siti della sua ditta
      whereClause = 'sw.id_ditta = ?';
      params.push(req.user.id_ditta);
    } else {
      // Senza autenticazione: nessun sito
      whereClause = '1=0';
    }
    */
    whereClause = '1=1'; // Temporaneo: mostra tutti i siti

    const [sites] = await dbPool.execute(`
      SELECT
        sw.*,
        d.ragione_sociale,
        d.p_iva,
        d.citta,
        d.provincia
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE ${whereClause}
      ORDER BY sw.created_at DESC
    `, params);

    res.json({
      success: true,
      sites: sites
    });

  } catch (error) {
    console.error('Errore recupero siti web:', error);
    res.status(500).json({ error: 'Errore nel recupero dei siti web' });
  }
});

/**
 * GET /api/website/eligible-companies
 * Recupera ditte eleggibili per nuovo sito (id_tipo_ditta = 1, senza sito)
 */
router.get('/eligible-companies', async (req, res) => {
  try {
    // Per debug: accesso senza autenticazione
    console.log('Access request to eligible-companies (no auth required for debug)');

    // Temporaneamente: permettiamo l'accesso senza controlli di livello per debug
    // TODO: Riattivare i controlli di sicurezza quando tutto funziona
    /*
    if (req.user && req.user.livello < 90) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }
    */

    const [companies] = await dbPool.execute(`
      SELECT
        d.id,
        d.ragione_sociale,
        d.partita_iva,
        d.email,
        d.citta,
        d.provincia,
        d.telefono,
        d.indirizzo,
        -- Conteggio prodotti disponibili
        (SELECT COUNT(*) FROM ct_catalogo cp
         WHERE cp.id_ditta = d.id AND cp.attivo = 1) as prodotti_count,
        -- Conteggio prodotti con foto
        (SELECT COUNT(DISTINCT cp.id)
         FROM ct_catalogo cp
         JOIN dm_allegati_link dal ON cp.id = dal.entita_id
         WHERE cp.id_ditta = d.id
           AND dal.entita_tipo = 'CT_CATALOGO'
           AND cp.attivo = 1) as prodotti_con_foto
      FROM ditte d
      LEFT JOIN siti_web_aziendali sw ON d.id = sw.id_ditta
      WHERE sw.id_ditta IS NULL   -- Che non hanno già sito
        AND d.attiva = 1         -- Solo ditte attive
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
 * GET /api/website/:companyId
 * Recupera o crea sito web per azienda specifica
 */
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    // Verifica che l'utente abbia accesso a questa azienda
    if (req.user.id_ditta !== parseInt(companyId) && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questa azienda' });
    }

    // Recupera sito web esistente
    const [sites] = await dbPool.execute(`
      SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.id_ditta = ?
    `, [companyId]);

    let website;
    if (sites.length === 0) {
      // Crea sito web di default
      const [result] = await dbPool.execute(`
        INSERT INTO siti_web_aziendali (
          id_ditta,
          subdomain,
          site_title,
          domain_status,
          template_config,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        companyId,
        `company${Date.now()}`,
        `Sito Web - ${req.user.nome} ${req.user.cognome}`,
        'pending',
        JSON.stringify({
          theme: 'professional',
          primary_color: '#3B82F6',
          secondary_color: '#1E40AF',
          font_family: 'Inter, system-ui, sans-serif'
        })
      ]);

      const [newSite] = await dbPool.execute(`
        SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url
        FROM siti_web_aziendali sw
        JOIN ditte d ON sw.id_ditta = d.id
        WHERE sw.id = ?
      `, [result.insertId]);

      website = newSite[0];
    } else {
      website = sites[0];
    }

    res.json({
      success: true,
      website
    });

  } catch (error) {
    console.error('Errore recupero sito web:', error);
    res.status(500).json({ error: 'Errore nel recupero del sito web' });
  }
});

/**
 * POST /api/website/create
 * Crea nuovo sito web
 */
router.post('/create', async (req, res) => {
  const {
    ditta_id,
    subdomain,
    site_title,
    template_id = 1,
    theme_config,
    catalog_settings
  } = req.body;

  try {
    // Per debug: mostra richiesta di creazione sito
    console.log('Site creation request:', req.body);
    // Note: req.user non disponibile senza autenticazione

    // Temporaneamente: permettiamo creazione senza controlli stretti
    // TODO: Riattivare i controlli di sicurezza quando tutto funziona
    /*
    if (req.user && (req.user.id_ditta !== parseInt(ditta_id) && req.user.livello < 90)) {
      return res.status(403).json({ error: 'Non autorizzato per questa azienda' });
    }
    */

    // 1. Verifica tipo ditta = 1
    const [ditta] = await dbPool.execute(`
      SELECT ragione_sociale, id_tipo_ditta
      FROM ditte
      WHERE id = ?
    `, [ditta_id]);

    if (ditta.length === 0) {
      return res.status(404).json({ error: 'Ditta non trovata' });
    }

    if (ditta[0].id_tipo_ditta !== 1) {
      return res.status(403).json({
        error: 'Questa ditta non è autorizzata ad avere un sito web (solo id_tipo_ditta = 1)'
      });
    }

    // 2. Verifica disponibilità subdomain
    const [existingSubdomain] = await dbPool.execute(`
      SELECT COUNT(*) as count
      FROM siti_web_aziendali
      WHERE subdomain = ?
    `, [subdomain]);

    if (existingSubdomain[0].count > 0) {
      return res.status(400).json({ error: 'Subdomain già in uso' });
    }

    // 3. Verifica che la ditta non abbia già un sito
    const [existingSite] = await dbPool.execute(`
      SELECT COUNT(*) as count
      FROM siti_web_aziendali
      WHERE id_ditta = ?
    `, [ditta_id]);

    if (existingSite[0].count > 0) {
      return res.status(400).json({ error: 'Questa ditta ha già un sito web associato' });
    }

    // 4. Prepara configurazione template
    const templateConfig = {
      template_id: template_id,
      theme_config: theme_config || {
        primary_color: '#0066cc',
        font_family: 'Inter, system-ui, sans-serif'
      },
      catalog_settings: catalog_settings || {
        enable_catalog: false,
        show_prices: false
      }
    };

    // 5. Crea sito web
    const [result] = await dbPool.execute(`
      INSERT INTO siti_web_aziendali (
        id_ditta,
        subdomain,
        site_title,
        template_id,
        theme_config,
        catalog_settings,
        domain_status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      ditta_id,
      subdomain,
      site_title || ditta[0].ragione_sociale,
      template_id,
      JSON.stringify(templateConfig.theme_config),
      JSON.stringify(templateConfig.catalog_settings)
    ]);

    const [newSite] = await dbPool.execute(`
      SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.id = ?
    `, [result.insertId]);

    res.json({
      success: true,
      sito_id: result.insertId,
      message: `Sito web creato correttamente per ${ditta[0].ragione_sociale}`,
      url: `https://${subdomain}.operocloud.it`,
      website: newSite[0]
    });

  } catch (error) {
    console.error('Errore creazione sito web:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Subdomain già in uso' });
    } else {
      res.status(500).json({ error: 'Errore nella creazione del sito web' });
    }
  }
});

/**
 * PUT /api/website/:websiteId
 * Aggiorna configurazione sito web
 */
router.put('/:websiteId', async (req, res) => {
  const { websiteId } = req.params;
  const { section, data } = req.body;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id, sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    // Verifica permessi
    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    // Aggiorna base section
    let updateField = '';
    let updateValue = null;

    switch (section) {
      case 'settings':
        updateField = `
          site_title = ?,
          site_description = ?,
          google_analytics_id = ?,
          facebook_url = ?,
          instagram_url = ?,
          linkedin_url = ?
        `;
        updateValue = [
          data.site_title,
          data.site_description,
          data.google_analytics_id,
          data.facebook_url,
          data.instagram_url,
          data.linkedin_url
        ];
        break;

      case 'template_config':
        updateField = 'template_config = ?';
        updateValue = [JSON.stringify(data)];
        break;

      case 'catalog_settings':
        updateField = 'catalog_settings = ?';
        updateValue = [JSON.stringify(data)];
        break;

      default:
        return res.status(400).json({ error: 'Sezione non valida' });
    }

    await dbPool.execute(`
      UPDATE siti_web_aziendali
      SET ${updateField}, updated_at = NOW()
      WHERE id = ?
    `, [...updateValue, websiteId]);

    res.json({
      success: true,
      message: 'Configurazione aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore aggiornamento sito web:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del sito web' });
  }
});

/**
 * POST /api/website/:websiteId/publish
 * Pubblica sito web (cambia stato)
 */
router.post('/:websiteId/publish', async (req, res) => {
  const { websiteId } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id, sw.id_ditta, sw.domain_status
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    // Verifica permessi
    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    const newStatus = site[0].domain_status === 'active' ? 'inactive' : 'active';

    await dbPool.execute(`
      UPDATE siti_web_aziendali
      SET domain_status = ?, updated_at = NOW()
      WHERE id = ?
    `, [newStatus, websiteId]);

    res.json({
      success: true,
      message: `Sito ${newStatus === 'active' ? 'pubblicato' : 'disattivato'} con successo`,
      status: newStatus
    });

  } catch (error) {
    console.error('Errore pubblicazione sito web:', error);
    res.status(500).json({ error: 'Errore nella pubblicazione del sito web' });
  }
});

// ===============================================================
// API PAGINE STATICHE
// ===============================================================

/**
 * GET /api/website/:websiteId/pages
 * Recupera pagine del sito web
 */
router.get('/:websiteId/pages', async (req, res) => {
  const { websiteId } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    const [pages] = await dbPool.execute(`
      SELECT id, slug, titolo, meta_title, meta_description, is_published, menu_order, created_at, updated_at
      FROM pagine_sito_web
      WHERE id_sito_web = ?
      ORDER BY menu_order ASC, created_at ASC
    `, [websiteId]);

    res.json({
      success: true,
      pages
    });

  } catch (error) {
    console.error('Errore recupero pagine:', error);
    res.status(500).json({ error: 'Errore nel recupero delle pagine' });
  }
});

/**
 * POST /api/website/:websiteId/pages
 * Crea nuova pagina
 */
router.post('/:websiteId/pages', async (req, res) => {
  const { websiteId } = req.params;
  const { slug, titolo, contenuto_json, meta_title, meta_description, is_published, menu_order } = req.body;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    const [result] = await dbPool.execute(`
      INSERT INTO pagine_sito_web (
        id_sito_web,
        slug,
        titolo,
        contenuto_json,
        meta_title,
        meta_description,
        is_published,
        menu_order,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      websiteId,
      slug,
      titolo,
      JSON.stringify(contenuto_json),
      meta_title,
      meta_description,
      is_published || false,
      menu_order || 0
    ]);

    res.json({
      success: true,
      id: result.insertId
    });

  } catch (error) {
    console.error('Errore creazione pagina:', error);
    res.status(500).json({ error: 'Errore nella creazione della pagina' });
  }
});

/**
 * PUT /api/website/:websiteId/pages/:pageId
 * Aggiorna pagina
 */
router.put('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;
  const { titolo, contenuto_json, meta_title, meta_description, is_published } = req.body;

  try {
    // Verifica accesso alla pagina
    const [page] = await dbPool.execute(`
      SELECT ps.id, ps.id_sito_web, sw.id_ditta
      FROM pagine_sito_web ps
      JOIN siti_web_aziendali sw ON ps.id_sito_web = sw.id
      WHERE ps.id = ? AND ps.id_sito_web = ?
    `, [pageId, websiteId]);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    if (page[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questa pagina' });
    }

    await dbPool.execute(`
      UPDATE pagine_sito_web
      SET titolo = ?,
          contenuto_json = ?,
          meta_title = ?,
          meta_description = ?,
          is_published = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [
      titolo,
      JSON.stringify(contenuto_json),
      meta_title,
      meta_description,
      is_published,
      pageId
    ]);

    res.json({
      success: true,
      message: 'Pagina aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore aggiornamento pagina:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento della pagina' });
  }
});

/**
 * DELETE /api/website/:websiteId/pages/:pageId
 * Elimina pagina
 */
router.delete('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;

  try {
    // Verifica accesso alla pagina
    const [page] = await dbPool.execute(`
      SELECT ps.id, ps.id_sito_web, sw.id_ditta
      FROM pagine_sito_web ps
      JOIN siti_web_aziendali sw ON ps.id_sito_web = sw.id
      WHERE ps.id = ? AND ps.id_sito_web = ?
    `, [pageId, websiteId]);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    if (page[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questa pagina' });
    }

    await dbPool.execute(`
      DELETE FROM pagine_sito_web WHERE id = ?
    `, [pageId]);

    res.json({
      success: true,
      message: 'Pagina eliminata con successo'
    });

  } catch (error) {
    console.error('Errore eliminazione pagina:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della pagina' });
  }
});

// ===============================================================
// API IMAGINI SITI WEB
// ===============================================================

/**
 * GET /api/website/:websiteId/images
 * Recupera immagini del sito web (da dm_files)
 */
router.get('/:websiteId/images', async (req, res) => {
  const { websiteId } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    // Recupera immagini da dm_files con collegamento WEBSITE_IMAGES
    const [images] = await dbPool.execute(`
      SELECT
        df.id,
        df.file_name_originale,
        df.file_size_bytes,
        df.mime_type,
        df.s3_key,
        df.created_at,
        COALESCE(dal.entita_tipo, 'website') as category,
        COALESCE(dal.note, '') as description
      FROM dm_files df
      LEFT JOIN dm_allegati_link dal ON df.id = dal.id_file
      WHERE df.id_ditta = ?
        AND (dal.entita_tipo = 'WEBSITE_IMAGES' OR dal.entita_tipo IS NULL)
      AND df.mime_type LIKE 'image/%'
      ORDER BY df.created_at DESC
    `, [site[0].id_ditta]);

    // Formatta URL per le immagini
    const formattedImages = images.map(img => ({
      id: img.id,
      name: img.file_name_originale,
      url: img.s3_key ? `https://operogo.r3.it/${img.s3_key}` : null,
      type: img.mime_type,
      size: img.file_size_bytes,
      category: img.category,
      description: img.description,
      created_at: img.created_at
    }));

    res.json({
      success: true,
      images: formattedImages
    });

  } catch (error) {
    console.error('Errore recupero immagini:', error);
    res.status(500).json({ error: 'Errore nel recupero delle immagini' });
  }
});

/**
 * DELETE /api/website/:websiteId/images/:imageId
 * Elimina immagine dal sito web
 */
router.delete('/:websiteId/images/:imageId', async (req, res) => {
  const { websiteId, imageId } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    // Elimina collegamento allegato (non il file stesso)
    await dbPool.execute(`
      DELETE FROM dm_allegati_link
      WHERE id_file = ? AND entita_tipo = 'WEBSITE_IMAGES'
    `, [imageId]);

    res.json({
      success: true,
      message: 'Immagine rimossa dal sito web'
    });

  } catch (error) {
    console.error('Errore eliminazione immagine:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione dell\'immagine' });
  }
});

// ===============================================================
// API CATALOGO PRODOTTI (INTEGRAZIONE ESISTENTE)
// ===============================================================

/**
 * GET /api/website/:websiteId/catalog-settings
 * Recupera impostazioni catalogo
 */
router.get('/:websiteId/catalog-settings', async (req, res) => {
  const { websiteId } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta, sw.catalog_settings
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
      return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    }

    // Conteggio prodotti
    const [productCount] = await dbPool.execute(`
      SELECT COUNT(*) as total
      FROM catalogo_prodotti
      WHERE id_ditta = ? AND is_active = 1
    `, [site[0].id_ditta]);

    const settings = {
      ...JSON.parse(site[0].catalog_settings || '{}'),
      total_products: productCount[0].total
    };

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Errore recupero catalog settings:', error);
    res.status(500).json({ error: 'Errore nel recupero delle impostazioni catalogo' });
  }
});

/**
 * GET /api/website/:websiteId/preview/:slug
 * Genera anteprima HTML pagina per preview
 */
router.get('/:websiteId/preview/:slug', async (req, res) => {
  const { websiteId, slug } = req.params;

  try {
    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url, d.indirizzo, d.citta
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    const websiteData = site[0];
    const templateConfig = JSON.parse(websiteData.template_config || '{}');

    // Recupera pagina
    const [page] = await dbPool.execute(`
      SELECT * FROM pagine_sito_web
      WHERE id_sito_web = ? AND slug = ?
    `, [websiteId, slug]);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    const pageData = page[0];
    const pageContent = JSON.parse(pageData.contenuto_json || '{}');

    // Genera HTML preview
    let html = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageData.meta_title || pageData.titolo}</title>
        <meta name="description" content="${pageData.meta_description || ''}">
        <style>
          body {
            font-family: ${templateConfig.font_family || 'Inter, system-ui, sans-serif'};
            margin: 0;
            padding: 20px;
            background-color: ${templateConfig.bg_color || '#FFFFFF'};
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: ${templateConfig.max_width || '1200px'};
            margin: 0 auto;
          }
          h1, h2, h3 { color: ${templateConfig.primary_color || '#3B82F6'}; }
          .btn { background-color: ${templateConfig.primary_color || '#3B82F6'}; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${pageData.titolo}</h1>
    `;

    // Aggiungi sezioni pagina
    if (pageContent.sections) {
      pageContent.sections.forEach((section, index) => {
        html += `<div class="section-${index}" style="margin: 2rem 0;">`;

        switch (section.type) {
          case 'hero':
            html += `<h2>${section.title || ''}</h2>`;
            html += `<p>${section.subtitle || ''}</p>`;
            if (section.buttonText) {
              html += `<button class="btn">${section.buttonText}</button>`;
            }
            break;

          case 'text':
            html += `<div>${section.content || ''}</div>`;
            break;

          default:
            html += `<p>Sezione ${section.type}</p>`;
        }

        html += `</div>`;
      });
    }

    html += `
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Errore generazione preview:', error);
    res.status(500).send('Errore nella generazione dell\'anteprima');
  }
});

module.exports = router;