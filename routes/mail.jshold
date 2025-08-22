// #####################################################################
// # Rotte per il Modulo Posta - v2.1 (Refactoring Completo)
// # File: opero/routes/mail.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const Imap = require('imap-simple');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const stream = require('stream');

const router = express.Router();

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

// --- FUNZIONE HELPER PER OTTENERE LE CREDENZIALI ---
const getMailConfig = async (dittaId, accountId) => {
    const query = 'SELECT * FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?';
    const [rows] = await dbPool.promise().query(query, [accountId, dittaId]);
    if (rows.length === 0) throw new Error('Account email non trovato o non autorizzato.');
    const account = rows[0];
    
    const decryptedPass = decrypt(account.auth_pass);
    const tlsOptions = { rejectUnauthorized: false };

    return {
        imap: { user: account.auth_user, password: decryptedPass, host: account.imap_host, port: account.imap_port, tls: true, authTimeout: 10000, tlsOptions },
        smtp: { host: account.smtp_host, port: account.smtp_port, secure: account.smtp_port == 465, auth: { user: account.auth_user, pass: decryptedPass }, tls: tlsOptions },
        account: { name: account.nome_account, email: account.email_address }
    };
};

// ====================================================================
// ROTTE PROTETTE
// ====================================================================

// --- GET (Lista degli account email a cui l'utente ha accesso) ---
router.get('/my-mail-accounts', verifyToken, async (req, res) => {
    const { userId, dittaId } = req.user;
    try {
        const query = `
            SELECT dma.id, dma.nome_account, dma.email_address 
            FROM ditta_mail_accounts dma
            JOIN utente_mail_accounts uma ON dma.id = uma.id_mail_account
            WHERE uma.id_utente = ? AND dma.id_ditta = ?
            ORDER BY dma.nome_account
        `;
        const [rows] = await dbPool.promise().query(query, [userId, dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli account email.' });
    }
});

// --- GET (Lista delle email per un account specifico) ---
router.get('/emails', verifyToken, async (req, res) => {
    const { userId, dittaId } = req.user;
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search(['ALL', ['!DELETED']], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true });
        imapConnection.end();
        
        const [readStatuses] = await dbPool.promise().query('SELECT email_uid FROM stati_lettura WHERE id_utente = ?', [userId]);
        const [hiddenStatuses] = await dbPool.promise().query('SELECT email_uid FROM email_nascoste WHERE id_utente = ?', [userId]);
        const readUids = new Set(readStatuses.map(status => status.email_uid.toString()));
        const hiddenUids = new Set(hiddenStatuses.map(status => status.email_uid.toString()));
        
        const emails = messages
            .filter(item => !hiddenUids.has(item.attributes.uid.toString()))
            .map(item => {
                const header = item.parts.find(part => part.which.includes('HEADER')).body;
                return { 
                    uid: item.attributes.uid, 
                    from: header.from ? header.from[0] : 'N/D', 
                    subject: header.subject ? header.subject[0] : 'Nessun Oggetto', 
                    date: header.date ? header.date[0] : 'N/D', 
                    read: readUids.has(item.attributes.uid.toString()) 
                };
            }).reverse();
            
        res.json({ success: true, emails: emails.slice(0, 50) }); // Limita a 50 email per performance
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare le email.', error: error.message });
    }
});

// --- GET (Dettaglio di una singola email) ---
router.get('/emails/:uid', verifyToken, async (req, res) => {
    const { userId, dittaId } = req.user;
    const { uid } = req.params;
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search([['UID', uid]], { bodies: [''] });
        imapConnection.end();

        if (messages.length === 0) return res.status(404).json({ success: false, message: 'Email non trovata.' });
        
        const fullMessageBody = messages[0].parts.find(part => part.which === '').body;
        const parsedEmail = await simpleParser(fullMessageBody);
        
        await dbPool.promise().query('INSERT IGNORE INTO stati_lettura (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        
        res.json({ 
            success: true, 
            email: { 
                uid: uid, 
                from: parsedEmail.from.text, 
                subject: parsedEmail.subject, 
                date: parsedEmail.date, 
                body: parsedEmail.html || parsedEmail.textAsHtml,
                attachments: parsedEmail.attachments.map(att => ({ filename: att.filename, contentType: att.contentType, size: att.size })) 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare il dettaglio email.', error: error.message });
    }
});

// --- POST (Invia una email) ---
router.post('/send-email', verifyToken, upload.array('attachments'), async (req, res) => {
    const { userId, dittaId } = req.user;
    const { to, subject, text, accountId } = req.body;
    if (!accountId) return res.status(400).json({ success: false, message: "ID account mittente non specificato." });

    const connection = await dbPool.promise().getConnection();
    try {
        const { smtp: smtpConfig, account: mailAccount } = await getMailConfig(dittaId, accountId);
        const [userRows] = await connection.query('SELECT nome, cognome FROM utenti WHERE id = ?', [userId]);
        const user = userRows[0] || {};

        const senderDisplayName = (user.nome && user.cognome) ? `${user.nome} ${user.cognome}`.trim() : mailAccount.name;
        const fromAddress = `"${senderDisplayName}" <${mailAccount.email}>`;

        await connection.beginTransaction();

        const trackingId = uuidv4();
        const [emailResult] = await connection.query(
            'INSERT INTO email_inviate (id_utente_mittente, destinatari, oggetto, corpo, tracking_id) VALUES (?, ?, ?, ?, ?)',
            [userId, to, subject, text, trackingId]
        );
        const sentEmailId = emailResult.insertId;

        let attachmentLinks = '';
        if (req.files && req.files.length > 0) {
            attachmentLinks = '<p><strong>Allegati:</strong></p><ul>';
            for (const file of req.files) {
                const downloadId = uuidv4();
                await connection.query(
                    'INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, download_id) VALUES (?, ?, ?, ?)',
                    [sentEmailId, file.originalname, file.path, downloadId]
                );
                const downloadUrl = `${process.env.PUBLIC_API_URL || 'http://localhost:3001'}/api/track/download/${downloadId}`;
                attachmentLinks += `<li><a href="${downloadUrl}">${file.originalname}</a></li>`;
            }
            attachmentLinks += '</ul>';
        }
        
        const trackingPixel = `<img src="${process.env.PUBLIC_API_URL || 'http://localhost:3001'}/api/track/open/${trackingId}" width="1" height="1" alt="">`;
        const finalHtmlBody = text + attachmentLinks + trackingPixel;

        let transporter = nodemailer.createTransport(smtpConfig);
        await transporter.sendMail({ from: fromAddress, to, subject, html: finalHtmlBody });
        
        await connection.commit();
        res.json({ success: true, message: 'Email inviata con successo!' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: "Errore durante l'invio dell'email.", error: error.message });
    } finally {
        connection.release();
    }
});

// --- GET (Posta Inviata) ---
router.get('/sent-emails', verifyToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const [sentEmails] = await dbPool.promise().query(
            'SELECT id, destinatari, oggetto, corpo, data_invio, aperta, data_prima_apertura FROM email_inviate WHERE id_utente_mittente = ? ORDER BY data_invio DESC',
            [userId]
        );
        for (let email of sentEmails) {
            const [attachments] = await dbPool.promise().query(
                'SELECT nome_file_originale, scaricato FROM allegati_tracciati WHERE id_email_inviata = ?',
                [email.id]
            );
            email.attachments = attachments;
        }
        res.json({ success: true, sentEmails });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare la posta inviata.' });
    }
});


module.exports = router;
