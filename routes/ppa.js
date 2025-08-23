// #####################################################################
// # Rotte per la Gestione del Sistema PPA - v1.7 (Versione Stabile)
// # File: opero/routes/ppa.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { sendSystemEmail } = require('../utils/mailer'); // Assicurati che il mailer esista
const router = express.Router();

router.use(verifyToken);

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
        const [rows] = await dbPool.query("SELECT ID as id, Descrizione as descrizione FROM PPA_ProcedureStandard ORDER BY Descrizione");
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
        const [rows] = await dbPool.query("SELECT ID as id, NomePersonalizzato as nome_personalizzato FROM PPA_ProcedureDitta WHERE ID_Ditta = ? ORDER BY NomePersonalizzato", [id_ditta]);
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
        const [result] = await dbPool.query("INSERT INTO PPA_ProcedureDitta (ID_Ditta, ID_ProceduraStandard, NomePersonalizzato) VALUES (?, ?, ?)", [id_ditta, id_procedura_standard, nome_personalizzato]);
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
            FROM PPA_Processi p
            JOIN PPA_ProcedureDitta pd ON p.ID_ProceduraDitta = pd.ID
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
            FROM PPA_Azioni a
            JOIN PPA_Processi p ON a.ID_Processo = p.ID
            WHERE p.ID_ProceduraDitta = ?`;
        const [rows] = await dbPool.query(query, [procId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /full-actions:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GESTIONE ASSEGNAZIONE PROCEDURA ---
router.post('/assegna', checkAdminRole, async (req, res) => {
    const { id: utenteCreatoreId, id_ditta: dittaId } = req.user;
    const { id_procedura_ditta, id_ditta_target, data_prevista_fine, assegnazioni } = req.body;

    if (!id_procedura_ditta || !id_ditta_target || !assegnazioni) {
        return res.status(400).json({ success: false, message: 'Dati incompleti.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [istanzaResult] = await connection.query(
            "INSERT INTO PPA_IstanzeProcedure (ID_ProceduraDitta, ID_DittaTarget, ID_UtenteCreatore, DataPrevistaFine) VALUES (?, ?, ?, ?)",
            [id_procedura_ditta, id_ditta_target, utenteCreatoreId, data_prevista_fine || null]
        );
        const newIstanzaId = istanzaResult.insertId;

        const [azioniModello] = await connection.query(
            `SELECT a.ID, a.NomeAzione, a.Descrizione FROM PPA_Azioni a
             JOIN PPA_Processi p ON a.ID_Processo = p.ID
             WHERE p.ID_ProceduraDitta = ?`,
            [id_procedura_ditta]
        );

        if (azioniModello.length === 0) throw new Error("Nessuna azione trovata per questa procedura.");

        for (const azione of azioniModello) {
            const utenteAssegnatoId = assegnazioni[azione.ID];
            if (!utenteAssegnatoId) throw new Error(`Azione "${azione.NomeAzione}" non assegnata.`);
            const [istanzaAzioneResult] = await connection.query(
                "INSERT INTO PPA_IstanzeAzioni (ID_IstanzaProcedura, ID_Azione, ID_UtenteAssegnato, DataScadenza) VALUES (?, ?, ?, ?)",
                [newIstanzaId, azione.ID, utenteAssegnatoId, data_prevista_fine || null]
            );
            const newIstanzaAzioneId = istanzaAzioneResult.insertId;
            await connection.query(
                `INSERT INTO attivita (id_ditta, titolo, descrizione, data_scadenza, id_utente_creatore, id_utente_assegnato, ID_IstanzaAzione) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [dittaId, azione.NomeAzione, azione.Descrizione, data_prevista_fine || null, utenteCreatoreId, utenteAssegnatoId, newIstanzaAzioneId]
            );
        }

        const teamName = `Team Procedura #${newIstanzaId} - ${new Date().toLocaleDateString()}`;
        const [teamResult] = await connection.query("INSERT INTO PPA_Team (ID_IstanzaProcedura, NomeTeam) VALUES (?, ?)", [newIstanzaId, teamName]);
        const newTeamId = teamResult.insertId;

        const uniqueUserIds = [...new Set(Object.values(assegnazioni))];
        const teamMembersValues = uniqueUserIds.map(userId => [newTeamId, userId]);
        await connection.query("INSERT INTO PPA_TeamMembri (ID_Team, ID_Utente) VALUES ?", [teamMembersValues]);

        const [teamMemberDetails] = await connection.query(`SELECT id, nome, cognome, email FROM utenti WHERE id IN (?)`, [uniqueUserIds]);
        const [proceduraDetails] = await connection.query(
            `SELECT pd.NomePersonalizzato, d.ragione_sociale as DittaTarget 
             FROM PPA_IstanzeProcedure ip
             JOIN PPA_ProcedureDitta pd ON ip.ID_ProceduraDitta = pd.ID
             JOIN ditte d ON ip.ID_DittaTarget = d.id 
             WHERE ip.ID = ?`, [newIstanzaId]
        );
        
        const teamListString = teamMemberDetails.map(u => `${u.nome} ${u.cognome}`).join(', ');
       // Formattiamo la data per una migliore leggibilità
        const dataFineFormatted = data_prevista_fine 
            ? new Date(data_prevista_fine).toLocaleDateString('it-IT') 
            : 'Non definita';

        for (const user of teamMemberDetails) {
            const userActions = azioniModello.filter(a => assegnazioni[a.ID] == user.id).map(a => `<li>${a.NomeAzione}</li>`).join('');
const emailBody = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Nuova Procedura Assegnata</h2>
                    <p>Ciao ${user.nome},</p>
                    <p>Sei stato aggiunto a un team di lavoro per la seguente procedura:</p>
                    
                    <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Dettagli Procedura</h3>
                        <p><strong>Procedura:</strong> ${proceduraDetails[0].NomePersonalizzato}</p>
                        <p><strong>Applicata a:</strong> ${proceduraDetails[0].DittaTarget}</p>
                        <p><strong>Data Prevista Fine:</strong> ${dataFineFormatted}</p>
                        <p><strong>Team Coinvolto:</strong> ${teamListString}</p>
                    </div>
                      <h3>Le tue azioni specifiche:</h3>
                    <ul>
                        ${userActions || '<li>Al momento non ti sono state assegnate azioni specifiche.</li>'}
                    </ul>
                    <p>Puoi visualizzare e gestire queste attività nella tua dashboard di Opero.</p>
                </div>
            `;
            
            await sendSystemEmail(user.email, `Nuova Procedura Assegnata: ${proceduraDetails[0].NomePersonalizzato}`, emailBody);
        }
        await connection.commit();
        res.status(201).json({ success: true, message: 'Procedura assegnata, attività create e notifiche inviate!' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore in POST /assegna:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore interno del server.' });
    } finally {
        connection.release();
    }
});

// --- ROTTE PER L'ARCHIVIO ---
router.get('/istanze', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const query = `
            SELECT ip.ID as id, pd.NomePersonalizzato as nome_procedura, d.ragione_sociale as ditta_target, ip.DataInizio as data_inizio, ip.Stato as stato
            FROM PPA_IstanzeProcedure ip
            JOIN PPA_ProcedureDitta pd ON ip.ID_ProceduraDitta = pd.ID
            JOIN ditte d ON ip.ID_DittaTarget = d.id
            WHERE pd.ID_Ditta = ? ORDER BY ip.DataInizio DESC`;
        const [rows] = await dbPool.query(query, [id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /istanze:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.get('/istanze/:id/team', async (req, res) => {
    const { id: istanzaId } = req.params;
    try {
        const query = `
            SELECT u.nome, u.cognome, u.email 
            FROM PPA_TeamMembri tm
            JOIN utenti u ON tm.ID_Utente = u.id
            JOIN PPA_Team t ON tm.ID_Team = t.ID
            WHERE t.ID_IstanzaProcedura = ?`;
        const [rows] = await dbPool.query(query, [istanzaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore in GET /istanze/:id/team:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
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
        const [procCheck] = await dbPool.query("SELECT ID FROM PPA_ProcedureDitta WHERE ID = ? AND ID_Ditta = ?", [procId, id_ditta]);
        if (procCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'Procedura non trovata o non autorizzata.' });
        }

        const [result] = await dbPool.query(
            "INSERT INTO PPA_Processi (ID_ProceduraDitta, NomeProcesso) VALUES (?, ?)",
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
            `UPDATE PPA_Processi p
             JOIN PPA_ProcedureDitta pd ON p.ID_ProceduraDitta = pd.ID
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
            "SELECT ID as id, NomeAzione as nome_azione, Descrizione as descrizione, ID_RuoloDefault FROM PPA_Azioni WHERE ID_Processo = ?",
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
            "INSERT INTO PPA_Azioni (ID_Processo, NomeAzione, Descrizione, ID_RuoloDefault) VALUES (?, ?, ?, ?)",
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
            `UPDATE PPA_Azioni a
             JOIN PPA_Processi p ON a.ID_Processo = p.ID
             JOIN PPA_ProcedureDitta pd ON p.ID_ProceduraDitta = pd.ID
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
module.exports = router;
