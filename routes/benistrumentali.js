const express = require('express');
const router = express.Router();
const { knex } = require('../config/db'); 
const { verifyToken } = require('../utils/auth');

router.use(verifyToken);

// --- 🏛️ GESTIONE CATEGORIE ---

// --- 🏛️ GESTIONE CATEGORIE (CRUD COMPLETO) ---

router.get('/categorie', async (req, res) => {
  const { id_ditta } = req.user;
  try {
    const categorie = await knex('bs_categorie').where({ id_ditta }).orderBy('codice');
    res.json({ success: true, data: categorie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Errore nel recupero delle categorie." });
  }
});

router.post('/categorie', async (req, res) => {
  const { id_ditta, id: id_utente } = req.user;
  const { codice, descrizione } = req.body;
  try {
    const [id_categoria] = await knex('bs_categorie').insert({ id_ditta, codice, descrizione });
    await knex('log_azioni').insert({
        id_utente, 
        id_ditta, 
        azione: 'Creazione Categoria Bene',
        dettagli: `ID: ${id_categoria}, Codice: ${codice}`
    });
    res.status(201).json({ success: true, id: id_categoria, message: "Categoria creata." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Errore nella creazione della categoria." });
  }
});

// <span style="color:green;">// NUOVO: Rotta PATCH per aggiornare una categoria</span>
router.patch('/categorie/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    const { codice, descrizione } = req.body;
    try {
        const affectedRows = await knex('bs_categorie')
            .where({ id, id_ditta })
            .update({ codice, descrizione });

        if (affectedRows > 0) {
            await knex('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'Modifica Categoria Bene',
                dettagli: `ID: ${id}, Codice: ${codice}`
            });
            res.json({ success: true, message: 'Categoria aggiornata.' });
        } else {
            res.status(404).json({ success: false, error: 'Categoria non trovata.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Errore nell'aggiornamento della categoria." });
    }
});

// <span style="color:green;">// NUOVO: Rotta DELETE per eliminare una categoria</span>
router.delete('/categorie/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    try {
        const affectedRows = await knex('bs_categorie').where({ id, id_ditta }).del();
        if (affectedRows > 0) {
            await knex('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'Eliminazione Categoria Bene',
                dettagli: `ID Categoria eliminata: ${id}`
            });
            res.json({ success: true, message: 'Categoria eliminata.' });
        } else {
            res.status(404).json({ success: false, error: 'Categoria non trovata.' });
        }
    } catch (error) {
        // Gestisce l'errore di violazione del vincolo di foreign key
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, error: 'Impossibile eliminare la categoria perché è associata a uno o più beni.' });
        }
        console.error(error);
        res.status(500).json({ success: false, error: "Errore nell'eliminazione della categoria." });
    }
});


router.get('/', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const beni = await knex('bs_beni')
            .leftJoin('bs_categorie', 'bs_beni.id_categoria', 'bs_categorie.id')
            .where('bs_beni.id_ditta', id_ditta)
            .select('bs_beni.*', 'bs_categorie.descrizione as categoria_descrizione');
        res.json({ success: true, data: beni });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Errore nel recupero dei beni." });
    }
});



