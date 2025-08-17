// #####################################################################
// # Rotte di Autenticazione - v5.1 (Definitiva con Chiave Componente)
// # File: opero/routes/auth.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbPool } = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    let connection;
    try {
        // La logica per distinguere produzione/sviluppo è mantenuta
        if (process.env.NODE_ENV !== 'production') {
            connection = await dbPool.getConnection();
        }

        // Query per trovare l'utente e i dati associati
        const userQuery = `
            SELECT u.*, r.tipo AS tipo_ruolo, d.ragione_sociale, td.tipo as tipo_ditta 
            FROM utenti u 
            LEFT JOIN ruoli r ON u.id_ruolo = r.id 
            LEFT JOIN ditte d ON u.id_ditta = d.id 
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id 
            WHERE u.email = ?`;
        
        let userRows;
        if (process.env.NODE_ENV === 'production') {
            const { rows } = await dbPool.query(userQuery.replace('?', '$1'), [email]);
            userRows = rows;
        } else {
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

        // Recupera le FUNZIONI per i permessi granulari
        const permissionsQuery = `SELECT f.Codice FROM Funzioni f JOIN ruoli_Funzioni rf ON f.ID = rf.Id_Funzione WHERE rf.ID_ruolo = ?`;
        let permissionRows;
        if (process.env.NODE_ENV === 'production') {
            const { rows } = await dbPool.query(permissionsQuery.replace('?', '$1'), [user.id_ruolo]);
            permissionRows = rows;
        } else {
            const [rows] = await connection.query(permissionsQuery, [user.id_ruolo]);
            permissionRows = rows;
        }
        const permissions = permissionRows.map(p => p.Codice);

        // Recupera i MODULI includendo la chiave_componente (Query CORRETTA)
        const modulesQuery = `
            SELECT m.codice, m.descrizione, m.chiave_componente 
            FROM Ditte_Moduli dm 
            JOIN Moduli m ON dm.codice_modulo = m.codice 
            WHERE dm.id_ditta = ?`;
        let moduleRows;
        if (process.env.NODE_ENV === 'production') {
            const { rows } = await dbPool.query(modulesQuery.replace('?', '$1'), [user.id_ditta]);
            moduleRows = rows;
        } else {
            const [rows] = await connection.query(modulesQuery, [user.id_ditta]);
            moduleRows = rows;
        }
        
        // Crea il token
        const tokenPayload = { userId: user.id, dittaId: user.id_ditta, roleId: user.id_ruolo, userLevel: user.livello };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });
        
        // Invia la risposta completa al frontend
        res.json({ 
            success: true, 
            token, 
            user: { id: user.id, nome: user.nome, cognome: user.cognome, email: user.email, ruolo: user.tipo_ruolo, livello: user.livello },
            ditta: { id: user.id_ditta, ragione_sociale: user.ragione_sociale, tipo_ditta: user.tipo_ditta },
            permissions,
            modules: moduleRows // Invia l'array di moduli
        });

    } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
