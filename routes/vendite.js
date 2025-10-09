const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { verifyToken, checkPermission } = require('../utils/auth');

// Funzione helper per costruire la struttura ad albero dalle categorie
const buildCategoryTree = (categories, parentId = null) => {
    const tree = [];
    categories
        .filter(category => category.id_padre === parentId)
        .forEach(category => {
            const children = buildCategoryTree(categories, category.id);
            if (children.length) {
                category.children = children;
            }
            tree.push(category);
        });
    return tree;
};

// --- GESTIONE CATEGORIE CLIENTI ---

/**
 * GET /api/vendite/categorie
 * Recupera tutte le categorie clienti per la ditta loggata, strutturate ad albero.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/categorie', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const categories = await knex('va_categorie_clienti')
            .where({ id_ditta })
            .select('id', 'nome_categoria', 'descrizione', 'codice_categoria', 'id_padre');
        
        const categoryTree = buildCategoryTree(categories);
        res.json(categoryTree);
    } catch (error) {
        console.error("Errore nel recupero delle categorie clienti:", error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

/**
 * POST /api/vendite/categorie
 * Crea una nuova categoria cliente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.post('/categorie', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id_ditta, id_utente } = req.user;
    const { codice_categoria, nome_categoria, descrizione, id_padre } = req.body;

    try {
        await knex.transaction(async trx => {
            const [newId] = await trx('va_categorie_clienti').insert({
                id_ditta,
                codice_categoria,
                nome_categoria,
                descrizione,
                id_padre
            });

            await trx('log_azioni').insert({
               id_utente: req.user.id, // Corretto
                id_ditta,
                azione: 'CREAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha creato la categoria cliente: ${nome_categoria}`
                //tabella_riferimento: 'va_categorie_clienti',
               // id_record_riferimento: newId
            });

            res.status(201).json({ id: newId, message: 'Categoria creata con successo.' });
        });
    } catch (error) {
        console.error("Errore nella creazione della categoria cliente:", error);
        res.status(500).json({ message: "Errore del server durante la creazione della categoria." });
    }
});
/**
 * PUT /api/vendite/categorie/:id
 * Aggiorna una categoria cliente esistente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */

router.put('/categorie/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta, id_utente } = req.user;
    const { codice_categoria, nome_categoria, descrizione, id_padre } = req.body;

    try {
        await knex.transaction(async trx => {
            const updated = await trx('va_categorie_clienti')
                .where({ id, id_ditta })
                .update({
                    codice_categoria,
                    nome_categoria,
                    descrizione,
                    id_padre
                });

            if (updated === 0) {
                return res.status(404).json({ message: 'Categoria non trovata o non appartenente alla ditta.' });
            }

            await trx('log_azioni').insert({
                 id_utente: req.user.id, // Corretto
                id_ditta,
                azione: 'MODIFICA',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha modificato la categoria cliente: ${nome_categoria}`,
               // tabella_riferimento: 'va_categorie_clienti',
                //id_record_riferimento: id
            });

            res.json({ message: 'Categoria aggiornata con successo.' });
        });
    } catch (error) {
        console.error("Errore nell'aggiornamento della categoria cliente:", error);
        res.status(500).json({ message: "Errore del server durante l'aggiornamento." });
    }
});

/**
 * DELETE /api/vendite/categorie/:id
 * Elimina una categoria cliente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.delete('/categorie/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta, id_utente } = req.user;

    try {
        await knex.transaction(async trx => {
            const categoria = await trx('va_categorie_clienti').where({ id, id_ditta }).first();
            if (!categoria) {
                return res.status(404).json({ message: 'Categoria non trovata.' });
            }

            await trx('va_categorie_clienti').where({ id_padre: id }).update({ id_padre: null });
            
            const deleted = await trx('va_categorie_clienti').where({ id, id_ditta }).del();

            await trx('log_azioni').insert({
                 id_utente: req.user.id, // Corretto
                id_ditta,
                azione: 'CANCELLAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha eliminato la categoria cliente: ${categoria.nome_categoria}`,
                //tabella_riferimento: 'va_categorie_clienti',
                //id_record_riferimento: id
            });

            res.json({ message: 'Categoria eliminata con successo.' });
        });
    } catch (error) {
        console.error("Errore nell'eliminazione della categoria cliente:", error);
        res.status(500).json({ message: "Errore del server durante l'eliminazione." });
    }
});

