/**
 * @file opero/routes/auth.js
 * @description file di rotte per l'autenticazione.
 * @date 2025-10-19
 * @version 12.0 (Integrazione Logica Multi-Ditta)
 * - Integrata la logica per la gestione di utenti associati a più ditte tramite la tabella `ad_utenti_ditte`.
 * - Mantenuta piena retrocompatibilità per gli utenti ancora configurati con un singolo id_ditta sulla tabella `utenti`.
 * - Preservati tutti i controlli di sicurezza della "Portineria" (anti-brute-force, sessioni, licenze).
 * - Aggiunta la nuova rotta `/select-ditta` per gestire il login in due passaggi.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { dbPool, knex } = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Per generare un ID univoco per il token (jti)
const mailer = require('../utils/mailer');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';
const { verifyToken } = require('../utils/auth');
 const { sendSystemEmail } = require('../utils/mailer'); // o il path corretto
// Costanti di configurazione per la Portineria
const MAX_TENTATIVI_FALLITI = 4;
const DURATA_SESSIONE_MINUTI = 15;
const MINUTI_TOLLERANZA_HEARTBEAT = 5; // Aggiungiamo 5 min di tolleranza
const DURATA_MASSIMA_SESSIONE_MINUTI = DURATA_SESSIONE_MINUTI + MINUTI_TOLLERANZA_HEARTBEAT; // Totale 20 minuti
// --- NUOVA FUNZIONE AUSILIARIA PER PULIZIA SESSIONI ---
/**
 * Rimuove le sessioni dalla tabella utenti_sessioni_attive se l'heartbeat
 * è più vecchio di DURATA_MASSIMA_SESSIONE_MINUTI.
 * Questo previene il blocco degli slot dovuto a sessioni "orfane".
 * @param {object} connection - La connessione al database (deve essere già acquisita)
 */
async function pulisciSessioniScadute(connection) {
    console.log(`[AUTH-CLEANUP] Avvio pulizia sessioni scadute (limite: ${DURATA_MASSIMA_SESSIONE_MINUTI} minuti)...`);
    const queryPulizia = `
        DELETE FROM utenti_sessioni_attive
        WHERE last_heartbeat_timestamp < NOW() - INTERVAL ? MINUTE
    `;
    try {
        const [result] = await connection.query(queryPulizia, [DURATA_MASSIMA_SESSIONE_MINUTI]);
        if (result.affectedRows > 0) {
            console.log(`[AUTH-CLEANUP] Sessioni scadute rimosse: ${result.affectedRows}`);
        }
    } catch (error) {
        console.error("[AUTH-CLEANUP] Errore critico durante la pulizia delle sessioni scadute:", error);
        // Non blocchiamo il login se la pulizia fallisce, ma lo logghiamo
        // Se la pulizia fallisce, il sistema si comporta come prima (potenzialmente bloccando)
    }
}



