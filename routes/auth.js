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
// --- FUNZIONE AUSILIARIA PER GENERARE IL TOKEN E COMPLETARE IL LOGIN ---
// --- FUNZIONE AUSILIARIA PER GENERARE IL TOKEN E COMPLETARE IL LOGIN (CON LOGICA A 3 LIVELLI) ---
const finalizzaLogin = async (connection, user, id_ditta_scelta) => {
    // --- STEP 5: Pulizia Sessioni Scadute ---
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - DURATA_SESSIONE_MINUTI);
    await connection.query('DELETE FROM utenti_sessioni_attive WHERE last_heartbeat_timestamp < ?', [cutoffTime]);

    // --- STEP 6: Controllo Sessione Utente Già Attiva ---
    const [activeSessionRows] = await connection.query('SELECT id_utente FROM utenti_sessioni_attive WHERE id_utente = ?', [user.id]);
    if (activeSessionRows.length > 0) {
        throw new Error('Risulta già una sessione di lavoro attiva. Effettuare il logout prima di iniziare una nuova sessione.');
    }
    
    // --- STEP 7: Controllo Licenze Ditta ---
    const [dittaInfo] = await connection.query('SELECT max_utenti_interni, max_utenti_esterni FROM ditte WHERE id = ?', [id_ditta_scelta]);
    const { max_utenti_interni, max_utenti_esterni } = dittaInfo[0];
    
    const licenzeQuery = `
        SELECT u.Codice_Tipo_Utente, COUNT(usa.id_utente) as attivi
        FROM utenti_sessioni_attive usa
        JOIN utenti u ON usa.id_utente = u.id
        WHERE usa.id_ditta_attiva = ?
        GROUP BY u.Codice_Tipo_Utente
    `;
    const [licenzeRows] = await connection.query(licenzeQuery, [id_ditta_scelta]);
    
    const licenzeAttive = { 1: 0, 2: 0 };
    licenzeRows.forEach(row => { licenzeAttive[row.Codice_Tipo_Utente] = row.attivi; });

    if (user.Codice_Tipo_Utente === 1 && licenzeAttive[1] >= max_utenti_interni) {
        throw new Error('Accesso non consentito. È stato raggiunto il numero massimo di licenze per utenti interni.');
    }
    if (user.Codice_Tipo_Utente === 2 && licenzeAttive[2] >= max_utenti_esterni) {
        throw new Error('Accesso non consentito. È stato raggiunto il numero massimo di licenze per utenti esterni.');
    }
    
    // --- STEP 8: Costruzione Permessi (LOGICA A 3 LIVELLI) ---
    const [dittaFunzioniRows] = await connection.query('SELECT id_funzione FROM funzioni_ditte WHERE id_ditta = ?', [id_ditta_scelta]);
    const dittaFunzioniSet = new Set(dittaFunzioniRows.map(f => f.id_funzione));
    
    if (dittaFunzioniSet.size === 0) throw new Error('Nessuna funzione abilitata per l\'azienda selezionata.');

    const [ruoloFunzioniRows] = await connection.query('SELECT id_funzione FROM ruoli_funzioni WHERE id_ruolo = ?', [user.id_ruolo]);
    // CORREZIONE: La variabile era scritta con la F maiuscola (ruoloFunzioniRows)
    const ruoloFunzioniSet = new Set(ruoloFunzioniRows.map(f => f.id_funzione));

    const permessiBaseIds = new Set([...ruoloFunzioniSet].filter(id => dittaFunzioniSet.has(id)));

    const [overrides] = await connection.query('SELECT id_funzione, azione FROM utenti_funzioni_override WHERE id_utente = ?', [user.id]);

    for (const override of overrides) {
        if (override.azione === 'allow' && dittaFunzioniSet.has(override.id_funzione)) {
            permessiBaseIds.add(override.id_funzione);
        } else if (override.azione === 'deny') {
            permessiBaseIds.delete(override.id_funzione);
        }
    }
    
    let permissions = [];
    if (permessiBaseIds.size > 0) {
        const finalPermissionIds = Array.from(permessiBaseIds);
        const placeholders = finalPermissionIds.map(() => '?').join(',');
        const [funzioniCodiciRows] = await connection.query(`SELECT codice FROM funzioni WHERE id IN (${placeholders})`, finalPermissionIds);
        permissions = funzioniCodiciRows.map(f => f.codice);
    }
    
    // --- Logica finale di costruzione risposta (INVARIATA) ---
    const [moduleRows] = await connection.query(`SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`, [id_ditta_scelta]);
    const [dittaRows] = await connection.query(`SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta FROM ditte d LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id WHERE d.id = ?`, [id_ditta_scelta]);
    const ditta = dittaRows[0] || null;

    const jti = uuidv4();
    const token = jwt.sign({ 
            id: user.id, id_ditta: id_ditta_scelta, id_ruolo: user.id_ruolo, 
            livello: user.livello, tipo_utente: user.Codice_Tipo_Utente,
            permissions, ditta, jti
        }, JWT_SECRET, { expiresIn: '8h' });

    await connection.query('INSERT INTO utenti_sessioni_attive (id_utente, id_ditta_attiva) VALUES (?, ?)', [user.id, id_ditta_scelta]);
    
    delete user.password;
    return {
        success: true, token,
        user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.nome_ruolo, livello: user.livello },
        ditta, permissions, modules: moduleRows,
    };
};
// --- ROTTA DI LOGIN PRINCIPALE (MODIFICATA PER MULTI-DITTA) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // --- STEP 1 & 2: Ricerca Utente e Verifica Stato ---
        const [userRows] = await connection.query('SELECT * FROM utenti WHERE email = ?', [email]);

        if (userRows.length === 0 || userRows[0].attivo !== 1) {
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide o utente non attivo.' });
        }
        const user = userRows[0];
        
        if (user.stato === 'bloccato') {
            await connection.rollback();
            return res.status(403).json({ success: false, message: "Account bloccato per sicurezza. Contattare l'amministratore." });
        }
        
        // --- STEP 3: Verifica Password e Gestione Brute-Force ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const nuoviTentativi = user.tentativi_falliti + 1;
            await connection.query(nuoviTentativi >= MAX_TENTATIVI_FALLITI ? 
                "UPDATE utenti SET tentativi_falliti = ?, stato = 'bloccato' WHERE id = ?" : 
                'UPDATE utenti SET tentativi_falliti = ? WHERE id = ?', 
                [nuoviTentativi, user.id]);
            await connection.commit();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        
        if (user.tentativi_falliti > 0) {
            await connection.query('UPDATE utenti SET tentativi_falliti = 0 WHERE id = ?', [user.id]);
        }

        // --- STEP 4: LOGICA MULTI-DITTA ---
        const [associazioni] = await connection.query(`
            SELECT ad.id_ditta, ad.id_ruolo, ad.Codice_Tipo_Utente, d.ragione_sociale as denominazione
            FROM ad_utenti_ditte ad JOIN ditte d ON ad.id_ditta = d.id
            WHERE ad.id_utente = ? AND ad.stato = 'attivo' AND d.stato = 1
        `, [user.id]);

        if (associazioni.length === 1) {
            const { id_ditta, id_ruolo, Codice_Tipo_Utente } = associazioni[0];
            const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [id_ruolo]);
            const userContext = { ...user, id_ditta, id_ruolo, Codice_Tipo_Utente, nome_ruolo: ruoloInfo[0]?.tipo };
            const response = await finalizzaLogin(connection, userContext, id_ditta);
            await connection.commit();
            return res.json(response);
        }
        
        if (associazioni.length > 1) {
            const ditteDisponibili = associazioni.map(a => ({ id: a.id_ditta, denominazione: a.denominazione }));
            await connection.commit();
            return res.json({ success: true, needsDittaSelection: true, ditte: ditteDisponibili });
        }
        
        // --- FALLBACK PER RETROCOMPATIBILITÀ ---
        if (associazioni.length === 0 && user.id_ditta) {
             const [dittaInfo] = await connection.query('SELECT stato FROM ditte WHERE id = ?', [user.id_ditta]);
             if (dittaInfo.length > 0 && dittaInfo[0].stato === 1) {
                const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [user.id_ruolo]);
                user.nome_ruolo = ruoloInfo[0]?.tipo; // Aggiungiamo il nome_ruolo all'oggetto user
                const response = await finalizzaLogin(connection, user, user.id_ditta);
                await connection.commit();
                return res.json(response);
             }
        }
        
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Questo account non è abilitato ad accedere a nessuna ditta attiva.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore durante il login:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});
// --- NUOVA ROTTA: /select-ditta ---
router.post('/select-ditta', async (req, res) => {
    // DEBUG: Log del corpo della richiesta in arrivo
    console.log('[/select-ditta] Body ricevuto:', req.body);

    const { email, password, id_ditta_scelta } = req.body;
   if (!email) return res.status(400).json({ success: false, message: '[Server] Email mancante nella richiesta.' });
    if (!password) return res.status(400).json({ success: false, message: '[Server] Password mancante nella richiesta.' });
    if (!id_ditta_scelta) return res.status(400).json({ success: false, message: '[Server] ID ditta scelta mancante nella richiesta.' });

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // BUGFIX: Aggiunto JOIN con RUOLI per ottenere `nome_ruolo`
        const [userRows] = await connection.query(`
            SELECT u.*, r.tipo as nome_ruolo 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            WHERE u.email = ?
        `, [email]);

        if (userRows.length === 0) {
            await connection.rollback(); return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        const user = userRows[0];

        if (!await bcrypt.compare(password, user.password)) {
            await connection.rollback(); return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }

        const [associazioneRows] = await connection.query(`
            SELECT id_ruolo, Codice_Tipo_Utente FROM ad_utenti_ditte 
            WHERE id_utente = ? AND id_ditta = ? AND stato = 'attivo'`, [user.id, id_ditta_scelta]);
        
        if (associazioneRows.length === 0) {
            await connection.rollback(); return res.status(403).json({ success: false, message: 'Accesso non autorizzato per la ditta selezionata.' });
        }
        
        const { id_ruolo, Codice_Tipo_Utente } = associazioneRows[0];
        const [ruoloInfo] = await connection.query('SELECT tipo FROM ruoli WHERE id = ?', [id_ruolo]);
        
        // Creiamo il contesto corretto con tutti i dati necessari per finalizzaLogin
        const userContext = { 
            ...user, 
            id_ditta: id_ditta_scelta, 
            id_ruolo, 
            Codice_Tipo_Utente,
            nome_ruolo: ruoloInfo[0]?.tipo
        };

        const response = await finalizzaLogin(connection, userContext, id_ditta_scelta);
        await connection.commit();
        res.json(response);
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Errore nella selezione della ditta:', error);
        res.status(500).json({ success: false, message: error.message || 'Errore interno del server.' });
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


