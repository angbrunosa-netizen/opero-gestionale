// #####################################################################
// # Rotte per il Modulo Amministrazione - v4.4 (con Associazione Utenti-Email)
// # File: opero/routes/amministrazione.js
// #####################################################################

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { checkAuth, checkRole } = require('../utils/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
const { dbPool } = require('../config/db');

const isDittaAdmin = checkRole([1, 2]);
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.scryptSync('una-chiave-molto-segreta-per-opero', 'salt', 32);
const IV_LENGTH = 16;

const logAction = async (connection, userId, dittaId, azione, dettagli) => {
    try {
        await connection.query(
            'INSERT INTO log_azioni (id_utente, id_ditta, azione, dettagli) VALUES (?, ?, ?, ?)',
            [userId, dittaId, azione, JSON.stringify(dettagli)]
        );
    } catch (logError) {
        console.error("ERRORE DURANTE LA REGISTRAZIONE DEL LOG:", logError);
    }
};
//const { checkAuth  } = require('../utils/auth'); // Assicurati che il percorso sia corretto!

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Impossibile decifrare la password.");
    }
}

router.get('/fatture_attive', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT fa.*, d.ragione_sociale as nome_cliente 
            FROM fatture_attive fa
            JOIN ditte d ON fa.id_cliente = d.id
            WHERE fa.id_ditta = ? ORDER BY fa.data_emissione DESC
        `;
        const [rows] = await connection.query(query, [dittaId]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: `Errore nel recupero delle fatture.` });
    }
});

// CREATE
router.post('/fatture_attive', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const userId = req.userData.userId;
    const body = { ...req.body, id_ditta: dittaId, id_utente_creazione: userId };
    delete body.id;
    const fields = Object.keys(body);
    const values = Object.values(body);
    const query = `INSERT INTO fatture_attive (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`;
    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.query(query, values);
        await logAction(connection, userId, dittaId, 'CREAZIONE_FATTURA_ATTIVA', { fatturaId: result.insertId, dati: body });
        await connection.commit();
        connection.release();
        res.status(201).json({ success: true, message: 'Fattura creata con successo.', insertId: result.insertId });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: `Errore nella creazione della fattura.` });
    }
});

// UPDATE
router.patch('/fatture_attive/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const userId = req.userData.userId;
    const { id } = req.params;
    const { password, ...itemData } = req.body; // Separiamo la password dagli altri dati

    if (!password) {
        return res.status(401).json({ success: false, message: 'Password richiesta per conferma.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
        if (adminRows.length === 0) return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });
        
        const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
        if (!isPasswordCorrect) return res.status(401).json({ success: false, message: 'Password non corretta.' });

        await connection.beginTransaction();
        delete itemData.id;
        const fields = Object.keys(itemData).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(itemData), id, dittaId];
        const query = `UPDATE fatture_attive SET ${fields} WHERE id = ? AND id_ditta = ?`;
        
        const [result] = await connection.query(query, values);
        
        if (result.affectedRows > 0) {
            await logAction(connection, userId, dittaId, 'MODIFICA_FATTURA_ATTIVA', { fatturaId: id, modifiche: itemData });
            await connection.commit();
            res.json({ success: true, message: 'Fattura aggiornata con successo.' });
        } else {
            await connection.rollback();
            res.status(404).json({ success: false, message: 'Fattura non trovata.' });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: `Errore nell'aggiornamento della fattura.` });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE
router.delete('/fatture_attive/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const userId = req.userData.userId;
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(401).json({ success: false, message: 'Password richiesta per conferma.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
        if (adminRows.length === 0) return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });

        const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
        if (!isPasswordCorrect) return res.status(401).json({ success: false, message: 'Password non corretta.' });

        await connection.beginTransaction();
        const [result] = await connection.query(`DELETE FROM fatture_attive WHERE id = ? AND id_ditta = ?`, [id, dittaId]);
        
        if (result.affectedRows > 0) {
            await logAction(connection, userId, dittaId, 'CANCELLAZIONE_FATTURA_ATTIVA', { fatturaId: id });
            await connection.commit();
            res.json({ success: true, message: 'Fattura eliminata con successo.' });
        } else {
            await connection.rollback();
            res.status(404).json({ success: false, message: 'Fattura non trovata.' });
        }
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: `Errore nell'eliminazione della fattura.` });
    } finally {
        if (connection) connection.release();
    }
});

