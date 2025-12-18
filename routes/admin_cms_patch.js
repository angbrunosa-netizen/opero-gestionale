/**
 * API CMS con fix per il campo navigation
 */

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken, checkPermission } = require('../utils/auth');
const router = express.Router();

// Middleware Helper: Trova la ditta dallo slug (sottodominio)
const resolveTenant = async (req, res, next) => {
    const { slug } = req.params;
    try {
        const [rows] = await dbPool.query(
            `SELECT d.id, d.ragione_sociale, d.logo_url, d.shop_colore_primario,
                    d.shop_colore_secondario,
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

// API Principale CMS con navigation FIXATO
router.get('/shop/:slug/page/:pageSlug?', resolveTenant, async (req, res) => {
    try {
        const { pageSlug } = req.params;
        const targetPage = pageSlug || 'home';

        console.log("=== CMS API DEBUG ===");
        console.log("slug:", pageSlug, "ditta:", req.shopDitta.id);

        // 1. Recupera la pagina corrente
        const [pages] = await dbPool.query(
            `SELECT id, titolo_seo, descrizione_seo
             FROM web_pages
             WHERE id_ditta = ? AND slug = ? AND pubblicata = 1`,
            [req.shopDitta.id, targetPage]
        );

        console.log("Pages found:", pages.length);

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

        // 3. RECUPERA IL MENU DI NAVIGAZIONE CON DEBUG
        let navigation = [];
        try {
            const [navResult] = await dbPool.query(
                `SELECT slug, titolo_seo
                 FROM web_pages
                 WHERE id_ditta = ? AND pubblicata = 1
                 ORDER BY id ASC`,
                [req.shopDitta.id]
            );
            navigation = navResult || [];
            console.log("Navigation SUCCESS - found:", navigation.length, "items");
            console.log("Navigation items:", navigation);
        } catch (navError) {
            console.error("Navigation ERROR:", navError);
            navigation = [];
        }

        // 4. Fallback: se non troviamo pagine, creiamo un menu di base
        if (navigation.length === 0) {
            console.log("Creating fallback navigation");
            navigation = [
                { slug: 'home', titolo_seo: 'Home' }
            ];
        }

        // 5. Risposta JSON Completa
        const response = {
            success: true,
            siteConfig: {
                name: req.shopDitta.ragione_sociale,
                logo: req.shopDitta.logo_url,
                colors: {
                    primary: req.shopDitta.shop_colore_primario,
                    secondary: req.shopDitta.shop_colore_secondario
                },
                template: req.shopDitta.template_code,
                navigation: navigation // QUI GARANTIAMO IL CAMPO
            },
            page: {
                title: page.titolo_seo,
                description: page.descrizione_seo
            },
            components: components
        };

        console.log("Final response navigation count:", response.siteConfig.navigation.length);
        console.log("=== END DEBUG ===");

        res.json(response);

    } catch (error) {
        console.error("Errore CMS:", error);
        res.status(500).json({ success: false, error: 'Errore interno.' });
    }
});

module.exports = router;