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
const { decrypt } = require('./crypto');

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
    const decryptedPassword = decrypt(mailAccount.smtp_password_encrypted);

    // ## CONTROLLO DI SICUREZZA POTENZIATO ##
    if (!mailAccount.smtp_user || !decryptedPassword) {
        console.error(`[ERRORE CREDENZIALI] Utente SMTP: ${mailAccount.smtp_user}, Password Decifrata: ${decryptedPassword ? '***' : 'FALLITA (null)'}`);
        throw new Error('Credenziali SMTP mancanti o non valide. Causa probabile: 1) Campo "smtp_user" vuoto nel database. 2) La "ENCRYPTION_SECRET" nel file .env non è corretta e la decrittazione fallisce.');
    }

    let toEmail = '';
    if (istanza.TargetEntityType === 'DITTA') {
        const [rows] = await dbPool.query('SELECT mail_1 FROM ditte WHERE id = ?', [istanza.TargetEntityID]);
        if (rows.length > 0) toEmail = rows[0].mail_1;
    } else if (istanza.TargetEntityType === 'UTENTE') {
        const [rows] = await dbPool.query('SELECT email FROM utenti WHERE id = ?', [istanza.TargetEntityID]);
        if (rows.length > 0) toEmail = rows[0].email;
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
            user: mailAccount.smtp_user,
            pass: decryptedPassword
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const subject = `Aggiornamento di Stato: Procedura "${istanza.NomeProcedura}"`;
    const htmlBody = `<p>Gentile Cliente,</p><p>In allegato trova il report di stato aggiornato.</p>`;
    const mailOptions = {
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

    await dbPool.query(
        `INSERT INTO email_inviate (id_ditta, id_utente_mittente, id_mail_account, destinatari, oggetto, corpo, message_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idDitta, idUtenteMittente, mailAccountId, toEmail, subject, htmlBody, info.messageId]
    );

    return info;
}
module.exports = { sendPpaReport, generatePdfBuffer };

