// #####################################################################
// # Rotte per il Modulo ContSmart
// # File: opero/routes/contsmart.js
// #####################################################################

const express = require('express');
const router = express.Router();

// Importa il pool di connessioni e gli strumenti di autenticazione
const { dbPool } = require('../config/db');
const { checkAuth, checkRole } = require('../utils/auth');

// Applica l'autenticazione a tutte le rotte di questo file
// Accessibile a tutti gli utenti autenticati (poi filtreremo per modulo)
router.use(checkAuth);

// ====================================================================
// API GESTIONE ANAGRAFICHE (CLIENTI E FORNITORI)
// ====================================================================

router.get('/anagrafiche', async (req, res) => {
    // L'id della ditta dell'utente che fa la richiesta
    const idDittaProprietaria = req.userData.dittaId;

    let connection;
    try {
        connection = await dbPool.getConnection();
        // Seleziona tutte le ditte collegate a quella dell'utente
        // che sono state definite come Clienti (C) o Fornitori (F)
        const query = `
            SELECT id, ragione_sociale, p_iva, codice_fiscale, mail_1, codice_relazione 
            FROM ditte 
            WHERE id_ditta_proprietaria = ? 
            AND (codice_relazione = 'C' OR codice_relazione = 'F')
            ORDER BY ragione_sociale;
        `;
        const [anagrafiche] = await connection.query(query, [idDittaProprietaria]);
        
        res.json({ success: true, data: anagrafiche });

    } catch (error) {
        console.error("Errore nel recupero delle anagrafiche per ContSmart:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle anagrafiche.' });
    } finally {
        if (connection) connection.release();
    }
});

// Qui in futuro aggiungeremo altre rotte per ContSmart
// es. POST /anagrafiche, PATCH /anagrafiche/:id, etc.

module.exports = router;