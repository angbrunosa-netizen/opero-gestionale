// #####################################################################
// # Rotte per la Gestione attivita - v1.3 (con Creatore Incarico)
// # File: opero/routes/attivita.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken, checkRole } = require('../utils/auth');

const router = express.Router();

router.use(verifyToken);

// --- GET (attivita futuri per l'utente loggato) ---
router.get('/mie-future', async (req, res) => {
    const { id: utenteId } = req.user;
    const oggi = new Date().toISOString().split('T')[0];

    try {
       // console.log(`[DEBUG] Esecuzione query /mie-future per utente con ID: ${req.user.id}`);
         //       console.log(`[DEBUG ATTIVITA] Ricerca per utenteId: ${utenteId}, data >= ${oggi}`);
           //     console.log('[DEBUG TOKEN] Dati utente dal token:', req.user);

        const query = `
            SELECT i.id, i.titolo, i.data_scadenza, i.stato, 
                   c.nome as creatore_nome, c.cognome as creatore_cognome
            FROM attivita i
            JOIN utenti c ON i.id_utente_creatore = c.id
            WHERE i.id_utente_assegnato = ? AND i.data_scadenza >= ?
            ORDER BY i.data_scadenza ASC
            LIMIT 5
        `;
        const [attivita] = await dbPool.query(query, [utenteId, oggi]);
        res.json({ success: true, data: attivita });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Tutti gli attivita futuri della ditta per Admin) ---
router.get('/ditta/future', checkRole([1, 2]), async (req, res) => {
    //console.log('[DEBUG TOKEN] Dati ditta dal token:', req.user);

    const { id_ditta: dittaId } = req.user;
    const oggi = new Date().toISOString().split('T')[0];

    try {
        const query = `
            SELECT 
                i.id, 
                i.titolo, 
                i.data_scadenza, 
                i.stato, 
                u_assegnato.nome as assegnato_nome, 
                u_assegnato.cognome as assegnato_cognome,
                u_creatore.nome as creatore_nome,
                u_creatore.cognome as creatore_cognome
            FROM attivita i
            JOIN utenti u_assegnato ON i.id_utente_assegnato = u_assegnato.id
            JOIN utenti u_creatore ON i.id_utente_creatore = u_creatore.id
            WHERE i.id_ditta = ? AND i.data_scadenza >= ?
            ORDER BY i.data_scadenza ASC, u_assegnato.cognome ASC
        `;
        const [attivita] = await dbPool.query(query, [dittaId, oggi]);
        res.json({ success: true, data: attivita });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Lista attivita per Mese) ---
router.get('/', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { anno, mese } = req.query;

    if (!anno || !mese) {
        return res.status(400).json({ success: false, message: 'Anno e mese sono richiesti.' });
    }

    try {
        const startDate = new Date(anno, mese, 1);
        const endDate = new Date(anno, parseInt(mese) + 1, 0);

        const query = `
            SELECT 
                i.id, 
                i.titolo, 
                i.data_scadenza, 
                i.stato, 
                u_assegnato.nome as assegnato_a_nome, 
                u_assegnato.cognome as assegnato_a_cognome,
                u_creatore.nome as creatore_nome,
                u_creatore.cognome as creatore_cognome
            FROM attivita i
            JOIN utenti u_assegnato ON i.id_utente_assegnato = u_assegnato.id
            JOIN utenti u_creatore ON i.id_utente_creatore = u_creatore.id
            WHERE i.id_ditta = ? AND i.data_scadenza BETWEEN ? AND ?
            ORDER BY i.data_scadenza
        `;
        const [attivita] = await dbPool.query(query, [dittaId, startDate, endDate]);
        res.json({ success: true, data: attivita });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- POST (Crea Nuovo Incarico) ---
router.post('/', async (req, res) => {
    const { id_ditta: dittaId, id: creatoreId } = req.user;
    const { titolo, descrizione, data_scadenza, id_utente_assegnato } = req.body;

    if (!titolo || !data_scadenza || !id_utente_assegnato) {
        return res.status(400).json({ success: false, message: 'Titolo, data e utente sono obbligatori.' });
    }

    try {
        const query = 'INSERT INTO attivita (id_ditta, titolo, descrizione, data_scadenza, id_utente_creatore, id_utente_assegnato) VALUES (?, ?, ?, ?, ?, ?)';
        await dbPool.query(query, [dittaId, titolo, descrizione, data_scadenza, creatoreId, id_utente_assegnato]);
        res.status(201).json({ success: true, message: 'Incarico creato.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella creazione dell\'incarico.' });
    }
});

// --- PATCH (Aggiorna Stato Incarico) ---
router.patch('/:id/stato', async (req, res) => {
    const { id_ditta: dittaId, id: utenteId } = req.user;
    const { id: incaricoId } = req.params;
    const { stato } = req.body;

    if (!stato || !['Da Fare', 'In Corso', 'Completato'].includes(stato)) {
        return res.status(400).json({ success: false, message: 'Stato non valido.' });
    }

    try {
        const [result] = await dbPool.query(
            'UPDATE attivita SET stato = ? WHERE id = ? AND id_ditta = ? AND id_utente_assegnato = ?',
            [stato, incaricoId, dittaId, utenteId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Stato aggiornato.' });
        } else {
            res.status(403).json({ success: false, message: 'Non autorizzato o incarico non trovato.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});

module.exports = router;
