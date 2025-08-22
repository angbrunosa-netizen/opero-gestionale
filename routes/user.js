// #####################################################################
// # Rotte per il Profilo Utente - v2.1 (Fix Stabilità e Coerenza)
// # File: opero/routes/user.js
// #####################################################################
const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// Applichiamo l'autenticazione a tutte le rotte di questo file
router.use(verifyToken);

// API per aggiornare la firma
router.patch('/signature', async (req, res) => {
    // FIX 1: Il payload del token usa 'id', non 'userId'.
    const { id: userId } = req.user;
    const { firma } = req.body;
    try {
        // FIX 2: dbPool è già promise-ready, non serve .promise()
        await dbPool.query('UPDATE utenti SET firma = ? WHERE id = ?', [firma, userId]);
        res.json({ success: true, message: 'Firma aggiornata con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento firma:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della firma.' });
    }
});

// API per aggiornare il profilo (nome e cognome)
router.patch('/profile', async (req, res) => {
    // FIX 1: Il payload del token usa 'id', non 'userId'.
    const { id: userId } = req.user;
    const { nome, cognome } = req.body;
    if (!nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome e cognome sono obbligatori.' });
    }
    try {
        // FIX 2: dbPool è già promise-ready, non serve .promise()
        await dbPool.query('UPDATE utenti SET nome = ?, cognome = ? WHERE id = ?', [nome, cognome, userId]);
        res.json({ success: true, message: 'Profilo aggiornato con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento profilo:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento del profilo.' });
    }
});

module.exports = router;