// --- GESTIONE GRUPPI CLIENTI ---

/**
 * GET /api/vendite/gruppi
 * Recupera tutti i gruppi clienti per la ditta loggata.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/gruppi', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const gruppi = await knex('va_gruppi_clienti')
            .where({ id_ditta })
            .select('id', 'codice', 'descrizione');
        res.json(gruppi);
    } catch (error) {
        console.error("Errore nel recupero dei gruppi clienti:", error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

/**
 * POST /api/vendite/gruppi
 * Crea un nuovo gruppo cliente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */

// POST /api/vendite/gruppi
router.post('/gruppi', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const [id] = await trx('va_gruppi_clienti').insert({ ...req.body, id_ditta: req.user.id_ditta });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CREAZIONE',
                dettagli: `Creato gruppo clienti: ${req.body.descrizione}`,
                //tabella_riferimento: 'va_gruppi_clienti',
                //id_record_riferimento: id
            });
            res.status(201).json({ id });
        });
    } catch (error) {
        res.status(500).json({ message: "Errore del server." });
    }
});
/**
 * PUT /api/vendite/gruppi/:id
 * Aggiorna un gruppo cliente esistente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.put('/gruppi/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const updated = await trx('va_gruppi_clienti').where({ id: req.params.id, id_ditta: req.user.id_ditta }).update(req.body);
            if (!updated) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'MODIFICA',
                dettagli: `Modificato gruppo clienti: ${req.body.descrizione}`,
                //tabella_riferimento: 'va_gruppi_clienti',
                ////id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record aggiornato.' });
        });
    } catch (error) {
        res.status(500).json({ message: "Errore del server." });
    }
});

/**
 * DELETE /api/vendite/gruppi/:id
 * Elimina un gruppo cliente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.delete('/gruppi/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const item = await trx('va_gruppi_clienti').where({ id: req.params.id, id_ditta: req.user.id_ditta }).first();
            if (!item) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('va_gruppi_clienti').where({ id: req.params.id }).del();
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CANCELLAZIONE',
                dettagli: `Cancellato gruppo clienti: ${item.descrizione}`,
                //tabella_riferimento: 'va_gruppi_clienti',
                ////id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record eliminato.' });
        });
    } catch (error) {
        res.status(500).json({ message: "Errore del server." });
    }
});

// --- GESTIONE MATRICI SCONTI ---

/**
 * GET /api/vendite/matrici-sconti
 * Recupera tutte le testate delle matrici sconti per la ditta loggata.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/matrici-sconti', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    try {
        const matrici = await knex('va_matrici_sconti').where('id_ditta', req.user.id_ditta);
        res.json(matrici);
    } catch (error) {
        res.status(500).json({ message: 'Errore recupero matrici', error: error.message });
    }
});

router.post('/matrici-sconti', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { codice, descrizione } = req.body;
    let newId;
    try {
        await knex.transaction(async trx => {
            const [insertedId] = await trx('va_matrici_sconti').insert({ codice, descrizione, id_ditta: req.user.id_ditta });
            newId = insertedId;
            await trx('log_azioni').insert({
                id_utente: req.user.id, id_ditta: req.user.id_ditta, azione: 'CREAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha creato la matrice sconti: ${descrizione}`
            });
        });
        res.status(201).json({ id: newId, message: 'Matrice creata' });
    } catch (error) {
        res.status(500).json({ message: 'Errore creazione matrice', error: error.message });
    }
});

/**
 * PUT /api/vendite/matrici-sconti/:id
 * Aggiorna una testata di matrice sconti.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.put('/matrici-sconti/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { codice, descrizione } = req.body;
    try {
        await knex.transaction(async trx => {
            const count = await trx('va_matrici_sconti').where({ id, id_ditta: req.user.id_ditta }).update({ codice, descrizione });
            if(count === 0) throw new Error('Matrice non trovata');
            await trx('log_azioni').insert({
                id_utente: req.user.id, id_ditta: req.user.id_ditta, azione: 'MODIFICA',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha modificato la matrice sconti ID: ${id}`
            });
        });
        res.json({ message: 'Matrice aggiornata' });
    } catch (error) {
        res.status(error.message === 'Matrice non trovata' ? 404 : 500).json({ message: error.message });
    }
});

router.delete('/matrici-sconti/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    try {
        await knex.transaction(async trx => {
            const toDelete = await trx('va_matrici_sconti').where({ id, id_ditta: req.user.id_ditta }).first();
            if(!toDelete) throw new Error('Matrice non trovata');
            await trx('va_matrici_sconti_righe').where({ id_matrice: id }).del();
            await trx('va_matrici_sconti').where({ id }).del();
            await trx('log_azioni').insert({
                id_utente: req.user.id, id_ditta: req.user.id_ditta, azione: 'ELIMINAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha eliminato la matrice sconti: ${toDelete.descrizione}`
            });
        });
        res.json({ message: 'Matrice eliminata' });
    } catch (error) {
        res.status(error.message === 'Matrice non trovata' ? 404 : 500).json({ message: error.message });
    }
});

// --- GESTIONE RIGHE MATRICI SCONTI ---

/**
 * GET /api/vendite/matrici-sconti/:idMatrice/righe
 * Recupera tutte le righe di una specifica matrice sconti.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */

