const express = require('express');
const router = express.Router();
const { knex: db } = require('../config/db');
const { verifyToken } = require('../utils/auth');

// GET /api/anagrafica/clienti/:id - Recupera informazioni completo di un cliente
router.get('/clienti/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_ditta } = req.user; // Questo è l'id_ditta_proprietaria

    const clienteId = parseInt(id, 10);
    if (isNaN(clienteId)) {
      return res.status(400).json({ error: 'ID cliente non valido.' });
    }

    // --- QUERY CORRETTA ---
    // Prende i dati principali dalla tabella `ditte` e li unisce con i dettagli opzionali
    const cliente = await db('ditte as d')
      .leftJoin('va_clienti_anagrafica as vca', 'd.id', 'vca.id_ditta')
      .leftJoin('va_categorie_clienti as cat', 'vca.id_categoria_cliente', 'cat.id')
      .leftJoin('va_gruppi_clienti as grp', 'vca.id_gruppo_cliente', 'grp.id')
      .leftJoin('tipi_pagamento as tp', 'vca.id_tipo_pagamento', 'tp.id')
      // NOTA: La tabella 'va_contratti' non esiste, quindi la join è commentata per evitare errori.
      // .leftJoin('va_contratti as contr', 'vca.id_contratto', 'contr.id')
      .where({
        'd.id': clienteId,
        'd.id_ditta_proprietaria': id_ditta // Filtra per la ditta principale
      })
      .first();

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente non trovato.' });
    }

    // Costruisce l'oggetto di risposta unendo i dati di entrambe le tabelle
    const response = {
      // Dati principali dalla tabella `ditte`
      id: cliente.id,
      ragione_sociale: cliente.ragione_sociale,
      partita_iva: cliente.p_iva,
      codice_fiscale: cliente.codice_fiscale,
      stato: cliente.stato, // 1 = Attivo, 0 = Non Attivo
      indirizzo: cliente.indirizzo,
      citta: cliente.citta,
      cap: cliente.cap,
      provincia: cliente.provincia,
      
      // Dati opzionali dalla tabella `va_clienti_anagrafica` (potrebbero essere null)
      listino_cessione: cliente.listino_cessione,
      listino_pubblico: cliente.listino_pubblico,
      id_categoria_cliente: cliente.id_categoria_cliente,
      nome_categoria_cliente: cliente.nome_categoria_cliente,
      id_gruppo_cliente: cliente.id_gruppo_cliente,
      descrizione_gruppo_cliente: cliente.descrizione_gruppo_cliente,
      id_tipo_pagamento: cliente.id_tipo_pagamento,
      descrizione_tipo_pagamento: cliente.descrizione_tipo_pagamento,
      // descrizione_contratto: cliente.descrizione_contratto // Commentato perché la tabella non esiste
    };

    res.json(response);
  } catch (error) {
    console.error("ERRORE nel recupero cliente:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/anagrafica/listini-disponibili - Recupera i listini per un articolo (o tutti)
router.get('/listini-disponibili', verifyToken, async (req, res) => {
  try {
    const { id_ditta } = req.user;
    const { id_articolo } = req.query;

    let query = db('ct_listini').where('id_ditta', id_ditta);
    if (id_articolo) {
        query = query.where('id_entita_catalogo', id_articolo);
    }
    const listiniDb = await query.select('*');

    const listiniDisponibili = [];
    const numeriListiniUnici = new Set();

    listiniDb.forEach(listino => {
        for (let i = 1; i <= 6; i++) {
            if (listino[`prezzo_cessione_${i}`] !== null || listino[`prezzo_pubblico_${i}`] !== null) {
                numeriListiniUnici.add(i);
            }
        }
    });

    numeriListiniUnici.forEach(numero => {
        const listinoCorrente = listiniDb.find(l => 
            (l[`prezzo_cessione_${numero}`] !== null || l[`prezzo_pubblico_${numero}`] !== null)
        );
        if (listinoCorrente) {
            listiniDisponibili.push({
                numero: numero,
                prezzo_cessione: listinoCorrente[`prezzo_cessione_${numero}`] || 0,
                prezzo_pubblico: listinoCorrente[`prezzo_pubblico_${numero}`] || 0,
            });
        }
    });

    res.json(listiniDisponibili);
  } catch (error) {
    console.error("Errore nel recupero listini disponibili:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/anagrafica/clienti - Ricerca clienti
router.get('/clienti', verifyToken, async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    const { id_ditta } = req.user; // id_ditta_proprietaria

    let query = db('ditte as d')
      .leftJoin('va_clienti_anagrafica as vca', 'd.id', 'vca.id_ditta')
      .where('d.id_ditta_proprietaria', id_ditta)
      .where('d.stato', 1) // 1 = Attivo
      .select([
        'd.id',
        'd.ragione_sociale',
        'd.p_iva as partita_iva',
        'd.indirizzo',
        'd.cap',
        'd.citta',
        'd.provincia',
        'vca.listino_cessione',
        'vca.listino_pubblico'
      ])
      .limit(limit);

    if (q) {
      query = query.where(function() {
        this.where('d.ragione_sociale', 'like', `%${q}%`)
            .orWhere('d.p_iva', 'like', `%${q}%`);
      });
    }

    const clienti = await query.orderBy('d.ragione_sociale', 'asc');
    res.json(clienti);
  } catch (error) {
    console.error("Errore nella ricerca clienti:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;