// --- Funzione helper per tabelle con ID auto-incrementale ---
const createSimpleCrudEndpoints = (tableName, requiredFields = []) => {
    // GET ALL
    router.get(`/${tableName}`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        try {
            const connection = await dbPool.getConnection();
            let query = `SELECT * FROM ${tableName} WHERE id_ditta = ?`;
            if (tableName === 'fatture_attive') {
                query = `
                    SELECT fa.*, d.ragione_sociale as nome_cliente 
                    FROM fatture_attive fa
                    JOIN ditte d ON fa.id_cliente = d.id
                    WHERE fa.id_ditta = ? ORDER BY fa.data_emissione DESC
                `;
            }
            const [rows] = await connection.query(query, [dittaId]);
            connection.release();
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: `Errore nel recupero dati da ${tableName}` });
        }
    });

    // CREATE
    router.post(`/${tableName}`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const userId = req.userData.userId;
        const body = { ...req.body, id_ditta: dittaId, id_utente_creazione: userId };
        delete body.id;
        const fields = Object.keys(body);
        const values = Object.values(body);
        for(const field of requiredFields) {
            if(!req.body[field]) {
                return res.status(400).json({ success: false, message: `Campo ${field} obbligatorio.` });
            }
        }
        const query = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`;
        let connection;
        try {
            connection = await dbPool.getConnection();
            await connection.beginTransaction();
            const [result] = await connection.query(query, values);
            await logAction(connection, userId, dittaId, `CREAZIONE_${tableName.toUpperCase()}`, { id: result.insertId, dati: body });
            await connection.commit();
            connection.release();
            res.status(201).json({ success: true, message: 'Record creato con successo.', insertId: result.insertId });
        } catch (error) {
            if (connection) await connection.rollback();
            res.status(500).json({ success: false, message: `Errore nella creazione record in ${tableName}` });
        }
    });
    
    // UPDATE
    router.patch(`/${tableName}/:id`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const userId = req.userData.userId;
        const { id } = req.params;
        const { password, ...itemData } = req.body;
        if (!password) return res.status(401).json({ success: false, message: 'Password richiesta per conferma.' });
        
        let connection;
        try {
            connection = await dbPool.getConnection();
            const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
            if (adminRows.length === 0) return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });
            const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
            if (!isPasswordCorrect) return res.status(401).json({ success: false, message: 'Password non corretta.' });

            await connection.beginTransaction();
            delete itemData.id;
            const fields = Object.keys(itemData).map(key => `${key} = ?`).join(',');
            const values = [...Object.values(itemData), id, dittaId];
            const query = `UPDATE ${tableName} SET ${fields} WHERE id = ? AND id_ditta = ?`;
            
            const [result] = await connection.query(query, values);
            
            if (result.affectedRows > 0) {
                await logAction(connection, userId, dittaId, `MODIFICA_${tableName.toUpperCase()}`, { id: id, modifiche: itemData });
                await connection.commit();
                res.json({ success: true, message: 'Record aggiornato con successo.' });
            } else {
                await connection.rollback();
                res.status(404).json({ success: false, message: 'Record non trovato.' });
            }
        } catch (error) {
            if (connection) await connection.rollback();
            res.status(500).json({ success: false, message: `Errore nell'aggiornamento del record.` });
        } finally {
            if (connection) connection.release();
        }
    });

    // DELETE
    router.delete(`/${tableName}/:id`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const userId = req.userData.userId;
        const { id } = req.params;
        const { password } = req.body;
        if (!password) return res.status(401).json({ success: false, message: 'Password richiesta per conferma.' });
        
        let connection;
        try {
            connection = await dbPool.getConnection();
            const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
            if (adminRows.length === 0) return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });
            const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
            if (!isPasswordCorrect) return res.status(401).json({ success: false, message: 'Password non corretta.' });
            
            await connection.beginTransaction();
            const [result] = await connection.query(`DELETE FROM ${tableName} WHERE id = ? AND id_ditta = ?`, [id, dittaId]);
            
            if (result.affectedRows > 0) {
                await logAction(connection, userId, dittaId, `CANCELLAZIONE_${tableName.toUpperCase()}`, { id: id });
                await connection.commit();
                res.json({ success: true, message: 'Record eliminato con successo.' });
            } else {
                await connection.rollback();
                res.status(404).json({ success: false, message: 'Record non trovato.' });
            }
        } catch (error) {
            if (connection) await connection.rollback();
            res.status(500).json({ success: false, message: `Errore nell'eliminazione del record.` });
        } finally {
            if (connection) connection.release();
        }
    });
};

