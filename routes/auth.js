// #####################################################################
// # Rotte di Autenticazione - v2.4 (con Variabili d'Ambiente)
// # File: opero/routes/auth.js
// #####################################################################
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// --- CONFIGURAZIONE SICURA ---
// Ora usiamo le variabili d'ambiente. Se non esistono, usiamo un valore di default.
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key';

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Middleware per Verificare l'Autenticazione (checkAuth) ---
const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userData = { 
            userId: decodedToken.userId, 
            email: decodedToken.email, 
            roleId: decodedToken.roleId, 
            dittaId: decodedToken.dittaId,
            userLevel: decodedToken.userLevel
        };
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Autenticazione fallita.' });
    }
};

// --- Funzione Helper per Verificare il Ruolo (checkRole) ---
const checkRole = (roles) => {
    return (req, res, next) => {
        if (req.userData && roles.includes(req.userData.roleId)) {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Accesso negato. Permessi insufficienti.' });
        }
    };
};

// API di autenticazione
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) { return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' }); }
    let connection;
    try {
        connection = await dbPool.getConnection();
        const userQuery = `
            SELECT 
                u.id, u.email, u.password, u.nome, u.cognome, u.firma, u.livello,
                r.id AS id_ruolo, r.tipo AS tipo_ruolo,
                d.id AS id_ditta, d.ragione_sociale,
                td.tipo as tipo_ditta
            FROM utenti u
            LEFT JOIN ruoli r ON u.id_ruolo = r.id
            LEFT JOIN ditte d ON u.id_ditta = d.id
            LEFT JOIN tipo_ditta td ON d.id_tipo_ditta = td.id
            WHERE u.email = ?
        `;
        const [rows] = await connection.query(userQuery, [email]);
        if (rows.length > 0) {
            const user = rows[0];
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            let isPasswordCorrect;
            if(isHashed) {
                isPasswordCorrect = await bcrypt.compare(password, user.password);
            } else {
                isPasswordCorrect = (password === user.password);
                if(isPasswordCorrect) {
                    const newHashedPassword = await bcrypt.hash(password, 10);
                    await connection.query('UPDATE utenti SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
                }
            }

            if (!isPasswordCorrect) {
                if(connection) connection.release();
                return res.status(401).json({ success: false, message: 'Password non corretta.' });
            }

            const permissionsQuery = `
                SELECT f.codice FROM funzioni f
                JOIN ruoli_funzioni rf ON f.id = rf.id_funzione
                WHERE rf.id_ruolo = ?
            `;
            const [permissionRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
            const permissions = permissionRows.map(p => p.codice);

            const tokenPayload = { 
                userId: user.id, 
                email: user.email, 
                roleId: user.id_ruolo, 
                dittaId: user.id_ditta,
                userLevel: user.livello
            };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
            
            const responsePayload = { 
                success: true, 
                message: 'Login effettuato con successo.', 
                token: token, 
                user: { 
                    id: user.id, 
                    nome: user.nome, 
                    cognome: user.cognome, 
                    email: user.email, 
                    ruolo: user.tipo_ruolo, 
                    firma: user.firma, 
                    livello: user.livello, 
                    permissions: permissions 
                },
                ditta: {
                    id: user.id_ditta,
                    ragione_sociale: user.ragione_sociale,
                    tipo_ditta: user.tipo_ditta
                }
            };
            if(connection) connection.release();
            return res.json(responsePayload);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await connection.query('INSERT INTO utenti (email, password, id_ruolo, id_ditta, livello) VALUES (?, ?, ?, ?, ?)', [email, hashedPassword, 4, 2, 50]);
            if(connection) connection.release();
            return res.status(201).json({ success: true, message: 'Utente registrato con successo. Effettuare il login per continuare.' });
        }
    } catch (error) {
        if (connection) connection.release();
        console.error("Errore durante l'autenticazione:", error);
        return res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
module.exports = router;
