// #####################################################################
// # Rotte per il Modulo ContSmart v1.0
// # File: opero-gestionale-main/routes/contsmart.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { getNextProgressivo } = require('../utils/progressivi');
const router = express.Router();
const { knex } = require('../config/db');
//const { db } = require('../config/db');

//const { authenticate, authorize } = require('../utils/auth');
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
const canViewReports = (req, res, next) => {
    if (req.user.livello <= 30) {
        return res.status(403).json({ success: false, message: 'Livello utente non sufficiente per visualizzare i report.' });
    }
    next();
};

// --- NOVITÀ: Rotta per ottenere il Piano dei Conti in formato albero ---
/**
 * @route GET /contsmart/pdc-tree
 * @description Restituisce l'intero piano dei conti strutturato gerarchicamente.
 * @access Utenti autenticati
 */
// ##################################################
// #  API PIANO DEI CONTI (PDC)
// ##################################################

/**
 * @route GET /contsmart/pdc-tree
 * @description Restituisce l'intero piano dei conti strutturato gerarchicamente.
 * @access Utenti autenticati
 */
router.get('/pdc-tree', verifyToken, async (req, res) => {
    let connection;
    try {
        // --- MODIFICA DI ROBUSTEZZA: Controllo di sicurezza sui dati utente ---
        if (!req.user || !req.user.id_ditta) {
            console.error('Tentativo di accesso a pdc-tree senza id_ditta nel token:', req.user);
            return res.status(400).json({ success: false, message: 'Dati utente o ditta mancanti per la richiesta.' });
        }
        const { id_ditta } = req.user;
        // --- FINE MODIFICA ---

        connection = await dbPool.getConnection();
        
        const [rows] = await connection.query(
            "SELECT * FROM sc_piano_dei_conti WHERE id_ditta = ? ORDER BY codice",
            [id_ditta]
        );

        // Algoritmo per costruire l'albero dalla lista flat
        const tree = [];
        const map = {}; // Per accesso rapido ai nodi tramite id

        rows.forEach(row => {
            map[row.id] = { ...row, children: [] };
        });

        rows.forEach(row => {
            if (row.id_padre) {
                if (map[row.id_padre]) {
                    map[row.id_padre].children.push(map[row.id]);
                }
            } else {
                tree.push(map[row.id]);
            }
        });

        res.json({ success: true, data: tree });

    } catch (error) {
        console.error('Errore nel recupero del piano dei conti ad albero:', error);
        res.status(500).json({ success: false, message: 'Errore del server durante il recupero del piano dei conti.' });
    } finally {
        if (connection) connection.release();
    }
});


/**
 * @route PUT /contsmart/pdc/:id
 * @description Modifica un conto o mastro esistente.
 * @access Utenti con livello > 90
 */
router.put('/pdc/:id', verifyToken, canEditPdc, async (req, res) => {
    const { id } = req.params;
    const { codice, descrizione, tipo, natura, id_padre } = req.body;
    let connection;
    try {
        connection = await dbPool.getConnection();
        const query = 'UPDATE sc_piano_dei_conti SET codice = ?, descrizione = ?, tipo = ?, natura = ?, id_padre = ? WHERE id = ?';
        const params = [codice, descrizione, tipo, tipo === 'Mastro' ? null : natura, tipo === 'Mastro' ? null : id_padre, id];
        await connection.query(query, params);
        res.json({ success: true, message: 'Elemento aggiornato con successo.' });
    } catch (error) {
        console.error("Errore aggiornamento voce PDC:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route DELETE /contsmart/pdc/:id
 * @description Elimina un conto o mastro.
 * @access Utenti con livello > 90
 */
router.delete('/pdc/:id', verifyToken, canEditPdc, async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await dbPool.getConnection();
        // Controllo se il conto ha figli
        const [children] = await connection.query('SELECT id FROM sc_piano_dei_conti WHERE id_padre = ?', [id]);
        if (children.length > 0) {
            return res.status(400).json({ success: false, message: 'Impossibile eliminare: il mastro contiene sottoconti.' });
        }
        await connection.query('DELETE FROM sc_piano_dei_conti WHERE id = ?', [id]);
        res.json({ success: true, message: 'Elemento eliminato con successo.' });
    } catch (error) {
        console.error("Errore eliminazione voce PDC:", error);
        // Aggiunto controllo per foreign key constraint
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ success: false, message: 'Impossibile eliminare: il conto è utilizzato in una o più registrazioni.' });
        }
        res.status(500).json({ success: false, message: 'Errore del server.' });
    } finally {
        if (connection) connection.release();
    }
});
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
   // <span style="color:orange;">// MODIFICATO: La rotta è stata potenziata per includere la creazione dei 'Conti'</span>
    router.post('/piano-dei-conti', canEditPdc, async (req, res) => {
        const { id_ditta, id: id_utente } = req.user;
        const { descrizione, id_padre, tipo, natura } = req.body;
        let { codice } = req.body;

        try {
            await knex.transaction(async (trx) => {
                let nextCodice;
                let finalCodice;

                if (tipo === 'Mastro') {
                    const lastMastro = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, tipo: 'Mastro' })
                        .orderBy('codice', 'desc')
                        .first();
                    nextCodice = lastMastro ? parseInt(lastMastro.codice, 10) + 1 : 101;
                    finalCodice = nextCodice.toString();
                } else if (tipo === 'Conto') {
                    // <span style="color:green;">// NUOVO: Logica per la creazione di un Conto</span>
                    if (!id_padre) {
                        throw new Error("Un Conto deve avere un Mastro padre.");
                    }
                    const mastroPadre = await trx('sc_piano_dei_conti').where({ id: id_padre, id_ditta }).first();
                    if (!mastroPadre || mastroPadre.tipo !== 'Mastro') {
                        throw new Error("Il padre di un Conto deve essere un Mastro.");
                    }
                    
                    const lastConto = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, id_padre })
                        .orderBy('codice', 'desc')
                        .first();

                    if (lastConto) {
                        const lastNum = parseInt(lastConto.codice.split('.')[1], 10);
                        nextCodice = (lastNum + 1).toString().padStart(2, '0');
                    } else {
                        nextCodice = '01';
                    }
                    finalCodice = `${mastroPadre.codice}.${nextCodice}`;

                } else if (tipo === 'Sottoconto') {
                    if (!id_padre) {
                        throw new Error("Un Sottoconto deve avere un Conto padre.");
                    }
                    const contoPadre = await trx('sc_piano_dei_conti').where({ id: id_padre, id_ditta }).first();
                    if (!contoPadre || contoPadre.tipo !== 'Conto') {
                        throw new Error("Il padre di un Sottoconto deve essere un Conto.");
                    }
                    
                    const lastSottoconto = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, id_padre })
                        .orderBy('codice', 'desc')
                        .first();
                    
                    if (lastSottoconto) {
                        const lastNum = parseInt(lastSottoconto.codice.split('.')[2], 10);
                        nextCodice = (lastNum + 1).toString().padStart(3, '0');
                    } else {
                        nextCodice = '001';
                    }
                    finalCodice = `${contoPadre.codice}.${nextCodice}`;
                } else {
                    return res.status(400).json({ success: false, message: 'Tipo di elemento non valido.' });
                }

                const [newItemId] = await trx('sc_piano_dei_conti').insert({
                    id_ditta,
                    codice: finalCodice,
                    descrizione,
                    id_padre,
                    tipo,
                    natura: tipo === 'Mastro' ? null : natura
                });

                await trx('log_azioni').insert({
                    id_utente, id_ditta, azione: 'Creazione Elemento PDC',
                    dettagli: `Tipo: ${tipo}, Codice: ${finalCodice}, Desc: ${descrizione}`
                });

                const newItem = await trx('sc_piano_dei_conti').where('id', newItemId).first();
                res.status(201).json({ success: true, data: newItem });
            });
        } catch (error) {
            console.error("Errore creazione elemento PDC:", error);
            res.status(500).json({ success: false, error: error.message || "Errore del server." });
        }
    });


