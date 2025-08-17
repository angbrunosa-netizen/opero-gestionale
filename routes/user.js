// #####################################################################
// # Rotte per il Profilo Utente - v2.0 (Refactoring)
// # File: opero/routes/user.js
// #####################################################################
const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth'); // Usiamo il nuovo middleware

const router = express.Router();

// Applichiamo l'autenticazione a tutte le rotte di questo file
router.use(verifyToken);

// API per aggiornare la firma
router.patch('/signature', async (req, res) => {
    const { userId } = req.user; // Prendiamo l'ID utente dal token
    const { firma } = req.body;
    try {
        await dbPool.promise().query('UPDATE utenti SET firma = ? WHERE id = ?', [firma, userId]);
        res.json({ success: true, message: 'Firma aggiornata con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della firma.' });
    }
});

// API per aggiornare il profilo (nome e cognome)
router.patch('/profile', async (req, res) => {
    const { userId } = req.user; // Prendiamo l'ID utente dal token
    const { nome, cognome } = req.body;
    if (!nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome e cognome sono obbligatori.' });
    }
    try {
        await dbPool.promise().query('UPDATE utenti SET nome = ?, cognome = ? WHERE id = ?', [nome, cognome, userId]);
        res.json({ success: true, message: 'Profilo aggiornato con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento del profilo.' });
    }
});

module.exports = router;
