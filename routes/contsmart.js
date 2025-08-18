// #####################################################################
// # Rotte per il Modulo ContSmart - v2.0 (Refactoring Definitivo)
// # File: opero/routes/contsmart.js
// #####################################################################

const express = require('express');
const router = express.Router();
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth'); // Usiamo il nostro nuovo middleware standard

// Applichiamo l'autenticazione a tutte le rotte di questo file.
// Ora è una vera funzione middleware.
router.use(verifyToken);

// ====================================================================
// API GESTIONE ANAGRAFICHE (CLIENTI E FORNITORI)
// ====================================================================

router.get('/anagrafiche', async (req, res) => {
    // L'id della ditta viene preso dal token tramite req.user, non più da req.userData
    const { dittaId } = req.user;

    try {
        const query = `
            SELECT id, ragione_sociale, p_iva, codice_fiscale, mail_1, codice_relazione 
            FROM ditte 
            WHERE id_ditta_proprietaria = ? 
            AND (codice_relazione = 'C' OR codice_relazione = 'F')
            ORDER BY ragione_sociale;
        `;
        const [anagrafiche] = await dbPool.promise().query(query, [dittaId]);
        
        res.json({ success: true, data: anagrafiche });

    } catch (error) {
        console.error("Errore nel recupero delle anagrafiche per ContSmart:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle anagrafiche.' });
    }
});

// Qui in futuro aggiungeremo le altre rotte specifiche per il modulo ContSmart.

module.exports = router;
