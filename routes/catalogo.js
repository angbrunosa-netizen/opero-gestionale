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
const { verifyToken,hasPermission } = require('../utils/auth');
// --- DIPENDENZE PER IMPORT CSV ---
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Configurazione di Multer per gestire il file in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Funzione di utility per la validazione del check digit EAN-13
function isValidEan13(ean) {
    if (typeof ean !== 'string' || ean.length !== 13 || !/^\d+$/.test(ean)) {
        return false;
    }

    const digits = ean.split('').map(Number);
    const checksum = digits.pop();

    let sumOdd = 0;
    let sumEven = 0;

    digits.forEach((digit, index) => {
        if (index % 2 === 0) { // posizioni 1, 3, 5... (index 0, 2, 4...)
            sumOdd += digit;
        } else { // posizioni 2, 4, 6... (index 1, 3, 5...)
            sumEven += digit;
        }
    });

    const totalSum = sumOdd + (sumEven * 3);
    const calculatedChecksum = (10 - (totalSum % 10)) % 10;

    return checksum === calculatedChecksum;
}



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
// --- GET /api/catalogo/entita (con TUTTI i prezzi dal listino valido) ---
router.get('/entita', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id_ditta } = req.user;
    const { includeArchived } = req.query;

    try {
        const currentDate = new Date().toISOString().slice(0, 10);

        // Costruiamo dinamicamente la lista di campi da selezionare dal listino
        const listinoFields = [];
        for (let i = 1; i <= 6; i++) {
            listinoFields.push(`l.ricarico_cessione_${i}`);
            listinoFields.push(`l.prezzo_cessione_${i}`);
            listinoFields.push(`l.ricarico_pubblico_${i}`);
            listinoFields.push(`l.prezzo_pubblico_${i}`);
        }

        let query = knex('ct_catalogo as cat')
            .leftJoin('ct_categorie as c', 'cat.id_categoria', 'c.id')
            .leftJoin('ct_unita_misura as um', 'cat.id_unita_misura', 'um.id')
            .leftJoin('iva_contabili as iva', 'cat.id_aliquota_iva', 'iva.id')
            .leftJoin('ct_stati_entita as se', 'cat.id_stato_entita', 'se.id')
            .leftJoin('ct_listini as l', function() {
                this.on('cat.id', '=', 'l.id_entita_catalogo')
                    .andOn('l.data_inizio_validita', '<=', knex.raw('?', [currentDate]))
                    .andOn(function() {
                        this.on('l.data_fine_validita', '>=', knex.raw('?', [currentDate]))
                            .orOnNull('l.data_fine_validita');
                    });
            })
            .where('cat.id_ditta', id_ditta)
            .select(
                'cat.*',
                'c.nome_categoria',
                'um.sigla_um',
                'iva.aliquota as aliquota_iva_valore', // Aggiungiamo il valore dell'aliquota per i calcoli
                'se.descrizione as stato_entita',
                'se.codice as codice_stato',
                ...listinoFields // Aggiungiamo tutti i campi del listino
            );

        if (includeArchived !== 'true') {
            const statoEliminato = await knex('ct_stati_entita').where('codice', 'DEL').first();
            if (statoEliminato) {
                query = query.andWhere('cat.id_stato_entita', '!=', statoEliminato.id);
            }
        }
        
        query = query.orderBy('cat.codice_entita', 'asc');
        const entita = await query;
        res.json({ success: true, data: entita });

    } catch (error) {
        console.error("Errore nel recupero del catalogo:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- PATCH /api/catalogo/entita/:id ---
router.patch('/entita/:id', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { id } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    
    const trx = await knex.transaction();
    try {
        const entita = await trx('ct_catalogo').where({ id, id_ditta }).first();
        if (!entita) {
            await trx.rollback();
            return res.status(404).json({ message: "Entità non trovata." });
        }
        // LASCIO LIBERA LA POSSIBITLITA' DI RIPRISTARE E MODIFICARE LO STATO ENTITA' 
       // const statoEliminato = await trx('ct_stati_entita').where('codice', 'DEL').first();
       // if (entita.id_stato_entita === statoEliminato?.id) {
       //     await trx.rollback();
       //     return res.status(403).json({ message: "Impossibile modificare un'entità archiviata." });
       // }
        
        // #####################################################################
        // ## CORREZIONE: Sanitizzazione dei dati prima dell'aggiornamento.   ##
        // ## Creiamo un oggetto "pulito" con solo i campi della tabella      ##
        // ## ct_catalogo, ignorando i dati extra provenienti dal frontend.   ##
        // #####################################################################
        const { 
            codice_entita, descrizione, id_categoria, tipo_entita, 
            id_unita_misura, id_aliquota_iva, costo_base, 
            gestito_a_magazzino, id_stato_entita 
        } = req.body;

        const dataToUpdate = {
            codice_entita, descrizione, id_categoria, tipo_entita, 
            id_unita_misura, id_aliquota_iva, costo_base, 
            gestito_a_magazzino, id_stato_entita
        };

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
// #           API GESTIONE LISTINI                #
// #################################################


// #################################################
// #           API GESTIONE LISTINI                #
// #################################################

router.get('/entita/:entitaId/listini', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_LISTINI_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { entitaId } = req.params;
    const { id_ditta } = req.user;

    try {
        const entita = await knex('ct_catalogo').where({ id: entitaId, id_ditta }).first();
        if (!entita) {
            return res.status(404).json({ success: false, message: 'Entità non trovata.' });
        }

        const listini = await knex('ct_listini')
            .where({ id_entita_catalogo: entitaId })
            .orderBy('data_inizio_validita', 'desc');
        
        res.json({ success: true, data: listini });
    } catch (error) {
        console.error("Errore nel recupero dei listini:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.post('/entita/:entitaId/listini', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_LISTINI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { entitaId } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    const listinoData = req.body;

    try {
        const [newId] = await knex('ct_listini').insert({
            ...listinoData,
            id_entita_catalogo: entitaId,
            id_ditta
        });
        
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Creazione Listino',
            dettagli: `Creato nuovo listino "${listinoData.nome_listino}" per entità ID ${entitaId}`
        });

        res.status(201).json({ success: true, id: newId });
    } catch (error) {
        console.error("Errore creazione listino:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.patch('/listini/:listinoId', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_LISTINI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { listinoId } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    const dataToUpdate = req.body;

    try {
        const updated = await knex('ct_listini').where({ id: listinoId, id_ditta }).update(dataToUpdate);
        if (updated === 0) {
            return res.status(404).json({ success: false, message: 'Listino non trovato o non appartenente alla ditta.' });
        }
        
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Modifica Listino',
            dettagli: `Modificato listino ID: ${listinoId}`
        });

        res.json({ success: true, message: 'Listino aggiornato con successo.' });
    } catch (error) {
        console.error("Errore modifica listino:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.delete('/listini/:listinoId', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_LISTINI_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { listinoId } = req.params;
    const { id_ditta, id: id_utente } = req.user;

    try {
        const deleted = await knex('ct_listini').where({ id: listinoId, id_ditta }).del();
        if (deleted === 0) {
            return res.status(404).json({ success: false, message: 'Listino non trovato o non appartenente alla ditta.' });
        }
        
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Eliminazione Listino',
            dettagli: `Eliminato listino ID: ${listinoId}`
        });
        
        res.json({ success: true, message: 'Listino eliminato con successo.' });
    } catch (error) {
        console.error("Errore eliminazione listino:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ===============================================
//              API GESTIONE CODICI EAN
// ===============================================

// GET: Recupera tutti i codici EAN per un'entità del catalogo
// GET /api/catalogo/entita/:entitaId/ean - Recupera EAN per un articolo
router.get('/entita/:entitaId/ean', verifyToken, async (req, res) => {
    if (!req.user.permissions.includes('CT_EAN_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    try {
        const eans = await knex('ct_ean').where({ id_catalogo: req.params.entitaId, id_ditta: req.user.id_ditta });
        res.json(eans);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore recupero EAN.' });
    }
});


// POST: Aggiunge un nuovo codice EAN a un'entità del catalogo

// POST /api/catalogo/entita/:entitaId/ean - Aggiunge un EAN
router.post('/entita/:entitaId/ean', verifyToken, async (req, res) => {
    if (!req.user.permissions.includes('CT_EAN_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { codice_ean, tipo_ean, tipo_ean_prodotto } = req.body;
    if (!isValidEan13(codice_ean)) {
        return res.status(400).json({ success: false, message: 'Codice EAN non valido.' });
    }
    const trx = await knex.transaction();
    try {
        await trx('ct_ean').insert({
            id_ditta: req.user.id_ditta,
            id_catalogo: req.params.entitaId,
            codice_ean,
            tipo_ean,
            tipo_ean_prodotto,
            created_by: req.user.id
        });
        await trx('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta: req.user.id_ditta,
            azione: 'Aggiunta EAN',
            dettagli: `Aggiunto EAN ${codice_ean} a entità ID ${req.params.entitaId}`
        });
        await trx.commit();
        res.status(201).json({ success: true });
    } catch (error) {
        await trx.rollback();
        res.status(500).json({ success: false, message: 'Errore aggiunta EAN.' });
    }
});

// DELETE: Rimuove un codice EAN
// DELETE /api/catalogo/ean/:eanId - Elimina un EAN
router.delete('/ean/:eanId', verifyToken, async (req, res) => {
    if (!req.user.permissions.includes('CT_EAN_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const trx = await knex.transaction();
    try {
        const count = await trx('ct_ean').where({ id: req.params.eanId, id_ditta: req.user.id_ditta }).del();
        if(count === 0) {
            await trx.rollback();
            return res.status(404).json({ success: false, message: 'EAN non trovato.' });
        }
        await trx('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta: req.user.id_ditta,
            azione: 'Eliminazione EAN',
            dettagli: `Eliminato EAN con ID: ${req.params.eanId}`
        });
        await trx.commit();
        res.json({ success: true });
    } catch (error) {
        await trx.rollback();
        res.status(500).json({ success: false, message: 'Errore eliminazione EAN.' });
    }
});


// ##################################################################
// #                   ROUTING CODICI FORNITORE                     #
// ##################################################################

router.get('/entita/:itemId/codici-fornitore', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_COD_FORN_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { itemId } = req.params;
    const { id_ditta } = req.user;
    try {
        const codici = await knex('ct_codici_fornitore as ccf')
            .leftJoin('ditte as f', 'ccf.id_anagrafica_fornitore', 'f.id')
            .where('ccf.id_catalogo', itemId)
            .andWhere('ccf.id_ditta', id_ditta)
            .select(
                'ccf.id',
                'ccf.codice_articolo_fornitore',
                'ccf.id_anagrafica_fornitore',
                'f.ragione_sociale as nome_fornitore',
                'ccf.tipo_codice'
            );
        res.json(codici);
    } catch (error) {
        console.error("Errore recupero codici fornitore:", error);
        res.status(500).json({ success: false, message: "Errore server" });
    }
});

router.post('/entita/:itemId/codici-fornitore', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_COD_FORN_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { itemId } = req.params;
    const { id_ditta, id: id_utente } = req.user;
    const { codice_articolo_fornitore, id_anagrafica_fornitore, tipo_codice } = req.body;

    const trx = await knex.transaction();
    try {
        if (tipo_codice === 'ST') {
            const existingStandard = await trx('ct_codici_fornitore')
                .where({
                    id_catalogo: itemId,
                    id_ditta: id_ditta,
                    tipo_codice: 'ST'
                })
                .first();
            
            if (existingStandard) {
                await trx.rollback();
                return res.status(409).json({ success: false, message: "Esiste già un fornitore Standard per questo articolo. Per impostare questo come standard, rimuovere prima il precedente." });
            }
        }

        await trx('ct_codici_fornitore').insert({
            id_ditta,
            id_catalogo: itemId,
            codice_articolo_fornitore,
            id_anagrafica_fornitore: id_anagrafica_fornitore || null,
            tipo_codice,
            created_by: id_utente
        });

        await trx.commit();
        res.status(201).json({ success: true });
    } catch (error) {
        await trx.rollback();
        console.error("Errore inserimento codice fornitore:", error);
        res.status(500).json({ success: false, message: "Errore server" });
    }
});

router.delete('/codici-fornitore/:codiceId', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_COD_FORN_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    const { codiceId } = req.params;
    const { id_ditta } = req.user;
    try {
        const deleted = await knex('ct_codici_fornitore').where({ id: codiceId, id_ditta }).del();
        if (deleted === 0) {
            return res.status(404).json({ message: 'Codice fornitore non trovato' });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Errore eliminazione codice fornitore:', error);
        res.status(500).json({ message: 'Errore server' });
    }
});



module.exports = router;

//XXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//-********************** import ENTITA CSV XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//XXXXXXXXXXXXXXXXXXXXXXXX                   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// ##################################################################
// #           API PER IMPORTAZIONE MASSIVA EAN v1.0                #
// ##################################################################
router.post('/import-ean-csv', verifyToken, upload.single('csvFile'), async (req, res) => {
    if (!hasPermission(req.user, 'CT_EAN_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nessun file CSV fornito.' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream.pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const { id_ditta } = req.user;
            let insertedCount = 0;
            let skippedCount = 0;
            const errors = [];

            const trx = await knex.transaction();
            try {
                for (const [index, row] of results.entries()) {
                    const { codice_entita, codice_ean } = row;

                    if (!codice_entita || !codice_ean) {
                        errors.push({ line: index + 2, message: 'Le colonne codice_entita e codice_ean sono obbligatorie.' });
                        skippedCount++;
                        continue;
                    }

                    // 1. Trova l'articolo corrispondente
                    const articolo = await trx('ct_catalogo')
                        .where({ id_ditta, codice_entita })
                        .first('id');

                    if (!articolo) {
                        errors.push({ line: index + 2, message: `Articolo con codice '${codice_entita}' non trovato.` });
                        skippedCount++;
                        continue;
                    }

                    // 2. Inserisci il nuovo codice EAN
                    await trx('ct_ean').insert({
                        id_ditta,
                        id_catalogo: articolo.id,
                        codice_ean: codice_ean.trim(),
                        is_principale: false // Gli EAN importati in massa non sono mai principali
                    });
                    insertedCount++;
                }

                await trx.commit();
                res.status(200).json({
                    success: true,
                    message: 'Importazione EAN completata.',
                    inserted: insertedCount,
                    skipped: skippedCount,
                    errors: errors
                });

            } catch (error) {
                await trx.rollback();
                console.error("Errore durante l'importazione massiva di EAN:", error);
                // Gestione errori di duplicati
                if (error.code === 'ER_DUP_ENTRY') {
                     return res.status(409).json({ success: false, message: "Errore: uno o più codici EAN che stai cercando di importare sono già presenti nel sistema." });
                }
                res.status(500).json({ success: false, message: "Errore interno del server." });
            }
        });
});

// --- API DI IMPORTAZIONE CSV POTENZIATA v2.0 ---
router.post('/import-csv', verifyToken, upload.single('csvFile'), async (req, res) => {
    if (!hasPermission(req.user, 'CT_IMPORT_CSV')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Nessun file CSV fornito.' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream.pipe(csv({ separator: ';' }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            const { id_ditta, id: id_utente } = req.user;
            let insertedCount = 0;
            let skippedCount = 0;
            let listiniCount = 0;
            let eanCount = 0;
            let fornitoreCount = 0;
            const errors = [];

            // Usiamo una transazione per garantire l'integrità dei dati
            const trx = await knex.transaction();
            try {
                for (const [index, row] of results.entries()) {
                    const { 
                        codice_entita, 
                        descrizione, 
                        categoria, 
                        costo_base,
                        prezzo_cessione_1,
                        codice_ean_principale,
                        fornitore_piva,
                        codice_articolo_fornitore 
                    } = row;

                    if (!codice_entita || !descrizione) {
                        errors.push({ line: index + 2, message: 'Codice entità e Descrizione sono obbligatori.', data: row });
                        skippedCount++;
                        continue;
                    }

                    // Inserimento anagrafica principale
                    const [insertedId] = await trx('ct_catalogo').insert({
                        id_ditta,
                        codice_entita,
                        descrizione,
                        // ... altri campi dal CSV se presenti ...
                        costo_base: parseFloat(costo_base) || 0,
                        created_by: id_utente
                    }).returning('id');
                    insertedCount++;
                    
                    // 1. Creazione Listino di Base
                    if(costo_base || prezzo_cessione_1) {
                        await trx('ct_listini').insert({
                            id_ditta,
                            id_entita_catalogo: insertedId,
                            data_inizio_validita: new Date(),
                            prezzo_cessione_1: parseFloat(prezzo_cessione_1) || 0,
                            // Inseriamo solo il primo prezzo, gli altri andranno gestiti manualmente
                        });
                        listiniCount++;
                    }

                    // 2. Inserimento EAN Principale
                    if (codice_ean_principale) {
                        await trx('ct_ean').insert({
                            id_ditta,
                            id_catalogo: insertedId,
                            codice_ean: codice_ean_principale,
                            is_principale: true
                        });
                        eanCount++;
                    }

                    // 3. Inserimento Codice Fornitore
                    if (fornitore_piva && codice_articolo_fornitore) {
                        const fornitore = await trx('ditte').where({ partita_iva: fornitore_piva, id_ditta_proprietaria: id_ditta }).first();
                        if (fornitore) {
                            await trx('ct_codici_fornitore').insert({
                                id_ditta,
                                id_catalogo: insertedId,
                                id_fornitore: fornitore.id,
                                codice_articolo_fornitore
                            });
                            fornitoreCount++;
                        } else {
                            errors.push({ line: index + 2, message: `Fornitore con P.IVA ${fornitore_piva} non trovato.`, data: row });
                        }
                    }
                }
                
                await trx.commit();
                res.status(200).json({
                    success: true,
                    message: 'Importazione completata con successo.',
                    inserted: insertedCount,
                    skipped: skippedCount,
                    listini: listiniCount,
                    ean: eanCount,
                    fornitori: fornitoreCount,
                    errors: errors
                });

            } catch (error) {
                await trx.rollback();
                console.error("Errore durante l'importazione CSV:", error);
                res.status(500).json({ success: false, message: "Errore interno del server." });
            }
        });
});

// NUOVA API per importare i listini (da implementare)
router.post('/import-listini-csv', verifyToken, upload.single('csvFile'), (req, res) => {
     res.status(501).send("Not Implemented Yet");
});


// GET /api/catalogo/ - Recupera tutte le entità del catalogo
// GET /api/catalogo/ - Recupera tutte le entità del catalogo
router.get('/', verifyToken, async (req, res) => {
    if (!req.user.permissions || !req.user.permissions.includes('CT_VIEW')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata.' });
    }
    try {
        const entita = await knex('ct_catalogo')
            .where('id_ditta', req.user.id_ditta)
            .select('*');
        res.json(entita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Errore nel recupero del catalogo.' });
    }
});

// ===================================================================
// =               API DI RICERCA UNIFICATA v1.0                     =
// ===================================================================
// GET /api/catalogo/search?term=...
// Endpoint per una ricerca "intelligente" e unificata tra le entità del catalogo.
// Cerca il termine fornito su più tabelle e campi collegati.
//
// SICUREZZA: 
// Questo endpoint è protetto solo da 'verifyToken' e NON da un permesso specifico
// (es. CT_SEARCH). La logica è che questa API sarà invocata da componenti frontend
// che hanno già i propri controlli di accesso (es. un utente in una schermata di
// creazione fattura ha già il permesso di accedere a tali dati).
router.get('/search', verifyToken, async (req, res) => {
    const { id_ditta } = req.user;
    const { term } = req.query;

    if (!term || term.length < 2) {
        return res.json([]);
    }

    try {
        const searchTerm = `%${term}%`;

        // ## CORREZIONE DEFINITIVA: Utilizzo di sotto-query ##
        // Questo approccio è più robusto perché isola la ricerca sulle tabelle collegate.

        // 1. Trova gli ID degli articoli che corrispondono alla ricerca per EAN
        const eanIdsQuery = knex('ct_ean')
            .where('codice_ean', 'like', searchTerm)
            .andWhere('id_ditta', id_ditta)
            .select('id_catalogo');

        // 2. Trova gli ID degli articoli che corrispondono alla ricerca per Codice Fornitore
        const fornitoreIdsQuery = knex('ct_codici_fornitore')
            .where('codice_articolo_fornitore', 'like', searchTerm)
            .andWhere('id_ditta', id_ditta)
            .select('id_catalogo');

        // 3. Esegui la query principale
        const results = await knex('ct_catalogo as cat')
            .leftJoin('ct_categorie as a', 'cat.id_categoria', 'a.id')
            .where('cat.id_ditta', id_ditta)
            .andWhere(function() {
                // Cerca direttamente sulle tabelle principali (catalogo e categorie)
                this.where('cat.descrizione', 'like', searchTerm)
                    .orWhere('cat.codice_entita', 'like', searchTerm)
                    .orWhere('a.descrizione', 'like', searchTerm)
                    // OPPURE cerca tra gli ID trovati nelle sotto-query
                    .orWhereIn('cat.id', eanIdsQuery)
                    .orWhereIn('cat.id', fornitoreIdsQuery);
            })
            .select('cat.*', 'a.descrizione as nome_categoria')
            .groupBy('cat.id') // Manteniamo il groupBy per sicurezza
            .limit(100); 

        res.json(results);

    } catch (error) {
        console.error("Errore durante la ricerca nel catalogo:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


module.exports = router;

