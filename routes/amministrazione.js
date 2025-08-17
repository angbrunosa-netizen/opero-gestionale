// #####################################################################
// # Rotte per il Modulo Amministrazione - v2.0 (CRUD Anagrafiche)
// # File: opero/routes/amministrazione.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// --- GET (Lista Anagrafiche) ---
router.get('/anagrafiche', verifyToken, async (req, res) => {
    const { dittaId } = req.user;
    try {
        const query = `
            SELECT a.id, a.ragione_sociale, a.p_iva, a.codice_fiscale, a.stato, r.descrizione AS relazione
            FROM ditte a 
            LEFT JOIN relazioni_ditta r ON a.codice_relazione = r.codice
            WHERE a.id_ditta_proprietaria = ? ORDER BY a.ragione_sociale ASC
        `;
        const [rows] = await dbPool.promise().query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recuperare le anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Dettaglio Anagrafica) ---
router.get('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { dittaId } = req.user;
    const { id } = req.params;
    try {
        const [rows] = await dbPool.promise().query(
            'SELECT * FROM ditte WHERE id = ? AND id_ditta_proprietaria = ?',
            [id, dittaId]
        );
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero del dettaglio.' });
    }
});

// --- POST (Crea Anagrafica) ---
router.post('/anagrafiche', verifyToken, async (req, res) => {
    const { dittaId } = req.user;
    const anagraficaData = { ...req.body, id_ditta_proprietaria: dittaId };
    
    // Rimuoviamo l'ID per essere sicuri che sia un inserimento
    delete anagraficaData.id;

    const fields = Object.keys(anagraficaData);
    const values = Object.values(anagraficaData);
    const placeholders = values.map(() => '?').join(',');

    try {
        const query = `INSERT INTO ditte (${fields.join(',')}) VALUES (${placeholders})`;
        const [result] = await dbPool.promise().query(query, values);
        res.status(201).json({ success: true, message: 'Anagrafica creata con successo.', insertId: result.insertId });
    } catch (error) {
        console.error("Errore creazione anagrafica:", error);
        res.status(500).json({ success: false, message: 'Errore durante la creazione.' });
    }
});

// --- PATCH (Aggiorna Anagrafica) ---
router.patch('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { dittaId } = req.user;
    const { id } = req.params;
    const anagraficaData = req.body;
    delete anagraficaData.id;

    const fields = Object.keys(anagraficaData).map(key => `${key} = ?`).join(',');
    const values = [...Object.values(anagraficaData), id, dittaId];

    try {
        const query = `UPDATE ditte SET ${fields} WHERE id = ? AND id_ditta_proprietaria = ?`;
        const [result] = await dbPool.promise().query(query, values);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});

module.exports = router;
