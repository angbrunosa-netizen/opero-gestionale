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

/**
 * GET /api/vendite/trasportatori
 * Recupera l'anagrafica dei trasportatori per la ditta loggata.
 * Protetta da permesso VA_CLIENTI_VIEW.
 */
router.get('/trasportatori', verifyToken, checkPermission('VA_CLIENTI_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const trasportatori = await knex('va_trasportatori')
            .where({ id_ditta })
            .select('id', 'ragione_sociale', 'referente', 'telefono');
        res.json(trasportatori);
    } catch (error) {
        console.error("Errore nel recupero dei trasportatori:", error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

/**
 * POST /api/vendite/trasportatori
 * Crea un nuovo trasportatore.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.post('/trasportatori', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const [id] = await trx('va_trasportatori').insert({ ...req.body, id_ditta: req.user.id_ditta });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CREAZIONE',
                dettagli: `Creato trasportatore: ${req.body.ragione_sociale}`,
                //tabella_riferimento: 'va_trasportatori',
                //id_record_riferimento: id
            });
            res.status(201).json({ id });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});

/**
 * PUT /api/vendite/trasportatori/:id
 * Aggiorna un trasportatore esistente.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.put('/trasportatori/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const updated = await trx('va_trasportatori').where({ id: req.params.id, id_ditta: req.user.id_ditta }).update(req.body);
            if (!updated) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'MODIFICA',
                dettagli: `Modificato trasportatore: ${req.body.ragione_sociale}`,
                //tabella_riferimento: 'va_trasportatori',
                ////id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record aggiornato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
});

/**
 * DELETE /api/vendite/trasportatori/:id
 * Elimina un trasportatore.
 * Protetta da permesso VA_CLIENTI_MANAGE.
 */
router.delete('/trasportatori/:id', verifyToken, checkPermission('VA_CLIENTI_MANAGE'), async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const item = await trx('va_trasportatori').where({ id: req.params.id, id_ditta: req.user.id_ditta }).first();
            if (!item) return res.status(404).json({ message: 'Record non trovato.' });
            await trx('va_trasportatori').where({ id: req.params.id }).del();
            await trx('log_azioni').insert({
                id_utente: req.user.id_utente,
                id_ditta: req.user.id_ditta,
                azione: 'CANCELLAZIONE',
                dettagli: `Cancellato trasportatore: ${item.ragione_sociale}`,
                //tabella_riferimento: 'va_trasportatori',
                ////id_record_riferimento: req.params.id
            });
            res.json({ message: 'Record eliminato.' });
        });
    } catch (error) { res.status(500).json({ message: "Errore del server." }); }
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


module.exports = router;


