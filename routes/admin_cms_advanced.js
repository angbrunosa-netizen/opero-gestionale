/**
 * Nome File: admin_cms_advanced.js
 * Posizione: routes/admin_cms_advanced.js
 * Data: 21/12/2025
 * Descrizione: API avanzate per gestione pagine con SEO, visibilità e menu multilivello
 */

const express = require('express');
const { dbPool, knex } = require('../config/db');
const router = express.Router();

// Middleware per autenticazione
router.use((req, res, next) => {
    if (!req.user || req.user.id_ruolo > 2) { // Solo admin e ditta admin
        return res.status(403).json({ success: false, message: 'Non autorizzato' });
    }
    next();
});

// GET: Recupera pagine con metadati avanzati
router.get('/:idDitta/pages-advanced', async (req, res) => {
    try {
        const { idDitta } = req.params;

        const [pages] = await dbPool.query(`
            SELECT
                p.*,
                parent.titolo_seo as parent_titolo,
                parent.slug as parent_slug
            FROM web_pages p
            LEFT JOIN web_pages parent ON p.id_page_parent = parent.id
            WHERE p.id_ditta = ?
            ORDER BY p.livello_menu ASC, p.ordine_menu ASC, p.slug ASC
        `, [idDitta]);

        res.json(pages);
    } catch (error) {
        console.error('Errore recupero pagine avanzate:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST/PUT: Crea o aggiorna pagina con configurazione avanzata
router.post('/:idDitta/pages/advanced', async (req, res) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();
        const { idDitta } = req.params;
        const pageData = req.body;

        // Validazione slug univoco
        if (pageData.slug) {
            const [existing] = await connection.execute(
                'SELECT id FROM web_pages WHERE id_ditta = ? AND slug = ? AND id != ?',
                [idDitta, pageData.slug, pageData.id || 0]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Slug già in uso' });
            }
        }

        // Calcolo livello menu automatico
        let livelloMenu = 1;
        if (pageData.id_page_parent) {
            const [parent] = await connection.execute(
                'SELECT livello_menu FROM web_pages WHERE id = ?',
                [pageData.id_page_parent]
            );
            if (parent.length > 0) {
                livelloMenu = parent[0].livello_menu + 1;

                if (livelloMenu > 3) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Livello menu troppo profondo (max 3)' });
                }
            }
        }

        const pageFields = {
            id_ditta: idDitta,
            slug: pageData.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || null,
            titolo_seo: pageData.titolo_seo || null,
            titolo_pagina: pageData.titolo_pagina || null,
            descrizione_seo: pageData.descrizione_seo || null,
            keywords_seo: pageData.keywords_seo || null,
            immagine_social: pageData.immagine_social || null,
            id_page_parent: pageData.id_page_parent || null,
            ordine_menu: pageData.ordine_menu || 0,
            livello_menu: livelloMenu,
            mostra_menu: pageData.mostra_menu !== false,
            link_esterno: pageData.link_esterno || null,
            target_link: pageData.target_link || '_self',
            icona_menu: pageData.icona_menu || null,
            data_pubblicazione: pageData.data_pubblicazione || null,
            data_scadenza: pageData.data_scadenza || null,
            password_protetta: pageData.password_protetta || null,
            layout_template: pageData.layout_template || 'default',
            canonical_url: pageData.canonical_url || null,
            robots_index: pageData.robots_index || 'index',
            robots_follow: pageData.robots_follow || 'follow',
            pubblicata: pageData.pubblicata || false
        };

        if (pageData.id) {
            // UPDATE
            await connection.execute(`
                UPDATE web_pages SET
                    slug = ?, titolo_seo = ?, titolo_pagina = ?, descrizione_seo = ?,
                    keywords_seo = ?, immagine_social = ?, id_page_parent = ?,
                    ordine_menu = ?, livello_menu = ?, mostra_menu = ?,
                    link_esterno = ?, target_link = ?, icona_menu = ?,
                    data_pubblicazione = ?, data_scadenza = ?, password_protetta = ?,
                    layout_template = ?, canonical_url = ?, robots_index = ?,
                    robots_follow = ?, pubblicata = ?
                WHERE id = ? AND id_ditta = ?
            `, [
                pageFields.slug, pageFields.titolo_seo, pageFields.titolo_pagina, pageFields.descrizione_seo,
                pageFields.keywords_seo, pageFields.immagine_social, pageFields.id_page_parent,
                pageFields.ordine_menu, pageFields.livello_menu, pageFields.mostra_menu,
                pageFields.link_esterno, pageFields.target_link, pageFields.icona_menu,
                pageFields.data_pubblicazione, pageFields.data_scadenza, pageFields.password_protetta,
                pageFields.layout_template, pageFields.canonical_url, pageFields.robots_index,
                pageFields.robots_follow, pageFields.pubblicata,
                pageData.id, idDitta
            ]);

            // Crea revisione
            await connection.execute(`
                INSERT INTO web_page_revisions (id_page, id_utente, contenuto, motivo_revision)
                VALUES (?, ?, ?, ?)
            `, [
                pageData.id,
                req.user.id,
                JSON.stringify(pageFields),
                'Aggiornamento configurazione avanzata'
            ]);

        } else {
            // INSERT
            const [result] = await connection.execute(`
                INSERT INTO web_pages (
                    id_ditta, slug, titolo_seo, titolo_pagina, descrizione_seo,
                    keywords_seo, immagine_social, id_page_parent, ordine_menu,
                    livello_menu, mostra_menu, link_esterno, target_link,
                    icona_menu, data_pubblicazione, data_scadenza,
                    password_protetta, layout_template, canonical_url,
                    robots_index, robots_follow, pubblicata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                pageFields.id_ditta, pageFields.slug, pageFields.titolo_seo, pageFields.titolo_pagina,
                pageFields.descrizione_seo, pageFields.keywords_seo, pageFields.immagine_social,
                pageFields.id_page_parent, pageFields.ordine_menu, pageFields.livello_menu,
                pageFields.mostra_menu, pageFields.link_esterno, pageFields.target_link,
                pageFields.icona_menu, pageFields.data_pubblicazione, pageFields.data_scadenza,
                pageFields.password_protetta, pageFields.layout_template, pageFields.canonical_url,
                pageFields.robots_index, pageFields.robots_follow, pageFields.pubblicata
            ]);

            pageData.id = result.insertId;
        }

        await connection.commit();
        res.json({ success: true, page: { ...pageFields, id: pageData.id } });

    } catch (error) {
        await connection.rollback();
        console.error('Errore salvataggio pagina avanzata:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// PUT: Aggiorna pagina avanzata (alias per POST con ID)
router.put('/pages/:id/advanced', async (req, res) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();
        const pageData = { ...req.body, id: req.params.id };

        // Recupera id_ditta dalla pagina esistente
        const [page] = await connection.execute(
            'SELECT id_ditta FROM web_pages WHERE id = ?',
            [req.params.id]
        );

        if (page.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Pagina non trovata' });
        }

        const idDitta = page[0].id_ditta;

        // Validazione slug univoco
        if (pageData.slug) {
            const [existing] = await connection.execute(
                'SELECT id FROM web_pages WHERE id_ditta = ? AND slug = ? AND id != ?',
                [idDitta, pageData.slug, pageData.id || 0]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Slug già in uso' });
            }
        }

        // Calcolo livello menu automatico
        let livelloMenu = 1;
        if (pageData.id_page_parent) {
            const [parent] = await connection.execute(
                'SELECT livello_menu FROM web_pages WHERE id = ?',
                [pageData.id_page_parent]
            );
            if (parent.length > 0) {
                livelloMenu = parent[0].livello_menu + 1;

                if (livelloMenu > 3) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Livello menu troppo profondo (max 3)' });
                }
            }
        }

        const pageFields = {
            id_ditta: idDitta,
            slug: pageData.slug?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || null,
            titolo_seo: pageData.titolo_seo || null,
            titolo_pagina: pageData.titolo_pagina || null,
            descrizione_seo: pageData.descrizione_seo || null,
            keywords_seo: pageData.keywords_seo || null,
            immagine_social: pageData.immagine_social || null,
            id_page_parent: pageData.id_page_parent || null,
            ordine_menu: pageData.ordine_menu || 0,
            livello_menu: livelloMenu,
            mostra_menu: pageData.mostra_menu !== false,
            link_esterno: pageData.link_esterno || null,
            target_link: pageData.target_link || '_self',
            icona_menu: pageData.icona_menu || null,
            data_pubblicazione: pageData.data_pubblicazione || null,
            data_scadenza: pageData.data_scadenza || null,
            password_protetta: pageData.password_protetta || null,
            layout_template: pageData.layout_template || 'default',
            canonical_url: pageData.canonical_url || null,
            robots_index: pageData.robots_index || 'index',
            robots_follow: pageData.robots_follow || 'follow',
            pubblicata: pageData.pubblicata || false
        };

        // UPDATE
        await connection.execute(`
            UPDATE web_pages SET
                slug = ?, titolo_seo = ?, titolo_pagina = ?, descrizione_seo = ?,
                keywords_seo = ?, immagine_social = ?, id_page_parent = ?,
                ordine_menu = ?, livello_menu = ?, mostra_menu = ?,
                link_esterno = ?, target_link = ?, icona_menu = ?,
                data_pubblicazione = ?, data_scadenza = ?, password_protetta = ?,
                layout_template = ?, canonical_url = ?, robots_index = ?,
                robots_follow = ?, pubblicata = ?
            WHERE id = ? AND id_ditta = ?
        `, [
            pageFields.slug, pageFields.titolo_seo, pageFields.titolo_pagina, pageFields.descrizione_seo,
            pageFields.keywords_seo, pageFields.immagine_social, pageFields.id_page_parent,
            pageFields.ordine_menu, pageFields.livello_menu, pageFields.mostra_menu,
            pageFields.link_esterno, pageFields.target_link, pageFields.icona_menu,
            pageFields.data_pubblicazione, pageFields.data_scadenza, pageFields.password_protetta,
            pageFields.layout_template, pageFields.canonical_url, pageFields.robots_index,
            pageFields.robots_follow, pageFields.pubblicata,
            pageData.id, idDitta
        ]);

        // Crea revisione
        await connection.execute(`
            INSERT INTO web_page_revisions (id_page, id_utente, contenuto, motivo_revision)
            VALUES (?, ?, ?, ?)
        `, [
            pageData.id,
            req.user.id,
            JSON.stringify(pageFields),
            'Aggiornamento configurazione avanzata'
        ]);

        await connection.commit();
        res.json({ success: true, page: { ...pageFields, id: pageData.id } });

    } catch (error) {
        await connection.rollback();
        console.error('Errore aggiornamento pagina avanzata:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// GET: Recupera albero menu completo per frontend
router.get('/:idDitta/menu-tree', async (req, res) => {
    try {
        const { idDitta } = req.params;

        // Usa la stored procedure per generare l'albero menu
        const [result] = await dbPool.query('SELECT generate_menu_tree(?, "main") as menu_tree', [idDitta]);

        const menuTree = result[0]?.menu_tree || [];

        res.json({
            success: true,
            menu: menuTree,
            config: {
                style: 'horizontal',
                showSubmenuOn: 'hover',
                mobileStyle: 'slide',
                maxDepth: 3
            }
        });

    } catch (error) {
        console.error('Errore generazione menu tree:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Riordina pagine nel menu
router.post('/pages/reorder', async (req, res) => {
    const trx = await knex.transaction();

    try {
        const { pageIds } = req.body;

        if (!Array.isArray(pageIds)) {
            return res.status(400).json({ success: false, message: 'pageIds deve essere un array' });
        }

        for (let i = 0; i < pageIds.length; i++) {
            const pageId = pageIds[i];
            await trx('web_pages')
                .where('id', pageId)
                .update({ ordine_menu: i + 1 });
        }

        await trx.commit();
        res.json({ success: true, message: 'Menu riordinato con successo' });

    } catch (error) {
        await trx.rollback();
        console.error('Errore riordinamento menu:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET: Recupera revisioni di una pagina
router.get('/pages/:pageId/revisions', async (req, res) => {
    try {
        const { pageId } = req.params;

        const [revisions] = await dbPool.query(`
            SELECT r.*, u.nome, u.cognome
            FROM web_page_revisions r
            JOIN utenti u ON r.id_utente = u.id
            WHERE r.id_page = ?
            ORDER BY r.data_revision DESC
            LIMIT 10
        `, [pageId]);

        res.json(revisions);

    } catch (error) {
        console.error('Errore recupero revisioni:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST: Ripristina pagina da revisione
router.post('/pages/:pageId/restore/:revisionId', async (req, res) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();
        const { pageId, revisionId } = req.params;

        // Recupera contenuto revisione
        const [revision] = await connection.execute(
            'SELECT contenuto FROM web_page_revisions WHERE id = ? AND id_page = ?',
            [revisionId, pageId]
        );

        if (revision.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Revisione non trovata' });
        }

        const pageData = JSON.parse(revision[0].contenuto);

        // Ripristina dati pagina
        await connection.execute(`
            UPDATE web_pages SET
                slug = ?, titolo_seo = ?, titolo_pagina = ?, descrizione_seo = ?,
                keywords_seo = ?, immagine_social = ?, id_page_parent = ?,
                ordine_menu = ?, livello_menu = ?, mostra_menu = ?,
                link_esterno = ?, target_link = ?, icona_menu = ?,
                data_pubblicazione = ?, data_scadenza = ?, password_protetta = ?,
                layout_template = ?, canonical_url = ?, robots_index = ?,
                robots_follow = ?, pubblicata = ?
            WHERE id = ?
        `, [
            pageData.slug, pageData.titolo_seo, pageData.titolo_pagina, pageData.descrizione_seo,
            pageData.keywords_seo, pageData.immagine_social, pageData.id_page_parent,
            pageData.ordine_menu, pageData.livello_menu, pageData.mostra_menu,
            pageData.link_esterno, pageData.target_link, pageData.icona_menu,
            pageData.data_pubblicazione, pageData.data_scadenza, pageData.password_protetta,
            pageData.layout_template, pageData.canonical_url, pageData.robots_index,
            pageData.robots_follow, pageData.pubblicata,
            pageId
        ]);

        // Crea nuova revisione per il ripristino
        await connection.execute(`
            INSERT INTO web_page_revisions (id_page, id_utente, contenuto, motivo_revision)
            VALUES (?, ?, ?, ?)
        `, [
            pageId,
            req.user.id,
            JSON.stringify(pageData),
            `Ripristinato da revisione ${revisionId}`
        ]);

        await connection.commit();
        res.json({ success: true, message: 'Pagina ripristinata con successo' });

    } catch (error) {
        await connection.rollback();
        console.error('Errore ripristino pagina:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// GET: Verifica password pagina
router.post('/pages/:pageId/verify-password', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { password } = req.body;

        const [page] = await dbPool.query(
            'SELECT password_protetta FROM web_pages WHERE id = ?',
            [pageId]
        );

        if (page.length === 0) {
            return res.status(404).json({ success: false, message: 'Pagina non trovata' });
        }

        const isProtected = page[0].password_protetta !== null;
        const isValid = isProtected && page[0].password_protetta === password;

        res.json({
            success: true,
            isProtected,
            isValid
        });

    } catch (error) {
        console.error('Errore verifica password:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE: Elimina pagina con dipendenze
router.delete('/pages/:pageId', async (req, res) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();
        const { pageId } = req.params;

        // Controlla se ha pagine figlie
        const [children] = await connection.execute(
            'SELECT COUNT(*) as count FROM web_pages WHERE id_page_parent = ?',
            [pageId]
        );

        if (children[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Impossibile eliminare pagina con sottopagine. Elimina prima le sottopagine.'
            });
        }

        // Elimina componenti pagina
        await connection.execute(
            'DELETE FROM web_page_components WHERE id_page = ?',
            [pageId]
        );

        // Elimina revisioni
        await connection.execute(
            'DELETE FROM web_page_revisions WHERE id_page = ?',
            [pageId]
        );

        // Elimina pagina
        await connection.execute(
            'DELETE FROM web_pages WHERE id = ?',
            [pageId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Pagina eliminata con successo' });

    } catch (error) {
        await connection.rollback();
        console.error('Errore eliminazione pagina:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;