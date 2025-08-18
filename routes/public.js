// #####################################################################
// # Rotte Pubbliche - v3.0 (Refactoring)
// # File: opero/routes/public.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { dbPool } = require('../config/db');

const router = express.Router();

// API per verificare un token di registrazione
router.get('/verify-token/:token', async (req, res) => {
    const { token } = req.params;
    const query = 'SELECT t.id_ditta, d.ragione_sociale FROM registration_tokens t JOIN ditte d ON t.id_ditta = d.id WHERE t.token = ? AND t.utilizzato = FALSE AND t.scadenza > NOW()';
    try {
        const [rows] = await dbPool.promise().query(query, [token]);
        if (rows.length > 0) {
            res.json({ success: true, ditta: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});


// API per la registrazione finale dell'utente
router.post('/register', async (req, res) => {
    const { token, email, password, nome, cognome } = req.body;
    if (!token || !email || !password || !nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Dati obbligatori mancanti.' });
    }
    const connection = await dbPool.promise().getConnection();
    try {
        await connection.beginTransaction();
        const [tokenRows] = await connection.query('SELECT id, id_ditta FROM registration_tokens WHERE token = ? AND utilizzato = FALSE AND scadenza > NOW()', [token]);
        if (tokenRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Link non valido o scaduto.' });
        }
        const { id_ditta } = tokenRows[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query('INSERT INTO utenti (email, password, nome, cognome, id_ditta, id_ruolo) VALUES (?, ?, ?, ?, ?, ?)', [email, hashedPassword, nome, cognome, id_ditta, 3]);
        await connection.query('UPDATE registration_tokens SET utilizzato = TRUE WHERE id = ?', [tokenRows[0].id]);
        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione completata! Ora puoi effettuare il login.' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ success: false, message: 'Errore del server durante la registrazione.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