// --- Logica CRUD specifica per il PIANO DEI CONTI (con chiave composita) ---
const createCompositeKeyCrudEndpoints = (tableName, requiredFields = []) => {
    // GET ALL
    router.get(`/${tableName}`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        try {
            const connection = await dbPool.getConnection();
            const [rows] = await connection.query(`SELECT * FROM ${tableName} WHERE id_ditta = ?`, [dittaId]);
            connection.release();
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: `Errore nel recupero dati da ${tableName}` });
        }
    });

    // CREATE
    router.post(`/${tableName}`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const body = { ...req.body, id_ditta: dittaId };
        const fields = Object.keys(body);
        const values = Object.values(body);
        const query = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`;
        try {
            const connection = await dbPool.getConnection();
            await connection.query(query, values);
            connection.release();
            res.status(201).json({ success: true, message: 'Record creato con successo.' });
        } catch (error) {
            res.status(500).json({ success: false, message: `Errore nella creazione record in ${tableName}` });
        }
    });

    // UPDATE
    router.patch(`/${tableName}/:codice`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const { codice } = req.params;
        const itemData = { ...req.body };
        delete itemData.codice;
        const fields = Object.keys(itemData).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(itemData), codice, dittaId];
        const query = `UPDATE ${tableName} SET ${fields} WHERE codice = ? AND id_ditta = ?`;
        try {
            const connection = await dbPool.getConnection();
            const [result] = await connection.query(query, values);
            connection.release();
            if (result.affectedRows > 0) res.json({ success: true, message: 'Record aggiornato con successo.' });
            else res.status(404).json({ success: false, message: 'Record non trovato.' });
        } catch (error) {
            res.status(500).json({ success: false, message: `Errore nell'aggiornamento del record.` });
        }
    });

    // DELETE
    router.delete(`/${tableName}/:codice`, checkAuth, isDittaAdmin, async (req, res) => {
        const dittaId = req.userData.dittaId;
        const { codice } = req.params;
        try {
            const connection = await dbPool.getConnection();
            const [result] = await connection.query(`DELETE FROM ${tableName} WHERE codice = ? AND id_ditta = ?`, [codice, dittaId]);
            connection.release();
            if (result.affectedRows > 0) res.json({ success: true, message: 'Record eliminato con successo.' });
            else res.status(404).json({ success: false, message: 'Record non trovato.' });
        } catch (error) {
            res.status(500).json({ success: false, message: `Errore nell'eliminazione del record.` });
        }
    });
};
//modifica

// --- ATTIVAZIONE DELLE API CRUD ---
createSimpleCrudEndpoints('tipi_pagamento', ['codice', 'descrizione']);
createSimpleCrudEndpoints('iva_contabili', ['codice', 'aliquota']);
createSimpleCrudEndpoints('funzioni_contabili', ['codice_funzione', 'descrizione', 'livello_richiesto']);
createSimpleCrudEndpoints('fatture_attive', ['id_cliente', 'numero_fattura', 'data_emissione']);

createCompositeKeyCrudEndpoints('mastri', ['codice', 'descrizione']);
createCompositeKeyCrudEndpoints('conti', ['codice', 'descrizione', 'codice_mastro']);
createCompositeKeyCrudEndpoints('sottoconti', ['codice', 'descrizione', 'codice_conto']);


// #####################################################################
// # API PER GESTIONE ANAGRAFICHE (Clienti/Fornitori) - POTENZIATE
// #####################################################################
// GET (Lista Anagrafiche)
// GET (Lista Anagrafiche)
router.get('/anagrafiche', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT 
                d.id, d.ragione_sociale, d.p_iva, d.codice_fiscale, d.mail_1, d.stato, r.descrizione as relazione
            FROM ditte d
            LEFT JOIN relazioni_ditta r ON d.codice_relazione = r.codice
            WHERE d.id_ditta_proprietaria = ? 
            ORDER BY d.ragione_sociale
        `;
        const [rows] = await connection.query(query, [dittaId]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero anagrafiche.' });
    }
});


// GET (Dettaglio Anagrafica)
router.get('/anagrafiche/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM ditte WHERE id = ? AND id_ditta_proprietaria = ?',
            [id, dittaId]
        );
        connection.release();
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero del dettaglio anagrafica.' });
    }
});

// --- NUOVA API PER RECUPERARE I CONTI FILTRATI PER MASTRO ---
router.get('/conti-filtrati', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { mastri } = req.query;
    if (!mastri) {
        return res.status(400).json({ success: false, message: 'Specificare i mastri.' });
    }
    const mastriList = mastri.split(',');
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT id, codice, descrizione 
            FROM conti
            WHERE id_ditta = ? AND codice_mastro IN (?)
            ORDER BY codice
        `;
        const [rows] = await connection.query(query, [dittaId, mastriList]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero conti:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei conti.' });
    }
});

