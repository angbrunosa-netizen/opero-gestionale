// #####################################################################
// # Middleware di Autenticazione - v1.0 (Standard e Sicuro)
// # File: opero/utils/auth.js
// #####################################################################

const jwt = require('jsonwebtoken');

// Assicurati che la chiave segreta sia la stessa usata in auth.js e nel tuo file .env
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key';

/**
 * Middleware per verificare il token JWT.
 * Controlla l'header 'Authorization', verifica il token e, se valido,
 * allega i dati dell'utente alla richiesta (req.userData).
 */
const checkAuth = (req, res, next) => {
    try {
        // Il token viene inviato come "Bearer [token]"
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Autenticazione fallita: token mancante.' });
        }

        // Verifica il token usando la chiave segreta
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        // Aggiunge i dati decodificati alla richiesta per usarli nelle rotte successive
        req.userData = { 
            userId: decodedToken.userId, 
            email: decodedToken.email, 
            roleId: decodedToken.roleId, 
            dittaId: decodedToken.dittaId,
            userLevel: decodedToken.userLevel
        };
        
        // Se tutto è andato bene, procedi alla prossima funzione (la rotta vera e propria)
        next();

    } catch (error) {
        // Se jwt.verify fallisce (token non valido, scaduto, etc.), lancia un errore
        return res.status(401).json({ success: false, message: 'Autenticazione fallita: token non valido.' });
    }
};

/**
 * Middleware per verificare che l'utente abbia uno dei ruoli richiesti.
 * Da usare DOPO checkAuth.
 * @param {Array<number>} allowedRoles - Un array di ID di ruolo permessi.
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.userData è stato aggiunto dal middleware checkAuth
        if (req.userData && allowedRoles.includes(req.userData.roleId)) {
            next(); // L'utente ha il ruolo corretto, procedi
        } else {
            res.status(403).json({ success: false, message: 'Accesso negato: non hai i permessi necessari.' });
        }
    };
};

module.exports = {
    checkAuth,
    checkRole
};
