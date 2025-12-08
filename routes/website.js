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

// ===============================================================
// API WEBSITE PRINCIPALI
// ===============================================================

/**
 * GET /api/website/list
 * Recupera lista siti web aziendali (con filtri utente)
 */
router.get('/list', async (req, res) => {
  try {
    const { id_ditta, limit = 50, offset = 0, include_stats = true } = req.query;

    let whereClause = '';
    let params = [];

    // Se specificato id_ditta, filtra per azienda
    if (id_ditta) {
      whereClause = 'WHERE sw.id_ditta = ?';
      params.push(id_ditta);
    }

    // Query base
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

    // Aggiungi statistiche se richiesto
    if (include_stats === 'true' && websites.length > 0) {
      const siteIds = websites.map(w => w.id);

      // Conteggio pagine per sito
      const [pagesCount] = await dbPool.execute(`
        SELECT id_sito_web, COUNT(*) as pages_count, SUM(is_published) as published_pages
        FROM pagine_sito_web
        WHERE id_sito_web IN (${siteIds.map(() => '?').join(',')})
        GROUP BY id_sito_web
      `, siteIds);

      // Conteggio gallerie per sito
      const [galleriesCount] = await dbPool.execute(`
        SELECT id_sito_web, COUNT(*) as galleries_count
        FROM wg_galleries
        WHERE id_sito_web IN (${siteIds.map(() => '?').join(',')}) AND is_active = 1
        GROUP BY id_sito_web
      `, siteIds);

      // Conteggio immagini per sito
      const [imagesCount] = await dbPool.execute(`
        SELECT g.id_sito_web, COUNT(gi.id) as images_count
        FROM wg_galleries g
        LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
        WHERE g.id_sito_web IN (${siteIds.map(() => '?').join(',')}) AND g.is_active = 1
        GROUP BY g.id_sito_web
      `, siteIds);

      // Aggiungi statistiche ai risultati
      websites.forEach(website => {
        const siteId = website.id;

        // Parse JSON fields
        website.theme_config = website.theme_config ? JSON.parse(website.theme_config) : {};
        website.catalog_settings = website.catalog_settings ? JSON.parse(website.catalog_settings) : {};

        // Add stats
        const pagesStats = pagesCount.find(p => p.id_sito_web === siteId);
        const galleriesStats = galleriesCount.find(g => g.id_sito_web === siteId);
        const imagesStats = imagesCount.find(i => i.id_sito_web === siteId);

        website.stats = {
          pages_count: pagesStats ? pagesStats.pages_count : 0,
          published_pages: pagesStats ? pagesStats.published_pages : 0,
          galleries_count: galleriesStats ? galleriesStats.galleries_count : 0,
          images_count: imagesStats ? imagesStats.images_count : 0
        };
      });
    } else {
      // Parse JSON fields senza statistiche
      websites.forEach(website => {
        website.theme_config = website.theme_config ? JSON.parse(website.theme_config) : {};
        website.catalog_settings = website.catalog_settings ? JSON.parse(website.catalog_settings) : {};
      });
    }

    // Total count per pagination
    const [countResult] = await dbPool.execute(`
      SELECT COUNT(*) as total
      FROM siti_web_aziendali sw
      ${whereClause}
    `, whereClause ? [id_ditta] : []);

    res.json({
      success: true,
      data: websites,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: (parseInt(offset) + websites.length) < countResult[0].total
      }
    });

  } catch (error) {
    console.error('Errore recupero lista siti web:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero della lista siti web'
    });
  }
});

/**
 * GET /api/website/:id
 * Recupera sito web aziendale completo
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Recupera sito web principale per ID
    const [website] = await dbPool.execute(`
      SELECT
        sw.*,
        d.ragione_sociale,
        d.id_tipo_ditta
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.id = ?
    `, [id]);

    if (website.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sito web non trovato'
      });
    }

    const websiteData = website[0];

    // Recupera pagine del sito
    const [pages] = await dbPool.execute(`
      SELECT
        id,
        titolo,
        slug,
        contenuto_html as contenuto,
        meta_title,
        meta_description,
        is_published,
        menu_order as sort_order,
        created_at,
        updated_at
      FROM pagine_sito_web
      WHERE id_sito_web = ?
      ORDER BY menu_order, titolo
    `, [websiteData.id]);

    // Recupera gallerie del sito
    const [galleries] = await dbPool.execute(`
      SELECT
        g.*,
        COUNT(gi.id) as numero_immagini
      FROM wg_galleries g
      LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
      WHERE g.id_sito_web = ? AND g.is_active = 1
      GROUP BY g.id
      ORDER BY g.sort_order, g.nome_galleria
    `, [websiteData.id]);

    // Recupera conteggio immagini
    const [imageCount] = await dbPool.execute(`
      SELECT COUNT(*) as total_images
      FROM wg_gallery_images gi
      JOIN wg_galleries g ON gi.id_galleria = g.id
      WHERE g.id_sito_web = ? AND g.is_active = 1
    `, [websiteData.id]);

    res.json({
      success: true,
      website: {
        ...websiteData,
        template_config: websiteData.theme_config ? JSON.parse(websiteData.theme_config) : {},
        catalog_settings: websiteData.catalog_settings ? JSON.parse(websiteData.catalog_settings) : {}
      },
      pages: pages,
      galleries: galleries,
      images: [], // Sarà popolato dall'endpoint /images
      settings: {
        catalog_settings: websiteData.catalog_settings ? JSON.parse(websiteData.catalog_settings) : {}
      }
    });

  } catch (error) {
    console.error('Errore recupero sito web:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero del sito web'
    });
  }
});

/**
 * GET /api/website/:id/pages
 * Recupera pagine del sito web (supporta sia id_ditta che id_sito_web)
 */
