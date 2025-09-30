/**
 * @file opero/routes/catalogo.js
 * @description file di rotte per il modulo catalogo.
 * - SICUREZZA v7.0: implementa il controllo duale (permessi + livello)
 * ora funzionante grazie al token JWT arricchito.
 * @date 2025-09-29
 * @version 7.0 (definitiva e sicura)
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db'); 
const { verifyToken } = require('../utils/auth');
// --- DIPENDENZE PER IMPORT CSV ---
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Configurazione di Multer per gestire il file in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// #################################################
// #                API CATEGORIE                  #
// #################################################

/**
 * @function buildtree
 * @description funzione helper per convertire una lista piatta di categorie in una struttura ad albero.
 * @param {array} list - la lista di categorie dal database.
 * @returns {array} - un array di nodi radice con i figli annidati.
 */
const buildTree = (list) => {
    const map = {};
    const roots = [];

    // prima passata: crea una mappa di tutti i nodi per un accesso rapido.
    list.forEach(node => {
        map[node.id] = { ...node, children: [] };
    });

    // seconda passata: costruisce la gerarchia.
    list.forEach(node => {
        if (node.id_padre !== null && map[node.id_padre]) {
            // se è un figlio, lo aggiunge all'array 'children' del suo genitore.
            map[node.id_padre].children.push(map[node.id]);
        } else {
            // se è un nodo radice (non ha padre), lo aggiunge all'array principale.
            roots.push(map[node.id]);
        }
    });

    return roots;
};


// #################################################
// #           FUNZIONI HELPER PER CODIFICA        #
// #################################################

/**
 * formatta un numero in una stringa di 3 cifre con zeri iniziali.
 * es: 5 -> "005", 12 -> "012", 123 -> "123"
 * @param {number} num - il numero da formattare.
 * @returns {string} la stringa formattata.
 */
const formatProgressivo = (num) => num.toString().padStart(3, '0');

/**
 * calcola il percorso gerarchico di una categoria.
 * @param {object} trx - la transazione knex.
 * @param {number} parentId - l'id della categoria genitore.
 * @param {number} id_ditta - l'id della ditta.
 * @returns {Promise<Array<object>>} - un array di oggetti rappresentanti gli antenati.
 */
const getParentPath = async (trx, parentId, id_ditta) => {
    let path = [];
    let currentId = parentId;
    let depth = 0;
    while (currentId !== null && depth < 5) {
        const parent = await trx('ct_categorie').where({ id: currentId, id_ditta }).first('id', 'id_padre', 'progressivo');
        if (!parent) break;
        path.unshift(parent);
        currentId = parent.id_padre;
        depth++;
    }
    return path;
};

/**
 * aggiorna ricorsivamente i codici di tutte le sottocategorie di un genitore.
 * @param {object} trx - la transazione knex.
 * @param {number} parentId - l'id del genitore di cui aggiornare i figli.
 * @param {string} parentCode - il nuovo codice del genitore.
 * @param {number} id_ditta - l'id della ditta.
 */
const updateChildrenCodes = async (trx, parentId, parentCode, id_ditta) => {
    const children = await trx('ct_categorie').where({ id_padre: parentId, id_ditta });

    for (const child of children) {
        const newChildCode = `${parentCode}.${formatProgressivo(child.progressivo)}`;
        await trx('ct_categorie').where({ id: child.id }).update({ codice_categoria: newChildCode });
        await updateChildrenCodes(trx, child.id, newChildCode, id_ditta);
    }
};

// --- GET /api/catalogo/categorie (restituisce albero gerarchico) ---

// --- GET /categorie (ordinato per codice) ---
router.get('/categorie', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_VIEW')) {
        return res.status(403).json({ success: false, message: 'azione non autorizzata. permessi insufficienti.' });
    }
    try {
        const { id_ditta } = req.user;
        const flatCategories = await knex('ct_categorie')
            .where({ id_ditta })
            .orderBy('codice_categoria', 'asc'); // ## MODIFICA: ordinamento per codice

        const buildTree = (list) => {
            const map = {};
            const roots = [];
            list.forEach(node => {
                map[node.id] = { ...node, children: [] };
            });
            list.forEach(node => {
                if (node.id_padre !== null && map[node.id_padre]) {
                    map[node.id_padre].children.push(map[node.id]);
                } else {
                    roots.push(map[node.id]);
                }
            });
            return roots;
        };

        const categoryTree = buildTree(flatCategories);
        res.json(categoryTree);
    } catch (error) {
        console.error("errore nel recupero delle categorie:", error);
        res.status(500).json({ success: false, message: 'errore interno del server.' });
    }
});

