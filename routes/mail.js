// #####################################################################
// # Rotte per il Modulo Posta - v3.0 (Ripristinato)
// # File: opero/routes/mail.js
// #####################################################################

const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const Imap = require('imap-simple');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const s3Service = require('../services/s3Service');
const emailTrackingService = require('../services/emailTrackingService');
const enhancedGmailTracking = require('../services/enhancedGmailTracking');

const router = express.Router();

// Funzione per generare pixel di tracking compatibili con Gmail
function generateTrackingPixel(trackingId) {
    const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3001';

    // Multi-strategy tracking pixel per massima compatibilità
    return `
<!-- Multi-Strategy Email Tracking Pixel -->
<div style="display:none; white-space:nowrap; font:0px/0 sans-serif;">
    <!-- Strategy 1: Standard invisible image -->
    <img src="${baseUrl}/api/track/open/${trackingId}"
         width="1" height="1"
         alt="" border="0"
         style="display:block; width:1px; height:1px; border:none; margin:0; padding:0;" />

    <!-- Strategy 2: Background image trick (Gmail-friendly) -->
    <div style="width:1px; height:1px; background-image:url('${baseUrl}/api/track/open/${trackingId}'); background-repeat:no-repeat; display:block;"></div>

    <!-- Strategy 3: Table-based pixel (maximum compatibility) -->
    <table border="0" cellpadding="0" cellspacing="0" width="1" height="1" style="display:block;">
        <tr>
            <td style="background-image:url('${baseUrl}/api/track/open/${trackingId}'); background-repeat:no-repeat; width:1px; height:1px; line-height:1px; font-size:1px;">
                <img src="${baseUrl}/api/track/open/${trackingId}"
                     style="display:block; width:1px; height:1px; border:none;" />
            </td>
        </tr>
    </table>
</div>
<!-- End Tracking Pixel -->`;
}

// Funzione per generare un fallback tracking basato su link
function generateTrackingLink(trackingId, text = 'Clicca qui se non visualizzi correttamente questa email') {
    const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3001';
    return `<div style="text-align:center; font-size:12px; color:#666; margin-top:20px; padding:10px; border-top:1px solid #eee;">
    <p style="margin:0;">${text}</p>
    <p style="margin:5px 0;">
        <a href="${baseUrl}/api/track/open/${trackingId}"
           style="color:#007bff; text-decoration:none; font-size:11px;">
            Apri email nel browser
        </a>
    </p>
</div>`;
}

// --- SETUP UPLOADS ---
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer memory storage per S3 upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max per allegato
    },
    fileFilter: (req, file, cb) => {
        // Filtra file potenzialmente pericolosi
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (dangerousExtensions.includes(fileExtension)) {
            return cb(new Error('Tipo di file non permesso'), false);
        }
        cb(null, true);
    }
});

// --- SETUP CRITTOGRAFIA (Standardizzato con il resto dell'app) ---
const secret = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_chars_!!';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
const IV_LENGTH = 16;

function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
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
    const [rows] = await dbPool.query('SELECT * FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?', [accountId, dittaId]);
    if (rows.length === 0) throw new Error('Account email non trovato.');
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
router.use(verifyToken);

