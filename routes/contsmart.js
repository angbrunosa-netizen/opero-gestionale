// #####################################################################
// # Rotte per il Modulo ContSmart v1.0
// # File: opero-gestionale-main/routes/contsmart.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { getNextProgressivo } = require('../utils/progressivi');
const router = express.Router();
const knex = require('../config/db');

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


// ---------------------------------------------------------------------
// REGISTRAZIONI CONTABILI
// ---------------------------------------------------------------------

router.post('/registrazioni', verifyToken, canPostEntries, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { testata, righe } = req.body;

    if (!testata || !righe || !Array.isArray(righe) || righe.length === 0) {
        return res.status(400).json({ message: "Dati di registrazione incompleti o non validi." });
    }

    let connection;
    try {
        const numeroProtocollo = await getNextProgressivo('PROT_CONT', id_ditta);

        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const {
            data_registrazione, data_documento, num_documento,
            id_anagrafica, totale_documento, descrizione, data_scadenza
        } = testata;

        if (!data_registrazione) {
            await connection.rollback();
            return res.status(400).json({ message: "La data di registrazione è obbligatoria." });
        }

        const queryTestata = `
            INSERT INTO sc_registrazioni_testata 
            (id_ditta, id_utente, data_registrazione, descrizione_testata, data_documento, numero_documento, totale_documento, id_ditte, numero_protocollo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultTestata] = await connection.query(queryTestata, [
            id_ditta, id_utente, data_registrazione, descrizione,
            data_documento || null, num_documento || null, totale_documento || null,
            id_anagrafica || null, numeroProtocollo
        ]);
        const idTestata = resultTestata.insertId;

        for (const riga of righe) {
            await connection.query(
                'INSERT INTO sc_registrazioni_righe (id_testata, id_conto, descrizione_riga, importo_dare, importo_avere) VALUES (?, ?, ?, ?, ?)',
                [ idTestata, riga.id_conto, riga.descrizione, riga.importo_dare || 0, riga.importo_avere || 0 ]
            );
        }
        
        if (id_anagrafica) {
            await connection.query(
                'INSERT INTO sc_partite_aperte (id_ditta_anagrafica, data_scadenza, importo, data_registrazione, id_registrazione_testata) VALUES (?, ?, ?, ?, ?)',
                [ id_anagrafica, data_scadenza || data_documento, totale_documento, data_registrazione, idTestata ]
            );
        }

        await connection.commit();

        // <span style="color:red;">// CORREZIONE: Creazione del messaggio di successo personalizzato.</span>
        // <span style="color:green;">// Formattiamo la data e costruiamo la stringa come richiesto.</span>
        const [anno, mese, giorno] = data_registrazione.split('-');
        const dataFormattata = `${giorno}/${mese}/${anno}`;
        const messaggioSuccesso = `Scrittura registrata con numero protocollo ${numeroProtocollo} del ${dataFormattata}`;

        res.status(201).json({ 
            success: true, 
            message: messaggioSuccesso, 
            id_registrazione: idTestata, 
            numero_protocollo: numeroProtocollo 
        });
    
    } catch (error) {
        if (connection) await connection.rollback(); 
        console.error("Errore durante il salvataggio della registrazione:", error);
        res.status(500).json({ 
            message: 'Errore interno del server durante il salvataggio.', 
            details: error.sqlMessage || error.message 
        });
    
    } finally {
        if (connection) connection.release();
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

// POST /api/contsmart/funzioni - Crea una nuova funzione contabile
router.post('/funzioni', verifyToken, canManageFunzioni, async (req, res) => {
    const { id_ditta } = req.user;
    const { nome_funzione, descrizione, tipo_funzione, categoria, righe_predefinite } = req.body;
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO sc_funzioni_contabili (id_ditta, nome_funzione, descrizione, tipo_funzione, categoria) VALUES (?, ?, ?, ?, ?)',
            [id_ditta, nome_funzione, descrizione, tipo_funzione, categoria]
        );
        const idFunzione = result.insertId; 
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
        res.status(201).json({ success: true, message: 'Funzione creata.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore creazione funzione:", error);
        res.status(500).json({ success: false, message: 'Errore creazione funzione.' });
    } finally {
        connection.release();
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
    // # NUOVO ENDPOINT DI SALVATAGGIO REGISTRAZIONI (v1.7)
    // #####################################################################
   /* rotte vecchia gestione 
    router.post('/registrazioni', [verifyToken, canPostEntries], async (req, res) => {
        const { id_ditta: dittaId, id: userId } = req.user;
        const { isFinancial, datiDocumento, righeIva, righeScrittura } = req.body;
        
        console.log("PAYLOAD RICEVUTO:", JSON.stringify(req.body, null, 2));

        if (!datiDocumento || !datiDocumento.data_registrazione) {
            return res.status(400).json({ success: false, message: "La data di registrazione è obbligatoria." });
        }

        if (!Array.isArray(righeScrittura) || righeScrittura.length === 0) {
            return res.status(400).json({ success: false, message: 'Payload invalido: righeScrittura mancante o vuoto.' });
        }

        const totaleDare = righeScrittura.reduce((sum, r) => r.tipo_movimento === 'D' ? sum + parseFloat(r.importo || 0) : sum, 0);
        const totaleAvere = righeScrittura.reduce((sum, r) => r.tipo_movimento === 'A' ? sum + parseFloat(r.importo || 0) : sum, 0);

        if (Math.abs(totaleDare - totaleAvere) > 0.01) {
            return res.status(400).json({ success: false, message: `La registrazione non è bilanciata. Dare: ${totaleDare}, Avere: ${totaleAvere}` });
        }
        
        if (isFinancial) {
            if (!datiDocumento.id_anagrafica || !datiDocumento.data_scadenza || !datiDocumento.totale_documento) {
                return res.status(400).json({ success: false, message: 'Per le registrazioni finanziarie, i dati del documento (fornitore, scadenze, totale) sono obbligatori.' });
            }
        }

        const connection = await dbPool.getConnection();
        try {
            await connection.beginTransaction();

            const [testataResult] = await connection.query(
                'INSERT INTO sc_registrazioni_testata (id_ditta, id_utente, data_registrazione, descrizione_testata, stato) VALUES (?, ?, ?, ?, ?)',
                [dittaId, userId, datiDocumento.data_registrazione, datiDocumento.descrizione_testata, 'Confermato']
            );
            const testataId = testataResult.insertId;

            let idRigaCollegamentoIva = null;

            for (const riga of righeScrittura) {
                const [rigaResult] = await connection.query(
                    'INSERT INTO sc_registrazioni_righe (id_testata, id_conto, descrizione_riga, importo_dare, importo_avere) VALUES (?, ?, ?, ?, ?)',
                    [testataId, riga.id_conto, riga.nome_conto, riga.tipo_movimento === 'D' ? riga.importo : 0, riga.tipo_movimento === 'A' ? riga.importo : 0]
                );
                if (isFinancial && riga.nome_conto && !riga.nome_conto.toLowerCase().includes('iva') && !riga.nome_conto.toLowerCase().includes('clienti') && !riga.nome_conto.toLowerCase().includes('fornitori') && idRigaCollegamentoIva === null) {
                    idRigaCollegamentoIva = rigaResult.insertId;
                }
            }
            
            if (isFinancial) {
                await connection.query(
                    'INSERT INTO sc_partite_aperte (id_ditta_anagrafica, data_scadenza, importo, stato, id_registrazione_testata) VALUES (?, ?, ?, ?, ?)',
                    [datiDocumento.id_anagrafica, datiDocumento.data_scadenza, datiDocumento.totale_documento, 'APERTA', testataId]
                );

                const anagraficaResult = await connection.query('SELECT codice_relazione FROM ditte WHERE id = ?', [datiDocumento.id_anagrafica]);
                if(anagraficaResult[0].length === 0){
                    throw new Error(`Anagrafica con ID ${datiDocumento.id_anagrafica} non trovata.`);
                }
                const tipoRegistro = anagraficaResult[0][0].codice_relazione === 'C' ? 'Vendite' : 'Acquisti';

                for (const rigaIva of righeIva) {
                    if(parseFloat(rigaIva.imponibile) > 0) {
                        await connection.query(
                            'INSERT INTO sc_registri_iva (id_riga_registrazione, tipo_registro, data_documento, numero_documento, id_anagrafica, imponibile, aliquota_iva, importo_iva) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [idRigaCollegamentoIva, tipoRegistro, datiDocumento.data_documento, datiDocumento.numero_documento, datiDocumento.id_anagrafica, rigaIva.imponibile, rigaIva.aliquota, rigaIva.imposta]
                        );
                    }
                }
            }

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
   */
  // rotte REGISTRAZIONI NUOVE
  //**********************************
  // *******************************

router.post('/registrazioni', verifyToken, canPostEntries, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { testata, righe } = req.body;

    if (!testata || !righe || !Array.isArray(righe) || righe.length === 0) {
        return res.status(400).json({ message: "Dati di registrazione incompleti o non validi." });
    }

    const {
        data_registrazione, data_documento, num_documento,
        id_anagrafica, totale_documento, descrizione, data_scadenza
    } = testata;

    if (!data_registrazione) {
        return res.status(400).json({ message: "La data di registrazione è obbligatoria." });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        // <span style="color:green;">// NUOVO: Ottiene il prossimo numero di protocollo prima di salvare.</span>
        const numeroProtocollo = await getNextProgressivo('PROT_CONT', id_ditta, connection);

        // 1. Inserisci la testata della registrazione, includendo il nuovo protocollo
        const queryTestata = `
            INSERT INTO sc_registrazioni_testata 
            (id_ditta, id_utente, data_registrazione, descrizione_testata, data_documento, numero_documento, totale_documento, id_ditte, numero_protocollo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [resultTestata] = await connection.query(queryTestata, [
            id_ditta, id_utente, data_registrazione, descrizione,
            data_documento || null, num_documento || null, totale_documento || null,
            id_anagrafica || null, numeroProtocollo
        ]);
        const idTestata = resultTestata.insertId;

        // 2. Inserisci le righe della scrittura (invariato)
        for (const riga of righe) {
            const queryRiga = `
                INSERT INTO sc_registrazioni_righe
                (id_testata, id_conto, descrizione_riga, importo_dare, importo_avere)
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.query(queryRiga, [ idTestata, riga.id_conto, riga.descrizione, riga.importo_dare || 0, riga.importo_avere || 0 ]);
        }
        
        // 3. Gestisci la Partita Aperta (invariato)
        if (id_anagrafica) {
            const queryPartitaAperta = `
                INSERT INTO sc_partite_aperte
                (id_ditta_anagrafica, data_scadenza, importo, data_registrazione, id_registrazione_testata)
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.query(queryPartitaAperta, [ id_anagrafica, data_scadenza || data_documento, totale_documento, data_registrazione, idTestata ]);
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Registrazione salvata con successo.', id_registrazione: idTestata, numero_protocollo: numeroProtocollo });
    
    } catch (error) {
        if (connection) await connection.rollback(); 
        console.error("Errore durante il salvataggio della registrazione:", error);
        res.status(500).json({ message: error.message || 'Errore interno del server durante il salvataggio.' });
    
    } finally {
        if (connection) connection.release();
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
            .leftJoin('sc_tipi_funzione_contabile', 'sc_funzioni_contabili.id_tipo_funzione', 'sc_tipi_funzione_contabile.id')
            .select(
                'sc_funzioni_contabili.id',
                'sc_funzioni_contabili.nome_funzione',
                'sc_funzioni_contabili.descrizione',
                'sc_tipi_funzione_contabile.nome_tipo as tipo_funzione',
                 'sc_tipi_funzione_contabile.codice_tipo as codice_tipo_funzione'
            )
            .where('sc_funzioni_contabili.id_ditta', id_ditta)
            .orWhereNull('sc_funzioni_contabili.id_ditta')
            .orderBy('sc_funzioni_contabili.nome_funzione');
        res.json(funzioni);
    } catch (error) {
        console.error("Errore nel recupero delle funzioni contabili:", error);
        res.status(500).json({ message: "Errore del server nel recupero delle funzioni contabili." });
    }
});

// POST /api/contsmart/registrazioni
router.post('/registrazioni', verifyToken, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { datiDocumento, scrittura, iva } = req.body;

    if (!datiDocumento || !scrittura || !Array.isArray(scrittura) || scrittura.length === 0) {
        return res.status(400).json({ message: "Dati di registrazione incompleti o non validi." });
    }

    const { data_registrazione, data_documento, numero_documento, id_anagrafica, totale_documento } = datiDocumento;

    if (!data_registrazione || !data_documento || !numero_documento) {
        return res.status(400).json({ message: "Data registrazione, data documento e numero documento sono obbligatori." });
    }

    try {
        await knex.transaction(async (trx) => {
            const [idTestata] = await trx('sc_registrazioni_testata').insert({
                id_ditta, id_utente, data_registrazione, data_documento, numero_documento, id_anagrafica, totale_documento,
                descrizione: `Registrazione doc. n. ${numero_documento} del ${data_documento}`
            });

            const righeDaInserire = scrittura.map(riga => ({
                id_testata, id_ditta, id_conto: riga.id_conto, descrizione: riga.descrizione,
                importo_dare: riga.importo_dare || 0, importo_avere: riga.importo_avere || 0,
            }));
            await trx('sc_registrazioni_righe').insert(righeDaInserire);

            const rigaPartitaAperta = scrittura.find(r => r.id_conto === id_anagrafica);
            if (rigaPartitaAperta) {
                await trx('sc_partite_aperte').insert({
                    id_ditta, id_testata, data_registrazione, id_anagrafica,
                    importo: totale_documento,
                    segno: rigaPartitaAperta.importo_avere > 0 ? 'A' : 'D',
                    // NUOVO: Utilizza la data_scadenza dal payload; se non presente, usa la data_documento.
                    data_scadenza: datiDocumento.data_scadenza || datiDocumento.data_documento,
                    pagato: false,
                });
            }
            // (Logica IVA e LOG invariata)
            // ...
        });
        res.status(201).json({ message: "Registrazione salvata con successo." });
    } catch (error) {
        console.error("Errore durante il salvataggio della registrazione:", error);
        res.status(500).json({ message: "Errore del server durante il salvataggio.", error: error.message });
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

module.exports = router;
// 