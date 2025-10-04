/**
 * @file opero/routes/magazzino.js
 * @description File di rotte per il nuovo modulo Magazzino.
 * @version 2.1 (Corretto con middleware di sicurezza)
 * @date 2025-10-04
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { verifyToken } = require('../utils/auth'); // Importato il nostro middleware!

// #####################################################################
// #                        ANAGRAFICHE DI BASE                        #
// #####################################################################

/**
 * @route GET /api/magazzino/magazzini
 * @description Recupera tutti i magazzini (depositi) per la ditta dell'utente.
 * @access Privato - Richiede autenticazione.
 */
router.get('/magazzini', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const magazzini = await knex('mg_magazzini').where({ id_ditta });
        res.json(magazzini);
    } catch (error) {
        console.error("Errore nel recuperare i magazzini:", error);
        res.status(500).json({ message: "Errore del server durante il recupero dei magazzini." });
    }
});

/**
 * @route POST /api/magazzino/magazzini
 * @description Crea un nuovo magazzino.
 * @access Privato - Richiede autenticazione.
 */
router.post('/magazzini', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const { codice, descrizione, note } = req.body;

        const [newId] = await knex('mg_magazzini').insert({ id_ditta, codice, descrizione, note });
        res.status(201).json({ id: newId, ...req.body });
    } catch (error) {
        console.error("Errore nella creazione del magazzino:", error);
        res.status(500).json({ message: "Errore del server durante la creazione del magazzino." });
    }
});

/**
 * @route PATCH /api/magazzino/magazzini/:id
 * @description Modifica un magazzino esistente.
 * @access Privato - Richiede autenticazione.
 */
router.patch('/magazzini/:id', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const { id } = req.params;
        const { codice, descrizione, note } = req.body;

        const count = await knex('mg_magazzini')
            .where({ id, id_ditta })
            .update({ codice, descrizione, note, updated_at: knex.fn.now() });

        if (count === 0) {
            return res.status(404).json({ message: "Magazzino non trovato o non appartenente alla tua ditta." });
        }
        res.json({ message: "Magazzino aggiornato con successo." });
    } catch (error) {
        console.error("Errore nell'aggiornamento del magazzino:", error);
        res.status(500).json({ message: "Errore del server durante l'aggiornamento del magazzino." });
    }
});

/**
 * @route GET /api/magazzino/causali
 * @description Recupera tutte le causali di movimento per la ditta dell'utente.
 * @access Privato - Richiede autenticazione.
 */
router.get('/causali', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const causali = await knex('mg_causali_movimento').where({ id_ditta });
        res.json(causali);
    } catch (error) {
        console.error("Errore nel recuperare le causali:", error);
        res.status(500).json({ message: "Errore del server durante il recupero delle causali." });
    }
});

/**
 * @route POST /api/magazzino/causali
 * @description Crea una nuova causale di movimento.
 * @access Privato - Richiede autenticazione.
 */
router.post('/causali', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const { codice, descrizione, tipo } = req.body;

        const [newId] = await knex('mg_causali_movimento').insert({ id_ditta, codice, descrizione, tipo });
        res.status(201).json({ id: newId, ...req.body });
    } catch (error) {
        console.error("Errore nella creazione della causale:", error);
        res.status(500).json({ message: "Errore del server durante la creazione della causale." });
    }
});

/**
 * @route PATCH /api/magazzino/causali/:id
 * @description Modifica una causale esistente.
 * @access Privato - Richiede autenticazione.
 */
router.patch('/causali/:id', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const { id } = req.params;
        const { codice, descrizione, tipo } = req.body;

        const count = await knex('mg_causali_movimento')
            .where({ id, id_ditta })
            .update({ codice, descrizione, tipo, updated_at: knex.fn.now() });

        if (count === 0) {
            return res.status(404).json({ message: "Causale non trovata o non appartenente alla tua ditta." });
        }
        res.json({ message: "Causale aggiornata con successo." });
    } catch (error) {
        console.error("Errore nell'aggiornamento della causale:", error);
        res.status(500).json({ message: "Errore del server durante l'aggiornamento della causale." });
    }
});


// #####################################################################
// #                        LOGICA OPERATIVA                           #
// #####################################################################

/**
 * @route POST /api/magazzino/movimenti
 * @description Crea un nuovo movimento di magazzino (carico/scarico).
 * L'operazione è transazionale e gestisce la creazione/associazione dei lotti.
 * @access Privato - Richiede autenticazione.
 * @body {
 * id_magazzino: number,
 * id_catalogo: number,
 * id_causale: number,
 * quantita: number,
 * data_movimento: string (ISO),
 * note?: string,
 * valore_unitario?: number,
 * riferimento_doc?: string,
 * id_riferimento_doc?: number,
 * lotti?: [{ codice_lotto: string, quantita: number, data_scadenza?: string }]
 * }
 */
