// #####################################################################
// # Rotte di Autenticazione - v3.4 (con Gestione Connessione Robusta)
// # File: opero/routes/auth.js
// #####################################################################

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbPool } = require('../config/db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key';

// API di autenticazione
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e password sono obbligatorie.' });
    }

    // Definiamo la connessione qui per renderla accessibile nel blocco 'finally'
    let connection;
    try {
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

        let rows;
        // La logica per distinguere produzione e sviluppo rimane
        if (process.env.NODE_ENV === 'production') {
            const pgQuery = userQuery.replace(/\?/g, (match, i) => `$${i + 1}`);
            const result = await dbPool.query(pgQuery, [email]);
            rows = result.rows;
        } else {
            // Assegniamo la connessione alla variabile esterna
            connection = await dbPool.getConnection();
            const [mysqlRows] = await connection.query(userQuery, [email]);
            rows = mysqlRows;
        }
        
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
                    const updateQuery = 'UPDATE utenti SET password = ? WHERE id = ?';
                    if (process.env.NODE_ENV === 'production') {
                        await dbPool.query(updateQuery.replace(/\?/g, (match, i) => `$${i + 1}`), [newHashedPassword, user.id]);
                    } else {
                        await connection.query(updateQuery, [newHashedPassword, user.id]);
                    }
                }
            }

            if (!isPasswordCorrect) {
                // Non rilasciamo più la connessione qui
                return res.status(401).json({ success: false, message: 'Password non corretta.' });
            }

            const permissionsQuery = `
                SELECT f.codice FROM funzioni f
                JOIN ruoli_funzioni rf ON f.id = rf.id_funzione
                WHERE rf.id_ruolo = ?
            `;
            let permissionRows;
            if (process.env.NODE_ENV === 'production') {
                const result = await dbPool.query(permissionsQuery.replace('?', '$1'), [user.id_ruolo]);
                permissionRows = result.rows;
            } else {
                const [mysqlPermRows] = await connection.query(permissionsQuery, [user.id_ruolo]);
                permissionRows = mysqlPermRows;
            }
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
            // Non rilasciamo più la connessione qui
            return res.json(responsePayload);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO utenti (email, password, id_ruolo, id_ditta, livello) VALUES (?, ?, ?, ?, ?)';
            if (process.env.NODE_ENV === 'production') {
                await dbPool.query(insertQuery.replace(/\?/g, (match, i) => `$${i + 1}`), [email, hashedPassword, 4, 2, 50]);
            } else {
                await connection.query(insertQuery, [email, hashedPassword, 4, 2, 50]);
            }
            // Non rilasciamo più la connessione qui
            return res.status(201).json({ success: true, message: 'Utente registrato con successo. Effettuare il login per continuare.' });
        }
    } catch (error) {
        console.error("Errore durante l'autenticazione:", error);
        return res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        // --- BLOCCO FINALLY ---
        // Questo blocco viene eseguito SEMPRE, sia in caso di successo che di errore.
        // Se la connessione a MySQL è stata aperta, la chiudiamo qui.
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