router.get('/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;

    let siteId;
    let isDittaId = false;

    // Prima prova a vedere se è un id_sito_web diretto
    const [directSite] = await dbPool.execute(
      'SELECT id, id_ditta FROM siti_web_aziendali WHERE id = ?',
      [id]
    );

    if (directSite.length > 0) {
      // È un id_sito_web valido
      siteId = directSite[0].id;
      console.log(`API Pages: Trovato sito diretto con id_sito_web=${siteId}`);
    } else {
      // Prova come id_ditta
      const [website] = await dbPool.execute(
        'SELECT id, id_ditta FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1',
        [id]
      );

      if (website.length > 0) {
        // È un id_ditta valido
        siteId = website[0].id;
        isDittaId = true;
        console.log(`API Pages: Trovato sito tramite id_ditta=${id}, siteId=${siteId}`);
      } else {
        // Nessun sito trovato
        console.log(`API Pages: Nessun sito trovato per id=${id}`);
        return res.json({
          success: true,
          pages: [],
          meta: {
            site_id: null,
            is_ditta_id: false,
            message: 'Nessun sito web trovato'
          }
        });
      }
    }

    // Recupera pagine
    const [pages] = await dbPool.execute(`
      SELECT
        id,
        titolo,
        slug,
        contenuto_html as contenuto,
        meta_title,
        meta_description,
        is_published,
        menu_order as sort_order,
        created_at,
        updated_at
      FROM pagine_sito_web
      WHERE id_sito_web = ?
      ORDER BY menu_order, titolo
    `, [siteId]);

    console.log(`API Pages: Recuperate ${pages.length} pagine per siteId=${siteId}`);

    res.json({
      success: true,
      pages: pages,
      meta: {
        site_id: siteId,
        is_ditta_id: isDittaId,
        pages_count: pages.length
      }
    });

  } catch (error) {
    console.error('Errore recupero pagine:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle pagine'
    });
  }
});

/**
 * GET /api/website/:id/images
 * Recupera immagini del sito web
 */
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;

    // Prima recupera l'ID del sito web dall'ID ditta
    const [website] = await dbPool.execute(
      'SELECT id FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1',
      [id]
    );

    if (website.length === 0) {
      return res.json({ images: [] });
    }

    const siteId = website[0].id;

    // Recupera immagini dalle gallerie
    const [images] = await dbPool.execute(`
      SELECT DISTINCT
        f.id,
        f.file_name_originale,
        f.mime_type,
        f.file_size_bytes,
        f.s3_key,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url,
        gi.caption,
        gi.alt_text,
        g.nome_galleria
      FROM dm_files f
      JOIN wg_gallery_images gi ON f.id = gi.id_file
      JOIN wg_galleries g ON gi.id_galleria = g.id
      WHERE g.id_sito_web = ? AND g.is_active = 1
      ORDER BY g.sort_order, gi.order_pos
    `, [siteId]);

    res.json({
      success: true,
      images: images
    });

  } catch (error) {
    console.error('Errore recupero immagini:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle immagini'
    });
  }
});

/**
 * GET /api/website/:id/catalog-settings
 * Recupera impostazioni catalogo
 */
router.get('/:id/catalog-settings', async (req, res) => {
  try {
    const { id } = req.params;

    const [website] = await dbPool.execute(`
      SELECT catalog_settings
      FROM siti_web_aziendali
      WHERE id_ditta = ?
      LIMIT 1
    `, [id]);

    const settings = website.length > 0 && website[0].catalog_settings
      ? JSON.parse(website[0].catalog_settings)
      : {};

    res.json({
      success: true,
      settings: settings
    });

  } catch (error) {
    console.error('Errore recupero catalog settings:', error);
    res.json({
      success: true,
      settings: {}
    });
  }
});

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
// API GALLERIE FOTOGRAFICHE
// ===============================================================

/**
 * GET /api/website/:siteId/galleries
 * Recupera tutte le gallerie di un sito web
 */
router.get('/:siteId/galleries', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { page_id } = req.query; // Filtra per pagina se specificato

    let whereClause = 'WHERE g.id_sito_web = ? AND g.is_active = 1';
    let params = [siteId];

    if (page_id) {
      whereClause += ' AND g.id_pagina = ?';
      params.push(page_id);
    }

    const query = `
      SELECT
        g.id,
        g.nome_galleria,
        g.slug,
        g.descrizione,
        g.layout,
        g.impostazioni,
        g.meta_title,
        g.meta_description,
        g.sort_order,
        g.created_at,
        g.updated_at,
        COUNT(gi.id) as numero_immagini
      FROM wg_galleries g
      LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
      ${whereClause}
      GROUP BY g.id
      ORDER BY g.sort_order ASC, g.nome_galleria ASC
    `;

    const [galleries] = await dbPool.execute(query, params);

    res.json({
      success: true,
      data: galleries
    });

  } catch (error) {
    console.error('Errore recupero gallerie:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero delle gallerie'
    });
  }
});

