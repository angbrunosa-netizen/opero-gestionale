// #####################################################################
// # Rotte di Amministrazione Sistema (MASTER) - v4.0 (Ristrutturato)
// # File: opero/routes/admin.js
// #####################################################################

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Importa il pool di connessioni e gli strumenti di autenticazione
const { dbPool } = require('../config/db');
const { checkAuth, checkRole } = require('../utils/auth');

// Middleware per i ruoli
const isSystemAdmin = checkRole([1]); // Ruolo Amministratore_sistema
const isDittaAdmin = checkRole([1, 2]); // Ruoli Amministratore_sistema o Amministratore_Azienda

// Applica l'autenticazione a tutte le rotte di questo file
router.use(checkAuth);

// ====================================================================
// API GESTIONE DITTE (Solo MASTER)
// ====================================================================

router.get('/ditte', isSystemAdmin, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [rows] = await connection.query(`
            SELECT d.*, td.tipo as tipo_ditta_nome 
            FROM ditte d 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            ORDER BY d.ragione_sociale
        `);
        res.json({ success: true, ditte: rows });
    } catch (error) {
        console.error("Errore nel recupero delle ditte:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle ditte.' });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/ditte', isSystemAdmin, async (req, res) => {
    const { ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato } = req.body;
    if (!ragione_sociale || !mail_1 || !id_tipo_ditta) {
        return res.status(400).json({ success: false, message: 'Ragione Sociale, Email e Tipo Ditta sono obbligatori.' });
    }
    
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO ditte (ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato) VALUES (?, ?, ?, ?, ?, ?)', 
            [ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato]
        );
        res.status(201).json({ success: true, message: 'Ditta creata con successo.', insertId: result.insertId });
    } catch (error) {
        console.error("Errore creazione ditta:", error);
        res.status(500).json({ success: false, message: 'Errore nella creazione della ditta.' });
    } finally {
        if (connection) connection.release();
    }
});

router.patch('/ditte/:id', isSystemAdmin, async (req, res) => {
    const { id } = req.params;
    const dittaData = req.body;
    delete dittaData.id; // Rimuovi l'id per sicurezza
    
    const fields = Object.keys(dittaData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dittaData), id];

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Nessun dato da aggiornare.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        const [result] = await connection.query(`UPDATE ditte SET ${fields} WHERE id = ?`, values);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Ditta aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Ditta non trovata.' });
        }
    } catch (error) {
        console.error("Errore aggiornamento ditta:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della ditta.' });
    } finally {
        if (connection) connection.release();
    }
});

// ====================================================================
// API GESTIONE UTENTI
// ====================================================================

router.get('/utenti', isDittaAdmin, async (req, res) => {
    const requestor = req.userData;
    let query = 'SELECT u.id, u.email, u.nome, u.cognome, u.id_ditta, u.id_ruolo, r.tipo as ruolo FROM utenti u LEFT JOIN ruoli r ON u.id_ruolo = r.id';
    const params = [];

    // Se l'utente è un admin di ditta (ruolo 2), limita la vista alla sua ditta
    if (requestor.roleId === 2) {
        query += ' WHERE u.id_ditta = ?';
        params.push(requestor.dittaId);
    }
    query += ' ORDER BY u.cognome, u.nome';

    let connection;
    try {
        connection = await dbPool.getConnection();
        const [rows] = await connection.query(query, params);
        res.json({ success: true, utenti: rows });
    } catch (error) {
        console.error("Errore recupero utenti:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero degli utenti.' });
    } finally {
        if (connection) connection.release();
    }
});

// ====================================================================
// NUOVE ROTTE PER GESTIONE MODULI DITTA (Solo MASTER)
// ====================================================================

router.get('/ditte-moduli', isSystemAdmin, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [ditte] = await connection.query('SELECT id, ragione_sociale FROM ditte');
        const [moduli] = await connection.query('SELECT codice, descrizione FROM moduli');
        const [associazioni] = await connection.query('SELECT id_ditta, codice_modulo FROM ditte_moduli');

        const ditteConModuli = ditte.map(ditta => {
            const moduliAssociati = associazioni
                .filter(a => a.id_ditta === ditta.id)
                .map(a => a.codice_modulo);
            return { ...ditta, moduli: moduliAssociati };
        });

        res.json({ ditte: ditteConModuli, moduli });
    } catch (error) {
        console.error("ERRORE SUL SERVER in /api/admin/ditte-moduli:", error);
        res.status(500).json({ message: 'Errore sul server durante il recupero dei dati.' });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/salva-associazioni', isSystemAdmin, async (req, res) => {
    const { id_ditta, moduli } = req.body;
    if (!id_ditta || !Array.isArray(moduli)) {
        return res.status(400).send('Dati non validi.');
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        await connection.query('DELETE FROM ditte_moduli WHERE id_ditta = ?', [id_ditta]);

        if (moduli.length > 0) {
            const values = moduli.map(codice_modulo => [id_ditta, codice_modulo]);
            await connection.query('INSERT INTO ditte_moduli (id_ditta, codice_modulo) VALUES ?', [values]);
        }

        await connection.commit();
        res.send('Associazioni salvate con successo.');
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore nel salvataggio delle associazioni:", error);
        res.status(500).send("Errore nel salvataggio delle associazioni.");
    } finally {
        if (connection) connection.release();
    }
});

// ====================================================================
// API PER TABELLE DI SUPPORTO (Solo MASTER)
// ====================================================================

router.get('/tipi-ditta', isSystemAdmin, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM tipo_ditta');
        res.json({ success: true, tipi_ditta: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei tipi ditta.' });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/relazioni', isSystemAdmin, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM relazioni_ditta');
        res.json({ success: true, relazioni: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero delle relazioni.' });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/ruoli', isSystemAdmin, async (req, res) => {
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM ruoli ORDER BY livello DESC');
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
