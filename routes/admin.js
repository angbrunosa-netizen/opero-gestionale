// #####################################################################
// # Rotte di Amministrazione Sistema (MASTER) - v3.2 con CRUD Completo
// # File: opero/routes/admin.js
// #####################################################################


const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { checkAuth, checkRole } = require('../utils/auth');
const nodemailer = require('nodemailer');

const router = express.Router();
const dbPool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306 });

const isSystemAdmin = checkRole([1]);
const isDittaAdmin = checkRole([1, 2]);

// --- API GESTIONE DITTE (Solo MASTER) ---
router.post('/ditte', checkAuth, isSystemAdmin, async (req, res) => {
    const { ragione_sociale, mail_1, id_tipo_ditta } = req.body;
    if (!ragione_sociale || !mail_1 || !id_tipo_ditta) {
        return res.status(400).json({ success: false, message: 'Ragione Sociale, Email e Tipo Ditta sono obbligatori.' });
    }
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query('INSERT INTO ditte (ragione_sociale, mail_1, id_tipo_ditta) VALUES (?, ?, ?)', [ragione_sociale, mail_1, id_tipo_ditta]);
        connection.release();
        res.status(201).json({ success: true, message: 'Ditta creata con successo.', insertId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella creazione della ditta.' });
    }
});

router.get('/ditte', checkAuth, isSystemAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(`
            SELECT d.*, td.tipo as tipo_ditta_nome 
            FROM ditte d 
            JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            ORDER BY d.ragione_sociale
        `);
        connection.release();
        res.json({ success: true, ditte: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero delle ditte.' });
    }
});

router.patch('/ditte/:id', checkAuth, isSystemAdmin, async (req, res) => {
    const { id } = req.params;
    const dittaData = req.body;
    delete dittaData.id;
    const fields = Object.keys(dittaData).map(key => `${key} = ?`).join(',');
    const values = [...Object.values(dittaData), id];
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(`UPDATE ditte SET ${fields} WHERE id = ?`, values);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Ditta aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Ditta non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della ditta.' });
    }
});
// --- API GESTIONE UTENTI ---
router.get('/utenti', checkAuth, isDittaAdmin, async (req, res) => {
    const requestor = req.userData;
    let query = 'SELECT u.*, r.tipo as ruolo FROM utenti u LEFT JOIN ruoli r ON u.id_ruolo = r.id';
    const params = [];
    if (requestor.roleId === 2) {
        query += ' WHERE u.id_ditta = ?';
        params.push(requestor.dittaId);
    }
    query += ' ORDER BY u.cognome, u.nome';
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(query, params);
        connection.release();
        res.json({ success: true, utenti: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli utenti.' });
    }
});

router.post('/utenti', checkAuth, isSystemAdmin, async (req, res) => {
    const { email, password, id_ditta, id_ruolo, ...otherFields } = req.body;
    if (!email || !password || !id_ditta || !id_ruolo) {
        return res.status(400).json({ success: false, message: 'Email, password, ditta e ruolo sono obbligatori.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const finalData = { email, password: hashedPassword, id_ditta, id_ruolo, ...otherFields };
        const fields = Object.keys(finalData);
        const values = Object.values(finalData);
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(`INSERT INTO utenti (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`, values);
        connection.release();
        res.status(201).json({ success: true, message: 'Utente creato con successo.', insertId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella creazione dell\'utente.' });
    }
});

router.patch('/utenti/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const requestor = req.userData;
    const userData = req.body;
    const allowedFields = ['nome', 'cognome', 'codice_fiscale', 'telefono', 'indirizzo', 'citta', 'provincia', 'cap', 'id_ditta', 'id_ruolo', 'livello'];
    const fieldsToUpdate = Object.keys(userData).filter(key => allowedFields.includes(key));
    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ success: false, message: 'Nessun campo valido da aggiornare.' });
    }
    const fields = fieldsToUpdate.map(key => `${key} = ?`).join(',');
    const values = fieldsToUpdate.map(key => userData[key]);
    values.push(id);
    try {
        const connection = await dbPool.getConnection();
        if (requestor.roleId === 2) {
            const [users] = await connection.query('SELECT id_ditta FROM utenti WHERE id = ?', [id]);
            if (users.length === 0 || users[0].id_ditta !== requestor.dittaId) {
                connection.release();
                return res.status(403).json({ success: false, message: 'Non autorizzato a modificare questo utente.' });
            }
        }
        const [result] = await connection.query(`UPDATE utenti SET ${fields} WHERE id = ?`, values);
        connection.release();
        if (result.affectedRows > 0) res.json({ success: true, message: 'Utente aggiornato con successo.' });
        else res.status(404).json({ success: false, message: 'Utente non trovato.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento dell\'utente.' });
    }
});


