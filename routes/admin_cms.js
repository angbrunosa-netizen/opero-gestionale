/**
 * Nome File: admin_cms.js
 * Percorso: routes/admin_cms.js
 * Data: 15/12/2025
 * Versione: 1.0.0
 * Descrizione: API per la gestione dei contenuti dei siti (CMS).
 * Riservato agli utenti amministratori (richiede token).
 */

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken, checkPermission } = require('../utils/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');


// Middleware di base: verifica auth per tutte le rotte
router.use(verifyToken);

// ----------------------------------------------------------------------
// 0. SUPERVISIONE (Solo per Admin di Sistema)
// ----------------------------------------------------------------------

// GET Elenco Ditte Candidabili (Tipo 1) per associazione sito
router.get('/companies', async (req, res) => {
    try {
        // Recupera tutte le ditte di tipo 1 (Proprietarie)
        // Mostra anche se hanno già un sito attivo (url_slug)
        const [companies] = await dbPool.query(
            `SELECT id, ragione_sociale, url_slug, shop_attivo, logo_url
             FROM ditte 
             WHERE id_tipo_ditta = 1 
             ORDER BY ragione_sociale ASC`
        );
        res.json(companies);
    } catch (e) {
        console.error("Errore GET companies:", e);
        res.status(500).json({ error: e.message });
    }
});
// ----------------------------------------------------------------------
// 1. CONFIGURAZIONE SITO (Ditte)
// ----------------------------------------------------------------------

// GET Configurazione Sito Ditta
router.get('/config/:idDitta', async (req, res) => {
    try {
        const [rows] = await dbPool.query(
            `SELECT url_slug, id_web_template, shop_colore_primario, shop_colore_secondario, shop_attivo, shop_template, shop_colore_sfondo_blocchi,
                    shop_colore_header_sfondo, shop_colore_header_testo, shop_logo_posizione
             FROM ditte WHERE id = ?`,
            [req.params.idDitta]
        );
        
        // Normalizzazione dati per il frontend
        const data = rows[0] || {};
        // Se non c'è un template nel DB, usiamo 'standard' come fallback per la UI
        if (!data.shop_template && data.id_web_template) {
             // Recuperiamo il codice se abbiamo solo l'ID (opzionale, dipende da come salviamo)
             const [tpl] = await dbPool.query('SELECT codice FROM web_templates WHERE id = ?', [data.id_web_template]);
             if (tpl.length > 0) data.shop_template = tpl[0].codice;
        }
        if (!data.shop_template) data.shop_template = 'standard';

        res.json(data);
    } catch (e) {
        console.error("Errore GET config:", e);
        res.status(500).json({ error: e.message });
    }
});

// SAVE Configurazione Sito
router.post('/config/:idDitta', async (req, res) => {
    try {
        const {
            url_slug,
            shop_template,
            shop_colore_primario,
            shop_colore_secondario,
            shop_colore_sfondo_blocchi,
            // Header personalization
            shop_colore_header_sfondo,
            shop_colore_header_testo,
            shop_logo_posizione,
            shop_attivo
        } = req.body;
        const idDitta = req.params.idDitta;
        
        // Verifica unicità slug se cambiato e non vuoto
        if (url_slug) {
            const [existing] = await dbPool.query(
                'SELECT id FROM ditte WHERE url_slug = ? AND id != ?', 
                [url_slug, idDitta]
            );
            if (existing.length > 0) return res.status(400).json({ message: 'URL già in uso da un\'altra ditta' });
        }

        // Recupera ID template dal codice (se la tabella web_templates è popolata)
        // Se non usi la tabella web_templates rigorosamente, puoi salvare direttamente la stringa in un campo note o JSON, 
        // ma qui assumiamo la struttura corretta relazionale.
        let id_web_template = null;
        if (shop_template) {
            // Cerchiamo l'ID del template o lo creiamo al volo se manca (per semplicità in sviluppo)
            const [tpl] = await dbPool.query('SELECT id FROM web_templates WHERE codice = ?', [shop_template]);
            if (tpl.length > 0) {
                id_web_template = tpl[0].id;
            } else {
                // Fallback: se il template non esiste nel DB, lo inseriamo come 'standard' o simile
                // Oppure gestisci l'errore. Per ora lasciamo null.
            }
        }

        // Se la colonna shop_template esiste fisicamente nella tabella ditte (come stringa diretta per velocità):
        // Altrimenti usa solo id_web_template. Qui assumo tu abbia aggiunto il campo stringa per semplicità o usi la relazione.
        // Adatterò la query alla migrazione base che usa la relazione id_web_template.
        
        await dbPool.query(
            `UPDATE ditte SET
                url_slug = ?,
                id_web_template = ?,
                shop_colore_primario = ?,
                shop_colore_secondario = ?,
                shop_colore_sfondo_blocchi = ?,
                shop_colore_header_sfondo = ?,
                shop_colore_header_testo = ?,
                shop_logo_posizione = ?,
                shop_attivo = ?
             WHERE id = ?`,
            [
                url_slug,
                id_web_template,
                shop_colore_primario,
                shop_colore_secondario,
                shop_colore_sfondo_blocchi,
                shop_colore_header_sfondo,
                shop_colore_header_testo,
                shop_logo_posizione,
                shop_attivo ? 1 : 0,
                idDitta
            ]
        );
        
        res.json({ success: true });
    } catch (e) {
        console.error("Errore POST config:", e);
        res.status(500).json({ error: e.message });
    }
});

