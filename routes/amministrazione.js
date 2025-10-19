// #####################################################################
// # Rotte per il Modulo Amministrazione - v3.6 (Logica Conti Dinamici)
// # File: opero/routes/amministrazione.js
// #####################################################################
const fs = require('fs');
const path = require('path');
const LOG_FILE = path.join(__dirname, '..', 'debug_log.txt');
const { knex } = require('../config/db'); 

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken,checkPermission ,checkRole} = require('../utils/auth');
// ## FIX DEFINITIVO: Importiamo l'intero modulo 'crypto' ##
// Questo è il modo più stabile per garantire che tutte le funzioni siano disponibili.
const crypto = require('crypto');
const router = express.Router();
const nodemailer = require('nodemailer'); // ## FIX: Aggiunto import mancante ##
// --- Middleware per controllo livello utente ---
const checkLevel = (req, res, next) => {
    if (req.user.livello <= 95) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente per questa operazione.' });
    }
    next();
};
const mailer = require('../utils/mailer'); // ++ FIX: Aggiunto import mancante ++
const { v4: uuidv4 } = require('uuid'); // Per generare token unici
// --- Configurazione Cifratura (dal tuo .env) ---
// ## FIX: Garantiamo che la chiave sia sempre di 32 byte ##
// Usiamo un hash SHA-256 per derivare una chiave di lunghezza fissa e sicura
// dalla chiave segreta fornita nel file .env, indipendentemente dalla sua lunghezza originale.
const secret = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_chars_!!';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
const IV_LENGTH = 16;
const canManageAdminSettings = (req, res, next) => {
    if (req.user.livello <= 90) {
        return res.status(403).json({ success: false, message: 'Accesso negato. Livello utente non sufficiente.' });
    }
    next();
};
const isDittaAdmin = checkRole([1, 2]); // 1: Amministratore_sistema, 2: Ditta Admin

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// --- Funzione Helper CORRETTA per trovare il prossimo SOTTOCONTO ---
async function findNextAvailableSottoconto(dittaId, idPadre, connection) {
    // 1. Ottieni il codice del conto padre (es. '20.05')
    const [padreRows] = await connection.query('SELECT codice FROM sc_piano_dei_conti WHERE id = ?', [idpadre]);
    if (padreRows.length === 0) throw new Error('Conto padre non trovato.');
    const codicePadre = padreRows[0].codice;

    // 2. Trova l'ultimo numero progressivo usato per quel padre NELLA NUOVA TABELLA
    const query = `
        SELECT MAX(CAST(SUBSTRING_INDEX(codice, '.', -1) AS UNSIGNED)) as last_progressivo
        FROM sc_piano_dei_conti 
        WHERE id_ditta = ? AND id_padre = ?
    `;
    const [rows] = await connection.query(query, [dittaId, idPadre]);
    const lastProgressivo = rows[0].last_progressivo || 0;
    
    // 3. Genera il nuovo codice completo
    const nuovoProgressivo = (lastProgressivo + 1).toString().padStart(3, '0');
    return `${codicePadre}.${nuovoProgressivo}`;
}
// route conti mastro