// --- FUNZIONE AUSILIARIA PER GENERARE IL TOKEN E COMPLETARE IL LOGIN ---
// Raccoglie la logica comune per finalizzare l'accesso, inclusa la creazione della sessione e la generazione del token
// --- FUNZIONE AUSILIARIA PER FINALIZZARE IL LOGIN ---
// --- FUNZIONE AUSILIARIA PER FINALIZZARE IL LOGIN ---
async function finalizzaLogin(connection, req, userContext, id_ditta_scelta) {
    const logAccessoQuery = `INSERT INTO log_accessi (id_utente, indirizzo_ip, data_ora_accesso) VALUES (?, ?, NOW())`;
    await connection.query(logAccessoQuery, [userContext.id, req.ip]);

    const registraSessioneQuery = `
        REPLACE INTO utenti_sessioni_attive (id_utente, id_ditta_attiva, login_timestamp, last_heartbeat_timestamp)
        VALUES (?, ?, NOW(), NOW())
    `;
    await connection.query(registraSessioneQuery, [userContext.id, id_ditta_scelta]);

    const permissions = await _buildPermissions(connection, userContext.id, userContext.id_ruolo, id_ditta_scelta);

    const payload = {
        id: userContext.id,
        id_ditta: id_ditta_scelta,
        id_ruolo: userContext.id_ruolo,
        permissions,
        jti: uuidv4()
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    const [dittaRows] = await connection.query(`
        SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
        FROM ditte d
        LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
        WHERE d.id = ?`, [id_ditta_scelta]);

    const [moduleRows] = await connection.query(
        `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`,
        [id_ditta_scelta]
    );

    delete userContext.password;
    
    const finalUserObject = {
        ...userContext,
        ruolo: userContext.nome_ruolo 
    };

    return {
        success: true,
        token,
        user: finalUserObject,
        ditta: dittaRows[0] || null,
        modules: moduleRows,
        permissions: permissions 
    };
}
// --- FUNZIONE AUSILIARIA PER COSTRUIRE I PERMESSI (MODIFICATA) ---
// --- FUNZIONE AUSILIARIA PER COSTRUIRE I PERMESSI ---
async function _buildPermissions(connection, id_utente, id_ruolo, id_ditta) {
    console.log(`[PERMISSIONS] Avvio costruzione per utente: ${id_utente}, ruolo: ${id_ruolo}, ditta: ${id_ditta}`);
    try {
        const rolePermissionsQuery = `
            SELECT f.codice FROM ruoli_funzioni rf 
            JOIN funzioni f ON rf.id_funzione = f.id 
            WHERE rf.id_ruolo = ?`;
        const [roleRows] = await connection.query(rolePermissionsQuery, [id_ruolo]);
        console.log(`[PERMISSIONS] Trovate ${roleRows.length} funzioni di base per il ruolo ${id_ruolo}.`);
        const permissions = new Set(roleRows.map(p => p.codice));

        const overrideQuery = `
            SELECT f.codice, ufo.azione FROM utenti_funzioni_override ufo 
            JOIN funzioni f ON ufo.id_funzione = f.id 
            WHERE ufo.id_utente = ? AND ufo.id_ditta = ?`;
        const [overrideRows] = await connection.query(overrideQuery, [id_utente, id_ditta]);
        console.log(`[PERMISSIONS] Trovati ${overrideRows.length} override per utente ${id_utente} sulla ditta ${id_ditta}.`);

        overrideRows.forEach(override => {
            if (override.azione === 'allow') permissions.add(override.codice);
            else if (override.azione === 'deny') permissions.delete(override.codice);
        });
        
        const finalPermissions = Array.from(permissions);
        console.log(`[PERMISSIONS] Permessi finali costruiti: ${finalPermissions.length} totali.`);
        return finalPermissions;
    } catch (error) {
        console.error("[PERMISSIONS] Errore critico durante la costruzione dei permessi:", error);
        throw new Error("Impossibile costruire i permessi utente.");
    }
}

// STEP 1: AUTENTICAZIONE INIZIALE
// --- FUNZIONI HELPER (INVARIATE) ---
// ... (le tue funzioni _buildPermissions e finalizzaLogin rimangono invariate) ...


// --- NUOVO FLUSSO DI LOGIN A STEP (MODIFICATO) ---

// STEP 1: AUTENTICAZIONE INIZIALE
/**
 * @file opero/routes/auth.js (Riformattato per Chiarezza)
 * @description Spiegazione della rotta /login con logica multi-ditta (v12.0 + v12.1).
 * - Questa rotta gestisce l'autenticazione e il bivio logico:
 * - CASO A: Utente con 1 ditta -> Login immediato.
 * - CASO B: Utente con 2+ ditte -> Richiesta di selezione.
 */

// ... (tutti i require e le costanti sono definiti sopra) ...

// La funzione pulisciSessioniScadute (v12.1) è definita qui sopra...
// async function pulisciSessioniScadute(connection) { ... }

// STEP 1: AUTENTICAZIONE INIZIALE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatori.' });
    }

    let connection;
    try {
        // --- PREPARAZIONE DATABASE ---
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // --- 1. PULIZIA SESSIONI (Garbage Collector v12.1) ---
        // Come da nostra modifica precedente, puliamo le sessioni "morte" 
        // (es. browser chiuso senza logout) per liberare gli slot di licenza.
        await pulisciSessioniScadute(connection);

        // --- 2. CONTROLLO SESSIONE ATTIVA (Pre-Autenticazione) ---
        // Controlla se l'ID utente (recuperato via email) è GIÀ in 'utenti_sessioni_attive'.
        // Se sì, blocca il login per evitare sessioni multiple dello stesso utente.
        const [userCheckRows] = await connection.query('SELECT id FROM utenti WHERE email = ?', [email]);
        if (userCheckRows.length > 0) {
            const userId = userCheckRows[0].id;
            const [sessioneEsistente] = await connection.query('SELECT id_utente FROM utenti_sessioni_attive WHERE id_utente = ?', [userId]);
            if (sessioneEsistente.length > 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'Utente già connesso da un altro dispositivo.' });
            }
        }

        // --- 3. AUTENTICAZIONE (Verifica Credenziali) ---
        // Recupera l'utente e la sua password hashata per il confronto.
        // Recupera anche i dati "legacy" (id_ditta, id_ruolo) che useremo come FALLBACK.
        const userQuery = `
            SELECT
                u.id, u.nome, u.cognome, u.email, u.password,
                u.id_ditta, u.id_ruolo, u.Codice_Tipo_Utente,
                r.tipo as nome_ruolo
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.email = ?`;
        const [userRows] = await connection.query(userQuery, [email]);

        // Se l'utente non esiste O la password non corrisponde...
        if (userRows.length === 0 || !await bcrypt.compare(password, userRows[0].password)) {
            // *** ATTENZIONE (REGRESSIONE) ***
            // Qui manca la logica anti-brute-force (v12.2)
            // che incrementa 'tentativi_falliti' e blocca l'utente.
            // Questa versione si limita a dare errore.
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        
        // Se siamo qui, la password è CORRETTA.
        const user = userRows[0];

        // --- 4. RECUPERO DITTE ASSOCIATE (Logica Multi-Ditta) ---
        // Questa è la query complessa. Unisce due ricerche:
        const ditteAssociateQuery = `
            /* Blocco 1: Cerca nella NUOVA tabella 'ad_utenti_ditte' */
            (SELECT
                d.id, d.ragione_sociale AS denominazione, d.logo_url,
                aud.livello  /* Prende il livello specifico da questa tabella */
            FROM ad_utenti_ditte aud
            JOIN ditte d ON aud.id_ditta = d.id WHERE aud.id_utente = ? AND aud.stato = 'attivo')
            
            UNION  /* Unisce i risultati, eliminando duplicati */
            
            /* Blocco 2: Cerca nella VECCHIA colonna 'utenti.id_ditta' (Legacy) */
            (SELECT
                d.id, d.ragione_sociale AS denominazione, d.logo_url,
                50 as livello /* Fornisce un livello di default (50) per la ditta legacy */
            FROM utenti u
            JOIN ditte d ON u.id_ditta = d.id WHERE u.id = ? AND u.id_ditta IS NOT NULL
            /* Esclude ditte GIA' trovate nel Blocco 1 (per evitare duplicati) */
            AND d.id NOT IN (SELECT id_ditta FROM ad_utenti_ditte WHERE id_utente = ? AND stato = 'attivo')
            )
        `;
        
        // Passiamo user.id tre volte (uno per ogni '?' nella query)
        const [ditteRows] = await connection.query(ditteAssociateQuery, [user.id, user.id, user.id]);

        // Se l'utente è valido ma non ha ditte attive, lo fermiamo.
        if (ditteRows.length === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Nessuna ditta associata a questo utente.' });
        }

        // --- 5. BIVIO LOGICO: 1 Ditta vs. Multi-Ditta ---

        if (ditteRows.length === 1) {
            /************************************************************/
            /* CASO A: UTENTE CON UNA SOLA DITTA (Login Diretto)  */
            /************************************************************/
            console.log(`[AUTH-LOGIN] Caso A: Utente ${email} ha 1 ditta. Login immediato.`);
            
            const id_ditta_scelta = ditteRows[0].id;
            const livello_ditta_scelta = ditteRows[0].livello; // Livello già pronto dalla query UNION

            // Cerca se esiste un ruolo/tipo SPECIFICO in 'ad_utenti_ditte'
            const [associazioneRows] = await connection.query(
                'SELECT id_ruolo, Codice_Tipo_Utente FROM ad_utenti_ditte WHERE id_utente = ? AND id_ditta = ? AND stato = "attivo"',
                [user.id, id_ditta_scelta]
            );

            // Se esiste un'associazione specifica, la usiamo.
            // Altrimenti, facciamo "fallback" ai dati vecchi sulla tabella 'utenti'.
            let associazione;
            if (associazioneRows.length > 0) {
                associazione = associazioneRows[0]; // Dati specifici trovati
            } else {
                associazione = { id_ruolo: user.id_ruolo, Codice_Tipo_Utente: user.Codice_Tipo_Utente }; // Fallback ai dati legacy
            }
            
            const { Codice_Tipo_Utente } = associazione; // Ci serve per il controllo licenze

            // --- 6A. PORTINERIA: Controllo Licenze (Solo per Caso A) ---
            // Recupera i limiti massimi per la ditta scelta
            const [dittaInfoRows] = await connection.query('SELECT max_utenti_interni, max_utenti_esterni FROM ditte WHERE id = ?', [id_ditta_scelta]);
            const { max_utenti_interni, max_utenti_esterni } = dittaInfoRows[0];
            const isUtenteInterno = (Codice_Tipo_Utente === 1);

            // Conta le sessioni GIA' ATTIVE per QUEL TIPO (interni/esterni) in QUELLA DITTA
            const countQuery = `
                SELECT COUNT(usa.id_utente) as sessioni_attive
                FROM utenti_sessioni_attive usa
                /* Questa JOIN complessa serve a trovare il Codice_Tipo_Utente CORRETTO */
                LEFT JOIN ad_utenti_ditte aud ON usa.id_utente = aud.id_utente AND usa.id_ditta_attiva = aud.id_ditta
                LEFT JOIN utenti u ON usa.id_utente = u.id
                WHERE usa.id_ditta_attiva = ? 
                  AND COALESCE(aud.Codice_Tipo_Utente, u.Codice_Tipo_Utente) = ?`;
            
            const [countRows] = await connection.query(countQuery, [id_ditta_scelta, Codice_Tipo_Utente]);
            const sessioniAttivePerTipo = countRows[0].sessioni_attive;

            // Se il limite è raggiunto, blocca il login
            if ((isUtenteInterno && sessioniAttivePerTipo >= max_utenti_interni) || (!isUtenteInterno && sessioniAttivePerTipo >= max_utenti_esterni)) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: `Numero massimo di connessioni raggiunto.` });
            }

            // --- 7A. FINALIZZAZIONE LOGIN (Caso A) ---
            const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [associazione.id_ruolo]);

            // Costruisce l'oggetto utente completo (il "contesto") per il token
            const userContext = {
                ...user, // Contiene id, nome, cognome, email... (password VERRÀ rimossa da finalizzaLogin)
                id_ditta: id_ditta_scelta,
                id_ruolo: associazione.id_ruolo,
                Codice_Tipo_Utente: associazione.Codice_Tipo_Utente,
                livello: livello_ditta_scelta, // Livello corretto (specifico o default 50)
                nome_ruolo: ruoloInfo[0]?.tipo
            };

            // La funzione helper che crea la sessione, il log e il token
            const response = await finalizzaLogin(connection, req, userContext, id_ditta_scelta);
            
            await connection.commit(); // Conferma la transazione (INSERT in utenti_sessioni_attive, log_accessi, ecc.)
            res.json(response); // Invia il token al frontend

        } else {
            /************************************************************/
            /* CASO B: UTENTE CON 2+ DITTE (Richiedi Selezione)     */
            /************************************************************/
            console.log(`[AUTH-LOGIN] Caso B: Utente ${email} ha ${ditteRows.length} ditte. Invio a selezione.`);
            
            delete user.password; // Rimuovi la password prima di inviarla al frontend!
            
            // Prepara un oggetto utente "temporaneo" per il frontend
            const userForFrontend = {
                ...user,
                ruolo: user.nome_ruolo,
                // Mette un livello "temporaneo" (quello della prima ditta trovata)
                livello: ditteRows[0]?.livello || 50 
            };

            await connection.commit(); // Commit (non ci sono state scritture, ma chiudiamo la transazione)
            
            // Invia al frontend la lista di ditte tra cui scegliere
            res.json({
                success: true,
                needsDittaSelection: true, // Questo dice al frontend di mostrare il modale
                ditte: ditteRows, // La lista delle ditte (ognuna ha già id, nome, logo e livello)
                user: userForFrontend // Dati utente base
            });
        }
    } catch (error) {
        // --- GESTIONE ERRORI GLOBALE ---
        if (connection) await connection.rollback();
        console.error('Errore durante il login iniziale:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        // --- RILASCIO CONNESSIONE ---
        if (connection) connection.release();
    }
});

