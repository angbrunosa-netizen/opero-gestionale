// #####################################################################
// # Rotte Pubbliche - v1.2 (Fix Certificato SSL Email)
// # File: opero/routes/public.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { dbPool, knex } = require('../config/db');
const router = express.Router();

// --- GET (Recupera dati per la pagina di registrazione) ---
router.get('/register/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const [tokenRows] = await dbPool.query('SELECT * FROM registration_tokens WHERE token = ? AND utilizzato = 0 AND scadenza > NOW()', [token]);
        if (tokenRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Link non valido o scaduto.' });
        }
        const dittaId = tokenRows[0].id_ditta;

        // ++ NUOVA LOGICA CONDIZIONALE ++
        // 1. Controlla se esistono già amministratori per questa ditta
        const [adminCountRows] = await dbPool.query('SELECT COUNT(*) as adminCount FROM utenti WHERE id_ditta = ? AND id_ruolo = 2', [dittaId]);
        const isAdminRegistration = adminCountRows[0].adminCount === 0;

        // 2. Scegli quale ID ditta usare per la privacy policy
        const privacyDittaId = isAdminRegistration ? 1 : dittaId;
        // ++ FINE NUOVA LOGICA ++

        const [privacyRows] = await dbPool.query('SELECT corpo_lettera, responsabile_trattamento FROM privacy_policies WHERE id_ditta = ?', [privacyDittaId]);
        
        if (privacyRows.length === 0) {
            const errorMessage = isAdminRegistration 
                ? 'Privacy policy master non configurata.' 
                : 'Privacy policy non trovata per questa ditta.';
            return res.status(404).json({ success: false, message: errorMessage });
        }

        const [dittaRows] = await dbPool.query('SELECT ragione_sociale FROM ditte WHERE id = ?', [dittaId]);
        if (dittaRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Ditta associata al link non trovata.' });
        }

        res.json({
            success: true,
            privacyPolicy: privacyRows[0],
            ragioneSociale: dittaRows[0].ragione_sociale
        });

    } catch (error) {
        console.error("Errore nel recupero dei dati di registrazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- POST (Completa la registrazione utente) ---
// --- POST (Completa la registrazione utente) ---
// --- POST (Completa la registrazione utente) ---
// --- POST (Completa la registrazione dell'utente) ---
router.post('/register/:token', async (req, res) => {
    const { token } = req.params;
    const { nome, cognome, email, password, privacy, ...altriDati } = req.body;
    let connection;

    if (!nome || !cognome || !email || !password || !privacy) {
        return res.status(400).json({ success: false, message: 'Tutti i campi obbligatori devono essere compilati.' });
    }

    try {
        connection = await knex.client.acquireConnection();
        await connection.beginTransaction();

        const [tokenRows] = await connection.execute('SELECT * FROM registration_tokens WHERE token = ? AND utilizzato = 0 AND scadenza > NOW()', [token]);
        if (tokenRows.length === 0) {
            throw new Error('Link di registrazione non valido o scaduto.');
        }
        const tokenRow = tokenRows[0];
        const { id_ditta, id_ruolo } = tokenRow; // <-- LETTURA DINAMICA DEL RUOLO

        if (!id_ruolo) {
            throw new Error('Il link di invito non è configurato correttamente. Contattare l\'amministratore.');
        }

        const [existingUsers] = await connection.execute('SELECT id FROM utenti WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            throw new Error('Un utente con questa email esiste già.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            nome, cognome, email, password: hashedPassword,
            id_ditta,
            id_ruolo, // <-- ASSEGNAZIONE DINAMICA DEL RUOLO
            stato: 'attivo',
            privacy: privacy ? 1 : 0,
            ...altriDati
        };
        
        await connection.execute(
            `INSERT INTO utenti (nome, cognome, email, password, id_ditta, id_ruolo, stato, privacy, codice_fiscale, telefono, indirizzo, citta, cap) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newUser.nome, newUser.cognome, newUser.email, newUser.password, newUser.id_ditta,
                newUser.id_ruolo, newUser.stato, newUser.privacy, newUser.codice_fiscale || null,
                newUser.telefono || null, newUser.indirizzo || null, newUser.citta || null, newUser.cap || null
            ]
        );

        await connection.execute('UPDATE registration_tokens SET utilizzato = 1 WHERE token = ?', [token]);

        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione completata con successo! Ora puoi accedere.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore durante la registrazione:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore durante la registrazione.' });
    } finally {
        if (connection) connection.release();
    }
});
// --- GET (Verifica Email e attiva Privacy) ---
router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const [result] = await dbPool.query('UPDATE utenti SET privacy = 1, verification_token = NULL WHERE verification_token = ?', [token]);
        if (result.affectedRows > 0) {
            res.send('<h1>Email confermata con successo!</h1><p>Ora puoi accedere a Opero.</p>');
        } else {
            res.status(400).send('<h1>Link di verifica non valido o già utilizzato.</h1>');
        }
    } catch (error) {
        res.status(500).send('<h1>Errore del server durante la verifica.</h1>');
    }
});

/**
 * Nome File: public_cms.js
 * Percorso: routes/public_cms.js
 * Data: 15/12/2025
 * Versione: 1.0.0
 * Descrizione: API pubbliche per il CMS. Gestisce il recupero della struttura delle pagine
 * e dei componenti per il rendering lato frontend.
 */

// Middleware per risolvere il tenant (Ditta) dallo slug
const resolveTenant = async (req, res, next) => {
    const { slug } = req.params;
    try {
        const [rows] = await dbPool.query(
            `SELECT d.id, d.ragione_sociale, d.logo_url, d.shop_colore_primario,
                    d.shop_colore_secondario, d.shop_colore_sfondo_blocchi,
                    d.shop_colore_header_sfondo, d.shop_colore_header_testo, d.shop_logo_posizione,
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

// GET: Recupera la struttura completa di una pagina
// Esempio: /api/public/shop/dittaprova/page/chi-siamo
router.get('/shop/:slug/page/:pageSlug?', resolveTenant, async (req, res) => {
    try {
        const { pageSlug } = req.params;
        const targetPage = pageSlug || 'home'; // Default alla home se slug vuoto

        // 1. Recupera i metadati della pagina
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

        // 2. Recupera i componenti ordinati
        const [components] = await dbPool.query(
            `SELECT tipo_componente, dati_config
             FROM web_page_components
             WHERE id_page = ?
             ORDER BY ordine ASC`,
            [page.id]
        );

        // 3. RECUPERA IL MENU DI NAVIGAZIONE (Tutte le pagine pubblicate)
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

        // 4. Risposta strutturata per il Frontend
        console.log("=== PUBLIC API DEBUG RESPONSE ===");
        console.log("Navigation items being sent:", navigation.length);
        console.log("Navigation content:", navigation);
        console.log("===============================");

        res.json({
            success: true,
            siteConfig: {
                name: req.shopDitta.ragione_sociale,
                logo: req.shopDitta.logo_url,
                colors: {
                    primary: req.shopDitta.shop_colore_primario,
                    secondary: req.shopDitta.shop_colore_secondario,
                    blockBackground: req.shopDitta.shop_colore_sfondo_blocchi || '#ffffff',
                    // Header personalization
                    headerBackground: req.shopDitta.shop_colore_header_sfondo || '#ffffff',
                    headerText: req.shopDitta.shop_colore_header_testo || '#333333',
                    logoPosition: req.shopDitta.shop_logo_posizione || 'left' // left, center, right
                },
                template: req.shopDitta.template_code,
                navigation: navigation // Passiamo la lista delle pagine al frontend
            },
            page: {
                title: page.titolo_seo,
                description: page.descrizione_seo
            },
            components: components // L'array di blocchi da renderizzare
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Errore interno' });
    }
});

// API PUBBLICHE BLOG
router.get('/shop/:slug/blog/posts', resolveTenant, async (req, res) => {
    try {
        const { slug } = req.params;
        const { limit = 10, category } = req.query;

        // Trova l'ID della ditta dallo slug
        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND shop_attivo = 1',
            [slug]
        );

        if (ditta.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        let whereClause = 'WHERE p.id_ditta = ? AND p.pubblicato = 1';
        let params = [ditta[0].id];

        if (category) {
            whereClause += ' AND c.slug = ?';
            params.push(category);
        }

        const [posts] = await dbPool.query(
            `SELECT p.id, p.titolo, p.slug, p.descrizione_breve, p.copertina_url,
                    p.pdf_url, p.pdf_filename, p.data_pubblicazione, p.autore,
                    c.nome as categoria_nome, c.slug as categoria_slug, c.colore as categoria_colore
             FROM web_blog_posts p
             LEFT JOIN web_blog_categories c ON p.id_category = c.id
             ${whereClause}
             ORDER BY p.data_pubblicazione DESC
             LIMIT ?`,
            [...params, parseInt(limit)]
        );

        // Incrementa contatore visualizzazioni per ogni post
        for (const post of posts) {
            await dbPool.query(
                'UPDATE web_blog_posts SET visualizzazioni = visualizzazioni + 1 WHERE id = ?',
                [post.id]
            );
        }

        res.json({
            success: true,
            posts: posts || []
        });
    } catch (error) {
        console.error('Errore caricamento posts blog:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel caricare gli articoli'
        });
    }
});

router.get('/shop/:slug/blog/post/:postSlug', resolveTenant, async (req, res) => {
    try {
        const { slug, postSlug } = req.params;

        // Trova l'ID della ditta dallo slug
        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND shop_attivo = 1',
            [slug]
        );

        if (ditta.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        // Recupera dettaglio post con categorie
        const [posts] = await dbPool.query(
            `SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug, c.colore as categoria_colore
             FROM web_blog_posts p
             LEFT JOIN web_blog_categories c ON p.id_category = c.id
             WHERE p.id_ditta = ? AND p.slug = ? AND p.pubblicato = 1`,
            [ditta[0].id, postSlug]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Articolo non trovato'
            });
        }

        const post = posts[0];

        // Incrementa visualizzazioni
        await dbPool.query(
            'UPDATE web_blog_posts SET visualizzazioni = visualizzazioni + 1 WHERE id = ?',
            [post.id]
        );

        // Recupera allegati del post (PDF caricati con AllegatiManager)
        let postAllegati = [];
        try {
            postAllegati = await knex('dm_allegati_link as link')
                .join('dm_files as file', 'link.id_file', 'file.id')
                .where({
                    'link.entita_tipo': 'Blog',
                    'link.entita_id': post.id,
                    'link.id_ditta': ditta[0].id
                })
                .select(
                    'file.id as id_link',
                    'file.file_name_originale',
                    'file.file_size_bytes',
                    'file.mime_type',
                    'file.privacy',
                    'file.created_at',
                    'file.s3_key'
                )
                .orderBy('file.created_at', 'desc');

            // Genera URL per ogni allegato
            const CDN_BASE_URL = 'https://cdn.operocloud.it';
            const S3_BUCKET_NAME = 'operogo';

            for (const allegato of postAllegati) {
                if (allegato.privacy === 'public') {
                    allegato.previewUrl = `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${allegato.s3_key}`;
                }
                delete allegato.s3_key;
            }

        } catch (error) {
            console.error('Errore recupero allegati post:', error);
        }

        // Recupera post correlati (stessa categoria, escluso il post corrente)
        const [relatedPosts] = await dbPool.query(
            `SELECT p.titolo, p.slug, p.copertina_url, p.descrizione_breve, p.data_pubblicazione,
                    p.pdf_url, p.pdf_filename
             FROM web_blog_posts p
             WHERE p.id_ditta = ? AND p.pubblicato = 1
                   AND p.id != ? AND (p.id_category = ? OR p.id_category IS NULL)
             ORDER BY p.data_pubblicazione DESC
             LIMIT 3`,
            [ditta[0].id, post.id, post.id_category]
        );

        res.json({
            success: true,
            post: {
                ...post,
                allegati: postAllegati || [],
                relatedPosts: relatedPosts || []
            }
        });
    } catch (error) {
        console.error('Errore caricamento dettaglio post:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel caricare l\'articolo'
        });
    }
});

router.get('/shop/:slug/blog/categories', resolveTenant, async (req, res) => {
    try {
        const { slug } = req.params;

        // Trova l'ID della ditta dallo slug
        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND shop_attivo = 1',
            [slug]
        );

        if (ditta.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        // Recupera categorie con conteggio post
        const [categories] = await dbPool.query(
            `SELECT c.*, COUNT(p.id) as posts_count
             FROM web_blog_categories c
             LEFT JOIN web_blog_posts p ON c.id = p.id_category AND p.pubblicato = 1
             WHERE c.id_ditta = ? AND c.attivo = 1
             GROUP BY c.id
             ORDER BY c.ordine ASC, c.nome ASC`,
            [ditta[0].id]
        );

        res.json({
            success: true,
            categories: categories || []
        });
    } catch (error) {
        console.error('Errore caricamento categorie blog:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel caricare le categorie'
        });
    }
});

// GET: Recupera la configurazione base del sito
// Esempio: /api/public/shop/mia-azienda/config
router.get('/shop/:slug/config', resolveTenant, async (req, res) => {
    try {
        const { slug } = req.params;

        // 1. Recupera i dati base della ditta
        const [ditte] = await dbPool.query(
            `SELECT id, ragione_sociale, url_slug, shop_colore_primario, shop_colore_secondario,
                    shop_colore_sfondo_blocchi, shop_colore_header_sfondo, shop_colore_header_testo,
                    shop_logo_posizione, shop_attivo, shop_banner_url, shop_descrizione_home,
                    id_web_template, shop_template
             FROM ditte
             WHERE url_slug = ? AND shop_attivo = 1`,
            [slug]
        );

        if (ditte.length === 0) {
            return res.status(404).json({ success: false, message: 'Sito non trovato o non attivo' });
        }

        const ditta = ditte[0];

        // 2. Costruisce la configurazione del sito
        const siteConfig = {
            id: ditta.id,
            nome: ditta.ragione_sociale || slug,
            slug: ditta.url_slug,
            colors: {
                primary: ditta.shop_colore_primario || '#06215b',
                secondary: ditta.shop_colore_secondario || '#1e40af',
                blockBackground: ditta.shop_colore_sfondo_blocchi || '#ffffff',
                // Header personalization
                headerBackground: ditta.shop_colore_header_sfondo || '#ffffff',
                headerText: ditta.shop_colore_header_testo || '#333333',
                logoPosition: ditta.shop_logo_posizione || 'left' // left, center, right
            },
            banner_url: ditta.shop_banner_url,
            descrizione_home: ditta.shop_descrizione_home,
            template_code: ditta.shop_template || 'default',
            id_web_template: ditta.id_web_template
        };

        // 3. Recupera menu di navigazione (pagine pubblicate)
        const [navigation] = await dbPool.query(
            `SELECT slug, titolo_seo
             FROM web_pages
             WHERE id_ditta = ? AND pubblicata = 1
             ORDER BY id ASC`,
            [ditta.id]
        );

        // 4. Assicura che Blog sia nel menu di navigazione
        const hasBlog = navigation.find(item => item.slug === 'blog');
        if (!hasBlog) {
            navigation.push({ slug: 'blog', titolo_seo: 'Blog' });
        }

        // 5. Aggiorna siteConfig con navigazione e logo
        siteConfig.navigation = navigation;
        siteConfig.logo = ditta.shop_logo_url;

        res.json({
            success: true,
            siteConfig: siteConfig
        });

    } catch (error) {
        console.error('Errore recupero configurazione sito:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel caricamento della configurazione del sito'
        });
    }
});

// ============================================================
// CATALOGO PUBBLICO API
// ============================================================

const catalogoService = require('../services/catalogoPublicService');

/**
 * GET /api/public/shop/:siteSlug/catalog
 * Recupera catalogo prodotti con prezzi, giacenza e immagini S3
 *
 * Query params:
 *   - categoria_id: ID categoria (opzionale)
 *   - search_term: Stringa ricerca (opzionale)
 *   - prezzo_min: Prezzo minimo (opzionale)
 *   - prezzo_max: Prezzo massimo (opzionale)
 *   - listino_tipo: 'pubblico' | 'cessione' (default da config)
 *   - listino_index: 1-6 (default da config)
 *   - mostra_esauriti: boolean (default true)
 *   - page: Numero pagina (default 1)
 *   - limit: Risultati per pagina (default 20, max 50)
 *   - sort_by: 'descrizione' | 'prezzo' | 'giacenza' | 'codice'
 *   - sort_order: 'ASC' | 'DESC'
 */
router.get('/shop/:siteSlug/catalog', async (req, res) => {
    try {
        const { siteSlug } = req.params;

        // Recupera ID ditta da slug
        const [ditta] = await dbPool.query(
            'SELECT id, shop_attivo FROM ditte WHERE url_slug = ? AND id_tipo_ditta = 1',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        if (!ditta[0].shop_attivo) {
            return res.status(403).json({
                success: false,
                error: 'Shop non attivo per questo sito'
            });
        }

        const dittaId = ditta[0].id;

        // Recupera configurazione listino dal sito
        const configListino = await catalogoService.getConfigListino(dittaId);

        // Parse query params con fallback dalla config
        const {
            categoria_id = null,
            search_term = null,
            prezzo_min = null,
            prezzo_max = null,
            listino_tipo = configListino.catalog_listino_tipo,
            listino_index = configListino.catalog_listino_index,
            mostra_esauriti = configListino.catalog_mostra_esauriti,
            page = 1,
            limit = 20,
            sort_by = 'descrizione',
            sort_order = 'ASC'
        } = req.query;

        // Validazione limit
        const parsedLimit = Math.min(parseInt(limit) || 20, 50);

        // Fetch prodotti
        const prodotti = await catalogoService.getPublicCatalog(dittaId, {
            listino_tipo,
            listino_index: parseInt(listino_index),
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            search_term,
            prezzo_min: prezzo_min ? parseFloat(prezzo_min) : null,
            prezzo_max: prezzo_max ? parseFloat(prezzo_max) : null,
            mostra_esauriti: mostra_esauriti === 'true' || mostra_esauriti === true,
            page: parseInt(page),
            limit: parsedLimit,
            sort_by,
            sort_order
        });

        // Conta totale per paginazione
        const total = await catalogoService.countProdotti(dittaId, {
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            search_term,
            prezzo_min: prezzo_min ? parseFloat(prezzo_min) : null,
            prezzo_max: prezzo_max ? parseFloat(prezzo_max) : null,
            listino_tipo,
            listino_index: parseInt(listino_index),
            mostra_esauriti: mostra_esauriti === 'true' || mostra_esauriti === true
        });

        res.json({
            success: true,
            data: prodotti,
            meta: {
                total,
                page: parseInt(page),
                limit: parsedLimit,
                totalPages: Math.ceil(total / parsedLimit),
                listino: {
                    tipo: listino_tipo,
                    index: parseInt(listino_index)
                }
            }
        });

    } catch (error) {
        console.error('Errore catalogo pubblico:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero catalogo',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/public/shop/:siteSlug/catalog/categories
 * Recupera categorie catalogo per filtri
 */
router.get('/shop/:siteSlug/catalog/categories', async (req, res) => {
    try {
        const { siteSlug } = req.params;

        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND id_tipo_ditta = 1',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        const categorie = await catalogoService.getCategorie(ditta[0].id);

        res.json({
            success: true,
            data: categorie
        });

    } catch (error) {
        console.error('Errore recupero categorie:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero categorie'
        });
    }
});

/**
 * GET /api/public/shop/:siteSlug/catalog/:prodottoId
 * Recupera dettagli singolo prodotto
 */
router.get('/shop/:siteSlug/catalog/:prodottoId', async (req, res) => {
    try {
        const { siteSlug, prodottoId } = req.params;

        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND id_tipo_ditta = 1',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        const configListino = await catalogoService.getConfigListino(ditta[0].id);

        const prodotti = await catalogoService.getPublicCatalog(ditta[0].id, {
            listino_tipo: configListino.catalog_listino_tipo,
            listino_index: configListino.catalog_listino_index,
            page: 1,
            limit: 1
        });

        const prodotto = prodotti.find(p => p.id === parseInt(prodottoId));

        if (!prodotto) {
            return res.status(404).json({
                success: false,
                error: 'Prodotto non trovato'
            });
        }

        res.json({
            success: true,
            data: prodotto
        });

    } catch (error) {
        console.error('Errore recupero prodotto:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero prodotto'
        });
    }
});

// ============================================================
// CATALOGO SELEZIONI API (PUBBLICHE)
// ============================================================

const selezioniService = require('../services/catalogoSelezioniService');

/**
 * GET /api/public/shop/:siteSlug/catalog/selezioni
 * Recupera tutte le selezioni attive di un sito
 */
router.get('/shop/:siteSlug/catalog/selezioni', async (req, res) => {
    try {
        const { siteSlug } = req.params;

        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ? AND id_tipo_ditta = 1',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        const selezioni = await selezioniService.getSelezioni(ditta[0].id);

        // Filtra solo selezioni attive
        const selezioniAttive = selezioni.filter(s => s.attivo);

        res.json({
            success: true,
            data: selezioniAttive
        });

    } catch (error) {
        console.error('Errore recupero selezioni pubbliche:', error);
        res.status(500).json({
            success: false,
            error: 'Errore recupero selezioni'
        });
    }
});

/**
 * GET /api/public/shop/:siteSlug/catalog/selezioni/:slug
 * Recupera dettaglio selezione con articoli per slug
 */
router.get('/shop/:siteSlug/catalog/selezioni/:slug', async (req, res) => {
    try {
        const { siteSlug, slug } = req.params;

        const [ditta] = await dbPool.query(
            'SELECT id, catalog_listino_tipo, catalog_listino_index FROM ditte WHERE url_slug = ? AND id_tipo_ditta = 1',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({
                success: false,
                error: 'Sito non trovato'
            });
        }

        const result = await selezioniService.getArticoliSelezioneBySlug(slug, {
            listino_tipo: ditta[0].catalog_listino_tipo || 'pubblico',
            listino_index: ditta[0].catalog_listino_index || 1
        });

        // Verifica che la selezione appartenga alla ditta corretta
        if (result.selezione.id_ditta !== ditta[0].id) {
            return res.status(404).json({
                success: false,
                error: 'Selezione non trovata'
            });
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Errore recupero selezione pubblica:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Errore recupero selezione'
        });
    }
});

/**
 * GET /api/public/catalog/selezioni/:selezioneId
 * Recupera dettaglio selezione con articoli per ID (per blocchi CMS)
 */
router.get('/catalog/selezioni/:selezioneId', async (req, res) => {
    try {
        const { selezioneId } = req.params;

        const result = await selezioniService.getArticoliSelezione(parseInt(selezioneId));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Errore recupero selezione pubblica:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Errore recupero selezione'
        });
    }
});

module.exports = router;


