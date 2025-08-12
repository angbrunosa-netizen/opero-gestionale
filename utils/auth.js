// #####################################################################
// # Middleware di Autenticazione e Autorizzazione - v1.1
// # File: opero/utils/auth.js
// #####################################################################

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'una_chiave_segreta_molto_difficile_da_indovinare_12345';

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

module.exports = { checkAuth, checkRole };


