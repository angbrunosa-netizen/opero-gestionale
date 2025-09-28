/**
 * ======================================================================
 * File: utils/reportMailer.js (v1.2 - Logica PDF Ripristinata)
 * ======================================================================
 * @description
 * RIPRISTINATO: La funzione 'generatePdfBuffer' ora contiene la logica
 * completa per la creazione del documento PDF, che era stata
 * precedentemente rimossa per errore.
 */
const { dbPool } = require('../config/db');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { randomUUID } = require('crypto'); // <-- CORREZIONE: Aggiunta questa riga

async function generatePdfBuffer(istanza, selectedAzioni, selectedMessaggi, reportNotes, req) {
    const { id_ditta: idDitta } = req.user;
    const [dittaRows] = await dbPool.query('SELECT ragione_sociale, mail_1, tel1, logo_url FROM ditte WHERE id = ?', [idDitta]);
    const ditta = dittaRows[0];
    let userEmailForLogin = 'N/D';
    if (istanza.TargetEntityType === 'DITTA') {
        const [userTargetRows] = await dbPool.query('SELECT email FROM utenti WHERE id_ditta = ? LIMIT 1', [istanza.TargetEntityID]);
        if (userTargetRows.length > 0) userEmailForLogin = userTargetRows[0].email;
    } else if (istanza.TargetEntityType === 'UTENTE') {
        const [userTargetRows] = await dbPool.query('SELECT email FROM utenti WHERE id = ?', [istanza.TargetEntityID]);
        if (userTargetRows.length > 0) userEmailForLogin = userTargetRows[0].email;
    }
    let logoBuffer = null;
    if (ditta.logo_url) {
        try {
            const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const logoPath = ditta.logo_url.startsWith('/') ? ditta.logo_url : `/${ditta.logo_url}`;
            const fullLogoUrl = frontendBaseUrl + logoPath;
            const response = await axios.get(fullLogoUrl, { responseType: 'arraybuffer' });
            logoBuffer = response.data;
        } catch (imageError) {
            console.error("Impossibile scaricare il logo della ditta:", imageError.message);
        }
    }

    return new Promise((resolve) => {
        const doc = new PDFDocument({ size: 'A5', margin: 40 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- Contenuto del PDF (LOGICA COMPLETA RIPRISTINATA) ---

        // A. Header
        if (logoBuffer) {
            doc.image(logoBuffer, 40, 40, { width: 70 });
        }
        doc.fontSize(8).font('Helvetica').text(`
            ${ditta.ragione_sociale}
            Email: ${ditta.mail_1 || 'N/D'}
            Tel: ${ditta.tel1 || 'N/D'} 
        `, { align: 'right' });
        doc.moveDown(3);
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
        doc.moveDown(1.5);

        // B. Titolo
        doc.fontSize(16).font('Helvetica-Bold').text(`Report di Stato Procedura`, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(new Date().toLocaleDateString('it-IT'), { align: 'center' });
        doc.moveDown(1.5);

        // C. Dettagli Istanza
        doc.fontSize(12).font('Helvetica-Bold').text(istanza.NomeProcedura);
        doc.fontSize(9).font('Helvetica').text(`Target: ${istanza.TargetEntityName}`);
        doc.moveDown();

        // D. Note Generali
        if (reportNotes) {
            doc.fontSize(10).font('Helvetica-Bold').text('Note Generali:');
            doc.fontSize(9).font('Helvetica').text(reportNotes, { align: 'justify' });
            doc.moveDown();
        }

        // E. Azioni Incluse
        if (selectedAzioni && selectedAzioni.length > 0) {
            doc.fontSize(10).font('Helvetica-Bold').text('Dettaglio Azioni:');
            selectedAzioni.forEach(azione => {
                doc.fontSize(9).font('Helvetica-Bold').text(`- ${azione.NomeAzione}`);
                
                const dataInizio = azione.DataInizio ? new Date(azione.DataInizio).toLocaleDateString('it-IT') : 'N/D';
                const dataFine = azione.DataPrevistaFine ? new Date(azione.DataPrevistaFine).toLocaleDateString('it-IT') : 'N/D';
                const dataCompletamento = azione.DataCompletamento ? new Date(azione.DataCompletamento).toLocaleDateString('it-IT') : null;

                doc.fontSize(8).font('Helvetica').text(`  Stato: ${azione.StatoDescrizione}, Assegnato a: ${azione.NomeAssegnatario} ${azione.CognomeAssegnatario}`);
                doc.fontSize(8).font('Helvetica').text(`  Periodo Previsto: dal ${dataInizio} al ${dataFine}`);
                
                if (dataCompletamento) {
                    doc.font('Helvetica-Bold').fillColor('green').text(`  Completata il: ${dataCompletamento}`);
                    doc.fillColor('black'); // Resetta il colore
                }

                if (azione.Note) {
                    doc.font('Helvetica-Oblique').fontSize(8).text(`  Note Azione: ${azione.Note}`);
                }
                doc.moveDown(0.5);
            });
        }

        // F. Messaggi Bacheca
        if (selectedMessaggi && selectedMessaggi.length > 0) {
            doc.moveDown();
            doc.fontSize(10).font('Helvetica-Bold').text('Messaggi dalla Bacheca:');
            selectedMessaggi.forEach(msg => {
                doc.fontSize(9).font('Helvetica-Bold').text(`- Da: ${msg.nome_mittente}`);
                doc.fontSize(8).font('Helvetica').text(`  "${msg.messaggio}"`);
                doc.moveDown(0.5);
            });
        }
        
        // G. Piè di Pagina
        const pageHeight = doc.page.height;
        doc.y = pageHeight - 100;

        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
        doc.moveDown(0.5);
        
        const host = req.get('host');
        const loginUrl = `${req.protocol}://${host}`;
        
        doc.fontSize(7).font('Helvetica').text(
            'Questo report vale come accettazione della commessa. Il documento è stato inviato a mezzo mail per notifica.', { align: 'justify' }
        );
        doc.moveDown(0.5);
        doc.text(
            `Puoi seguire tutte le fasi della lavorazione e interagire con il team collegandoti alla tua pagina personale Opero tramite la login all'indirizzo ${loginUrl}.`, { align: 'justify' }
        );
        doc.moveDown(0.5);
        doc.text(`Credenziali di accesso: Nome Utente: ${userEmailForLogin}, Password: ********`, { align: 'left' });

        doc.end();
    });
}

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

async function sendPpaReport(req, body) {
    const { istanza, selectedAzioni, selectedMessaggi, reportNotes } = body;
    const { id_ditta: idDitta, id: idUtenteMittente } = req.user;

    const [servizioRows] = await dbPool.query(
        'SELECT id_ditta_mail_account FROM an_servizi_aziendali_mail WHERE id_ditta = ? AND nome_servizio = ?',
        [idDitta, 'PPA_COMUNICATION']
    );
    if (servizioRows.length === 0) {
        throw new Error('Nessun account email configurato per il servizio PPA.');
    }
    const mailAccountId = servizioRows[0].id_ditta_mail_account;

    const [accountRows] = await dbPool.query('SELECT * FROM ditta_mail_accounts WHERE id = ?', [mailAccountId]);
    if (accountRows.length === 0) {
        throw new Error('Dettagli dell\'account email non trovati.');
    }
    const mailAccount = accountRows[0];
    
    const decryptedPassword = decrypt(mailAccount.auth_pass);
    const smtpUser = mailAccount.auth_user;
    console.log(decryptedPassword,smtpUser)
    if (!smtpUser || !decryptedPassword) {
        console.error(`[ERRORE CREDENZIALI] Utente SMTP: ${smtpUser}, Password Decifrata: ${decryptedPassword ? '***' : 'FALLITA (null)'}`);
        throw new Error('Credenziali SMTP mancanti o non valide. Causa probabile: 1) Campo "email_address" vuoto. 2) La "ENCRYPTION_SECRET" nel .env non è corretta (deve essere di 32 caratteri).');
    }

    let toEmail = '';
    if (istanza.TargetEntityType === 'DITTA') {
        const [rows] = await dbPool.query('SELECT mail_1 FROM ditte WHERE id = ?', [istanza.TargetEntityID]);
        if (rows.length > 0) toEmail = rows[0].mail_1;
    } else if (istanza.TargetEntityType === 'UTENTE') {
        // ## CORREZIONE: Utilizzo del campo corretto 'email_contatto' ##
        const [rows] = await dbPool.query('SELECT mail_contatto FROM utenti WHERE id = ?', [istanza.TargetEntityID]);
        if (rows.length > 0) toEmail = rows[0].mail_contatto;
    }
    if (!toEmail) {
        throw new Error('Indirizzo email del destinatario non trovato.');
    }

    const pdfBuffer = await generatePdfBuffer(istanza, selectedAzioni, selectedMessaggi, reportNotes, req);

    const transporter = nodemailer.createTransport({
        host: mailAccount.smtp_host,
        port: mailAccount.smtp_port,
        secure: mailAccount.smtp_port === 465,
        auth: {
            user: smtpUser,
            pass: decryptedPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const DataPrevistaFine = istanza.DataPrevistaFine ? new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT') : 'N/D';
    

    const subject = `Aggiornamento di Stato: Procedura "${istanza.NomeProcedura}"`;
            const htmlBody = `<p>Gentile Cliente,</p>
            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura "${istanza.NomeProcedura}".</p>
            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è "${DataPrevistaFine}".</p>
            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>
            <p>Cordiali Saluti,<br/>${mailAccount.nome_account}</p>`;const mailOptions = {
        from: `"${mailAccount.nome_account}" <${mailAccount.email_address}>`,
        to: toEmail,
        subject: subject,
        html: htmlBody,
        attachments: [{
            filename: `report_procedura.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }]
    };

    const info = await transporter.sendMail(mailOptions);
   // const trackingId = info.messageId || `local-${Date.now()}`;
    const trackingId = randomUUID();
    await dbPool.query(
        `INSERT INTO email_inviate (id_ditta, id_utente_mittente, destinatari, oggetto, corpo, tracking_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [idDitta, idUtenteMittente, toEmail, subject, htmlBody, info.messageId]
    );

     const [emailInviataResult] = await dbPool.query(
            `INSERT INTO email_inviate (id_ditta, id_utente_mittente, destinatari, oggetto, corpo,tracking_id) VALUES (?, ?, ?, ?, ?, ?)`,
            [idDitta, idUtenteMittente, toEmail, subject, htmlBody, trackingId]
        );

    const idEmailInviata = emailInviataResult.insertId;
        if (mailOptions.attachments && mailOptions.attachments.length > 0) {
            for (const attachment of mailOptions.attachments) {
                const allegatoData = {
                    id_email_inviata: idEmailInviata,
                    nome_file_originale: attachment.filename,
                    // Poiché il PDF è generato in memoria, non ha un percorso fisico sul server
                    percorso_file_salvato: 'Generato in memoria per invio email',
                    download_id: randomUUID(), // Genera un ID univoco per un eventuale futuro download
                    scaricato: 0
                };
                await dbPool.query('INSERT INTO allegati_tracciati SET ?', allegatoData);
                console.log(`[Report Mailer] Allegato registrato per email ID ${idEmailInviata}: ${attachment.filename}`);
            }
        }

    return info;
}

module.exports = { sendPpaReport, generatePdfBuffer };

