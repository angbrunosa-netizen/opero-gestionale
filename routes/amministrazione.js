// #####################################################################
// # Rotte per il Modulo Amministrazione - v3.6 (Logica Conti Dinamici)
// # File: opero/routes/amministrazione.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
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
const { v4: uuidv4 } = require('uuid'); // Per generare token unici
// --- Configurazione Cifratura (dal tuo .env) ---
// ## FIX: Garantiamo che la chiave sia sempre di 32 byte ##
// Usiamo un hash SHA-256 per derivare una chiave di lunghezza fissa e sicura
// dalla chiave segreta fornita nel file .env, indipendentemente dalla sua lunghezza originale.
const secret = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_chars_!!';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// --- Funzione Helper per trovare il prossimo SOTTOCONTO disponibile ---
async function findNextAvailableSottoconto(dittaId, contoId, connection) {
    const query = `
        SELECT MAX(CAST(codice AS UNSIGNED)) as last_sottoconto
        FROM sottoconti 
        WHERE id_ditta = ? AND id_conto = ?
    `;
    const [rows] = await connection.query(query, [dittaId, contoId]);
    const lastSottoconto = rows[0].last_sottoconto || 0;
    return (lastSottoconto + 1).toString().padStart(6, '0');
}
// route conti mastro

router.get('/conti/:mastro', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { mastro } = req.params;

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

// --- GET (Lista Relazioni Ditta) ---
router.get('/relazioni', verifyToken, async (req, res) => {
    try {
        const query = "SELECT codice, descrizione FROM relazioni_ditta ORDER BY descrizione ASC";
        const [rows] = await dbPool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recuperare le relazioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Lista Anagrafiche) ---
router.get('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    if (!dittaId) return res.status(400).json({ success: false, message: 'ID ditta non trovato.' });

    try {
        const query = `
            SELECT a.id, a.ragione_sociale, a.p_iva, a.codice_fiscale, a.stato, 
                   r.descrizione AS relazione, a.id_conto_collegato
            FROM ditte a 
            LEFT JOIN relazioni_ditta r ON a.codice_relazione = r.codice
            WHERE a.id_ditta_proprietaria = ? ORDER BY a.ragione_sociale ASC
        `;
        const [rows] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Dettaglio Anagrafica) ---
router.get('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    if (!dittaId) return res.status(400).json({ success: false, message: 'ID ditta non trovato.' });

    try {
        const query = `
            SELECT d.*, s.id_conto 
            FROM ditte d
            LEFT JOIN sottoconti s ON d.id_conto_collegato = s.id
            WHERE d.id = ? AND d.id_ditta_proprietaria = ?
        `;
        const [rows] = await dbPool.query(query, [id, dittaId]);

        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore recupero dettaglio.' });
    }
});


// --- POST (Crea Anagrafica con SOTTOCONTO sotto un CONTO specifico) ---
router.post('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const anagraficaData = req.body;
    const { id_conto, ragione_sociale } = anagraficaData; // id_conto è l'ID del CONTO PADRE scelto

    if (!id_conto) {
        return res.status(400).json({ success: false, message: 'È necessario selezionare un conto a cui collegare l\'anagrafica.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const nuovoSottocontoCodice = await findNextAvailableSottoconto(dittaId, id_conto, connection);
        
        const [sottocontoResult] = await connection.query(
            'INSERT INTO sottoconti (id_ditta, id_conto, codice, descrizione) VALUES (?, ?, ?, ?)',
            [dittaId, id_conto, nuovoSottocontoCodice, ragione_sociale]
        );
        const nuovoSottocontoId = sottocontoResult.insertId;

        const dittaToInsert = { ...anagraficaData, id_ditta_proprietaria: dittaId, id_conto_collegato: nuovoSottocontoId };
        delete dittaToInsert.id;
        delete dittaToInsert.id_conto; // Rimuoviamo il campo temporaneo

        const fields = Object.keys(dittaToInsert);
        const values = Object.values(dittaToInsert);
        const placeholders = fields.map(() => '?').join(',');

        const [result] = await connection.query(`INSERT INTO ditte (${fields.join(',')}) VALUES (${placeholders})`, values);
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Anagrafica e sottoconto creati.', insertId: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore creazione anagrafica:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore durante la creazione.' });
    } finally {
        connection.release();
    }
});

// --- PATCH (Aggiorna Anagrafica e SOTTOCONTO) ---
router.patch('/anagrafiche/:id', verifyToken, async (req, res) => {
    // La logica di modifica del conto/sottoconto è complessa e richiede
    // una gestione attenta per evitare dati inconsistenti.
    // Per ora, ci concentriamo sull'aggiornamento dei dati anagrafici.
    // La modifica del conto collegato verrà implementata in un secondo momento.
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    const anagraficaData = req.body;

    // Per ora, non permettiamo la modifica del conto collegato tramite questa rotta
    delete anagraficaData.id_conto_collegato;
    delete anagraficaData.id_conto;
    delete anagraficaData.id;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const fields = Object.keys(anagraficaData).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(anagraficaData), id, dittaId];
        await connection.query(`UPDATE ditte SET ${fields} WHERE id = ? AND id_ditta_proprietaria = ?`, values);
        
        // Se la ragione sociale cambia, aggiorniamo la descrizione del sottoconto
        if (anagraficaData.ragione_sociale) {
            const [ditta] = await connection.query('SELECT id_conto_collegato FROM ditte WHERE id = ?', [id]);
            if (ditta.length > 0 && ditta[0].id_conto_collegato) {
                await connection.query(
                    'UPDATE sottoconti SET descrizione = ? WHERE id_ditta = ? AND id = ?',
                    [anagraficaData.ragione_sociale, dittaId, ditta[0].id_conto_collegato]
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore aggiornamento anagrafica:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    } finally {
        connection.release();
    }
});

// --- GET (Lista Utenti della Ditta) ---
router.get('/utenti', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const query = `
            SELECT u.id, u.nome, u.cognome, u.email, u.attivo, r.tipo as ruolo
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.id_ditta = ? ORDER BY u.cognome, u.nome
        `;
        const [users] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore recupero utenti.' });
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
router.post('/utenti/genera-link-registrazione', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;

    try {
        const token = uuidv4();
        const scadenza = new Date();
        scadenza.setDate(scadenza.getDate() + 7); // Il link scade tra 7 giorni

        const query = 'INSERT INTO registration_tokens (id_ditta, token, scadenza) VALUES (?, ?, ?)';
        await dbPool.query(query, [dittaId, token, scadenza]);

        // Assicurati che l'URL del frontend sia corretto
        const registrationLink = `http://localhost:3003/register/${token}`;

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
        const [types] = await dbPool.query("SELECT Codice, Descrizione FROM tipi_utente ORDER BY Descrizione");
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei tipi utente.' });
    }
});

module.exports = router;
