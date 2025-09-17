// #####################################################################
// # FILE MODIFICATO: Routes per la Reportistica v2.5
// # File: opero-gestionale/routes/reports.js
// #####################################################################

const express = require('express');
const router = express.Router();
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

// Middleware di protezione per tutte le routes di questo file
router.use(verifyToken);

/**
 * @route   GET /api/reports/partite-aperte/dettaglio/:tipo
 * @desc    Recupera il report ANALITICO (completo) delle partite clienti o fornitori.
 * @access  Privato
 */
router.get('/partite-aperte/dettaglio/:tipo', async (req, res) => {
    const { id_ditta, id_utente } = req.user;
    const { tipo } = req.params;

    let tipoMovimento;
    if (tipo === 'attive') {
        tipoMovimento = ['Apertura_Credito', 'Chiusura_Credito', 'Storno_Apertura_Credito'];
    } else if (tipo === 'passive') {
        tipoMovimento = ['Apertura_Debito', 'Chiusura_Debito', 'Storno_Apertura_Debito'];
    } else {
        return res.status(400).json({ error: 'Tipo di partita non valido.' });
    }

    try {
        // <span style="color:green;">// MODIFICATO: La query ora include tutti i tipi di movimento e non filtra per stato.</span>
        const sql = `
            SELECT
                pa.id,
                rt.data_documento,
                pa.data_scadenza,
                rt.numero_documento,
                d.ragione_sociale,
                pa.importo,
                pa.stato,
                pa.data_registrazione,
                pa.tipo_movimento
            FROM sc_partite_aperte AS pa
            JOIN sc_registrazioni_testata AS rt ON pa.id_registrazione_testata = rt.id
            JOIN ditte AS d ON pa.id_ditta_anagrafica = d.id
            WHERE rt.id_ditta = ?
              AND pa.tipo_movimento IN (?)
            ORDER BY pa.id_ditta_anagrafica, pa.data_scadenza ASC;
        `;

        const [partite] = await dbPool.query(sql, [id_ditta, tipoMovimento]);

        if (id_utente) {
            const logAzione = {
                id_utente: id_utente,
                id_ditta: id_ditta,
                azione: 'Report Analitico Partite',
                dettagli: `L'utente ha richiesto il report analitico per le partite di tipo: ${tipo}`
            };
            await dbPool.query('INSERT INTO log_azioni SET ?', logAzione);
        }

        res.json(partite);

    } catch (error) {
        console.error("Errore nel recupero del report analitico partite:", error);
        res.status(500).json({ error: 'Errore nel recupero del report analitico.' });
    }
});

/**
 * @route   GET /api/reports/partite-aperte/sintesi/:tipo
 * @desc    Recupera il report SINTETICO (solo aperte) delle partite clienti o fornitori.
 * @access  Privato
 */
router.get('/partite-aperte/sintesi/:tipo', async (req, res) => {
    const { id_ditta, id_utente } = req.user;
    const { tipo } = req.params;

    // <span style="color:green;">// NUOVO: La logica per il report sintetico rimane focalizzata sulle sole aperture.</span>
    let tipoMovimentoApertura;
    if (tipo === 'attive') {
        tipoMovimentoApertura = 'Apertura_Credito';
    } else if (tipo === 'passive') {
        tipoMovimentoApertura = 'Apertura_Debito';
    } else {
        return res.status(400).json({ error: 'Tipo di partita non valido.' });
    }

    try {
        // <span style="color:green;">// NUOVO: Questa query seleziona solo le partite APERTE per la vista sintetica.</span>
        const sql = `
            SELECT
                pa.id,
                rt.data_documento,
                pa.data_scadenza,
                rt.numero_documento,
                d.ragione_sociale,
                pa.importo,
                pa.stato,
                pa.data_registrazione
            FROM sc_partite_aperte AS pa
            JOIN sc_registrazioni_testata AS rt ON pa.id_registrazione_testata = rt.id
            JOIN ditte AS d ON pa.id_ditta_anagrafica = d.id
            WHERE rt.id_ditta = ?
              AND pa.tipo_movimento = ?
              AND pa.stato = 'APERTA'
            ORDER BY pa.data_scadenza ASC;
        `;

        const [partite] = await dbPool.query(sql, [id_ditta, tipoMovimentoApertura]);

        if (id_utente) {
            const logAzione = {
                id_utente: id_utente,
                id_ditta: id_ditta,
                azione: 'Report Sintetico Partite Aperte',
                dettagli: `L'utente ha richiesto il report sintetico per le partite aperte di tipo: ${tipo}`
            };
            await dbPool.query('INSERT INTO log_azioni SET ?', logAzione);
        }

        res.json(partite);

    } catch (error) {
        console.error("Errore nel recupero delle partite aperte (sintesi):", error);
        res.status(500).json({ error: 'Errore nel recupero della sintesi delle partite aperte.' });
    }
});

module.exports = router;

