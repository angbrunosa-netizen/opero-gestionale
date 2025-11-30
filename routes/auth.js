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

// ++ MODIFICA: Aggiunta costanti dal file .env ++

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@default.com'; // Email del super admin

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
/**
 * @file opero/routes/auth.js (funzione interna)
 * @description Funzione ausiliaria per finalizzare il processo di login.
 *              Si occupa di loggare l'accesso, creare la sessione, costruire i permessi
 *              e generare il token JWT per l'utente.
 * @version 13.0
 * 
 * @param {object} connection - La connessione al database (già acquisita in una transazione).
 * @param {object} req - L'oggetto richiesta di Express, per accedere a IP e altri dati.
 * @param {object} userContext - L'oggetto con i dati base dell'utente (id, nome, email, etc.).
 * @param {number} id_ditta_scelta - L'ID della ditta in cui l'utente sta effettuando l'accesso.
 * @returns {Promise<object>} Una Promise che risolve con un oggetto contenente token, utente, ditta, moduli e permessi.
 */
async function finalizzaLogin(connection, req, userContext, id_ditta_scelta) {
    // 1. LOGGA L'ACCESSO
    const logAccessoQuery = `
        INSERT INTO log_accessi (id_utente, id_ditta, indirizzo_ip, data_ora_accesso, id_funzione_accessibile, dettagli_azione) 
        VALUES (?, ?, ?, NOW(), NULL, 'LOGIN_SUCCESSFUL')
    `;
    await connection.query(logAccessoQuery, [userContext.id, id_ditta_scelta, req.ip]);

    // 2. REGISTRA SESSIONE
    const registraSessioneQuery = `
        REPLACE INTO utenti_sessioni_attive (id_utente, id_ditta_attiva, login_timestamp, last_heartbeat_timestamp)
        VALUES (?, ?, NOW(), NOW())
    `;
    await connection.query(registraSessioneQuery, [userContext.id, id_ditta_scelta]);

    // 3. PERMESSI
    const permissions = await _buildPermissionsV2(connection, userContext.id, userContext.id_ruolo, id_ditta_scelta);

    // 4. PAYLOAD TOKEN
    const payload = {
        id: userContext.id,
        id_ditta: id_ditta_scelta,
        id_ruolo: userContext.id_ruolo,
        permissions: permissions,
        jti: uuidv4()
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // 5. DATI DITTA
    const [dittaRows] = await connection.query(`
        SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
        FROM ditte d
        LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
        WHERE d.id = ?`, [id_ditta_scelta]);

    // 6. MODULI
    const [moduleRows] = await connection.query(
        `SELECT m.codice, m.descrizione, m.chiave_componente 
         FROM ditte_moduli dm 
         JOIN moduli m ON dm.codice_modulo = m.codice 
         WHERE dm.id_ditta = ?`,
        [id_ditta_scelta]
    );

    delete userContext.password;
    
    const finalUserObject = {
        ...userContext,
        ruolo: userContext.nome_ruolo
    };

    return {
        success: true,
        token: token,
        user: finalUserObject,
        ditta: dittaRows[0] || null,
        modules: moduleRows,
        permissions: permissions
    };
}
// --- FUNZIONE AUSILIARIA PER COSTRUIRE I PERMESSI (MODIFICATA) ---
// --- NUOVA FUNZIONE PER COSTRUIRE I PERMESSI (v2.0) ---
async function _buildPermissionsV2(connection, id_utente, id_ruolo, id_ditta) {
    console.log(`[PERMISSIONS-v2] Avvio costruzione per utente: ${id_utente}, ruolo: ${id_ruolo}, ditta: ${id_ditta}`);
    try {
        const [funzioniDittaRows] = await connection.query(`SELECT f.id, f.codice FROM funzioni_ditte fd JOIN funzioni f ON fd.id_funzione = f.id WHERE fd.id_ditta = ?`, [id_ditta]);
        if (funzioniDittaRows.length === 0) {
            console.log(`[PERMISSIONS-v2] Nessuna funzione attiva per la ditta ${id_ditta}. Nessun permesso da assegnare.`);
            return [];
        }
        const funzioniDittaIds = funzioniDittaRows.map(f => f.id);

        const [rolePermissionsRows] = await connection.query(`SELECT f.codice FROM ruoli_funzioni rf JOIN funzioni f ON rf.id_funzione = f.id WHERE rf.id_ruolo = ? AND f.id IN (?)`, [id_ruolo, funzioniDittaIds]);
        const permissions = new Set(rolePermissionsRows.map(p => p.codice));

        const [overrideRows] = await connection.query(`SELECT f.codice, ufo.azione FROM utenti_funzioni_override ufo JOIN funzioni f ON ufo.id_funzione = f.id WHERE ufo.id_utente = ? AND ufo.id_ditta = ? AND f.id IN (?)`, [id_utente, id_ditta, funzioniDittaIds]);
        
        overrideRows.forEach(override => {
            if (override.azione === 'allow') permissions.add(override.codice);
            else if (override.azione === 'deny') permissions.delete(override.codice);
        });

        const finalPermissions = Array.from(permissions);
        console.log(`[PERMISSIONS-v2] Permessi finali costruiti: ${finalPermissions.length} totali.`);
        return finalPermissions;
    } catch (error) {
        console.error("[PERMISSIONS-v2] Errore critico durante la costruzione dei permessi:", error);
        throw new Error("Impossibile costruire i permessi utente.");
    }
}
// ++ MODIFICA: Funzione per gestire tentativi falliti e inviare notifica ++
async function handleFailedLogin(connection, user, ipAddress) {
    const newTentativi = user.tentativi_falliti + 1;
    const isNowBlocked = newTentativi >= MAX_TENTATIVI_FALLITI;
    
    const updateQuery = `UPDATE utenti SET tentativi_falliti = ?, stato = ? WHERE id = ?`;
    const newState = isNowBlocked ? 'bloccato' : 'attivo';
    
    await connection.query(updateQuery, [newTentativi, newState, user.id]);
    
    if (isNowBlocked) {
        console.warn(`[AUTH-SECURITY] Utente ${user.email} (ID: ${user.id}) BLOCCATO dopo ${MAX_TENTATIVI_FALLITI} tentativi falliti da IP: ${ipAddress}.`);
        
        // ++ NUOVA LOGICA: Prepara e invia l'email di notifica ++
        const mailSubject = `🚨 Allarme di Sicurezza: Account Utente Bloccato`;
        const mailBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; } .container { max-width: 600px; margin: 0 auto; padding: 20px; } .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; } .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; } .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }</style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Allarme di Sicurezza</h1>
                    </div>
                    <div class="content">
                        <p>Un account utente è stato bloccato a causa di un numero eccessivo di tentativi di accesso falliti.</p>
                        <hr>
                        <h3>Dettagli dell'Account Bloccato:</h3>
                        <ul>
                            <li><strong>Email Utente:</strong> ${user.email}</li>
                            <li><strong>ID Utente:</strong> ${user.id}</li>
                            <li><strong>Numero Tentativi:</strong> ${newTentativi}</li>
                            <li><strong>Indirizzo IP Sorgente:</strong> ${ipAddress}</li>
                            <li><strong>Data e Ora Blocco:</strong> ${new Date().toLocaleString('it-IT')}</li>
                        </ul>
                        <hr>
                        <p>Si consiglia di verificare l'account e contattare l'utente se necessario.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Opero Gestionale - Sistema di Sicurezza</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await sendSystemEmail(SUPER_ADMIN_EMAIL, mailSubject, mailBody);
            console.log(`[AUTH-SECURITY] Email di notifica inviata con successo a ${SUPER_ADMIN_EMAIL} per l'utente ${user.email}.`);
        } catch (emailError) {
            console.error(`[AUTH-SECURITY] ERRORE CRITICO: Impossibile inviare email di notifica a ${SUPER_ADMIN_EMAIL}:`, emailError);
        }
    }
}

