// #####################################################################
// # Rotte per la Posta Elettronica - v3.2 (con Fix Nascondi Email)
// # File: opero/routes/mail.js
// #####################################################################

const express = require('express');
const mysql = require('mysql2/promise');
const Imap = require('imap-simple');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const stream = require('stream');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { checkAuth } = require('../utils/auth');
const crypto = require('crypto');
const router = express.Router();

const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://localhost:3001';

// --- SETUP CRITTOGRAFIA ---
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.scryptSync('una-chiave-molto-segreta-per-opero', 'salt', 32);
const IV_LENGTH = 16;

function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Impossibile decifrare la password.");
    }
}

// --- SETUP INIZIALE ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

// --- DATABASE POOL ---
const dbPool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306 });

// --- FUNZIONE HELPER PER OTTENERE LE CREDENZIALI ---
const getMailConfig = async (dittaId, accountId) => {
    const connection = await dbPool.getConnection();
    const [rows] = await connection.query(
        'SELECT * FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?',
        [accountId, dittaId]
    );
    connection.release();
    if (rows.length === 0) {
        throw new Error('Account email non trovato o non autorizzato.');
    }
    const account = rows[0];
    const decryptedPass = decrypt(account.auth_pass);
    
    const tlsOptions = { rejectUnauthorized: false };

    return {
        imap: { user: account.auth_user, password: decryptedPass, host: account.imap_host, port: account.imap_port, tls: true, authTimeout: 10000, tlsOptions },
        smtp: { host: account.smtp_host, port: account.smtp_port, secure: account.smtp_port == 465, auth: { user: account.auth_user, pass: decryptedPass }, tls: tlsOptions },
        account: {
            name: account.nome_account,
            email: account.email_address
        }
    };
};

// --- API ROUTES PER LA POSTA ---