//router.get('/conti/:mastro', verifyToken, async (req, res) => {
  router.get('/conti/:mastro',  async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { mastro } = req.params;
    // =================================================================
        // ## ALTRO BLOCCO DI DEBUG ##
       

    if (!dittaId || !mastro) {
        return res.status(400).json({ success: false, message: 'ID ditta e codice mastro sono richiesti.' });
    }

    try {
        const query = "SELECT id, codice, descrizione FROM conti WHERE id_ditta = ? AND codice LIKE ? ORDER BY codice ASC";
        const [rows] = await dbPool.query(query, [dittaId, `${mastro}%`]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(`Errore nel recuperare i conti per il mastro ${mastro}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --------------------------------------------------------------------
// GET /relazioni - Ottiene i tipi di relazione (Cliente, Fornitore...)
// --------------------------------------------------------------------
router.get('/relazioni', verifyToken, async (req, res) => {
    try {
        const [relazioni] = await dbPool.query('SELECT * FROM relazioni_ditta ORDER BY descrizione');
        res.json({ success: true, data: relazioni });
    } catch (error) {
        console.error("Errore nel recupero delle relazioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});





// ####################################################################
// #                          ANAGRAFICHE (DITTE)                     #
// ####################################################################


// ####################################################################
// #                          ANAGRAFICHE (DITTE)                     #
// ####################################################################

// --------------------------------------------------------------------
// GET /anagrafiche - Ottiene lista anagrafiche con codici sottoconto
// --------------------------------------------------------------------
router.get('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { tipo } = req.query;

    try {
        let query = `
            SELECT 
                d.id, d.ragione_sociale, d.p_iva, d.codice_fiscale,
                d.citta, d.stato, rd.descrizione as relazione,
                scc.codice AS codice_cliente,
                scf.codice AS codice_fornitore,
                scpv.codice AS codice_puntovendita
            FROM ditte d
            LEFT JOIN relazioni_ditta rd ON d.codice_relazione = rd.codice
            LEFT JOIN sc_piano_dei_conti scc ON d.id_sottoconto_cliente = scc.id
            LEFT JOIN sc_piano_dei_conti scf ON d.id_sottoconto_fornitore = scf.id
            LEFT JOIN sc_piano_dei_conti scpv ON d.id_sottoconto_puntovendita = scpv.id
            WHERE d.id_ditta_proprietaria = ?
        `;
        const params = [id_ditta];

        if (tipo) {
            const codiciRelazioneMap = {
                'clienti': ['C', 'E'],
                'fornitori': ['F', 'E']
            };
            if (codiciRelazioneMap[tipo]) {
                const codiciRelazione = codiciRelazioneMap[tipo];
                 query += ` AND d.codice_relazione IN (${codiciRelazione.map(() => '?').join(',')})`;
                 params.push(...codiciRelazione);
            }
        }
        
        query += ' ORDER BY d.ragione_sociale';

        const [ditte] = await dbPool.query(query, params);
        res.json({ success: true, data: ditte });

    } catch (error) {
        console.error("Errore nel recupero delle anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.', details: error });
    }
});


// --------------------------------------------------------------------
// GET /anagrafiche/:id - Ottiene dettaglio di una singola anagrafica
// --------------------------------------------------------------------
router.get('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { id } = req.params;

    try {
        const [rows] = await dbPool.query(
            'SELECT * FROM ditte WHERE id = ? AND id_ditta_proprietaria = ?',
            [id, id_ditta]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Anagrafica non trovata o non autorizzata.' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Errore nel recupero del dettaglio anagrafica:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --------------------------------------------------------------------
// POST /anagrafiche - Crea una nuova anagrafica e sottoconti collegati
// --------------------------------------------------------------------
router.post('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const anagraficaData = req.body;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const creaSottocontoTransazionale = async (idPadre, descrizione, natura) => {
            console.log(`Tentativo creazione sottoconto per id_ditta: ${id_ditta}, id_padre: ${idPadre}, descrizione: ${descrizione}`);
            
            let nuovoCodice;
            
            // Logica specifica per Clienti e Fornitori con codifica MM.CC.SSTT
            if (idPadre === 6 || idPadre === 14) {
                const mastroCodice = (idPadre === 6) ? '20' : '40';
                const contoCodice = '05';
                const codiceBase = `${mastroCodice}.${contoCodice}`;
                natura = (idPadre === 6) ? 'Attività' : 'Passività'; 
                // <span style="color:green;">// FIX: La query ora calcola il MAX progressivo numerico per evitare errori di duplicazione.</span>
                const [maxProgResult] = await connection.query(
                    `SELECT MAX(CAST(SUBSTRING_INDEX(codice, '.', -1) AS UNSIGNED)) as max_prog
                     FROM sc_piano_dei_conti 
                     WHERE id_ditta = ? AND id_padre = ? AND codice LIKE ?`,
                    [id_ditta, idPadre, `${codiceBase}.%`]
                );
                
                const progressivo = (maxProgResult[0].max_prog || 0) + 1;
                nuovoCodice = `${codiceBase}.${progressivo.toString().padStart(4, '0')}`;

            } else { 
                // Logica di fallback robusta per tutti gli altri casi
                const [mastroPadreRows] = await connection.query('SELECT codice FROM sc_piano_dei_conti WHERE id = ?', [idPadre]);
                if (mastroPadreRows.length === 0) throw new Error(`Conto padre con id ${idPadre} non trovato.`);
                
                const codiceMastro = mastroPadreRows[0].codice;
                const [maxProgResult] = await connection.query(
                    `SELECT MAX(CAST(SUBSTRING(codice, LENGTH(?) + 1) AS UNSIGNED)) as max_prog 
                     FROM sc_piano_dei_conti WHERE id_ditta = ? AND id_padre = ? AND codice LIKE ?`,
                    [codiceMastro, id_ditta, idPadre, `${codiceMastro}%`]
                );
                
                const progressivo = (maxProgResult[0].max_prog || 0) + 1;
                nuovoCodice = codiceMastro + progressivo.toString().padStart(3, '0');
            }

            console.log(`Nuovo codice generato: ${nuovoCodice}`);
            tipo="sottoconto"
            const [result] = await connection.query(
                'INSERT INTO sc_piano_dei_conti (id_ditta, codice, id_padre, descrizione, natura, tipo) VALUES (?,?, ?, ?, ?, ?)',
                [id_ditta, nuovoCodice, idPadre, descrizione, natura,tipo]
            );
            return result.insertId;
        };

        let idSottocontoCliente = null;
        let idSottocontoFornitore = null;
        let idSottocontoPuntoVendita = null;

        const { codice_relazione, ragione_sociale } = anagraficaData;

        if (codice_relazione === 'C' || codice_relazione === 'E') {
            idSottocontoCliente = await creaSottocontoTransazionale(6, ragione_sociale, 'C');
        }
        if (codice_relazione === 'F' || codice_relazione === 'E') {
            idSottocontoFornitore = await creaSottocontoTransazionale(14, ragione_sociale, 'F');
        }
        if (codice_relazione === 'P') {
            idSottocontoPuntoVendita = await creaSottocontoTransazionale(23, ragione_sociale, 'P');
        }

        const dittaDataToInsert = {
            ...anagraficaData,
            id_ditta_proprietaria: id_ditta,
            id_sottoconto_cliente: idSottocontoCliente,
            id_sottoconto_fornitore: idSottocontoFornitore,
            id_sottoconto_puntovendita: idSottocontoPuntoVendita,
            id_tipo_ditta: 2,
        };

        const [result] = await connection.query('INSERT INTO ditte SET ?', dittaDataToInsert);
        await connection.commit();
        res.status(201).json({ success: true, message: 'Anagrafica creata con successo.', id: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error('Errore creazione anagrafica e sottoconti:', error);
        res.status(500).json({ success: false, message: `Errore creazione anagrafica e sottoconti: ${error.message}` });
    } finally {
        connection.release();
    }
});


// ... (il resto del file rimane invariato)
// --------------------------------------------------------------------
// PATCH /anagrafiche/:id - Aggiorna un'anagrafica e gestisce dinamicamente i sottoconti
// --------------------------------------------------------------------
router.patch('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { id } = req.params;
    const anagraficaData = req.body;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const [currentAnagraficaRows] = await connection.query(
            'SELECT * FROM ditte WHERE id = ? AND id_ditta_proprietaria = ?',
            [id, id_ditta]
        );

        if (currentAnagraficaRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
        const currentAnagrafica = currentAnagraficaRows[0];
        
        const dataToUpdate = { ...anagraficaData };

        if (anagraficaData.codice_relazione && anagraficaData.codice_relazione !== currentAnagrafica.codice_relazione) {
            
            const creaSottocontoTransazionale = async (idPadre, descrizione, natura) => {
                let nuovoCodice;
                if (idPadre === 6 || idPadre === 14) {
                    const mastroCodice = (idPadre === 6) ? '20' : '40';
                    const contoCodice = '05';
                    const codiceBase = `${mastroCodice}.${contoCodice}`;
                    const [maxProgResult] = await connection.query(`SELECT MAX(CAST(SUBSTRING_INDEX(codice, '.', -1) AS UNSIGNED)) as max_prog FROM sc_piano_dei_conti WHERE id_ditta = ? AND id_padre = ? AND codice LIKE ?`, [id_ditta, idPadre, `${codiceBase}.%`]);
                    const progressivo = (maxProgResult[0].max_prog || 0) + 1;
                    nuovoCodice = `${codiceBase}.${progressivo.toString().padStart(4, '0')}`;
                } else {
                    const [mastroPadreRows] = await connection.query('SELECT codice FROM sc_piano_dei_conti WHERE id = ?', [idPadre]);
                    if (mastroPadreRows.length === 0) throw new Error(`Conto padre con id ${idPadre} non trovato.`);
                    const codiceMastro = mastroPadreRows[0].codice;
                    const [maxProgResult] = await connection.query(`SELECT MAX(CAST(SUBSTRING(codice, LENGTH(?) + 1) AS UNSIGNED)) as max_prog FROM sc_piano_dei_conti WHERE id_ditta = ? AND id_padre = ? AND codice LIKE ?`, [codiceMastro, id_ditta, idPadre, `${codiceMastro}%`]);
                    const progressivo = (maxProgResult[0].max_prog || 0) + 1;
                    nuovoCodice = codiceMastro + progressivo.toString().padStart(3, '0');
                }
                const [result] = await connection.query('INSERT INTO sc_piano_dei_conti (id_ditta, codice, id_padre, descrizione, natura) VALUES (?, ?, ?, ?, ?)', [id_ditta, nuovoCodice, idPadre, descrizione, natura]);
                return result.insertId;
            };

            const nuovaRagioneSociale = anagraficaData.ragione_sociale || currentAnagrafica.ragione_sociale;
            
            if (['C', 'E'].includes(anagraficaData.codice_relazione) && !currentAnagrafica.id_sottoconto_cliente) {
                dataToUpdate.id_sottoconto_cliente = await creaSottocontoTransazionale(6, nuovaRagioneSociale, 'C');
            }
            
            if (['F', 'E'].includes(anagraficaData.codice_relazione) && !currentAnagrafica.id_sottoconto_fornitore) {
                dataToUpdate.id_sottoconto_fornitore = await creaSottocontoTransazionale(14, nuovaRagioneSociale, 'F');
            }

            if (anagraficaData.codice_relazione === 'P' && !currentAnagrafica.id_sottoconto_puntovendita) {
                dataToUpdate.id_sottoconto_puntovendita = await creaSottocontoTransazionale(23, nuovaRagioneSociale, 'P');
            }
        }
        
        await connection.query('UPDATE ditte SET ? WHERE id = ?', [dataToUpdate, id]);

        if (anagraficaData.ragione_sociale && anagraficaData.ragione_sociale !== currentAnagrafica.ragione_sociale) {
            const sottocontiIds = [
                currentAnagrafica.id_sottoconto_cliente,
                currentAnagrafica.id_sottoconto_fornitore,
                currentAnagrafica.id_sottoconto_puntovendita,
                dataToUpdate.id_sottoconto_cliente,
                dataToUpdate.id_sottoconto_fornitore,
                dataToUpdate.id_sottoconto_puntovendita
            ].filter((value, index, self) => value && self.indexOf(value) === index);

            if (sottocontiIds.length > 0) {
                await connection.query(
                    'UPDATE sc_piano_dei_conti SET descrizione = ? WHERE id IN (?)',
                    [anagraficaData.ragione_sociale, sottocontiIds]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore nell'aggiornamento dell'anagrafica:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        connection.release();
    }
});



// --- GET (Lista Utenti della Ditta) ---
// --- ROTTA: GET (Lista Utenti per la Ditta) --- (MODIFICATA PER DEBUG)
router.get('/utenti', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;

  
    try {
        const query = `
            SELECT u.id, u.nome, u.cognome, u.email, u.livello, r.tipo as tipo_ruolo, u.attivo
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.id_ditta = ?
            ORDER BY u.cognome, u.nome
        `;
        const [users] = await dbPool.query(query, [id_ditta]);
        
        // =================================================================
        // ## ALTRO BLOCCO DI DEBUG ##
      

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Errore nel recupero utenti:", error);
        res.status(500).json({ success: false, message: 'Errore durante il recupero degli utenti.' });
    }
});

// --- NUOVA ROTTA: GET (Piano dei Conti Strutturato) ---
router.get('/piano-dei-conti', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    if (!dittaId) return res.status(400).json({ success: false, message: 'ID ditta non trovato.' });

    try {
        // ## FIX 1: La tabella 'mastri' non ha una colonna 'id'. La sua chiave è 'codice'.
        const [mastri] = await dbPool.query('SELECT codice, descrizione FROM mastri WHERE id_ditta = ? ORDER BY codice', [dittaId]);
        
        // ## FIX 2: La tabella 'conti' si collega a 'mastri' tramite 'codice_mastro', non 'id_mastro'.
        const [conti] = await dbPool.query('SELECT id, codice_mastro, codice, descrizione FROM conti WHERE id_ditta = ? ORDER BY codice', [dittaId]);
        
        const [sottoconti] = await dbPool.query('SELECT id, id_conto, codice, descrizione FROM sottoconti WHERE id_ditta = ? ORDER BY codice', [dittaId]);

        // ## FIX 3: Strutturiamo i dati usando le chiavi corrette.
        const pianoDeiConti = mastri.map(mastro => ({
            ...mastro,
            conti: conti.filter(c => c.codice_mastro === mastro.codice).map(conto => ({
                ...conto,
                sottoconti: sottoconti.filter(sc => sc.id_conto === conto.id)
            }))
        }));

        res.json({ success: true, data: pianoDeiConti });
    } catch (error) {
        console.error("Errore nel recupero del piano dei conti:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GETTERS (Mastri, Conti, Sottoconti) ---
router.get('/mastri', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [data] = await dbPool.query('SELECT codice, descrizione, tipo, gruppo FROM mastri WHERE id_ditta = ? ORDER BY codice', [dittaId]);
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore recupero mastri.' }); }
});
router.get('/conti', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [data] = await dbPool.query('SELECT id, codice, descrizione, codice_mastro FROM conti WHERE id_ditta = ? ORDER BY codice', [dittaId]);
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore recupero conti.' }); }
});

router.get('/sottoconti', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [data] = await dbPool.query('SELECT id, codice, descrizione, id_conto FROM sottoconti WHERE id_ditta = ? ORDER BY codice', [dittaId]);
        res.json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore recupero sottoconti.' }); }
});
// --- POST (Creazione) ---
router.post('/mastri', [verifyToken, checkLevel], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { codice, descrizione, tipo, gruppo } = req.body;
    try {
        await dbPool.query('INSERT INTO mastri (id_ditta, codice, descrizione, tipo, gruppo) VALUES (?, ?, ?, ?, ?)', [dittaId, codice, descrizione, tipo, gruppo]);
        res.status(201).json({ success: true, message: 'Mastro creato con successo.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore creazione mastro.' }); }
});
// (Le rotte POST per conti e sottoconti verranno aggiunte se necessario)

// --- PATCH (Modifica) ---
router.patch('/mastri/:codice', [verifyToken, checkLevel], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { codice } = req.params;
    const { descrizione, tipo, gruppo } = req.body;
    try {
        await dbPool.query('UPDATE mastri SET descrizione = ?, tipo = ?, gruppo = ? WHERE id_ditta = ? AND codice = ?', [descrizione, tipo, gruppo, dittaId, codice]);
        res.json({ success: true, message: 'Mastro aggiornato.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore aggiornamento mastro.' }); }
});

router.patch('/conti/:id', [verifyToken, checkLevel], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    const { descrizione } = req.body;
    try {
        await dbPool.query('UPDATE conti SET descrizione = ? WHERE id_ditta = ? AND id = ?', [descrizione, dittaId, id]);
        res.json({ success: true, message: 'Conto aggiornato.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore aggiornamento conto.' }); }
});

router.patch('/sottoconti/:id', [verifyToken, checkLevel], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    const { descrizione } = req.body;
    try {
        await dbPool.query('UPDATE sottoconti SET descrizione = ? WHERE id_ditta = ? AND id = ?', [descrizione, dittaId, id]);
        res.json({ success: true, message: 'Sottoconto aggiornato.' });
    } catch (error) { res.status(500).json({ success: false, message: 'Errore aggiornamento sottoconto.' }); }
});

// ====================================================================
// =================== GESTIONE ACCOUNT EMAIL =========================
// ====================================================================

const checkMailPermission = (req, res, next) => {
    if (req.user.livello <= 90) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente.' });
    }
    // Qui potremmo anche verificare un permesso specifico come 'MAIL_ACCOUNTS_EDIT'
    next();
};

// --- GET (Lista Account Email) ---
router.get('/mail-accounts', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [accounts] = await dbPool.query('SELECT id, nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user FROM ditta_mail_accounts WHERE id_ditta = ?', [dittaId]);
        res.json({ success: true, data: accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli account email.' });
    }
});

// --- POST (Crea Account Email) ---
router.post('/mail-accounts', [verifyToken, checkMailPermission], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user, auth_pass } = req.body;
    
    if (!auth_pass) return res.status(400).json({ success: false, message: 'La password è obbligatoria.' });
    const encryptedPass = encrypt(auth_pass);

    try {
        const query = 'INSERT INTO ditta_mail_accounts (id_ditta, nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user, auth_pass) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await dbPool.query(query, [dittaId, nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user, encryptedPass]);
        res.status(201).json({ success: true, message: 'Account email creato con successo.' });
    } catch (error) {
        console.error("Errore creazione mail account:", error);
        res.status(500).json({ success: false, message: 'Errore nella creazione dell\'account.' });
    }
});

// --- PATCH (Modifica Account Email) ---
router.patch('/mail-accounts/:id', [verifyToken, checkMailPermission], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    const { nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user, auth_pass } = req.body;

    let encryptedPass;
    if (auth_pass) {
        encryptedPass = encrypt(auth_pass);
    }

    try {
        let query = 'UPDATE ditta_mail_accounts SET nome_account = ?, email_address = ?, imap_host = ?, imap_port = ?, smtp_host = ?, smtp_port = ?, auth_user = ?';
        const params = [nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user];

        if (encryptedPass) {
            query += ', auth_pass = ?';
            params.push(encryptedPass);
        }

        query += ' WHERE id = ? AND id_ditta = ?';
        params.push(id, dittaId);

        const [result] = await dbPool.query(query, params);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Account email aggiornato.' });
        } else {
            res.status(404).json({ success: false, message: 'Account non trovato.' });
        }
    } catch (error) {
        console.error("Errore modifica mail account:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});

// --- DELETE (Elimina Account Email) ---
router.delete('/mail-accounts/:id', [verifyToken, checkMailPermission], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    try {
        const [result] = await dbPool.query('DELETE FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?', [id, dittaId]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Account email eliminato.' });
        } else {
            res.status(404).json({ success: false, message: 'Account non trovato.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione.' });
    }
});

// --- NUOVA ROTTA: POST (Test Connessione Account Email) ---
router.post('/mail-accounts/test', [verifyToken, checkMailPermission], async (req, res) => {
    const { smtp_host, smtp_port, auth_user, auth_pass } = req.body;

    if (!smtp_host || !smtp_port || !auth_user || !auth_pass) {
        return res.status(400).json({ success: false, message: 'Tutti i campi sono richiesti per il test.' });
    }

    // Configura il transporter di Nodemailer per il test
    const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: smtp_port,
        secure: smtp_port === 465, // true for 465, false for other ports
        auth: {
            user: auth_user,
            pass: auth_pass,
        },
        tls: {
            rejectUnauthorized: false // Spesso necessario per server con certificati self-signed
        }
    });

    // Verifica la connessione e le credenziali
    transporter.verify((error, success) => {
        if (error) {
            console.error("Errore test connessione SMTP:", error);
            return res.status(500).json({ success: false, message: `Connessione fallita: ${error.message}` });
        }
        res.json({ success: true, message: 'Connessione SMTP riuscita!' });
    });
});

// ====================================================================
// =================== GESTIONE UTENTI ================================
// ====================================================================

// --- NUOVA ROTTA: POST (Genera Link di Registrazione per un Nuovo Utente) ---
// POST /api/amministrazione/utenti/genera-link-registrazione
// Genera un link di auto-registrazione per una ditta.
// Un System Admin può specificare l'id_ditta, altrimenti usa quella dell'utente.
router.post('/utenti/genera-link-registrazione', verifyToken, async (req, res) => {
    const { id_ruolo, id_ditta: dittaUtenteLoggato } = req.user;
    const { id_ditta: dittaTarget } = req.body; // id_ditta dal corpo della richiesta

    let dittaId;

    // Un System Admin può generare un link per qualsiasi ditta.
    if (id_ruolo === 1 && dittaTarget) {
        dittaId = dittaTarget;
    } else {
        // Altrimenti, si usa la ditta dell'utente che fa la richiesta.
        dittaId = dittaUtenteLoggato;
    }

    if (!dittaId) {
        return res.status(400).json({ success: false, message: 'ID ditta non specificato o non valido.' });
    }
    
    try {
        const token = uuidv4();
        const scadenza = new Date();
        scadenza.setDate(scadenza.getDate() + 7); // Il link scade tra 7 giorni

        await knex('registration_tokens').insert({
            id_ditta: dittaId,
            token: token,
            scadenza: scadenza
        });

        // Utilizza una variabile d'ambiente per l'URL del frontend, con un fallback per lo sviluppo.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const registrationLink = `${frontendUrl}/register/${token}`;

        res.json({ success: true, link: registrationLink });

    } catch (error) {
        console.error("Errore nella generazione del link di registrazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Dettaglio Singolo Utente - Potenziata) ---
router.get('/utenti/:id', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: userId } = req.params;
    try {
        const [userRows] = await dbPool.query('SELECT * FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
        const userData = userRows[0];
        delete userData.password;

        const [assignedAccounts] = await dbPool.query('SELECT id_mail_account FROM utente_mail_accounts WHERE id_utente = ?', [userId]);
        const assignedMailAccountIds = assignedAccounts.map(a => a.id_mail_account);

        res.json({ success: true, data: { userData, assignedMailAccountIds } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei dettagli utente.' });
    }
});

// --- PATCH (Aggiorna Utente e Account Email - Potenziata) ---
router.patch('/utenti/:id', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: userId } = req.params;
    const { userData, mailAccountIds } = req.body;

    // Rimuoviamo i campi non modificabili o gestiti separatamente
    delete userData.id;
    delete userData.id_ditta;
    delete userData.email; // L'email non dovrebbe essere modificabile
    delete userData.password;
    delete userData.data_creazione;
    delete userData.data_ultimo_accesso;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('UPDATE utenti SET ? WHERE id = ? AND id_ditta = ?', [userData, userId, dittaId]);

        await connection.query('DELETE FROM utente_mail_accounts WHERE id_utente = ?', [userId]);
        if (mailAccountIds && mailAccountIds.length > 0) {
            const values = mailAccountIds.map(accountId => [userId, accountId]);
            await connection.query('INSERT INTO utente_mail_accounts (id_utente, id_mail_account) VALUES ?', [values]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Utente aggiornato con successo.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore aggiornamento utente:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    } finally {
        connection.release();
    }
});
// --- NUOVA ROTTA: GET (Lista Ruoli Assegnabili) ---
router.get('/ruoli-assegnabili', verifyToken, async (req, res) => {
    try {
        // Escludiamo l'Amministratore di Sistema (id_ruolo = 1)
        const [roles] = await dbPool.query("SELECT id, tipo FROM ruoli WHERE id != 1 ORDER BY tipo");
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});

// --- NUOVA ROTTA: GET (Lista Tipi Utente) ---
router.get('/tipi-utente', verifyToken, async (req, res) => {
    try {
        const [types] = await dbPool.query("SELECT codice, descrizione FROM tipi_utente ORDER BY descrizione");
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei tipi utente.' });
    }
});



// =====================================================================
// GESTIONE PROGRESSIVI
// =====================================================================
// GET /api/amministrazione/progressivi - Ottiene tutti i progressivi per la ditta
router.get('/progressivi', verifyToken, canManageAdminSettings, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        // <span style="color:green;">// MODIFICATO: Seleziona esplicitamente i campi per includere data_ult.</span>
        const [progressivi] = await dbPool.query(
            'SELECT id, codice_progressivo, descrizione, ultimo_numero, serie, data_ult, formato FROM an_progressivi WHERE id_ditta = ? ORDER BY codice_progressivo',
            [id_ditta]
        );
        res.json({ success: true, data: progressivi });
    } catch (error) {
        console.error("Errore nel recupero dei progressivi:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// POST /api/amministrazione/progressivi - Crea un nuovo progressivo
router.post('/progressivi', verifyToken, canManageAdminSettings, async (req, res) => {
    const { id_ditta } = req.user;
    // <span style="color:green;">// MODIFICATO: Aggiunto data_ult ai campi accettati.</span>
    const { codice_progressivo, descrizione, ultimo_numero, serie, data_ult } = req.body;

    if (!codice_progressivo || !descrizione || ultimo_numero === undefined) {
        return res.status(400).json({ success: false, message: 'Codice, descrizione e ultimo numero sono obbligatori.' });
    }

    try {
        // <span style="color:green;">// MODIFICATO: La query ora include il campo data_ult (se fornito).</span>
        const [result] = await dbPool.query(
            'INSERT INTO an_progressivi (id_ditta, codice_progressivo, descrizione, ultimo_numero, serie, data_ult) VALUES (?, ?, ?, ?, ?, ?)',
            [id_ditta, codice_progressivo.toUpperCase(), descrizione, parseInt(ultimo_numero), serie || null, data_ult || null]
        );
        res.status(201).json({ success: true, message: 'Progressivo creato con successo.', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Un progressivo con questo codice e serie esiste già.' });
        }
        console.error("Errore nella creazione del progressivo:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// PUT /api/amministrazione/progressivi/:id - Aggiorna un progressivo esistente
router.put('/progressivi/:id', verifyToken, canManageAdminSettings, async (req, res) => {
    const { id_ditta } = req.user;
    const { id } = req.params;
    // <span style="color:green;">// MODIFICATO: Aggiunto data_ult ai campi per l'aggiornamento.</span>
    const { descrizione, ultimo_numero, data_ult } = req.body;

    // <span style="color:green;">// MODIFICATO: Validazione estesa a data_ult.</span>
    if (!descrizione || ultimo_numero === undefined || !data_ult) {
        return res.status(400).json({ success: false, message: 'Descrizione, ultimo numero e data ultimo utilizzo sono obbligatori.' });
    }

    try {
        // <span style="color:green;">// MODIFICATO: La query di UPDATE ora gestisce anche data_ult.</span>
        const [result] = await dbPool.query(
            'UPDATE an_progressivi SET descrizione = ?, ultimo_numero = ?, data_ult = ? WHERE id = ? AND id_ditta = ?',
            [descrizione, parseInt(ultimo_numero), data_ult, id, id_ditta]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Progressivo non trovato o non appartenente alla ditta.' });
        }

        res.json({ success: true, message: 'Progressivo aggiornato con successo.' });
    } catch (error) {
        console.error("Errore nell'aggiornamento del progressivo:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});



// GET /api/amministrazione/ditte - Ottiene l'elenco delle ditte con filtri avanzati
// GET /api/amministrazione/ditte - Ottiene l'elenco delle ditte con filtri avanzati
router.get('/ditte', verifyToken, async (req, res) => {
    // <span style="color:red;">// NUOVO: LOG DI DIAGNOSTICA</span>
    // <span style="color:green;">// Questo messaggio deve apparire nel terminale del SERVER ogni volta che il frontend chiede l'elenco delle anagrafiche.</span>
    // <span style="color:green;">// Se non lo vedi, significa che il server sta eseguendo una versione vecchia di questo file.</span>
    console.log('[SERVER DEBUG] Ricevuta richiesta a /api/amministrazione/ditte');
    console.log('[SERVER DEBUG] Parametri ricevuti:', req.query);

    const { id_ditta } = req.user;
    const { relazioni } = req.query;

    try {
        let query = `
            SELECT d.id, d.ragione_sociale, d.citta, d.p_iva, d.codice_relazione,id_sottoconto_cliente,id_sottoconto_fornitore,id_sottoconto_puntovendita
            FROM ditte d 
            WHERE d.id_ditta_proprietaria = ? AND d.stato = 1
        `;
        const params = [id_ditta];

        if (relazioni) {
            const codiciRelazione = relazioni.split(',').map(r => r.trim());
            if (codiciRelazione.length > 0) {
                query += ' AND d.codice_relazione IN (?)';
                params.push(codiciRelazione);
                
            } else {
                return res.json({ success: true, data: [] });
            }
        } else {
            
            return res.json({ success: true, data: [] });
        }

        query += ' ORDER BY d.ragione_sociale';

        const [ditte] = await dbPool.query(query, params);
        res.json({ success: true, data: ditte });

    } catch (error) {
        console.error("Errore nel recupero delle anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


router.get('/ditta-info', verifyToken, async (req, res) => {
    // L'id_ditta viene estratto dal token JWT, garantendo che l'utente
    // possa vedere solo i dati della propria azienda.
    const { id_ditta } = req.user;
    try {
        const [rows] = await dbPool.query(
            'SELECT ragione_sociale, indirizzo, citta, mail_1, provincia, cap, p_iva, codice_fiscale FROM ditte WHERE id = ?',
            [id_ditta]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Dati della ditta non trovati.' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Errore nel recupero dei dati della ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});



// --- Middleware per controllo livello utente ---
// ... existing code ...

// #################################################
// #                API ALIQUOTE IVA               #
// #################################################

// --- GET /api/amministrazione/iva ---
// Recupera tutte le aliquote IVA per la ditta. Accessibile a tutti gli utenti autenticati.
router.get('/iva', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const aliquote = await knex('iva_contabili')
            .where({ id_ditta })
            .orderBy('aliquota');
        res.json({ success: true, data: aliquote });
    } catch (error) {
        console.error("Errore nel recupero delle aliquote IVA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- POST /api/amministrazione/iva ---
// Crea una nuova aliquota IVA. Richiede il permesso CT_IVA_MANAGE.
router.post('/iva', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_IVA_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }

    const { id_ditta, id: id_utente } = req.user;
    const { codice, descrizione, aliquota } = req.body;

    if (!codice || !descrizione || aliquota === undefined) {
        return res.status(400).json({ success: false, message: 'Codice, descrizione e aliquota sono obbligatori.' });
    }

    const trx = await knex.transaction();
    try {
        const [newId] = await trx('iva_contabili').insert({ id_ditta, codice, descrizione, aliquota });
        
        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Creazione Aliquota IVA',
            dettagli: `Creata nuova aliquota: ${codice} - ${descrizione} (${aliquota}%)`
        });

        await trx.commit();
        res.status(201).json({ success: true, message: 'Aliquota IVA creata con successo.', id: newId });
    } catch (error) {
        await trx.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: `Il codice IVA "${codice}" esiste già.` });
        }
        console.error("Errore nella creazione dell'aliquota IVA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- PATCH /api/amministrazione/iva/:id ---
// Modifica un'aliquota IVA esistente. Richiede il permesso CT_IVA_MANAGE.
router.patch('/iva/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_IVA_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }

    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    const { descrizione, aliquota } = req.body;

    const trx = await knex.transaction();
    try {
        const updated = await trx('iva_contabili')
            .where({ id, id_ditta })
            .update({ descrizione, aliquota });

        if (updated === 0) {
            await trx.rollback();
            return res.status(404).json({ success: false, message: 'Aliquota non trovata.' });
        }

        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Modifica Aliquota IVA',
            dettagli: `Modificata aliquota ID: ${id}`
        });

        await trx.commit();
        res.json({ success: true, message: 'Aliquota IVA aggiornata con successo.' });
    } catch (error) {
        await trx.rollback();
        console.error("Errore nell'aggiornamento dell'aliquota IVA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- DELETE /api/amministrazione/iva/:id ---
// Elimina un'aliquota IVA. Richiede il permesso CT_IVA_MANAGE.
router.delete('/iva/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_IVA_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }

    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;

    const trx = await knex.transaction();
    try {
        const deleted = await trx('iva_contabili').where({ id, id_ditta }).del();

        if (deleted === 0) {
            await trx.rollback();
            return res.status(404).json({ success: false, message: 'Aliquota non trovata.' });
        }
        
        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Eliminazione Aliquota IVA',
            dettagli: `Eliminata aliquota ID: ${id}`
        });

        await trx.commit();
        res.json({ success: true, message: 'Aliquota IVA eliminata con successo.' });
    } catch (error) {
        await trx.rollback();
        // Gestisce il caso in cui l'aliquota è usata da altre tabelle
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ success: false, message: 'Impossibile eliminare l\'aliquota perché è in uso.' });
        }
        console.error("Errore nell'eliminazione dell'aliquota IVA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ##################################################################
// #                      ROUTING FORNITORI                         #
// ##################################################################

// GET /api/amministrazione/fornitori - Recupera elenco fornitori per la ditta corrente
router.get('/fornitori', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;

    try {
        // Logica corretta: cerca direttamente nella tabella 'ditte'
        const fornitori = await knex('ditte')
            .where({ id_ditta_proprietaria: id_ditta }) // Filtra per la ditta proprietaria
            .whereIn('codice_relazione', ['F', 'E'])   // Filtra per relazione Fornitore o Entrambi
            .select('id', 'ragione_sociale')
            .orderBy('ragione_sociale', 'asc');

        res.json(fornitori);

    } catch (error) {
        console.error(`Errore nel recupero dei fornitori per la ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: "Errore interno del server durante il recupero dei fornitori." });
    }
});

