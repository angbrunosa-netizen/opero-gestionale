// #####################################################################
// # Rotte per la Posta Elettronica - v5.0 (Logica DB Completa e Stabile)
// # File: opero/routes/mail.js
// #####################################################################

const express = require('express');
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

// --- MODIFICA CHIAVE: Import della connessione centralizzata ---
const { dbPool } = require('../config/db');

const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://localhost:3001';

// --- SETUP CRITTOGRAFIA ---
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_SECRET || 'una-chiave-molto-segreta-per-opero', 'salt', 32);
const IV_LENGTH = 16;

function decrypt(text) {
    try {
        if (!text || typeof text !== 'string' || !text.includes(':')) {
             throw new Error("Invalid encrypted text format.");
        }
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error.message);
        throw new Error("Impossibile decifrare la password.");
    }
}

// --- SETUP UPLOADS ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });


// --- FUNZIONE HELPER PER OTTENERE LE CREDENZIALI ---
const getMailConfig = async (dittaId, accountId) => {
    const query = 'SELECT * FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?';
    let account;
    let connection;

    try {
        if (process.env.NODE_ENV === 'production') {
            const result = await dbPool.query(query.replace(/\?/g, (m, i) => `$${i + 1}`), [accountId, dittaId]);
            if (result.rows.length === 0) throw new Error('Account email non trovato o non autorizzato.');
            account = result.rows[0];
        } else {
            connection = await dbPool.getConnection();
            const [rows] = await connection.query(query, [accountId, dittaId]);
            if (rows.length === 0) throw new Error('Account email non trovato o non autorizzato.');
            account = rows[0];
        }
    } finally {
        if (connection) connection.release();
    }
    
    const decryptedPass = decrypt(account.auth_pass);
    const tlsOptions = { rejectUnauthorized: false };

    return {
        imap: { user: account.auth_user, password: decryptedPass, host: account.imap_host, port: account.imap_port, tls: true, authTimeout: 10000, tlsOptions },
        smtp: { host: account.smtp_host, port: account.smtp_port, secure: account.smtp_port == 465, auth: { user: account.auth_user, pass: decryptedPass }, tls: tlsOptions },
        account: { name: account.nome_account, email: account.email_address }
    };
};


// API per leggere la lista delle email
router.get('/emails', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { accountId } = req.query;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    let connection;
    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search(['ALL', ['!DELETED']], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, markSeen: false });
        imapConnection.end();
        
        let readUids = new Set();
        let hiddenUids = new Set();

        if (process.env.NODE_ENV === 'production') {
            const readStatusesResult = await dbPool.query('SELECT email_uid FROM stati_lettura WHERE id_utente = $1', [userId]);
            const hiddenStatusesResult = await dbPool.query('SELECT email_uid FROM email_nascoste WHERE id_utente = $1', [userId]);
            readUids = new Set(readStatusesResult.rows.map(status => status.email_uid.toString()));
            hiddenUids = new Set(hiddenStatusesResult.rows.map(status => status.email_uid.toString()));
        } else {
            connection = await dbPool.getConnection();
            const [readStatuses] = await connection.query('SELECT email_uid FROM stati_lettura WHERE id_utente = ?', [userId]);
            const [hiddenStatuses] = await connection.query('SELECT email_uid FROM email_nascoste WHERE id_utente = ?', [userId]);
            readUids = new Set(readStatuses.map(status => status.email_uid.toString()));
            hiddenUids = new Set(hiddenStatuses.map(status => status.email_uid.toString()));
        }
        
        const emails = messages
            .filter(item => !hiddenUids.has(item.attributes.uid.toString()))
            .map(item => {
                const header = item.parts.find(part => part.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)').body;
                return { uid: item.attributes.uid, from: header.from ? header.from[0] : 'N/D', subject: header.subject ? header.subject[0] : 'Nessun Oggetto', date: header.date ? header.date[0] : 'N/D', read: readUids.has(item.attributes.uid.toString()) };
            }).reverse();
            
        res.json({ success: true, emails: emails.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare le email.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});


