/**
 * File: opero/utils/mailer.js
 * Versione: 2.1 (Retrocompatibile)
 * Descrizione: Ripristinata la funzione 'sendSystemEmail' per compatibilità.
 * Aggiunte le nuove funzioni 'sendRegistrationInvite' e 'sendNewDittaNotification'
 * che utilizzano 'sendSystemEmail' per l'invio, garantendo coerenza e modularità.
 */

const nodemailer = require('nodemailer');

/**
 * Funzione base per inviare email di sistema. Mantenuta per retrocompatibilità.
 * @param {string} to - Destinatario
 * @param {string} subject - Oggetto dell'email
 * @param {string} htmlContent - Contenuto HTML dell'email
 * @returns {boolean} - True se l'invio ha successo, altrimenti false.
 */
async function sendSystemEmail(to, subject, htmlContent) {
    // Configurazione del transporter usando le variabili d'ambiente
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_PORT == 465, // True per la porta 465, altrimenti false
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        // Necessario per ambienti di sviluppo con certificati auto-firmati
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'Opero Gestionale'}" <${process.env.MAIL_FROM_ADDRESS}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });
        console.log(`Email inviata con successo a: ${to}`);
        return true;
    } catch (error) {
        console.error(`Errore durante l'invio dell'email a ${to}:`, error);
        return false;
    }
}

/**
 * Invia un'email di invito alla registrazione per una nuova ditta.
 * Utilizza la funzione 'sendSystemEmail' per l'invio.
 * @param {string} emailAmministratore - L'email del futuro amministratore.
 * @param {string} nomeDitta - Il nome della nuova ditta.
 * @param {string} registrationLink - Il link univoco per la registrazione.
 */
async function sendRegistrationInvite(emailAmministratore, nomeDitta, registrationLink) {
    const subject = `Benvenuto in Opero! Completa la registrazione per ${nomeDitta}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Ciao e benvenuto in Opero!</h2>
            <p>Sei stato invitato a diventare l'amministratore della ditta <strong>${nomeDitta}</strong>.</p>
            <p>Per completare la configurazione del tuo account, per favore clicca sul pulsante qui sotto:</p>
            <a href="${registrationLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Completa la Registrazione</a>
            <p style="font-size: 0.9em; color: #666;">Se il pulsante non funziona, puoi copiare e incollare il seguente link nel tuo browser:</br>${registrationLink}</p>
            <p>Questo link scadrà tra 7 giorni.</p>
            <hr>
            <p style="font-size: 0.8em; color: #888;">Se non ti aspettavi questa email, puoi tranquillamente ignorarla.</p>
        </div>
    `;
    return sendSystemEmail(emailAmministratore, subject, htmlContent);
}

/**
 * Invia una notifica alla ditta per confermare la creazione del nuovo account.
 * Utilizza la funzione 'sendSystemEmail' per l'invio.
 * @param {string} emailDitta - L'email generale della ditta.
 * @param {string} nomeDitta - Il nome della ditta.
 * @param {string} emailAmministratore - L'email del nuovo amministratore invitato.
 */
async function sendNewDittaNotification(emailDitta, nomeDitta, emailAmministratore) {
    const subject = `[Opero] Creazione Nuova Ditta: ${nomeDitta}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Conferma Creazione Ditta</h2>
            <p>Ti confermiamo che la ditta <strong>${nomeDitta}</strong> è stata creata correttamente nel sistema Opero.</p>
            <p>Un invito per la configurazione dell'account amministratore è stato inviato a: <strong>${emailAmministratore}</strong>.</p>
            <br>
            <p>Grazie per aver scelto Opero.</p>
        </div>
    `;
    return sendSystemEmail(emailDitta, subject, htmlContent);
}

/**
 * Invia una notifica a un utente esistente che è stato aggiunto a una nuova ditta.
 * Utilizza la funzione 'sendSystemEmail' per l'invio.
 * @param {string} userEmail - L'email dell'utente a cui è stato aggiunto il ruolo.
 * @param {string} nomeDitta - Il nome della ditta a cui è stato associato.
 * @param {string} userName - Il nome dell'utente.
 */
async function sendAddedToDittaNotification(emailDitta, nomeDitta, userEmail) {
    const subject = `Sei stato aggiunto a ${nomeDitta} su Opero!`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Ciao </h2>
            <p>Siamo lieti di informarti che sei stato aggiunto alla ditta <strong>${nomeDitta}</strong> sulla piattaforma Opero.</p>
            <p>Ora puoi accedere al tuo account per visualizzare i nuovi permessi e collaborare.</p>
            <br>
            <p>A presto,<br>Il team di Opero</p>
        </div>
    `;
    return sendSystemEmail(userEmail, subject, htmlContent);
}


// Esportiamo sia la vecchia che le nuove funzioni per massima compatibilità
module.exports = {
    sendSystemEmail,
    sendRegistrationInvite,
    sendNewDittaNotification,
    sendAddedToDittaNotification
};