/**
 * GET /api/website/:siteId/galleries/:galleryId
 * Recupera dettaglio galleria con immagini
 */
router.get('/:siteId/galleries/:galleryId', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;

    // Recupera info galleria
    const [gallery] = await dbPool.execute(`
      SELECT
        g.*,
        COUNT(gi.id) as numero_immagini
      FROM wg_galleries g
      LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
      WHERE g.id = ? AND g.id_sito_web = ? AND g.is_active = 1
      GROUP BY g.id
    `, [galleryId, siteId]);

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    // Recupera immagini della galleria
    const [images] = await dbPool.execute(`
      SELECT
        gi.*,
        f.file_name_originale,
        f.mime_type,
        f.file_size_bytes,
        f.s3_key,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url
      FROM wg_gallery_images gi
      JOIN dm_files f ON gi.id_file = f.id
      WHERE gi.id_galleria = ?
      ORDER BY gi.order_pos ASC
    `, [galleryId]);

    res.json({
      success: true,
      data: {
        gallery: gallery[0],
        images: images
      }
    });

  } catch (error) {
    console.error('Errore recupero dettaglio galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero del dettaglio galleria'
    });
  }
});

/**
 * POST /api/website/:siteId/galleries
 * Crea nuova galleria
 */
router.post('/:siteId/galleries', async (req, res) => {
  try {
    const { siteId } = req.params;
    const {
      nome_galleria,
      descrizione,
      layout = 'grid-3',
      id_pagina = null,
      impostazioni = {},
      meta_title,
      meta_description
    } = req.body;

    // Validazione input
    if (!nome_galleria || nome_galleria.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Il nome della galleria è obbligatorio'
      });
    }

    // Verifica che il sito esista
    const [site] = await dbPool.execute(
      'SELECT id FROM siti_web_aziendali WHERE id = ?',
      [siteId]
    );

    if (site.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sito web non trovato'
      });
    }

    // Calcola sort_order automatico
    const [maxOrder] = await dbPool.execute(
      'SELECT MAX(sort_order) as max_order FROM wg_galleries WHERE id_sito_web = ?',
      [siteId]
    );

    const sort_order = (maxOrder[0].max_order || 0) + 1;

    // Inserisci galleria
    const [result] = await dbPool.execute(`
      INSERT INTO wg_galleries (
        id_sito_web, id_pagina, nome_galleria, descrizione, layout,
        impostazioni, meta_title, meta_description, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      siteId, id_pagina, nome_galleria.trim(), descrizione,
      layout, JSON.stringify(impostazioni), meta_title, meta_description, sort_order
    ]);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        nome_galleria,
        layout,
        sort_order
      }
    });

  } catch (error) {
    console.error('Errore creazione galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nella creazione della galleria'
    });
  }
});

/**
 * PUT /api/website/:siteId/galleries/:galleryId
 * Aggiorna galleria esistente
 */
router.put('/:siteId/galleries/:galleryId', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;
    const {
      nome_galleria,
      descrizione,
      layout,
      impostazioni,
      meta_title,
      meta_description,
      is_active
    } = req.body;

    // Verifica che la galleria esista e appartenga al sito
    const [gallery] = await dbPool.execute(
      'SELECT id FROM wg_galleries WHERE id = ? AND id_sito_web = ?',
      [galleryId, siteId]
    );

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    // Prepara campi da aggiornare
    const updates = [];
    const params = [];

    if (nome_galleria !== undefined) {
      updates.push('nome_galleria = ?');
      params.push(nome_galleria.trim());
    }
    if (descrizione !== undefined) {
      updates.push('descrizione = ?');
      params.push(descrizione);
    }
    if (layout !== undefined) {
      updates.push('layout = ?');
      params.push(layout);
    }
    if (impostazioni !== undefined) {
      updates.push('impostazioni = ?');
      params.push(JSON.stringify(impostazioni));
    }
    if (meta_title !== undefined) {
      updates.push('meta_title = ?');
      params.push(meta_title);
    }
    if (meta_description !== undefined) {
      updates.push('meta_description = ?');
      params.push(meta_description);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nessun campo da aggiornare'
      });
    }

    params.push(galleryId);

    const [result] = await dbPool.execute(`
      UPDATE wg_galleries
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      data: {
        updated: result.affectedRows > 0
      }
    });

  } catch (error) {
    console.error('Errore aggiornamento galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento della galleria'
    });
  }
});

/**
 * DELETE /api/website/:siteId/galleries/:galleryId
 * Elimina galleria (soft delete)
 */