// API per generare un link di registrazione
router.post('/generate-registration-link', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const token = uuidv4();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    try {
        const connection = await dbPool.getConnection();
        await connection.query(
            'INSERT INTO registration_tokens (id_ditta, token, scadenza) VALUES (?, ?, ?)',
            [dittaId, token, expiration]
        );
        connection.release();
        
        const registrationLink = `http://localhost:3000/register?token=${token}`;
        res.json({ success: true, message: 'Link generato con successo.', link: registrationLink });

    } catch (error) {
        console.error("Errore generazione link:", error);
        res.status(500).json({ success: false, message: 'Errore nella generazione del link.' });
    }
});

    // API GESTIONE PRIVACY
router.get('/privacy-policy', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM privacy_policies WHERE id_ditta = ?', [dittaId]);
        connection.release();
        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero della policy.' });
    }
});
router.post('/privacy-policy', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { responsabile_trattamento, corpo_lettera } = req.body;
    try {
        const connection = await dbPool.getConnection();
        const query = `
            INSERT INTO privacy_policies (id_ditta, responsabile_trattamento, corpo_lettera) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE responsabile_trattamento = ?, corpo_lettera = ?
        `;
        await connection.query(query, [dittaId, responsabile_trattamento, corpo_lettera, responsabile_trattamento, corpo_lettera]);
        connection.release();
        res.json({ success: true, message: 'Policy sulla privacy salvata con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel salvataggio della policy.' });
    }
});

// --- API GESTIONE MODULI E RUOLI ---
router.get('/ruoli', checkAuth, isSystemAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT id, tipo FROM ruoli ORDER BY livello DESC'); 
        connection.release();
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});

router.post('/generate-registration-link', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const token = uuidv4();
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);
    try {
        const connection = await dbPool.getConnection();
        await connection.query('INSERT INTO registration_tokens (id_ditta, token, scadenza) VALUES (?, ?, ?)', [dittaId, token, expiration]);
        connection.release();
        const registrationLink = `http://localhost:3000/register?token=${token}`;
        res.json({ success: true, message: 'Link generato con successo.', link: registrationLink });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella generazione del link.' });
    }
});

router.get('/privacy-policy', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM privacy_policies WHERE id_ditta = ?', [dittaId]);
        connection.release();
        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero della policy.' });
    }
});

router.post('/privacy-policy', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { responsabile_trattamento, corpo_lettera } = req.body;
    try {
        const connection = await dbPool.getConnection();
        const query = `
            INSERT INTO privacy_policies (id_ditta, responsabile_trattamento, corpo_lettera) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE responsabile_trattamento = ?, corpo_lettera = ?
        `;
        await connection.query(query, [dittaId, responsabile_trattamento, corpo_lettera, responsabile_trattamento, corpo_lettera]);
        connection.release();
        res.json({ success: true, message: 'Policy sulla privacy salvata con successo.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel salvataggio della policy.' });
    }
});
// --- API PER TABELLE DI SUPPORTO ---
router.get('/tipi-ditta', checkAuth, isSystemAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM tipo_ditta');
        connection.release();
        res.json({ success: true, tipi_ditta: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei tipi ditta.' });
    }
});

router.get('/relazioni', checkAuth, isSystemAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM relazioni_ditta');
        connection.release();
        res.json({ success: true, relazioni: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero delle relazioni.' });
    }
});

router.get('/ruoli', checkAuth, isSystemAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT * FROM ruoli ORDER BY livello DESC'); 
        connection.release();
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});
module.exports = router;
