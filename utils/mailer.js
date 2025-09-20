const nodemailer = require('nodemailer');

// Funzione per inviare email di sistema
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
        // Spesso necessario per server con certificati auto-firmati o problemi di TLS
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
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

module.exports = { sendSystemEmail };