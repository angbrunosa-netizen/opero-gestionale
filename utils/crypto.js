/**
 * ======================================================================
 * File: utils/crypto.js (NUOVO FILE)
 * ======================================================================
 * @description
 * Utility centralizzata per la crittografia e decrittografia.
 * Fornisce la funzione 'decrypt' necessaria per decodificare le
 * password SMTP salvate nel database.
 */
const crypto = require('crypto');

// Legge la chiave segreta dal file .env, con un valore di default per sicurezza
const secret = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_chars_!!';
const algorithm = 'aes-256-cbc';

/**
 * Decritta un testo che è stato crittografato nel formato 'iv:encryptedData'.
 * @param {string} text Il testo crittografato.
 * @returns {string|null} Il testo decrittato o null se l'input non è valido.
 */
console.log(`[Crypto] Chiave di crittografia caricata (primi 5 caratteri): ${secret.substring(0, 5)}...`);
function decrypt(text) {
    if (!text || typeof text !== 'string') return null;
    
    const parts = text.split(':');
    if (parts.length !== 2) {
        console.error("Formato del testo crittografato non valido. Atteso 'iv:encryptedData'.");
        return null;
    }

    try {
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Errore durante la decrittografia:", error.message);
        return null;
    }
}

module.exports = { decrypt };