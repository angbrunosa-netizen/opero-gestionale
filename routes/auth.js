/**
 * @file opero/routes/auth.js
 * @description file di rotte per l'autenticazione.
 * @date 2025-10-16
 * @version 11.0 (Integrazione Portineria di Sicurezza su Logica Esistente)
 * - Mantiene la logica di override dei permessi e la struttura del token.
 * - Aggiunto controllo stato ditta (attiva/sospesa).
 * - Aggiunto sistema anti-brute-force (blocco utente dopo 4 tentativi).
 * - Aggiunto controllo licenze per accessi concorrenti (interni/esterni).
 * - Implementato sistema di sessioni attive con heartbeat per pulizia automatica.
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

// --- ROTTA DI LOGIN CON PORTINERIA DI SICUREZZA ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // --- STEP 1: Ricerca Utente e Ditta (Query potenziata per la Portineria) ---
        const userQuery = `
            SELECT 
                u.id, u.id_ditta, u.nome, u.cognome, u.email, u.password, u.id_ruolo, u.livello, u.attivo,
                u.stato AS stato_utente, u.tentativi_falliti, u.Codice_Tipo_Utente,
                r.tipo AS nome_ruolo,
                d.stato AS stato_ditta, d.max_utenti_interni, d.max_utenti_esterni
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            JOIN ditte d ON u.id_ditta = d.id
            WHERE u.email = ?
        `;
        const [userRows] = await connection.query(userQuery, [email]);

        if (userRows.length === 0 || userRows[0].attivo !== 1) {
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide o utente non attivo.' });
        }

        const user = userRows[0];
        
        // --- STEP 2: Controllo Stato Ditta (Abbonamento) ---
        if (user.stato_ditta !== 1) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: "Accesso non consentito. L'abbonamento per questa azienda non è attivo." });
        }
        
        // --- STEP 3: Controllo Stato Utente "Bloccato" ---
        if (user.stato_utente === 'bloccato') {
            await connection.rollback();
            return res.status(403).json({ success: false, message: "Questo account è stato bloccato per motivi di sicurezza. Contattare l'amministratore per la riattivazione." });
        }

        // --- STEP 4: Verifica Password e Gestione Brute-Force ---
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const nuoviTentativi = user.tentativi_falliti + 1;
            if (nuoviTentativi >= MAX_TENTATIVI_FALLITI) {
                await connection.query("UPDATE utenti SET tentativi_falliti = ?, stato = 'bloccato' WHERE id = ?", [nuoviTentativi, user.id]);
            } else {
                await connection.query('UPDATE utenti SET tentativi_falliti = ? WHERE id = ?', [nuoviTentativi, user.id]);
            }
            await connection.commit();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        
        if (user.tentativi_falliti > 0) {
            await connection.query('UPDATE utenti SET tentativi_falliti = 0 WHERE id = ?', [user.id]);
        }

        // --- STEP 5: Pulizia Sessioni Scadute (Heartbeat) ---
        const cutoffTime = new Date();
        cutoffTime.setMinutes(cutoffTime.getMinutes() - DURATA_SESSIONE_MINUTI);
        await connection.query('DELETE FROM utenti_sessioni_attive WHERE last_heartbeat_timestamp < ?', [cutoffTime]);
        
        // --- STEP 6: Controllo Sessione Utente Già Attiva ---
        const [activeSessionRows] = await connection.query('SELECT id_utente FROM utenti_sessioni_attive WHERE id_utente = ?', [user.id]);
        if (activeSessionRows.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: 'Risulta già una sessione di lavoro attiva. Effettuare il logout prima di iniziare una nuova sessione.' });
        }
        
        // --- STEP 7: Controllo Licenze Ditta ---
        const licenzeQuery = `
            SELECT u.Codice_Tipo_Utente, COUNT(usa.id_utente) as attivi
            FROM utenti_sessioni_attive usa
            JOIN utenti u ON usa.id_utente = u.id
            WHERE usa.id_ditta_attiva = ?
            GROUP BY u.Codice_Tipo_Utente
        `;
        const [licenzeRows] = await connection.query(licenzeQuery, [user.id_ditta]);
        
        const licenzeAttive = { 1: 0, 2: 0 }; // Assumendo 1: Interno, 2: Esterno
        licenzeRows.forEach(row => {
            licenzeAttive[row.Codice_Tipo_Utente] = row.attivi;
        });

        if (user.Codice_Tipo_Utente === 1 && licenzeAttive[1] >= user.max_utenti_interni) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Accesso non consentito. È stato raggiunto il numero massimo di licenze per utenti interni.' });
        }
        if (user.Codice_Tipo_Utente === 2 && licenzeAttive[2] >= user.max_utenti_esterni) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Accesso non consentito. È stato raggiunto il numero massimo di licenze per utenti esterni.' });
        }

        // --- STEP 8: Accesso Autorizzato e Costruzione Permessi (LOGICA ESISTENTE PRESERVATA) ---
        const permissionsQuery = `SELECT f.codice FROM funzioni f JOIN ruoli_funzioni rf ON f.id = rf.id_funzione WHERE rf.id_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
        const permissionsSet = new Set(permissionRows.map(p => p.codice));

        const overrideQuery = `
            SELECT f.codice, ufo.azione 
            FROM utenti_funzioni_override as ufo
            JOIN funzioni as f ON ufo.id_funzione = f.id
            WHERE ufo.id_utente = ?`;
        const [overrides] = await connection.query(overrideQuery, [user.id]);

        for (const override of overrides) {
            if (override.azione === 'allow') {
                permissionsSet.add(override.codice);
            } else if (override.azione === 'deny') {
                permissionsSet.delete(override.codice);
            }
        }
        
        const permissions = Array.from(permissionsSet);

        // Recupero moduli e info ditta (LOGICA ESISTENTE PRESERVATA)
        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [user.id_ditta]);

        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [user.id_ditta]);
        const ditta = dittaRows[0] || null;

        // Creazione Token (STRUTTURA ESISTENTE PRESERVATA + jti)
        const jti = uuidv4();
        const token = jwt.sign(
            { 
                id: user.id, 
                id_ditta: user.id_ditta, 
                id_ruolo: user.id_ruolo, 
                livello: user.livello,
                permissions: permissions,
                ditta: ditta,
                jti // Aggiunto per tracciamento sessione
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Registrazione in Portineria
        await connection.query(
            'INSERT INTO utenti_sessioni_attive (id_utente, id_ditta_attiva) VALUES (?, ?)',
            [user.id, user.id_ditta]
        );
        
        await connection.commit();
        
        // Risposta al client (STRUTTURA ESISTENTE PRESERVATA)
        delete user.password;
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                cognome: user.cognome,
                email: user.email,
                ruolo: user.nome_ruolo,
                livello: user.livello
            },
            ditta: ditta,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore durante il login:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- NUOVA ROTTA: LOGOUT ---
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

// --- NUOVA ROTTA: HEARTBEAT ---
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

// --- ROTTA GET /me (VERIFICATA E CORRETTA) ---
// Ho corretto req.user.userId in req.user.id per coerenza con la nuova struttura del token
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

