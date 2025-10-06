// #####################################################################
// # Rotte di Amministrazione Sistema - v6.0 (Fix Definitivo Async/Await)
// # File: opero/routes/admin.js
// #####################################################################

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbPool } = require('../config/db');
const { verifyToken, checkRole } = require('../utils/auth');


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

module.exports = router;

