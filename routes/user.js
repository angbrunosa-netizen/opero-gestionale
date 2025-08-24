// #####################################################################
// # Rotte per il Profilo Utente - v2.4 (Fix Chiamate DB)
// # File: opero/routes/user.js
// #####################################################################
const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// Applichiamo l'autenticazione a tutte le rotte di questo file
router.use(verifyToken);

// API per aggiornare la firma
router.patch('/signature', async (req, res) => {
    const { id: userId } = req.user;
    const { firma } = req.body;
    try {
        await dbPool.query('UPDATE utenti SET firma = ? WHERE id = ?', [firma, userId]);
        res.json({ success: true, message: 'Firma aggiornata con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento firma:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della firma.' });
    }
});

// API per aggiornare il profilo (nome e cognome)
router.patch('/profile', async (req, res) => {
    const { id: userId } = req.user;
    const { nome, cognome } = req.body;
    if (!nome || !cognome) {
        return res.status(400).json({ success: false, message: 'Nome e cognome sono obbligatori.' });
    }
    try {
        await dbPool.query('UPDATE utenti SET nome = ?, cognome = ? WHERE id = ?', [nome, cognome, userId]);
        res.json({ success: true, message: 'Profilo aggiornato con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento profilo:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento del profilo.' });
    }
});

// --- GET (Recupera le scorciatoie salvate dall'utente, INCLUSO IL MODULO DI APPARTENENZA) ---
router.get('/shortcuts', async (req, res) => {
    const { id: userId } = req.user;
    try {
        // ++ MODIFICA QUI: Aggiunto f.chiave_componente_modulo alla SELECT ++
        const query = `
            SELECT f.id, f.codice, f.descrizione, f.chiave_componente_modulo 
            FROM funzioni f 
            JOIN utente_scorciatoie us ON f.id = us.id_funzione 
            WHERE us.id_utente = ?
        `;
        const [shortcuts] = await dbPool.query(query, [userId]);
        res.json({ success: true, data: shortcuts });
    } catch (error) {
        console.error("Errore nel recupero delle scorciatoie:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle scorciatoie.' });
    }
});


// --- GET (Recupera tutte le funzioni a cui l'utente ha accesso CHE SONO ABILITATE COME SCORCIATOIE) ---
router.get('/all-pinnable-functions', async (req, res) => {
    const { id_ruolo: ruoloId } = req.user;
    try {
        // ++ MODIFICA QUI: Aggiunto il controllo sul nuovo campo 'Scorciatoia' ++
        const query = `
            SELECT f.id, f.descrizione 
            FROM funzioni f 
            JOIN ruoli_funzioni rf ON f.id = rf.id_funzione 
            WHERE rf.id_ruolo = ? AND f.Scorciatoia = 1
        `;
        const [functions] = await dbPool.query(query, [ruoloId]);
        res.json({ success: true, data: functions });
    } catch (error) {
        console.error("Errore nel recupero delle funzioni disponibili:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle funzioni disponibili.' });
    }
});

// --- POST (Salva le scorciatoie scelte dall'utente) ---
router.post('/shortcuts', async (req, res) => {
    const { id: userId } = req.user;
    const { funzioniIds } = req.body;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cancella le vecchie scorciatoie
        await connection.query('DELETE FROM utente_scorciatoie WHERE id_utente = ?', [userId]);

        // 2. Inserisce le nuove
        if (funzioniIds && funzioniIds.length > 0) {
            const values = funzioniIds.map(funzioneId => [userId, funzioneId]);
            await connection.query('INSERT INTO utente_scorciatoie (id_utente, id_funzione) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Scorciatoie salvate con successo.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore durante il salvataggio delle scorciatoie:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