// API per leggere la lista delle email (MODIFICATA)
router.get('/emails', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { accountId } = req.query;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search(['ALL', ['!DELETED']], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, markSeen: false });
        imapConnection.end();
        
        const dbConnection = await dbPool.getConnection();
        const [readStatuses] = await dbConnection.query('SELECT email_uid FROM stati_lettura WHERE id_utente = ?', [userId]);
        const [hiddenStatuses] = await dbConnection.query('SELECT email_uid FROM email_nascoste WHERE id_utente = ?', [userId]);
        dbConnection.release();
        
        const readUids = new Set(readStatuses.map(status => status.email_uid.toString()));
        // CORREZIONE: Converte gli UID dal DB in stringhe per un confronto affidabile
        const hiddenUids = new Set(hiddenStatuses.map(status => status.email_uid.toString()));
        
        const emails = messages
            .filter(item => !hiddenUids.has(item.attributes.uid.toString()))
            .map(item => {
                const header = item.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)').body;
                return { uid: item.attributes.uid, from: header.from ? header.from[0] : 'N/D', subject: header.subject ? header.subject[0] : 'Nessun Oggetto', date: header.date ? header.date[0] : 'N/D', read: readUids.has(item.attributes.uid.toString()) };
            }).reverse();
            
        res.json({ success: true, emails: emails.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare le email.', error: error.message });
    }
});
// --- NUOVA API PER NASCONDERE UN'EMAIL ---
// Questa rotta è usata dal cestino grigio e nasconde l'email solo per l'utente corrente.
router.post('/hide-email/:uid', checkAuth, async (req, res) => {
    const { userId } = req.userData;
    const { uid } = req.params;
    try {
        const connection = await dbPool.getConnection();
        await connection.query('INSERT IGNORE INTO email_nascoste (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        connection.release();
        console.log(`[INFO] Email UID ${uid} nascosta per utente ID ${userId}.`);
        res.json({ success: true, message: `Email ${uid} nascosta per l'utente.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel nascondere l\'email.' });
    }
});

// --- API PER CANCELLARE (NASCONDERE O ELIMINARE) UN'EMAIL ---
// Questa rotta è usata solo dal cestino ROSSO degli admin.
// API per eliminare permanentemente un'email (solo admin)
router.delete('/emails/:uid', checkAuth, async (req, res) => {
    const { dittaId, userLevel } = req.userData;
    const { uid } = req.params;
    const { accountId } = req.query;

    if (!accountId) {
        return res.status(400).json({ success: false, message: "ID dell'account non specificato." });
    }

    if (userLevel > 90) {
        try {
            const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
            const connection = await Imap.connect({ imap: imapConfig });
            await connection.openBox('INBOX');
            
            // CORREZIONE: Utilizza la funzione deleteMessage della libreria,
            // che gestisce internamente sia il flag 'Deleted' sia l'operazione 'expunge'.
            await connection.deleteMessage(uid);
            
            connection.end();
            res.json({ success: true, message: `Email ${uid} eliminata permanentemente dal server.` });
        } catch (error) {
            console.error("Errore durante l'eliminazione permanente dell'email:", error);
            res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione permanente dell\'email.' });
        }
    } else {
        return res.status(403).json({ success: false, message: "Non hai i permessi per eliminare permanentemente le email." });
    }
});



router.get('/my-mail-accounts', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT dma.id, dma.nome_account, dma.email_address 
            FROM ditta_mail_accounts dma
            JOIN utente_mail_accounts uma ON dma.id = uma.id_mail_account
            WHERE uma.id_utente = ? AND dma.id_ditta = ?
            ORDER BY dma.nome_account
        `;
        const [rows] = await connection.query(query, [userId, dittaId]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recupero degli account email dell'utente:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero degli account email.' });
    }
});

router.get('/emails/:uid', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { uid } = req.params;
    const { accountId } = req.query;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search([['UID', uid]], { bodies: [''] });
        imapConnection.end();

        if (messages.length === 0) { return res.status(404).json({ success: false, message: 'Email non trovata.' }); }
        
        const fullMessageBody = messages[0].parts.find(part => part.which === '').body;
        const parsedEmail = await simpleParser(fullMessageBody);
        
        const dbConnection = await dbPool.getConnection();
        await dbConnection.query('INSERT IGNORE INTO stati_lettura (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        dbConnection.release();
        
        res.json({ success: true, email: { uid: uid, from: parsedEmail.from.text, subject: parsedEmail.subject, date: parsedEmail.date, body: parsedEmail.html || parsedEmail.textAsHtml || 'Nessun corpo del testo trovato.', from_structured: parsedEmail.from.value, to_structured: parsedEmail.to ? parsedEmail.to.value : [], cc_structured: parsedEmail.cc ? parsedEmail.cc.value : [], attachments: parsedEmail.attachments.map(att => ({ filename: att.filename, contentType: att.contentType, size: att.size })) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare il dettaglio email.', error: error.message });
    }
});

router.get('/emails/:uid/attachments/:filename', checkAuth, async (req, res) => {
    const { dittaId } = req.userData;
    const { uid, filename } = req.params;
    const { accountId } = req.query;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search([['UID', uid]], { bodies: [''] });
        imapConnection.end();

        if (messages.length === 0) { return res.status(404).json({ success: false, message: 'Email non trovata.' }); }
        
        const fullMessageBody = messages[0].parts.find(part => part.which === '').body;
        const parsedEmail = await simpleParser(fullMessageBody);
        const attachment = parsedEmail.attachments.find(att => att.filename === filename);
        
        if (!attachment) {
            return res.status(404).json({ success: false, message: 'Allegato non trovato.' });
        }
        
        res.setHeader('Content-disposition', 'attachment; filename=' + attachment.filename);
        res.setHeader('Content-type', attachment.contentType);
        const bufferStream = new stream.PassThrough();
        bufferStream.end(attachment.content);
        bufferStream.pipe(res);
    } catch (error) {
        console.error("Errore download allegato:", error);
        res.status(500).json({ success: false, message: 'Errore nel recuperare l\'allegato.' });
    }
});

// --- API per inviare email (MODIFICATA) ---
// API per inviare email (MODIFICATA)
router.post('/send-email', checkAuth, upload.array('attachments'), async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { to, subject, text, accountId } = req.body; // 'text' contiene il corpo HTML
    const files = req.files;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account mittente non specificato." });

    let dbConnection;
    try {
        const { smtp: smtpConfig, account: mailAccount } = await getMailConfig(dittaId, accountId);
        
        dbConnection = await dbPool.getConnection();

        const [userRows] = await dbConnection.query('SELECT nome, cognome FROM utenti WHERE id = ?', [userId]);
        const user = userRows[0] || {};

        const senderDisplayName = (user.nome && user.cognome) ? `${user.nome} ${user.cognome}`.trim() : mailAccount.name;
        const fromAddress = `"${senderDisplayName}" <${mailAccount.email}>`;

        await dbConnection.beginTransaction();

        const trackingId = uuidv4();
        // CORREZIONE: Aggiunto il campo 'corpo' all'inserimento nel database
        const [emailResult] = await dbConnection.query(
            'INSERT INTO email_inviate (id_utente_mittente, destinatari, oggetto, corpo, tracking_id) VALUES (?, ?, ?, ?, ?)', 
            [userId, to, subject, text, trackingId] // 'text' (il corpo) viene ora salvato
        );
        const sentEmailId = emailResult.insertId;

        let attachmentLinks = '';
        if (files && files.length > 0) {
            attachmentLinks = '<p><strong>Allegati disponibili per il download:</strong></p><ul>';
            for (const file of files) {
                const downloadId = uuidv4();
                await dbConnection.query('INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, tipo_file, dimensione_file, download_id) VALUES (?, ?, ?, ?, ?, ?)', [sentEmailId, file.originalname, file.path, file.mimetype, file.size, downloadId]);
                const downloadUrl = `${PUBLIC_API_URL}/api/track/download/${downloadId}`;
                attachmentLinks += `<li><a href="${downloadUrl}">${file.originalname}</a></li>`;
            }
            attachmentLinks += '</ul>';
        }
        
        const trackingPixel = `<img src="${PUBLIC_API_URL}/api/track/open/${trackingId}" width="1" height="1" alt="">`;
        const finalHtmlBody = text + attachmentLinks + trackingPixel;

        let transporter = nodemailer.createTransport(smtpConfig);
        await transporter.sendMail({ from: fromAddress, to, subject, html: finalHtmlBody });
        
        await dbConnection.commit();
        res.json({ success: true, message: 'Email inviata con successo!' });
    } catch (error) {
        if (dbConnection) await dbConnection.rollback();
        console.error("Errore durante l'invio dell'email:", error);
        res.status(500).json({ success: false, message: "Errore durante l'invio dell'email.", error: error.message });
    } finally {
        if (dbConnection) dbConnection.release();
    }
});


router.get('/sent-emails', checkAuth, async (req, res) => {
    const userId = req.userData.userId;
    let connection;
    try {
        connection = await dbPool.getConnection();
        // CORREZIONE: Seleziona esplicitamente anche il campo 'corpo'
        const [sentEmails] = await connection.query('SELECT id, destinatari, oggetto, corpo, data_invio, aperta, data_prima_apertura, tracking_id FROM email_inviate WHERE id_utente_mittente = ? ORDER BY data_invio DESC', [userId]);
        for (let email of sentEmails) {
            const [attachments] = await connection.query('SELECT nome_file_originale, scaricato FROM allegati_tracciati WHERE id_email_inviata = ?', [email.id]);
            email.attachments = attachments;
        }
        res.json({ success: true, sentEmails: sentEmails });
    } catch (error) {
        console.error('Errore nel recuperare la posta inviata:', error);
        res.status(500).json({ success: false, message: 'Errore nel recuperare la posta inviata.' });
    } finally {
        if (connection) connection.release();
    }
});



module.exports = router;