// --- GESTIONE TIPI PAGAMENTO ---

/**
 * GET /api/amministrazione/tipi-pagamento
 * Recupera tutti i tipi di pagamento per la ditta dell'utente loggato.
 * Protetta da permesso ANAGRAFICHE_VIEW.
 */
router.get('/tipi-pagamento', verifyToken, checkPermission('ANAGRAFICHE_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const tipiPagamento = await knex('tipi_pagamento')
            .where({ id_ditta })
            .orderBy('codice', 'asc');
        res.json(tipiPagamento);
    } catch (error) {
        console.error("Errore nel recupero dei tipi di pagamento:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});

/**
 * POST /api/amministrazione/tipi-pagamento
 * Crea un nuovo tipo di pagamento.
 * Protetta da permesso ANAGRAFICHE_MANAGE.
 */
router.post('/tipi-pagamento', verifyToken, checkPermission('ANAGRAFICHE_MANAGE'), async (req, res) => {
    const { id_ditta, id: id_utente, nome, cognome } = req.user;
    const { codice, descrizione, gg_dilazione } = req.body;

    if (!codice || !descrizione) {
        return res.status(400).json({ message: 'Codice e descrizione sono obbligatori.' });
    }

    try {
        const result = await knex.transaction(async (trx) => {
            const [newId] = await trx('tipi_pagamento').insert({
                id_ditta,
                codice,
                descrizione,
                gg_dilazione: gg_dilazione || 0
            });

            await trx('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'CREAZIONE',
                dettagli: `L'utente ${nome} ${cognome} ha creato il tipo di pagamento: ${descrizione}`
            });

            const newItem = await trx('tipi_pagamento').where('id', newId).first();
            return newItem;
        });
        res.status(201).json(result);
    } catch (error) {
        console.error("Errore nella creazione del tipo di pagamento:", error);
        res.status(500).json({ message: 'Errore del server durante la creazione.' });
    }
});

/**
 * PUT /api/amministrazione/tipi-pagamento/:id
 * Aggiorna un tipo di pagamento esistente.
 * Protetta da permesso ANAGRAFICHE_MANAGE.
 */
router.put('/tipi-pagamento/:id', verifyToken, checkPermission('ANAGRAFICHE_MANAGE'), async (req, res) => {
    const { id_ditta, id: id_utente, nome, cognome } = req.user;
    const { id } = req.params;
    const { codice, descrizione, gg_dilazione } = req.body;

    if (!codice || !descrizione) {
        return res.status(400).json({ message: 'Codice e descrizione sono obbligatori.' });
    }

    try {
        const result = await knex.transaction(async (trx) => {
            const count = await trx('tipi_pagamento')
                .where({ id, id_ditta })
                .update({
                    codice,
                    descrizione,
                    gg_dilazione
                });
            
            if (count === 0) {
                // L'uso di trx.rollback() qui non è necessario perché se lanciamo un errore, la transazione lo farà automaticamente.
                throw new Error('Tipo di pagamento non trovato o non appartenente alla tua ditta.');
            }

            await trx('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'MODIFICA',
                dettagli: `L'utente ${nome} ${cognome} ha modificato il tipo di pagamento: ${descrizione}`
            });

            const updatedItem = await trx('tipi_pagamento').where('id', id).first();
            return updatedItem;
        });

        if (!result) {
             return res.status(404).json({ message: 'Tipo di pagamento non trovato.' });
        }
        res.json(result);

    } catch (error) {
        console.error("Errore nell'aggiornamento del tipo di pagamento:", error);
        if (error.message.includes('non trovato')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Errore del server durante l\'aggiornamento.' });
    }
});

