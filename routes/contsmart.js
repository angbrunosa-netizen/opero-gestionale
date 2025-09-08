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
const canManageFunzioni = (req, res, next) => {
    if (req.user.livello <= 90) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente per gestire le Funzioni Contabili.' });
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
// --- ROTTE PER LE REGISTRAZIONI CONTABILI ---
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

// --- NUOVA SEZIONE: ROTTE PER FUNZIONI CONTABILI ---

/**
 * @route   GET /api/contsmart/funzioni
 * @desc    Recupera tutte le funzioni contabili per la ditta dell'utente loggato
 * @access  Privato
 */
/**
 * @route   GET /api/contsmart/funzioni
 * @desc    Recupera tutte le funzioni contabili per la ditta dell'utente loggato
 * @access  Privato
 */
router.get('/funzioni', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;

        // ## MODIFICA QUI: Aggiunto f.tipo_funzione alla SELECT ##
        const query = `
            SELECT
                f.id as funzione_id, f.codice_funzione, f.nome_funzione, f.descrizione, f.categoria, f.attiva, f.tipo_funzione,
                r.id as riga_id, r.id_conto, p.Descrizione as nome_conto, r.tipo_movimento, r.descrizione_riga_predefinita, r.is_sottoconto_modificabile
            FROM sc_funzioni_contabili as f
            LEFT JOIN sc_funzioni_contabili_righe as r ON f.id = r.id_funzione_contabile
            LEFT JOIN sc_piano_dei_conti as p ON r.id_conto = p.id
            WHERE f.id_ditta = ?
            ORDER BY f.codice_funzione ASC;
        `;
        
        const [funzioni] = await dbPool.query(query, [id_ditta]);

        if (funzioni.length === 0) {
            return res.json([]);
        }

        const result = {};
        funzioni.forEach(row => {
            if (!result[row.funzione_id]) {
                result[row.funzione_id] = {
                    id: row.funzione_id,
                    codice_funzione: row.codice_funzione,
                    nome_funzione: row.nome_funzione,
                    descrizione: row.descrizione,
                    categoria: row.categoria,
                    attiva: row.attiva,
                    tipo_funzione: row.tipo_funzione, // Aggiunto il campo
                    righe: []
                };
            }
            if (row.riga_id) {
                result[row.funzione_id].righe.push({
                    id: row.riga_id,
                    id_conto: row.id_conto,
                    nome_conto: row.nome_conto,
                    tipo_movimento: row.tipo_movimento,
                    descrizione_riga_predefinita: row.descrizione_riga_predefinita,
                    is_sottoconto_modificabile: !!row.is_sottoconto_modificabile,
                });
            }
        });

        res.json(Object.values(result));

    } catch (error) {
        console.error("Errore recupero funzioni contabili:", error);
        res.status(500).json({ success: false, message: 'Errore del server durante il recupero delle funzioni contabili.' });
    }
});
/**
 * @route   POST /api/contsmart/funzioni
 * @desc    Crea una nuova funzione contabile e le sue righe
 * @access  Privato (protetto da middleware)
 */
