// #####################################################################
// # Rotte di Amministrazione Sistema - v6.0 (Fix Definitivo Async/Await)
// # File: opero/routes/admin.js
// #####################################################################

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbPool } = require('../config/db');
const { verifyToken, checkRole,checkPermission } = require('../utils/auth');



// Middleware per i ruoli
const isSystemAdmin = checkRole([1]); 
const isDittaAdmin = checkRole([1, 2]);

// ====================================================================\
// API GESTIONE DITTE (Accesso Esclusivo per System Admin)
// ====================================================================\

router.get('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    const query = `
        SELECT d.*, td.tipo as tipo_ditta_nome 
        FROM ditte d 
        LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
        ORDER BY d.ragione_sociale`;
    try {
        const [rows] = await dbPool.query(query);
        res.json({ success: true, ditte: rows });
    } catch (error) {
        console.error("Errore nel recupero delle ditte:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle ditte.' });
    }
});

router.post('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id, ...dittaData } = req.body;
    try {
        if (id) {
            await dbPool.query('UPDATE ditte SET ? WHERE id = ?', [dittaData, id]);
            res.json({ success: true, message: 'Ditta aggiornata con successo.', id_ditta: id });
        } else {
            const [result] = await dbPool.query('INSERT INTO ditte SET ?', dittaData);
            res.status(201).json({ success: true, message: 'Ditta creata con successo.', id_ditta: result.insertId });
        }
    } catch (error) {
        console.error("Errore salvataggio ditta:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della ditta.' });
    }
});

// ====================================================================\
// API GESTIONE UTENTI (Accesso per Amministratori di Ditta)
// ====================================================================\

router.get('/utenti/ditta/:id_ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    const requester = req.user;

    // --- CONTROLLO DI SICUREZZA ---
    // Un Ditta Admin può vedere solo gli utenti della propria ditta.
    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    // Corretta la query per usare CONCAT e restituire un campo "username" per il frontend
    const query = 'SELECT id, CONCAT(nome, " ", cognome) as username, email, id_ruolo FROM utenti WHERE id_ditta = ?';
    try {
        const [rows] = await dbPool.query(query, [id_ditta]);
        res.json({ success: true, utenti: rows });
    } catch (error) {
        console.error(`Errore recupero utenti per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: "Errore nel recupero degli utenti." });
    }
});



router.post('/utenti', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id, nome, cognome, email, password, id_ditta, id_ruolo } = req.body;
    const requester = req.user;
    
    // --- CONTROLLI DI SICUREZZA AVANZATI ---
    if (requester.id_ruolo === 2) { // Se chi fa la richiesta è un Amministratore Ditta
        // 1. Non può creare/modificare utenti per ditte diverse dalla propria.
        if (parseInt(id_ditta, 10) !== requester.id_ditta) {
            return res.status(403).json({ success: false, message: 'Non autorizzato a gestire utenti di altre ditte.' });
        }
        // 2. Non può creare/assegnare ruoli uguali o superiori al proprio (es. altri Admin).
        if (parseInt(id_ruolo, 10) <= 2) {
            return res.status(403).json({ success: false, message: 'Non autorizzato ad assegnare ruoli di amministratore.' });
        }
    }

    try {
        if (id) { // Aggiornamento
            let query = 'UPDATE utenti SET nome = ?, cognome = ?, email = ?, id_ditta = ?, id_ruolo = ?';
            const params = [nome, cognome, email, id_ditta, id_ruolo];
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                query += ', password = ? WHERE id = ?';
                params.push(hashedPassword, id);
            } else {
                query += ' WHERE id = ?';
                params.push(id);
            }
            await dbPool.query(query, params);
            res.json({ success: true, message: 'Utente aggiornato con successo.' });
        } else { // Creazione
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO utenti (nome, cognome, email, password, id_ditta, id_ruolo) VALUES (?, ?, ?, ?, ?, ?)';
            const params = [nome, cognome, email, hashedPassword, id_ditta, id_ruolo];
            await dbPool.query(query, params);
            res.status(201).json({ success: true, message: 'Utente creato con successo.' });
        }
    } catch (error) {
        console.error("Errore salvataggio utente:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'L\'email fornita è già in uso.' });
        }
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio dell\'utente.' });
    }
});

