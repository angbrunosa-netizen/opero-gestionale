// #####################################################################
// # Rotte per il Tracciamento di Email e Allegati
// # File: opero/routes/track.js
// #####################################################################

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const dbPool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306 });

// --- API PER TRACCIARE L'APERTURA DI UN'EMAIL ---
// Quando il client di posta del destinatario carica l'immagine (pixel), questa rotta viene chiamata.
router.get('/open/:trackingId', async (req, res) => {
    const { trackingId } = req.params;
    try {
        const connection = await dbPool.getConnection();
        // Aggiorna lo stato dell'email solo se non è già stata segnata come aperta,
        // per registrare solo la data della prima apertura.
        await connection.query(
            'UPDATE email_inviate SET aperta = 1, data_prima_apertura = NOW() WHERE tracking_id = ? AND aperta = 0',
            [trackingId]
        );
        connection.release();
    } catch (error) {
        // Anche se c'è un errore nel DB, dobbiamo comunque inviare un'immagine
        // per non far apparire un'icona di errore nell'email del destinatario.
        console.error("Errore nel tracciamento dell'apertura email:", error);
    } finally {
        // Invia un'immagine GIF trasparente 1x1 pixel.
        // Questo è lo standard per i pixel di tracciamento.
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set({
            'Content-Type': 'image/gif',
            'Content-Length': pixel.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0
        });
        res.end(pixel);
    }
});

// --- API PER TRACCIARE E GESTIRE IL DOWNLOAD DEGLI ALLEGATI ---
// Quando il destinatario clicca sul link di un allegato, questa rotta viene chiamata.
router.get('/download/:downloadId', async (req, res) => {
    const { downloadId } = req.params;
    let connection;
    try {
        connection = await dbPool.getConnection();
        
        // Cerca l'allegato nel database usando il suo ID di download unico.
        const [rows] = await connection.query(
            'SELECT percorso_file_salvato, nome_file_originale FROM allegati_tracciati WHERE download_id = ?',
            [downloadId]
        );

        if (rows.length === 0) {
            return res.status(404).send('Allegato non trovato o link scaduto.');
        }

        const attachment = rows[0];

        // Verifica che il file esista fisicamente sul server prima di procedere.
        if (!fs.existsSync(attachment.percorso_file_salvato)) {
            console.error(`File non trovato sul disco: ${attachment.percorso_file_salvato}`);
            return res.status(404).send('File non più disponibile sul server.');
        }

        // Aggiorna lo stato dell'allegato a "scaricato" solo la prima volta.
        await connection.query(
            'UPDATE allegati_tracciati SET scaricato = 1, data_primo_download = NOW() WHERE download_id = ? AND scaricato = 0',
            [downloadId]
        );
        
        // Invia il file al browser del destinatario per il download.
        res.download(attachment.percorso_file_salvato, attachment.nome_file_originale);

    } catch (error) {
        console.error("Errore nel tracciamento del download:", error);
        res.status(500).send('Errore del server durante il tentativo di download.');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
