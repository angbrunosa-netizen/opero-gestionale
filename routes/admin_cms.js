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
            `SELECT url_slug, id_web_template, shop_colore_primario, shop_colore_secondario, shop_attivo, shop_template, shop_colore_sfondo_blocchi
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
        const { url_slug, shop_template, shop_colore_primario, shop_colore_secondario, shop_colore_sfondo_blocchi, shop_attivo } = req.body;
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
                shop_attivo = ?
             WHERE id = ?`,
            [url_slug, id_web_template, shop_colore_primario, shop_colore_secondario, shop_colore_sfondo_blocchi, shop_attivo ? 1 : 0, idDitta]
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
const upload = multer({ dest: 'uploads/temp/' }); // Cartella temp

router.post('/media/upload/:idDitta', upload.single('file'), async (req, res) => {
    const { idDitta } = req.params;
    const { s3Upload } = require('../utils/s3Client'); // Assicurati che il percorso sia corretto
    const fs = require('fs');

    try {
        if (!req.file) throw new Error("Nessun file caricato");

        // 1. Upload su S3
        // Usiamo una struttura chiave dedicata al sito: ditta-{id}/website/{filename}
        const s3Key = `ditta-${idDitta}/website/${Date.now()}-${req.file.originalname}`;
        
        const fileStream = fs.createReadStream(req.file.path);
        await s3Upload(s3Key, fileStream, req.file.mimetype);

        // 2. Salva record in dm_files
        const [result] = await dbPool.query(
            `INSERT INTO dm_files 
            (id_ditta, id_utente_upload, file_name_originale, file_size_bytes, mime_type, privacy, s3_key) 
            VALUES (?, ?, ?, ?, ?, 'public', ?)`,
            [idDitta, req.user.id, req.file.originalname, req.file.size, req.file.mimetype, s3Key]
        );

        // 3. (Opzionale) Collega a dm_allegati_link con entita 'website'
        await dbPool.query(
            `INSERT INTO dm_allegati_link (id_ditta, id_file, entita_tipo, entita_id) VALUES (?, ?, 'website', ?)`,
            [idDitta, result.insertId, idDitta]
        );

        // Pulizia
        fs.unlink(req.file.path, () => {});

        res.json({
            success: true,
            url: `https://cdn.operocloud.it/operogo/${s3Key}`,
            id: result.insertId
        });

    } catch (e) {
        console.error("Errore upload media:", e);
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
                `SELECT slug, titolo_seo
                 FROM web_pages
                 WHERE id_ditta = ? AND pubblicata = 1
                 ORDER BY id ASC`,
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



module.exports = router;