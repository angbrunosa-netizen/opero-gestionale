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
module.exports = router;