// --- POST /api/catalogo/categorie (gestisce id_padre) ---
// --- POST /categorie (con logica di codifica) ---
router.post('/categorie', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'azione non autorizzata. permessi insufficienti.' });
    }

    const { nome_categoria, descrizione, id_padre } = req.body;
    const { id_ditta, id: id_utente } = req.user;

    if (!nome_categoria) {
        return res.status(400).json({ message: "il nome della categoria è obbligatorio." });
    }
    
    const trx = await knex.transaction();
    try {
        // 1. calcolo del nuovo codice
        let parentPath = [];
        if (id_padre) {
            parentPath = await getParentPath(trx, id_padre, id_ditta);
            if (parentPath.length >= 5) {
                await trx.rollback();
                return res.status(400).json({ message: 'raggiunto il limite massimo di 5 livelli di nidificazione.' });
            }
        }

        const lastSibling = await trx('ct_categorie')
            .where({ id_ditta, id_padre: id_padre || null })
            .orderBy('progressivo', 'desc')
            .first('progressivo');
        
        const nextProgressivo = (lastSibling ? lastSibling.progressivo : 0) + 1;

        if (nextProgressivo > 999) {
            await trx.rollback();
            return res.status(400).json({ message: 'raggiunto il limite di 999 elementi per questo livello.' });
        }

        const parentCode = parentPath.map(p => formatProgressivo(p.progressivo)).join('.');
        const newCode = parentCode ? `${parentCode}.${formatProgressivo(nextProgressivo)}` : formatProgressivo(nextProgressivo);

        // 2. inserimento nel db
        const [newId] = await trx('ct_categorie').insert({
            id_ditta,
            nome_categoria,
            descrizione,
            id_padre: id_padre || null,
            progressivo: nextProgressivo,
            codice_categoria: newCode
        });

        // 3. logging nella tabella 'log_azioni'
        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Creazione Categoria Catalogo',
            dettagli: `Creata categoria: ${newCode} - ${nome_categoria} (ID: ${newId})`
        });

        await trx.commit();
        res.status(201).json({ success: true, message: 'categoria creata con successo.', id: newId });
    } catch (error) {
        await trx.rollback();
        console.error("errore nella creazione della categoria:", error);
        res.status(500).json({ message: "errore interno del server." });
    }
});

// --- PATCH /api/catalogo/categorie/:id (gestisce id_padre) ---
// --- PATCH /categorie/:id (con logica di ricalcolo ricorsivo) ---
router.patch('/categorie/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'azione non autorizzata. permessi insufficienti.' });
    }
    
    const { id } = req.params;
    const { nome_categoria, descrizione, id_padre } = req.body;
    const { id_ditta, id: id_utente } = req.user;

    if (Number(id) === Number(id_padre)) {
        return res.status(400).json({ message: "una categoria non può essere figlia di se stessa." });
    }

    const trx = await knex.transaction();
    try {
        const currentCategory = await trx('ct_categorie').where({ id, id_ditta }).first();
        if (!currentCategory) {
            await trx.rollback();
            return res.status(404).json({ message: "categoria non trovata." });
        }

        const parentChanged = id_padre !== undefined && currentCategory.id_padre !== (id_padre || null);

        let updateData = { nome_categoria, descrizione };

        if (parentChanged) {
            // se il genitore cambia, dobbiamo ricalcolare il codice
            let newParentPath = [];
            if (id_padre) {
                newParentPath = await getParentPath(trx, id_padre, id_ditta);
                // controllo anti-ciclo e profondità
                const descendantIds = (await trx.raw('WITH RECURSIVE a AS (SELECT id FROM ct_categorie WHERE id = ? UNION ALL SELECT c.id FROM a JOIN ct_categorie c ON c.id_padre = a.id) SELECT id FROM a', [id])).rows.map(r => r.id);
                if (descendantIds.includes(id_padre)) {
                     await trx.rollback();
                     return res.status(400).json({ message: "impossibile spostare una categoria sotto uno dei suoi discendenti." });
                }
                if (newParentPath.length + descendantIds.length > 5) {
                    await trx.rollback();
                    return res.status(400).json({ message: 'lo spostamento supera il limite di 5 livelli di nidificazione.' });
                }
            }
            
            // calcolo il nuovo progressivo nella nuova "famiglia"
            const lastSibling = await trx('ct_categorie').where({ id_ditta, id_padre: id_padre || null }).orderBy('progressivo', 'desc').first('progressivo');
            const newProgressivo = (lastSibling ? lastSibling.progressivo : 0) + 1;

            const newParentCode = newParentPath.map(p => formatProgressivo(p.progressivo)).join('.');
            const newCode = newParentCode ? `${newParentCode}.${formatProgressivo(newProgressivo)}` : formatProgressivo(newProgressivo);

            updateData.id_padre = id_padre || null;
            updateData.progressivo = newProgressivo;
            updateData.codice_categoria = newCode;
            
            // aggiornamento ricorsivo dei figli
            await trx('ct_categorie').where({ id, id_ditta }).update(updateData);
            await updateChildrenCodes(trx, id, newCode, id_ditta);

        } else {
            // aggiornamento semplice senza cambio di gerarchia
            await trx('ct_categorie').where({ id, id_ditta }).update(updateData);
        }

        // logging
        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Aggiornamento Categoria Catalogo',
            dettagli: `Aggiornata categoria: ${updateData.codice_categoria || currentCategory.codice_categoria} - ${nome_categoria} (id: ${id})`
        });

        await trx.commit();
        res.status(200).json({ success: true, message: 'categoria aggiornata con successo.' });
    } catch (error) {
        await trx.rollback();
        console.error("errore nell'aggiornamento della categoria:", error);
        res.status(500).json({ message: "errore interno del server." });
    }
});