// --- GET (Lista account email utente) ---
router.get('/my-mail-accounts', async (req, res) => {
    const { id: userId, id_ditta: dittaId } = req.user;
    try {
        const [rows] = await dbPool.query(`
            SELECT dma.id, dma.nome_account, dma.email_address 
            FROM ditta_mail_accounts dma
            JOIN utente_mail_accounts uma ON dma.id = uma.id_mail_account
            WHERE uma.id_utente = ? AND dma.id_ditta = ?`, [userId, dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore recupero account.' }); }
});


// --- GET (Lista delle email per un account specifico - AGGIORNATO) ---
router.get('/emails', async (req, res) => {
    const { id: userId, id_ditta: dittaId } = req.user;
    const { accountId } = req.query;
    if (!accountId) return res.status(400).json({ success: false, message: "ID dell'account non specificato." });

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        const messages = await imapConnection.search(['ALL', ['!DELETED']], { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true });
        imapConnection.end();
        
        const [readStatuses] = await dbPool.query('SELECT email_uid FROM stati_lettura WHERE id_utente = ?', [userId]);
        const [hiddenStatuses] = await dbPool.query('SELECT email_uid FROM email_nascoste WHERE id_utente = ?', [userId]);
        const readUids = new Set(readStatuses.map(status => status.email_uid.toString()));
        const hiddenUids = new Set(hiddenStatuses.map(status => status.email_uid.toString()));
        
        const emails = messages
            .filter(item => !hiddenUids.has(item.attributes.uid.toString())) // Filtra le email nascoste
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
            
        res.json({ success: true, emails: emails.slice(0, 50) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recuperare le email.', error: error.message });
    }
});

// --- GET (Dettaglio di una singola email) ---
router.get('/emails/:uid', async (req, res) => {
    const { id: userId, id_ditta: dittaId } = req.user;
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
        
        await dbPool.query('INSERT IGNORE INTO stati_lettura (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        
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
router.post('/send-email', upload.array('attachments'), async (req, res) => {
    const { id: userId, id_ditta: dittaId } = req.user;
    const { to, cc, bcc, subject, text, accountId } = req.body;
    if (!accountId) return res.status(400).json({ success: false, message: "ID account mittente non specificato." });

    const connection = await dbPool.getConnection();
    try {
        // Test connessione S3 all'inizio
        const s3Connected = await s3Service.testConnection();
        if (!s3Connected) {
            throw new Error('Servizio storage temporaneamente non disponibile');
        }

        const { smtp: smtpConfig, account: mailAccount } = await getMailConfig(dittaId, accountId);
        const [userRows] = await connection.query('SELECT nome, cognome FROM utenti WHERE id = ?', [userId]);
        const user = userRows[0] || {};
        const senderDisplayName = (user.nome && user.cognome) ? `${user.nome} ${user.cognome}`.trim() : mailAccount.name;
        const fromAddress = `"${senderDisplayName}" <${mailAccount.email}>`;

        await connection.beginTransaction();
        const trackingId = emailTrackingService.generateTrackingId();
        const [emailResult] = await connection.query(
            'INSERT INTO email_inviate (id_utente_mittente, destinatari, cc, bcc, oggetto, corpo, tracking_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, to, cc, bcc, subject, text, trackingId]
        );
        const sentEmailId = emailResult.insertId;

        let attachmentLinks = '';
        if (req.files && req.files.length > 0) {
            attachmentLinks = '<p><strong>Allegati:</strong></p><ul>';

            for (const file of req.files) {
                const downloadId = uuidv4();

                try {
                    // Genera percorso S3 univoco
                    const s3Key = s3Service.generateS3Path(dittaId, userId, file.originalname);

                    // Upload su S3
                    const uploadResult = await s3Service.uploadFile(file.buffer, s3Key, {
                        originalName: file.originalname,
                        contentType: file.mimetype,
                        uploadedBy: userId.toString(),
                        dittaId: dittaId.toString(),
                        emailId: sentEmailId.toString(),
                        size: file.size
                    });

                    // Genera URL di tracking
                    const trackingUrl = await s3Service.getTrackingUrl(downloadId, s3Key);

                    // Salva nel database
                    await connection.query(
                        'INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, download_id, dimensione_file) VALUES (?, ?, ?, ?, ?)',
                        [sentEmailId, file.originalname, s3Key, downloadId, file.size]
                    );

                    attachmentLinks += `<li><a href="${trackingUrl}" title="Dimensione: ${(file.size / 1024).toFixed(2)} KB">${file.originalname}</a></li>`;

                } catch (s3Error) {
                    console.error('Errore upload S3 per file', file.originalname, ':', s3Error);

                    // Fallback: salva localmente se S3 fallisce
                    const fallbackPath = path.join(UPLOADS_DIR, `${Date.now()}-${file.originalname}`);
                    fs.writeFileSync(fallbackPath, file.buffer);

                    await connection.query(
                        'INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, download_id, dimensione_file) VALUES (?, ?, ?, ?, ?)',
                        [sentEmailId, file.originalname, fallbackPath, downloadId, file.size]
                    );

                    const downloadUrl = `${process.env.PUBLIC_API_URL || 'http://localhost:3001'}/api/track/download/${downloadId}`;
                    attachmentLinks += `<li><a href="${downloadUrl}" title="Salvato localmente - Dimensione: ${(file.size / 1024).toFixed(2)} KB">${file.originalname}</a></li>`;
                }
            }
            attachmentLinks += '</ul>';
        }

        // Usa il servizio di tracking ultra-aggressivo per Gmail
        const primaryRecipient = to || (cc ? cc.split(',')[0] : null);
        const trackingHTML = enhancedGmailTracking.generateOptimizedTracking(trackingId, primaryRecipient);

        // Log della strategia usata per debugging
        emailTrackingService.logTrackingStrategy(primaryRecipient, trackingId,
            primaryRecipient ? emailTrackingService.determineStrategy(primaryRecipient) : 'standard');

        const finalHtmlBody = text + attachmentLinks + trackingHTML;

        let transporter = nodemailer.createTransport(smtpConfig);
        await transporter.sendMail({ from: fromAddress, to, cc, bcc, subject, html: finalHtmlBody });

        await connection.commit();
        res.json({
            success: true,
            message: 'Email inviata con successo!',
            attachments: req.files ? req.files.length : 0
        });
    } catch (error) {
        await connection.rollback();
        console.error('Errore invio email:', error);
        res.status(500).json({
            success: false,
            message: "Errore durante l'invio dell'email.",
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// --- GET (Posta Inviata) ---
router.get('/sent-emails', async (req, res) => {
    const { id: userId } = req.user;
    try {
        const [sentEmails] = await dbPool.query(
            'SELECT id, destinatari, oggetto, corpo, data_invio, aperta, data_prima_apertura FROM email_inviate WHERE id_utente_mittente = ? ORDER BY data_invio DESC',
            [userId]
        );
        for (let email of sentEmails) {
            const [attachments] = await dbPool.query(
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

// --- POST (Nascondi una email dalla vista dell'utente) ---
router.post('/hide-email/:uid', async (req, res) => {
    const { id: userId } = req.user;
    const { uid } = req.params;
    try {
        await dbPool.query('INSERT IGNORE INTO email_nascoste (id_utente, email_uid) VALUES (?, ?)', [userId, uid]);
        res.json({ success: true, message: 'Email nascosta con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'operazione.' });
    }
});

// --- DELETE (Elimina permanentemente una email dal server) ---
router.delete('/emails/:uid', async (req, res) => {
    const { id_ditta: dittaId, livello } = req.user;
    const { uid } = req.params;
    const { accountId } = req.query;

    if (livello <= 90) {
        return res.status(403).json({ success: false, message: 'Non hai i permessi per eliminare le email permanentemente.' });
    }

    try {
        const { imap: imapConfig } = await getMailConfig(dittaId, accountId);
        const imapConnection = await Imap.connect({ imap: imapConfig });
        await imapConnection.openBox('INBOX');
        await imapConnection.addFlags(uid, ['\\Deleted']);
        await imapConnection.expunge(); // Applica l'eliminazione
        imapConnection.end();
        res.json({ success: true, message: 'Email eliminata permanentemente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione dell\'email.', error: error.message });
    }
});


// =====================================================================
// ========================= NUOVA ROUTE ===============================
// =====================================================================
// <span style="color:green;">// NUOVO: Route per inviare email di sollecito e salvarle nella posta inviata</span>
router.post('/send-reminder', verifyToken, async (req, res) => {
    const { id_ditta: dittaId, id: userId } = req.user;
    const { accountId, recipientEmail, recipientName, partite, totalAmount } = req.body;

    if (!accountId || !recipientEmail || !partite || partite.length === 0) {
        return res.status(400).json({ success: false, message: "Dati mancanti per l'invio del sollecito." });
    }

    try {
        // 1. Recupera la configurazione dell'account email e i dati della ditta
        const [mailConfig, [dittaRows]] = await Promise.all([
            getMailConfig(dittaId, accountId),
            dbPool.query('SELECT ragione_sociale, p_iva FROM ditte WHERE id = ?', [dittaId])
        ]);

        if (dittaRows.length === 0) {
            throw new Error('Dati della ditta non trovati.');
        }
        const dittaInfo = dittaRows[0];

        // 2. Costruisci il corpo HTML dell'email
        const subject = `Sollecito di Pagamento / Payment Reminder - ${dittaInfo.ragione_sociale}`;
        const formattedTotal = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalAmount);
        
        const partiteHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nr. Documento</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Documento</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Scadenza</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Importo</th>
                    </tr>
                </thead>
                <tbody>
                    ${partite.map(p => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${p.numero_documento}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(p.data_documento).toLocaleDateString('it-IT')}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(p.data_scadenza).toLocaleDateString('it-IT')}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p.importo)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">TOTALE DOVUTO</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formattedTotal}</td>
                    </tr>
                </tfoot>
            </table>
        `;

        const bodyHtml = `
            <p>Spett.le ${recipientName},</p>
            <p>con la presente Le ricordiamo che alla data odierna risultano non ancora saldate le seguenti partite:</p>
            ${partiteHtml}
            <p>La preghiamo di voler provvedere al saldo quanto prima.</p>
            <p>In caso il pagamento sia già stato da Lei effettuato, La preghiamo di non tenere conto della presente comunicazione.</p>
            <p>Distinti saluti,</p>
            <p><strong>${dittaInfo.ragione_sociale}</strong><br>P.IVA: ${dittaInfo.p_iva}</p>
        `;

        // 3. Invia l'email
        const transporter = nodemailer.createTransport(mailConfig.smtp);
        const mailOptions = {
            from: `"${dittaInfo.ragione_sociale}" <${mailConfig.user}>`,
            to: recipientEmail,
            subject: subject,
            html: bodyHtml
        };
        const info = await transporter.sendMail(mailOptions);
        
        // 4. Salva l'email nella tabella della posta inviata per coerenza con il MailModule
        await dbPool.query(
            'INSERT INTO ditta_mail_inviate (id_ditta, id_utente, id_mail_account, message_id, destinatari, oggetto, corpo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [dittaId, userId, accountId, info.messageId, recipientEmail, subject, bodyHtml]
        );

        res.json({ success: true, message: 'Sollecito inviato con successo e salvato nella posta inviata.' });

    } catch (error) {
        console.error("Errore nell'invio del sollecito:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore del server durante l\'invio del sollecito.' });
    }
});

// --- POST (Invia email di sollecito) ---
router.post('/send-reminder', verifyToken, async (req, res) => {
    const { id_ditta: dittaId, id: userId } = req.user;
    const { accountId, recipientEmail, recipientName, partite, totalAmount } = req.body;

    if (!accountId || !recipientEmail || !partite || partite.length === 0) {
        return res.status(400).json({ success: false, message: "Dati mancanti per l'invio del sollecito." });
    }

    try {
        const [mailConfig, [dittaRows]] = await Promise.all([
            getMailConfig(dittaId, accountId),
            dbPool.query('SELECT ragione_sociale, p_iva FROM ditte WHERE id = ?', [dittaId])
        ]);
        if (dittaRows.length === 0) throw new Error('Dati della ditta non trovati.');
        
        const dittaInfo = dittaRows[0];
        const subject = `Sollecito di Pagamento / Payment Reminder - ${dittaInfo.ragione_sociale}`;
        const formattedTotal = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalAmount);
        
        const partiteHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead><tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nr. Documento</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Documento</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Data Scadenza</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Importo</th>
                </tr></thead>
                <tbody>${partite.map(p => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${p.numero_documento}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(p.data_documento).toLocaleDateString('it-IT')}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(p.data_scadenza).toLocaleDateString('it-IT')}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p.importo)}</td>
                    </tr>`).join('')}
                </tbody>
                <tfoot><tr>
                    <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">TOTALE DOVUTO</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formattedTotal}</td>
                </tr></tfoot>
            </table>`;

        const bodyHtml = `<p>Spett.le ${recipientName},</p><p>con la presente Le ricordiamo che alla data odierna risultano non ancora saldate le seguenti partite:</p>${partiteHtml}<p>La preghiamo di voler provvedere al saldo quanto prima.</p><p>In caso il pagamento sia già stato da Lei effettuato, La preghiamo di non tenere conto della presente comunicazione.</p><p>Distinti saluti,</p><p><strong>${dittaInfo.ragione_sociale}</strong><br>P.IVA: ${dittaInfo.p_iva}</p>`;
        
        const transporter = nodemailer.createTransport(mailConfig.smtp);
        const mailOptions = {
            from: `"${dittaInfo.ragione_sociale}" <${mailConfig.user}>`,
            to: recipientEmail,
            subject: subject,
            html: bodyHtml
        };
        const info = await transporter.sendMail(mailOptions);
        
        await dbPool.query(
            'INSERT INTO ditta_mail_inviate (id_ditta, id_utente, id_mail_account, message_id, destinatari, oggetto, corpo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [dittaId, userId, accountId, info.messageId, recipientEmail, subject, bodyHtml]
        );

        res.json({ success: true, message: 'Sollecito inviato con successo e salvato nella posta inviata.' });

    } catch (error) {
        console.error("Errore nell'invio del sollecito:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore del server durante l\'invio del sollecito.' });
    }
});

// --- GET (Recupera la posta inviata dal database) ---
router.get('/sent-emails', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [emails] = await dbPool.query('SELECT * FROM ditta_mail_inviate WHERE id_ditta = ? ORDER BY data_invio DESC', [dittaId]);
        res.json({ success: true, sentEmails: emails });
    } catch (error) {
        console.error("Errore nel recupero della posta inviata:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});



// --- GET (Recupera gli account email configurati) ---
router.get('/mail-accounts', verifyToken, async (req, res) => {
    try {
        const { id_ditta: dittaId } = req.user;
        const [accounts] = await dbPool.query('SELECT id, email_address FROM ditta_mail_accounts WHERE id_ditta = ?', [dittaId]);
        res.json({ success: true, accounts });
    } catch (error) {
        // <span style="color:green;">// NUOVO: Aggiunto log dell'errore per il debug nel terminale del server.</span>
        console.error("ERRORE DETTAGLIATO nel recupero degli account email:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero degli account. Controllare i log del server.' });
    }
});


module.exports = router;