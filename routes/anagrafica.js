// routes/anagrafica.js

const express = require('express');
const router = express.Router();
const { knex: db } = require('../config/db');
const { verifyToken } = require('../utils/auth');

// GET /api/anagrafica/clienti/:id - Recupera informazioni cliente
// GET /api/anagrafica/clienti/:id - VERSIONE SUPER-DEBUG
router.get('/clienti/:id', verifyToken, async (req, res) => {
  console.log('\n=== INIZIO RICHIESTA GET /clienti/:id ===');
  
  try {
    console.log('[DEBUG 1] req.params:', req.params);
    console.log('[DEBUG 2] req.user:', req.user);

    const { id } = req.params;
    const { id_ditta } = req.user;

    if (!req.user) {
        console.error('[ERRORE] req.user è undefined o null!');
        return res.status(401).json({ error: 'Autenticazione fallita (req.user mancante).' });
    }
    if (id_ditta === undefined) {
        console.error('[ERRORE] id_ditta non è presente in req.user!');
        return res.status(400).json({ error: 'ID Ditta mancante nel token utente.' });
    }

    console.log(`[DEBUG 3] ID Cliente: ${id}, ID Ditta: ${id_ditta}`);

    const clienteId = parseInt(id, 10);
    if (isNaN(clienteId)) {
        console.error(`[ERRORE] ID Cliente non valido: ${id}`);
        return res.status(400).json({ error: 'ID cliente non valido.' });
    }

    console.log(`[DEBUG 4] Eseguo la query sul DB...`);
    const cliente = await db('va_clienti_anagrafica')
      .where({
        id: clienteId,
        id_ditta: id_ditta
      })
      .first();
    
    console.log('[DEBUG 5] Risultato della query DB:', cliente);

    if (!cliente) {
      console.log(`[DEBUG 6] Cliente non trovato.`);
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    console.log('[DEBUG 7] Invio risposta con successo');
    res.json(cliente);
  } catch (error) {
    console.error("!!! ERRORE BLOCCANTE NEL BACKEND !!!");
    console.error("Messaggio:", error.message);
    console.error("Stack Trace:", error.stack);
    console.error("!!! FINE ERRORE !!!\n");
    
    res.status(500).json({ error: `Errore interno del server: ${error.message}` });
  }
});

// GET /api/anagrafica/listini-disponibili - Recupera i listini per un articolo
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
    const { id_ditta } = req.user;

    // --- FIX FINALE: Usa la tabella corretta 'va_clienti_anagrafica' ---
    let query = db('va_clienti_anagrafica')
      .where('id_ditta', id_ditta)
      .where('stato', 'Attivo')
      .select([
        'id',
        'ragione_sociale',
        'partita_iva',
        'indirizzo',
        'cap',
        'comune',
        'provincia',
        'listino_cessione',
        'listino_pubblico'
      ])
      .limit(limit);

    if (q) {
      query = query.where(function() {
        this.where('ragione_sociale', 'like', `%${q}%`)
            .orWhere('partita_iva', 'like', `%${q}%`);
      });
    }

    const clienti = await query.orderBy('ragione_sociale', 'asc');
    res.json(clienti);
  } catch (error) {
    console.error("Errore nella ricerca clienti:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;