// GET (Dettaglio Anagrafica)
router.get('/anagrafiche/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM ditte WHERE id = ? AND id_ditta_proprietaria = ?',
            [id, dittaId]
        );
        connection.release();
        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero del dettaglio anagrafica.' });
    }
});

// PATCH (Aggiorna Anagrafica)
router.patch('/anagrafiche/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    const anagraficaData = req.body;
    delete anagraficaData.id;
    const fields = Object.keys(anagraficaData).map(key => `${key} = ?`).join(',');
    const values = [...Object.values(anagraficaData), id, dittaId];
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(`UPDATE ditte SET ${fields} WHERE id = ? AND id_ditta_proprietaria = ?`, values);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});

// --- NUOVA API PER RECUPERARE I CONTI FILTRATI PER MASTRO ---
router.get('/conti-filtrati', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { mastri } = req.query;
    if (!mastri) {
        return res.status(400).json({ success: false, message: 'Specificare i mastri.' });
    }
    const mastriList = mastri.split(',');
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT id, codice, descrizione 
            FROM conti
            WHERE id_ditta = ? AND codice_mastro IN (?)
            ORDER BY codice
        `;
        const [rows] = await connection.query(query, [dittaId, mastriList]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero conti:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei conti.' });
    }
});


// API PER COLLEGARE UN SOTTOCONTO A UN'ANAGRAFICA (QUELLA CHE MANCAVA)
router.patch('/anagrafiche/:id/collegamento', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const { id_sottoconto_collegato } = req.body;
    try {
        const connection = await dbPool.getConnection();
        await connection.query("UPDATE ditte SET id_sottoconto_collegato = ? WHERE id = ?", [id_sottoconto_collegato, id]);
        connection.release();
        res.json({ success: true, message: 'Conto collegato aggiornato.' });
    } catch (error) {
        console.error("Errore aggiornamento conto collegato:", error);
        res.status(500).json({ success: false, message: 'Errore aggiornamento conto collegato.' });
    }
});

// PATCH ora gestisce sia la relazione che altri campi
router.patch('/anagrafiche/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const itemData = { ...req.body };
    delete itemData.id;
    
    const fields = Object.keys(itemData).map(key => `${key} = ?`).join(',');
    const values = [...Object.values(itemData), id];

    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(`UPDATE ditte SET ${fields} WHERE id = ? AND id_tipo_ditta != 1`, values);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata o non modificabile.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});

router.delete('/anagrafiche/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query("DELETE FROM ditte WHERE id = ? AND id_tipo_ditta != 1", [id]);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Anagrafica eliminata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata o non eliminabile.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione.' });
    }
});

router.patch('/anagrafiche/:id/collegamento', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const { id_sottoconto_collegato } = req.body;
    try {
        const connection = await dbPool.getConnection();
        await connection.query("UPDATE ditte SET id_sottoconto_collegato = ? WHERE id = ?", [id_sottoconto_collegato, id]);
        connection.release();
        res.json({ success: true, message: 'Conto collegato aggiornato.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore aggiornamento conto collegato.' });
    }
});
// NUOVA API per ottenere sottoconti filtrati per mastro
router.get('/sottoconti-filtrati', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { mastri } = req.query; // es. ?mastri=8,28
    if (!mastri) {
        return res.status(400).json({ success: false, message: 'Specificare i mastri.' });
    }
    const mastriList = mastri.split(',');
    try {
        const connection = await dbPool.getConnection();
        const query = `
            SELECT s.id, s.codice, s.descrizione 
            FROM sottoconti s
            JOIN conti c ON s.id_conto = c.id
            WHERE s.id_ditta = ? AND c.codice_mastro IN (?)
        `;
        const [rows] = await connection.query(query, [dittaId, mastriList]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei sottoconti.' });
    }
});


router.patch('/anagrafiche/:id/relazione', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const { codice_relazione } = req.body;
    if (!['C', 'F', 'E', 'N', 'P'].includes(codice_relazione)) {
        return res.status(400).json({ success: false, message: 'Valore relazione non valido.' });
    }
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query("UPDATE ditte SET codice_relazione = ? WHERE id = ?", [codice_relazione, id]);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Relazione aggiornata.' });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore aggiornamento relazione.' });
    }
});
// --- API GESTIONE UTENTI (per Admin Ditta) ---
// --- API GESTIONE UTENTI (per Admin Ditta) ---
// --- API GESTIONE UTENTI (per Admin Ditta) ---
router.get('/utenti', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        // QUESTA QUERY È CORRETTA E INCLUDE IL CAMPO 'attivo'
        const [rows] = await connection.query(
            `SELECT u.id, u.nome, u.cognome, u.email, u.attivo, r.tipo as ruolo 
             FROM utenti u 
             LEFT JOIN ruoli r ON u.id_ruolo = r.id
             WHERE u.id_ditta = ?`,
            [dittaId]
        );
        connection.release();
        res.json({ success: true, utenti: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli utenti della ditta.' });
    }
});

router.get('/utenti/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM utenti WHERE id = ? AND id_ditta = ?',
            [id, dittaId]
        );
        connection.release();
        if (rows.length > 0) {
            delete rows[0].password;
            res.json({ success: true, utente: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero del dettaglio utente.' });
    }
});

router.patch('/utenti/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    const userData = req.body;
    const allowedFields = [
        'nome', 'cognome', 'codice_fiscale', 'telefono', 'indirizzo', 'citta', 
        'provincia', 'cap', 'id_ruolo', 'attivo', 'note', 'firma', 'privacy', 
        'funzioni_attive', 'livello'
    ];
    const fieldsToUpdate = {};
    for (const key of allowedFields) {
        if (userData[key] !== undefined) {
            fieldsToUpdate[key] = userData[key];
        }
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ success: false, message: 'Nessun dato valido da aggiornare.' });
    }
    const queryFields = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const queryValues = [...Object.values(fieldsToUpdate), id, dittaId];
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(
            `UPDATE utenti SET ${queryFields} WHERE id = ? AND id_ditta = ?`,
            queryValues
        );
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Utente aggiornato con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Utente non trovato o non autorizzato.' });
        }
    } catch (error) {
        console.error("Errore aggiornamento utente:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.get('/ruoli-ditta', checkAuth, isDittaAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query('SELECT id, tipo FROM ruoli WHERE id > 1 ORDER BY livello DESC');
        connection.release();
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});
// --- NUOVE API PER ASSOCIAZIONE UTENTE-ACCOUNT EMAIL ---

// GET: Ottiene gli account associati a un utente
router.get('/utenti/:id/mail_accounts', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [userRows] = await connection.query('SELECT id FROM utenti WHERE id = ? AND id_ditta = ?', [id, dittaId]);
        if (userRows.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Utente non trovato o non appartenente a questa ditta.' });
        }

        const [rows] = await connection.query(
            'SELECT id_mail_account FROM utente_mail_accounts WHERE id_utente = ?',
            [id]
        );
        connection.release();
        const associatedIds = rows.map(r => r.id_mail_account);
        res.json({ success: true, data: associatedIds });
    } catch (error) {
        console.error("Errore recupero associazioni email:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle associazioni.' });
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
        await connection.query('INSERT INTO registration_tokens (id_ditta, token, scadenza) VALUES (?, ?, ?)', [dittaId, token, expiration]);
        connection.release();
        const registrationLink = `http://localhost:3000/register?token=${token}`;
        res.json({ success: true, message: 'Link generato con successo.', link: registrationLink });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nella generazione del link.' });
    }
});
// API PER POPOLARE LE FUNZIONI CONTABILI STANDARD
router.post('/funzioni_contabili/populate-standard', checkAuth, isDittaAdmin, async (req, res) => {
    const { password } = req.body;
    const adminId = req.userData.userId;
    const dittaId = req.userData.dittaId;

    if (!password) {
        return res.status(400).json({ success: false, message: 'Password richiesta per conferma.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        
        const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ?', [adminId]);
        if (adminRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Password non corretta.' });
        }

        const standardFunctions = [
            [dittaId, 'FATT_ATTIVA_CREA', 'Creazione Fatture di Vendita', 80],
            [dittaId, 'FATT_ATTIVA_VEDI', 'Visualizzazione Fatture di Vendita', 50],
            [dittaId, 'FATT_PASSIVA_CREA', 'Registrazione Fatture di Acquisto', 70],
            [dittaId, 'FATT_PASSIVA_VEDI', 'Visualizzazione Fatture di Acquisto', 50],
            [dittaId, 'INCASSI_REGISTRA', 'Registrazione Incassi', 60],
            [dittaId, 'PAGAMENTI_REGISTRA', 'Registrazione Pagamenti', 60]
        ];

        const query = 'INSERT IGNORE INTO funzioni_contabili (id_ditta, codice_funzione, descrizione, livello_richiesto) VALUES ?';
        const [result] = await connection.query(query, [standardFunctions]);
        
        connection.release();
        res.json({ success: true, message: `${result.affectedRows} nuove funzioni standard sono state create con successo.` });

    } catch (error) {
        if (connection) connection.release();
        console.error("Errore nel popolare le funzioni standard:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
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
// --- API CRUD SPECIFICHE PER ACCOUNT EMAIL ---
router.get('/ditta_mail_accounts', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(`SELECT id, id_ditta, nome_account, email_address, imap_host, imap_port, smtp_host, smtp_port, auth_user FROM ditta_mail_accounts WHERE id_ditta = ?`, [dittaId]);
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: `Errore nel recupero degli account email` });
    }
});


// POST: Aggiorna gli account associati a un utente
router.post('/utenti/:id/mail_accounts', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const { accountIds } = req.body;
    const dittaId = req.userData.dittaId;
    let connection;

    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [userRows] = await connection.query('SELECT id FROM utenti WHERE id = ? AND id_ditta = ?', [id, dittaId]);
        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        await connection.query('DELETE FROM utente_mail_accounts WHERE id_utente = ?', [id]);

        if (accountIds && accountIds.length > 0) {
            const [validAccounts] = await connection.query('SELECT id FROM ditta_mail_accounts WHERE id_ditta = ? AND id IN (?)', [dittaId, accountIds]);
            const validAccountIds = validAccounts.map(a => a.id);
            
            if (validAccountIds.length !== accountIds.length) {
                 await connection.rollback();
                 return res.status(403).json({ success: false, message: 'Uno o più account email non appartengono a questa ditta.' });
            }
            const values = validAccountIds.map(accountId => [id, accountId]);
            await connection.query('INSERT INTO utente_mail_accounts (id_utente, id_mail_account) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Associazioni email aggiornate con successo.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore aggiornamento associazioni email:", error);
        res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento delle associazioni.' });
    } finally {
        if (connection) connection.release();
    }
});

router.patch('/ditta_mail_accounts/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const { dittaId, userId } = req.userData;
    
    const { password, auth_pass, ...otherFields } = req.body;

    if (!password) {
        return res.status(401).json({ success: false, message: 'Password di conferma amministratore richiesta.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();

        const [adminRows] = await connection.query('SELECT password FROM utenti WHERE id = ? AND id_ditta = ?', [userId, dittaId]);
        if (adminRows.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Amministratore non trovato.' });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, adminRows[0].password);
        if (!isPasswordCorrect) {
            connection.release();
            return res.status(401).json({ success: false, message: 'Password di conferma non corretta.' });
        }

        let finalData = { ...otherFields };
        if (auth_pass && auth_pass.trim() !== '') {
            finalData.auth_pass = encrypt(auth_pass);
        }

        const fields = Object.keys(finalData).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(finalData), id, dittaId];
        const query = `UPDATE ditta_mail_accounts SET ${fields} WHERE id = ? AND id_ditta = ?`;

        const [result] = await connection.query(query, values);
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Account aggiornato con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Account non trovato.' });
        }
    } catch (error) {
        console.error("Errore aggiornamento account email:", error);
        res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento dell\'account.' });
    } finally {
        if (connection) connection.release();
    }
});


