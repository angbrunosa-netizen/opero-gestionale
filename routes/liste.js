// routes/liste.js

const express = require('express');
const router = express.Router();

// Import configurazioni
const { knex: db } = require('../config/db');
const { verifyToken } = require('../utils/auth');

// Import utility per progressivi
const { getNextProgressivo } = require('../utils/progressivi');

// GET /api/liste - Recupera tutte le liste della ditta
router.get('/', verifyToken, async (req, res) => {
  try {
    const { id_ditta } = req.user;

    const liste = await db('ls_liste_testata')
      .select([
        'ls_liste_testata.*',
        'causale.descrizione as descrizione_causale',
        'causale.tipo as tipo_causale'
      ])
      .leftJoin('mg_causali_movimento as causale', 'ls_liste_testata.id_causale_movimento', 'causale.id')
      .where('ls_liste_testata.id_ditta', id_ditta)
      .orderBy('ls_liste_testata.created_at', 'desc');

    res.json(liste);
  } catch (error) {
    console.error("Errore nel recupero delle liste:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/liste - Crea una nuova lista con numero progressivo
router.post('/', verifyToken, async (req, res) => {
  try {
    const { id_ditta } = req.user;
    const { descrizione, id_causale_movimento, id_ditta_destinataria, id_magazzino, data_riferimento } = req.body;

    // Validazione campi obbligatori
    if (!descrizione || !id_causale_movimento || !data_riferimento) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }

    // Recupera il prossimo numero progressivo
    const numero = await getNextProgressivo('NUMERO_LISTA', id_ditta);

    // Genera il codice univoco della lista
    const codice = `LST${new Date().getFullYear()}${String(numero).padStart(4, '0')}`;

    // Inserisce la nuova lista
    const [listaId] = await db('ls_liste_testata').insert({
      id_ditta,
      codice,
      descrizione,
      numero,
      id_causale_movimento,
      id_ditta_destinataria: id_ditta_destinataria || null,
      id_magazzino: id_magazzino || null,
      data_riferimento,
      stato: 'BOZZA',
      created_by: req.user.id
    });

    // Recupera la lista appena creata con i dettagli
    const listaCreata = await db('ls_liste_testata')
      .select([
        'ls_liste_testata.*',
        'causale.descrizione as descrizione_causale',
        'causale.tipo as tipo_causale'
      ])
      .leftJoin('mg_causali_movimento as causale', 'ls_liste_testata.id_causale_movimento', 'causale.id')
      .where('ls_liste_testata.id', listaId[0])
      .first();

    res.status(201).json(listaCreata);
  } catch (error) {
    console.error("Errore nella creazione della lista:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/liste/:id - Aggiorna una lista esistente
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ditta } = req.user;
    const { descrizione, id_causale_movimento, id_ditta_destinataria, id_magazzino, data_riferimento, stato } = req.body;

    // Verifica che la lista esista e appartenga alla ditta
    const listaEsiste = await db('ls_liste_testata')
      .where({ id, id_ditta })
      .first();

    if (!listaEsiste) {
      return res.status(404).json({ error: 'Lista non trovata o non autorizzata' });
    }

    // Aggiorna la lista (non modifica il numero progressivo)
    await db('ls_liste_testata')
      .where({ id })
      .update({
        descrizione,
        id_causale_movimento,
        id_ditta_destinataria: id_ditta_destinataria || null,
        id_magazzino: id_magazzino || null,
        data_riferimento,
        stato: stato || 'BOZZA',
        updated_by: req.user.id,
        updated_at: new Date()
      });

    // Recupera la lista aggiornata
    const listaAggiornata = await db('ls_liste_testata')
      .select([
        'ls_liste_testata.*',
        'causale.descrizione as descrizione_causale',
        'causale.tipo as tipo_causale'
      ])
      .leftJoin('mg_causali_movimento as causale', 'ls_liste_testata.id_causale_movimento', 'causale.id')
      .where('ls_liste_testata.id', id)
      .first();

    res.json(listaAggiornata);
  } catch (error) {
    console.error("Errore nell'aggiornamento della lista:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/liste/:id - Elimina una lista
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ditta } = req.user;

    // Verifica che la lista esista e appartenga alla ditta
    const listaEsiste = await db('ls_liste_testata')
      .where({ id, id_ditta })
      .first();

    if (!listaEsiste) {
      return res.status(404).json({ error: 'Lista non trovata o non autorizzata' });
    }

    // Verifica che la lista sia in stato BOZZA (solo le bozze possono essere eliminate)
    if (listaEsiste.stato !== 'BOZZA') {
      return res.status(400).json({ error: 'Solo le liste in stato BOZZA possono essere eliminate' });
    }

    // In transazione, elimina le righe e poi la testata
    const trx = await db.transaction();

    try {
      // Prima elimina tutte le righe associate
      await trx('ls_liste_righe').where('id_testata', id).del();

      // Poi elimina la testata
      await trx('ls_liste_testata').where('id', id).del();

      await trx.commit();
      res.json({ message: 'Lista eliminata con successo' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Errore nell'eliminazione della lista:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/liste/causali - Recupera le causali di movimento utilizzabili
router.get('/causali', async (req, res) => {
  try {
    // Recupera tutte le causali attive, potenzialmente filtrabili per tipo
    const causali = await db('mg_causali_movimento')
      .select('*')
      .orderBy('descrizione', 'asc');
    
    res.json(causali);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/liste/ditte-per-causale/:idCausale - Recupera le ditte in base al tipo della causale
router.get('/ditte-per-causale/:idCausale', async (req, res) => {
  try {
    const { idCausale } = req.params;
    const { id_ditta } = req.user; // L'utente loggato appartiene a questa ditta

    // 1. Recupera la causale per capire se è un carico o uno scarico
    const causale = await db('mg_causali_movimento')
      .where({ id: idCausale })
      .first();

    if (!causale) {
      return res.status(404).json({ error: 'Causale non trovata' });
    }

    let query = db('ditte').select('*');

    if (causale.tipo === 'scarico') {
      // Documento ATTIVO: Cerca Clienti (C) o Enti Convenzionati (E)
      query = query
        .where({ id_ditta_proprietaria: id_ditta })
        .whereIn('codice_relazione', ['C', 'E']);
    } else if (causale.tipo === 'carico') {
      // Documento PASSIVO: Cerca Fornitori (F)
      query = query
        .where({ id_ditta_proprietaria: id_ditta })
        .where({ codice_relazione: 'F' });
    } else {
      // Per rettifiche o altri movimenti interni, non serve una ditta esterna
      return res.json([]); 
    }
    
    const ditte = await query;
    res.json(ditte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/liste/:id/processa - Processa una lista generando i movimenti di magazzino
router.post('/:id/processa', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ditta } = req.user;
    
    const trx = await db.transaction();

    try {
      // 1. Recupera la testata con la causale
      const lista = await trx('ls_liste_testata')
        .join('mg_causali_movimento', 'ls_liste_testata.id_causale_movimento', 'mg_causali_movimento.id')
        .where({ 'ls_liste_testata.id': id, 'ls_liste_testata.id_ditta': id_ditta })
        .first();
      
      if (!lista) {
        await trx.rollback();
        return res.status(404).json({ error: 'Lista non trovata o non autorizzata' });
      }

      if (lista.stato !== 'BOZZA') {
        await trx.rollback();
        return res.status(400).json({ error: 'Solo le liste in bozza possono essere processate' });
      }
      
      // 2. Recupera le righe
      const righe = await trx('ls_liste_righe')
        .where({ id_testata: id })
        .orderBy('ordine');

      if (righe.length === 0) {
        await trx.rollback();
        return res.status(400).json({ error: 'Impossibile processare una lista senza righe' });
      }
      
      // 3. Genera i movimenti
      const movimentiGenerati = [];
      for (const riga of righe) {
        // La quantità è positiva per carichi, negativa per scarichi
        const quantitaMovimento = lista.causale_tipo === 'carico' ? riga.quantita : -riga.quantita;
        
        const movimento = {
          id_ditta: lista.id_ditta,
          id_magazzino: lista.id_magazzino,
          id_causale: lista.id_causale_movimento,
          id_articolo: riga.id_articolo,
          data_movimento: lista.data_riferimento,
          quantita: quantitaMovimento,
          valore_unitario: riga.prezzo_netto || riga.prezzo_unitario,
          riferimento_doc: `Lista ${lista.codice}`,
          id_riferimento_doc: lista.id,
          note: riga.note
        };
        
        const [idMovimento] = await trx('mg_movimenti').insert(movimento);
        movimentiGenerati.push({ id: idMovimento, ...movimento });
      }
      
      // 4. Aggiorna lo stato della lista
      await trx('ls_liste_testata')
        .where({ id })
        .update({
          stato: 'PROCESSATO',
          id_documento_generato: movimentiGenerati[0].id, // Salviamo il primo ID come riferimento
          tipo_documento_generato: 'mg_movimenti',
          updated_by: req.user.id,
          updated_at: new Date()
        });
      
      await trx.commit();
      
      res.json({
        message: 'Lista processata con successo',
        documento_generato: {
          tipo: 'mg_movimenti',
          movimenti: movimentiGenerati
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/liste/prezzi/:idArticolo/:idCliente - Ottieni prezzi per articolo e cliente
router.get('/prezzi/:idArticolo/:idCliente', verifyToken, async (req, res) => {
  try {
    const { idArticolo, idCliente } = req.params;
    const { id_ditta } = req.user;

    // 1. Recupera le informazioni del cliente
    const cliente = await db('va_clienti_anagrafica')
      .where({ id: idCliente })
      .first();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    // 2. Recupera i listini dell'articolo
    const listino = await db('ct_listini')
      .where({
        id_entita_catalogo: idArticolo,
        id_ditta: id_ditta
      })
      .first();

    if (!listino) {
      return res.status(404).json({ error: 'Listino non trovato per questo articolo' });
    }

    // 3. Calcola i prezzi in base al listino del cliente
    let prezzoCessione = 0;
    let prezzoPubblico = 0;
    let listinoCessioneUsato = cliente.listino_cessione || 1;
    let listinoPubblicoUsato = cliente.listino_pubblico || 1;

    // Se non c'è un listino per il cliente, proponi tutti i listini disponibili
    if (!cliente.listino_cessione || !cliente.listino_pubblico) {
      return res.json({
        cliente: {
          id: idCliente,
          listino_cessione: cliente.listino_cessione,
          listino_pubblico: cliente.listino_pubblico
        },
        listino: {
          prezzo_cessione_1: listino.prezzo_cessione_1,
          prezzo_pubblico_1: listino.prezzo_pubblico_1,
          prezzo_cessione_2: listino.prezzo_cessione_2,
          prezzo_pubblico_2: listino.prezzo_pubblico_2,
          prezzo_cessione_3: listino.prezzo_cessione_3,
          prezzo_pubblico_3: listino.prezzo_pubblico_3,
          prezzo_cessione_4: listino.prezzo_cessione_4,
          prezzo_pubblico_4: listino.prezzo_pubblico_4,
          prezzo_cessione_5: listino.prezzo_cessione_5,
          prezzo_pubblico_5: listino.prezzo_pubblico_5,
          prezzo_cessione_6: listino.prezzo_cessione_6,
          prezzo_pubblico_6: listino.prezzo_pubblico_6
        },
        prezziCalcolati: null,
        richiestaSceltaListini: true
      });
    }

    // Calcola i prezzi in base ai listini del cliente
    prezzoCessione = listino[`prezzo_cessione_${listinoCessioneUsato}`] || 0;
    prezzoPubblico = listino[`prezzo_pubblico_${listinoPubblicoUsato}`] || 0;

    res.json({
      cliente: {
        id: idCliente,
        listino_cessione: cliente.listino_cessione,
        listino_pubblico: cliente.listino_pubblico
      },
      listino: listino,
      prezziCalcolati: {
        prezzo_cessione: prezzoCessione,
        prezzo_pubblico: prezzoPubblico,
        listino_cessione_usato: listinoCessioneUsato,
        listino_pubblico_usato: listinoPubblicoUsato
      },
      richiestaSceltaListini: false
    });

  } catch (error) {
    console.error("Errore nel recupero prezzi:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/liste/prezzi-disponibili/:idArticolo - Ottieni tutti i listini disponibili per un articolo
router.get('/prezzi-disponibili/:idArticolo', verifyToken, async (req, res) => {
  try {
    const { idArticolo } = req.params;
    const { id_ditta } = req.user;

    const listino = await db('ct_listini')
      .where({
        id_entita_catalogo: idArticolo,
        id_ditta: id_ditta
      })
      .first();

    if (!listino) {
      return res.status(404).json({ error: 'Listino non trovato per questo articolo' });
    }

    // Estrai tutti i prezzi disponibili
    const listiniDisponibili = [];
    for (let i = 1; i <= 6; i++) {
      const prezzoCessione = listino[`prezzo_cessione_${i}`];
      const prezzoPubblico = listino[`prezzo_pubblico_${i}`];

      if (prezzoCessione > 0 || prezzoPubblico > 0) {
        listiniDisponibili.push({
          numero: i,
          prezzo_cessione: prezzoCessione,
          prezzo_pubblico: prezzoPubblico,
          disponibile: true
        });
      }
    }

    res.json({
      id_articolo: idArticolo,
      listini_disponibili: listiniDisponibili
    });

  } catch (error) {
    console.error("Errore nel recupero listini disponibili:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/liste/articoli-catalogo - Ricerca articoli per il catalogo
router.get('/articoli-catalogo', verifyToken, async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    const { id_ditta } = req.user;

    let query = db('ct_catalogo')
      .select([
        'ct_catalogo.id',
        'ct_catalogo.codice_articolo',
        'ct_catalogo.descrizione',
        'ct_catalogo.unita_misura',
        'ct_categorie.descrizione as categoria_descrizione'
      ])
      .leftJoin('ct_categorie', 'ct_catalogo.id_categoria', 'ct_categorie.id')
      .where('ct_catalogo.id_ditta', id_ditta)
      .where('ct_catalogo.attivo', true)
      .limit(limit);

    if (q) {
      query = query.where(function() {
        this.where('ct_catalogo.codice_articolo', 'like', `%${q}%`)
            .orWhere('ct_catalogo.descrizione', 'like', `%${q}%`);
      });
    }

    const articoli = await query.orderBy('ct_catalogo.descrizione');

    res.json(articoli);

  } catch (error) {
    console.error("Errore nella ricerca articoli:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
