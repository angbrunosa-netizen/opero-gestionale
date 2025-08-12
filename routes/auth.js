// #####################################################################
// # Rotte di Autenticazione - v2.3 (con Livello Utente nel Token)
// # File: opero/routes/auth.js
// #####################################################################
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = 'una_chiave_segreta_molto_difficile_da_indovinare_12345';

const dbPool = mysql.createPool({
    host: 'localhost', user: 'root', password: '', database: 'operodb', port: 3306
});

// --- Middleware per Verificare l'Autenticazione (checkAuth) ---
// Questo è il "controllore" che verifica il passaporto (token) su ogni richiesta protetta.
const checkAuth = (req, res, next) => {
    try {
        // Estrae il token dall'header 'Authorization' (es. "Bearer TOKEN_LUNGHISSIMO")
        const token = req.headers.authorization.split(" ")[1];
        
        // Verifica la validità del token usando la nostra chiave segreta
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        // CORREZIONE: Aggiungiamo tutte le informazioni dell'utente, incluso userLevel,
        // all'oggetto 'req.userData' in modo che siano disponibili nelle rotte successive.
        req.userData = { 
            userId: decodedToken.userId, 
            email: decodedToken.email, 
            roleId: decodedToken.roleId, 
            dittaId: decodedToken.dittaId,
            userLevel: decodedToken.userLevel // <-- ECCO LA MODIFICA CHIAVE
        };
        
        // Se il token è valido, permette alla richiesta di proseguire
        next();
    } catch (error) {
        // Se il token non è valido o manca, blocca la richiesta
        return res.status(401).json({ success: false, message: 'Autenticazione fallita.' });
    }
};

// --- Funzione Helper per Verificare il Ruolo (checkRole) ---
// Questa funzione viene usata nelle rotte per controllare se l'utente ha un ruolo specifico.
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

            // CORREZIONE: Aggiunto userLevel (user.livello) al payload del token
            const tokenPayload = { 
                userId: user.id, 
                email: user.email, 
                roleId: user.id_ruolo, 
                dittaId: user.id_ditta,
                userLevel: user.livello // <-- ECCO LA MODIFICA CHIAVE
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
            // Logica per la registrazione di un nuovo utente se non esiste
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