router.delete('/ditta_mail_accounts/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(`DELETE FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?`, [id, dittaId]);
        connection.release();
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Account eliminato con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Account non trovato.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nell\'eliminazione dell\'account.' });
    }
});
// NUOVA ROTTA: POST per creare un nuovo account email
router.post('/ditta_mail_accounts', checkAuth, isDittaAdmin, async (req, res) => {
    const { dittaId, userId } = req.userData;
    const { auth_pass, ...otherFields } = req.body;

    // Semplice validazione per i campi richiesti
    if (!auth_pass || !otherFields.nome_account || !otherFields.email_address || !otherFields.imap_host || !otherFields.smtp_host || !otherFields.auth_user) {
        return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori.' });
    }

    try {
        const encryptedPass = encrypt(auth_pass);
        const finalData = {
            ...otherFields,
            auth_pass: encryptedPass,
            id_ditta: dittaId,
            id_utente_creazione: userId
        };
        
        // Rimuove l'ID se presente per evitare errori in inserimento
        delete finalData.id;

        const fields = Object.keys(finalData);
        const values = Object.values(finalData);
        const query = `INSERT INTO ditta_mail_accounts (${fields.join(',')}) VALUES (${values.map(() => '?').join(',')})`;
        
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(query, values);
        connection.release();

        res.status(201).json({ success: true, message: 'Account email creato con successo.', insertId: result.insertId });
    } catch (error) {
        console.error("Errore nella creazione dell'account email:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante la creazione dell\'account.' });
    }
});


// #############################################################
// # ROTTA PER TESTARE LA CONNESSIONE EMAIL (OTTIMIZZATA)
// #############################################################
router.post('/test-mail-account/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const { id } = req.params;
    const dittaId = req.userData.dittaId;

    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM ditta_mail_accounts WHERE id = ? AND id_ditta = ?',
            [id, dittaId]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Account non trovato o non autorizzato.' });
        }
        const account = rows[0];

        const decryptedPass = decrypt(account.auth_pass);

        // CORREZIONE: Utilizziamo una configurazione più robusta e sicura
        let transporterOptions;

        // Se l'host è quello di Gmail, usiamo la configurazione predefinita di Nodemailer (più affidabile)
        if (account.smtp_host === 'smtp.gmail.com') {
            transporterOptions = {
                service: 'gmail',
                auth: {
                    user: account.auth_user,
                    pass: decryptedPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            };
        } else {
            // Altrimenti, usiamo una configurazione manuale più sicura
            transporterOptions = {
                host: account.smtp_host,
                port: account.smtp_port,
                secure: true, // Forziamo la connessione sicura (SSL/TLS)
                auth: {
                    user: account.auth_user,
                    pass: decryptedPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            };
        }
        
        const transporter = nodemailer.createTransport(transporterOptions);

        await transporter.verify();

        res.json({ success: true, message: 'Connessione SMTP riuscita! Le credenziali sono corrette.' });

    } catch (error) {
        console.error("Errore test connessione SMTP:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Test di connessione fallito. Controlla i parametri SMTP e le credenziali.',
            error: error.message
        });
    }
});
 