router.post('/movimenti', verifyToken, async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const {
        id_magazzino,
        id_catalogo,
        id_causale,
        quantita,
        data_movimento,
        note,
        valore_unitario,
        riferimento_doc,
        id_riferimento_doc,
        lotti
    } = req.body;

    // Validazione base
    if (!id_magazzino || !id_catalogo || !id_causale || !quantita || !data_movimento) {
        return res.status(400).json({ message: "Campi obbligatori mancanti." });
    }

    // Iniziamo la transazione
    const trx = await knex.transaction();

    try {
        // 1. Inserisci il movimento principale
        const [id_movimento] = await trx('mg_movimenti').insert({
            id_ditta,
            id_magazzino,
            id_catalogo,
            id_causale,
            quantita,
            data_movimento,
            id_utente,
            note,
            valore_unitario,
            riferimento_doc,
            id_riferimento_doc
        });

        // 2. Gestisci i lotti, se presenti
        if (lotti && lotti.length > 0) {
            for (const lotto of lotti) {
                // Cerca se il lotto esiste già per questo articolo
                let lottoRecord = await trx('mg_lotti')
                    .where({ id_ditta, id_catalogo, codice_lotto: lotto.codice_lotto })
                    .first();
                
                let id_lotto;
                if (lottoRecord) {
                    // Lotto esistente
                    id_lotto = lottoRecord.id;
                } else {
                    // Crea un nuovo lotto
                    const [newLottoId] = await trx('mg_lotti').insert({
                        id_ditta,
                        id_catalogo,
                        codice_lotto: lotto.codice_lotto,
                        data_scadenza: lotto.data_scadenza || null
                    });
                    id_lotto = newLottoId;
                }

                // 3. Collega il movimento al lotto con la quantità specifica
                await trx('mg_movimenti_lotti').insert({
                    id_movimento,
                    id_lotto,
                    quantita: lotto.quantita
                });
            }
        }

        // Se tutto è andato bene, conferma la transazione
        await trx.commit();
        
        // Logga l'azione (Esempio base, da migliorare con una funzione helper)
        await knex('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Creazione Movimento Magazzino',
            tipo_entita: 'mg_movimenti',
            id_entita: id_movimento
        });

        res.status(201).json({ id: id_movimento, message: "Movimento registrato con successo." });

    } catch (error) {
        // In caso di errore, annulla tutte le operazioni
        await trx.rollback();
        console.error("Errore nella creazione del movimento:", error);
        res.status(500).json({ message: "Errore del server durante la registrazione del movimento." });
    }
});


// #####################################################################
// #                        API DI CONSULTAZIONE                       #
// #####################################################################

/**
 * @route GET /api/magazzino/movimenti/articolo/:id_catalogo
 * @description Recupera lo storico dei movimenti per un singolo articolo.
 * @access Privato - Richiede autenticazione.
 */
router.get('/movimenti/articolo/:id_catalogo', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;
        const { id_catalogo } = req.params;

        const movimenti = await knex('mg_movimenti as mov')
            .join('mg_magazzini as mag', 'mov.id_magazzino', 'mag.id')
            .join('mg_causali_movimento as caus', 'mov.id_causale', 'caus.id')
            .leftJoin('utenti as u', 'mov.id_utente', 'u.id')
            .where('mov.id_ditta', id_ditta)
            .andWhere('mov.id_catalogo', id_catalogo)
            .select(
                'mov.*',
                'mag.descrizione as nome_magazzino',
                'caus.descrizione as nome_causale',
                'caus.tipo as tipo_causale',
                'u.username as nome_utente'
            )
            .orderBy('mov.data_movimento', 'desc');

        res.json(movimenti);
    } catch (error) {
        console.error("Errore nel recuperare i movimenti dell'articolo:", error);
        res.status(500).json({ message: "Errore del server." });
    }
});

/**
 * @route GET /api/magazzino/giacenze
 * @description Calcola e restituisce la giacenza attuale per tutti gli articoli
 * in tutti i magazzini. La giacenza è calcolata in tempo reale.
 * @access Privato - Richiede autenticazione.
 */
router.get('/giacenze', verifyToken, async (req, res) => {
    try {
        const { id_ditta } = req.user;

        // Query potente che calcola la giacenza
        const giacenze = await knex('mg_movimenti as mov')
            .join('mg_causali_movimento as caus', 'mov.id_causale', 'caus.id')
            .join('ct_catalogo as cat', 'mov.id_catalogo', 'cat.id')
            .join('mg_magazzini as mag', 'mov.id_magazzino', 'mag.id')
            .where('mov.id_ditta', id_ditta)
            .groupBy('mov.id_catalogo', 'mov.id_magazzino')
            .select(
                'cat.id as id_catalogo',
                'cat.codice_entita',
                'cat.descrizione',
                'mag.id as id_magazzino',
                'mag.descrizione as nome_magazzino',
                // Somma algebrica delle quantità: positive per 'carico', negative per 'scarico'
                knex.raw('SUM(CASE WHEN caus.tipo = "carico" THEN mov.quantita ELSE -mov.quantita END) as giacenza')
            );
        
        res.json(giacenze);
    } catch (error) {
        console.error("Errore nel calcolare le giacenze:", error);
        res.status(500).json({ message: "Errore del server durante il calcolo delle giacenze." });
    }
});


module.exports = router;