// POST: Crea un nuovo bene
router.post('/', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    
    try {
        const id_bene = await knex.transaction(async (trx) => {
            const [new_id] = await trx('bs_beni').insert({
                id_ditta,
                ...req.body
            });
            
            await trx('log_azioni').insert({
                id_utente, 
                id_ditta, 
                azione: 'Creazione Bene Strumentale',
                dettagli: `ID Bene: ${new_id}, Descrizione: ${req.body.descrizione}`
            });
            return new_id;
        });

        res.status(201).json({ id: id_bene, message: "Bene creato con successo." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore nella creazione del bene." });
    }
});

// <span style="color:green;">// NUOVO: PATCH per aggiornare un bene esistente</span>
router.patch('/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    // Rimuoviamo campi che non dovrebbero essere modificati direttamente
    delete fieldsToUpdate.id;
    delete fieldsToUpdate.id_ditta;

    try {
        const affectedRows = await knex.transaction(async (trx) => {
            const rows = await trx('bs_beni')
                .where({ id, id_ditta })
                .update(fieldsToUpdate);

            if (rows > 0) {
                await trx('log_azioni').insert({
                    id_utente,
                    id_ditta,
                    azione: 'Aggiornamento Bene Strumentale',
                    dettagli: `ID Bene: ${id}, Dati aggiornati: ${JSON.stringify(fieldsToUpdate)}`
                });
            }
            return rows;
        });

        if (affectedRows === 0) {
            return res.status(404).json({ error: "Bene non trovato o non appartenente alla ditta." });
        }
        res.json({ message: "Bene aggiornato con successo." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore nell'aggiornamento del bene." });
    }
});

// <span style="color:green;">// NUOVO: DELETE per eliminare un bene</span>
router.delete('/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;

    try {
        const beneToDelete = await knex('bs_beni').where({ id, id_ditta }).first();
        if (!beneToDelete) {
            return res.status(404).json({ error: "Bene non trovato o non appartenente alla ditta." });
        }

        await knex.transaction(async (trx) => {
            await trx('bs_beni').where({ id, id_ditta }).del();

            await trx('log_azioni').insert({
                id_utente,
                id_ditta,
                azione: 'Eliminazione Bene Strumentale',
                dettagli: `ID Bene: ${id}, Descrizione: ${beneToDelete.descrizione}`
            });
        });

        res.status(200).json({ message: "Bene eliminato con successo." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Errore nell'eliminazione del bene." });
    }
});


// --- 🛠️ GESTIONE MANUTENZIONI ---

// (Le rotte per manutenzioni, costi, etc. rimangono invariate ma ora il CRUD dei beni è completo)
router.post('/:idBene/manutenzioni', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { idBene } = req.params;

    try {
        const id_manutenzione = await knex.transaction(async (trx) => {
            const bene = await trx('bs_beni').where({ id: idBene, id_ditta }).first();
            if (!bene) {
                throw new Error("Bene non trovato o non appartenente alla ditta.");
            }

            const [new_id] = await trx('bs_manutenzioni').insert({
                id_bene: idBene,
                ...req.body
            });

            await trx('log_azioni').insert({
                id_utente, 
                id_ditta, 
                azione: 'Registrazione Manutenzione Bene',
                dettagli: `ID Bene: ${idBene}, ID Manutenzione: ${new_id}, Costo: ${req.body.costo_intervento}`
            });
            return new_id;
        });
        
        res.status(201).json({ id: id_manutenzione, message: "Manutenzione registrata." });
    } catch (error) {
        console.error(error);
        if (error.message.includes("Bene non trovato")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Errore nella registrazione della manutenzione." });
    }
});
// <span style="color:green;">// NUOVO: --- ⚙️ GESTIONE TIPI SCADENZE ---</span>

router.get('/tipi-scadenze', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const tipi = await knex('bs_tipi_scadenze').where({ id_ditta }).orderBy('descrizione', 'asc');
        res.json({ success: true, data: tipi });
    } catch (error) { res.status(500).json({ success: false, error: "Errore nel recupero dei tipi di scadenze." }); }
});


// <span style="color:green;">// NUOVO: --- 📅 GESTIONE SCADENZE SPECIFICHE ---</span>

// <span style="color:orange;">// CORREZIONE: Implementazione della rotta mancante che causava l'errore 404.</span>
// GET: Vista aggregata di tutte le scadenze
router.get('/scadenze/prossime', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const prossimeScadenze = await knex('bs_scadenze')
            .join('bs_beni', 'bs_scadenze.id_bene', 'bs_beni.id')
            .join('bs_tipi_scadenze', 'bs_scadenze.id_tipo_scadenza', 'bs_tipi_scadenze.id')
            .where('bs_beni.id_ditta', id_ditta)
            .select(
                'bs_scadenze.id',
                'bs_beni.descrizione as bene_descrizione',
                'bs_tipi_scadenze.descrizione as tipo_scadenza_descrizione',
                'bs_scadenze.data_scadenza',
                'bs_scadenze.importo_previsto',
                'bs_scadenze.stato'
            )
            .orderBy('bs_scadenze.data_scadenza', 'asc');
        res.json({ success: true, data: prossimeScadenze });
    } catch (error) {
        console.error("Errore API /scadenze/prossime:", error);
        res.status(500).json({ success: false, error: "Errore nel recupero delle scadenze." });
    }
});