// --- DELETE /categorie/:id (logging aggiornato) ---
router.delete('/categorie/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'azione non autorizzata. permessi insufficienti.' });
    }

    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    
    const trx = await knex.transaction();
    try {
        const categoria = await trx('ct_categorie').where({ id, id_ditta }).first();
        if (!categoria) {
            await trx.rollback();
            return res.status(404).json({ message: "categoria non trovata o non appartenente alla ditta." });
        }

        await trx('ct_categorie').where({ id, id_ditta }).del();
        
        // logging
        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Eliminazione Categoria Catalogo',
            dettagli: `Eliminata categoria: ${categoria.codice_categoria} - ${categoria.nome_categoria} (id: ${id})`
        });

        await trx.commit();
        res.status(200).json({ success: true, message: 'categoria eliminata con successo.' });
    } catch (error) {
        await trx.rollback();
        console.error("errore nell'eliminazione della categoria:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ message: "impossibile eliminare: la categoria è utilizzata in altre parti del catalogo." });
        }
        res.status(500).json({ message: "errore interno del server." });
    }
});

// #################################################
// #           API UNITA' DI MISURA                #
// #################################################

// --- GET /api/catalogo/unita-misura ---
router.get('/unita-misura', verifyToken, async (req, res) => {
    // La visualizzazione è permessa a tutti gli utenti autenticati che accedono al modulo
    try {
        const { id_ditta } = req.user;
        const unita = await knex('ct_unita_misura').where({ id_ditta }).orderBy('sigla_um', 'asc');
        res.json({ success: true, data: unita });
    } catch (error) {
        console.error("Errore nel recupero delle unità di misura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- POST /api/catalogo/unita-misura ---
router.post('/unita-misura', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_UM_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }
    const { sigla, descrizione } = req.body;
    const { id_ditta, id: id_utente } = req.user;
    try {
        const [newId] = await knex('ct_unita_misura').insert({ id_ditta, sigla_um: sigla, descrizione });
        
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Creazione Unità di Misura',
            dettagli: `Creata nuova unità di misura: ${sigla} - ${descrizione}`
        });

        res.status(201).json({ success: true, id: newId });
    } catch (error) {
        console.error("Errore nella creazione dell'unità di misura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- PATCH /api/catalogo/unita-misura/:id ---
router.patch('/unita-misura/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_UM_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }
    const { id } = req.params;
    const { sigla, descrizione } = req.body;
    const { id_ditta, id: id_utente } = req.user;
    try {
        const updated = await knex('ct_unita_misura').where({ id, id_ditta }).update({ sigla_um: sigla, descrizione });
        if (updated === 0) {
            return res.status(404).json({ success: false, message: 'Unità di misura non trovata.' });
        }
        
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Modifica Unità di Misura',
            dettagli: `Modificata unità di misura ID ${id}: ${sigla} - ${descrizione}`
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Errore nella modifica dell'unità di misura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- DELETE /api/catalogo/unita-misura/:id ---
router.delete('/unita-misura/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_UM_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }
    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    try {
        const deleted = await knex('ct_unita_misura').where({ id, id_ditta }).del();
        if (deleted === 0) {
            return res.status(404).json({ success: false, message: 'Unità di misura non trovata.' });
        }

        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Eliminazione Unità di Misura',
            dettagli: `Eliminata unità di misura ID ${id}`
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Errore nell'eliminazione dell'unità di misura:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});



// #################################################
// #              API STATI ENTITA'                #
// #################################################
router.get('/stati-entita', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    try {
        const stati = await knex('ct_stati_entita').select('*');
        res.json({ success: true, data: stati });
    } catch (error) {
        console.error("Errore recupero stati entità:", error);
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});

router.post('/stati-entita', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_STATI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { codice, descrizione, visibilita } = req.body;
    const { id_ditta, id: id_utente } = req.user; // id_ditta non è usato ma lo teniamo per coerenza
    try {
        const [newId] = await knex('ct_stati_entita').insert({ codice, descrizione, visibilita });
        await knex('log_azioni').insert({ id_utente, id_ditta, azione: 'Creazione Stato Entità', dettagli: `Creato stato: ${codice} - ${descrizione}` });
        res.status(201).json({ success: true, id: newId });
    } catch (error) {
        console.error("Errore creazione stato entità:", error);
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});

router.patch('/stati-entita/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_STATI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id } = req.params;
    const { descrizione, visibilita } = req.body;
    const { id_ditta, id: id_utente } = req.user;
    try {
        await knex('ct_stati_entita').where({ id }).update({ descrizione, visibilita });
        await knex('log_azioni').insert({ id_utente, id_ditta, azione: 'Modifica Stato Entità', dettagli: `Modificato stato ID: ${id}` });
        res.status(200).json({ success: true, message: 'Stato aggiornato.' });
    } catch (error) {
        console.error("Errore modifica stato entità:", error);
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});

router.delete('/stati-entita/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_STATI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    try {
        await knex('ct_stati_entita').where({ id }).del();
        await knex('log_azioni').insert({ id_utente, id_ditta, azione: 'Eliminazione Stato Entità', dettagli: `Eliminato stato ID: ${id}` });
        res.status(200).json({ success: true, message: 'Stato eliminato.' });
    } catch (error) {
        console.error("Errore eliminazione stato entità:", error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Impossibile eliminare lo stato perché è attualmente in uso da una o più entità del catalogo." });
        }
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});
// Altre API per STATI ENTITA' (POST, PATCH, DELETE)...


// #################################################
// #           API ANAGRAFICA CATALOGO             #
// #################################################

// --- GET /api/catalogo/entita ---
router.get('/entita', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id_ditta } = req.user;
    const { includeArchived } = req.query; // Legge il parametro dalla querystring

    try {
        let query = knex('ct_catalogo as cat')
            .leftJoin('ct_categorie as c', 'cat.id_categoria', 'c.id')
            .leftJoin('ct_unita_misura as um', 'cat.id_unita_misura', 'um.id')
            .leftJoin('iva_contabili as iva', 'cat.id_aliquota_iva', 'iva.id')
            .leftJoin('ct_stati_entita as se', 'cat.id_stato_entita', 'se.id')
            .where('cat.id_ditta', id_ditta)
            .select(
                'cat.*',
                'c.nome_categoria',
                'um.sigla_um',
                'iva.descrizione as descrizione_iva',
                'se.descrizione as stato_entita',
                'se.codice as codice_stato'
            );

        if (includeArchived !== 'true') {
            const statoEliminato = await knex('ct_stati_entita').where('codice', 'DEL').first();
            if (statoEliminato) {
                query = query.andWhere('cat.id_stato_entita', '!=', statoEliminato.id);
            }
        }

        const entita = await query;
        res.json({ success: true, data: entita });

    } catch (error) {
        console.error("Errore nel recupero del catalogo:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- POST /api/catalogo/entita ---
router.post('/entita', verifyToken, async (req, res) => {
    // ... implementazione esistente
     res.status(501).send("Not Implemented Yet");
});

// --- PATCH /api/catalogo/entita/:id ---
router.patch('/entita/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    const dataToUpdate = req.body;

    const trx = await knex.transaction();
    try {
        const entita = await trx('ct_catalogo').where({ id, id_ditta }).first();
        if (!entita) {
            await trx.rollback();
            return res.status(404).json({ message: "Entità non trovata." });
        }
        
        const statoEliminato = await trx('ct_stati_entita').where('codice', 'DEL').first();
        if (entita.id_stato_entita === statoEliminato.id) {
            await trx.rollback();
            return res.status(403).json({ message: "Impossibile modificare un'entità archiviata." });
        }

        await trx('ct_catalogo').where({ id, id_ditta }).update(dataToUpdate);

        await trx('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Modifica Entità Catalogo',
            dettagli: `Modificata entità: ${entita.codice_entita} (ID: ${id})`
        });

        await trx.commit();
        res.status(200).json({ success: true, message: 'Entità aggiornata con successo.' });
    } catch (error) {
        await trx.rollback();
        console.error("Errore modifica entità:", error);
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});

// #################################################
// #           API IMPORTAZIONE CSV                #
// #################################################

router.post('/import-csv', verifyToken, upload.single('csvFile'), async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_IMPORT_CSV')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nessun file CSV fornito.' });
    }

    const { id_ditta, id: id_utente } = req.user;
    const results = [];
    const errors = [];
    let rowCounter = 0;

    const readableStream = Readable.from(req.file.buffer.toString('utf8'));

    readableStream
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
            rowCounter++;
            results.push({ ...data, originalRow: rowCounter });
        })
        .on('end', async () => {
            const trx = await knex.transaction();
            try {
                const defaultCategory = await trx('ct_categorie').where({ id_ditta }).orderBy('id', 'asc').first();
                const allIva = await trx('iva_contabili').where({ id_ditta });
                const statoAttivo = await trx('ct_stati_entita').where('codice', 'ATT').first();

                if (!statoAttivo) {
                    throw new Error("Stato 'Attivo' non configurato nel sistema.");
                }

                let entitaToInsert = [];

                for (const row of results) {
                    if (!row.codice_entita || !row.descrizione) {
                        errors.push({ row: row.originalRow, error: "Campi 'codice_entita' e 'descrizione' sono obbligatori." });
                        continue;
                    }
                    
                    let categoryId = defaultCategory ? defaultCategory.id : null;
                    if (row.codice_categoria) {
                        const foundCategory = await trx('ct_categorie').where({ codice_categoria: row.codice_categoria, id_ditta }).first();
                        if (foundCategory) {
                            categoryId = foundCategory.id;
                        }
                    }

                    let ivaId = null;
                    if (row.codice_iva) {
                        const foundIva = allIva.find(iva => iva.codice === row.codice_iva);
                        if (foundIva) {
                            ivaId = foundIva.id;
                        }
                    }

                    // #################################################################
                    // ## CORREZIONE: Allineamento ai campi reali del database.       ##
                    // ## - Rimosso 'prezzo_acquisto'.                              ##
                    // ## - Mappato 'prezzo_vendita' su 'prezzo_vendita_1'.         ##
                    // #################################################################
                    entitaToInsert.push({
                        id_ditta,
                        codice_entita: row.codice_entita,
                        descrizione: row.descrizione,
                        id_categoria: categoryId,
                        id_aliquota_iva: ivaId,
                        prezzo_vendita_1: parseFloat(row.prezzo_vendita?.replace(',', '.')) || 0,
                        id_stato_entita: statoAttivo.id,
                        tipo_entita: 'bene',
                        gestito_a_magazzino: false
                    });
                }
                
                if (entitaToInsert.length > 0) {
                    await trx('ct_catalogo').insert(entitaToInsert);
                }

                await trx('log_azioni').insert({
                    id_utente,
                    id_ditta,
                    azione: 'Importazione CSV Catalogo',
                    dettagli: `Importate ${entitaToInsert.length} nuove entità. Errori: ${errors.length}.`
                });

                await trx.commit();
                
                res.status(200).json({
                    success: true,
                    message: `Importazione completata.`,
                    imported: entitaToInsert.length,
                    errors: errors.length,
                    errorDetails: errors
                });

            } catch (error) {
                await trx.rollback();
                console.error("Errore durante l'importazione CSV:", error);
                res.status(500).json({ 
                    success: false, 
                    message: "Errore interno del server durante l'importazione.",
                    error: error.message
                });
            }
        });
});

module.exports = router;



module.exports = router;

