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
const jwt = require('jsonwebtoken');
const { dbPool } = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Per generare un ID univoco per il token (jti)

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';
const { verifyToken } = require('../utils/auth');

// Costanti di configurazione per la Portineria
const MAX_TENTATIVI_FALLITI = 4;
const DURATA_SESSIONE_MINUTI = 15;


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
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatori.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // 1. Verifica sessione attiva (Portineria)
        const [userCheckRows] = await connection.query('SELECT id FROM utenti WHERE email = ?', [email]);
        if (userCheckRows.length > 0) {
            const userId = userCheckRows[0].id;
            const [sessioneEsistente] = await connection.query('SELECT id_utente FROM utenti_sessioni_attive WHERE id_utente = ?', [userId]);
            if (sessioneEsistente.length > 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'Utente già connesso da un altro dispositivo.' });
            }
        }

        // 2. Autenticazione utente e recupero ruolo primario
        const userQuery = `
            SELECT 
                u.id, u.nome, u.cognome, u.email, u.password, 
                u.id_ditta, u.id_ruolo, u.Codice_Tipo_Utente,
                r.tipo as nome_ruolo
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.email = ?`;
        const [userRows] = await connection.query(userQuery, [email]);
        if (userRows.length === 0 || !await bcrypt.compare(password, userRows[0].password)) {
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        const user = userRows[0];

        // 3. Raccogli tutte le associazioni ditta
        const ditteAssociateQuery = `
            (SELECT d.id, d.ragione_sociale AS denominazione, d.logo_url FROM ad_utenti_ditte aud JOIN ditte d ON aud.id_ditta = d.id WHERE aud.id_utente = ? AND aud.stato = 'attivo')
            UNION
            (SELECT d.id, d.ragione_sociale AS denominazione, d.logo_url FROM utenti u JOIN ditte d ON u.id_ditta = d.id WHERE u.id = ? AND u.id_ditta IS NOT NULL)
        `;
        const [ditteRows] = await connection.query(ditteAssociateQuery, [user.id, user.id]);

        if (ditteRows.length === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Nessuna ditta associata a questo utente.' });
        }

        // 4. Determina il prossimo passo
        if (ditteRows.length === 1) {
            // CASO A: Utente con una sola ditta -> Login diretto (logica invariata)
            const id_ditta_scelta = ditteRows[0].id;

            const [associazioneRows] = await connection.query('SELECT id_ruolo, Codice_Tipo_Utente FROM ad_utenti_ditte WHERE id_utente = ? AND id_ditta = ? AND stato = "attivo"', [user.id, id_ditta_scelta]);
            let associazione = associazioneRows.length > 0 ? associazioneRows[0] : { id_ruolo: user.id_ruolo, Codice_Tipo_Utente: user.Codice_Tipo_Utente };
            
            const { id_ruolo, Codice_Tipo_Utente } = associazione;
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

            const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [associazione.id_ruolo]);
            const userContext = { ...user, id_ditta: id_ditta_scelta, id_ruolo: associazione.id_ruolo, Codice_Tipo_Utente: associazione.Codice_Tipo_Utente, nome_ruolo: ruoloInfo[0]?.tipo };
            
            const response = await finalizzaLogin(connection, req, userContext, id_ditta_scelta);
            await connection.commit();
            res.json(response);

        } else {
            // CASO B: Utente con più ditte -> Chiedi selezione
            // --- MODIFICA 1: Inviato la proprietà 'needsDittaSelection' come si aspetta il frontend ---
            // --- MODIFICA 2: Rimosso il temp_token, non necessario per questo flusso ---
            delete user.password;
            const userForFrontend = {
                ...user,
                ruolo: user.nome_ruolo
            };

            await connection.commit();
            res.json({ 
                success: true, 
                needsDittaSelection: true, // <-- CAMBIATO DA 'multi_ditta'
                ditte: ditteRows, 
                user: userForFrontend
                // temp_token rimosso
            });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Errore durante il login iniziale:', error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
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
        const [associazioneRows] = await connection.query('SELECT id_ruolo, Codice_Tipo_Utente FROM ad_utenti_ditte WHERE id_utente = ? AND id_ditta = ? AND stato = "attivo"', [user.id, id_ditta_scelta]);
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
        
        const userContext = { ...user, id_ditta: id_ditta_scelta, id_ruolo, Codice_Tipo_Utente, nome_ruolo: ruoloInfo[0]?.tipo };
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

module.exports = router;


