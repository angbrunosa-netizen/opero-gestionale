// #####################################################################
// # Rotte per il Modulo ContSmart v1.0
// # File: opero-gestionale-main/routes/contsmart.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const router = express.Router();

// --- Middleware di Autorizzazione Specifici ---

/**
 * Middleware per verificare se l'utente ha il permesso di modificare il Piano dei Conti.
 * Richiede un livello utente elevato (es. > 90).
 */
const canEditPdc = (req, res, next) => {
    if (req.user.livello <= 90) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente per modificare il Piano dei Conti.' });
    }
    next();
};

/**
 * Middleware per verificare se l'utente può creare/confermare registrazioni contabili.
 * Richiede un livello utente intermedio (es. > 50).
 */
const canPostEntries = (req, res, next) => {
    if (req.user.livello <= 50) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente per creare registrazioni.' });
    }
    next();
};

// --- ROTTE PER IL PIANO DEI CONTI (sc_piano_dei_conti) ---

/**
 * GET /piano-dei-conti
 * Recupera l'intero piano dei conti per la ditta dell'utente, strutturato gerarchicamente.
 */
router.get('/piano-dei-conti', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [conti] = await dbPool.query(
            'SELECT id, codice, descrizione, id_padre, tipo, natura, bloccato FROM sc_piano_dei_conti WHERE id_ditta = ? ORDER BY codice ASC',
            [dittaId]
        );

        // Costruisce la struttura ad albero
        const map = new Map();
        const roots = [];
        
        conti.forEach(conto => {
            map.set(conto.id, { ...conto, figli: [] });
        });

        conti.forEach(conto => {
            if (conto.id_padre) {
                const parent = map.get(conto.id_padre);
                if (parent) {
                    parent.figli.push(map.get(conto.id));
                }
            } else {
                roots.push(map.get(conto.id));
            }
        });

        res.json({ success: true, data: roots });

    } catch (error) {
        console.error("Errore recupero piano dei conti:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

/**
 * POST /piano-dei-conti
 * Crea un nuovo conto nel piano dei conti. Protetto da livello.
 */
router.post('/piano-dei-conti', [verifyToken, canEditPdc], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { codice, descrizione, id_padre, tipo, natura } = req.body;

    if (!codice || !descrizione || !tipo || !natura) {
        return res.status(400).json({ success: false, message: 'Dati mancanti.' });
    }

    try {
        const query = 'INSERT INTO sc_piano_dei_conti (id_ditta, codice, descrizione, id_padre, tipo, natura) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await dbPool.query(query, [dittaId, codice, descrizione, id_padre || null, tipo, natura]);
        res.status(201).json({ success: true, message: 'Conto creato con successo.', insertId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Il codice conto esiste già.' });
        }
        console.error("Errore creazione conto:", error);
        res.status(500).json({ success: false, message: 'Errore durante la creazione del conto.' });
    }
});

// --- ROTTE PER LE REGISTRAZIONI CONTABILI (sc_registrazioni_*) ---

/**
 * GET /registrazioni
 * Recupera un elenco delle ultime testate delle registrazioni contabili.
 */
router.get('/registrazioni', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const query = `
            SELECT t.id, t.data_registrazione, t.descrizione_testata, t.stato, u.nome, u.cognome
            FROM sc_registrazioni_testata t
            JOIN utenti u ON t.id_utente = u.id
            WHERE t.id_ditta = ?
            ORDER BY t.data_registrazione DESC, t.id DESC
            LIMIT 200
        `;
        const [rows] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero registrazioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

/**
 * POST /registrazioni
 * Crea una nuova registrazione contabile completa (testata + righe).
 * Operazione critica eseguita in una transazione.
 */
router.post('/registrazioni', [verifyToken, canPostEntries], async (req, res) => {
    const { id_ditta: dittaId, id: userId } = req.user;
    const { testata, righe } = req.body;

    if (!testata || !righe || righe.length < 2) {
        return res.status(400).json({ success: false, message: 'Dati incompleti. Sono necessarie almeno due righe.' });
    }

    // Validazione Partita Doppia
    const totaleDare = righe.reduce((sum, r) => sum + parseFloat(r.importo_dare || 0), 0);
    const totaleAvere = righe.reduce((sum, r) => sum + parseFloat(r.importo_avere || 0), 0);

    if (Math.abs(totaleDare - totaleAvere) > 0.001) { // Tolleranza per errori di floating point
        return res.status(400).json({ success: false, message: `La registrazione non è bilanciata. Dare: ${totaleDare.toFixed(2)}, Avere: ${totaleAvere.toFixed(2)}` });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Inserisci la testata
        const [testataResult] = await connection.query(
            'INSERT INTO sc_registrazioni_testata (id_ditta, id_utente, data_registrazione, descrizione_testata, stato) VALUES (?, ?, ?, ?, ?)',
            [dittaId, userId, testata.data_registrazione, testata.descrizione_testata, testata.stato || 'Provvisorio']
        );
        const testataId = testataResult.insertId;

        // 2. Inserisci le righe
        for (const riga of righe) {
            await connection.query(
                'INSERT INTO sc_registrazioni_righe (id_testata, id_conto, descrizione_riga, importo_dare, importo_avere) VALUES (?, ?, ?, ?, ?)',
                [testataId, riga.id_conto, riga.descrizione_riga, riga.importo_dare || 0, riga.importo_avere || 0]
            );
        }

        // 3. Commit della transazione
        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione creata con successo.', testataId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore creazione registrazione:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della registrazione.' });
    } finally {
        connection.release();
    }
});
/**
 * PATCH /piano-dei-conti/:id
 * Aggiorna un conto esistente. Protetto da livello.
 */
router.patch('/piano-dei-conti/:id', [verifyToken, canEditPdc], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    // Definiamo i campi che l'utente può modificare
    const { descrizione, natura } = req.body;

    try {
        const [result] = await dbPool.query(
            'UPDATE sc_piano_dei_conti SET descrizione = ?, natura = ? WHERE id = ? AND id_ditta = ?',
            [descrizione, natura, id, dittaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Conto non trovato.' });
        }
        res.json({ success: true, message: 'Conto aggiornato con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento conto:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    }
});


module.exports = router;
