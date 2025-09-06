// #####################################################################
// # Rotte di Autenticazione - v5.3 (Logica Ambienti Ripristinata)
// # File: opero/routes/auth.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbPool, dbType } = require('../config/db'); // Importiamo anche dbType

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';
const { verifyToken } = require('../utils/auth'); // Assicurati che questo import sia presente all'inizio del file

// --- ROTTA DI LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        // ## FIX: Aggiunto d.logo_url alla query ##
        const userQuery = `
            SELECT u.*, r.tipo AS tipo_ruolo, d.ragione_sociale, d.logo_url, td.tipo as tipo_ditta 
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

        const permissionsQuery = `SELECT f.codice FROM funzioni f JOIN ruoli_funzioni rf ON f.id = rf.id_funzione WHERE rf.id_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
        const permissions = permissionRows.map(p => p.codice);

        const modulesQuery = `
            SELECT m.codice, m.descrizione, m.chiave_componente 
            FROM ditte_moduli dm 
            JOIN moduli m ON dm.codice_modulo = m.codice 
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
            // ## FIX: Aggiunto logo_url all'oggetto ditta ##
            ditta: { id: user.id_ditta, ragione_sociale: user.ragione_sociale, logo_url: user.logo_url, tipo_ditta: user.tipo_ditta },
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

// --- ROTTA: GET (Recupera dati utente dal token) ---
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

        // ## FIX: Aggiunto d.logo_url alla query ##
        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [dittaId]);

        const permissionsQuery = `SELECT f.codice FROM funzioni f JOIN ruoli_funzioni rf ON f.id = rf.id_funzione WHERE rf.id_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [ruoloId]);
        const permissions = permissionRows.map(p => p.codice);

        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
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






module.exports = router;