router.post('/funzioni', [verifyToken, canManageFunzioni], async (req, res) => {
    const { codice_funzione, nome_funzione, descrizione, categoria, attiva, righe } = req.body;
    const { id_ditta } = req.user;

    if (!codice_funzione || !nome_funzione || !righe || !Array.isArray(righe) || righe.length === 0) {
        return res.status(400).json({ message: 'Campi obbligatori mancanti: codice_funzione, nome_funzione e almeno una riga sono necessari.' });
    }

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const insertFunzioneQuery = `
            INSERT INTO sc_funzioni_contabili (id_ditta, codice_funzione, nome_funzione, descrizione, categoria, attiva)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [resultFunzione] = await connection.query(insertFunzioneQuery, [id_ditta, codice_funzione, nome_funzione, descrizione, categoria, attiva]);
        const idFunzioneCreata = resultFunzione.insertId;

        const righeValues = righe.map(riga => {
            if (!riga.id_conto || !riga.tipo_movimento) {
                throw new Error('Ogni riga deve avere id_conto e tipo_movimento.');
            }
            return [
                idFunzioneCreata,
                riga.id_conto,
                riga.tipo_movimento,
                riga.descrizione_riga_predefinita,
                riga.is_sottoconto_modificabile
            ];
        });
        
        const insertRigheQuery = `
            INSERT INTO sc_funzioni_contabili_righe (id_funzione_contabile, id_conto, tipo_movimento, descrizione_riga_predefinita, is_sottoconto_modificabile)
            VALUES ?;
        `;
        await connection.query(insertRigheQuery, [righeValues]);

        await connection.commit();
        res.status(201).json({ success: true, message: 'Funzione contabile creata con successo.', id: idFunzioneCreata });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore creazione funzione contabile:", error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Una funzione con questo codice esiste già.' });
        }

        res.status(500).json({ success: false, message: 'Errore del server durante la creazione della funzione.' });
    } finally {
        if (connection) connection.release();
    }
});

// #####################################################################
// # NUOVO: Rotta PUT per aggiornare una Funzione Contabile
// #####################################################################
// #####################################################################
// # Rotta PUT per aggiornare una Funzione Contabile (Verificata)
// #####################################################################
router.put('/funzioni/:id', [verifyToken, canManageFunzioni], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: idFunzione } = req.params;
    const { codice_funzione, nome_funzione, descrizione, categoria, attiva, righe } = req.body;

    if (!righe || !Array.isArray(righe)) {
        return res.status(400).json({ success: false, message: 'Il campo righe è obbligatorio e deve essere un array.' });
    }
    
    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const updateHeaderQuery = `
            UPDATE sc_funzioni_contabili SET 
            codice_funzione = ?, nome_funzione = ?, descrizione = ?, categoria = ?, attiva = ?
            WHERE id = ? AND id_ditta = ?;
        `;
        await connection.query(updateHeaderQuery, [codice_funzione, nome_funzione, descrizione, categoria, attiva, idFunzione, dittaId]);
        
        await connection.query('DELETE FROM sc_funzioni_contabili_righe WHERE id_funzione_contabile = ?;', [idFunzione]);
        
        if (righe.length > 0) {
            const righeValues = righe.map(r => [
                idFunzione,
                r.id_conto,
                r.tipo_movimento,
                r.descrizione_riga_predefinita,
                r.is_sottoconto_modificabile
            ]);
            const insertRigheQuery = `
                INSERT INTO sc_funzioni_contabili_righe (id_funzione_contabile, id_conto, tipo_movimento, descrizione_riga_predefinita, is_sottoconto_modificabile)
                VALUES ?;
            `;
            await connection.query(insertRigheQuery, [righeValues]);
        }

        await connection.commit();
        res.json({ success: true, message: 'Funzione contabile aggiornata con successo.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore aggiornamento funzione contabile:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento della funzione.' });
    } finally {
        if (connection) connection.release();
    }
});
/*
 * DELETE /funzioni/:id
 * Elimina una funzione contabile esistente.
 * Grazie a ON DELETE CASCADE nel DB, verranno eliminate anche le righe associate.
 */
router.delete('/funzioni/:id', [verifyToken, canManageFunzioni], async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: idFunzione } = req.params;

    try {
        const query = 'DELETE FROM sc_funzioni_contabili WHERE id = ? AND id_ditta = ?;';
        const [result] = await dbPool.query(query, [idFunzione, dittaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Funzione non trovata o non autorizzata.' });
        }

        res.json({ success: true, message: 'Funzione contabile eliminata con successo.' });

    } catch (error) {
        console.error("Errore eliminazione funzione contabile:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione della funzione.' });
    }
});

// --- NUOVE ROTTE DI SUPPORTO PER REGISTRAZIONI ---

/**
 * GET /anagrafiche-cf
 * Recupera un elenco semplificato di clienti e fornitori per la ditta.
 */
router.get('/anagrafiche-cf', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        // ## MODIFICA QUI: Aggiunti id_sottoconto_fornitore e id_sottoconto_cliente ##
        const query = `
            SELECT id, ragione_sociale, codice_relazione, id_sottoconto_fornitore, id_sottoconto_cliente 
            FROM ditte 
            WHERE id_ditta_proprietaria = ? AND (codice_relazione = 'C' OR codice_relazione = 'F') 
            ORDER BY ragione_sociale ASC
        `;
        const [rows] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


/**
 * GET /aliquote-iva
 * Recupera le aliquote IVA disponibili per la ditta.
 */
router.get('/aliquote-iva', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const query = `
            SELECT id, codice, descrizione, aliquota 
            FROM iva_contabili 
            WHERE id_ditta = ? 
            ORDER BY aliquota ASC
        `;
        const [rows] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero aliquote IVA:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
// #####################################################################
// # NUOVO ENDPOINT DI SALVATAGGIO REGISTRAZIONI (v1.4)
// #####################################################################
router.post('/registrazioni', [verifyToken, canPostEntries], async (req, res) => {
    const { id_ditta: dittaId, id: userId } = req.user;
    const { isFinancial, datiDocumento, righeIva, righeScrittura } = req.body;

    // 1. Validazione preliminare del payload
    if (!righeScrittura || righeScrittura.length < 2) {
        return res.status(400).json({ success: false, message: 'Dati incompleti: la scrittura contabile deve avere almeno due righe.' });
    }
    const totaleDare = righeScrittura.reduce((sum, r) => r.tipo_movimento === 'D' ? sum + parseFloat(r.importo || 0) : sum, 0);
    const totaleAvere = righeScrittura.reduce((sum, r) => r.tipo_movimento === 'A' ? sum + parseFloat(r.importo || 0) : sum, 0);
    if (Math.abs(totaleDare - totaleAvere) > 0.01) {
        return res.status(400).json({ success: false, message: 'La registrazione non è bilanciata.' });
    }
    if (isFinancial && (!datiDocumento.id_anagrafica || !datiDocumento.data_scadenza)) {
         return res.status(400).json({ success: false, message: 'Per le funzioni finanziarie, cliente/fornitore e data di scadenza sono obbligatori.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // 2. Inserimento testata di registrazione
        const [testataResult] = await connection.query(
            'INSERT INTO sc_registrazioni_testata (id_ditta, id_utente, data_registrazione, descrizione_testata, stato) VALUES (?, ?, ?, ?, ?)',
            [dittaId, userId, datiDocumento.data_documento, datiDocumento.descrizione_testata, 'Confermato']
        );
        const testataId = testataResult.insertId;

        // 3. Inserimento righe di registrazione e gestione registri IVA
        let idRigaCollegamentoIva = null;

        for (const riga of righeScrittura) {
            const [rigaResult] = await connection.query(
                'INSERT INTO sc_registrazioni_righe (id_testata, id_conto, descrizione_riga, importo_dare, importo_avere) VALUES (?, ?, ?, ?, ?)',
                [testataId, riga.id_conto, riga.nome_conto, riga.tipo_movimento === 'D' ? riga.importo : 0, riga.tipo_movimento === 'A' ? riga.importo : 0]
            );
            // Salva l'ID della prima riga di costo/ricavo per collegare i movimenti IVA
            if (isFinancial && !riga.nome_conto.toLowerCase().includes('iva') && !riga.nome_conto.toLowerCase().includes('clienti') && !riga.nome_conto.toLowerCase().includes('fornitori') && idRigaCollegamentoIva === null) {
                idRigaCollegamentoIva = rigaResult.insertId;
            }
        }
        
        // Se la funzione è finanziaria, processa le operazioni correlate
        if (isFinancial) {
            // 4a. Inserimento Partita Aperta
            await connection.query(
                'INSERT INTO sc_partite_aperte (id_ditta_anagrafica, data_scadenza, importo, stato, id_registrazione_testata) VALUES (?, ?, ?, ?, ?)',
                [datiDocumento.id_anagrafica, datiDocumento.data_scadenza, totaleDare, 'APERTA', testataId]
            );

            // 4b. Inserimento Registri IVA
            const anagrafica = await connection.query('SELECT codice_relazione FROM ditte WHERE id = ?', [datiDocumento.id_anagrafica]);
            const tipoRegistro = anagrafica[0][0].codice_relazione === 'C' ? 'Vendite' : 'Acquisti';

            for (const rigaIva of righeIva) {
                if(parseFloat(rigaIva.imponibile) > 0) {
                     await connection.query(
                        'INSERT INTO sc_registri_iva (id_riga_registrazione, tipo_registro, data_documento, numero_documento, id_anagrafica, imponibile, aliquota_iva, importo_iva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [idRigaCollegamentoIva, tipoRegistro, datiDocumento.data_documento, datiDocumento.numero_documento, datiDocumento.id_anagrafica, rigaIva.imponibile, rigaIva.aliquota, rigaIva.imposta]
                    );
                }
            }
        }

        // 5. Commit della transazione
        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione creata con successo.', testataId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore salvataggio registrazione complessa:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della registrazione.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
