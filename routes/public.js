// #####################################################################
// # Rotte Pubbliche - v2.4 (Controllo Policy Completo)
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
    
    let connection;
    try {
        if (process.env.NODE_ENV === 'production') {
            const result = await dbPool.query(query.replace('?', '$1'), [token]);
            if (result.rows.length > 0) {
                 res.json({ success: true, ditta: result.rows[0] });
            } else {
                 res.status(404).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
            }
        } else {
            connection = await dbPool.getConnection();
            const [rows] = await connection.query(query, [token]);
            if (rows.length > 0) {
                res.json({ success: true, ditta: rows[0] });
            } else {
                res.status(404).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
            }
        }
    } catch (error) {
        console.error("[VERIFY-TOKEN-ERROR]", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    } finally {
        if (connection) connection.release();
    }
});

// API per la registrazione finale dell'utente
router.post('/register', async (req, res) => {
    const { token, email, password, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia } = req.body;
    if (!token || !email || !password || !nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome, Cognome, Email e Password sono obbligatori.' });
    }

    if (process.env.NODE_ENV === 'production') {
        // --- Logica per PostgreSQL ---
        const client = await dbPool.connect();
        try {
            await client.query('BEGIN');

            const tokenResult = await client.query('SELECT id, id_ditta FROM registration_tokens WHERE token = $1 AND utilizzato = FALSE AND scadenza > NOW()', [token]);
            if (tokenResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Link di registrazione non valido o scaduto.' });
            }
            const { id_ditta } = tokenResult.rows[0];

            const hashedPassword = await bcrypt.hash(password, 10);
            await client.query(
                `INSERT INTO utenti (email, password, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia, id_ditta, id_ruolo, livello, privacy) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [email, hashedPassword, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia, id_ditta, 3, 50, true]
            );

            await client.query('UPDATE registration_tokens SET utilizzato = TRUE WHERE id = $1', [tokenResult.rows[0].id]);
            
            const policyResult = await client.query('SELECT * FROM privacy_policies WHERE id_ditta = $1', [id_ditta]);
            // --- MODIFICA DI SICUREZZA FINALE ---
            // Controlliamo che la policy, il corpo E il responsabile esistano.
            if (policyResult.rows.length > 0 && policyResult.rows[0].corpo_lettera && policyResult.rows[0].responsabile_trattamento) {
                const policy = policyResult.rows[0];
                const mailBody = policy.corpo_lettera.replace(/\[NOME_UTENTE\]/g, `${nome} ${cognome}`);
                let transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: 'confcalser@gmail.com', pass: 'vgjemofqzeuqqcmi' }, tls: { rejectUnauthorized: false } });
                await transporter.sendMail({
                    from: `"${policy.responsabile_trattamento}" <confcalser@gmail.com>`,
                    to: email, subject: 'Benvenuto e Informativa sulla Privacy', html: mailBody
                });
            }

            await client.query('COMMIT');
            res.status(201).json({ success: true, message: 'Registrazione completata con successo! Ora puoi effettuare il login.' });

        } catch (error) {
            console.error("[REGISTER-ERROR-PG]", error);
            if (client) {
                await client.query('ROLLBACK');
            }
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'Un utente con questa email esiste già.' });
            }
            res.status(500).json({ success: false, message: 'Errore del server durante la registrazione.' });
        } finally {
            if (client) client.release();
        }
    } else {
        // --- Logica per MySQL ---
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
                [email, hashedPassword, nome, cognome, codice_fiscale, telefono, indirizzo, citta, provincia, id_ditta, 3, 50, true]
            );

            await connection.query('UPDATE registration_tokens SET utilizzato = TRUE WHERE id = ?', [tokenRows[0].id]);
            
            const [policyRows] = await connection.query('SELECT * FROM privacy_policies WHERE id_ditta = ?', [id_ditta]);
            // --- MODIFICA DI SICUREZZA FINALE ---
            // Controlliamo che la policy, il corpo E il responsabile esistano.
          if (policyRows.length > 0) {
    const policy = policyRows[0];
    const mailBody = policy.corpo_lettera.replace(/\[NOME_UTENTE\]/g, `${nome} ${cognome}`);
    
    // QUESTA PARTE ORA È CORRETTA E DINAMICA
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true, // true per la porta 465, false per altre
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: 'Benvenuto e Informativa sulla Privacy',
        html: mailBody
    });
  }

            await connection.commit();
            res.status(201).json({ success: true, message: 'Registrazione completata con successo! Ora puoi effettuare il login.' });

        } catch (error) {
            console.error("[REGISTER-ERROR-MYSQL]", error);
            if (connection) await connection.rollback();
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Un utente con questa email esiste già.' });
            }
            res.status(500).json({ success: false, message: 'Errore del server durante la registrazione.' });
        } finally {
            if (connection) connection.release();
        }
    }
});

module.exports = router;