// <span style="color:green;">// NUOVO: Aggiunta la rotta mancante per fornire il piano dei conti in formato "flat"</span>
router.get('/piano-dei-conti-flat', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const pdcFlat = await knex('sc_piano_dei_conti')
            .where({ id_ditta })
            .orderBy('codice');
        res.json({ success: true, data: pdcFlat });
    } catch (error) {
        console.error("Errore nel recupero del PDC (flat):", error);
        res.status(500).json({ success: false, error: 'Errore nel recupero del Piano dei Conti (flat).' });
    }
});



       // <span style="color:orange;">// MODIFICATO: La rotta è stata potenziata per includere la creazione dei 'Conti'</span>
    router.post('/pdc', canEditPdc, async (req, res) => {
        const { id_ditta, id: id_utente } = req.user;
        const { descrizione, id_padre, tipo, natura } = req.body;
        let { codice } = req.body;

        try {
            await knex.transaction(async (trx) => {
                let nextCodice;
                let finalCodice;

                if (tipo === 'Mastro') {
                    const lastMastro = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, tipo: 'Mastro' })
                        .orderBy('codice', 'desc')
                        .first();
                    nextCodice = lastMastro ? parseInt(lastMastro.codice, 10) + 1 : 101;
                    finalCodice = nextCodice.toString();
                } else if (tipo === 'Conto') {
                    // <span style="color:green;">// NUOVO: Logica per la creazione di un Conto</span>
                    if (!id_padre) {
                        throw new Error("Un Conto deve avere un Mastro padre.");
                    }
                    const mastroPadre = await trx('sc_piano_dei_conti').where({ id: id_padre, id_ditta }).first();
                    if (!mastroPadre || mastroPadre.tipo !== 'Mastro') {
                        throw new Error("Il padre di un Conto deve essere un Mastro.");
                    }
                    
                    const lastConto = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, id_padre })
                        .orderBy('codice', 'desc')
                        .first();

                    if (lastConto) {
                        const lastNum = parseInt(lastConto.codice.split('.')[1], 10);
                        nextCodice = (lastNum + 1).toString().padStart(2, '0');
                    } else {
                        nextCodice = '01';
                    }
                    finalCodice = `${mastroPadre.codice}.${nextCodice}`;

                } else if (tipo === 'Sottoconto') {
                    if (!id_padre) {
                        throw new Error("Un Sottoconto deve avere un Conto padre.");
                    }
                    const contoPadre = await trx('sc_piano_dei_conti').where({ id: id_padre, id_ditta }).first();
                    if (!contoPadre || contoPadre.tipo !== 'Conto') {
                        throw new Error("Il padre di un Sottoconto deve essere un Conto.");
                    }
                    
                    const lastSottoconto = await trx('sc_piano_dei_conti')
                        .where({ id_ditta, id_padre })
                        .orderBy('codice', 'desc')
                        .first();
                    
                    if (lastSottoconto) {
                        const lastNum = parseInt(lastSottoconto.codice.split('.')[2], 10);
                        nextCodice = (lastNum + 1).toString().padStart(3, '0');
                    } else {
                        nextCodice = '001';
                    }
                    finalCodice = `${contoPadre.codice}.${nextCodice}`;
                } else {
                    return res.status(400).json({ success: false, message: 'Tipo di elemento non valido.' });
                }

                const [newItemId] = await trx('sc_piano_dei_conti').insert({
                    id_ditta,
                    codice: finalCodice,
                    descrizione,
                    id_padre,
                    tipo,
                    natura: tipo === 'Mastro' ? null : natura
                });

                await trx('log_azioni').insert({
                    id_utente, id_ditta, azione: 'Creazione Elemento PDC',
                    dettagli: `Tipo: ${tipo}, Codice: ${finalCodice}, Desc: ${descrizione}`
                });

                const newItem = await trx('sc_piano_dei_conti').where('id', newItemId).first();
                res.status(201).json({ success: true, data: newItem });
            });
        } catch (error) {
            console.error("Errore creazione elemento PDC:", error);
            res.status(500).json({ success: false, error: error.message || "Errore del server." });
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

router.get('/pdc', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const [rows] = await dbPool.query('SELECT id, codice, descrizione, tipo FROM sc_piano_dei_conti WHERE id_ditta = ? ORDER BY codice', [id_ditta]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});
// --- ROTTE FUNZIONI CONTABILI (FEDELI ALL'ORIGINALE) ---

// --- ROTTE FUNZIONI CONTABILI (CON NOMI TABELLA CORRETTI) ---


// GET /api/contsmart/funzioni - Recupera tutte le funzioni contabili
// GET /api/contsmart/funzioni - Recupera tutte le funzioni contabili
router.get('/funzioni', verifyToken, canManageFunzioni, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        await dbPool.query('SET SESSION group_concat_max_len = 1000000;');
        
        const query = `
            SELECT 
                f.id, f.nome_funzione, f.descrizione, f.tipo_funzione, f.categoria, 
                GROUP_CONCAT(
                    DISTINCT JSON_OBJECT(
                        'id', r.id, 
                        'id_conto', r.id_conto, 
                        'tipo_movimento', r.tipo_movimento, 
                        'descrizione_riga_predefinita', r.descrizione_riga_predefinita
                    )
                ) as righe_predefinite
            FROM sc_funzioni_contabili f
            LEFT JOIN sc_funzioni_contabili_righe r ON f.id = r.id_funzione_contabile
            WHERE f.id_ditta = ?
            GROUP BY f.id
            ORDER BY f.nome_funzione
        `;
        const [funzioni] = await dbPool.query(query, [id_ditta]);
        
        funzioni.forEach(f => {
            if(f.righe_predefinite && f.righe_predefinite[0] !== null) {
                try {
                    f.righe_predefinite = JSON.parse(`[${f.righe_predefinite}]`);
                } catch (e) {
                    f.righe_predefinite = [];
                }
            } else {
                f.righe_predefinite = [];
            }
        });
        res.json(funzioni);
    } catch (error) {
        console.error("Errore recupero funzioni:", error);
        res.status(500).json({ message: 'Errore recupero funzioni contabili.' });
    }
});


