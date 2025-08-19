// #####################################################################
// # Rotte di Autenticazione - v5.3 (Logica Ambienti Ripristinata)
// # File: opero/routes/auth.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbPool, dbType } = require('../config/db'); // Importiamo anche dbType

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';
const { verifyToken } = require('../utils/auth'); // Assicurati che questo import sia presente all'inizio del file

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection; // Necessario per il finally in ambiente MySQL
    try {
        // #################################
        // ## LOGICA AMBIENTI RIPRISTINATA ##
        // #################################
        // Manteniamo la distinzione tra MySQL (sviluppo) e PostgreSQL (produzione)

        // Query per trovare l'utente (sintassi MySQL con '?')
        const userQuery = `
            SELECT u.*, r.tipo AS tipo_ruolo, d.ragione_sociale, td.tipo as tipo_ditta 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            LEFT JOIN ditte d ON u.id_ditta = d.id 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            WHERE u.email = ?`;
        
        let userRows;
        // Eseguiamo la query in modo diverso a seconda del DB
        if (dbType === 'postgres') {
            const { rows } = await dbPool.query(userQuery.replace(/\?/g, '$1'), [email]);
            userRows = rows;
        } else {
            connection = await dbPool.getConnection();
            const [rows] = await connection.query(userQuery, [email]);
            userRows = rows;
        }

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        const user = userRows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Password non corretta.' });
        }

        // Recupera le FUNZIONI (permessi)
        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        let permissionRows;
        if (dbType === 'postgres') {
            const { rows } = await dbPool.query(permissionsQuery.replace(/\?/g, '$1'), [user.id_ruolo]);
            permissionRows = rows;
        } else {
            const [rows] = await connection.query(permissionsQuery, [user.id_ruolo]);
            permissionRows = rows;
        }
        const permissions = permissionRows.map(p => p.Codice);

        // Recupera i MODULI
        const modulesQuery = `
            SELECT m.codice, m.descrizione, m.chiave_componente 
            FROM Ditte_Moduli dm 
            JOIN Moduli m ON dm.codice_modulo = m.codice 
            WHERE dm.id_ditta = ?`;
        let moduleRows;
        if (dbType === 'postgres') {
            const { rows } = await dbPool.query(modulesQuery.replace(/\?/g, '$1'), [user.id_ditta]);
            moduleRows = rows;
        } else {
            const [rows] = await connection.query(modulesQuery, [user.id_ditta]);
            moduleRows = rows;
        }
        
        // Crea il token con il payload corretto (snake_case)
        const tokenPayload = { 
            id: user.id, 
            id_ditta: user.id_ditta, 
            id_ruolo: user.id_ruolo, 
            livello: user.livello 
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        
        res.json({ 
            success: true, 
            token, 
            user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.tipo_ruolo, livello: user.livello },
            ditta: { id: user.id_ditta, ragione_sociale: user.ragione_sociale, tipo_ditta: user.tipo_ditta },
            permissions,
            modules: moduleRows
        });

    } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release(); // Rilascia la connessione solo se esiste (ambiente MySQL)
    }
});

// --- NUOVA ROTTA: GET (Recupera dati utente dal token) ---
// Questa rotta viene usata per ripristinare la sessione al refresh della pagina.
router.get('/me', verifyToken, async (req, res) => {
    const { id: userId, id_ditta: dittaId, id_ruolo: ruoloId } = req.user;

    try {
        const connection = await dbPool.getConnection();
        
        // Query per i dati utente base (aggiornata per prendere il tipo_ruolo dalla tabella ruoli)
        const userQuery = `
            SELECT u.id, u.nome, u.cognome, u.email, u.livello, r.tipo AS tipo_ruolo 
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.id = ?`;
        const [userRows] = await connection.query(userQuery, [userId]);
        if (userRows.length === 0) throw new Error("Utente non trovato");

        // Query per i dati della ditta (aggiornata per prendere il tipo_ditta)
        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [dittaId]);

        // Query per i permessi (funzioni)
        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [ruoloId]);
        const permissions = permissionRows.map(p => p.Codice);

        // Query per i moduli
        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM Ditte_Moduli dm JOIN Moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [dittaId]);

        connection.release();

        res.json({
            success: true,
            user: userRows[0],
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore in /auth/me:", error);
        res.status(500).json({ success: false, message: "Errore nel recuperare i dati della sessione." });
    }
});

