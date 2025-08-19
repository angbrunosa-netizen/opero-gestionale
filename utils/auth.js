// #####################################################################
// # Utility di Autenticazione - v2.2 (Fix coerenza payload)
// # File: opero/utils/auth.js
// #####################################################################

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';

/**
 * Middleware per verificare il token JWT.
 * Se valido, aggiunge il payload a req.user.

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Accesso negato. Token non fornito.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token non valido o scaduto.' });
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware Factory per verificare il ruolo dell'utente.
 * Va usato DOPO verifyToken.
 * @param {Array<number>} allowedRoles - Un array di ID di ruolo permessi.

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // --- LA CORREZIONE È QUI ---
        // Il payload del token contiene 'id_ruolo' (snake_case).
        // Dobbiamo usare lo stesso nome per il controllo.
        if (!req.user || !allowedRoles.includes(req.user.id_ruolo)) {
            return res.status(403).json({ success: false, message: 'Accesso negato. Ruolo non autorizzato.' });
        }
        next();
    };
};
*/

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Accesso negato. Token non fornito.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token non valido o scaduto.' });
        }
        req.user = user;
        next();
    });
};


/**
 * Middleware Factory per verificare il ruolo dell'utente.
 * Va usato DOPO verifyToken.
 * @param {Array<number>} allowedRoles - Un array di ID di ruolo permessi.
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // --- LA CORREZIONE È QUI ---
        // Il payload del token contiene 'id_ruolo' (snake_case).
        // Dobbiamo usare lo stesso nome per il controllo.
        if (!req.user || !allowedRoles.includes(req.user.id_ruolo)) {
            return res.status(403).json({ success: false, message: 'Accesso negato. Ruolo non autorizzato.' });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