router.get('/funzioni_contabili_automatiche/:id_funzione', checkAuth, async (req, res) => {
    const { id_funzione } = req.params;
    // CORREZIONE: Legge i dati da req.userData
    const { dittaId } = req.userData; 
    let connection;

    try {
        connection = await dbPool.getConnection();
        const [funzione] = await connection.query('SELECT id FROM funzioni_contabili WHERE id = ? AND id_ditta = ?', [id_funzione, dittaId]);
        
        if (funzione.length === 0) {
            return res.status(404).json({ success: false, message: "Funzione non trovata o non appartenente alla tua ditta." });
        }

        const [config] = await connection.query('SELECT * FROM funzioni_contabili_automatiche WHERE codice_funzione = ?', [id_funzione]);
        
        res.json({ success: true, data: config[0] || null });

    } catch (error) {
        console.error("Errore nel recuperare la configurazione della funzione automatica:", error);
        res.status(500).json({ success: false, message: 'Errore del server' });
    } finally {
        if (connection) connection.release();
    }
});
// #####################################################################
// # NUOVE API PER GESTIONE UTENTI COMPLETA (DA ADMIN DITTA)
// #####################################################################

// GET (Lista Utenti): Modificata per inviare più campi per l'anteprima
router.get('/utenti', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            `SELECT u.id, u.nome, u.cognome, u.email, u.attivo, r.tipo as ruolo 
             FROM utenti u 
             LEFT JOIN ruoli r ON u.id_ruolo = r.id
             WHERE u.id_ditta = ?`,
            [dittaId]
        );
        connection.release();
        res.json({ success: true, utenti: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero degli utenti della ditta.' });
    }
});