/**
 * DELETE /api/amministrazione/tipi-pagamento/:id
 * Elimina un tipo di pagamento.
 * Protetta da permesso ANAGRAFICHE_MANAGE.
 */
router.delete('/tipi-pagamento/:id', verifyToken, checkPermission('ANAGRAFICHE_MANAGE'), async (req, res) => {
    const { id_ditta, id: id_utente, nome, cognome } = req.user;
    const { id } = req.params;

    try {
        await knex.transaction(async (trx) => {
            const toDelete = await trx('tipi_pagamento').where({ id, id_ditta }).first();

            if (!toDelete) {
                 throw new Error('Tipo di pagamento non trovato o non appartenente alla tua ditta.');
            }

            await trx('tipi_pagamento').where({ id }).del();

            await trx('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'ELIMINAZIONE',
                dettagli: `L'utente ${nome} ${cognome} ha eliminato il tipo di pagamento: ${toDelete.descrizione}`
            });
        });
        res.status(200).json({ message: 'Tipo di pagamento eliminato con successo.' });
    } catch (error) {
        console.error("Errore nell'eliminazione del tipo di pagamento:", error);
         if (error.message.includes('non trovato')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Errore del server durante l\'eliminazione.' });
    }
});


/**
 * GET /api/amministrazione/utenti-esterni
 * Recupera un elenco di utenti con Codice_Tipo_Utente = 2 (Utente Esterno)
 * appartenenti alla ditta dell'utente loggato.
 * Protetta da token.
 */