// API per nascondere un'email
router.post('/hide-email/:uid', checkAuth, async (req, res) => {
    const { userId } = req.userData;
    const { uid } = req.params;
    let connection;
    try {
        if (process.env.NODE_ENV === 'production') {
            await dbPool.query('INSERT INTO email_nascoste (id_utente, email_uid) VALUES ($1, $2) ON CONFLICT (id_utente, email_uid) DO NOTHING', [userId, uid]);
        } else {
            connection = await dbPool.getConnection();
            await connection.query('INSERT IGNORE INTO email_nascoste (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        }
        res.json({ success: true, message: `Email ${uid} nascosta per l'utente.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel nascondere l\'email.' });
    } finally {
        if (connection) connection.release();
    }
});

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


// API per ottenere gli account email a cui l'utente ha accesso
router.get('/my-mail-accounts', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    let connection;
    try {
        const query = `
            SELECT dma.id, dma.nome_account, dma.email_address 
            FROM ditta_mail_accounts dma
            JOIN utente_mail_accounts uma ON dma.id = uma.id_mail_account
            WHERE uma.id_utente = ? AND dma.id_ditta = ?
            ORDER BY dma.nome_account
        `;
        if (process.env.NODE_ENV === 'production') {
            const result = await dbPool.query(query.replace(/\?/g, (m, i) => `$${i + 1}`), [userId, dittaId]);
            res.json({ success: true, data: result.rows });
        } else {
            connection = await dbPool.getConnection();
            const [rows] = await connection.query(query, [userId, dittaId]);
            res.json({ success: true, data: rows });
        }
    } catch (error) {
        console.error("Errore nel recupero degli account email dell'utente:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero degli account email.' });
    } finally {
        if (connection) connection.release();
    }
});


// API per leggere una singola email
router.get('/emails/:uid', checkAuth, async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { uid } = req.params;
    const { accountId } = req.query;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    let connection;
    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search([['UID', uid]], { bodies: [''] });
        imapConnection.end();

        if (messages.length === 0) { return res.status(404).json({ success: false, message: 'Email non trovata.' }); }
        
        const fullMessageBody = messages[0].parts.find(part => part.which === '').body;
        const parsedEmail = await simpleParser(fullMessageBody);
        
        if (process.env.NODE_ENV === 'production') {
            await dbPool.query('INSERT INTO stati_lettura (id_utente, email_uid) VALUES ($1, $2) ON CONFLICT (id_utente, email_uid) DO NOTHING', [userId, uid]);
        } else {
            connection = await dbPool.getConnection();
            await connection.query('INSERT IGNORE INTO stati_lettura (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        }
        
        res.json({ success: true, email: { uid: uid, from: parsedEmail.from.text, subject: parsedEmail.subject, date: parsedEmail.date, body: parsedEmail.html || parsedEmail.textAsHtml || 'Nessun corpo del testo trovato.', from_structured: parsedEmail.from.value, to_structured: parsedEmail.to ? parsedEmail.to.value : [], cc_structured: parsedEmail.cc ? parsedEmail.cc.value : [], attachments: parsedEmail.attachments.map(att => ({ filename: att.filename, contentType: att.contentType, size: att.size })) } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare il dettaglio email.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// API per scaricare allegati
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
        
        res.setHeader('Content-disposition', 'attachment; filename=' + encodeURIComponent(attachment.filename));
        res.setHeader('Content-type', attachment.contentType);
        const bufferStream = new stream.PassThrough();
        bufferStream.end(attachment.content);
        bufferStream.pipe(res);
    } catch (error) {
        console.error("Errore download allegato:", error);
        res.status(500).json({ success: false, message: 'Errore nel recuperare l\'allegato.' });
    }
});

// API per inviare email
router.post('/send-email', checkAuth, upload.array('attachments'), async (req, res) => {
    const { userId, dittaId } = req.userData;
    const { to, subject, text, accountId } = req.body;
    const files = req.files;

    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account mittente non specificato." });

    const client = process.env.NODE_ENV === 'production' ? await dbPool.connect() : await dbPool.getConnection();
    
    try {
        const { smtp: smtpConfig, account: mailAccount } = await getMailConfig(dittaId, accountId);
        
        const userQuery = 'SELECT nome, cognome FROM utenti WHERE id = ?';
        let user;
        if (process.env.NODE_ENV === 'production') {
            const userResult = await client.query(userQuery.replace('?', '$1'), [userId]);
            user = userResult.rows[0] || {};
        } else {
            const [userRows] = await client.query(userQuery, [userId]);
            user = userRows[0] || {};
        }

        const senderDisplayName = (user.nome && user.cognome) ? `${user.nome} ${user.cognome}`.trim() : mailAccount.name;
        const fromAddress = `"${senderDisplayName}" <${mailAccount.email}>`;

        await (process.env.NODE_ENV === 'production' ? client.query('BEGIN') : client.beginTransaction());

        const trackingId = uuidv4();
        const emailInsertQuery = 'INSERT INTO email_inviate (id_utente_mittente, destinatari, oggetto, corpo, tracking_id) VALUES (?, ?, ?, ?, ?)';
        let sentEmailId;

        if (process.env.NODE_ENV === 'production') {
            const emailResult = await client.query(emailInsertQuery.replace(/\?/g, (m, i) => `$${i + 1}`) + ' RETURNING id', [userId, to, subject, text, trackingId]);
            sentEmailId = emailResult.rows[0].id;
        } else {
            const [emailResult] = await client.query(emailInsertQuery, [userId, to, subject, text, trackingId]);
            sentEmailId = emailResult.insertId;
        }

        let attachmentLinks = '';
        if (files && files.length > 0) {
            attachmentLinks = '<p><strong>Allegati disponibili per il download:</strong></p><ul>';
            const attachmentQuery = 'INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, tipo_file, dimensione_file, download_id) VALUES (?, ?, ?, ?, ?, ?)';
            for (const file of files) {
                const downloadId = uuidv4();
                const values = [sentEmailId, file.originalname, file.path, file.mimetype, file.size, downloadId];
                if (process.env.NODE_ENV === 'production') {
                    await client.query(attachmentQuery.replace(/\?/g, (m, i) => `$${i + 1}`), values);
                } else {
                    await client.query(attachmentQuery, values);
                }
                const downloadUrl = `${PUBLIC_API_URL}/api/track/download/${downloadId}`;
                attachmentLinks += `<li><a href="${downloadUrl}">${file.originalname}</a></li>`;
            }
            attachmentLinks += '</ul>';
        }
        
        const trackingPixel = `<img src="${PUBLIC_API_URL}/api/track/open/${trackingId}" width="1" height="1" alt="">`;
        const finalHtmlBody = text + attachmentLinks + trackingPixel;

        let transporter = nodemailer.createTransport(smtpConfig);
        await transporter.sendMail({ from: fromAddress, to, subject, html: finalHtmlBody });
        
        await (process.env.NODE_ENV === 'production' ? client.query('COMMIT') : client.commit());
        res.json({ success: true, message: 'Email inviata con successo!' });
    } catch (error) {
        await (process.env.NODE_ENV === 'production' ? client.query('ROLLBACK') : client.rollback());
        console.error("Errore durante l'invio dell'email:", error);
        res.status(500).json({ success: false, message: "Errore durante l'invio dell'email.", error: error.message });
    } finally {
        if (client) client.release();
    }
});


// API per leggere la posta inviata
router.get('/sent-emails', checkAuth, async (req, res) => {
    const userId = req.userData.userId;
    let connection;
    try {
        const sentEmailsQuery = 'SELECT id, destinatari, oggetto, corpo, data_invio, aperta, data_prima_apertura, tracking_id FROM email_inviate WHERE id_utente_mittente = ? ORDER BY data_invio DESC';
        const attachmentsQuery = 'SELECT nome_file_originale, scaricato FROM allegati_tracciati WHERE id_email_inviata = ?';
        
        let sentEmails;
        if (process.env.NODE_ENV === 'production') {
            const sentEmailsResult = await dbPool.query(sentEmailsQuery.replace('?', '$1'), [userId]);
            sentEmails = sentEmailsResult.rows;
            for (let email of sentEmails) {
                const attachmentsResult = await dbPool.query(attachmentsQuery.replace('?', '$1'), [email.id]);
                email.attachments = attachmentsResult.rows;
            }
        } else {
            connection = await dbPool.getConnection();
            const [sentEmailsRows] = await connection.query(sentEmailsQuery, [userId]);
            sentEmails = sentEmailsRows;
            for (let email of sentEmails) {
                const [attachments] = await connection.query(attachmentsQuery, [email.id]);
                email.attachments = attachments;
            }
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
