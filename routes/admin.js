// #####################################################################
// # Rotte di Amministrazione Sistema - v5.1 (Refactoring Completo)
// # File: opero/routes/admin.js
// #####################################################################

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { dbPool } = require('../config/db');
const { verifyToken, checkRole } = require('../utils/auth');

// Middleware per i ruoli, ora più leggibili
const isSystemAdmin = checkRole([1]); // Ruolo Amministratore_sistema
const isDittaAdmin = checkRole([1, 2]); // Ruoli Amministratore_sistema o Amministratore_Azienda

// ====================================================================
// API GESTIONE DITTE (Solo System Admin)
// ====================================================================

router.get('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [rows] = await dbPool.promise().query(`
            SELECT d.*, td.tipo as tipo_ditta_nome 
            FROM ditte d 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            ORDER BY d.ragione_sociale
        `);
        res.json({ success: true, ditte: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero delle ditte.' });
    }
});

router.post('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    const { ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato } = req.body;
    if (!ragione_sociale || !mail_1 || !id_tipo_ditta) {
        return res.status(400).json({ success: false, message: 'Ragione Sociale, Email e Tipo Ditta sono obbligatori.' });
    }
    try {
        const [result] = await dbPool.promise().query(
            'INSERT INTO ditte (ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato) VALUES (?, ?, ?, ?, ?, ?)', 
            [ragione_sociale, mail_1, id_tipo_ditta, p_iva, codice_fiscale, stato ?? 1]
        );
        res.status(201).json({ success: true, message: 'Ditta creata con successo.', insertId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella creazione della ditta.' });
    }
});

router.patch('/ditte/:id', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id } = req.params;
    const dittaData = req.body;
    delete dittaData.id;
    
    const fields = Object.keys(dittaData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(dittaData), id];

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'Nessun dato da aggiornare.' });
    }
    try {
        const [result] = await dbPool.promise().query(`UPDATE ditte SET ${fields} WHERE id = ?`, values);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Ditta aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Ditta non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della ditta.' });
    }
});

// ====================================================================
// API GESTIONE UTENTI
// ====================================================================

router.get('/utenti', [verifyToken, isDittaAdmin], async (req, res) => {
    const { roleId, dittaId } = req.user;
    let query = 'SELECT u.id, u.email, u.nome, u.cognome, d.ragione_sociale as ditta, r.tipo as ruolo FROM utenti u LEFT JOIN ruoli r ON u.id_ruolo = r.id LEFT JOIN ditte d ON u.id_ditta = d.id';
    const params = [];

    if (roleId === 2) { // Se è un Admin Ditta, filtra per la sua ditta
        query += ' WHERE u.id_ditta = ?';
        params.push(dittaId);
    }
    query += ' ORDER BY u.cognome, u.nome';

    try {
        const [rows] = await dbPool.promise().query(query, params);
        res.json({ success: true, utenti: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli utenti.' });
    }
});

// ====================================================================
// API GESTIONE MODULI DITTA (Solo System Admin)
// ====================================================================

router.get('/ditte-moduli', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [ditte] = await dbPool.promise().query('SELECT id, ragione_sociale FROM ditte');
        const [moduli] = await dbPool.promise().query('SELECT codice, descrizione FROM Moduli');
        const [associazioni] = await dbPool.promise().query('SELECT id_ditta, codice_modulo FROM Ditte_Moduli');

        const ditteConModuli = ditte.map(ditta => ({
            ...ditta,
            moduli: associazioni.filter(a => a.id_ditta === ditta.id).map(a => a.codice_modulo)
        }));

        res.json({ success: true, ditte: ditteConModuli, moduli });
    } catch (error) {
        res.status(500).json({ message: 'Errore sul server durante il recupero dei dati.' });
    }
});

router.post('/salva-associazioni', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta, moduli } = req.body;
    const connection = await dbPool.promise().getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM Ditte_Moduli WHERE id_ditta = ?', [id_ditta]);
        if (moduli && moduli.length > 0) {
            const values = moduli.map(codice_modulo => [id_ditta, codice_modulo]);
            await connection.query('INSERT INTO Ditte_Moduli (id_ditta, codice_modulo) VALUES ?', [values]);
        }
        await connection.commit();
        res.json({ success: true, message: 'Associazioni salvate con successo.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).send("Errore nel salvataggio delle associazioni.");
    } finally {
        connection.release();
    }
});

// ====================================================================
// API GESTIONE PRIVACY POLICY (Solo System Admin)
// ====================================================================

router.get('/privacy-policy', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [rows] = await dbPool.promise().query('SELECT * FROM privacy_policies LIMIT 1');
        res.json({ success: true, data: rows[0] || {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero della policy.' });
    }
});

router.post('/privacy-policy', [verifyToken, isSystemAdmin], async (req, res) => {
    const { responsabile_trattamento, corpo_lettera } = req.body;
    try {
        const query = `
            INSERT INTO privacy_policies (id, responsabile_trattamento, corpo_lettera) 
            VALUES (1, ?, ?) 
            ON DUPLICATE KEY UPDATE responsabile_trattamento = VALUES(responsabile_trattamento), corpo_lettera = VALUES(corpo_lettera)
        `;
        await dbPool.promise().query(query, [responsabile_trattamento, corpo_lettera]);
        res.json({ success: true, message: 'Privacy policy salvata con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della policy.' });
    }
});

// ====================================================================
// API PER TABELLE DI SUPPORTO (Solo System Admin)
// ====================================================================

router.get('/tipi-ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [rows] = await dbPool.promise().query('SELECT * FROM tipo_ditta');
        res.json({ success: true, tipi_ditta: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei tipi ditta.' });
    }
});

router.get('/relazioni', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [rows] = await dbPool.promise().query('SELECT * FROM relazioni_ditta');
        res.json({ success: true, relazioni: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero delle relazioni.' });
    }
});

router.get('/ruoli', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const [rows] = await dbPool.promise().query('SELECT * FROM ruoli ORDER BY livello DESC');
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});

module.exports = router;
