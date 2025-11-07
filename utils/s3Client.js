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

// 1. Legge le variabili d'ambiente
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

// 2. Validazione delle variabili
if (!S3_ENDPOINT || !S3_ACCESS_KEY || !S3_SECRET_KEY || !S3_BUCKET_NAME) {
  console.error("ERRORE CRITICO: Variabili ambiente S3 (ENDPOINT, KEY, SECRET, BUCKET) non configurate.");
}

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

// 4. Esporta tutto il necessario
module.exports = {
  s3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  getSignedUrl,
  S3_BUCKET_NAME // Esportiamo anche il nome del bucket per comodità
};