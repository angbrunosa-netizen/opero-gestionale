const express = require('express');
const router = express.Router();
const { knex } = require('../config/db'); 
const { verifyToken } = require('../utils/auth');

router.use(verifyToken);

// --- 🏛️ GESTIONE CATEGORIE ---

// GET: Lista di tutte le categorie per la ditta
router.get('/categorie', async (req, res) => {
  const { id_ditta } = req.user;
  try {
    const categorie = await knex('bs_categorie').where({ id_ditta });
    res.json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nel recupero delle categorie." });
  }
});

// POST: Crea una nuova categoria
router.post('/categorie', async (req, res) => {
  const { id_ditta, id: id_utente } = req.user;
  const { codice, descrizione } = req.body;

  try {
    const result = await knex.transaction(async (trx) => {
        const [id_categoria] = await trx('bs_categorie').insert({
          id_ditta,
          codice,
          descrizione,
        });

        await trx('log_azioni').insert({
            id_utente, 
            id_ditta, 
            azione: 'Creazione Categoria Bene Strumentale',
            dettagli: `ID Categoria: ${id_categoria}, Descrizione: ${descrizione}`
        });

        return id_categoria;
    });

    res.status(201).json({ id: result, message: "Categoria creata con successo." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore nella creazione della categoria." });
  }
});


// --- 📦 GESTIONE BENI STRUMENTALI (CRUD COMPLETO) ---

router.get('/', async (req, res) => {
    const { id_ditta } = req.user;
    try {
        const beni = await knex('bs_beni')
            .leftJoin('bs_categorie', 'bs_beni.id_categoria', 'bs_categorie.id')
            .where('bs_beni.id_ditta', id_ditta)
            .select('bs_beni.*', 'bs_categorie.descrizione as categoria_descrizione');
        
        // <span style="color:red; font-weight:bold;">// CORREZIONE: La risposta ora segue lo standard { success, data }</span>
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

module.exports = router;