// --- ROTTA DI LOGIN ---
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    const connection = await dbPool.getConnection();
    try {
        const userQuery = `
            SELECT u.*, r.tipo AS tipo_ruolo, d.ragione_sociale, td.tipo as tipo_ditta 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            LEFT JOIN ditte d ON u.id_ditta = d.id 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            WHERE u.email = ?`;
        
        const [userRows] = await connection.query(userQuery, [email]);

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        const user = userRows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Password non corretta.' });
        }

        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
        const permissions = permissionRows.map(p => p.Codice);

        const modulesQuery = `
            SELECT m.codice, m.descrizione, m.chiave_componente 
            FROM Ditte_Moduli dm 
            JOIN Moduli m ON dm.codice_modulo = m.codice 
            WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [user.id_ditta]);
        
        const tokenPayload = { 
            id: user.id, 
            id_ditta: user.id_ditta, 
            id_ruolo: user.id_ruolo, 
            livello: user.livello 
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        
        res.json({ 
            success: true, 
            token, 
            user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.tipo_ruolo, livello: user.livello },
            ditta: { id: user.id_ditta, ragione_sociale: user.ragione_sociale, tipo_ditta: user.tipo_ditta },
            permissions,
            modules: moduleRows
        });

    } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- NUOVA ROTTA: GET (Recupera dati utente dal token) ---
// Questa rotta è essenziale per il nuovo AuthContext per ripristinare la sessione.
router.get('/me', verifyToken, async (req, res) => {
    const { id: userId, id_ditta: dittaId, id_ruolo: ruoloId } = req.user;

    try {
        const connection = await dbPool.getConnection();
        
        const userQuery = `
            SELECT u.id, u.nome, u.cognome, u.email, u.livello, r.tipo AS tipo_ruolo 
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.id = ?`;
        const [userRows] = await connection.query(userQuery, [userId]);
        if (userRows.length === 0) throw new Error("Utente non trovato dal token.");

        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [dittaId]);

        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [ruoloId]);
        const permissions = permissionRows.map(p => p.Codice);

        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM Ditte_Moduli dm JOIN Moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [dittaId]);

        connection.release();

        res.json({
            success: true,
            user: userRows[0],
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore in /auth/me:", error);
        res.status(500).json({ success: false, message: "Errore nel recuperare i dati della sessione." });
    }
});

// --- NUOVA ROTTA: GET (Recupera dati utente dal token) ---
router.get('/me', verifyToken, async (req, res) => {
    const { id: userId, id_ditta: dittaId, id_ruolo: ruoloId } = req.user;

    let connection;
    try {
        connection = await dbPool.getConnection();
        
        const userQuery = `
            SELECT u.id, u.nome, u.cognome, u.email, u.livello, r.tipo AS tipo_ruolo 
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            WHERE u.id = ?`;
        const [userRows] = await connection.query(userQuery, [userId]);
        if (userRows.length === 0) throw new Error("Utente non trovato dal token.");

        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [dittaId]);

        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [ruoloId]);
        const permissions = permissionRows.map(p => p.Codice);

        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM Ditte_Moduli dm JOIN Moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [dittaId]);

        res.json({
            success: true,
            user: userRows[0],
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore in /auth/me:", error);
        res.status(500).json({ success: false, message: "Errore nel recuperare i dati della sessione." });
    } finally {
        if (connection) connection.release();
    }
});
// --- ROTTA DI LOGIN ---
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        const userQuery = `
            SELECT u.*, r.tipo AS tipo_ruolo, d.ragione_sociale, td.tipo as tipo_ditta 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            LEFT JOIN ditte d ON u.id_ditta = d.id 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            WHERE u.email = ?`;
        
        const [userRows] = await connection.query(userQuery, [email]);

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        const user = userRows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Password non corretta.' });
        }

        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
        const permissions = permissionRows.map(p => p.Codice);

        const modulesQuery = `
            SELECT m.codice, m.descrizione, m.chiave_componente 
            FROM Ditte_Moduli dm 
            JOIN Moduli m ON dm.codice_modulo = m.codice 
            WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [user.id_ditta]);
        
        const tokenPayload = { 
            id: user.id, 
            id_ditta: user.id_ditta, 
            id_ruolo: user.id_ruolo, 
            livello: user.livello 
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        
        res.json({ 
            success: true, 
            token, 
            user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.tipo_ruolo, livello: user.livello },
            ditta: { id: user.id_ditta, ragione_sociale: user.ragione_sociale, tipo_ditta: user.tipo_ditta },
            permissions,
            modules: moduleRows
        });

    } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;
