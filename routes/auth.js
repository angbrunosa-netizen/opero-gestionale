/**
 * @file opero/routes/auth.js
 * @description file di rotte per l'autenticazione. VERSIONE STABILE E COMPLETA.
 * - Esegue la query corretta per recuperare il nome del ruolo.
 * - Include l'elenco dei permessi nel payload del token JWT.
 * - Risolve sia l'errore 500 nel modulo Posta sia l'errore 403 nel modulo Catalogo.
 * @date 2025-09-29
 * @version 8.0 (stabile)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbPool } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';
const { verifyToken } = require('../utils/auth');

// --- ROTTA DI LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        
        // ## QUERY UNIFICATA E CORRETTA ##
        const userQuery = `
            SELECT 
                u.id, u.id_ditta, u.nome, u.cognome, u.email, u.password, u.id_ruolo, u.livello,
                r.tipo AS nome_ruolo 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            WHERE u.email = ? AND u.attivo = 1`;
        const [userRows] = await connection.query(userQuery, [email]);

        if (userRows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }

        const user = userRows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenziali non valide.' });
        }

        const permissionsQuery = `SELECT f.codice FROM funzioni f JOIN ruoli_funzioni rf ON f.id = rf.id_funzione WHERE rf.id_ruolo = ?`;
        const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
        const permissions = permissionRows.map(p => p.codice);

        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [user.id_ditta]);

        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [user.id_ditta]);

        // ## TOKEN "ARRICCHITO" CON I PERMESSI ##
        const token = jwt.sign(
            { 
                id: user.id, 
                id_ditta: user.id_ditta, 
                id_ruolo: user.id_ruolo, 
                livello: user.livello,
                permissions: permissions 
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        delete user.password;

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                cognome: user.cognome,
                email: user.email,
                ruolo: user.nome_ruolo,
                livello: user.livello
            },
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


// --- ROTTA /ME (COERENTE CON IL LOGIN) ---
router.get('/me', verifyToken, async (req, res) => {
    const { id: userId, id_ditta: dittaId, id_ruolo: ruoloId, permissions } = req.user;

    let connection;
    try {
        connection = await dbPool.getConnection();

        const userQuery = 'SELECT id, nome, cognome, email, id_ruolo, livello FROM utenti WHERE id = ?';
        const [userRows] = await connection.query(userQuery, [userId]);
        if (userRows.length === 0) throw new Error("Utente non trovato dal token.");
        const user = userRows[0];
        
        // Ripristinato il recupero del nome del ruolo
        const ruoloQuery = 'SELECT tipo AS nome_ruolo FROM ruoli WHERE id = ?';
        const [ruoloRows] = await connection.query(ruoloQuery, [user.id_ruolo]);
        user.ruolo = ruoloRows.length > 0 ? ruoloRows[0].nome_ruolo : 'N/D';
        
        const dittaQuery = `
            SELECT d.id, d.ragione_sociale, d.logo_url, td.tipo AS tipo_ditta 
            FROM ditte d
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE d.id = ?`;
        const [dittaRows] = await connection.query(dittaQuery, [dittaId]);

        const modulesQuery = `SELECT m.codice, m.descrizione, m.chiave_componente FROM ditte_moduli dm JOIN moduli m ON dm.codice_modulo = m.codice WHERE dm.id_ditta = ?`;
        const [moduleRows] = await connection.query(modulesQuery, [dittaId]);

        res.json({
            success: true,
            user,
            ditta: dittaRows[0] || null,
            permissions,
            modules: moduleRows,
        });

    } catch (error) {
        console.error("Errore nel recupero dati utente (/me):", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


module.exports = router;

