// #####################################################################
// # Rotte per la Gestione del Sistema PPA - v1.1 (con Logica DB)
// # File: opero/routes/ppa.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const router = express.Router();

// Applica l'autenticazione a tutte le rotte di questo file.
router.use(verifyToken);

// Middleware per verificare che l'utente sia un amministratore
const checkAdminRole = (req, res, next) => {
    const userRole = req.user.id_ruolo;
    // Solo Amministratore di Sistema (1) e Amministratore Azienda (2) possono configurare i PPA
    if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({ success: false, message: 'Accesso negato: autorizzazione insufficiente.' });
    }
    next();
};

// --- GESTIONE PROCEDURE STANDARD (MODELLI) ---

// GET /api/ppa/procedure-standard - Ottiene la libreria di procedure standard
router.get('/procedure-standard', async (req, res) => {
    try {
        const query = "SELECT ID as id, Descrizione as descrizione FROM PPA_ProcedureStandard ORDER BY Descrizione";
        const [rows] = await dbPool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /procedure-standard:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GESTIONE PROCEDURE DELLA DITTA ---

// GET /api/ppa/procedures - Ottiene tutte le procedure per la ditta dell'utente
router.get('/procedures', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const query = "SELECT ID as id, NomePersonalizzato as nome_personalizzato FROM PPA_ProcedureDitta WHERE ID_Ditta = ? ORDER BY NomePersonalizzato";
        const [rows] = await dbPool.query(query, [id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /procedures:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// POST /api/ppa/procedures - Crea una nuova procedura per la ditta
router.post('/procedures', checkAdminRole, async (req, res) => {
    const { id_ditta } = req.user;
    const { id_procedura_standard, nome_personalizzato } = req.body;

    if (!id_procedura_standard || !nome_personalizzato) {
        return res.status(400).json({ success: false, message: 'Dati mancanti per la creazione della procedura.' });
    }

    try {
        const query = "INSERT INTO PPA_ProcedureDitta (ID_Ditta, ID_ProceduraStandard, NomePersonalizzato) VALUES (?, ?, ?)";
        const [result] = await dbPool.query(query, [id_ditta, id_procedura_standard, nome_personalizzato]);
        res.status(201).json({ success: true, message: 'Procedura creata con successo!', newId: result.insertId });
    } catch (error) {
        console.error("Errore in POST /procedures:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE PROCESSI ---

// GET /api/ppa/procedures/:procId/processes - Ottiene i processi di una procedura
router.get('/procedures/:procId/processes', async (req, res) => {
    const { procId } = req.params;
    const { id_ditta } = req.user;
    try {
        // Aggiungiamo un controllo per assicurarsi che la procedura appartenga alla ditta dell'utente
        const query = `
            SELECT p.ID as id, p.NomeProcesso as nome_processo 
            FROM PPA_Processi p
            JOIN PPA_ProcedureDitta pd ON p.ID_ProceduraDitta = pd.ID
            WHERE p.ID_ProceduraDitta = ? AND pd.ID_Ditta = ?
            ORDER BY p.OrdineSequenziale`;
        const [rows] = await dbPool.query(query, [procId, id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(`Errore in GET /procedures/${procId}/processes:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// TODO: Implementare le rotte POST, PATCH, DELETE per Processi e Azioni

module.exports = router;
