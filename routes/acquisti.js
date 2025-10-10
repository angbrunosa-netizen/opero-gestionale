/**
 * Componente: Routes API Modulo Acquisti
 * Versione: 1.0.0
 * Data: 10/10/2025
 * Posizione: routes/acquisti.js
 * Descrizione: Gestisce tutte le API relative al modulo Acquisti, inclusa la gestione
 * delle condizioni commerciali (listini e sconti), protette da un sistema di permessi.
 */
const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
// NUOVO: Importazione dei middleware di autenticazione e autorizzazione
const { verifyToken, checkPermission } = require('../utils/auth');

/**
 * GET /api/acquisti/condizioni
 * Recupera l'elenco delle testate delle condizioni commerciali.
 */
router.get('/condizioni', verifyToken, checkPermission('AC_VIEW'), async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const condizioni = await knex('ac_condizioni_testata as act')
            .join('ditte', 'act.id_fornitore', 'ditte.id')
            .where('act.id_ditta', id_ditta)
            .select(
                'act.id', 
                'ditte.ragione_sociale as fornitore', 
                'act.descrizione', 
                'act.data_inizio_validita', 
                'act.data_fine_validita',
                'act.attiva'
            )
            .orderBy('act.updated_at', 'desc');
        res.json(condizioni);
    } catch (error) {
        console.error("Errore nel recupero condizioni:", error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

/**
 * POST /api/acquisti/condizioni
 * Salva una condizione commerciale completa e aggiorna il costo_base degli articoli.
 * Protetta da permesso AC_MANA.
 */
router.post('/condizioni', verifyToken, checkPermission('AC_MANA'), async (req, res) => {
    const { id_ditta } = req.user;
    const { testata, righe } = req.body;

    if (!testata || !righe || righe.length === 0) {
        return res.status(400).json({ error: 'Dati incompleti.' });
    }

    try {
        await knex.transaction(async trx => {
            // 1. Inserisci la testata e ottieni il suo ID
            const [id_testata] = await trx('ac_condizioni_testata').insert({ ...testata, id_ditta });

            // <span style="color:green;">// CORRETTO: Itera su ogni riga singolarmente per garantire l'ordine di inserimento.</span>
            // Questo risolve l'errore di foreign key perché ogni riga viene inserita
            // e il suo ID viene ottenuto prima di tentare di inserire gli sconti figli.
            for (const riga of righe) {
                const { sconti, ...rigaData } = riga;
                
                // 2. Inserisci la riga articolo e ottieni il suo ID univoco
                const [id_riga] = await trx('ac_condizioni_righe').insert({
                    ...rigaData,
                    id_testata: id_testata
                });

                // 3. Inserisci gli sconti associati a QUESTA riga, usando l'ID appena ottenuto
                if (sconti && sconti.length > 0) {
                    const scontiToInsert = sconti.map(s => ({ ...s, id_riga: id_riga }));
                    await trx('ac_sconti_dettaglio').insert(scontiToInsert);
                }

                // 4. Aggiorna il costo_base nella tabella ct_catalogo
                if (riga.id_articolo && riga.prezzo_netto) {
                    await trx('ct_catalogo')
                        .where({ id: riga.id_articolo, id_ditta: id_ditta })
                        .update({ costo_base: riga.prezzo_netto });
                }
            }
        });

        res.status(201).json({ message: 'Condizione commerciale e costi catalogo aggiornati con successo.' });
    } catch (error) {
        console.error("Errore nel salvataggio della condizione:", error);
        res.status(500).json({ error: 'Errore interno del server.', details: error.message });
    }
});

/**
 * GET /api/acquisti/prezzo-netto
 * Calcola il prezzo netto di un articolo applicando gli sconti attivi.
 * Protetta da permesso AC_VIEW.
 */
router.get('/prezzo-netto', verifyToken, checkPermission('AC_VIEW'), async (req, res) => {
    const { id_fornitore, id_articolo, data = new Date() } = req.query;
    const { id_ditta } = req.user;

    if (!id_fornitore || !id_articolo) {
        return res.status(400).json({ error: 'ID fornitore e ID articolo sono obbligatori.' });
    }

    try {
        const listinoAttivo = await knex('ac_listini_fornitori')
            .where({ id_fornitore, id_articolo, id_ditta })
            .where('data_inizio_validita', '<=', data)
            .andWhere(builder => {
                builder.where('data_fine_validita', '>=', data).orWhereNull('data_fine_validita');
            })
            .first();

        if (!listinoAttivo) {
            return res.status(404).json({ message: 'Nessun listino attivo trovato per la data specificata.' });
        }

        let prezzoNetto = parseFloat(listinoAttivo.prezzo_listino);

        const sconti = await knex('ac_condizioni_sconto as acs')
            .join('ac_sconti_dettaglio as acsd', 'acs.id', 'acsd.id_condizione')
            .where('acs.id_listino', listinoAttivo.id)
            .where('acs.attiva', true)
            .orderBy('acsd.ordine_applicazione', 'asc');

        for (const sconto of sconti) {
            if (sconto.tipo_sconto === 'percentuale') {
                prezzoNetto *= (1 - parseFloat(sconto.valore_sconto) / 100);
            } else if (sconto.tipo_sconto === 'importo') {
                prezzoNetto -= parseFloat(sconto.valore_sconto);
            }
        }

        res.json({
            prezzo_listino: listinoAttivo.prezzo_listino,
            prezzo_netto_calcolato: prezzoNetto.toFixed(4)
        });

    } catch (error) {
        console.error('Errore nel calcolo del prezzo netto:', error);
        res.status(500).json({ error: 'Errore nel calcolo del prezzo.' });
    }
});


module.exports = router;