// --- NUOVA ROTTA PER L'ELIMINAZIONE ---
router.delete('/utenti/:id', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

    try {
        const [userToDeleteRows] = await dbPool.query('SELECT id_ditta, id_ruolo FROM utenti WHERE id = ?', [id]);
        if (userToDeleteRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
        const userToDelete = userToDeleteRows[0];

        // --- CONTROLLI DI SICUREZZA ---
        if (requester.id_ruolo === 2) {
            if (userToDelete.id_ditta !== requester.id_ditta) {
                return res.status(403).json({ success: false, message: 'Non autorizzato a eliminare utenti di altre ditte.' });
            }
            if (userToDelete.id_ruolo <= 2) {
                return res.status(403).json({ success: false, message: 'Non autorizzato a eliminare utenti amministratori.' });
            }
        }
        
        await dbPool.query('DELETE FROM utenti WHERE id = ?', [id]);
        res.json({ success: true, message: 'Utente eliminato con successo.' });

    } catch (error) {
        console.error(`Errore eliminazione utente ${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione dell\'utente.' });
    }
});

   // / --- NUOVA API: Restituisce i dettagli di un singolo utente per la modifica ---
router.get('/utenti/:id', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

    try {
        const [userRows] = await dbPool.query('SELECT id, nome, cognome, email, id_ditta, id_ruolo FROM utenti WHERE id = ?', [id]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
        const user = userRows[0];

        // --- CONTROLLO DI SICUREZZA ---
        // Un Ditta Admin può vedere solo gli utenti della propria ditta.
        if (requester.id_ruolo === 2 && user.id_ditta !== requester.id_ditta) {
            return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
        }

        res.json({ success: true, utente: user });

    } catch (error) {
        console.error(`Errore nel recupero dell'utente ${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ====================================================================\
// API GESTIONE MODULI e ASSOCIAZIONI (Accesso per Ditta Admin)
// ====================================================================\

// ### LA CORREZIONE È PRINCIPALMENTE QUI ###
// --- MODIFICA SICUREZZA: Accesso solo per System Admin ---
router.get('/moduli', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        // --- LA CORREZIONE È QUI ---
        // Seleziono 'codice' e 'descrizione', rinominandoli come atteso dal frontend ('id', 'nome_modulo').
        const [rows] = await dbPool.query('SELECT codice as id, descrizione as nome_modulo FROM moduli ORDER BY descrizione');
        res.json({ success: true, moduli: rows });
    } catch (error) {
        console.error("Errore nel recupero dei moduli:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei moduli.' });
    }
});




// --- MODIFICA: Corretto nome tabella e colonna ---
router.get('/associazioni/:id_ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    try {
        const [rows] = await dbPool.query('SELECT codice_modulo FROM ditte_moduli WHERE id_ditta = ?', [id_ditta]);
        const moduliAssociati = rows.map(r => r.codice_modulo);
        res.json({ success: true, moduli: moduliAssociati });
    } catch (error) {
        console.error(`Errore recupero associazioni per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle associazioni.' });
    }
});

// --- MODIFICA: Corretto nome tabella e colonna ---
router.post('/salva-associazioni', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta, moduli } = req.body;
    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        await connection.query('DELETE FROM ditte_moduli WHERE id_ditta = ?', [id_ditta]);

        if (moduli && moduli.length > 0) {
            const values = moduli.map(codice_modulo => [id_ditta, codice_modulo]);
            await connection.query('INSERT INTO ditte_moduli (id_ditta, codice_modulo) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Associazioni salvate con successo.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore salvataggio associazioni:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio delle associazioni.' });
    } finally {
        if (connection) connection.release();
    }
});




// ====================================================================\
// API GESTIONE PRIVACY POLICY 
// ====================================================================\


router.get('/privacy-ditta/:id_ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    const requester = req.user;

    // Un Admin di ditta può vedere solo la policy della propria ditta
    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    try {
        const [rows] = await dbPool.query("SELECT responsabile_trattamento, corpo_lettera FROM privacy_ditta WHERE id_ditta = ?", [id_ditta]);
        const privacy = rows.length > 0 ? rows[0] : null;
        res.json({ success: true, privacy });
    } catch (error) {
        console.error(`Errore recupero privacy per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: 'Errore durante il recupero della policy.' });
    }
});