// --- FUNZIONE PER RESETTARE TENTATIVI A SUCCESSO (Invariata) ---
async function handleSuccessfulLogin(connection, userId) {
    const updateQuery = `UPDATE utenti SET tentativi_falliti = 0 WHERE id = ?`;
    await connection.query(updateQuery, [userId]);
}


// STEP 1: AUTENTICAZIONE INIZIALE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password obbligatori.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();
        await pulisciSessioniScadute(connection);

        // 1. Recupero Utente BASE (incluso livello di default dalla tabella utenti)
        const userQuery = `
            SELECT u.id, u.nome, u.cognome, u.email, u.password, u.stato, 
                   u.tentativi_falliti, u.id_ditta, u.id_ruolo, u.livello, 
                   u.Codice_Tipo_Utente, r.tipo as nome_ruolo 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            WHERE u.email = ?`;
        
        const [userRows] = await connection.query(userQuery, [email]);

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        
        const user = userRows[0];

        if (user.stato === 'bloccato') {
            await connection.rollback();
            return res.status(423).json({ success: false, message: 'Account bloccato.', requiresPasswordReset: true });
        }

        const [sessioneEsistente] = await connection.query('SELECT id_utente FROM utenti_sessioni_attive WHERE id_utente = ?', [user.id]);
        if (sessioneEsistente.length > 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Utente già connesso da un altro dispositivo.' });
        }
        
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            await handleFailedLogin(connection, user, req.ip);
            await connection.commit();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }

        await handleSuccessfulLogin(connection, user.id);
        
        // 2. Ricerca Ditte Associate con calcolo livello corretto
        const ditteAssociateQuery = `
            /* Blocco 1: Ditte in ad_utenti_ditte (Usa livello specifico) */
            (SELECT
                d.id, d.ragione_sociale AS denominazione, d.logo_url,
                aud.livello
            FROM ad_utenti_ditte aud
            JOIN ditte d ON aud.id_ditta = d.id 
            WHERE aud.id_utente = ? AND aud.stato = 'attivo')
            
            UNION
            
            /* Blocco 2: Ditta legacy in utenti (Usa livello base dalla tabella utenti) */
            (SELECT
                d.id, d.ragione_sociale AS denominazione, d.logo_url,
                u.livello /* QUI VIENE PRESO IL LIVELLO BASE */
            FROM utenti u
            JOIN ditte d ON u.id_ditta = d.id 
            WHERE u.id = ? AND u.id_ditta IS NOT NULL
            AND d.id NOT IN (SELECT id_ditta FROM ad_utenti_ditte WHERE id_utente = ? AND stato = 'attivo')
            )
        `;

        const [ditteRows] = await connection.query(ditteAssociateQuery, [user.id, user.id, user.id]);

        if (ditteRows.length === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Nessuna ditta associata.' });
        }

        if (ditteRows.length === 1) {
            // CASO AUTOMATICO (Singola Ditta)
            const id_ditta_scelta = ditteRows[0].id;
            
            // Sovrascriviamo user.livello con quello determinato dalla query (specifico o base)
            user.livello = ditteRows[0].livello; 

            const [dittaInfoRows] = await connection.query('SELECT stato FROM ditte WHERE id = ?', [id_ditta_scelta]);
            if (dittaInfoRows[0].stato === 0) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'La ditta associata non è attiva.' });
            }
            
            const response = await finalizzaLogin(connection, req, user, id_ditta_scelta);
            await connection.commit();
            res.json(response);

        } else {
            // CASO SELEZIONE (Multi Ditta)
            delete user.password;
            // Inviamo al frontend le ditte con i rispettivi livelli già calcolati
            // Il frontend dovrà rimandare indietro l'ID ditta scelto allo step 2
            await connection.commit();
            res.json({ success: true, needsDittaSelection: true, ditte: ditteRows, user: user });
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Errore login:', error);
        res.status(500).json({ success: false, message: 'Errore interno.' });
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
        return res.status(400).json({ success: false, message: 'Dati mancanti.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();
        await pulisciSessioniScadute(connection);

        // 1. Recupero user BASE (con livello di default)
        const userQuery = `
            SELECT id, nome, cognome, email, password, stato, 
                   tentativi_falliti, id_ditta, id_ruolo, livello, Codice_Tipo_Utente 
            FROM utenti WHERE email = ?`;
        const [userRows] = await connection.query(userQuery, [email]);
        
        if (userRows.length === 0 || !await bcrypt.compare(password, userRows[0].password)) {
            // Gestione fallimento...
            if(userRows.length > 0) await handleFailedLogin(connection, userRows[0], req.ip);
            await connection.commit();
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }
        const user = userRows[0];

        if (user.stato === 'bloccato') {
            await connection.rollback();
            return res.status(423).json({ success: false, message: 'Account bloccato.', requiresPasswordReset: true });
        }
        await handleSuccessfulLogin(connection, user.id);
        
        // 2. Determinazione Livello Effettivo
        // Cerchiamo se esiste un override specifico per questa ditta
        const [permessoDitta] = await connection.query(
            'SELECT livello FROM ad_utenti_ditte WHERE id_utente = ? AND id_ditta = ? AND stato = "attivo"', 
            [user.id, id_ditta_scelta]
        );

        if (permessoDitta.length > 0) {
            // ESISTE SPECIFICO: Usiamo il livello dalla tabella di relazione
            user.livello = permessoDitta[0].livello;
        } else {
            // NON ESISTE SPECIFICO (Legacy): Usiamo il livello base utente
            // Verifica di sicurezza: l'utente deve essere collegato alla ditta legacy
            if (user.id_ditta != id_ditta_scelta) {
                 await connection.rollback();
                 return res.status(403).json({ success: false, message: 'Accesso non autorizzato a questa ditta.' });
            }
            // user.livello rimane quello caricato dalla tabella 'utenti' (DEFAULT)
        }

        const [dittaInfoRows] = await connection.query('SELECT stato FROM ditte WHERE id = ?', [id_ditta_scelta]);
        if (dittaInfoRows.length === 0 || dittaInfoRows[0].stato === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Ditta non attiva.' });
        }
        
        const response = await finalizzaLogin(connection, req, user, id_ditta_scelta);
        await connection.commit();
        res.json(response);

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Errore selezione ditta:', error);
        res.status(500).json({ success: false, message: 'Errore interno.' });
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

            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`; 
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
                <p>© ${new Date().getFullYear()} Opero Gestionale  - Tutti i diritti riservati abanexus</p>
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


router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Dati mancanti.' });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password troppo corta.' });

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [tokenRows] = await connection.query('SELECT id, id_utente FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()', [token]);
        
        if (tokenRows.length === 0) {
            await connection.rollback();
            if (connection) connection.release();
            return res.status(400).json({ success: false, message: 'Token non valido o scaduto.' });
        }

        const foundTokenData = tokenRows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // FIX: Azzera tentativi_falliti e imposta stato = 'attivo'
        await connection.query(
            'UPDATE utenti SET password = ?, tentativi_falliti = 0, stato= "attivo" WHERE id = ?', 
            [hashedPassword, foundTokenData.id_utente]
        );
        
        await connection.query('DELETE FROM password_reset_tokens WHERE id = ?', [foundTokenData.id]);

        await connection.commit();
        res.json({ success: true, message: 'Password aggiornata e account sbloccato.' });

    } catch (error) {
        if (connection) try { await connection.rollback(); } catch (e) {}
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Errore interno.' });
    } finally {
        if (connection) try { connection.release(); } catch (e) {}
    }
});
module.exports = router;