router.delete('/:siteId/galleries/:galleryId', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;

    // Soft delete: imposta is_active = false
    const [result] = await dbPool.execute(`
      UPDATE wg_galleries
      SET is_active = false, updated_at = NOW()
      WHERE id = ? AND id_sito_web = ?
    `, [galleryId, siteId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    res.json({
      success: true,
      data: {
        deleted: true
      }
    });

  } catch (error) {
    console.error('Errore eliminazione galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione della galleria'
    });
  }
});

/**
 * POST /api/website/:siteId/galleries/:galleryId/images
 * Aggiunge immagini a una galleria
 */
router.post('/:siteId/galleries/:galleryId/images', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;
    const { images } = req.body; // Array di { id_file, caption, alt_text, order_pos }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array di immagini richiesto'
      });
    }

    // Verifica che la galleria esista
    const [gallery] = await dbPool.execute(
      'SELECT id FROM wg_galleries WHERE id = ? AND id_sito_web = ?',
      [galleryId, siteId]
    );

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    // Inserisci immagini
    const insertPromises = images.map((img, index) => {
      return dbPool.execute(`
        INSERT INTO wg_gallery_images (
          id_galleria, id_file, caption, alt_text, title_text, order_pos
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        galleryId,
        img.id_file,
        img.caption || null,
        img.alt_text || null,
        img.title_text || null,
        img.order_pos || index
      ]);
    });

    await Promise.all(insertPromises);

    res.json({
      success: true,
      data: {
        added_images: images.length
      }
    });

  } catch (error) {
    console.error('Errore aggiunta immagini galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiunta delle immagini alla galleria'
    });
  }
});

/**
 * PUT /api/website/:siteId/galleries/:galleryId/images/order
 * Aggiorna ordinamento immagini nella galleria
 */
router.put('/:siteId/galleries/:galleryId/images/order', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;
    const { images_order } = req.body; // Array di { id, order_pos }

    if (!images_order || !Array.isArray(images_order)) {
      return res.status(400).json({
        success: false,
        error: 'Array di ordinamento richiesto'
      });
    }

    // Aggiorna ordinamento
    const updatePromises = images_order.map(item => {
      return dbPool.execute(`
        UPDATE wg_gallery_images
        SET order_pos = ?, updated_at = NOW()
        WHERE id = ? AND id_galleria = ?
      `, [item.order_pos, item.id, galleryId]);
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      data: {
        updated_images: images_order.length
      }
    });

  } catch (error) {
    console.error('Errore aggiornamento ordinamento immagini:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'aggiornamento dell\'ordinamento'
    });
  }
});

/**
 * DELETE /api/website/:siteId/galleries/:galleryId/images/:imageId
 * Rimuove immagine dalla galleria
 */
router.delete('/:siteId/galleries/:galleryId/images/:imageId', async (req, res) => {
  try {
    const { siteId, galleryId, imageId } = req.params;

    // Verifica che l'immagine appartenga alla galleria del sito
    const [image] = await dbPool.execute(`
      SELECT gi.id
      FROM wg_gallery_images gi
      JOIN wg_galleries g ON gi.id_galleria = g.id
      WHERE gi.id = ? AND gi.id_galleria = ? AND g.id_sito_web = ?
    `, [imageId, galleryId, siteId]);

    if (image.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Immagine non trovata nella galleria'
      });
    }

    // Elimina immagine
    await dbPool.execute('DELETE FROM wg_gallery_images WHERE id = ?', [imageId]);

    res.json({
      success: true,
      data: {
        deleted: true
      }
    });

  } catch (error) {
    console.error('Errore eliminazione immagine galleria:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nell\'eliminazione dell\'immagine'
    });
  }
});

// ===============================================================
// API PUBLICHE GALLERIE
// ===============================================================

/**
 * GET /api/public/website/:siteId/galleries/:galleryId
 * Recupera galleria pubblica per visualizzazione sito
 */
router.get('/public/website/:siteId/galleries/:galleryId', async (req, res) => {
  try {
    const { siteId, galleryId } = req.params;

    // Verifica che il sito sia attivo
    const [site] = await dbPool.execute(
      'SELECT id, subdomain, domain_status FROM siti_web_aziendali WHERE id = ? AND domain_status = "active"',
      [siteId]
    );

    if (site.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sito non trovato o non attivo'
      });
    }

    // Recupera galleria attiva
    const [gallery] = await dbPool.execute(`
      SELECT
        g.*,
        COUNT(gi.id) as numero_immagini
      FROM wg_galleries g
      LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
      WHERE g.id = ? AND g.id_sito_web = ? AND g.is_active = 1
      GROUP BY g.id
    `, [galleryId, siteId]);

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    // Recupera immagini pubbliche
    const [images] = await dbPool.execute(`
      SELECT
        gi.id,
        gi.caption,
        gi.alt_text,
        gi.title_text,
        gi.order_pos,
        f.file_name_originale,
        f.mime_type,
        f.file_size_bytes,
        f.s3_key,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url
      FROM wg_gallery_images gi
      JOIN dm_files f ON gi.id_file = f.id
      WHERE gi.id_galleria = ?
      ORDER BY gi.order_pos ASC, gi.created_at ASC
    `, [galleryId]);

    res.json({
      success: true,
      data: {
        gallery: gallery[0],
        images: images.map(img => ({
          ...img,
          url_file: img.url_file || img.preview_url,
          previewUrl: img.preview_url || img.url_file
        }))
      }
    });

  } catch (error) {
    console.error('Errore recupero galleria pubblica:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero della galleria'
    });
  }
});

/**
 * GET /api/public/website/:siteId/galleries/slug/:slug
 * Recupera galleria pubblica tramite slug
 */
router.get('/public/website/:siteId/galleries/slug/:slug', async (req, res) => {
  try {
    const { siteId, slug } = req.params;

    // Verifica che il sito sia attivo
    const [site] = await dbPool.execute(
      'SELECT id, subdomain, domain_status FROM siti_web_aziendali WHERE id = ? AND domain_status = "active"',
      [siteId]
    );

    if (site.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sito non trovato o non attivo'
      });
    }

    // Recupera galleria per slug
    const [gallery] = await dbPool.execute(`
      SELECT
        g.*,
        COUNT(gi.id) as numero_immagini
      FROM wg_galleries g
      LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
      WHERE g.slug = ? AND g.id_sito_web = ? AND g.is_active = 1
      GROUP BY g.id
    `, [slug, siteId]);

    if (gallery.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Galleria non trovata'
      });
    }

    // Recupera immagini per la galleria trovata
    const [images] = await dbPool.execute(`
      SELECT
        gi.id,
        gi.caption,
        gi.alt_text,
        gi.title_text,
        gi.order_pos,
        f.file_name_originale,
        f.mime_type,
        f.file_size_bytes,
        f.s3_key,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file,
        CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url
      FROM wg_gallery_images gi
      JOIN dm_files f ON gi.id_file = f.id
      WHERE gi.id_galleria = ?
      ORDER BY gi.order_pos ASC, gi.created_at ASC
    `, [gallery[0].id]);

    res.json({
      success: true,
      data: {
        gallery: gallery[0],
        images: images.map(img => ({
          ...img,
          url_file: img.url_file || img.preview_url,
          previewUrl: img.preview_url || img.url_file
        }))
      }
    });

  } catch (error) {
    console.error('Errore recupero galleria pubblica per slug:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero della galleria'
    });
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
          theme_config,
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
    console.log(`[DEBUG] Aggiornamento sito ${websiteId}, section: ${section}`);
    console.log('[DEBUG] Dati ricevuti:', data);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante
    /*
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
    */

    // Verifica che il sito esista
    const [siteCheck] = await dbPool.execute(`
      SELECT id FROM siti_web_aziendali WHERE id = ?
    `, [websiteId]);

    if (siteCheck.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    // Aggiorna base section
    let updateField = '';
    let updateValue = null;

    switch (section) {
      case 'basic':
        updateField = `
          site_title = ?,
          site_description = ?,
          template_id = ?,
          domain_status = ?,
          logo_url = ?,
          favicon_url = ?
        `;
        updateValue = [
          data.site_title,
          data.site_description,
          data.template_id,
          data.domain_status,
          data.logo_url,
          data.favicon_url
        ];
        break;

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
        updateField = 'theme_config = ?';
        updateValue = [JSON.stringify(data)];
        break;

      case 'catalog_settings':
        updateField = `
          enable_catalog = ?,
          catalog_settings = ?
        `;
        updateValue = [
          data.enable_catalog ? 1 : 0,
          JSON.stringify(data.catalog_settings || {})
        ];
        break;

      case 'social':
        updateField = `
          google_analytics_id = ?,
          facebook_url = ?,
          instagram_url = ?,
          linkedin_url = ?
        `;
        updateValue = [
          data.google_analytics_id,
          data.facebook_url,
          data.instagram_url,
          data.linkedin_url
        ];
        break;

      default:
        return res.status(400).json({ error: `Sezione non valida: ${section}` });
    }

    await dbPool.execute(`
      UPDATE siti_web_aziendali
      SET ${updateField}, updated_at = NOW()
      WHERE id = ?
    `, [...updateValue, websiteId]);

    console.log(`[DEBUG] Sito ${websiteId} aggiornato con successo`);

    res.json({
      success: true,
      message: 'Configurazione aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore aggiornamento sito web:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del sito web: ' + error.message });
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
 * GET /api/website/:websiteId/pages/:pageId
 * Recupera singola pagina
 */
router.get('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;

  try {
    console.log(`[DEBUG] Recupero pagina ${pageId} del sito ${websiteId}`);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante

    const [page] = await dbPool.execute(`
      SELECT *
      FROM pagine_sito_web
      WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    console.log(`[DEBUG] Pagina trovata: ${page[0].titolo}`);

    res.json({
      success: true,
      page: page[0]
    });

  } catch (error) {
    console.error('Errore recupero pagina:', error);
    res.status(500).json({ error: 'Errore nel recupero della pagina' });
  }
});

