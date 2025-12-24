/**
 * File: /utils/s3Client.js
 *
 * Versione: 1.0.0
 *
 * Descrizione: Questo modulo helper centralizza la configurazione
 * e l'inizializzazione del client S3 (@aws-sdk/client-s3).
 * Legge le credenziali e l'endpoint dal file .env e
 * esporta un'istanza del client S3 e i comandi S3
 * più comuni (PutObjectCommand, GetObjectCommand, DeleteObjectCommand)
 * e la funzione per generare URL pre-firmati (getSignedUrl).
 */

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');

// 1. Legge le variabili d'ambiente
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// 2. Validazione delle variabili
if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET_NAME) {
    console.error("ERRORE CRITICO: Variabili S3 non trovate nel file .env");
    console.error("Assicurati che S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, e S3_BUCKET_NAME siano impostati.");
    // In un'app di produzione, potresti voler terminare il processo
    // process.exit(1); 
}


// Rimuovi 'http://' o 'https://' dall'endpoint per il client S3
const endpointUrl = new URL(S3_ENDPOINT);

// 3. Creazione e configurazione del client S3
const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: 'eu-west-1', // Valore standard, non impattante per Aruba
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  forcePathStyle: true, // FONDAMENTALE per la compatibilità
});

// 4. Funzione helper per l'upload su S3
/**
 * Carica un file su S3
 * @param {string} key - La chiave S3 (percorso del file)
 * @param {Buffer|Stream} body - Il contenuto del file (Buffer o Stream)
 * @param {string} contentType - Il MIME type del file
 * @returns {Promise} - Restituisce il risultato dell'upload
 */
const s3Upload = async (key, body, contentType) => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await s3Client.send(command);
};

// 5. Esporta tutto il necessario
module.exports = {
  s3Client,
  S3_ENDPOINT, // <-- (NUOVO EXPORT v1.1)
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
  s3Upload, // <-- (NUOVO EXPORT per l'upload)

  S3_BUCKET_NAME // Esportiamo anche il nome del bucket per comodità
};