// POST: Crea una nuova scadenza per un bene
router.post('/scadenze', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const scadenzaData = req.body;
    try {
        const [id_scadenza] = await knex('bs_scadenze').insert(scadenzaData);
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Creazione Scadenza Bene',
            dettagli: `ID Scadenza: ${id_scadenza}, per bene ID: ${scadenzaData.id_bene}`
        });
        res.status(201).json({ success: true, id: id_scadenza, message: 'Scadenza creata.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nella creazione della scadenza.' });
    }
});

// PATCH: Aggiorna una scadenza
router.patch('/scadenze/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    const fieldsToUpdate = req.body;
    try {
        const scadenza = await knex('bs_scadenze')
            .join('bs_beni', 'bs_scadenze.id_bene', 'bs_beni.id')
            .where('bs_beni.id_ditta', id_ditta)
            .andWhere('bs_scadenze.id', id)
            .first('bs_scadenze.id');
        
        if (!scadenza) {
            return res.status(404).json({ success: false, error: 'Scadenza non trovata.' });
        }

        await knex('bs_scadenze').where({ id }).update(fieldsToUpdate);
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Aggiornamento Scadenza Bene',
            dettagli: `ID Scadenza: ${id}, Dati: ${JSON.stringify(fieldsToUpdate)}`
        });
        res.json({ success: true, message: 'Scadenza aggiornata.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nell\'aggiornamento della scadenza.' });
    }
});

// DELETE: Elimina una scadenza
router.delete('/scadenze/:id', async (req, res) => {
     const { id_ditta, id: id_utente } = req.user;
     const { id } = req.params;
     try {
        const rowsDeleted = await knex('bs_scadenze')
            .whereIn('id_bene', function() {
                this.select('id').from('bs_beni').where('id_ditta', id_ditta);
            })
            .andWhere({ id })
            .del();

        if (rowsDeleted === 0) {
            return res.status(404).json({ success: false, error: "Scadenza non trovata." });
        }
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Eliminazione Scadenza Bene',
            dettagli: `ID Scadenza: ${id}`
        });
        res.json({ success: true, message: "Scadenza eliminata." });
    } catch (error) {
        res.status(500).json({ success: false, error: "Errore nell'eliminazione della scadenza." });
    }
});


// --- ⚙️ GESTIONE TIPI SCADENZE ---
router.get('/tipi-scadenze', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const tipi = await knex('bs_tipi_scadenze').where({ id_ditta }).orderBy('descrizione');
        res.json({ success: true, data: tipi });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nel recupero dei tipi di scadenze.' });
    }
});

// <span style="color:green;">// NUOVO: Aggiunta la rotta POST mancante</span>
router.post('/tipi-scadenze', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { descrizione } = req.body;
    if (!descrizione) {
        return res.status(400).json({ success: false, error: 'La descrizione è obbligatoria.' });
    }
    try {
        const [id] = await knex('bs_tipi_scadenze').insert({
            id_ditta,
            descrizione
        });
        await knex('log_azioni').insert({
            id_utente,
            id_ditta,
            azione: 'Creazione Tipo Scadenza Bene',
            dettagli: `ID: ${id}, Descrizione: ${descrizione}`
        });
        res.status(201).json({ success: true, data: { id, id_ditta, descrizione } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Errore nella creazione del tipo di scadenza.' });
    }
});


router.put('/tipi-scadenza/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    const { descrizione } = req.body;
    try {
        await knex('bs_tipi_scadenze').where({ id, id_ditta }).update({ descrizione });
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Aggiornamento Tipo Scadenza',
            dettagli: `ID: ${id}`
        });
        res.json({ success: true, message: 'Tipo scadenza aggiornato.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nell\'aggiornamento del tipo scadenza.' });
    }
});

router.delete('/tipi-scadenze/:id', async (req, res) => {
    const { id_ditta, id: id_utente } = req.user;
    const { id } = req.params;
    try {
        await knex('bs_tipi_scadenze').where({ id, id_ditta }).del();
        await knex('log_azioni').insert({
            id_utente, id_ditta, azione: 'Eliminazione Tipo Scadenza',
            dettagli: `ID: ${id}`
        });
        res.json({ success: true, message: 'Tipo scadenza eliminato.' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nell\'eliminazione del tipo scadenza.' });
    }
});


module.exports = router;

