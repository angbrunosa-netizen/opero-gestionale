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
    // ## CORREZIONE 1: Leggiamo 'shortcuts' (array di codici stringa) ##
    const { shortcuts } = req.body; 

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Cancella le vecchie scorciatoie (invariato)
        await connection.query('DELETE FROM utente_scorciatoie WHERE id_utente = ?', [userId]);

        // Step 2: Se ci sono nuove scorciatoie da salvare...
        if (shortcuts && shortcuts.length > 0) {
            // ## CORREZIONE 2: Convertiamo i codici stringa in ID numerici ##
            // Creiamo una query per trovare gli ID di tutte le funzioni inviate in un colpo solo.
            const placeholders = shortcuts.map(() => '?').join(','); // -> '?,?'
            const findIdsQuery = `SELECT id FROM funzioni WHERE codice IN (${placeholders})`;
            
            const [funzioni] = await connection.query(findIdsQuery, shortcuts);

            // Se abbiamo trovato degli ID validi...
            if (funzioni && funzioni.length > 0) {
                const funzioniIds = funzioni.map(f => f.id);
                const values = funzioniIds.map(funzioneId => [userId, funzioneId]);
                await connection.query('INSERT INTO utente_scorciatoie (id_utente, id_funzione) VALUES ?', [values]);
            }
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


// #####################################################################
// ## NUOVO ENDPOINT: Fornisce al frontend l'elenco delle funzioni     ##
// ## che possono essere usate come scorciatoie.                      ##
// #####################################################################
router.get('/shortcuts', async (req, res) => {
    const { id: userId } = req.user;
    try {
        // ## CORREZIONE: Aggiungiamo 'chiave_componente_modulo' alla SELECT ##
        // Questo campo è essenziale per il frontend per sapere quale modulo attivare.
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


module.exports = router;