router.get('/utenti-esterni', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const utentiEsterni = await knex('utenti')
            .where({
                id_ditta: id_ditta,
                Codice_Tipo_Utente: 2 // Filtra per "Utente Esterno"
            })
            .select('id', 'nome', 'cognome')
            .orderBy('cognome', 'asc')
            .orderBy('nome', 'asc');

        res.json(utentiEsterni);
    } catch (error) {
        console.error("Errore nel recupero degli utenti esterni:", error);
        res.status(500).json({ message: "Errore nel recupero degli utenti esterni." });
    }
});


// ====================================================================
// ++ NUOVA API DI INVITO UTENTE UNIFICATA ++
// ====================================================================
// ====================================================================
// ++ NUOVA API DI INVITO UTENTE UNIFICATA ++
// ====================================================================
/**
 * @file opero/routes/amministrazione.js
 * @description Rotta per invitare un utente o associarne uno esistente alla ditta.
 * @date 2025-10-19
 * @version 2.0 (Logica Multi-Ditta)
 * - Se l'utente invitato esiste già, lo associa alla ditta corrente.
 * - Se l'utente non esiste, crea un nuovo invito con token di registrazione.
 * - Aggiunto il campo `Codice_Tipo_Utente` alla richiesta.
 */
// Nel tuo file routes/amministrazione.js

