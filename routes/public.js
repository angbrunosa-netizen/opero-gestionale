// #####################################################################
// # Rotte Pubbliche - v1.2 (Fix Certificato SSL Email)
// # File: opero/routes/public.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { dbPool } = require('../config/db');

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
router.post('/register/:token', async (req, res) => {
    const { token } = req.params;
    const userData = req.body;

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [tokenRows] = await connection.query('SELECT * FROM registration_tokens WHERE token = ? AND utilizzato = 0 AND scadenza > NOW()', [token]);
        if (tokenRows.length === 0) {
            throw new Error('Link di registrazione non valido o scaduto.');
        }
        const dittaId = tokenRows[0].id_ditta;

        const [existingUser] = await connection.query('SELECT id FROM utenti WHERE email = ?', [userData.email]);
        if (existingUser.length > 0) {
            throw new Error('Un utente con questa email esiste già.');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // ++ FIX: Usa la colonna corretta 'privacy' invece di 'privacy_accettata' ++
        const query = `
            INSERT INTO utenti 
            (nome, cognome, email, password, id_ditta, id_ruolo, stato, codice_fiscale, telefono, indirizzo, citta, cap, privacy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userData.nome, userData.cognome, userData.email, hashedPassword,
            dittaId,
            2, // Ruolo di default: Ditta Admin (ID 2)
            'attivo',
            userData.codice_fiscale || null,
            userData.telefono || null,
            userData.indirizzo || null,
            userData.citta || null,
            userData.cap || null,
            userData.privacy === true // Assicura che sia un booleano per il DB
        ];

        await connection.query(query, values);

        await connection.query('UPDATE registration_tokens SET utilizzato = 1 WHERE token = ?', [token]);

        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione completata con successo! Verrai reindirizzato al login.' });

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

module.exports = router;