router.post('/privacy-ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta, responsabile_trattamento, corpo_lettera } = req.body;
    const requester = req.user;

    // Un Admin di ditta può modificare solo la policy della propria ditta
    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    const query = `
        INSERT INTO privacy_ditta (id_ditta, responsabile_trattamento, corpo_lettera, data_aggiornamento)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            responsabile_trattamento = VALUES(responsabile_trattamento),
            corpo_lettera = VALUES(corpo_lettera),
            data_aggiornamento = NOW()
    `;
    try {
        await dbPool.query(query, [id_ditta, responsabile_trattamento, corpo_lettera]);
        res.json({ success: true, message: 'Privacy policy salvata con successo.' });
    } catch (error) {
        console.error("Errore salvataggio privacy policy:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della policy.' });
    }
});


// ====================================================================\
// API PER TABELLE DI SUPPORTO
// ====================================================================\

router.get('/ruoli', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        // --- LA CORREZIONE È QUI ---
        // Ho corretto il nome del campo in 'tipo' e ho usato un alias 'as ruolo' per compatibilità con il frontend.
        let query = 'SELECT id, tipo as ruolo FROM ruoli';
        const params = [];

        if (req.user.id_ruolo !== 1) {
            query += ' WHERE id > ?';
            params.push(req.user.id_ruolo); 
        }
        query += ' ORDER BY id';
        
        const [rows] = await dbPool.query(query, params);
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        console.error("Errore nel recupero dei ruoli:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});

// ====================================================================\\
// API GESTIONE FUNZIONI (Accesso Esclusivo per System Admin)
// ====================================================================\\

// GET: Ottiene tutte le funzioni definite nel sistema
router.get('/funzioni', [verifyToken, isSystemAdmin, checkPermission('ADMIN_FUNZIONI_VIEW')], async (req, res) => {
    try {
        const [funzioni] = await dbPool.query('SELECT * FROM funzioni ORDER BY codice');
        res.json({ success: true, funzioni });
    } catch (error) {
        console.error("Errore nel recupero delle funzioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// POST: Crea una nuova funzione
router.post('/funzioni', [verifyToken, isSystemAdmin, checkPermission('ADMIN_FUNZIONI_MANAGE')], async (req, res) => {
    const { codice, descrizione, chiave_componente_modulo } = req.body;
    if (!codice || !descrizione) {
        return res.status(400).json({ success: false, message: 'Codice e descrizione sono obbligatori.' });
    }

    try {
        const [result] = await dbPool.query(
            'INSERT INTO funzioni (codice, descrizione, chiave_componente_modulo) VALUES (?, ?, ?)',
            [codice.toUpperCase(), descrizione, chiave_componente_modulo]
        );
        // LOG AZIONE
        await dbPool.query('INSERT INTO log_azioni (id_utente, azione) VALUES (?, ?)', [req.user.id, `Creazione funzione: ${codice.toUpperCase()}`]);
        res.status(201).json({ success: true, message: 'Funzione creata con successo.', id: result.insertId });
    } catch (error) {
        console.error("Errore nella creazione della funzione:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Codice funzione già esistente.' });
        }
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// GET: Ottiene gli ID delle funzioni associate a una ditta
router.get('/funzioni-ditta/:id_ditta', [verifyToken, isSystemAdmin, checkPermission('ADMIN_FUNZIONI_VIEW')], async (req, res) => {
    const { id_ditta } = req.params;
    try {
        const [funzioni] = await dbPool.query('SELECT id_funzione FROM funzioni_ditte WHERE id_ditta = ?', [id_ditta]);
        res.json({ success: true, funzioni: funzioni.map(f => f.id_funzione) });
    } catch (error) {
        console.error("Errore nel recupero delle funzioni per ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// POST per associare funzioni a una ditta (solo System Admin)
router.post('/funzioni-ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    console.log('--- RICEVUTA RICHIESTA POST /api/admin/funzioni-ditta ---');
    console.log('Body ricevuto:', JSON.stringify(req.body, null, 2));

    const { id_ditta, funzioni } = req.body;

    if (!id_ditta || !Array.isArray(funzioni)) {
        console.error('Validazione fallita: id_ditta o array funzioni mancanti.');
        return res.status(400).json({ success: false, message: 'ID ditta e array di funzioni sono richiesti.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM funzioni_ditte WHERE id_ditta = ?', [id_ditta]);

        if (funzioni.length > 0) {
            const values = funzioni.map(id_funzione => [id_ditta, id_funzione]);
            await connection.query('INSERT INTO funzioni_ditte (id_ditta, id_funzione) VALUES ?', [values]);
        }

        await connection.commit();
        console.log('Salvataggio completato con successo.');
        res.json({ success: true, message: 'Associazioni funzioni-ditta aggiornate.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore durante l'aggiornamento delle associazioni funzioni-ditta:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    } finally {
        connection.release();
    }
});


// ====================================================================\\
// API GESTIONE RUOLI E PERMESSI (Per Amministratori di Ditta)
// ====================================================================\\

// GET per le funzioni abilitate per la ditta dell'utente loggato (Ditta Admin)
router.get('/ditta/funzioni', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        const id_ditta = req.user.id_ditta;
        const [funzioni] = await dbPool.query(
            `SELECT f.id, f.codice, f.descrizione, f.chiave_componente_modulo
             FROM funzioni f
             JOIN funzioni_ditte fd ON f.id = fd.id_funzione
             WHERE fd.id_ditta = ?
             ORDER BY f.chiave_componente_modulo, f.codice`,
            [id_ditta]
        );
        res.json({ success: true, funzioni });
    } catch (error) {
        console.error("Errore recupero funzioni per la ditta:", error);
        res.status(500).json({ success: false, message: "Errore del server." });
    }
});
// POST: Crea un nuovo ruolo specifico per la ditta
router.post('/ditta/ruoli', [verifyToken, isDittaAdmin, checkPermission('ADMIN_RUOLI_MANAGE')], async (req, res) => {
    const { tipo, livello } = req.body;
    const { id_ditta, livello: userLevel } = req.user;

    if (livello >= userLevel) {
        return res.status(403).json({ success: false, message: 'Non puoi creare un ruolo con un livello uguale o superiore al tuo.' });
    }

    try {
        const [result] = await dbPool.query(
            'INSERT INTO ruoli (tipo, livello, id_ditta) VALUES (?, ?, ?)',
            [tipo, livello, id_ditta]
        );
        // LOG AZIONE
        await dbPool.query('INSERT INTO log_azioni (id_utente, azione) VALUES (?, ?)', [req.user.id, `Creazione ruolo di ditta: ${tipo}`]);
        res.status(201).json({ success: true, message: 'Ruolo creato con successo.', id: result.insertId });
    } catch (error) {
        console.error("Errore nella creazione del ruolo di ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// GET per i permessi (funzioni) di un ruolo specifico della ditta
router.get('/ditta/permessi/:id_ruolo', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        const { id_ruolo } = req.params;
        const [permessi] = await dbPool.query(
            'SELECT id_funzione FROM ruoli_funzioni WHERE id_ruolo = ?',
            [id_ruolo]
        );
        res.json({ success: true, permessi: permessi.map(p => p.id_funzione) });
    } catch(error){
        console.error("Errore nel recupero dei permessi del ruolo", error);
        res.status(500).json({ success: false, message: 'Errore del server' });
    }
});


// POST per salvare i permessi di un ruolo (Ditta Admin)
router.post('/ditta/permessi', [verifyToken, isDittaAdmin, checkPermission('ADMIN_RUOLI_MANAGE')], async (req, res) => {
    const { id_ruolo, permessi } = req.body; // permessi è un array di id_funzione
    const id_ditta = req.user.id_ditta;

    if (!id_ruolo || !Array.isArray(permessi)) {
        return res.status(400).json({ success: false, message: 'ID ruolo e array di permessi sono richiesti.' });
    }
    
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // Sicurezza: Verifico che tutte le funzioni che si sta cercando di assegnare
        // siano effettivamente state abilitate per la ditta.
        const [funzioniAbilitate] = await connection.query('SELECT id_funzione FROM funzioni_ditte WHERE id_ditta = ?', [id_ditta]);
        const setFunzioniAbilitate = new Set(funzioniAbilitate.map(f => f.id_funzione));
        
        for (const id_permesso of permessi) {
            if (!setFunzioniAbilitate.has(id_permesso)) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: `Tentativo di assegnare il permesso ${id_permesso} non abilitato per questa ditta.` });
            }
        }
        
        // Procedo con il salvataggio
        await connection.query('DELETE FROM ruoli_funzioni WHERE id_ruolo = ?', [id_ruolo]);
        if (permessi.length > 0) {
            const values = permessi.map(id_funzione => [id_ruolo, id_funzione]);
            await connection.query('INSERT INTO ruoli_funzioni (id_ruolo, id_funzione) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Permessi del ruolo aggiornati con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore durante il salvataggio dei permessi del ruolo:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    } finally {
        connection.release();
    }
});

module.exports = router;