// STEP 2: SELEZIONE DELLA DITTA (per utenti multi-ditta)
// --- MODIFICA 3: Rimuoviamo il middleware 'verifyToken' ---
// --- MODIFICA 4: La rotta ora si aspetta email, password e id_ditta_scelta nel body ---
router.post('/select-ditta', async (req, res) => {
    const { email, password, id_ditta_scelta } = req.body;

    if (!email || !password || !id_ditta_scelta) {
        return res.status(400).json({ success: false, message: 'Email, password e la selezione di una ditta sono obbligatori.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();
        await pulisciSessioniScadute(connection);

        // --- MODIFICA 5: Riautentichiamo l'utente usando email e password ---
        const userQuery = `SELECT id, nome, cognome, email, password, id_ditta, id_ruolo, Codice_Tipo_Utente FROM utenti WHERE email = ?`;
        const [userRows] = await connection.query(userQuery, [email]);
        if (userRows.length === 0 || !await bcrypt.compare(password, userRows[0].password)) {
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        const user = userRows[0];

        // --- Da qui in poi, la logica è molto simile a quella della rotta originale ---
        let associazione = null;
        const [associazioneRows] = await connection.query('SELECT id_ruolo, Codice_Tipo_Utente ,livello FROM ad_utenti_ditte WHERE id_utente = ? AND id_ditta = ? AND stato = "attivo"', [user.id, id_ditta_scelta]);
        if (associazioneRows.length > 0) {
            associazione = associazioneRows[0];
        } else if (parseInt(user.id_ditta, 10) === parseInt(id_ditta_scelta, 10)) {
            associazione = { id_ruolo: user.id_ruolo, Codice_Tipo_Utente: user.Codice_Tipo_Utente };
        }

        if (!associazione) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Accesso non autorizzato per la ditta selezionata.' });
        }

        const { id_ruolo, Codice_Tipo_Utente } = associazione;
        const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [id_ruolo]);
        
        const [dittaInfoRows] = await connection.query('SELECT max_utenti_interni, max_utenti_esterni FROM ditte WHERE id = ?', [id_ditta_scelta]);
        const { max_utenti_interni, max_utenti_esterni } = dittaInfoRows[0];
        const isUtenteInterno = (Codice_Tipo_Utente === 1);

        const countQuery = `
            SELECT COUNT(usa.id_utente) as sessioni_attive
            FROM utenti_sessioni_attive usa
            LEFT JOIN ad_utenti_ditte aud ON usa.id_utente = aud.id_utente AND usa.id_ditta_attiva = aud.id_ditta
            LEFT JOIN utenti u ON usa.id_utente = u.id
            WHERE usa.id_ditta_attiva = ? AND COALESCE(aud.Codice_Tipo_Utente, u.Codice_Tipo_Utente) = ?`;
        const [countRows] = await connection.query(countQuery, [id_ditta_scelta, Codice_Tipo_Utente]);
        const sessioniAttivePerTipo = countRows[0].sessioni_attive;

        if ((isUtenteInterno && sessioniAttivePerTipo >= max_utenti_interni) || (!isUtenteInterno && sessioniAttivePerTipo >= max_utenti_esterni)) {
             await connection.rollback();
             return res.status(403).json({ success: false, message: `Numero massimo di connessioni raggiunto.` });
        }
        const livelloAccessoSpecifico = associazione.livello !== undefined ? associazione.livello : 0;
        const userContext = { ...user, id_ditta: id_ditta_scelta, id_ruolo, Codice_Tipo_Utente, nome_ruolo: ruoloInfo[0]?.tipo,livello: livelloAccessoSpecifico };
        const response = await finalizzaLogin(connection, req, userContext, id_ditta_scelta);
        
        await connection.commit();
        res.json(response);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Errore nella selezione della ditta:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});
// --- ESISTENTI ROTTE /logout, /heartbeat, /me (INVARIATE) ---

router.post('/logout', verifyToken, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.query('DELETE FROM utenti_sessioni_attive WHERE id_utente = ?', [req.user.id]);
        res.json({ success: true, message: 'Logout effettuato con successo.' });
    } catch (error) {
        console.error('Errore durante il logout:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante il logout.' });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/heartbeat', verifyToken, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.query(
            'UPDATE utenti_sessioni_attive SET last_heartbeat_timestamp = CURRENT_TIMESTAMP WHERE id_utente = ?',
            [req.user.id]
        );
        res.json({ success: true, message: 'Heartbeat ricevuto.' });
    } catch (error) {
        console.error('Errore durante l\'heartbeat:', error);
        res.status(200).json({ success: false, message: 'Errore durante l\'aggiornamento della sessione.' });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/me', verifyToken, async (req, res) => {
    const { id, id_ditta, permissions } = req.user;
    if (!id || !id_ditta) {
        return res.status(400).json({ success: false, message: 'Token non valido o incompleto.' });
    }
    
    let connection;
    try {
        connection = await dbPool.getConnection();
        
        const userQuery = `
            SELECT u.id, u.nome, u.cognome, u.email, u.id_ruolo, u.livello, r.tipo as nome_ruolo
            FROM utenti u
            LEFT JOIN ruoli r on u.id_ruolo = r.id
            WHERE u.id = ?`;
        const [userRows] = await connection.query(userQuery, [id]);

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
        const user = userRows[0];
        
        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [id_ditta]);
        
        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [id_ditta]);

        res.json({
            success: true,
            user,
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore in /me:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- NUOVE ROTTE PER RECUPERO PASSWORD (FLUSSO UTENTE) ---

// 1. Richiesta di Reset Password
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Indirizzo email mancante.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        const [userRows] = await connection.query('SELECT id, nome, cognome FROM utenti WHERE email = ?', [email]);

        if (userRows.length > 0) {
            const user = userRows[0];
            const token = crypto.randomBytes(32).toString('hex'); // Token sicuro
           // const hashedToken = await bcrypt.hash(token, 10); // Hash del token per il DB
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Scadenza tra 1 ora

            // Salva il token hashato nel DB
            await connection.query(
    'INSERT INTO password_reset_tokens (id_utente, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt] );

            const resetLink = `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`; 
            const mailSubject = 'Opero - Richiesta Reset Password';
           const mailBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Opero Gestionali</h1>
            </div>
            <div class="content">
                <h2>Ciao ${user.nome} ${user.cognome},</h2>
                <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account.</p>
                <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reimposta Password</a>
                </div>
                <p>Oppure copia e incolla questo link nel tuo browser:</p>
                <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
                <p><strong>Questo link scadrà tra 1 ora.</strong></p>
                <p>Se non hai richiesto il reset della password, ignora questa email.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Opero Gestionali - Tutti i diritti riservati</p>
            </div>
        </div>
    </body>
    </html>
`;

// Email HTML come prima

            // --- CORREZIONE CHIAMATA MAILER ---
            // Usa sendSystemEmail invece di sendMail
            await sendSystemEmail(email, mailSubject, mailBody);

             console.log(`[AUTH] Inviata email di reset password a ${email}. Link: ${resetLink}`);
        } else {
             console.log(`[AUTH] Richiesta reset per email non trovata: ${email}`);
        }

        res.json({ success: true, message: 'Se l\'indirizzo email è registrato, riceverai un link per il reset della password.' });

    } catch (error) {
        console.error('Errore durante la richiesta di reset password:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


// 2. Reset Effettivo della Password
router.post('/reset-password', async (req, res) => {
    // ... logica invariata ...
    const { token, newPassword } = req.body;
    console.log('--- Richiesta /reset-password ricevuta ---'); // LOG 1
    console.log('Token ricevuto:', token);                   // LOG 2
    console.log('Password ricevuta (lunghezza):', newPassword?.length); // LOG 3

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token e nuova password sono obbligatori.' });
    }
    if (newPassword.length < 8) {
         return res.status(400).json({ success: false, message: 'La password deve contenere almeno 8 caratteri.' });
    }

    let connection;
    try {
        console.log('Ottenimento connessione al DB...'); // LOG 4
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // --- CORREZIONE: Usa confronto diretto del token nella query ---
        const [tokenRows] = await connection.query(
            'SELECT id, id_utente FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
            [token] // Confronto diretto token in chiaro
        );
        // --- RIMUOVI IL CICLO E BCRYPT.COMPARE (come suggerito precedentemente) ---
        /*
        let foundTokenData = null;
        for (const row of tokenRows) {
             if (await bcrypt.compare(token, row.token)) { // ERRATO
                 foundTokenData = row;
                 break;
             }
        }
             */
        
        const foundTokenData = tokenRows[0]; // Prendi la prima (e unica) riga se trovata

        if (!foundTokenData) {
            await connection.rollback();
            // Chiudi la connessione anche in caso di errore prima di return
            if (connection) connection.release();
            return res.status(400).json({ success: false, message: 'Token non valido o scaduto.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await connection.query('UPDATE utenti SET password = ? WHERE id = ?', [hashedPassword, foundTokenData.id_utente]);
        await connection.query('DELETE FROM password_reset_tokens WHERE id = ?', [foundTokenData.id]);

        // Esegui il commit
        await connection.commit();

        // --- MODIFICA CHIAVE: Invia la risposta di successo QUI ---
        res.json({ success: true, message: 'Password aggiornata con successo.' });
        // Ora il frontend ha ricevuto la risposta corretta.

        // Il rilascio della connessione avverrà nel blocco finally.

    } catch (error) {
        // Se si verifica un errore DURANTE la transazione, fai il rollback
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Errore durante il rollback:', rollbackError);
            }
        }
        console.error('Errore durante il reset della password:', error);
        // Evita di inviare una seconda risposta se `res.json` è già stato chiamato
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Errore interno del server.' });
        }
    } finally {
        // --- MODIFICA CHIAVE: Sposta release() qui dentro un try...catch ---
        if (connection) {
            try {
                connection.release(); // Rilascia sempre la connessione
            } catch (releaseError) {
                console.error('Errore durante il rilascio della connessione:', releaseError);
                // Non fare nulla qui, perché la risposta è già stata inviata (o un errore è stato inviato nel catch principale)
            }
        }
    }
});
module.exports = router;


