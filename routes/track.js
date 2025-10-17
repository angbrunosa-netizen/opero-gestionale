// #####################################################################
// # Rotte per il Tracciamento di Email e Allegati
// # File: opero/routes/track.js
// #####################################################################

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../utils/auth');

const router = express.Router();
const { dbPool } = require('../config/db');


// API per tracciare l'apertura di un'email
// Rotta per tracciare l'apertura di un'email
router.get('/open/:trackingId', async (req, res) => {
    const { trackingId } = req.params;
    
    try {
        // ##################################################################
        // ## CORREZIONE: Rimossa la sintassi obsoleta '.promise()' e      ##
        // ## implementato l'uso corretto di 'await' con 'dbPool.query'.   ##
        // ##################################################################
        await dbPool.query(
            'UPDATE mail_tracking SET opened_at = NOW(), status = ? WHERE tracking_id = ? AND status = ?',
            ['aperta', trackingId, 'inviata']
        );
        
    } catch (error) {
        console.error("Errore nel tracciamento dell'apertura email:", error);
    }
    
    // Invia un'immagine trasparente 1x1 pixel per non "rompere" il client di posta
    const transparentPixel = path.join(__dirname, '..', 'public', 'pixel.gif');
    res.sendFile(transparentPixel);
});


// API per tracciare e gestire il download degli allegati
router.get('/download/:downloadId', async (req, res) => {
    const { downloadId } = req.params;
    try {
        const [rows] = await dbPool.promise().query(
            'SELECT percorso_file_salvato, nome_file_originale FROM allegati_tracciati WHERE download_id = ?',
            [downloadId]
        );
        if (rows.length === 0) {
            return res.status(404).send('Allegato non trovato o link scaduto.');
        }
        const attachment = rows[0];
        if (!fs.existsSync(attachment.percorso_file_salvato)) {
            return res.status(404).send('File non più disponibile sul server.');
        }
        await dbPool.promise().query(
            'UPDATE allegati_tracciati SET scaricato = 1, data_primo_download = NOW() WHERE download_id = ? AND scaricato = 0',
            [downloadId]
        );
        res.download(attachment.percorso_file_salvato, attachment.nome_file_originale);
    } catch (error) {
        res.status(500).send('Errore del server durante il tentativo di download.');
    }
});

// --- ROTTA PER REGISTRARE UN'AZIONE UTENTE ---
router.post('/log-action', verifyToken, async (req, res) => {
    const { azione, dettagli, modulo, funzione } = req.body;
    const id_utente = req.user.id;
    const id_ditta = req.user.id_ditta;

    if (!azione) {
        return res.status(400).json({ success: false, message: 'Il campo "azione" è obbligatorio.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.query(
            'INSERT INTO log_azioni (id_utente, id_ditta, azione, descrizione, modulo, funzione) VALUES (?, ?, ?, ?, ?, ?)',
            [id_utente, id_ditta, azione, dettagli || '', modulo || null, funzione || null]
        );
        res.status(200).json({ success: true, message: 'Azione registrata.' });
    } catch (error) {
        console.error("Errore durante la registrazione dell'azione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;
