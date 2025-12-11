// backend/routes/quoteRoutes.js
const express = require('express');
const router = express.Router();
const quoteService = require('../services/quoteService');

// CORREZIONE: Importa checkPermission dal percorso corretto
const { checkPermission, verifyToken } = require('../utils/auth'); 

/**
 * @route   GET /api/quotes
 * @desc    Genera un nuovo pensiero motivatore
 * @access  Privato (richiede il permesso SITE_BUILDER)
 */
router.get('/', verifyToken, checkPermission('SITE_BUILDER'), async (req, res) => {
    try {
        const newQuote = await quoteService.generateQuote();
        res.status(200).json(newQuote);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;