// POST /api/contsmart/funzioni - Crea una nuova funzione contabile con righe predefinite
router.post('/funzioni', verifyToken, canManageFunzioni, async (req, res) => {
    const { id_ditta } = req.user;
    const { nome_funzione, descrizione, tipo_funzione, categoria, righe_predefinite } = req.body;
    
    if (!nome_funzione || !tipo_funzione || !categoria) {
        return res.status(400).json({ success: false, message: 'Nome, tipo e categoria della funzione sono obbligatori.' });
    }

    const connection = await dbPool.getConnection();
    
    try {
        await connection.beginTransaction();

        // [NUOVO] LOGICA PER GENERARE IL CODICE FUNZIONE PROGRESSIVO
        // 1. Trova il codice_funzione più alto (come numero) per la ditta corrente.
        const [rows] = await connection.query(
            'SELECT MAX(CAST(codice_funzione AS UNSIGNED)) as max_code FROM sc_funzioni_contabili WHERE id_ditta = ?',
            [id_ditta]
        );

        let nextCode = 1;
        // 2. Se esiste un massimo, lo incrementa. Altrimenti, parte da 1.
        if (rows && rows.length > 0 && rows[0].max_code) {
            nextCode = rows[0].max_code + 1;
        }
        // [FINE NUOVO]

        // [MODIFICATO] Aggiunto 'codice_funzione' e il suo valore alla query di inserimento
        const [result] = await connection.query(
            'INSERT INTO sc_funzioni_contabili (id_ditta, codice_funzione, nome_funzione, descrizione, tipo_funzione, categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [id_ditta, nextCode.toString(), nome_funzione.toUpperCase(), descrizione, tipo_funzione, categoria]
        );

        const idFunzione = result.insertId; 

        // Inserisce le righe predefinite, se presenti
        if (righe_predefinite && righe_predefinite.length > 0) {
            for (const riga of righe_predefinite) {
                if (riga.id_conto) {
                    await connection.query(
                        'INSERT INTO sc_funzioni_contabili_righe (id_funzione_contabile, id_conto, tipo_movimento, descrizione_riga_predefinita) VALUES (?, ?, ?, ?)',
                        [idFunzione, riga.id_conto, riga.tipo_movimento, riga.descrizione_riga_predefinita || '']
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Funzione creata con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore creazione funzione:", error);
        
        // Messaggio di errore più specifico in caso di duplicato
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Errore di duplicazione. Il codice funzione generato potrebbe essere già in uso.' });
        }
        res.status(500).json({ success: false, message: 'Errore interno del server durante la creazione della funzione.' });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// PUT /api/contsmart/funzioni/:id - Aggiorna una funzione contabile
router.put('/funzioni/:id', verifyToken, canManageFunzioni, async (req, res) => {
    const { id } = req.params; 
    const { id_ditta } = req.user;
    const { nome_funzione, descrizione, tipo_funzione, categoria, righe_predefinite } = req.body;
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE sc_funzioni_contabili SET nome_funzione = ?, descrizione = ?, tipo_funzione = ?, categoria = ? WHERE id = ? AND id_ditta = ?',
            [nome_funzione, descrizione, tipo_funzione, categoria, id, id_ditta]
        );
        
        await connection.query('DELETE FROM sc_funzioni_contabili_righe WHERE id_funzione_contabile = ?', [id]);
        if (righe_predefinite && righe_predefinite.length > 0) {
            for (const riga of righe_predefinite) {
                 if(riga.id_conto) { 
                    await connection.query(
                        'INSERT INTO sc_funzioni_contabili_righe (id_funzione_contabile, id_conto, tipo_movimento, descrizione_riga_predefinita) VALUES (?, ?, ?, ?)',
                        [id, riga.id_conto, riga.tipo_movimento, riga.descrizione_riga_predefinita || '']
                    );
                 }
            }
        }
        await connection.commit();
        res.json({ success: true, message: 'Funzione aggiornata.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore aggiornamento funzione:", error);
        res.status(500).json({ success: false, message: 'Errore aggiornamento funzione.' });
    } finally {
        connection.release();
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
// # --- NOVITÀ: ROTTE PER LA REPORTISTICA ---
// #####################################################################

/**
 * @route GET /api/contsmart/reports/giornale
 * @description Recupera le scritture contabili per il libro giornale in un intervallo di date.
 * @access Privato, canViewReports
 * @param {string} startDate - Data di inizio (YYYY-MM-DD)
 * @param {string} endDate - Data di fine (YYYY-MM-DD)
 */
router.get('/reports/giornale', verifyToken, canViewReports, async (req, res) => {
    const { id_ditta } = req.user;
    const { data_inizio, data_fine } = req.query;

    if (!data_inizio || !data_fine) {
        return res.status(400).json({ success: false, message: 'Le date di inizio e fine sono obbligatorie.' });
    }

    try {
        // <span style="color:red;">// CORREZIONE DEFINITIVA: I nomi delle colonne sono stati allineati allo schema del database.</span>
        // <span style="color:green;">// 't.descrizione' è diventato 't.descrizione_testata'.</span>
        // <span style="color:green;">// 'r.descrizione' è diventato 'r.descrizione_riga'.</span>
        const query = `
            SELECT 
                t.id AS id_testata,
                t.data_registrazione,
                t.numero_protocollo,
                t.descrizione_testata,
                r.id AS id_riga,
                r.descrizione_riga,
                r.id_conto,
                pc.codice AS codice_conto,
                pc.descrizione AS descrizione_conto,
                r.importo_dare,
                r.importo_avere
            FROM sc_registrazioni_testata t
            JOIN sc_registrazioni_righe r ON t.id = r.id_testata
            JOIN sc_piano_dei_conti pc ON r.id_conto = pc.id
            WHERE t.id_ditta = ? AND t.data_registrazione BETWEEN ? AND ?
            ORDER BY t.data_registrazione, t.numero_protocollo, r.id;
        `;
        
        const [rows] = await dbPool.query(query, [id_ditta, data_inizio, data_fine]);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error("Errore nel recupero del libro giornale:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore interno del server durante il recupero del libro giornale.',
            details: error.sqlMessage || error.message
        });
    }
});
/**
 * @route GET /api/contsmart/reports/scheda-contabile
 * @description Recupera i movimenti di un singolo conto (scheda contabile/partitario).
 * @access Privato, canViewReports
 * @param {string} startDate - Data di inizio (YYYY-MM-DD)
 * @param {string} endDate - Data di fine (YYYY-MM-DD)
 * @param {number} contoId - ID del conto dal piano dei conti
 */
// <span style="color:green;">// NUOVO: GET /api/contsmart/reports/scheda-contabile - Genera i dati per la scheda contabile di un conto.</span>
router.get('/reports/scheda-contabile', verifyToken, canViewReports, async (req, res) => {
    const { id_ditta } = req.user;
    const { id_conto, data_inizio, data_fine } = req.query;

    if (!id_conto || !data_inizio || !data_fine) {
        return res.status(400).json({ success: false, message: 'ID Conto, data di inizio e fine sono obbligatori.' });
    }

    const connection = await dbPool.getConnection();
    try {
        // 1. Calcola il saldo iniziale
        const saldoQuery = `
            SELECT (SUM(COALESCE(r.importo_dare, 0)) - SUM(COALESCE(r.importo_avere, 0))) as saldo_iniziale
            FROM sc_registrazioni_righe r
            JOIN sc_registrazioni_testata t ON r.id_testata = t.id
            WHERE r.id_conto = ? AND t.id_ditta = ? AND t.data_registrazione < ?
        `;
        const [saldoRows] = await connection.query(saldoQuery, [id_conto, id_ditta, data_inizio]);
        const saldo_iniziale = saldoRows[0]?.saldo_iniziale || 0;

        // 2. Recupera i movimenti nel periodo
        const movimentiQuery = `
            SELECT 
                t.data_registrazione,
                t.numero_protocollo,
                t.descrizione_testata,
                r.descrizione_riga,
                r.importo_dare,
                r.importo_avere
            FROM sc_registrazioni_righe r
            JOIN sc_registrazioni_testata t ON r.id_testata = t.id
            WHERE r.id_conto = ? AND t.id_ditta = ? AND t.data_registrazione BETWEEN ? AND ?
            ORDER BY t.data_registrazione, t.numero_protocollo, r.id
        `;
        const [movimenti] = await connection.query(movimentiQuery, [id_conto, id_ditta, data_inizio, data_fine]);

        res.json({ success: true, data: { saldo_iniziale, movimenti } });

    } catch (error) {
        console.error("Errore nel recupero della scheda contabile:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore interno del server.',
            details: error.sqlMessage || error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route GET /api/contsmart/reports/bilancio-verifica
 * @description Genera un bilancio di verifica a una data specifica.
 * @access Privato, canViewReports
 * @param {string} date - Data di riferimento per il bilancio (YYYY-MM-DD)
 */
router.get('/reports/bilancio-verifica', verifyToken, canViewReports, async (req, res) => {
    const { id_ditta } = req.user;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'La data di riferimento è obbligatoria.' });
    }
    
    try {
        const query = `
            SELECT 
                pc.id AS id_conto,
                pc.codice AS codice_conto,
                pc.descrizione AS descrizione_conto,
                pc.tipo,
                pc.natura,
                COALESCE(SUM(r.importo_dare), 0) AS totale_dare,
                COALESCE(SUM(r.importo_avere), 0) AS totale_avere
            FROM sc_piano_dei_conti pc
            LEFT JOIN sc_registrazioni_righe r ON pc.id = r.id_conto
            LEFT JOIN sc_registrazioni_testata t ON r.id_testata = t.id AND t.data_registrazione <= ? AND t.id_ditta = ?
            WHERE pc.id_ditta = ?
            GROUP BY pc.id, pc.codice, pc.descrizione, pc.tipo, pc.natura
            HAVING totale_dare > 0 OR totale_avere > 0
            ORDER BY pc.codice;
        `;

        const [rows] = await dbPool.query(query, [date, id_ditta, id_ditta]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recupero del bilancio di verifica:", error);
        res.status(500).json({ success: false, message: "Errore del server durante il recupero dei dati." });
    }
});

// --- NUOVA ROTTA: GET /anagrafiche-filtrate?categoria=... ---
// Fornisce una lista di anagrafiche filtrate per Clienti o Fornitori
// basandosi sulla categoria della funzione contabile.
router.get('/anagrafiche-filtrate', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { categoria } = req.query;

    if (!categoria) {
        return res.status(400).json({ success: false, message: 'La categoria è obbligatoria.' });
    }

    let query;
    const params = [id_ditta];

    if (categoria.toLowerCase() === 'Acquisti') {
        // Seleziona tutte le anagrafiche che sono state definite come fornitori
        query = `
            SELECT id, ragione_sociale, indirizzo, citta, partita_iva 
            FROM ditte 
            WHERE id_ditta = ? AND id_sottoconto_fornitore IS NOT NULL 
            ORDER BY ragione_sociale ASC
        `;
    } else if (categoria.toLowerCase() === 'Vendite') {
        // Seleziona tutte le anagrafiche che sono state definite come clienti
        query = `
            SELECT id, ragione_sociale, indirizzo, citta, partita_iva 
            FROM ditte 
            WHERE id_ditta = ? AND id_sottoconto_cliente IS NOT NULL 
            ORDER BY ragione_sociale ASC
        `;
    } else {
        // Categoria non valida o non gestita (es. 'Primaria')
        return res.json({ success: true, data: [] });
    }

    try {
        const [rows] = await dbPool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recupero anagrafiche filtrate:", error);
        res.status(500).json({ success: false, message: 'Errore del server durante il recupero delle anagrafiche.' });
    }
});

// <span style="color:green;">// NUOVO: Rotta per recuperare i sottoconti figli di un mastro specifico (es. 'CLIENTI' o 'FORNITORI')</span>
// <span style="color:green;">// Scopo: Isolare i conti specifici (es. tutti i clienti) per poi cercare le anagrafiche collegate.</span>
router.get('/sottoconti-per-natura', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { natura } = req.query; // Es. 'CLIENTI' o 'FORNITORI'

    if (!natura) {
        return res.status(400).json({ success: false, message: 'La natura del conto è obbligatoria.' });
    }

    try {
        // 1. Trova l'ID del mastro (es. 'CLIENTI') basandosi sulla sua descrizione
        const [mastro] = await dbPool.query(
            'SELECT id FROM sc_piano_dei_conti WHERE id_ditta = ? AND tipo = "Mastro" AND UPPER(descrizione) LIKE ?',
            [id_ditta, `%${natura.toUpperCase()}%`]
        );

        if (mastro.length === 0) {
            return res.json({ success: true, data: [] }); // Nessun mastro trovato
        }
        const idMastro = mastro[0].id;

        // 2. Trova tutti i conti figli diretti (i conti, es. 'Clienti Italia')
        const [conti] = await dbPool.query(
            'SELECT id FROM sc_piano_dei_conti WHERE id_ditta = ? AND id_padre = ?',
            [id_ditta, idMastro]
        );
        const idConti = conti.map(c => c.id);

        if (idConti.length === 0) {
             return res.json({ success: true, data: [] });
        }

        // 3. Trova tutti i sottoconti che appartengono a quei conti
        const [sottoconti] = await dbPool.query(
            'SELECT id FROM sc_piano_dei_conti WHERE id_ditta = ? AND tipo = "Sottoconto" AND id_padre IN (?)',
            [id_ditta, idConti]
        );

        res.json({ success: true, data: sottoconti.map(s => s.id) }); // Restituisce solo gli ID dei sottoconti

    } catch (error) {
        console.error("Errore recupero sottoconti per natura:", error);
        res.status(500).json({ success: false, message: 'Errore del server durante il recupero dei sottoconti.' });
    }
});


// <span style="color:red;">// MODIFICA: La rotta 'anagrafiche-filtrate' ora è più intelligente</span>
// <span style="color:green;">// Accetta una lista di ID di sottoconti e restituisce solo le ditte collegate.</span>
router.get('/anagrafiche-filtrate', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { categoria, sottocontoIds } = req.query; // sottocontoIds è una stringa di ID separati da virgola: "1,2,3"

    if (!categoria || !sottocontoIds) {
        return res.status(400).json({ success: false, message: 'Categoria e lista di sottoconti sono obbligatori.' });
    }

    const ids = sottocontoIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
        return res.json({ success: true, data: [] }); // Se non ci sono ID validi, restituisce un array vuoto
    }

    let colonnaSottoconto;
    if (categoria.toLowerCase() === 'Acquisti') {
        colonnaSottoconto = 'id_sottoconto_fornitore';
    } else if (categoria.toLowerCase() === 'Vendite') {
        colonnaSottoconto = 'id_sottoconto_cliente';
    } else {
        return res.json({ success: true, data: [] }); // Categoria non gestita
    }

    try {
        const query = `
            SELECT id, ragione_sociale, citta, partita_iva 
            FROM ditte 
            WHERE id_ditta = ? AND ?? IN (?) 
            ORDER BY ragione_sociale ASC
        `;
        const params = [id_ditta, colonnaSottoconto, ids];
        
        const [rows] = await dbPool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel caricamento delle anagrafiche filtrate:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});

// ---------------------------------------------------------------------
// FUNZIONI CONTABILI
// ---------------------------------------------------------------------

// GET /api/contsmart/funzioni-contabili
// Restituisce l'elenco delle funzioni contabili per la ditta corrente
// GET /api/contsmart/funzioni-contabili

router.get('/funzioni-contabili', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const funzioni = await knex('sc_funzioni_contabili')
            .where({ id_ditta, attiva: 1 })
            .select('id', 'nome_funzione', 'descrizione', 'tipo_funzione', 'categoria', 'gestioni_abbinate', 'codice_funzione');

        const tutteLeRighe = await knex('sc_funzioni_contabili_righe')
            .join('sc_funzioni_contabili', 'sc_funzioni_contabili_righe.id_funzione_contabile', 'sc_funzioni_contabili.id')
            .where('sc_funzioni_contabili.id_ditta', id_ditta)
            .select('sc_funzioni_contabili_righe.*'); // Seleziona tutti i campi, inclusi i nuovi

        const risultato = funzioni.map(funzione => ({
            ...funzione,
            // Knex con MySQL restituisce il SET come una stringa, la convertiamo in array per il frontend
            gestioni_abbinate: funzione.gestioni_abbinate ? funzione.gestioni_abbinate.split(',') : [],
            righe_predefinite: tutteLeRighe.filter(riga => riga.id_funzione_contabile === funzione.id)
        }));

        res.json({ success: true, data: risultato });
    } catch (error) {
        console.error("Errore nel recupero delle funzioni contabili:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.post('/funzioni-contabili', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { testata, righe } = req.body;

    try {
        await knex.transaction(async trx => {
            const [idTestata] = await trx('sc_funzioni_contabili').insert({
                ...testata,
                id_ditta,
                gestioni_abbinate: (testata.gestioni_abbinate || []).join(',')
            });

            if (righe && righe.length > 0) {
                const righeDaInserire = righe.map(riga => ({
                    ...riga,
                    id_funzione_contabile: idTestata,
                }));
                await trx('sc_funzioni_contabili_righe').insert(righeDaInserire);
            }
        });
        res.status(201).json({ success: true, message: 'Funzione creata con successo.' });
    } catch (error) {
        console.error("Errore nella creazione della funzione:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.patch('/funzioni-contabili/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;
    const { testata, righe } = req.body;

    try {
        await knex.transaction(async trx => {
            await trx('sc_funzioni_contabili')
                .where({ id: id, id_ditta: id_ditta })
                .update({
                    ...testata,
                    gestioni_abbinate: (testata.gestioni_abbinate || []).join(',')
                });
            
            await trx('sc_funzioni_contabili_righe').where('id_funzione_contabile', id).del();

            if (righe && righe.length > 0) {
                const righeDaInserire = righe.map(riga => ({
                    ...riga,
                    id_funzione_contabile: id,
                }));
                await trx('sc_funzioni_contabili_righe').insert(righeDaInserire);
            }
        });
        res.json({ success: true, message: 'Funzione aggiornata con successo.' });
    } catch (error) {
        console.error(`Errore nell'aggiornamento della funzione ${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});
// POST /api/contsmart/registrazioni


// GET /api/contsmart/partite-aperte - Recupera le partite aperte (crediti o debiti)
router.get('/partite-aperte', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { tipo } = req.query; // 'attive' per i crediti, 'passive' per i debiti

    if (!tipo || !['attive', 'passive'].includes(tipo)) {
        return res.status(400).json({ success: false, message: "Il tipo di partita ('attive' o 'passive') è obbligatorio." });
    }

    // Determina i codici di relazione da cercare in base al tipo richiesto
    const codiciRelazione = (tipo === 'attive') ? ['C', 'E'] : ['F', 'E'];

    try {
        const query = `
            SELECT 
                pa.id,
                pa.data_scadenza,
                pa.importo,
                pa.stato,
                pa.id_registrazione_testata,
                d.ragione_sociale,
                rt.numero_documento,
                rt.data_documento
            FROM sc_partite_aperte pa
            JOIN ditte d ON pa.id_ditta_anagrafica = d.id
            LEFT JOIN sc_registrazioni_testata rt ON pa.id_registrazione_testata = rt.id
            WHERE 
                d.id_ditta_proprietaria = ? 
                AND pa.stato = 'APERTA'
                AND d.codice_relazione IN (?)
            ORDER BY d.ragione_sociale, pa.data_scadenza;
        `;
        
        const [partite] = await dbPool.query(query, [id_ditta, codiciRelazione]);
        res.json({ success: true, data: partite });

    } catch (error) {
        console.error(`Errore nel recupero delle partite ${tipo}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// ---------------------------------------------------------------------
// REPORTISTICA
// ---------------------------------------------------------------------

// <span style="color:green;">// NUOVO: GET /api/contsmart/pdc-flat - Restituisce un elenco "piatto" dei sottoconti.</span>
// <span style="color:green;">// Questa rotta risolve l'errore 404 segnalato.</span>
router.get('/pdc-flat', verifyToken, canViewReports, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const query = `
            SELECT id, codice, descrizione 
            FROM sc_piano_dei_conti 
            WHERE id_ditta = ? AND tipo = 'Sottoconto' 
            ORDER BY codice ASC
        `;
        const [conti] = await dbPool.query(query, [id_ditta]);
        res.json({ success: true, data: conti });
    } catch (error) {
        console.error("Errore nel recupero del piano dei conti flat:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// #####################################################################
// # NUOVA ROUTE: API per recuperare le Partite Aperte (Attive/Passive)
// #####################################################################
router.get('/reports/partite-aperte/:tipo', async (req, res) => {
    const { id_ditta } = req.user;
    const { tipo } = req.params;
    const { id_anagrafica } = req.query;

    if (tipo !== 'attive' && tipo !== 'passive') {
        return res.status(400).json({ success: false, message: 'Tipo di partita non valido.' });
    }

    if (!id_anagrafica) {
        return res.status(400).json({ success: false, message: "L'ID dell'anagrafica è obbligatorio." });
    }

    try {
        const partite = await knex('sc_partite_aperte') // <-- USARE 'knex'
            .join('ditte', 'sc_partite_aperte.id_anagrafica', 'ditte.id')
            .where('sc_partite_aperte.id_ditta', id_ditta)
            .andWhere('sc_partite_aperte.id_anagrafica', id_anagrafica)
            .andWhere('sc_partite_aperte.stato', 'aperta')
            .select(
                'sc_partite_aperte.id',
                'sc_partite_aperte.data_documento',
                'sc_partite_aperte.data_scadenza',
                'sc_partite_aperte.numero_documento',
                'ditte.ragione_sociale',
                'sc_partite_aperte.importo',
                'sc_partite_aperte.stato',
                'sc_partite_aperte.tipo_movimento', 
                'sc_partite_aperte.id_sottoconto',
                 // Usa 'knex.raw' per la selezione condizionale
                knex.raw(`CASE WHEN ? = 'attive' THEN ditte.id_sottoconto_cliente ELSE ditte.id_sottoconto_fornitore END as id_sottoconto`, [tipo])
            )
            .orderBy('sc_partite_aperte.data_scadenza', 'asc');
        
        res.json({ success: true, data: partite });

    } catch (error) {
        console.error("Errore nel recupero delle partite aperte:", error);
        res.status(500).json({ success: false, message: 'Si è verificato un errore nel recupero dei dati.' });
    }
});


module.exports = router;

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


// ---------------------------------------------------------------------
// REGISTRAZIONI CONTABILI
// ---------------------------------------------------------------------
/* vecchia e funzionante logica di scrittura con errore di gestione chiusura partite scopere
router.post('/registrazioni', verifyToken, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { datiDocumento, scrittura, iva } = req.body;
      
    if (!datiDocumento || !datiDocumento.id_funzione_contabile || !scrittura || !Array.isArray(scrittura) || scrittura.length === 0) {
        return res.status(400).json({ message: "Dati di registrazione incompleti. La funzione contabile è obbligatoria." });
    }

    try {
        let nextProtocollo; // Definiamo la variabile qui per renderla accessibile alla fine

        await knex.transaction(async (trx) => {
            const funzioneDettagli = await trx('sc_funzioni_contabili')
                .where('id', datiDocumento.id_funzione_contabile)
                .select('tipo_funzione', 'categoria')
                .first();

            if (!funzioneDettagli) {
                throw new Error('Funzione contabile non trovata o non valida.');
            }
            
            const isStorno = (funzioneDettagli.categoria || '').toLowerCase().includes('storno');

            const lastProto = await trx('sc_registrazioni_testata')
                .where('id_ditta', id_ditta)
                .max('numero_protocollo as max_protocollo')
                .first();

            nextProtocollo = (lastProto.max_protocollo || 0) + 1;

            const [idTestata] = await trx('sc_registrazioni_testata').insert({
                id_ditta, id_utente, numero_protocollo: nextProtocollo,
                data_registrazione: datiDocumento.data_registrazione,
                data_documento: datiDocumento.data_documento || null,
                numero_documento: datiDocumento.numero_documento || null,
                id_ditte: datiDocumento.id_anagrafica || null,
                totale_documento: datiDocumento.totale_documento || 0,
                descrizione_testata: datiDocumento.descrizione
            });
            
            const righeNonIva = scrittura.filter(r => !r.descrizione.toLowerCase().includes('iva'));
            const righeIvaTemplate = scrittura.filter(r => r.descrizione.toLowerCase().includes('iva'));

            const righeNonIvaDaInserire = righeNonIva.map(riga => ({
                id_testata: idTestata,
                id_conto: riga.id_conto,
                descrizione_riga: riga.descrizione,
                importo_dare: riga.importo_dare || 0,
                importo_avere: riga.importo_avere || 0,
            }));
            await trx('sc_registrazioni_righe').insert(righeNonIvaDaInserire);

            if (iva && Array.isArray(iva) && iva.length > 0) {
                let tipoRegistroIva = null;
                if (funzioneDettagli.categoria.includes('Acquisti')) {
                    tipoRegistroIva = 'Acquisti';
                } else if (funzioneDettagli.categoria.includes('Vendite')) {
                    tipoRegistroIva = 'Vendite';
                }

                if (tipoRegistroIva) {
                    for (const rigaIva of iva) {
                        if (rigaIva.imposta > 0) {
                            const templateRigaIva = righeIvaTemplate[0];
                            
                            const [idRigaIvaInserita] = await trx('sc_registrazioni_righe').insert({
                                id_testata: idTestata,
                                id_conto: templateRigaIva.id_conto,
                                descrizione_riga: templateRigaIva.descrizione,
                                importo_dare: templateRigaIva.importo_dare > 0 ? rigaIva.imposta : 0,
                                importo_avere: templateRigaIva.importo_avere > 0 ? rigaIva.imposta : 0,
                            }).returning('id');

                            const codiceIva = await trx('iva_contabili').where('id', rigaIva.id_codice_iva).first();

                            await trx('sc_registri_iva').insert({
                                id_riga_registrazione: idRigaIvaInserita,
                                tipo_registro: tipoRegistroIva,
                                data_documento: datiDocumento.data_documento,
                                numero_documento: datiDocumento.numero_documento,
                                id_anagrafica: datiDocumento.id_anagrafica || null,
                                imponibile: rigaIva.imponibile,
                                aliquota_iva: codiceIva ? codiceIva.aliquota : 0,
                                importo_iva: rigaIva.imposta
                            });
                        }
                    }
                }
            }
            
            if ((funzioneDettagli.tipo_funzione === 'Finanziaria' || funzioneDettagli.tipo_funzione === 'Pagamento') && datiDocumento.id_anagrafica) {
                let tipo_movimento = null;
                const categoria = (funzioneDettagli.categoria || '');

                if (categoria.includes('Acquisti')) {
                    tipo_movimento = isStorno ? 'Apertura_Credito' : 'Apertura_Debito';
                } else if (categoria.includes('Vendite')) {
                    tipo_movimento = isStorno ? 'Apertura_Debito' : 'Apertura_Credito';
                } else if (categoria.includes('Pagamenti')) {
                     const rigaContropartitaPagamento = scrittura.find(r => r.id_conto === datiDocumento.id_anagrafica);
                     const segnoPagamento = rigaContropartitaPagamento?.importo_avere > 0 ? 'A' : 'D';
                     tipo_movimento = segnoPagamento === 'A' ? 'Chiusura_Credito' : 'Chiusura_Debito';
                }
                
                if (tipo_movimento) {
                    await trx('sc_partite_aperte').insert({
                        id_ditta,
                        id_registrazione_testata: idTestata,
                        data_registrazione: datiDocumento.data_registrazione,
                        id_anagrafica: datiDocumento.id_anagrafica,
                        id_ditta_anagrafica: datiDocumento.id_anagrafica,
                        id_sottoconto: datiDocumento.id_anagrafica,
                        numero_documento: datiDocumento.numero_documento,
                        data_documento: datiDocumento.data_documento,
                        tipo_movimento: tipo_movimento,
                        importo: datiDocumento.totale_documento,
                        stato: 'APERTA',
                        data_scadenza: datiDocumento.data_scadenza || datiDocumento.data_documento,
                    });
                }
            }
            
            await trx('log_azioni').insert({
                id_utente, id_ditta, azione: 'Creazione Registrazione Contabile',
                dettagli: `ID Testata: ${idTestata}, Funzione: ${datiDocumento.id_funzione_contabile}`
            });

        });

        res.status(201).json({ 
            message: `Registrazione salvata con protocollo N. ${nextProtocollo} del ${datiDocumento.data_registrazione}`,
            numero_protocollo: nextProtocollo,
            data_registrazione: datiDocumento.data_registrazione
        });
    } catch (error) {
        console.error("Errore durante il salvataggio della registrazione:", error);
        res.status(500).json({ message: "Errore del server durante il salvataggio.", error: error.message });
    }
});
*/
router.post('/registrazioni', verifyToken, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { datiDocumento, scrittura, iva, partiteDaChiudere } = req.body;

    if (!datiDocumento || !datiDocumento.id_funzione_contabile || !scrittura || !Array.isArray(scrittura) || scrittura.length === 0) {
        return res.status(400).json({ success: false, message: "Dati di registrazione incompleti. La funzione contabile è obbligatoria." });
    }

    try {
        let nextProtocollo;

        await knex.transaction(async (trx) => {
            // --- 1. PREPARAZIONE DATI E PROTOCOLLO ---
            const funzioneDettagli = await trx('sc_funzioni_contabili')
                .where('id', datiDocumento.id_funzione_contabile)
                .select('tipo_funzione', 'categoria', 'gestioni_abbinate')
                .first();

            if (!funzioneDettagli) {
                throw new Error('Funzione contabile non trovata o non valida.');
            }

            const lastProto = await trx('sc_registrazioni_testata')
                .where('id_ditta', id_ditta)
                .max('numero_protocollo as max_protocollo')
                .first();

            nextProtocollo = (lastProto.max_protocollo || 0) + 1;

            // --- 2. INSERIMENTO TESTATA E RIGHE CONTABILI ---
            const [idTestata] = await trx('sc_registrazioni_testata').insert({
                id_ditta,
                id_utente,
                numero_protocollo: nextProtocollo,
                data_registrazione: datiDocumento.data_registrazione,
                data_documento: datiDocumento.data_documento || null,
                numero_documento: datiDocumento.numero_documento || null,
                id_ditte: datiDocumento.id_anagrafica || null, // Nota: il nome colonna 'id_ditte' è corretto secondo lo schema fornito
                totale_documento: datiDocumento.totale_documento || 0,
                descrizione_testata: datiDocumento.descrizione
            });
            
            const righeDaInserire = scrittura.map(riga => ({
                id_testata: idTestata,
                id_conto: riga.id_conto,
                descrizione_riga: riga.descrizione,
                importo_dare: riga.importo_dare || 0,
                importo_avere: riga.importo_avere || 0,
            }));
            await trx('sc_registrazioni_righe').insert(righeDaInserire);

            // --- 3. GESTIONE PARTITE APERTE ---

            // CASO A: CHIUSURA DI PARTITE ESISTENTI
            if (funzioneDettagli.tipo_funzione === 'Finanziaria' && (funzioneDettagli.gestioni_abbinate || '').includes('E') && partiteDaChiudere && partiteDaChiudere.length > 0) {
                
                await trx('sc_partite_aperte')
                    .whereIn('id', partiteDaChiudere)
                    .update({ stato: 'CHIUSA' });
                
                const anagraficaInfo = await trx('ditte').where('id', datiDocumento.id_anagrafica).first();
                const tipoMovimentoChiusura = anagraficaInfo.id_sottoconto_cliente ? 'Chiusura_Credito' : 'Chiusura_Debito';
                const rigaAnagrafica = scrittura.find(r => r.id_conto === anagraficaInfo.id_sottoconto_cliente || r.id_conto === anagraficaInfo.id_sottoconto_fornitore);

                await trx('sc_partite_aperte').insert({
                    id_ditta,
                    // <span style="color:red;">// CORREZIONE: il nome colonna corretto è 'id_ditta_anagrafica'</span>
                    id_ditta_anagrafica: datiDocumento.id_anagrafica,
                    id_registrazione_testata: idTestata,
                    data_registrazione: datiDocumento.data_registrazione,
                    data_scadenza: datiDocumento.data_registrazione || null,
                    importo: datiDocumento.totale_documento,
                    stato: 'CHIUSA',
                    data_documento: datiDocumento.data_documento || null,

                    numero_documento: datiDocumento.numero_documento || null,
                    id_sottoconto: rigaAnagrafica ? rigaAnagrafica.id_conto : null,
                    tipo_movimento: tipoMovimentoChiusura
                });

            // CASO B: APERTURA DI UNA NUOVA PARTITA (es. Fattura)
          //  } else if (funzioneDettagli.tipo_funzione === 'Finanziaria' && datiDocumento.id_anagrafica) {
          } else if (funzioneDettagli.tipo_funzione === 'Finanziaria' && datiDocumento.id_anagrafica && !(funzioneDettagli.categoria || '').toLowerCase().includes('corrispettivi')) {
  
              const categoria = (funzioneDettagli.categoria || '').toLowerCase();
                let tipo_movimento = null;
                
                if (categoria.includes('acquist')) tipo_movimento = 'Apertura_Debito';
                else if (categoria.includes('vendit')) tipo_movimento = 'Apertura_Credito';
                
                if (tipo_movimento) {
                    const anagraficaInfo = await trx('ditte').where('id', datiDocumento.id_anagrafica).first();
                    const idSottocontoCorretto = tipo_movimento === 'Apertura_Credito' ? anagraficaInfo.id_sottoconto_cliente : anagraficaInfo.id_sottoconto_fornitore;
                    
                    await trx('sc_partite_aperte').insert({
                        id_ditta,
                        id_registrazione_testata: idTestata,
                        data_registrazione: datiDocumento.data_registrazione,
                        id_ditta_anagrafica: datiDocumento.id_anagrafica,
                        id_anagrafica: datiDocumento.id_anagrafica,
                        id_sottoconto: idSottocontoCorretto,
                        numero_documento: datiDocumento.numero_documento || null,
                        data_documento: datiDocumento.data_documento || null,
                        tipo_movimento: tipo_movimento,
                        importo: datiDocumento.totale_documento,
                        stato: 'APERTA',
                        data_scadenza: datiDocumento.data_scadenza || datiDocumento.data_documento || null,
                    });
                }
            }

            // --- 4. GESTIONE IVA ---
            let tipoRegistroIva = null;
            const categoriaIVA = (funzioneDettagli.categoria || '').toLowerCase();
            if (categoriaIVA.includes('acquist')) {
                tipoRegistroIva = 'Acquisti';
            } else if (categoriaIVA.includes('vendit')) {
                tipoRegistroIva = 'Vendite';
            }
            
            const righeIvaTemplate = scrittura.filter(r => r.descrizione.toLowerCase().includes('iva'));

            if (iva && Array.isArray(iva) && iva.length > 0) {
                if (tipoRegistroIva) {
                    for (const rigaIva of iva) {
                        if (rigaIva.imposta > 0) {
                            const templateRigaIva = righeIvaTemplate[0];
                            if (!templateRigaIva) {
                                throw new Error("Logica IVA inconsistente: riga IVA presente nei totali ma non nel template della scrittura.");
                            }
                            
                            // <span style="color:red;">// CORREZIONE: Rimosso .returning('id') per compatibilità con MySQL</span>
                            const [idRigaIvaInserita] = await trx('sc_registrazioni_righe').insert({
                                id_testata: idTestata,
                                id_conto: templateRigaIva.id_conto,
                                descrizione_riga: templateRigaIva.descrizione,
                                importo_dare: templateRigaIva.importo_dare > 0 ? rigaIva.imposta : 0,
                                importo_avere: templateRigaIva.importo_avere > 0 ? rigaIva.imposta : 0,
                            });

                            const codiceIva = await trx('iva_contabili').where('id', rigaIva.id_codice_iva).first();

                            await trx('sc_registri_iva').insert({
                                id_riga_registrazione: idRigaIvaInserita,
                                tipo_registro: tipoRegistroIva,
                                data_documento: datiDocumento.data_documento,
                                numero_documento: datiDocumento.numero_documento,
                                id_anagrafica: datiDocumento.id_anagrafica || null,
                                imponibile: rigaIva.imponibile,
                                aliquota_iva: codiceIva ? codiceIva.aliquota : 0,
                                importo_iva: rigaIva.imposta
                            });
                        }
                    }
                }
            }

            // --- 5. LOG AZIONE ---
            await trx('log_azioni').insert({
                id_utente, id_ditta, azione: 'Creazione Registrazione Contabile',
                dettagli: `ID Testata: ${idTestata}, Funzione: ${datiDocumento.id_funzione_contabile}`
            });
        });

        res.status(201).json({ 
            success: true,
            message: `Registrazione salvata con protocollo N. ${nextProtocollo} del ${new Date(datiDocumento.data_registrazione).toLocaleDateString('it-IT')}`,
            numero_protocollo: nextProtocollo,
            data_registrazione: datiDocumento.data_registrazione
        });

    } catch (error) {
        console.error("Errore durante il salvataggio della registrazione:", error);
        res.status(500).json({ success: false, message: "Errore del server durante il salvataggio.", error: error.message });
    }
});
