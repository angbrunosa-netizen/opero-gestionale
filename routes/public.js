// #####################################################################
// # Rotte Pubbliche - v1.2 (Fix Certificato SSL Email)
// # File: opero/routes/public.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { dbPool } = require('../config/db');
const { knex } = require('../config/db');
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

module.exports = router;