/**
 * GET /api/website/:websiteId/pages
 * Recupera pagine del sito web
 */
router.get('/:websiteId/pages', async (req, res) => {
  const { websiteId } = req.params;

  try {
    console.log(`[DEBUG] Recupero pagine per sito ID: ${websiteId}`);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante
    /*
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
    */

    const [pages] = await dbPool.execute(`
      SELECT id, slug, titolo, meta_title, meta_description, is_published, menu_order, created_at, updated_at
      FROM pagine_sito_web
      WHERE id_sito_web = ?
      ORDER BY menu_order ASC, created_at ASC
    `, [websiteId]);

    console.log(`[DEBUG] Trovate ${pages.length} pagine per sito ${websiteId}`);

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
  const { slug, titolo, contenuto_html, contenuto_json, meta_title, meta_description, is_published, menu_order } = req.body;

  try {
    console.log(`[DEBUG] Creazione pagina per sito ${websiteId}:`, req.body);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante
    /*
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
    */

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
    const normalizedContenutoHtml = contenuto_html !== undefined ? contenuto_html : '';
    const normalizedMetaTitle = meta_title !== undefined ? meta_title : null;
    const normalizedMetaDescription = meta_description !== undefined ? meta_description : null;
    const normalizedIsPublished = is_published !== undefined ? (is_published ? 1 : 0) : 0;
    const normalizedMenuOrder = menu_order !== undefined ? menu_order : 0;

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
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      websiteId,
      normalizedSlug,
      normalizedTitolo,
      normalizedContenutoHtml,
      contenuto_json || null,
      normalizedMetaTitle,
      normalizedMetaDescription,
      normalizedIsPublished,
      normalizedMenuOrder
    ]);

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
 * Aggiorna pagina
 */
router.put('/:websiteId/pages/:pageId', async (req, res) => {
  const { websiteId, pageId } = req.params;
  const { titolo, contenuto_json, meta_title, meta_description, is_published } = req.body;

  try {
    console.log('🔥 [DEBUG] PUT page - websiteId:', websiteId, 'pageId:', pageId);
    console.log('🔥 [DEBUG] PUT page - req.body keys:', Object.keys(req.body));
    console.log('🔥 [DEBUG] PUT page - titolo:', titolo);
    console.log('🔥 [DEBUG] PUT page - contenuto_json type:', typeof contenuto_json);
    console.log('🔥 [DEBUG] PUT page - contenuto_json length:', contenuto_json?.length);
    console.log('🔥 [DEBUG] PUT page - is_published:', is_published);

    // Verifica accesso alla pagina
    const [page] = await dbPool.execute(`
      SELECT ps.id, ps.id_sito_web, sw.id_ditta
      FROM pagine_sito_web ps
      JOIN siti_web_aziendali sw ON ps.id_sito_web = sw.id
      WHERE ps.id = ? AND ps.id_sito_web = ?
    `, [pageId, websiteId]);

    console.log('🔥 [DEBUG] PUT page - page found:', page.length);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    console.log('🔥 [DEBUG] PUT page - page id_ditta:', page[0].id_ditta);
    console.log('🔥 [DEBUG] PUT page - req.user id_ditta:', req.user?.id_ditta);

    // TODO: Riattivare il controllo di autorizzazione quando l'autenticazione è funzionante
    // if (page[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
    //   return res.status(403).json({ error: 'Non autorizzato per questa pagina' });
    // }

    // Converti undefined in null per MySQL
    const normalizedTitolo = titolo !== undefined ? titolo : null;
    // Assicura che contenuto_json sia una stringa JSON valida
    let normalizedContenutoJson = null;
    if (contenuto_json !== undefined && contenuto_json !== null) {
      if (typeof contenuto_json === 'string') {
        normalizedContenutoJson = contenuto_json;
      } else {
        normalizedContenutoJson = JSON.stringify(contenuto_json);
      }
    }
    const normalizedMetaTitle = meta_title !== undefined ? meta_title : null;
    const normalizedMetaDescription = meta_description !== undefined ? meta_description : null;
    const normalizedIsPublished = is_published !== undefined ? (is_published ? 1 : 0) : null;

    console.log('🔥 [DEBUG] PUT page - normalized parameters:', {
      normalizedTitolo,
      normalizedContenutoJson: normalizedContenutoJson?.substring(0, 100) + '...',
      normalizedMetaTitle,
      normalizedMetaDescription,
      normalizedIsPublished
    });

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
      normalizedTitolo,
      normalizedContenutoJson, // Rimuoviamo il JSON.stringify perché è già una stringa dal frontend
      normalizedMetaTitle,
      normalizedMetaDescription,
      normalizedIsPublished,
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
    console.log(`[DEBUG] Eliminazione pagina ${pageId} del sito ${websiteId}`);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante
    /*
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
    */

    // Verifica che la pagina esista
    const [pageCheck] = await dbPool.execute(`
      SELECT id FROM pagine_sito_web WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    const [result] = await dbPool.execute(`
      DELETE FROM pagine_sito_web WHERE id = ?
    `, [pageId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    console.log(`[DEBUG] Pagina ${pageId} eliminata con successo`);

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
router.post('/:websiteId/pages/:pageId/publish', async (req, res) => {
  const { websiteId, pageId } = req.params;

  try {
    console.log(`[DEBUG] Toggle pubblicazione pagina ${pageId} del sito ${websiteId}`);

    // Per debug: rimuoviamo temporaneamente i controlli di autenticazione
    // TODO: Riattivare quando l'autenticazione è funzionante
    /*
    // Verifica accesso alla pagina
    const [page] = await dbPool.execute(`
      SELECT ps.id, ps.id_sito_web, sw.id_ditta, ps.is_published
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
    */

    // Recupera stato attuale pagina
    const [pageCheck] = await dbPool.execute(`
      SELECT id, is_published FROM pagine_sito_web WHERE id = ? AND id_sito_web = ?
    `, [pageId, websiteId]);

    if (pageCheck.length === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    const newStatus = !pageCheck[0].is_published;

    // Aggiorna stato pubblicazione
    const [result] = await dbPool.execute(`
      UPDATE pagine_sito_web
      SET is_published = ?, updated_at = NOW()
      WHERE id = ?
    `, [newStatus, pageId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pagina non trovata' });
    }

    console.log(`[DEBUG] Pagina ${pageId} pubblicazione cambiata a: ${newStatus}`);

    res.json({
      success: true,
      message: `Pagina ${newStatus ? 'pubblicata' : 'depubblicata'} con successo`,
      is_published: newStatus
    });

  } catch (error) {
    console.error('Errore toggle pubblicazione pagina:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento dello stato: ' + error.message });
  }
});

// ===============================================================
// API IMAGINI SITI WEB
// ===============================================================

// Importazioni necessarie per S3 (usa la configurazione esistente)
const {
  s3Client,
  PutObjectCommand,
  S3_BUCKET_NAME
} = require('../utils/s3Client');

// Importa knex dalla configurazione centralizzata
const { knex } = require('../config/db');

// URL della CDN configurata su Cloudflare
const CDN_BASE_URL = 'https://cdn.operocloud.it';

/**
 * POST /api/website/:websiteId/upload
 * Carica immagine per il sito web (basato su archivio.js funzionante)
 */
router.post('/:websiteId/upload', upload.single('file'), async (req, res) => {
  // Temporaneamente bypassa autenticazione per debug
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Autenticazione richiesta' });
  // }
  const { websiteId } = req.params;
  const { refId = websiteId, refType = 'WEBSITE_IMAGES', privacy = 'public' } = req.body;

  try {
    console.log(`📤 [UPLOAD] Inizio upload per sito ${websiteId}`);
    console.log('📤 [UPLOAD] File info:', req.file?.originalname, req.file?.size, req.file?.mimetype);

    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    const dittaId = site[0].id_ditta;
    const file = req.file;

    // Per debug: gestisce sia autenticato che non
    const idUtenteUpload = req.user?.id || 1; // Fallback a 1 per debug

    console.log(`🔍 [UPLOAD] dittaId: ${dittaId}, idUtenteUpload: ${idUtenteUpload}, privacy: ${privacy}`);

    const trx = await knex.transaction();
    try {
      console.log('🔍 [UPLOAD] Inizio transazione database');

      // 1. Crea un record per il file nella tabella dm_files (corretto con 'id' auto-increment)
      const insertData = {
        file_name_originale: file.originalname,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        id_ditta: dittaId,
        id_utente_upload: idUtenteUpload,
        privacy: privacy,
        s3_key: `s3-key-will-be-generated` // Placeholder
      };

      console.log('🔍 [UPLOAD] Dati inserimento dm_files:', insertData);

      const insertResult = await trx('dm_files').insert(insertData);

      // In MySQL, l'ID inserito è in insertResult[0]
      const fileRecordId = insertResult[0];

      // 2. Crea la chiave S3 seguendo la convenzione di archivio.js
      // Formato: ditta-{idDitta};{entitaId};{entitaTipo};{fileRecordId}-{file.originalname}
      const s3Key = `ditta-${dittaId};${refId};${refType};${fileRecordId}-${file.originalname}`;

      // 3. Prepara i parametri per l'upload su S3
      const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: privacy === 'public' ? 'public-read' : 'private'
      };

      // 4. Esegui l'upload su S3
      console.log(`📤 [UPLOAD] Uploading su S3: ${s3Key}`);
      await s3Client.send(new PutObjectCommand(uploadParams));

      // 5. Aggiorna il record nel DB con la chiave S3 corretta
      await trx('dm_files')
        .where('id', fileRecordId)
        .update({ s3_key: s3Key });

      // 6. Crea il link polimorfico nella tabella dm_allegati_link
      await trx('dm_allegati_link').insert({
        id_ditta: dittaId,
        id_file: fileRecordId,
        entita_tipo: refType,
        entita_id: refId
      });

      // 7. Conferma la transazione
      await trx.commit();

      console.log(`✅ [UPLOAD] File salvato nel database con ID: ${fileRecordId}`);

      // 8. Prepara response formattato come frontend si aspetta
      const response = {
        success: true,
        file: {
          id_file: fileRecordId,
          file_name_originale: file.originalname,
          previewUrl: `${CDN_BASE_URL}/${s3Key}`,
          url: `${CDN_BASE_URL}/${s3Key}`,
          tipo_file: file.mimetype,
          dimensione_file: file.size,
          mime_type: file.mimetype,
          file_size_bytes: file.size,
          s3_key: s3Key,
          privacy: privacy,
          created_at: new Date().toISOString()
        }
      };

      console.log(`✅ [UPLOAD] Upload completato per ${file.originalname}`);
      res.json(response);

    } catch (dbError) {
      await trx.rollback();
      console.error('❌ [UPLOAD] Errore database/S3:', dbError);
      res.status(500).json({
        error: 'Errore salvataggio file nel database o S3',
        details: dbError.message
      });
    }

  } catch (error) {
    console.error('❌ [UPLOAD] Errore generale upload:', error);
    console.error('❌ [UPLOAD] Stack trace:', error.stack);

    // Dettagli specifici per debug
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ [UPLOAD] Connessione database rifiutata');
      res.status(500).json({
        error: 'Errore connessione database',
        details: 'Impossibile connettersi al database'
      });
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ [UPLOAD] Host S3 non trovato - controlla AWS credentials');
      res.status(500).json({
        error: 'Errore configurazione S3',
        details: 'Host S3 non raggiungibile'
      });
    } else {
      res.status(500).json({
        error: 'Errore durante il caricamento del file',
        details: error.message,
        code: error.code
      });
    }
  }
});

/**
 * GET /api/website/:websiteId/images
 * Recupera immagini del sito web (da dm_files)
 */
router.get('/:websiteId/images', async (req, res) => {
  const { websiteId } = req.params;

  try {
    // Log con timestamp per identificare richieste multiple
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 [IMAGES] Recupero immagini per sito ${websiteId}`);

    // Verifica accesso al sito
    const [site] = await dbPool.execute(`
      SELECT sw.id_ditta
      FROM siti_web_aziendali sw
      WHERE sw.id = ?
    `, [websiteId]);

    if (site.length === 0) {
      console.log('❌ [IMAGES] Sito non trovato');
      return res.status(404).json({ error: 'Sito web non trovato' });
    }

    // Temporaneamente bypassa autenticazione per debug
    // if (site[0].id_ditta !== req.user.id_ditta && req.user.livello < 90) {
    //   return res.status(403).json({ error: 'Non autorizzato per questo sito' });
    // }

    const dittaId = site[0].id_ditta;
    console.log(`🔍 [IMAGES] Ditta ID: ${dittaId}`);

    // Recupera immagini da dm_files con collegamento WEBSITE_IMAGES
    const [images] = await dbPool.execute(`
      SELECT
        df.id as id_file,
        df.file_name_originale,
        df.file_size_bytes as dimensione_file,
        df.mime_type as tipo_file,
        df.s3_key,
        df.created_at,
        COALESCE(dal.entita_tipo, 'website') as category
      FROM dm_files df
      LEFT JOIN dm_allegati_link dal ON df.id = dal.id_file
      WHERE df.id_ditta = ?
        AND (dal.entita_tipo = 'WEBSITE_IMAGES' OR dal.entita_tipo = 'website' OR dal.entita_tipo IS NULL)
      AND df.mime_type LIKE 'image/%'
      ORDER BY df.created_at DESC
    `, [dittaId]);

    console.log(`🔍 [IMAGES] Trovate ${images.length} immagini nel database`);

    // Formatta URL per le immagini (usa CDN_BASE_URL)
    const formattedImages = images.map(img => ({
      id_file: img.id_file,
      file_name_originale: img.file_name_originale,
      previewUrl: img.s3_key ? `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${img.s3_key}` : null,
      url: img.s3_key ? `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${img.s3_key}` : null,
      tipo_file: img.tipo_file,
      dimensione_file: img.dimensione_file,
      category: img.category,
      created_at: img.created_at
    }));

    console.log(`🔍 [IMAGES] Formattate ${formattedImages.length} immagini per il frontend`);
    console.log('🔍 [IMAGES] Ditta ID usato nella query:', dittaId);
    console.log('🔍 [IMAGES] Images grezze dal database:', images);

    console.log('🔍 [IMAGES] JSON response prima di inviare:', {
      success: true,
      images: formattedImages
    });

    res.json({
      success: true,
      images: formattedImages
    });

  } catch (error) {
    console.error('❌ [IMAGES] Errore recupero immagini:', error);
    console.error('❌ [IMAGES] Stack trace:', error.stack);
    res.status(500).json({
      error: 'Errore nel recupero delle immagini',
      details: error.message
    });
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
    const templateConfig = JSON.parse(websiteData.theme_config || '{}');

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

    // Controlla se la richiesta accetta JSON (da API service) o HTML (diretto)
    const acceptHeader = req.get('Accept') || '';

    if (acceptHeader.includes('application/json')) {
      // Risposta JSON per API service
      res.json({
        success: true,
        html: html
      });
    } else {
      // Risposta HTML diretta
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }

  } catch (error) {
    console.error('Errore generazione preview:', error);
    res.status(500).send('Errore nella generazione dell\'anteprima');
  }
});

module.exports = router;