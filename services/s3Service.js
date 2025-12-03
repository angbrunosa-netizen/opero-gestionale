// #####################################################################
// # Servizio Storage S3 Aruba per Modulo Posta Opero
// # File: opero/services/s3Service.js
// #####################################################################

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class S3Service {
    constructor() {
        this.bucket = process.env.S3_BUCKET_NAME || 'operogo';
        this.region = process.env.S3_REGION || 'it-mil-1';

        // Configurazione client S3 per Aruba Cloud Storage usando variabili environment esistenti
        this.s3Client = new S3Client({
            region: this.region,
            endpoint: process.env.S3_ENDPOINT || 'http://r3-it.storage.cloud.it',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            },
            forcePathStyle: true // Necessario per alcuni provider S3 compatibili
        });

        // Directory structure per organizzare i file
        this.basePath = 'mail-attachments';

        console.log(`S3 Service configurato con bucket: ${this.bucket}, endpoint: ${process.env.S3_ENDPOINT}`);
    }

    /**
     * Genera un percorso S3 univoco per l'allegato
     * @param {number} dittaId - ID della ditta
     * @param {number} userId - ID dell'utente
     * @param {string} originalName - Nome originale del file
     * @returns {string} - Percorso S3
     */
    generateS3Path(dittaId, userId, originalName) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(4).toString('hex');

        const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
        const uniqueFilename = `${sanitizedName}_${timestamp}_${randomString}${ext}`;

        return `${this.basePath}/${dittaId}/${userId}/${year}/${month}/${day}/${uniqueFilename}`;
    }

    /**
     * Upload di un file su S3
     * @param {Buffer|string} fileBuffer - Buffer o percorso del file
     * @param {string} s3Key - Chiave S3 (percorso)
     * @param {object} metadata - Metadati del file
     * @returns {Promise<object>} - Risultato upload
     */
    async uploadFile(fileBuffer, s3Key, metadata = {}) {
        try {
            const params = {
                Bucket: this.bucket,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: metadata.contentType || 'application/octet-stream',
                Metadata: {
                    originalName: metadata.originalName || 'unknown',
                    uploadedBy: metadata.uploadedBy || 'unknown',
                    dittaId: metadata.dittaId?.toString() || 'unknown',
                    emailId: metadata.emailId?.toString() || 'unknown'
                }
                // NOTA: Aruba S3 non supporta ServerSideEncryption, rimosso per compatibilità
            };

            const command = new PutObjectCommand(params);
            const result = await this.s3Client.send(command);

            return {
                success: true,
                s3Key: s3Key,
                etag: result.ETag,
                size: metadata.size || fileBuffer.length || 0
            };
        } catch (error) {
            console.error('Errore upload S3:', error);
            throw new Error(`Upload S3 fallito: ${error.message}`);
        }
    }

    /**
     * Upload di un file dal filesystem locale a S3
     * @param {string} filePath - Percorso file locale
     * @param {string} s3Key - Chiave S3
     * @param {object} metadata - Metadati
     * @returns {Promise<object>} - Risultato upload
     */
    async uploadFileFromPath(filePath, s3Key, metadata = {}) {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const stats = fs.statSync(filePath);

            return await this.uploadFile(fileBuffer, s3Key, {
                ...metadata,
                size: stats.size
            });
        } catch (error) {
            console.error('Errore upload da filesystem a S3:', error);
            throw new Error(`Upload da filesystem fallito: ${error.message}`);
        }
    }

    /**
     * Genera un URL firmato per il download di un file
     * @param {string} s3Key - Chiave S3
     * @param {number} expiresIn - Secondi di validità (default: 24 ore)
     * @returns {Promise<string>} - URL firmato
     */
    async getSignedDownloadUrl(s3Key, expiresIn = 86400) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: s3Key,
                ResponseContentDisposition: 'attachment' // Forza download
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
            return signedUrl;
        } catch (error) {
            console.error('Errore generazione URL firmato:', error);
            throw new Error(`Generazione URL firmato fallita: ${error.message}`);
        }
    }

    /**
     * Genera un URL firmato per il tracking del download
     * @param {string} downloadId - ID tracking
     * @param {string} s3Key - Chiave S3
     * @returns {Promise<string>} - URL tracking
     */
    async getTrackingUrl(downloadId, s3Key) {
        try {
            // URL diretto all'API di tracking invece che al download S3
            const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3001';
            return `${baseUrl}/api/track/download/${downloadId}`;
        } catch (error) {
            console.error('Errore generazione URL tracking:', error);
            throw new Error(`Generazione URL tracking fallita: ${error.message}`);
        }
    }

    /**
     * Elimina un file da S3
     * @param {string} s3Key - Chiave S3
     * @returns {Promise<boolean>} - Successo
     */
    async deleteFile(s3Key) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            console.error('Errore eliminazione file S3:', error);
            return false;
        }
    }

    /**
     * Lista i file in una directory S3
     * @param {string} prefix - Prefisso directory
     * @param {number} maxKeys - Numero massimo risultati
     * @returns {Promise<Array>} - Lista file
     */
    async listFiles(prefix, maxKeys = 1000) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
                MaxKeys: maxKeys
            });

            const result = await this.s3Client.send(command);

            return result.Contents ? result.Contents.map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                etag: item.ETag
            })) : [];
        } catch (error) {
            console.error('Errore listing file S3:', error);
            return [];
        }
    }

    /**
     * Pulizia file obsoleti (più vecchi di giorni specificati)
     * @param {number} olderThanDays - Giorni di vecchiaia
     * @returns {Promise<number>} - Numero file eliminati
     */
    async cleanupOldFiles(olderThanDays = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const allFiles = await this.listFiles(this.basePath);
            let deletedCount = 0;

            for (const file of allFiles) {
                if (file.lastModified < cutoffDate) {
                    const deleted = await this.deleteFile(file.key);
                    if (deleted) deletedCount++;
                }
            }

            console.log(`Pulizia S3 completata: ${deletedCount} file eliminati`);
            return deletedCount;
        } catch (error) {
            console.error('Errore pulizia file S3:', error);
            return 0;
        }
    }

    /**
     * Verifica connessione S3
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                MaxKeys: 1
            });

            await this.s3Client.send(command);
            console.log('Connessione S3 Aruba stabilita con successo');
            return true;
        } catch (error) {
            console.error('Errore connessione S3:', error);
            return false;
        }
    }

    /**
     * Ottiene informazioni su un file
     * @param {string} s3Key - Chiave S3
     * @returns {Promise<object|null>} - Informazioni file
     */
    async getFileInfo(s3Key) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: s3Key
            });

            const result = await this.s3Client.send(command);

            return {
                size: result.ContentLength,
                lastModified: result.LastModified,
                contentType: result.ContentType,
                metadata: result.Metadata
            };
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                return null;
            }
            throw error;
        }
    }
}

module.exports = new S3Service();