router.get('/matrici-sconti/:idMatrice/righe', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { idMatrice } = req.params;
    try {
        // Verifica che la matrice appartenga alla ditta dell'utente
        const matrice = await knex('va_matrici_sconti').where({ id: idMatrice, id_ditta: req.user.id_ditta }).first();
        if (!matrice) {
            return res.status(404).json({ message: 'Matrice non trovata.' });
        }
        const righe = await knex('va_matrici_sconti_righe').where({ id_matrice: idMatrice });
        res.json(righe);
    } catch (error) {
        res.status(500).json({ message: 'Errore recupero righe', error: error.message });
    }
});

router.post('/matrici-sconti/:idMatrice/righe/salva-tutto', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { idMatrice } = req.params;
    const { righe } = req.body; // Array di oggetti riga
    try {
        await knex.transaction(async trx => {
            const matrice = await trx('va_matrici_sconti').where({ id: idMatrice, id_ditta: req.user.id_ditta }).first();
            if (!matrice) throw new Error('Matrice non trovata');
            
            await trx('va_matrici_sconti_righe').where({ id_matrice: idMatrice }).del();
            
            if (righe && righe.length > 0) {
                const righeToInsert = righe.map(r => ({ id_matrice: idMatrice, ...r }));
                await trx('va_matrici_sconti_righe').insert(righeToInsert);
            }
            
            await trx('log_azioni').insert({
                id_utente: req.user.id, id_ditta: req.user.id_ditta, azione: 'MODIFICA',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha modificato le righe della matrice sconti: ${matrice.descrizione}`
            });
        });
        res.json({ message: 'Righe salvate con successo' });
    } catch (error) {
        res.status(error.message === 'Matrice non trovata' ? 404 : 500).json({ message: error.message });
    }
});


// --- GESTIONE TRASPORTATORI ---

// #####################################################################
// # REFACTORED: Gestione Anagrafica Trasportatori
// #####################################################################

/**
 * @route   GET /api/vendite/fornitori-selezionabili
 * @desc    NUOVA: Ottiene un elenco di anagrafiche (fornitori) che possono essere designate come trasportatori.
 * @access  Private (Permesso: VA_CLIENTI_MANAGE)
 */
// ####################################################################
// ### NUOVA API - FORNITORI SELEZIONABILI COME TRASPORTATORI       ###
// ####################################################################
/**
 * GET /api/vendite/fornitori-selezionabili
 * Recupera un elenco di anagrafiche (fornitori o esterni) che possono essere
 * configurate come trasportatori.
 * Restituisce i dati formattati per i componenti di selezione (ID, name).
 */
router.get('/fornitori-selezionabili', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const ditteSelezionabili = await knex('ditte')
            .where({ id_ditta_proprietaria: id_ditta })
            .whereIn('codice_relazione', ['F', 'E'])
            .select('id', 'ragione_sociale') // Il frontend mapperà 'ragione_sociale' in 'name'
            .orderBy('ragione_sociale', 'asc');
        
        res.json(ditteSelezionabili);
    } catch (error) {
        console.error("Errore nel recupero delle anagrafiche per trasportatori:", error);
        res.status(500).json({ message: "Errore del server." });
    }
});



// ####################################################################
// ### API ESISTENTE MODIFICATA - ELENCO TRASPORTATORI              ###
// ####################################################################
/**
 * GET /api/vendite/trasportatori
 * Recupera l'elenco dei trasportatori configurati per la ditta corrente.
 * La logica è stata aggiornata per riflettere la nuova struttura DB,
 * unendo va_trasportatori con ditte per ottenere i dettagli anagrafici.
 */
router.get('/trasportatori', verifyToken, checkPermission('VA_TRASPORTATORI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const trasportatori = await knex('va_trasportatori as vt')
            .join('ditte as d', 'vt.id_ditta', '=', 'd.id')
            .leftJoin('utenti as u', 'vt.id_utente_referente', '=', 'u.id')
            .where('vt.id_ditta_proprietaria', id_ditta)
            .select(
                'vt.id',
                'd.ragione_sociale',
                'd.tel1 as telefono',
                'vt.id_ditta',
                'vt.id_utente_referente',
                knex.raw("CONCAT(u.nome, ' ', u.cognome) as referente")
            )
            .orderBy('d.ragione_sociale', 'asc');
        
        res.json(trasportatori);

    } catch (error) {
        console.error(`Errore nel recupero dei trasportatori per la ditta ${id_ditta}:`, error);
        res.status(500).json({ message: "Errore interno del server." });
    }
});

/**
/**
 * POST /api/vendite/trasportatori
 * Crea un nuovo trasportatore associandolo a un'anagrafica esistente.
 */
router.post('/trasportatori', verifyToken, checkPermission('VA_TRASPORTATORI_MANAGE'), async (req, res) => {
    const { id_ditta: id_ditta_da_associare, id_utente_referente } = req.body;
    // ### CORREZIONE: Usiamo la stessa logica delle altre rotte per recuperare l'id della ditta ###
    const { id_ditta, id: id_utente } = req.user;

    if (!id_ditta_da_associare) {
        return res.status(400).json({ message: "L'anagrafica da associare è obbligatoria." });
    }

    try {
        // Controlla se il trasportatore esiste già per questa ditta
        const existing = await knex('va_trasportatori')
            .where({ 
                id_ditta_proprietaria: id_ditta,
                id_ditta: id_ditta_da_associare 
            })
            .first();

        if (existing) {
            return res.status(409).json({ message: "Questa anagrafica è già configurata come trasportatore." });
        }
        
        await knex.transaction(async (trx) => {
            const [newId] = await trx('va_trasportatori').insert({
                // ### CORREZIONE: Mappiamo esplicitamente la variabile corretta al campo del DB ###
                id_ditta_proprietaria: id_ditta,
                id_ditta: id_ditta_da_associare,
                id_utente_referente: id_utente_referente || null
            });
            
            await trx('log_azioni').insert({
                id_utente,
                id_ditta: id_ditta,
                azione: 'CREAZIONE_TRASPORTATORE',
                dettagli: `Creato nuovo trasportatore (ID: ${newId}) associato all'anagrafica ID: ${id_ditta_da_associare}.`
            });
        });

        res.status(201).json({ message: 'Trasportatore creato con successo' });

    } catch (error) {
        console.error("Errore nella creazione del trasportatore:", error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

/**
 * PUT /api/vendite/trasportatori/:id
 * Aggiorna il referente di un trasportatore.
 */
router.put('/trasportatori/:id', verifyToken, checkPermission('VA_TRASPORTATORI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta_proprietaria } = req.user;
    const { id_utente_referente } = req.body;

    try {
        const count = await knex('va_trasportatori')
            .where({ id, id_ditta_proprietaria })
            .update({
                id_utente_referente: id_utente_referente || null
            });

        if (count === 0) {
            return res.status(404).json({ message: 'Trasportatore non trovato.' });
        }
        
        await knex('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta: id_ditta_proprietaria,
            azione: 'AGGIORNAMENTO_TRASPORTATORE',
            dettagli: `Aggiornato trasportatore ID ${id}.`
        });

        res.json({ message: 'Trasportatore aggiornato con successo.' });

    } catch (error) {
        console.error(`Errore nell'aggiornamento del trasportatore ${id}:`, error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});


/**
 * DELETE /api/vendite/trasportatori/:id
 * Elimina un trasportatore. L'anagrafica sottostante non viene toccata.
 */
router.delete('/trasportatori/:id', verifyToken, checkPermission('VA_TRASPORTATORI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;

    try {
        const count = await knex('va_trasportatori')
            .where({ id, id_ditta_proprietaria: id_ditta })
            .del();

        if (count === 0) {
            return res.status(404).json({ message: 'Trasportatore non trovato o non appartenente alla tua ditta.' });
        }
        
        await knex('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta,
            azione: 'ELIMINAZIONE_TRASPORTATORE',
            dettagli: `Eliminato trasportatore ID: ${id}.`
        });

        res.status(200).json({ message: 'Trasportatore eliminato con successo.' });
    } catch (error) {
        console.error(`Errore durante l'eliminazione del trasportatore ${id}:`, error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});



// --- GESTIONE CONTRATTI ---

/**
 * GET /api/vendite/contratti
 * Recupera l'anagrafica dei contratti per la ditta loggata.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/contratti', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const contratti = await knex('va_contratti')
            .where({ id_ditta })
            .select('id', 'codice_contratto', 'descrizione', 'data_inizio', 'data_fine', 'file_url');
        res.json(contratti);
    } catch (error) {
        console.error("Errore nel recupero dei contratti:", error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

/**
 * POST /api/vendite/contratti
 * Crea un nuovo contratto.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.post('/contratti', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const [id] = await trx('va_contratti').insert({ ...req.body, id_ditta: req.user.id_ditta });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CREAZIONE',
                dettagli: `Creato contratto: ${req.body.descrizione}`,
                //tabella_riferimento: 'va_contratti',
                //id_record_riferimento: id
            });
            res.status(201).json({ id });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});


/**
 * PUT /api/vendite/contratti/:id
 * Aggiorna un contratto esistente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.put('/contratti/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const updated = await trx('va_contratti').where({ id: req.params.id, id_ditta: req.user.id_ditta }).update(req.body);
            if (!updated) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'MODIFICA',
                dettagli: `Modificato contratto: ${req.body.descrizione}`,
                //tabella_riferimento: 'va_contratti',
                ////id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record aggiornato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});


/**
 * DELETE /api/vendite/contratti/:id
 * Elimina un contratto.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.delete('/contratti/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const item = await trx('va_contratti').where({ id: req.params.id, id_ditta: req.user.id_ditta }).first();
            if (!item) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('va_contratti').where({ id: req.params.id }).del();
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CANCELLAZIONE',
                dettagli: `Cancellato contratto: ${item.descrizione}`,
                //tabella_riferimento: 'va_contratti',
                //id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record eliminato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});


// --- GESTIONE PUNTI CONSEGNA ---

/**
 * GET /api/vendite/clienti/:idCliente/punti-consegna
 * Recupera tutti i punti di consegna per un cliente specifico.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/clienti/:idCliente/punti-consegna', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    try {
        const data = await knex('va_punti_consegna').where({ id_cliente: req.params.idCliente, id_ditta: req.user.id_ditta });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});


/**
 * POST /api/vendite/clienti/:idCliente/punti-consegna
 * Crea un nuovo punto di consegna per un cliente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.post('/clienti/:idCliente/punti-consegna', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const [id] = await trx('va_punti_consegna').insert({ ...req.body, id_cliente: req.params.idCliente, id_ditta: req.user.id_ditta });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CREAZIONE',
                dettagli: `Creato punto consegna: ${req.body.descrizione} per cliente ID ${req.params.idCliente}`,
                //tabella_riferimento: 'va_punti_consegna',
                id_record_riferimento: id
            });
            res.status(201).json({ id });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});

/**
 * PUT /api/vendite/punti-consegna/:id
 * Aggiorna un punto di consegna esistente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.put('/clienti/:idCliente/punti-consegna/:idPunto', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const updated = await trx('va_punti_consegna').where({ id: req.params.idPunto, id_cliente: req.params.idCliente, id_ditta: req.user.id_ditta }).update(req.body);
            if (!updated) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'MODIFICA',
                dettagli: `Modificato punto consegna: ${req.body.descrizione}`,
                //tabella_riferimento: 'va_punti_consegna',
                //id_record_riferimento: req.params.idPunto
            });
            res.json({ message: 'Record aggiornato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});


/**
 * DELETE /api/vendite/punti-consegna/:id
 * Elimina un punto di consegna.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.delete('/clienti/:idCliente/punti-consegna/:idPunto', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const item = await trx('va_punti_consegna').where({ id: req.params.idPunto, id_ditta: req.user.id_ditta }).first();
            if (!item) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('va_punti_consegna').where({ id: req.params.idPunto }).del();
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CANCELLAZIONE',
                dettagli: `Cancellato punto consegna: ${item.descrizione}`,
                //tabella_riferimento: 'va_punti_consegna',
                //id_record_riferimento: req.params.idPunto
            });
            res.json({ message: 'Record eliminato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});

// --- GESTIONE TIPI DOCUMENTO ---

// GET /api/vendite/tipi-documento - Recupera tutti i tipi di documento
router.get('/tipi-documento', verifyToken, checkPermission('VA_TIPI_DOC_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const tipiDocumento = await knex('va_tipi_documento').where({ id_ditta });
        res.json(tipiDocumento);
    } catch (error) {
        console.error("Errore nel recupero dei tipi documento:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
});

// POST /api/vendite/tipi-documento - Crea un nuovo tipo di documento
router.post('/tipi-documento', verifyToken, checkPermission('VA_TIPI_DOC_MANAGE'), async (req, res) => {
    const { id_ditta, id: id_utente, nome, cognome } = req.user;
    const { codice_doc, nome_documento, tipo, gen_mov, tipo_movimento, ditta_rif } = req.body;

    if (!codice_doc || !nome_documento) {
        return res.status(400).json({ message: 'Codice e Nome documento sono obbligatori.' });
    }

    try {
        await knex.transaction(async (trx) => {
            const [newId] = await trx('va_tipi_documento').insert({
                id_ditta,
                codice_doc,
                nome_documento,
                tipo,
                gen_mov,
                tipo_movimento: gen_mov === 'S' ? tipo_movimento : null,
                ditta_rif
            });

            await trx('log_azioni').insert({
                id_utente: req.user.id,
                id_ditta,
                azione: 'CREAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha creato il tipo documento: ${nome_documento} (${codice_doc})`
            });

            const newItem = await trx('va_tipi_documento').where({ id: newId }).first();
            res.status(201).json(newItem);
        });
    } catch (error) {
        console.error("Errore nella creazione del tipo documento:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Un tipo di documento con questo codice esiste già.' });
        }
        res.status(500).json({ message: "Errore interno del server." });
    }
});

// PUT /api/vendite/tipi-documento/:id - Aggiorna un tipo di documento
router.put('/tipi-documento/:id', verifyToken, checkPermission('VA_TIPI_DOC_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta, id: id_utente, nome, cognome } = req.user;
    const { codice_doc, nome_documento, tipo, gen_mov, tipo_movimento, ditta_rif } = req.body;

    try {
        await knex.transaction(async (trx) => {
            const updated = await trx('va_tipi_documento')
                .where({ id, id_ditta })
                .update({
                    codice_doc,
                    nome_documento,
                    tipo,
                    gen_mov,
                    tipo_movimento: gen_mov === 'S' ? tipo_movimento : null,
                    ditta_rif
                });
            
            if (updated === 0) {
                return res.status(404).json({ message: 'Tipo documento non trovato.' });
            }

            await trx('log_azioni').insert({
                id_utente: req.user.id,
                id_ditta,
                azione: 'MODIFICA',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha modificato il tipo documento ID: ${id}`
            });
            
            const updatedItem = await trx('va_tipi_documento').where({ id }).first();
            res.json(updatedItem);
        });
    } catch (error) {
        console.error("Errore nell'aggiornamento del tipo documento:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Un tipo di documento con questo codice esiste già.' });
        }
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});

// DELETE /api/vendite/tipi-documento/:id - Elimina un tipo di documento
router.delete('/tipi-documento/:id', verifyToken, checkPermission('VA_TIPI_DOC_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta, id: id_utente, nome, cognome } = req.user;

    try {
        await knex.transaction(async (trx) => {
            const itemToDelete = await trx('va_tipi_documento').where({ id, id_ditta }).first();

            if (!itemToDelete) {
                return res.status(404).json({ message: 'Tipo documento non trovato.' });
            }

            await trx('va_tipi_documento').where({ id, id_ditta }).del();

            await trx('log_azioni').insert({
                id_utente: req.user.id,
                id_ditta,
                azione: 'ELIMINAZIONE',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha eliminato il tipo documento: ${itemToDelete.nome_documento}`
            });
            
            res.status(200).json({ message: 'Tipo documento eliminato con successo.' });
        });
    } catch (error) {
        console.error("Errore nell'eliminazione del tipo documento:", error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});

// --- GESTIONE ANAGRAFICA CLIENTI ---

// GET /api/vendite/clienti - Recupera la lista dei clienti
router.get('/clienti', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const clienti = await knex('ditte as d')
            .leftJoin('va_clienti_anagrafica as vca', 'd.id', 'vca.id_ditta')
            .where('d.id_ditta_proprietaria', id_ditta)
            .whereIn('d.codice_relazione', ['C', 'E'])
            .select(
                'd.id', 
                'd.ragione_sociale', 
                'd.p_iva', 
                'd.codice_fiscale',
                'd.citta',
                'd.provincia',
                'vca.stato'
            );
        res.json(clienti);
    } catch (error) {
        console.error("Errore nel recupero dei clienti:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
});

// GET /api/vendite/clienti/:id - Recupera i dettagli di un singolo cliente
router.get('/clienti/:id', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;

    try {
        const cliente = await knex('ditte as d')
            .leftJoin('va_clienti_anagrafica as vca', 'd.id', 'vca.id_ditta')
            .leftJoin('va_categorie_clienti as cat', 'vca.id_categoria_cliente', 'cat.id')
            .leftJoin('va_gruppi_clienti as grp', 'vca.id_gruppo_cliente', 'grp.id')
            .leftJoin('tipi_pagamento as tp', 'vca.id_tipo_pagamento', 'tp.id')
            .where('d.id', id)
            .andWhere('d.id_ditta_proprietaria', id_ditta)
            .select(
                'd.*', // Tutti i campi da ditte
                'vca.*', // Tutti i campi da va_clienti_anagrafica
                'cat.nome_categoria as nome_categoria_cliente',
                'grp.descrizione as descrizione_gruppo_cliente',
                'tp.descrizione as descrizione_tipo_pagamento'
            )
            .first();

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente non trovato.' });
        }
        res.json(cliente);
    } catch (error) {
        console.error("Errore nel recupero del dettaglio cliente:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
});


// PUT /api/vendite/clienti/:id - Aggiorna i dati del cliente
router.put('/clienti/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    const { id } = req.params;
    const { id_ditta } = req.user;
    const { ...allData } = req.body;

    try {
        await knex.transaction(async (trx) => {
            // Separa i dati per le due tabelle
            const ditteData = {
                ragione_sociale: allData.ragione_sociale,
                indirizzo: allData.indirizzo,
                citta: allData.citta,
                provincia: allData.provincia,
                cap: allData.cap,
                p_iva: allData.p_iva,
                codice_fiscale: allData.codice_fiscale,
                tel1: allData.tel1,
                email: allData.email,
                pec: allData.pec,
                sdi: allData.sdi,
            };

            const anagraficaData = {
                id_ditta: id,
                listino_cessione: allData.listino_cessione,
                listino_pubblico: allData.listino_pubblico,
                id_matrice_sconti: allData.id_matrice_sconti,
                riga_matrice_sconti: allData.riga_matrice_sconti,
                id_categoria_cliente: allData.id_categoria_cliente,
                id_gruppo_cliente: allData.id_gruppo_cliente,
                id_referente: allData.id_referente,
                id_agente: allData.id_agente,
                id_tipo_pagamento: allData.id_tipo_pagamento,
                stato: allData.stato,
                sito_web: allData.sito_web,
                pagina_facebook: allData.pagina_facebook,
                pagina_instagram: allData.pagina_instagram,
                url_link :allData.url_link,
                google_maps :allData.google_maps,
                concorrenti: allData.concorrenti,
                foto_url: allData.foto_url,
                fatturato_anno_pr:allData.fatturato_anno_pr,
                fatturato_anno_cr:allData.fatturato_anno_cr,
                id_contratto : allData.id_contratto,
                id_trasportatore_assegnato: allData.id_trasportatore_assegnato
                // ... aggiungi tutti gli altri campi di va_clienti_anagrafica
            };
            
            // Aggiorna la tabella ditte
            await trx('ditte').where({ id, id_ditta_proprietaria: id_ditta }).update(ditteData);

            // Controlla se esiste già un record in va_clienti_anagrafica
            const anagraficaExists = await trx('va_clienti_anagrafica').where({ id_ditta: id }).first();

            if (anagraficaExists) {
                // Aggiorna
                await trx('va_clienti_anagrafica').where({ id_ditta: id }).update(anagraficaData);
            } else {
                // Inserisci
                await trx('va_clienti_anagrafica').insert(anagraficaData);
            }

            await trx('log_azioni').insert({
                id_utente: req.user.id,
                id_ditta,
                azione: 'MODIFICA',
                dettagli: `L'utente ${req.user.nome} ${req.user.cognome} ha modificato l'anagrafica cliente ID: ${id}`
            });
            
            res.status(200).json({ message: 'Cliente aggiornato con successo.' });
        });
    } catch (error) {
        console.error("Errore nell'aggiornamento del cliente:", error);
        res.status(500).json({ message: "Errore interno del server." });
    }
});
module.exports = router;


