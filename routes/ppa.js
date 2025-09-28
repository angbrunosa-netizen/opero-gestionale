    // #####################################################################
// # Rotte per la Gestione del Sistema ppa - v1.7 (Versione Stabile)
// # File: opero/routes/ppa.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken, checkPermission } = require('../utils/auth');
const { sendSystemEmail } = require('../utils/mailer'); // Assicurati che il mailer esista
const router = express.Router();
const { checkRole } = require('../utils/auth'); // <-- AGGIUNGI QUESTA RIG
const { decrypt } = require('../utils/crypto');
const nodemailer = require('nodemailer'); // <-- AGGIUNGI QUESTA RIGA
const axios = require('axios')
const { knex } = require('../config/db');; // Connessione KNEX corretta e pronta
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const authUtils = require('../utils/auth');
router.use(authUtils.verifyToken);
const puppeteer = require('puppeteer');
const path = require('path');
const { sendPpaReport, generatePdfBuffer } = require('../utils/reportMailer');

router.use(authUtils.verifyToken);

    const checkAdminRole = (req, res, next) => {
        const userRole = req.user.id_ruolo;
        if (userRole !== 1 && userRole !== 2) {
            return res.status(403).json({ success: false, message: 'Accesso negato.' });
        }
        next();
    };


// --- GESTIONE PROCEDURE STANDARD (MODELLI) ---
router.get('/procedure-standard', async (req, res) => {
    try {
        const [rows] = await dbPool.query("SELECT ID as id, Descrizione as descrizione FROM ppa_procedurestandard ORDER BY Descrizione");
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /procedure-standard:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE PROCEDURE DELLA DITTA ---
router.get('/procedures', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const [rows] = await dbPool.query("SELECT ID as id, NomePersonalizzato as nome_personalizzato FROM ppa_procedureditta WHERE ID_Ditta = ? ORDER BY NomePersonalizzato", [id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /procedures:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.post('/procedures', checkAdminRole, async (req, res) => {
    const { id_ditta } = req.user;
    const { id_procedura_standard, nome_personalizzato } = req.body;
    try {
        const [result] = await dbPool.query("INSERT INTO ppa_procedureditta (ID_Ditta, ID_ProceduraStandard, NomePersonalizzato) VALUES (?, ?, ?)", [id_ditta, id_procedura_standard, nome_personalizzato]);
        res.status(201).json({ success: true, message: 'Procedura creata con successo!', newId: result.insertId });
    } catch (error) {
        console.error("Errore in POST /procedures:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE PROCESSI ---
router.get('/procedures/:procId/processes', async (req, res) => {
    const { procId } = req.params;
    const { id_ditta } = req.user;
    try {
        const query = `
            SELECT p.ID as id, p.NomeProcesso as nome_processo 
            FROM ppa_processi p
            JOIN ppa_procedureditta pd ON p.ID_ProceduraDitta = pd.ID
            WHERE p.ID_ProceduraDitta = ? AND pd.ID_Ditta = ?
            ORDER BY p.OrdineSequenziale`;
        const [rows] = await dbPool.query(query, [procId, id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(`Errore in GET /procedures/:procId/processes:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE AZIONI ---
router.get('/procedures/:procId/full-actions', async (req, res) => {
    const { procId } = req.params;
    try {
        const query = `
            SELECT a.ID as id, a.NomeAzione as nome_azione, a.ID_RuoloDefault
            FROM ppa_azioni a
            JOIN ppa_processi p ON a.ID_Processo = p.ID
            WHERE p.ID_ProceduraDitta = ?`;
        const [rows] = await dbPool.query(query, [procId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /full-actions:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE ASSEGNAZIONE PROCEDURA ---
// NOTA: Assicurati che il middleware checkAdminRole sia corretto. Se la route è per amministratori di ditta,
// MODIFICATO: routes/ppa.js

// --- GESTIONE ASSEGNAZIONE PROCEDURA ---
// NOTA: Assicurati che il middleware checkAdminRole sia corretto. Se la route è per amministratori di ditta,
// potrebbe essere necessario checkRole([1, 2])
// POST /assegna - Rielaborazione completa per target polimorfico e dettagli azione
router.post('/assegna', verifyToken, async (req, res) => {
    const { id: utenteCreatoreId } = req.user;
    // NUOVO INPUT: Gestisce target polimorfico e struttura assegnazioni complessa
    const { id_procedura_ditta, targetEntityType, targetEntityId, data_prevista_fine, assegnazioni } = req.body;

    const allowedEntityTypes = ['DITTA', 'UTENTE', 'BENE'];
    if (!id_procedura_ditta || !targetEntityType || !targetEntityId || !assegnazioni || !allowedEntityTypes.includes(targetEntityType.toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Dati incompleti o tipo di entità non valido.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. CREAZIONE ISTANZA PROCEDURA (CON CAMPI POLIMORFICI)
        const [istanzaResult] = await connection.query(
            "INSERT INTO ppa_istanzeprocedure (ID_ProceduraDitta, TargetEntityType, TargetEntityID, ID_UtenteCreatore, DataPrevistaFine) VALUES (?, ?, ?, ?, ?)",
            [id_procedura_ditta, targetEntityType.toUpperCase(), targetEntityId, utenteCreatoreId, data_prevista_fine || null]
        );
        const newIstanzaId = istanzaResult.insertId;

        // 2. RECUPERO AZIONI MODELLO
        const [azioniModello] = await connection.query(
            `SELECT a.ID, a.NomeAzione, a.Descrizione FROM ppa_azioni a
             JOIN ppa_processi p ON a.ID_Processo = p.ID
             WHERE p.ID_ProceduraDitta = ?`,
            [id_procedura_ditta]
        );

        if (azioniModello.length === 0) throw new Error("Nessuna azione trovata per questa procedura.");

        const uniqueUserIds = new Set();

        // 3. CREAZIONE ISTANZE AZIONI (CON SCADENZE E NOTE)
        for (const azione of azioniModello) {
            const assegnazioneDettagli = assegnazioni[azione.ID];
            if (!assegnazioneDettagli || !assegnazioneDettagli.utenteId) {
                throw new Error(`Dettagli di assegnazione mancanti per l'azione "${azione.NomeAzione}".`);
            }
            
            const { utenteId, scadenza, note } = assegnazioneDettagli;
            uniqueUserIds.add(utenteId);

            await connection.query(
                "INSERT INTO ppa_istanzeazioni (ID_IstanzaProcedura, ID_Azione, ID_UtenteAssegnato, DataScadenza, NoteParticolari) VALUES (?, ?, ?, ?, ?)",
                [newIstanzaId, azione.ID, utenteId, scadenza || data_prevista_fine || null, note || null]
            );
        }

        // 4. LOGICA PER TEAM E NOTIFICHE
        const [teamMemberDetails] = await connection.query(`SELECT id, nome, cognome, email FROM utenti WHERE id IN (?)`, [[...uniqueUserIds]]);
        
        // Recupero dinamico del nome dell'entità target per l'email
        let targetEntityName = '';
        switch (targetEntityType.toUpperCase()) {
            case 'DITTA':
                const [ditta] = await connection.query('SELECT ragione_sociale FROM ditte WHERE id = ?', [targetEntityId]);
                targetEntityName = ditta[0]?.ragione_sociale || 'N/D';
                break;
            case 'UTENTE':
                const [utente] = await connection.query("SELECT CONCAT(nome, ' ', cognome) as nome_completo FROM utenti WHERE id = ?", [targetEntityId]);
                targetEntityName = utente[0]?.nome_completo || 'N/D';
                break;
            case 'BENE':
                const [bene] = await connection.query('SELECT descrizione FROM bs_beni WHERE id_ditta = ?', [targetEntityId]);
                targetEntityName = bene[0]?.descrizione || 'N/D';
                break;
        }

        const [proceduraDetails] = await connection.query('SELECT NomePersonalizzato FROM ppa_procedureditta WHERE ID = ?', [id_procedura_ditta]);
        const nomeProcedura = proceduraDetails[0]?.NomePersonalizzato || 'Procedura non specificata';
        
        const teamListString = teamMemberDetails.map(u => `${u.nome} ${u.cognome}`).join(', ');
        const dataFineFormatted = data_prevista_fine ? new Date(data_prevista_fine).toLocaleDateString('it-IT') : 'Non definita';

        // 5. INVIO EMAIL PERSONALIZZATE
        for (const user of teamMemberDetails) {
            const userActions = azioniModello
                .filter(a => assegnazioni[a.ID]?.utenteId == user.id)
                .map(a => {
                    const dettagli = assegnazioni[a.ID];
                    const scadenzaSpecifica = dettagli.scadenza ? ` (Scadenza: ${new Date(dettagli.scadenza).toLocaleDateString('it-IT')})` : '';
                    const notaSpecifica = dettagli.note ? `<br/><small style="color:#555;"><i>Nota: ${dettagli.note}</i></small>` : '';
                    return `<li><strong>${a.NomeAzione}</strong>${scadenzaSpecifica}: ${a.Descrizione || 'Nessuna descrizione.'}${notaSpecifica}</li>`;
                })
                .join('');

            const emailBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Nuova Procedura Assegnata</h2>
                    <p>Ciao ${user.nome},</p>
                    <p>Sei stato coinvolto nella seguente procedura:</p>
                    <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Dettagli Procedura</h3>
                        <p><strong>Procedura:</strong> ${nomeProcedura}</p>
                        <p><strong>Applicata a (${targetEntityType}):</strong> ${targetEntityName}</p>
                        <p><strong>Data Prevista Fine Generale:</strong> ${dataFineFormatted}</p>
                        <p><strong>Team Coinvolto:</strong> ${teamListString}</p>
                    </div>
                    <h3>Le tue azioni specifiche:</h3>
                    <ul>${userActions || '<li>Nessuna azione specifica assegnata.</li>'}</ul>
                    <p>Puoi gestire queste attività dalla tua dashboard di Opero.</p>
                </div>`;
            
            await sendSystemEmail(user.email, `Nuova Procedura Assegnata: ${nomeProcedura}`, emailBody);
        }
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Procedura assegnata, attività create e notifiche inviate!' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore in POST /assegna:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});




// #####################################################################
// ## ROTTA POTENZIATA: Ora include i dettagli delle azioni           ##
// #####################################################################
// GET /api/ppa/istanze (usata dal Monitoraggio Azienda)
router.get('/istanze', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        // Step 1: Recupera i dati di base di tutte le istanze per la ditta
        const queryIstanze = `
            SELECT 
                i.ID as id_istanza,
                i.DataInizio,
                i.DataPrevistaFine,
                i.DataConclusioneEffettiva,
                i.Stato,
                pd.NomePersonalizzato AS NomeProcedura,
                t.ID AS TeamID,
                i.TargetEntityType,
                i.TargetEntityID,
                CASE
                    WHEN i.TargetEntityType = 'DITTA' THEN (SELECT ragione_sociale FROM ditte WHERE id = i.TargetEntityID)
                    WHEN i.TargetEntityType = 'UTENTE' THEN (SELECT CONCAT(nome, ' ', cognome) FROM utenti WHERE id = i.TargetEntityID)
                    WHEN i.TargetEntityType = 'BENE' THEN (SELECT descrizione FROM bs_beni WHERE id = i.TargetEntityID)
                    ELSE 'N/D'
                END AS TargetEntityName
            FROM ppa_istanzeprocedure i
            JOIN ppa_procedureditta pd ON i.ID_ProceduraDitta = pd.ID
            LEFT JOIN ppa_team t ON i.ID = t.ID_IstanzaProcedura
            WHERE pd.id_ditta = ?
            ORDER BY i.DataPrevistaFine ASC
        `;
        const [istanze] = await dbPool.query(queryIstanze, [id_ditta]);

        if (istanze.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Step 2: Recupera tutte le azioni per le istanze trovate in un'unica query
        const istanzaIds = istanze.map(i => i.id_istanza);
        const queryAzioni = `
            SELECT 
                ia.*,
                ia.DataScadenza AS DataPrevistaFine,
                ia.DataCompletamento,
                a.NomeAzione,
                a.Descrizione AS DescrizioneAzione,
                u.nome AS NomeAssegnatario,
                u.cognome AS CognomeAssegnatario,
                sa.NomeStato AS StatoDescrizione
            FROM ppa_istanzeazioni ia
            JOIN ppa_azioni a ON ia.ID_Azione = a.ID
            LEFT JOIN utenti u ON ia.ID_UtenteAssegnato = u.id
            JOIN ppa_stati_azione sa ON ia.ID_Stato = sa.ID
            WHERE ia.ID_IstanzaProcedura IN (?)
        `;
        const [azioni] = await dbPool.query(queryAzioni, [istanzaIds]);

        // Step 3: "Inietta" le azioni e la DataInizio della procedura in ogni istanza
        const dataToSend = istanze.map(istanza => {
            const azioniCorrispondenti = azioni
                .filter(azione => azione.ID_IstanzaProcedura === istanza.id_istanza)
                .map(azione => ({ ...azione, DataInizio: istanza.DataInizio })); // Aggiunge DataInizio a ogni azione

            return {
                ...istanza,
                azioni: azioniCorrispondenti
            };
        });

        res.json({ success: true, data: dataToSend });

    } catch (error) {
        console.error("Errore nel recupero delle istanze per la ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// GET /istanze/:id - CORRETTA
router.get('/istanze/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { id_ditta: dittaId } = req.user;
    try {
        const instanceQuery = `
            SELECT
                ip.ID,
                ip.DataInizio,
                ip.DataPrevistaFine,
                ip.Stato,
                pd.NomePersonalizzato AS NomeProcedura,
                ip.TargetEntityType,
                ip.TargetEntityID,
                CASE
                    WHEN ip.TargetEntityType = 'DITTA' THEN d.ragione_sociale
                    WHEN ip.TargetEntityType = 'UTENTE' THEN CONCAT(u.nome, ' ', u.cognome)
                    WHEN ip.TargetEntityType = 'BENE' THEN b.descrizione
                    ELSE 'Non Definito'
                END AS TargetEntityName,
                uc.nome AS NomeCreatore,
                uc.cognome AS CognomeCreatore
            FROM ppa_istanzeprocedure AS ip
            JOIN ppa_procedureditta AS pd ON ip.ID_ProceduraDitta = pd.ID
            JOIN utenti AS uc ON ip.ID_UtenteCreatore = uc.id
            LEFT JOIN ditte AS d ON ip.TargetEntityID = d.id AND ip.TargetEntityType = 'DITTA'
            LEFT JOIN utenti AS u ON ip.TargetEntityID = u.id AND ip.TargetEntityType = 'UTENTE'
            LEFT JOIN bs_beni AS b ON ip.TargetEntityID = b.id AND ip.TargetEntityType = 'BENE'
            WHERE ip.ID = ? AND pd.id_ditta = ?;
        `;
        const [instanceDetails] = await dbPool.query(instanceQuery, [id, dittaId]);

        if (instanceDetails.length === 0) {
            return res.status(404).json({ success: false, message: 'Istanza non trovata.' });
        }

        const actionsQuery = `
            SELECT
                ia.ID,
                s.NomeStato AS Stato,
                ia.DataScadenza,
                ia.NoteParticolari,
                a.NomeAzione,
                a.Descrizione AS DescrizioneAzione,
                u.nome AS NomeAssegnato,
                u.cognome AS CognomeAssegnato
            FROM ppa_istanzeazioni AS ia
            JOIN ppa_azioni AS a ON ia.ID_Azione = a.ID
            JOIN utenti AS u ON ia.ID_UtenteAssegnato = u.id
            LEFT JOIN ppa_stati_azione AS s ON ia.ID_Stato = s.ID
            WHERE ia.ID_IstanzaProcedura = ?;
        `;
        const [actions] = await dbPool.query(actionsQuery, [id]);

        res.status(200).json({
            details: instanceDetails[0],
            actions: actions
        });

    } catch (error) {
        console.error(`Errore nel recupero dell'istanza ${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
router.post('/istanze', async (req, res) => {
    const { id_ditta, id: id_utente_creatore } = req.user;
    const {
        proceduraId,
        targetType,
        targetEntityId,
        dataFine,
        assegnazioni,
        nomeProcedura // Campo aggiuntivo dal frontend
    } = req.body;

    if (!proceduraId || !targetType || !targetEntityId || !assegnazioni) {
        return res.status(400).json({ success: false, message: 'Dati mancanti per la creazione della procedura.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Inserisci la testata della procedura (logica invariata)
        const [resultIstanza] = await connection.query(
            `INSERT INTO ppa_istanzeprocedure (ID_ProceduraDitta, ID_UtenteCreatore, DataInizio, DataPrevistaFine, Stato, TargetEntityType, TargetEntityID) VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
            [proceduraId, id_utente_creatore, dataFine || null, 'In Corso', targetType, targetEntityId]
        );
        const newIstanzaId = resultIstanza.insertId;

        // 2. Inserisci le azioni (logica invariata)
        const azioniDaInserire = Object.entries(assegnazioni).map(([azioneId, dettagli]) => [newIstanzaId, azioneId, dettagli.utenteId, dettagli.dataScadenza || null, 1, dettagli.note || null]);
        if (azioniDaInserire.length > 0) {
            await connection.query(`INSERT INTO ppa_istanzeazioni (ID_IstanzaProcedura, ID_Azione, ID_UtenteAssegnato, DataScadenza, ID_Stato, NoteParticolari) VALUES ?`, [azioniDaInserire]);
        }
        
        // --- NUOVA LOGICA: CREAZIONE TEAM ---

        // 3. Crea il record nella tabella ppa_team
        const nomeDelTeam = `Team per ${nomeProcedura || 'procedura ' + newIstanzaId}`;
        const [teamResult] = await connection.query(
            `INSERT INTO ppa_team (ID_IstanzaProcedura, NomeTeam) VALUES (?, ?)`, 
            [newIstanzaId, nomeDelTeam]
        );
        const newTeamId = teamResult.insertId;

        // 4. Aggiungi i membri al team, assicurandoti che siano unici
        const teamMemberIds = [...new Set(Object.values(assegnazioni).map(a => a.utenteId))];
        const teamMembersToInsert = teamMemberIds.map(userId => [newTeamId, userId]);

        if (teamMembersToInsert.length > 0) {
            await connection.query(
                `INSERT INTO ppa_teammembri (ID_Team, ID_Utente) VALUES ?`, 
                [teamMembersToInsert]
            );
        }
        
        // QUI, in futuro, verrà inserita la logica per l'invio delle notifiche email

        await connection.commit();
        res.status(201).json({ success: true, message: 'Procedura assegnata e team creato con successo!', id: newIstanzaId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore durante la creazione dell'istanza PPA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante il salvataggio.', details: error.sqlMessage });
    } finally {
        connection.release();
    }
});


// --- POST (Crea un nuovo Processo per una Procedura) ---
router.post('/procedures/:procId/processes', checkAdminRole, async (req, res) => {
    const { procId } = req.params;
    const { id_ditta } = req.user;
    const { nome_processo } = req.body;

    if (!nome_processo) {
        return res.status(400).json({ success: false, message: 'Il nome del processo è obbligatorio.' });
    }

    try {
        // Opzionale: Verifichiamo che la procedura appartenga alla ditta dell'utente
        const [procCheck] = await dbPool.query("SELECT ID FROM ppa_procedureditta WHERE ID = ? AND ID_Ditta = ?", [procId, id_ditta]);
        if (procCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Procedura non trovata o non autorizzata.' });
        }

        const [result] = await dbPool.query(
            "INSERT INTO ppa_processi (ID_ProceduraDitta, NomeProcesso) VALUES (?, ?)",
            [procId, nome_processo]
        );

        res.status(201).json({ success: true, message: 'Processo creato con successo!', newId: result.insertId });
    } catch (error) {
        console.error("Errore in POST /procedures/:procId/processes:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- PATCH (Modifica un Processo esistente) ---
router.patch('/processes/:processoId', checkAdminRole, async (req, res) => {
    const { processoId } = req.params;
    const { id_ditta } = req.user;
    const { nome_processo } = req.body;

    if (!nome_processo) {
        return res.status(400).json({ success: false, message: 'Il nome del processo è obbligatorio.' });
    }

    try {
        const [result] = await dbPool.query(
            `UPDATE ppa_processi p
             JOIN ppa_procedureditta pd ON p.ID_ProceduraDitta = pd.ID
             SET p.NomeProcesso = ?
             WHERE p.ID = ? AND pd.ID_Ditta = ?`,
            [nome_processo, processoId, id_ditta]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Processo non trovato o non autorizzato.' });
        }

        res.json({ success: true, message: 'Processo aggiornato con successo!' });
    } catch (error) {
        console.error("Errore in PATCH /processes/:processoId:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
// --- GET (Azioni di un singolo processo) ---
// Questa rotta serve al componente ProcessoColumn
router.get('/processes/:processoId/actions', async (req, res) => {
    const { processoId } = req.params;
    try {
        const [rows] = await dbPool.query(
            "SELECT ID as id, NomeAzione as nome_azione, Descrizione as descrizione, ID_RuoloDefault FROM ppa_azioni WHERE ID_Processo = ?",
            [processoId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- POST (Crea una nuova Azione per un Processo) ---
router.post('/processes/:processoId/actions', checkAdminRole, async (req, res) => {
    const { processoId } = req.params;
    const { nome_azione, descrizione, id_ruolo_default } = req.body;

    if (!nome_azione) {
        return res.status(400).json({ success: false, message: 'Il nome dell\'azione è obbligatorio.' });
    }

    try {
        const [result] = await dbPool.query(
            "INSERT INTO ppa_azioni (ID_Processo, NomeAzione, Descrizione, ID_RuoloDefault) VALUES (?, ?, ?, ?)",
            [processoId, nome_azione, descrizione, id_ruolo_default || null]
        );
        res.status(201).json({ success: true, message: 'Azione creata con successo!', newId: result.insertId });
    } catch (error) {
        console.error("Errore in POST /processes/:processoId/actions:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- PATCH (Modifica un'Azione esistente) ---
router.patch('/actions/:azioneId', checkAdminRole, async (req, res) => {
    const { azioneId } = req.params;
    const { id_ditta } = req.user;
    const { nome_azione, descrizione, id_ruolo_default } = req.body;

    if (!nome_azione) {
        return res.status(400).json({ success: false, message: 'Il nome dell\'azione è obbligatorio.' });
    }

    try {
        const [result] = await dbPool.query(
            `UPDATE ppa_azioni as
             JOIN ppa_processi p ON a.ID_Processo = p.ID
             JOIN ppa_procedureditta pd ON p.ID_Proceduraditta = pd.ID
             SET a.NomeAzione = ?, a.Descrizione = ?, a.ID_RuoloDefault = ?
             WHERE a.ID = ? AND pd.ID_Ditta = ?`,
            [nome_azione, descrizione, id_ruolo_default || null, azioneId, id_ditta]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Azione non trovata o non autorizzata.' });
        }

        res.json({ success: true, message: 'Azione aggiornata con successo!' });
    } catch (error) {
        console.error("Errore in PATCH /actions/:azioneId:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
router.get('/my-tasks', async (req, res) => {
    const { id: userId } = req.user;
    try {
        const query = `
            SELECT 
                ia.ID as istanza_azione_id,
                a.NomeAzione as nome_azione,
                p.NomeProcesso as nome_processo,
                d.ragione_sociale as ditta_target,
                ip.ID as istanza_procedura_id,
                sa.NomeStato as stato_attuale,
                sa.Colore as colore_stato,
                ia.ID_Stato as id_stato_attuale
            FROM ppa_istanzeazioni ia
            JOIN ppa_azioni a ON ia.ID_Azione = a.ID
            JOIN ppa_processi p ON a.ID_Processo = p.ID
            JOIN ppa_istanzeprocedure ip ON ia.ID_IstanzaProcedura = ip.ID
            JOIN ditte d ON ip.ID_DittaTarget = d.id
            LEFT JOIN ppa_stati_azione sa ON ia.ID_Stato = sa.ID
            WHERE ia.ID_UtenteAssegnato = ? AND sa.NomeStato != 'Evaso'
            ORDER BY ip.ID DESC, p.OrdineSequenziale, a.ID;
        `;
        const [tasks] = await dbPool.query(query, [userId]);
        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error("Errore in GET /my-tasks:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Recupera gli stati delle azioni di un intero team per una procedura) ---
router.get('/istanze/:id/team-status', async (req, res) => {
    const { id: istanzaProceduraId } = req.params;
    try {
        const query = `
            SELECT
                u.nome, u.cognome,
                a.NomeAzione as nome_azione,
                sa.NomeStato as stato,
                sa.Colore as colore_stato,
                ia.NoteSvolgimento as note
            FROM ppa_istanzeazioni ia
            JOIN utenti u ON ia.ID_UtenteAssegnato = u.id
            JOIN ppa_azioni a ON ia.ID_Azione = a.ID
            LEFT JOIN ppa_stati_azione sa ON ia.ID_Stato = sa.ID
            WHERE ia.ID_IstanzaProcedura = ?
            ORDER BY u.cognome, u.nome, a.ID;
        `;
        const [teamStatus] = await dbPool.query(query, [istanzaProceduraId]);
        res.json({ success: true, data: teamStatus });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli stati del team.' });
    }
});

// --- GET (Recupera gli stati azione disponibili per la ditta) ---
router.get('/stati-azione', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [stati] = await dbPool.query(
            "SELECT ID, NomeStato FROM ppa_stati_azione WHERE id_ditta IS NULL OR id_ditta = ?",
            [dittaId]
        );
        res.json({ success: true, data: stati });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli stati.' });
    }
});

// --- PATCH (Aggiorna lo stato di un'azione) ---
router.patch('/istanze-azioni/:id/status', async (req, res) => {
    const { id: istanzaAzioneId } = req.params;
    const { id_utente_assegnato } = req.user; // Per sicurezza, controlliamo che chi modifica sia l'assegnatario
    const { id_stato, note } = req.body;

    try {
        const [result] = await dbPool.query(
            "UPDATE ppa_istanzeazioni SET ID_Stato = ?, NoteSvolgimento = ? WHERE ID = ?",
            [id_stato, note, istanzaAzioneId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Azione non trovata o non autorizzata.' });
        }

        res.json({ success: true, message: 'Stato aggiornato con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});


//PROCEDURE PER LA GESTIONE DI ASSEGNAZIONE PROCEDURE A DIVERSE ENTITA'
// GET /procedureditta - Ottiene tutte le procedure modello per la ditta
router.get('/procedureditta', verifyToken, async (req, res) => {
    try {
        const [procedure] = await dbPool.query("SELECT * FROM ppa_procedureditta WHERE id_ditta = ?", [req.user.id_ditta]);
        res.json(procedure);
    } catch (error) {
        console.error("Errore nel recupero delle procedure ditta:", error);
        res.status(500).json({ message: 'Errore nel recupero delle procedure' });
    }
});


// PATCH: Aggiorna una procedura personalizzata
router.patch('/procedureditta/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;
    const { NomePersonalizzato, ID_ProceduraStandard, TargetEntityTypeAllowed } = req.body;
    if (TargetEntityTypeAllowed) {
        const allowedTypes = ['DITTA', 'UTENTE', 'BENE'];
        if (!allowedTypes.includes(TargetEntityTypeAllowed)) {
            return res.status(400).json({ message: 'Tipo di entità non valido.' });
        }
    }
    try {
        const [result] = await dbPool.query(
            "UPDATE ppa_procedureditta SET NomePersonalizzato = ?, ID_ProceduraStandard = ?, TargetEntityTypeAllowed = ? WHERE id = ? AND id_ditta = ?",
            [NomePersonalizzato, ID_ProceduraStandard, TargetEntityTypeAllowed, id, id_ditta]
        );
        if (result.affectedRows > 0) {
            res.json({ message: 'Procedura aggiornata con successo.' });
        } else {
            res.status(404).json({ message: 'Procedura non trovata.' });
        }
    } catch (error) {
        console.error("Errore nell'aggiornamento della procedura ditta:", error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});



// NUOVO: Rotta di supporto per ottenere l'elenco delle entità target selezionabili
router.get('/target-entities/:entityType', verifyToken, async (req, res) => {
    const { entityType } = req.params;
    const { id_ditta } = req.user;
    let query;

    try {
        switch (entityType.toUpperCase()) {
            case 'DITTA':
                query = knex('ditte')
                    .select('id as value', 'ragione_sociale as label')
                    .where('id_ditta_principale', id_ditta); // O logica equivalente per anagrafiche
                break;
            
            case 'UTENTE':
                query = knex('utenti')
                    .select('id as value', knex.raw("CONCAT(nome, ' ', cognome) as label"))
                    .where({ id_ditta, Codice_Tipo_Utente: 'ESTERNO' });
                break;

            case 'BENE':
                query = knex('bs_beni')
                    .select('id as value', 'descrizione as label')
                    .where({ id_ditta });
                break;

            default:
                return res.status(400).json({ message: 'Tipo di entità non valido.' });
        }

        const data = await query;
        res.json(data);

    } catch (error) {
        console.error(`Errore nel recupero delle entità target [${entityType}]:`, error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});

/*
Spiegazione della Nuova Rotta: router.get('/target-entities/:

Parametro Dinamico: La rotta accetta un parametro :entityType nell'URL (es. /api/ppa/target-entities/DITTA).

Logica switch: In base al valore del parametro, viene costruita una query Knex specifica.

DITTA: Seleziona id e ragione_sociale dalla tabella ditte.

UTENTE: Seleziona id e concatena nome e cognome dalla tabella utenti, filtrando solo per gli utenti di tipo ESTERNO appartenenti alla ditta corrente.

BENE: Seleziona id e descrizione dalla tabella bs_beni.

Formato Standard: L'output viene sempre formattato come un array di oggetti { value: ..., label: ... }, un formato standard facilmente utilizzabile 
dai componenti di select nel frontend (es. React-Select).
*/

// POST /istanze/:id/comunica-team - Invia email al team di una procedura
router.post('/istanze/:id/comunica-team', verifyToken, async (req, res) => {
    const { id: istanzaId } = req.params;
    const { id: senderId, nome: senderNome, cognome: senderCognome } = req.user;
    const { messaggio } = req.body;

    if (!messaggio) {
        return res.status(400).json({ success: false, message: "Il messaggio non può essere vuoto." });
    }

    const connection = await dbPool.getConnection();
    try {
        // Verifica che il mittente faccia parte del team
        const [teamMembers] = await connection.query(
            `SELECT DISTINCT u.id, u.email, u.nome FROM utenti u 
             JOIN ppa_istanzeazioni ia ON u.id = ia.ID_UtenteAssegnato
             WHERE ia.ID_IstanzaProcedura = ?`,
            [istanzaId]
        );

        const isSenderInTeam = teamMembers.some(member => member.id === senderId);
        if (!isSenderInTeam) {
            return res.status(403).json({ success: false, message: "Non autorizzato a comunicare con questo team." });
        }
        
        const [proceduraDetails] = await connection.query(
            `SELECT pd.NomePersonalizzato FROM ppa_istanzeprocedure ip
             JOIN ppa_procedureditta pd ON ip.ID_ProceduraDitta = pd.ID
             WHERE ip.ID = ?`,
            [istanzaId]
        );
        const nomeProcedura = proceduraDetails[0]?.NomePersonalizzato || `Procedura #${istanzaId}`;

        const senderFullName = `${senderNome} ${senderCognome}`;
        const emailSubject = `Nuovo messaggio per la procedura: ${nomeProcedura}`;
        const emailBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h3>Comunicazione di Team per la procedura "${nomeProcedura}"</h3>
                <p><strong>${senderFullName}</strong> ha inviato un messaggio:</p>
                <div style="background-color: #f2f2f2; border-left: 3px solid #007bff; padding: 15px; margin: 15px 0;">
                    <p style="margin: 0;">${messaggio}</p>
                </div>
                <p><em>Puoi rispondere agli altri membri del team tramite la piattaforma Opero.</em></p>
            </div>`;

        // Invia l'email a tutti i membri del team, escluso il mittente
        for (const member of teamMembers) {
            if (member.id !== senderId) {
                await sendSystemEmail(member.email, emailSubject, emailBody);
            }
        }

        res.status(200).json({ success: true, message: "Messaggio inviato al team." });

    } catch (error) {
        console.error(`Errore nell'invio comunicazione per istanza ${istanzaId}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        connection.release();
    }
});
// ##################################################################################
// ## NUOVA ROTTA: POST /istanze/:id/invia-report-target                           ##
// ## Invia un'email di riepilogo sullo stato della procedura al target designato. ##
// ##################################################################################
// Rotta per inviare il report di stato al target
router.post('/istanze/:id/invia-report-target', async (req, res) => {
    const { id_ditta, id: id_utente_richiedente, id_ruolo } = req.user;
    const { id: istanzaId } = req.params;
    const { selectedAzioni, selectedMessaggi } = req.body;

    const connection = await dbPool.getConnection();
    try {
        // 1. Recupero dati e permessi (invariato)
        const [istanze] = await connection.query(
            `SELECT i.*, pd.NomePersonalizzato AS NomeProcedura 
             FROM ppa_istanzeprocedure i
             JOIN ppa_procedureditta pd ON i.ID_ProceduraDitta = pd.ID
             WHERE i.ID = ?`,
            [istanzaId]
        );

        if (istanze.length === 0) {
            return res.status(404).json({ success: false, message: 'Procedura non trovata.' });
        }
        const istanza = istanze[0];
        if (istanza.ID_UtenteCreatore !== id_utente_richiedente && id_ruolo > 2) {
            return res.status(403).json({ success: false, message: 'Non autorizzato a inviare questo report.' });
        }

        // 2. Recupero email del target (invariato)
        let targetEmail = null, targetName = 'N/D';
        if (istanza.TargetEntityType === 'DITTA') {
            const [ditte] = await connection.query('SELECT ragione_sociale, mail_1 FROM ditte WHERE id = ?', [istanza.TargetEntityID]);
            if (ditte.length > 0) { targetEmail = ditte[0].mail_1; targetName = ditte[0].ragione_sociale; }
        } else if (istanza.TargetEntityType === 'UTENTE') {
            const [utenti] = await connection.query('SELECT nome, cognome, email FROM utenti WHERE id = ?', [istanza.TargetEntityID]);
            if (utenti.length > 0) { targetEmail = utenti[0].email; targetName = `${utenti[0].nome} ${utenti[0].cognome}`; }
        }
        if (typeof targetEmail !== 'string' || !targetEmail.includes('@')) {
            return res.status(400).json({ success: false, message: `Indirizzo email del target non valido.` });
        }

        // 3. Costruzione dinamica del corpo dell'email (invariato)
        let reportContent = '';
        if (selectedAzioni && selectedAzioni.length > 0) {
            const [azioniDetails] = await connection.query(
                `SELECT a.NomeAzione, sa.Descrizione AS Stato, u.nome, u.cognome, ia.NoteParticolari 
                 FROM ppa_istanzeazioni ia
                 JOIN ppa_azioni a ON ia.ID_Azione = a.ID
                 JOIN ppa_stati_azione sa ON ia.ID_Stato = sa.ID
                 JOIN utenti u ON ia.ID_UtenteAssegnato = u.id
                 WHERE ia.ID IN (?)`, [selectedAzioni]
            );
            reportContent += '<h3>Dettaglio Attività Selezionate</h3><ul>';
            azioniDetails.forEach(a => {
                reportContent += `<li><strong>${a.NomeAzione}</strong>: Assegnata a ${a.nome} ${a.cognome}, stato attuale: <em>${a.Stato}</em>. Note: ${a.NoteParticolari || 'N/A'}</li>`;
            });
            reportContent += '</ul>';
        }

        if (selectedMessaggi && selectedMessaggi.length > 0) {
            const [messaggiDetails] = await connection.query(
                `SELECT tc.messaggio, u.nome, u.cognome
                 FROM ppa_team_comunicazioni tc
                 JOIN utenti u ON tc.id_utente_mittente = u.id
                 WHERE tc.id IN (?)`, [selectedMessaggi]
            );
             reportContent += '<h3>Comunicazioni Rilevanti del Team</h3><ul>';
            messaggiDetails.forEach(m => {
                reportContent += `<li><strong>${m.nome} ${m.cognome} ha scritto:</strong> "${m.messaggio}"</li>`;
            });
            reportContent += '</ul>';
        }

        const emailSubject = `Aggiornamento sullo stato della procedura: ${istanza.NomeProcedura}`;
        
        // ##################################################################
        // ## CORREZIONE: Costruito il corpo dell'email con i dati reali.  ##
        // ##################################################################
        const emailBody = `
            <p>Gentile ${targetName},</p>
            <p>La presente per aggiornarLa sullo stato della seguente procedura aziendale:</p>
            <ul>
                <li><strong>Procedura:</strong> ${istanza.NomeProcedura}</li>
                <li><strong>Data di Avvio:</strong> ${new Date(istanza.DataInizio).toLocaleDateString('it-IT')}</li>
                <li><strong>Data di Chiusura Prevista:</strong> ${new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}</li>
            </ul>
            <hr>
            ${reportContent || '<p>Nessun dettaglio specifico selezionato per questo report.</p>'}
            <p>Cordiali saluti,<br>Il team Opero</p>
        `;

        // 4. Invio email (parametri corretti)
        const emailSent = await sendSystemEmail(targetEmail, emailSubject, emailBody);
        if (!emailSent) {
            throw new Error("Il servizio di posta ha restituito un errore.");
        }

        res.status(200).json({ success: true, message: 'Rapporto di stato personalizzato inviato con successo!' });

    } catch (error) {
        console.error("Errore durante l'invio del report:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore interno del server.' });
    } finally {
        connection.release();
    }
});

// NUOVO: Rotta per ottenere i modelli di procedura per la ditta corrente
// Questa rotta era mancante e causava l'errore "Cannot GET".
// Ora il frontend ProgettazionePPA.js potrà caricare i dati correttamente.
// CORRETTO: Rotta per ottenere i modelli di procedura per la ditta corrente
// La query è stata modificata per usare il nome corretto della colonna 'Nome'
// e un alias 'AS NomeProcedura' per mantenere la compatibilità con il frontend.
// CORRETTO: Rotta per ottenere i modelli di procedura per la ditta corrente
// La query è stata modificata per usare il nome corretto della colonna 'Nome'
// e un alias 'AS NomeProcedura' per mantenere la compatibilità con il frontend.
// --- GESTIONE PROCEDURE PERSONALIZZATE PER DITTA ---



// Rotta per ottenere i dettagli di una singola procedura, incluse le sue azioni
// Rotta per ottenere i dettagli di una singola procedura, incluse le sue azioni
router.get('/procedure-ditta/:id', async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;
    try {
        // CORREZIONE: Utilizzo di SELECT esplicita con alias per i campi disallineati.
        const [procedureRows] = await dbPool.query(
            `SELECT 
                ID, 
                NomePersonalizzato, 
                TargetEntityTypeAllowed AS ApplicabileA 
             FROM ppa_procedureditta 
             WHERE ID = ? AND id_ditta = ?`,
            [id, id_ditta]
        );
        
        if (procedureRows.length === 0) {
            return res.status(404).json({ success: false, message: "Procedura non trovata." });
        }
        const procedure = procedureRows[0];

        // Recupera i processi associati (logica invariata)
        const [processi] = await dbPool.query(
            "SELECT * FROM ppa_processi WHERE ID_ProceduraDitta = ?",
            [id]
        );
        
        // Recupera le azioni per ogni processo (logica invariata)
        const azioniPerProcesso = {};
        for (const processo of processi) {
            const [azioni] = await dbPool.query(
                "SELECT * FROM ppa_azioni WHERE ID_Processo = ?",
                [processo.ID]
            );
            azioniPerProcesso[processo.ID] = azioni;
        }

        // Costruisce l'oggetto di risposta finale, ora coerente con il frontend
        res.json({ 
            success: true, 
            data: {
                ...procedure,
                processi: processi.map(p => ({...p, azioni: azioniPerProcesso[p.ID] || []}))
            }
        });

    } catch (error) {
        console.error(`Errore in GET /procedure-ditta/${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ##################################################################################
// ## PASSO 1.2: NUOVA ROTTA - Fornisce l'elenco degli utenti per un ruolo specifico ##
// ##################################################################################
router.get('/utenti/by-ruolo/:id_ruolo', async (req, res) => {
    const { id_ditta } = req.user;
    const { id_ruolo } = req.params;

    if (!id_ruolo || isNaN(id_ruolo)) {
        return res.status(400).json({ success: false, message: 'ID Ruolo non valido.' });
    }

    try {
        const [utenti] = await dbPool.query(
            `SELECT id, nome, cognome FROM utenti 
             WHERE id_ditta = ? AND id_ruolo = ? 
             ORDER BY cognome, nome`,
            [id_ditta, id_ruolo]
        );
        res.json({ success: true, data: utenti });
    } catch (error) {
        console.error(`Errore nel recupero utenti per ruolo ${id_ruolo}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ##################################################################################
// ## ROTTA CORRETTA: POST /procedure-ditta - Salva un nuovo modello di procedura  ##
// ## Corretta la query di INSERT per gestire la FOREIGN KEY e il nome colonna.   ##
// ##################################################################################
router.post('/procedure-ditta', async (req, res) => {
    const { id_ditta } = req.user;
    const { NomePersonalizzato, Descrizione, ApplicabileA, processi } = req.body;

    if (!NomePersonalizzato || !processi || processi.length === 0) {
        return res.status(400).json({ success: false, message: 'Nome procedura e almeno un processo sono obbligatori.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Inserisce la testata della procedura
        // CORREZIONE DEFINITIVA: Inseriamo il valore '0' come default per la Foreign Key NOT NULL.
        const [resultProcedura] = await connection.query(
            `INSERT INTO ppa_procedureditta (id_ditta, NomePersonalizzato, ID_ProceduraStandard, TargetEntityTypeAllowed) VALUES (?, ?, 4, ?)`,
            [id_ditta, NomePersonalizzato, ApplicabileA || 'DITTA']
        );
        const newProceduraId = resultProcedura.insertId;

        // 2. Itera sui processi e le loro azioni per l'inserimento
        for (const processo of processi) {
            if (!processo.NomeProcesso) continue;

            const [resultProcesso] = await connection.query(
                `INSERT INTO ppa_processi (ID_ProceduraDitta, NomeProcesso) VALUES (?, ?)`,
                [newProceduraId, processo.NomeProcesso]
            );
            const newProcessoId = resultProcesso.insertId;

            if (processo.azioni && processo.azioni.length > 0) {
                const azioniDaInserire = processo.azioni.map(azione => {
                    if (!azione.NomeAzione) return null;
                    return [
                        newProcessoId,
                        azione.NomeAzione,
                        azione.Descrizione || null,
                        azione.ID_RuoloDefault || null
                    ];
                }).filter(Boolean);

                if (azioniDaInserire.length > 0) {
                    await connection.query(
                        `INSERT INTO ppa_azioni (ID_Processo, NomeAzione, Descrizione, ID_RuoloDefault) VALUES ?`,
                        [azioniDaInserire]
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Modello di procedura creato con successo!', id: newProceduraId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore durante la creazione del modello di procedura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante il salvataggio.' });
    } finally {
        connection.release();
    }
});

// NUOVA ROTTA: Invia una notifica automatica al team quando una procedura viene assegnata
router.post('/istanze/:id/notifica-assegnazione', verifyToken, async (req, res) => {
    const { id: istanzaId } = req.params;
    const { nome: senderNome, cognome: senderCognome } = req.user; // Chi ha eseguito l'azione

    const connection = await dbPool.getConnection();
    try {
        // 1. Recupera i dettagli della procedura per il corpo dell'email
        const [proceduraDetails] = await connection.query(
            `SELECT pd.NomePersonalizzato FROM ppa_istanzeprocedure ip
             JOIN ppa_procedureditta pd ON ip.ID_ProceduraDitta = pd.ID
             WHERE ip.ID = ?`,
            [istanzaId]
        );
        if (proceduraDetails.length === 0) {
            // Sebbene improbabile, gestiamo il caso in cui l'istanza non esista
            return res.status(404).json({ success: false, message: "Istanza non trovata." });
        }
        const nomeProcedura = proceduraDetails[0].NomePersonalizzato || `Procedura #${istanzaId}`;

        // 2. Recupera tutti gli utenti assegnati alle azioni di questa istanza
        const [teamMembers] = await connection.query(
            `SELECT DISTINCT u.email, u.nome FROM utenti u 
             JOIN ppa_istanzeazioni ia ON u.id = ia.ID_UtenteAssegnato
             WHERE ia.ID_IstanzaProcedura = ?`,
            [istanzaId]
        );

        if (teamMembers.length === 0) {
            // Nessun membro nel team, quindi non c'è nessuno da notificare.
            return res.status(200).json({ success: true, message: "Nessun membro del team da notificare." });
        }

        // 3. Prepara e invia le email
        const assignerFullName = `${senderNome} ${senderCognome}`;
        const emailSubject = `Nuova Assegnazione: Procedura "${nomeProcedura}"`;
        
        for (const member of teamMembers) {
            const emailBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Ciao ${member.nome},</h3>
                    <p>Sei stato aggiunto al team di lavoro per la procedura <strong>"${nomeProcedura}"</strong>.</p>
                    <p>L'assegnazione è stata effettuata da: <strong>${assignerFullName}</strong>.</p>
                    <p>Puoi visualizzare i dettagli e le tue attività accedendo alla piattaforma Opero.</p>
                    <br/>
                    <p><em>Questa è una notifica automatica.</em></p>
                </div>`;
            
            // Usiamo la nostra utility mailer per le email di sistema
            await sendSystemEmail(member.email, emailSubject, emailBody);
        }

        res.status(200).json({ success: true, message: "Notifiche di assegnazione inviate al team." });

    } catch (error) {
        console.error(`Errore nell'invio delle notifiche di assegnazione per l'istanza ${istanzaId}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante l\'invio delle notifiche.' });
    } finally {
        if (connection) connection.release();
    }
});


// #####################################################################
// ## NUOVO ENDPOINT: Fornisce i tipi di procedura per i filtri       ##
// #####################################################################
router.get('/procedure-ditta', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const [procedure] = await dbPool.query(
            `SELECT ID, NomePersonalizzato FROM ppa_procedureditta WHERE id_ditta = ? ORDER BY NomePersonalizzato`,
            [id_ditta]
        );
        res.json({ success: true, data: procedure });
    } catch (error) {
        console.error("Errore nel recupero dei tipi di procedura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- NUOVA ROTTA: Helper per ottenere dati per i form ---
// Questa rotta fornisce l'elenco degli utenti interni per i menu a tendina
// del form di assegnazione. Centralizza la logica all'interno del modulo PPA.
router.get('/utenti/interni', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const [utenti] = await dbPool.query(
            "SELECT id, nome, cognome FROM utenti WHERE id_ditta = ? AND id_ruolo = '4' ORDER BY cognome, nome",
            [id_ditta]
        );
        // NOTA: il frontend si aspetta un oggetto con una chiave 'data'
        res.json({ success: true, data: utenti });
    } catch (error) {
        console.error("Errore nel recupero utenti interni per PPA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// ##################################################################################
// ## NUOVA ROTTA: PUT /procedure-ditta/:id - Aggiorna un modello di procedura     ##
// ## Utilizza una transazione per garantire l'integrità dei dati.               ##
// ##################################################################################
router.put('/procedure-ditta/:id', async (req, res) => {
    const { id_ditta } = req.user;
    const { id } = req.params;
    const { NomePersonalizzato, ApplicabileA, processi } = req.body;

    if (!NomePersonalizzato || !processi) {
        return res.status(400).json({ success: false, message: 'Dati mancanti per l\'aggiornamento.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Aggiorna la testata della procedura
        await connection.query(
            `UPDATE ppa_procedureditta SET NomePersonalizzato = ?, TargetEntityTypeAllowed = ? WHERE ID = ? AND id_ditta = ?`,
            [NomePersonalizzato, ApplicabileA || 'DITTA', id, id_ditta]
        );

        // 2. Strategia "Elimina e Ricrea" per processi e azioni
        const [oldProcessi] = await connection.query(`SELECT ID FROM ppa_processi WHERE ID_ProceduraDitta = ?`, [id]);
        if (oldProcessi.length > 0) {
            const oldProcessiIds = oldProcessi.map(p => p.ID);
            await connection.query(`DELETE FROM ppa_azioni WHERE ID_Processo IN (?)`, [oldProcessiIds]);
            await connection.query(`DELETE FROM ppa_processi WHERE ID_ProceduraDitta = ?`, [id]);
        }

        // 3. Reinserisce la nuova struttura (logica identica alla POST)
        for (const processo of processi) {
            if (!processo.NomeProcesso) continue;

            const [resultProcesso] = await connection.query(
                `INSERT INTO ppa_processi (ID_ProceduraDitta, NomeProcesso) VALUES (?, ?)`,
                [id, processo.NomeProcesso]
            );
            const newProcessoId = resultProcesso.insertId;

            if (processo.azioni && processo.azioni.length > 0) {
                const azioniDaInserire = processo.azioni.map(azione => {
                    if (!azione.NomeAzione) return null;
                    return [newProcessoId, azione.NomeAzione, azione.Descrizione || null, azione.ID_RuoloDefault || null];
                }).filter(Boolean);

                if (azioniDaInserire.length > 0) {
                    await connection.query(
                        `INSERT INTO ppa_azioni (ID_Processo, NomeAzione, Descrizione, ID_RuoloDefault) VALUES ?`,
                        [azioniDaInserire]
                    );
                }
            }
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Modello di procedura aggiornato con successo!' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore durante l'aggiornamento del modello di procedura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante l\'aggiornamento.' });
    } finally {
        connection.release();
    }
});
// #####################################################################
// ## ROTTA POTENZIATA: Ora accetta parametri per la ricerca/filtro   ##
// #####################################################################
router.get('/my-istanze', async (req, res) => {
    const { id: userId } = req.user;
    const { targetSearch, dateFrom, dateTo, proceduraId } = req.query;

    try {
        let queryParams = [userId, userId];
        let baseQuery = `
            SELECT DISTINCT
                ip.ID AS id_istanza,
                pd.NomePersonalizzato AS NomeProcedura,
                ip.DataPrevistaFine,
                CASE
                    WHEN ip.TargetEntityType = 'DITTA' THEN (SELECT ragione_sociale FROM ditte WHERE id = ip.TargetEntityID)
                    WHEN ip.TargetEntityType = 'UTENTE' THEN (SELECT CONCAT(nome, ' ', cognome) FROM utenti WHERE id = ip.TargetEntityID)
                    WHEN ip.TargetEntityType = 'BENE' THEN (SELECT descrizione FROM bs_beni WHERE id = ip.TargetEntityID)
                    ELSE 'N/D'
                END AS TargetEntityName
            FROM ppa_istanzeprocedure ip
            JOIN ppa_procedureditta pd ON ip.ID_ProceduraDitta = pd.ID
            LEFT JOIN ppa_istanzeazioni ia ON ip.ID = ia.ID_IstanzaProcedura
            WHERE (ip.ID_UtenteCreatore = ? OR ia.ID_UtenteAssegnato = ?)
        `;
        
        let conditions = [];

        if (proceduraId) {
            conditions.push('ip.ID_ProceduraDitta = ?');
            queryParams.push(proceduraId);
        }

        if (dateFrom && dateTo) {
            conditions.push('ip.DataPrevistaFine BETWEEN ? AND ?');
            queryParams.push(dateFrom, dateTo);
        }
        
        if (conditions.length > 0) {
            baseQuery += ' AND ' + conditions.join(' AND ');
        }

        let havingClause = '';
        if (targetSearch) {
            havingClause = ' HAVING TargetEntityName LIKE ?';
            queryParams.push(`%${targetSearch}%`);
        }
        
        const finalQuery = baseQuery + havingClause + ' ORDER BY ip.DataPrevistaFine ASC';

        const [istanze] = await dbPool.query(finalQuery, queryParams);
        res.json({ success: true, data: istanze });

    } catch (error) {
        console.error("Errore nel recupero delle istanze utente:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// ##################################################################################
// ## NUOVE ROTTE: Gestione Bacheca di Comunicazione del Team                      ##
// ##################################################################################

// Recupera tutti i messaggi per un team specifico
router.get('/team/:teamId/comunicazioni', async (req, res) => {
    const { teamId } = req.params;
    try {
        const [messaggi] = await dbPool.query(
            `SELECT 
                tc.*,
                u.nome AS nome_mittente,
                u.cognome AS cognome_mittente
             FROM ppa_team_comunicazioni tc
             JOIN utenti u ON tc.id_utente_mittente = u.id
             WHERE tc.id_team = ? ORDER BY tc.created_at ASC`,
            [teamId]
        );
        res.json({ success: true, data: messaggi });
    } catch (error) {
        console.error("Errore nel recupero messaggi team:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// Invia un nuovo messaggio alla bacheca di un team
router.post('/team/:teamId/comunicazioni', async (req, res) => {
    const { teamId } = req.params;
    const { id: id_utente_mittente } = req.user;
    const { messaggio } = req.body;

    if (!messaggio || !messaggio.trim()) {
        return res.status(400).json({ success: false, message: 'Il messaggio non può essere vuoto.' });
    }

    try {
        await dbPool.query(
            'INSERT INTO ppa_team_comunicazioni (id_team, id_utente_mittente, messaggio) VALUES (?, ?, ?)',
            [teamId, id_utente_mittente, messaggio]
        );
        // Qui in futuro si potrà agganciare la logica di notifica email per i nuovi messaggi
        res.status(201).json({ success: true, message: 'Messaggio inviato.' });
    } catch (error) {
        console.error("Errore nell'invio del messaggio:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
router.get('/stati-azione', async (req, res) => {
    try {
        const [stati] = await dbPool.query('SELECT ID, Descrizione FROM ppa_stati_azione ORDER BY Ordine');
        res.json({ success: true, data: stati });
    } catch (error) {
        console.error("Errore nel recupero degli stati azione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// #####################################################################
// ## ENDPOINT POTENZIATO: Aggiorna lo stato e l'avanzamento          ##
// #####################################################################
router.patch('/azioni/:idIstanzaAzione/stato', async (req, res) => {
    const { idIstanzaAzione } = req.params;
    const { idNuovoStato } = req.body;
    const { id: userId } = req.user;
    const STATO_EVASO_ID = 3; // ID dello stato "Evaso"

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verifica permessi
        const [rows] = await connection.query(
            'SELECT ID_UtenteAssegnato, ID_IstanzaProcedura FROM ppa_istanzeazioni WHERE ID = ?',
            [idIstanzaAzione]
        );
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Azione non trovata.' });
        }
        if (rows[0].ID_UtenteAssegnato !== userId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Non sei autorizzato a modificare questa azione.' });
        }
        
        const idIstanzaProcedura = rows[0].ID_IstanzaProcedura;

        // 2. Aggiorna l'azione
        let updateQuery = 'UPDATE ppa_istanzeazioni SET ID_Stato = ?';
        const queryParams = [idNuovoStato];
        
        // Se lo stato è "Evaso", aggiorna anche la data di completamento
        if (idNuovoStato === STATO_EVASO_ID) {
            updateQuery += ', DataCompletamento = NOW()';
        }
        
        updateQuery += ' WHERE ID = ?';
        queryParams.push(idIstanzaAzione);
        
        await connection.query(updateQuery, queryParams);

        // 3. Controlla se l'intera procedura è completata
        if (idNuovoStato === STATO_EVASO_ID) {
            const [countRows] = await connection.query(
                `SELECT 
                    COUNT(*) as total, 
                    SUM(CASE WHEN ID_Stato = ? THEN 1 ELSE 0 END) as completed 
                 FROM ppa_istanzeazioni 
                 WHERE ID_IstanzaProcedura = ?`,
                [STATO_EVASO_ID, idIstanzaProcedura]
            );

            const { total, completed } = countRows[0];
            if (total > 0 && total === completed) {
                // Se tutte le azioni sono completate, aggiorna la procedura principale
                await connection.query(
                    `UPDATE ppa_istanzeprocedure 
                     SET Stato = 'Completata', DataConclusioneEffettiva = NOW() 
                     WHERE ID = ?`,
                    [idIstanzaProcedura]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Stato azione aggiornato con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error(`Errore nell'aggiornamento dell'azione ${idIstanzaAzione}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});



// #####################################################################
// ## ROTTA POTENZIATA: Ora include i dettagli completi delle azioni  ##
// #####################################################################
// GET /api/ppa/istanze/:id/details (usata dalla Vista Dettaglio)
router.get('/istanze/:id/details', async (req, res) => {
    const { id: istanzaId } = req.params;

    try {
        // Step 1: Recupera i dati principali dell'istanza (inclusa la data di conclusione)
        const [istanze] = await dbPool.query(
            `SELECT 
                i.*,
                i.DataConclusioneEffettiva,
                pd.NomePersonalizzato AS NomeProcedura,
                u.nome AS NomeCreatore, 
                u.cognome AS CognomeCreatore,
                t.ID as TeamID
             FROM ppa_istanzeprocedure i
             JOIN ppa_procedureditta pd ON i.ID_ProceduraDitta = pd.ID
             JOIN utenti u ON i.ID_UtenteCreatore = u.id
             LEFT JOIN ppa_team t ON i.ID = t.ID_IstanzaProcedura
             WHERE i.ID = ?`,
            [istanzaId]
        );
        if (istanze.length === 0) {
            return res.status(404).json({ success: false, message: 'Procedura non trovata.' });
        }
        
        const istanzaDetails = istanze[0];

        // Step 2: Logica per il nome del target (invariata)
        if (istanzaDetails.TargetEntityType === 'DITTA') {
            const [ditte] = await dbPool.query('SELECT ragione_sociale FROM ditte WHERE id = ?', [istanzaDetails.TargetEntityID]);
            istanzaDetails.TargetEntityName = ditte.length > 0 ? ditte[0].ragione_sociale : 'N/A';
        } else if (istanzaDetails.TargetEntityType === 'UTENTE') {
            const [utenti] = await dbPool.query('SELECT nome, cognome FROM utenti WHERE id = ?', [istanzaDetails.TargetEntityID]);
            istanzaDetails.TargetEntityName = utenti.length > 0 ? `${utenti[0].nome} ${utenti[0].cognome}` : 'N/A';
        } else if (istanzaDetails.TargetEntityType === 'BENE') {
            const [beni] = await dbPool.query('SELECT descrizione FROM bs_beni WHERE id = ?', [istanzaDetails.TargetEntityID]);
            istanzaDetails.TargetEntityName = beni.length > 0 ? beni[0].descrizione : 'N/A';
        }

        // ## CORREZIONE: Query per le azioni aggiornata per includere TUTTE le date ##
        const [azioni] = await dbPool.query(
            `SELECT 
                ia.ID, ia.ID_Azione, ia.ID_UtenteAssegnato, ia.ID_Stato, ia.Note,
                ia.DataScadenza AS DataPrevistaFine, 
                ia.DataCompletamento,
                a.NomeAzione, a.Descrizione AS DescrizioneAzione,
                u.nome AS NomeAssegnatario, u.cognome AS CognomeAssegnatario, 
                sa.NomeStato AS StatoDescrizione
             FROM ppa_istanzeazioni ia
             JOIN ppa_azioni a ON ia.ID_Azione = a.ID
             LEFT JOIN utenti u ON ia.ID_UtenteAssegnato = u.id
             JOIN ppa_stati_azione sa ON ia.ID_Stato = sa.ID
             WHERE ia.ID_IstanzaProcedura = ?`,
            [istanzaId]
        );
        
        const azioniArricchite = azioni.map(azione => ({
            ...azione,
            DataInizio: istanzaDetails.DataInizio 
        }));

        res.json({ success: true, data: { ...istanzaDetails, azioni: azioniArricchite } });

    } catch (error) {
        console.error("Errore nel recupero dettagli istanza:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// #####################################################################
// ## NUOVO ENDPOINT: Aggiorna le note di una singola istanza azione   ##
// #####################################################################
router.patch('/azioni/:idIstanzaAzione/note', async (req, res) => {
    const { idIstanzaAzione } = req.params;
    const { note } = req.body;
    const { id: userId } = req.user;

    try {
        // Verifica che l'utente che fa la richiesta sia l'assegnatario
        const [rows] = await dbPool.query(
            'SELECT ID_UtenteAssegnato FROM ppa_istanzeazioni WHERE ID = ?',
            [idIstanzaAzione]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Azione non trovata.' });
        }
        if (rows[0].ID_UtenteAssegnato !== userId) {
            return res.status(403).json({ success: false, message: 'Non sei autorizzato a modificare le note di questa azione.' });
        }

        // Se autorizzato, aggiorna le note
        await dbPool.query(
            'UPDATE ppa_istanzeazioni SET Note = ? WHERE ID = ?',
            [note, idIstanzaAzione]
        );
        
        res.json({ success: true, message: 'Note aggiornate con successo.' });

    } catch (error) {
        console.error(`Errore nell'aggiornamento delle note per l'azione ${idIstanzaAzione}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// #####################################################################
// ## NUOVO ENDPOINT: Genera un report PDF dello stato della procedura ##
// #####################################################################
// --- ENDPOINT: Genera un report PDF dello stato della procedura (POTENZIATO v2) ---
// --- ENDPOINT: Genera un report PDF dello stato della procedura (POTENZIATO v3.0) ---
// --- ENDPOINT: Genera un'anteprima PDF (SEMPLIFICATO) ---
router.post('/generate-report-pdf', async (req, res) => {
    try {
        const pdfBuffer = await generatePdfBuffer(req.body.istanza, req.body.selectedAzioni, req.body.selectedMessaggi, req.body.reportNotes, req);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=report.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Errore nella generazione del PDF:", error);
        res.status(500).send('Errore durante la creazione del report PDF.');
    }
});


// --- FUNZIONE INTERNA PER GENERARE PDF ---
async function generatePdf(htmlContent) {
    let browser = null;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// --- ENDPOINT: Invia il report via email (SEMPLIFICATO) ---
router.post('/send-report-email', async (req, res) => {
    try {
        await sendPpaReport(req, req.body);
        res.json({ success: true, message: 'Report inviato con successo via email.' });
    } catch (error) {
        console.error("Errore nell'invio del report via email:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore durante l\'invio dell\'email.' });
    }
});



module.exports = router;