// #####################################################################
// # Rotte per il Profilo Utente
// # File: opero/routes/user.js
// #####################################################################
const express = require('express');
const mysql = require('mysql2/promise');
const { checkAuth } = require('../utils/auth'); // <-- Import corretto

const router = express.Router();

const dbPool = mysql.createPool({
    host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306
});

// API per aggiornare la firma
router.patch('/signature', checkAuth, async (req, res) => {
    const userId = req.userData.userId;
    const { firma } = req.body;
    try {
        const connection = await dbPool.getConnection();
        await connection.query('UPDATE utenti SET firma = ? WHERE id = ?', [firma, userId]);
        connection.release();
        res.json({ success: true, message: 'Firma aggiornata con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della firma.' });
    }
});

// API per aggiornare il profilo (nome e cognome)
router.patch('/profile', checkAuth, async (req, res) => {
    const userId = req.userData.userId;
    const { nome, cognome } = req.body;
    if (!nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome e cognome sono obbligatori.' });
    }
    try {
        const connection = await dbPool.getConnection();
        await connection.query('UPDATE utenti SET nome = ?, cognome = ? WHERE id = ?', [nome, cognome, userId]);
        connection.release();
        res.json({ success: true, message: 'Profilo aggiornato con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento del profilo.' });
    }
});

module.exports = router;
