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
// MODIFICATO: routes/attivita.js

// MODIFICATO: routes/attivita.js

// MODIFICATO: routes/attivita.js

// MODIFICATO: routes/attivita.js


router.get('/mie-future', async (req, res) => {
    const { id: utenteId } = req.user;
    const oggi = new Date().toISOString().split('T')[0];

    try {
        // NUOVO: La query è stata completamente riscritta per rispecchiare la struttura corretta del database,
        // aggiungendo la join a ppa_istanzeprocedure per trovare l'utente creatore.
        const query = `
            SELECT 
                i.ID as id,
                a.NomeAzione as titolo,
                i.DataScadenza as data_scadenza,
                i.ID_Stato as stato,
                c.nome as creatore_nome,
                c.cognome as creatore_cognome
            FROM 
                ppa_istanzeazioni i
            JOIN
                ppa_istanzeprocedure ip ON i.ID_IstanzaProcedura = ip.ID -- NUOVO: Join alla procedura per trovare il creatore
            JOIN 
                utenti c ON ip.ID_UtenteCreatore = c.id                  -- MODIFICATO: La join per il nome del creatore usa la tabella delle procedure
            JOIN
                ppa_azioni a ON i.ID_Azione = a.ID
            WHERE 
                i.ID_UtenteAssegnato = ?
                AND i.DataScadenza >= ?
            ORDER BY 
                i.DataScadenza ASC
            LIMIT 5
        `;
        
        const [attivita] = await dbPool.query(query, [utenteId, oggi]);
        res.json({ success: true, data: attivita });

    } catch (error) {
        console.error("Errore nella route /mie-future:", error); 
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Tutti gli attivita futuri della ditta per Admin) ---
router.get('/ditta/future', checkRole([1, 2]), async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const oggi = new Date().toISOString().split('T')[0];

    try {
        // NUOVO: La query è stata completamente riscritta per adattarsi alla nuova struttura del database PPA.
        const query = `
            SELECT 
                i.ID as id, 
                a.NomeAzione as titolo, 
                i.DataScadenza as data_scadenza, 
                i.ID_Stato as stato, 
                u_assegnato.nome as assegnato_nome, 
                u_assegnato.cognome as assegnato_cognome,
                u_creatore.nome as creatore_nome,
                u_creatore.cognome as creatore_cognome
            FROM 
                ppa_istanzeazioni i
            JOIN 
                utenti u_assegnato ON i.ID_UtenteAssegnato = u_assegnato.id
            JOIN 
                ppa_azioni a ON i.ID_Azione = a.ID
            JOIN
                ppa_istanzeprocedure ip ON i.ID_IstanzaProcedura = ip.ID
            JOIN
                utenti u_creatore ON ip.ID_UtenteCreatore = u_creatore.id
            JOIN 
                ppa_procedureditta pd ON ip.ID_ProceduraDitta = pd.ID -- NUOVO: Join per arrivare alla ditta
            WHERE 
                pd.id_ditta = ?  -- MODIFICATO: Il filtro della ditta ora è sulla tabella ppa_procedureditta
                AND i.DataScadenza >= ?
            ORDER BY 
                i.DataScadenza ASC, u_assegnato.cognome ASC
        `;
        const [attivita] = await dbPool.query(query, [dittaId, oggi]);
        res.json({ success: true, data: attivita });
    } catch (error) {
        console.error("Errore nella route /ditta/future:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Lista attivita per Mese) ---
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati

// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
// GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
   /* * ==============================================================================
         * MAPPA DELLA QUERY PER DEBUG
         * ==============================================================================
         * Questa query recupera le attività PPA "in corso" per un dato utente.
         * Di seguito la mappatura delle tabelle e dei campi utilizzati:
         * * Tabella 'ppa_istanzeazioni' (alias: ia)
         * - ia.ID                    -> id univoco dell'istanza azione
         * - ia.Note                  -> Descrizione/note dell'attività
         * - ia.DataScadenza          -> Data di scadenza
         * - ia.ID_IstanzaProcedura   -> Chiave per join con 'ppa_istanzeprocedure'
         * - ia.ID_Azione             -> Chiave per join con 'ppa_azioni'
         * - ia.ID_Stato              -> Chiave per join con 'ppa_stati_azione'
         * - ia.ID_UtenteResponsabile -> ID_UtenteAssegnatoUtente a cui è assegnata l'attività
         *
         * Tabella 'ppa_istanzeprocedure' (alias: ip)
         * - ip.ID                    -> id univoco dell'istanza procedura
         * - ip.ID_Procedura          -> Chiave per join con 'ppa_procedureditta'
         * * Tabella 'ppa_azioni' (alias: az)
         * - az.ID                    -> id univoco dell'azione
         * - az.NomeAzione            -> Nome dell'azione
         * * Tabella 'ppa_procedureditta' (alias: pd)
         * - pd.ID                    -> id univoco della procedura per la ditta
         * - pd.NomePersonalizzato    -> Nome visualizzato della procedura
         * - pd.id_ditta              -> Ditta di appartenenza (usato nel WHERE)
         *
         * Tabella 'ppa_stati_azione' (alias: sa)
         * - sa.ID                    -> id univoco dello stato
         * - sa.NomeStato             -> Nome dello stato (es. 'in_corso')
         * * Tabella 'utenti' (alias: u_resp)
         * - u_resp.id                -> id univoco dell'utente
         * - u_resp.nome              -> Nome dell'utente responsabile
         * - u_resp.cognome           -> Cognome dell'utente responsabile
         * ==============================================================================
        */
   // GET /api/attivita - Recupera le attività per il mese e anno correnti o specificati
router.get('/', verifyToken, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const anno = req.query.anno || new Date().getFullYear();
    const mese = req.query.mese || new Date().getMonth() + 1;

    try {
        /* * ==============================================================================
         * MAPPA DELLA QUERY (VERSIONE DEFINITIVA CORRETTA)
         * ==============================================================================
         * L'errore finale era nella join tra 'ppa_istanzeprocedure' e 'ppa_procedureditta'.
         * Il campo corretto in 'ppa_istanzeprocedure' è 'ID_ProceduraDitta'.
         * ==============================================================================
        */
        const query = `
            SELECT 
                ia.ID AS id,
                ia.Note AS descrizione, 
                sa.NomeStato AS stato,
                ia.DataScadenza AS data_scadenza,
                pd.NomePersonalizzato AS nome_procedura,
                az.NomeAzione AS nome_azione,
                ip.ID AS id_istanza_procedura,
                u_resp.nome AS nome_responsabile,
                u_resp.cognome AS cognome_responsabile
            FROM 
                ppa_istanzeazioni AS ia
            JOIN 
                ppa_istanzeprocedure AS ip ON ia.ID_IstanzaProcedura = ip.ID
            JOIN 
                ppa_procedureditta AS pd ON ip.ID_ProceduraDitta = pd.ID
            JOIN 
                ppa_azioni AS az ON ia.ID_Azione = az.ID
            JOIN
                ppa_stati_azione as sa ON ia.ID_Stato = sa.ID
            JOIN 
                utenti AS u_resp ON ia.ID_UtenteAssegnato = u_resp.id
            WHERE 
                pd.id_ditta = ? 
                AND ia.ID_UtenteAssegnato = ? 
                AND sa.NomeStato = 'in_corso'
                AND YEAR(ia.DataScadenza) = ? 
                AND MONTH(ia.DataScadenza) = ?
            ORDER BY 
                ia.DataScadenza ASC
        `;

        const [attivita] = await dbPool.query(query, [id_ditta, id_utente, anno, mese]);
        res.json({ success: true, attivita });

    } catch (error) {
        console.error("Errore nel recupero delle attività:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante il recupero delle attività.' });
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