router.post('/utenti/invita', [verifyToken, isDittaAdmin], async (req, res) => {
    const { email, id_ruolo, Codice_Tipo_Utente } = req.body;
    const { id_ditta, ditta } = req.user;

    if (!email || !id_ruolo || !Codice_Tipo_Utente) {
        return res.status(400).json({ success: false, message: 'Email, ruolo e tipo utente sono obbligatori.' });
    }

    // --- AGGIUNGI QUESTO CONTROLLO DI VALIDAZIONE ---
    // Regex semplice per la validazione dell'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Il formato dell\'email non è valido.' });
    }

    try {
        // ... il resto del tuo codice rimane esattamente uguale ...
        const existingUser = await knex('utenti').where({ email }).first();

        if (existingUser) {
            const existingAssociation = await knex('ad_utenti_ditte')
                .where({ id_utente: existingUser.id, id_ditta: id_ditta })
                .first();

            if (existingAssociation) {
                return res.status(409).json({ success: false, message: 'Questo utente è già associato alla tua ditta.' });
            }

            await knex('ad_utenti_ditte').insert({
                id_utente: existingUser.id,
                id_ditta: id_ditta,
                id_ruolo: id_ruolo,
                Codice_Tipo_Utente: Codice_Tipo_Utente,
                stato: 'attivo'
            });
            
            res.status(200).json({ success: true, message: `L'utente ${email} è stato associato con successo alla ditta.` });

            mailer.sendAddedToDittaNotification(email, ditta.ragione_sociale, existingUser.nome)
                .then(() => console.log(`Email di notifica inviata in background a: ${email}`))
                .catch(err => console.error(`ERRORE: Invio email di notifica fallito per ${email}:`, err));

        } else {
            const token = uuidv4();
            const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/${token}`;

            await knex('registration_tokens').insert({
                id_ditta,
                token,
                scadenza: knex.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'),
                id_ruolo,
                Codice_Tipo_Utente: Codice_Tipo_Utente 
            });

            res.status(200).json({ 
                success: true, 
                message: 'Invito per nuovo utente creato. Invio email in corso...', 
                link: registrationLink 
            });

            mailer.sendRegistrationInvite(email, ditta.ragione_sociale, registrationLink)
                .then(() => console.log(`Email di invito inviata con successo in background a: ${email}`))
                .catch(err => console.error(`ERRORE: Invio email di invito in background fallito per ${email}:`, err));
        }

    } catch (error) {
        console.error("Errore durante la creazione dell'invito:", error);
        if (!res.headersSent) {
             res.status(500).json({ success: false, message: 'Errore interno del server.' });
        }
    }
});

module.exports = router;
