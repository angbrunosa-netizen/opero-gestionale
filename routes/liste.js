// routes/liste.js

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
        .first({
          'ls_liste_testata.*',
          'causale_tipo': 'mg_causali_movimento.tipo'
        });
      
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

module.exports = router;