// GET (Dettaglio Utente): Nuova rotta per ottenere tutti i dati di un singolo utente
router.get('/utenti/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    try {
        const connection = await dbPool.getConnection();
        const [rows] = await connection.query(
            'SELECT * FROM utenti WHERE id = ? AND id_ditta = ?',
            [id, dittaId]
        );
        connection.release();
        if (rows.length > 0) {
            // Rimuoviamo la password per sicurezza prima di inviarla al frontend
            delete rows[0].password;
            res.json({ success: true, utente: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero del dettaglio utente.' });
    }
});

// PATCH (Aggiorna Utente): Nuova rotta per salvare le modifiche
router.patch('/utenti/:id', checkAuth, isDittaAdmin, async (req, res) => {
    const dittaId = req.userData.dittaId;
    const { id } = req.params;
    const userData = req.body;

    // Lista dei campi che l'amministratore di ditta può modificare
    const allowedFields = [
        'nome', 'cognome', 'codice_fiscale', 'telefono', 'indirizzo', 'citta', 
        'provincia', 'cap', 'id_ruolo', 'attivo', 'note', 'firma', 'privacy', 
        'funzioni_attive', 'livello'
    ];

    // Filtriamo i dati ricevuti per sicurezza
    const fieldsToUpdate = {};
    for (const key of allowedFields) {
        if (userData[key] !== undefined) {
            fieldsToUpdate[key] = userData[key];
        }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ success: false, message: 'Nessun dato valido da aggiornare.' });
    }

    const queryFields = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const queryValues = [...Object.values(fieldsToUpdate), id, dittaId];

    try {
        const connection = await dbPool.getConnection();
        const [result] = await connection.query(
            `UPDATE utenti SET ${queryFields} WHERE id = ? AND id_ditta = ?`,
            queryValues
        );
        connection.release();

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Utente aggiornato con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Utente non trovato o non autorizzato.' });
        }
    } catch (error) {
        console.error("Errore aggiornamento utente:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// GET (Ruoli Assegnabili): Nuova rotta per popolare la select nel form di modifica
router.get('/ruoli-ditta', checkAuth, isDittaAdmin, async (req, res) => {
    try {
        const connection = await dbPool.getConnection();
        // Escludiamo i ruoli di sistema che un admin di ditta non può assegnare
        const [rows] = await connection.query('SELECT id, tipo FROM ruoli WHERE id > 1 ORDER BY livello DESC');
        connection.release();
        res.json({ success: true, ruoli: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});


// POST: Crea o aggiorna la configurazione di una funzione
router.post('/funzioni_contabili_automatiche', checkAuth, async (req, res) => {
    // CORREZIONE: Legge i dati da req.userData
    const { dittaId } = req.userData; 
    const { codice_funzione, ...rilanci } = req.body;
    let connection;

    const sql = `
        INSERT INTO funzioni_contabili_automatiche (codice_funzione, rilancio_1_dare, rilancio_2_dare, rilancio_3_dare, rilancio_4_dare, rilancio_5_dare, rilancio_1_avere, rilancio_2_avere, rilancio_3_avere, rilancio_4_avere, rilancio_5_avere, descrizione_operazione)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        rilancio_1_dare = VALUES(rilancio_1_dare),
        rilancio_2_dare = VALUES(rilancio_2_dare),
        rilancio_3_dare = VALUES(rilancio_3_dare),
        rilancio_4_dare = VALUES(rilancio_4_dare),
        rilancio_5_dare = VALUES(rilancio_5_dare),
        rilancio_1_avere = VALUES(rilancio_1_avere),
        rilancio_2_avere = VALUES(rilancio_2_avere),
        rilancio_3_avere = VALUES(rilancio_3_avere),
        rilancio_4_avere = VALUES(rilancio_4_avere),
        rilancio_5_avere = VALUES(rilancio_5_avere),
        descrizione_operazione = VALUES(descrizione_operazione);
    `;

    try {
        connection = await dbPool.getConnection();
        await connection.query(sql, [
            codice_funzione,
            rilanci.rilancio_1_dare || null,
            rilanci.rilancio_2_dare || null,
            rilanci.rilancio_3_dare || null,
            rilanci.rilancio_4_dare || null,
            rilanci.rilancio_5_dare || null,
            rilanci.rilancio_1_avere || null,
            rilanci.rilancio_2_avere || null,
            rilanci.rilancio_3_avere || null,
            rilanci.rilancio_4_avere || null,
            rilanci.rilancio_5_avere || null,
            rilanci.descrizione_operazione || null
        ]);
        res.json({ success: true, message: 'Configurazione salvata con successo!' });
    } catch (error) {
        console.error("Errore nel salvare la configurazione automatica:", error);
        res.status(500).json({ success: false, message: 'Errore del server' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