// ----------------------------------------------------------------------
// 2. GESTIONE PAGINE
// ----------------------------------------------------------------------

// GET Elenco Pagine
router.get('/pages/:idDitta', async (req, res) => {
    try {
        const [pages] = await dbPool.query(
            'SELECT * FROM web_pages WHERE id_ditta = ? ORDER BY slug ASC',
            [req.params.idDitta]
        );
        res.json(pages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// CRUD Pagina (Create/Update)
router.post('/pages', async (req, res) => {
    try {
        const { id, id_ditta, slug, titolo, pubblicata } = req.body;
        
        if (id) {
            await dbPool.query(
                'UPDATE web_pages SET slug=?, titolo_seo=?, pubblicata=? WHERE id=?',
                [slug, titolo, pubblicata, id]
            );
        } else {
            // Verifica duplicati slug
            const [dup] = await dbPool.query('SELECT id FROM web_pages WHERE id_ditta=? AND slug=?', [id_ditta, slug]);
            if (dup.length > 0) return res.status(400).json({ message: 'Pagina già esistente' });

            await dbPool.query(
                'INSERT INTO web_pages (id_ditta, slug, titolo_seo, pubblicata) VALUES (?, ?, ?, ?)',
                [id_ditta, slug, titolo, pubblicata]
            );
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE Pagina
router.delete('/pages/:idPage', async (req, res) => {
    try {
        await dbPool.query('DELETE FROM web_pages WHERE id = ?', [req.params.idPage]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ----------------------------------------------------------------------
// 3. GESTIONE COMPONENTI (Page Builder)
// ----------------------------------------------------------------------

// GET Componenti Pagina
router.get('/page/:idPage/components', async (req, res) => {
    try {
        const [components] = await dbPool.query(
            'SELECT * FROM web_page_components WHERE id_page = ? ORDER BY ordine ASC',
            [req.params.idPage]
        );
        res.json(components);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SAVE Componenti (Sostituzione completa per gestire l'ordinamento)
router.post('/page/:idPage/components', async (req, res) => {
    const conn = await dbPool.getConnection();
    try {
        await conn.beginTransaction();
        const { idPage } = req.params;
        const { components } = req.body; // Array ordinato di oggetti componente

        // 1. Rimuovi tutti i componenti esistenti per questa pagina
        await conn.query('DELETE FROM web_page_components WHERE id_page = ?', [idPage]);

        // 2. Inserisci i nuovi componenti nell'ordine ricevuto
        if (components && components.length > 0) {
            const values = components.map((c, index) => [
                idPage, 
                c.tipo_componente, 
                index, // L'indice nell'array diventa l'ordine
                JSON.stringify(c.dati_config || {})
            ]);
            
            await conn.query(
                'INSERT INTO web_page_components (id_page, tipo_componente, ordine, dati_config) VALUES ?',
                [values]
            );
        }

        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        await conn.rollback();
        console.error("Errore salvataggio componenti:", e);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
});

// ... (codice esistente)

// ----------------------------------------------------------------------
// 4. GESTIONE MEDIA (Galleria dall'Archivio)
// ----------------------------------------------------------------------

// GET Immagini dall'Archivio Ditta
// Recupera tutti i file con mime_type 'image/%' dalla tabella dm_files
router.get('/media/:idDitta', async (req, res) => {
    try {
        const [images] = await dbPool.query(
            `SELECT id, file_name_originale, s3_key, mime_type, created_at 
             FROM dm_files 
             WHERE id_ditta = ? 
             AND mime_type LIKE 'image/%'
             ORDER BY created_at DESC`,
            [req.params.idDitta]
        );
        
        // Costruiamo l'URL pubblico (CDN) per ogni immagine
        // Assumiamo che la struttura CDN sia standard
        const imagesWithUrl = images.map(img => ({
            ...img,
            publicUrl: `https://cdn.operocloud.it/operogo/${img.s3_key}`
        }));

        res.json(imagesWithUrl);
    } catch (e) {
        console.error("Errore recupero media:", e);
        res.status(500).json({ error: e.message });
    }
});

// POST Upload Immagine al Volo (Proxy verso il sistema documenti)
// Questo endpoint serve per caricare un'immagine direttamente dal CMS
// e salvarla in dm_files come se fosse un allegato generico del sito.
const multer = require('multer');

// Assicurati che la cartella temp esista
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const upload = multer({ dest: tempDir }); // Cartella temp

router.post('/media/upload/:idDitta', upload.single('file'), async (req, res) => {
    const { idDitta } = req.params;
    const { s3Upload } = require('../utils/s3Client');

    console.log('[UPLOAD] Ricevuta richiesta upload per ditta:', idDitta);
    console.log('[UPLOAD] File:', req.file);
    console.log('[UPLOAD] User:', req.user);

    try {
        if (!req.file) {
            console.error('[UPLOAD] Nessun file ricevuto');
            throw new Error("Nessun file caricato");
        }

        if (!req.user || !req.user.id) {
            console.error('[UPLOAD] Utente non autenticato');
            throw new Error("Utente non autenticato");
        }

        // 1. Upload su S3
        // Usiamo una struttura chiave dedicata al sito: ditta-{id}/website/{filename}
        const s3Key = `ditta-${idDitta}/website/${Date.now()}-${req.file.originalname}`;
        console.log('[UPLOAD] S3 Key:', s3Key);

        // Leggi il file come Buffer (non usare stream per evitare problemi SHA256)
        const fileContent = fs.readFileSync(req.file.path);
        await s3Upload(s3Key, fileContent, req.file.mimetype);
        console.log('[UPLOAD] Upload S3 completato');

        // 2. Salva record in dm_files
        const [result] = await dbPool.query(
            `INSERT INTO dm_files
            (id_ditta, id_utente_upload, file_name_originale, file_size_bytes, mime_type, privacy, s3_key)
            VALUES (?, ?, ?, ?, ?, 'public', ?)`,
            [idDitta, req.user.id, req.file.originalname, req.file.size, req.file.mimetype, s3Key]
        );
        console.log('[UPLOAD] Record salvato nel DB, ID:', result.insertId);

        // 3. (Opzionale) Collega a dm_allegati_link con entita 'website'
        await dbPool.query(
            `INSERT INTO dm_allegati_link (id_ditta, id_file, entita_tipo, entita_id) VALUES (?, ?, 'website', ?)`,
            [idDitta, result.insertId, idDitta]
        );

        // Pulizia
        fs.unlink(req.file.path, () => {});

        const response = {
            success: true,
            url: `https://cdn.operocloud.it/operogo/${s3Key}`,
            id: result.insertId
        };
        console.log('[UPLOAD] Invio risposta:', response);
        res.json(response);

    } catch (e) {
        console.error("[UPLOAD] Errore upload media:", e);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: e.message });
    }
});
// ... (tutto il codice precedente di login/registrazione resta uguale)

// =============================================================================
// SEZIONE 2: MOTORE CMS (Recupero contenuti sito)
// =============================================================================

// Middleware Helper: Trova la ditta dallo slug (sottodominio)
const resolveTenant = async (req, res, next) => {
    const { slug } = req.params;
    try {
        const [rows] = await dbPool.query(
            `SELECT d.id, d.ragione_sociale, d.logo_url, d.shop_colore_primario,
                    d.shop_colore_secondario, d.shop_colore_sfondo_blocchi,
                    COALESCE(t.codice, 'standard') as template_code
             FROM ditte d
             LEFT JOIN web_templates t ON d.id_web_template = t.id
             WHERE d.url_slug = ? AND d.shop_attivo = 1`,
            [slug]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Sito non trovato o non attivo.' });
        }
        
        req.shopDitta = rows[0];
        next();
    } catch (error) {
        console.error('Errore lookup tenant:', error);
        res.status(500).json({ success: false, error: 'Errore server' });
    }
};

// API Principale CMS: Restituisce struttura pagina, componenti E MENU DI NAVIGAZIONE
router.get('/shop/:slug/page/:pageSlug?', resolveTenant, async (req, res) => {
    try {
        const { pageSlug } = req.params;
        const targetPage = pageSlug || 'home'; 

        // 1. Recupera la pagina corrente
        const [pages] = await dbPool.query(
            `SELECT id, titolo_seo, descrizione_seo 
             FROM web_pages 
             WHERE id_ditta = ? AND slug = ? AND pubblicata = 1`, 
            [req.shopDitta.id, targetPage]
        );

        if (pages.length === 0) {
            return res.status(404).json({ success: false, message: 'Pagina non trovata' });
        }
        const page = pages[0];

        // 2. Recupera i componenti della pagina corrente
        const [components] = await dbPool.query(
            `SELECT tipo_componente, dati_config 
             FROM web_page_components 
             WHERE id_page = ? 
             ORDER BY ordine ASC`, 
            [page.id]
        );

        // 3. RECUPERA IL MENU DI NAVIGAZIONE (Tutte le pagine pubblicate) <-- NOVITÀ
        let navigation = [];
        try {
            console.log("Querying navigation for ditta:", req.shopDitta.id);
            const [navResult] = await dbPool.query(
                `SELECT id, slug, titolo_seo, icona_menu, link_esterno, target_link, id_page_parent, livello_menu, ordine_menu
                 FROM web_pages
                 WHERE id_ditta = ? AND pubblicata = 1 AND mostra_menu = 1
                 ORDER BY livello_menu ASC, ordine_menu ASC, slug ASC`,
                [req.shopDitta.id]
            );
            navigation = navResult || [];
            console.log("Navigation found:", navigation.length);
            console.log("Navigation results:", navigation);
        } catch (navError) {
            console.error("Navigation error:", navError);
            navigation = [];
        }

        // Fallback: Se non troviamo pagine, creiamo un menu di base
        if (navigation.length === 0) {
            console.log("Creating fallback navigation menu");
            navigation = [
                { slug: 'home', titolo_seo: 'Home' },
                { slug: 'chi-siamo', titolo_seo: 'Chi Siamo' }
            ];
        }

        // 4. Risposta JSON Completa
        console.log("=== DEBUG RESPONSE ===");
        console.log("Navigation items being sent:", navigation.length);
        console.log("Navigation content:", navigation);
        console.log("===================");

        const response = {
            success: true,
            siteConfig: {
                name: req.shopDitta.ragione_sociale,
                logo: req.shopDitta.logo_url,
                colors: {
                    primary: req.shopDitta.shop_colore_primario,
                    secondary: req.shopDitta.shop_colore_secondario,
                    background: req.shopDitta.shop_colore_sfondo_blocchi
                },
                template: req.shopDitta.template_code,
                navigation: navigation // Passiamo la lista delle pagine al frontend
            },
            page: {
                title: page.titolo_seo,
                description: page.descrizione_seo
            },
            components: components
        };

        console.log("Final response navigation count:", response.siteConfig.navigation.length);
        res.json(response);

    } catch (error) {
        console.error("Errore CMS:", error);
        res.status(500).json({ success: false, error: 'Errore interno.' });
    }
});

// ============================================================
// CATALOGO CONFIG API (ADMIN)
// ============================================================

const catalogoService = require('../services/catalogoPublicService');

/**
 * GET /api/admin/cms/:idDitta/catalog/config
 * Recupera configurazione catalogo per ditta
 */
router.get('/:idDitta/catalog/config', async (req, res) => {
    try {
        const { idDitta } = req.params;

        const config = await catalogoService.getConfigListino(idDitta);

        res.json({
            success: true,
            data: config
        });

    } catch (error) {
        console.error('Errore recupero config catalogo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero configurazione catalogo'
        });
    }
});

/**
 * PUT /api/admin/cms/:idDitta/catalog/config
 * Aggiorna configurazione catalogo per ditta
 */
router.put('/:idDitta/catalog/config', async (req, res) => {
    try {
        const { idDitta } = req.params;
        const config = req.body;

        await catalogoService.saveConfigListino(idDitta, config);

        res.json({
            success: true,
            message: 'Configurazione catalogo aggiornata con successo'
        });

    } catch (error) {
        console.error('Errore salvataggio config catalogo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore salvataggio configurazione catalogo'
        });
    }
});

/**
 * GET /api/admin/cms/:idDitta/catalog/categories
 * Recupera categorie catalogo per ditta
 */
router.get('/:idDitta/catalog/categories', async (req, res) => {
    try {
        const { idDitta } = req.params;

        const categorie = await catalogoService.getCategorie(idDitta);

        res.json({
            success: true,
            data: categorie
        });

    } catch (error) {
        console.error('Errore recupero categorie catalogo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero categorie catalogo'
        });
    }
});

/**
 * GET /api/admin/cms/:idDitta/catalog/products
 * Recupera prodotti catalogo per admin (pagination, filters)
 */
router.get('/:idDitta/catalog/products', async (req, res) => {
    try {
        const { idDitta } = req.params;
        const {
            categoria_id = null,
            search_term = null,
            page = 1,
            limit = 50,
            listino_tipo = 'pubblico',
            listino_index = 1
        } = req.query;

        const prodotti = await catalogoService.getPublicCatalog(idDitta, {
            listino_tipo,
            listino_index: parseInt(listino_index),
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            search_term,
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100),
            mostra_esauriti: true
        });

        const total = await catalogoService.countProdotti(idDitta, {
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            search_term,
            listino_tipo,
            listino_index: parseInt(listino_index),
            mostra_esauriti: true
        });

        res.json({
            success: true,
            data: prodotti,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Errore recupero prodotti catalogo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero prodotti catalogo'
        });
    }
});

/**
 * GET /api/admin/cms/:idDitta/catalog/:prodottoId/images
 * Recupera immagini di un prodotto
 */
router.get('/:idDitta/catalog/:prodottoId/images', async (req, res) => {
    try {
        const { idDitta, prodottoId } = req.params;

        const immagini = await catalogoService.getImmaginiProdotto(parseInt(idDitta), parseInt(prodottoId));

        res.json({
            success: true,
            data: immagini
        });

    } catch (error) {
        console.error('Errore recupero immagini prodotto:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero immagini prodotto'
        });
    }
});

// ============================================================
// CATALOGO SELEZIONI API (ADMIN)
// ============================================================

const selezioniService = require('../services/catalogoSelezioniService');

/**
 * GET /api/admin/cms/:idDitta/catalog/selezioni
 * Recupera tutte le selezioni di una ditta
 */
router.get('/:idDitta/catalog/selezioni', async (req, res) => {
    try {
        const { idDitta } = req.params;

        const selezioni = await selezioniService.getSelezioni(parseInt(idDitta));

        res.json({
            success: true,
            data: selezioni
        });

    } catch (error) {
        console.error('Errore recupero selezioni:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero selezioni'
        });
    }
});

/**
 * GET /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId
 * Recupera dettaglio selezione con articoli
 */
router.get('/:idDitta/catalog/selezioni/:selezioneId', async (req, res) => {
    try {
        const { idDitta, selezioneId } = req.params;
        const { listino_tipo, listino_index } = req.query;

        const result = await selezioniService.getArticoliSelezione(
            parseInt(selezioneId),
            {
                listino_tipo: listino_tipo || 'pubblico',
                listino_index: parseInt(listino_index) || 1
            }
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Errore recupero selezione:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Errore recupero selezione'
        });
    }
});

/**
 * POST /api/admin/cms/:idDitta/catalog/selezioni
 * Crea nuova selezione
 */
router.post('/:idDitta/catalog/selezioni', async (req, res) => {
    try {
        const { idDitta } = req.params;
        const data = req.body;

        const id = await selezioniService.createSelezione(parseInt(idDitta), data);

        res.json({
            success: true,
            data: { id },
            message: 'Selezione creata con successo'
        });

    } catch (error) {
        console.error('Errore creazione selezione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore creazione selezione'
        });
    }
});

/**
 * PUT /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId
 * Aggiorna selezione
 */
router.put('/:idDitta/catalog/selezioni/:selezioneId', async (req, res) => {
    try {
        const { selezioneId } = req.params;
        const data = req.body;

        await selezioniService.updateSelezione(parseInt(selezioneId), data);

        res.json({
            success: true,
            message: 'Selezione aggiornata con successo'
        });

    } catch (error) {
        console.error('Errore aggiornamento selezione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore aggiornamento selezione'
        });
    }
});

/**
 * DELETE /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId
 * Elimina selezione
 */
router.delete('/:idDitta/catalog/selezioni/:selezioneId', async (req, res) => {
    try {
        const { selezioneId } = req.params;

        await selezioniService.deleteSelezione(parseInt(selezioneId));

        res.json({
            success: true,
            message: 'Selezione eliminata con successo'
        });

    } catch (error) {
        console.error('Errore eliminazione selezione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore eliminazione selezione'
        });
    }
});

/**
 * POST /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId/articoli
 * Aggiunge articolo a selezione
 */
router.post('/:idDitta/catalog/selezioni/:selezioneId/articoli', async (req, res) => {
    try {
        const { idDitta, selezioneId } = req.params;
        const { id_articolo, etichetta_personalizzata, in_evidenza, ordine } = req.body;

        console.log(`[POST] Aggiunta articolo a selezione:`, {
            idDitta,
            selezioneId,
            id_articolo,
            etichetta_personalizzata,
            in_evidenza,
            ordine
        });

        await selezioniService.addArticoloToSelezione(
            parseInt(selezioneId),
            parseInt(id_articolo),
            { etichetta_personalizzata, in_evidenza, ordine }
        );

        console.log(`[POST] Articolo ${id_articolo} aggiunto con successo alla selezione ${selezioneId}`);

        res.json({
            success: true,
            message: 'Articolo aggiunto alla selezione'
        });

    } catch (error) {
        console.error('Errore aggiunta articolo:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Errore aggiunta articolo'
        });
    }
});

/**
 * DELETE /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId/articoli/:articoloId
 * Rimuove articolo da selezione
 */
router.delete('/:idDitta/catalog/selezioni/:selezioneId/articoli/:articoloId', async (req, res) => {
    try {
        const { selezioneId, articoloId } = req.params;

        await selezioniService.removeArticoloFromSelezione(
            parseInt(selezioneId),
            parseInt(articoloId)
        );

        res.json({
            success: true,
            message: 'Articolo rimosso dalla selezione'
        });

    } catch (error) {
        console.error('Errore rimozione articolo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore rimozione articolo'
        });
    }
});

/**
 * PUT /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId/articoli/ordine
 * Aggiorna ordine articoli nella selezione
 */
router.put('/:idDitta/catalog/selezioni/:selezioneId/articoli/ordine', async (req, res) => {
    try {
        const { selezioneId } = req.params;
        const { articoli } = req.body; // Array [{id_articolo, ordine}]

        await selezioniService.updateOrdineArticoli(parseInt(selezioneId), articoli);

        res.json({
            success: true,
            message: 'Ordine articoli aggiornato'
        });

    } catch (error) {
        console.error('Errore aggiornamento ordine:', error);
        res.status(500).json({
            success: false,
            error: 'Errore aggiornamento ordine'
        });
    }
});

/**
 * PUT /api/admin/cms/:idDitta/catalog/selezioni/:selezioneId/articoli/:articoloId/options
 * Aggiorna opzioni articolo nella selezione
 */
router.put('/:idDitta/catalog/selezioni/:selezioneId/articoli/:articoloId/options', async (req, res) => {
    try {
        const { selezioneId, articoloId } = req.params;
        const options = req.body;

        await selezioniService.updateArticoloOptions(
            parseInt(selezioneId),
            parseInt(articoloId),
            options
        );

        res.json({
            success: true,
            message: 'Opzioni articolo aggiornate'
        });

    } catch (error) {
        console.error('Errore aggiornamento options:', error);
        res.status(500).json({
            success: false,
            error: 'Errore aggiornamento options'
        });
    }
});

module.exports = router;