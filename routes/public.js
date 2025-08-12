// #####################################################################
// # Rotte Pubbliche - v1.1 con Registrazione Completa
// # File: opero/routes/public.js
// #####################################################################

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const router = express.Router();
const dbPool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306 });

// API per verificare un token di registrazione
router.get('/verify-token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT t.id_ditta, d.ragione_sociale FROM registration_tokens t JOIN ditte d ON t.id_ditta = d.id WHERE t.token = ? AND t.utilizzato = FALSE AND t.scadenza > NOW()',
            [token]
        );
        connection.release();

        if (rows.length > 0) {
            res.json({ success: true, ditta: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});

// API per la registrazione finale dell'utente (POTENZIATA)
router.post('/register', async (req, res) => {
    const { token, email, password, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia } = req.body;
    if (!token || !email || !password || !nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome, Cognome, Email e Password sono obbligatori.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [tokenRows] = await connection.query(
            'SELECT id, id_ditta FROM registration_tokens WHERE token = ? AND utilizzato = FALSE AND scadenza > NOW()',
            [token]
        );

        if (tokenRows.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
        }
        const { id_ditta } = tokenRows[0];

        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(
            `INSERT INTO utenti 
            (email, password, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia, id_ditta, id_ruolo, livello, privacy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, hashedPassword, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia, id_ditta, 3, 50, true] // Ruolo 3 = Utente Interno
        );

        await connection.query('UPDATE registration_tokens SET utilizzato = TRUE WHERE id = ?', [tokenRows[0].id]);
        
        const [policyRows] = await connection.query('SELECT * FROM privacy_policies WHERE id_ditta = ?', [id_ditta]);
        if (policyRows.length > 0) {
            const policy = policyRows[0];
            const mailBody = policy.corpo_lettera.replace(/\[NOME_UTENTE\]/g, `${nome} ${cognome}`);
            let transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: 'confcalser@gmail.com', pass: 'vgjemofqzeuqqcmi' }, tls: { rejectUnauthorized: false } });
            await transporter.sendMail({
                from: `"${policy.responsabile_trattamento}" <confcalser@gmail.com>`,
                to: email, subject: 'Benvenuto e Informativa sulla Privacy', html: mailBody
            });
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione completata con successo! Ora puoi effettuare il login.' });

    } catch (error) {
        if (connection) await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ success: false, message: 'Errore del server durante la registrazione.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
