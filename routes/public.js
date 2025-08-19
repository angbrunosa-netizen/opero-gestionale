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

        const [privacyRows] = await dbPool.query('SELECT corpo_lettera, responsabile_trattamento FROM privacy_policies WHERE id_ditta = ?', [dittaId]);
        if (privacyRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Privacy policy non trovata per questa ditta.' });
        }

        res.json({ success: true, privacy: privacyRows[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});

// --- POST (Registra un nuovo utente) ---
router.post('/register/:token', async (req, res) => {
    const { token } = req.params;
    const { email, password, ...userData } = req.body;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [tokenRows] = await connection.query('SELECT * FROM registration_tokens WHERE token = ? AND utilizzato = 0 AND scadenza > NOW()', [token]);
        if (tokenRows.length === 0) {
            throw new Error('Link non valido o scaduto.');
        }
        const dittaId = tokenRows[0].id_ditta;

        // Recupera il nome della ditta che ha invitato l'utente
        const [dittaRows] = await connection.query('SELECT ragione_sociale FROM ditte WHERE id = ?', [dittaId]);
        const nomeDittaInvitante = dittaRows.length > 0 ? dittaRows[0].ragione_sociale : 'una nostra azienda partner';

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();

        const newUser = {
            ...userData,
            email,
            password: hashedPassword,
            id_ditta: dittaId,
            id_ruolo: 4, 
            livello: 1,
            Codice_Tipo_Utente: 2,
            privacy: 0,
            attivo: 1,
            verification_token: verificationToken
        };

        await connection.query('INSERT INTO utenti SET ?', newUser);
        await connection.query('UPDATE registration_tokens SET utilizzato = 1 WHERE token = ?', [token]);

        // Configurazione del transporter di Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_PORT == 465,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        const verificationLink = `http://localhost:3001/api/public/verify-email/${verificationToken}`;
        
        // ## NUOVO CORPO DELL'EMAIL ##
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: email,
            subject: 'Benvenuto in Opero! Conferma la tua registrazione',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Benvenuto nella Community del Gestionale Opero!</h2>
                    <p>Ciao ${userData.nome},</p>
                    <p>Sei stato invitato da <strong>${nomeDittaInvitante}</strong>. Dopo la conferma del link qui sotto, potrai accedere ai servizi che ha attivato per te.</p>
                    <p>Ricordati che Opero ha una serie di servizi gratuiti per tutti i suoi utenti e altri ne saranno inseriti ogni giorno. Salva i tuoi dati di accesso ed il nostro sito <a href="http://www.operogo.it">www.operogo.it</a> tra i tuoi preferiti e resta in contatto!</p>
                    
                    <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">I tuoi dati di accesso:</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password:</strong> ${password}</p>
                    </div>

                    <p>Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Conferma la tua Email</a>
                    <p style="font-size: 0.9em; color: #666;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser: ${verificationLink}</p>
                </div>
            `
        });

        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione completata. Controlla la tua email per confermare.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore durante la registrazione:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore durante la registrazione.' });
    } finally {
        connection.release();
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
