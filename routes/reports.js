// #####################################################################
// # NUOVO FILE: Routes per la Reportistica v2.1 (Fix Import dbPool)
// # File: opero-gestionale/routes/reports.js
// #####################################################################

const express = require('express');
const router = express.Router();
// CORREZIONE DEFINITIVA:
// Il file 'config/db.js' esporta un oggetto. Usiamo la destrutturazione
// per estrarre la proprietà 'dbPool', come nello standard del progetto.
const { dbPool } = require('../config/db'); 
const { verifyToken } = require('../utils/auth');

// Middleware di protezione per tutte le routes di questo file
router.use(verifyToken);

/**
 * @route   GET /api/reports/partite-aperte/:tipo
 * @desc    Recupera le partite aperte usando dbPool e SQL puro.
 * @access  Privato
 */
router.get('/partite-aperte/:tipo', async (req, res) => {
    const { id_ditta } = req.user;
    const { tipo } = req.params; // 'attive' (crediti) o 'passive' (debiti)

    if (tipo !== 'attive' && tipo !== 'passive') {
        return res.status(400).json({ error: 'Tipo di partita non valido.' });
    }

    try {
        // Query SQL pura, parametrizzata per prevenire SQL injection.
        const sql = `
            SELECT
                pa.id,
                pa.data_documento,
                pa.data_scadenza,
                pa.numero_documento,
                d.ragione_sociale,
                pa.importo,
                pa.insoluto
            FROM sc_partite_aperte AS pa
            JOIN ditte AS d ON pa.id_anagrafica = d.id
            WHERE pa.id_ditta = ?
              AND pa.tipo_partita = ?
              AND pa.stato = 'aperta'
            ORDER BY pa.data_scadenza ASC;
        `;
        
        // Ora usiamo la variabile corretta 'dbPool' (con la P maiuscola)
        const [partite] = await dbPool.query(sql, [id_ditta, tipo]);

        res.json(partite);

    } catch (error) {
        console.error("Errore nel recupero delle partite aperte:", error);
        res.status(500).json({ error: 'Si è verificato un errore nel recupero dei dati delle partite aperte.' });
    }
});

module.exports = router;