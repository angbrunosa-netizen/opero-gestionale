// #####################################################################
// # Rotte per il Modulo Amministrazione - v3.6 (Logica Conti Dinamici)
// # File: opero/routes/amministrazione.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

// --- Funzione Helper per trovare il prossimo SOTTOCONTO disponibile ---
async function findNextAvailableSottoconto(dittaId, contoId, connection) {
    const query = `
        SELECT MAX(CAST(codice AS UNSIGNED)) as last_sottoconto
        FROM sottoconti 
        WHERE id_ditta = ? AND id_conto = ?
    `;
    const [rows] = await connection.query(query, [dittaId, contoId]);
    const lastSottoconto = rows[0].last_sottoconto || 0;
    return (lastSottoconto + 1).toString().padStart(6, '0');
}

// --- NUOVA ROTTA: GET (Lista Conti per Mastro) ---
router.get('/conti/:mastro', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { mastro } = req.params;

    if (!dittaId || !mastro) {
        return res.status(400).json({ success: false, message: 'ID ditta e codice mastro sono richiesti.' });
    }

    try {
        const query = "SELECT id, codice, descrizione FROM conti WHERE id_ditta = ? AND codice LIKE ? ORDER BY codice ASC";
        const [rows] = await dbPool.query(query, [dittaId, `${mastro}%`]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(`Errore nel recuperare i conti per il mastro ${mastro}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Lista Relazioni Ditta) ---
router.get('/relazioni', verifyToken, async (req, res) => {
    try {
        const query = "SELECT codice, descrizione FROM relazioni_ditta ORDER BY descrizione ASC";
        const [rows] = await dbPool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore nel recuperare le relazioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// --- GET (Lista Anagrafiche) ---
router.get('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    if (!dittaId) return res.status(400).json({ success: false, message: 'ID ditta non trovato.' });

    try {
        const query = `
            SELECT a.id, a.ragione_sociale, a.p_iva, a.codice_fiscale, a.stato, 
                   r.descrizione AS relazione, a.id_conto_collegato
            FROM ditte a 
            LEFT JOIN relazioni_ditta r ON a.codice_relazione = r.codice
            WHERE a.id_ditta_proprietaria = ? ORDER BY a.ragione_sociale ASC
        `;
        const [rows] = await dbPool.query(query, [dittaId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Errore recupero anagrafiche:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// --- GET (Dettaglio Anagrafica) ---
router.get('/anagrafiche/:id', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    if (!dittaId) return res.status(400).json({ success: false, message: 'ID ditta non trovato.' });

    try {
        const query = `
            SELECT d.*, s.id_conto 
            FROM ditte d
            LEFT JOIN sottoconti s ON d.id_conto_collegato = s.id
            WHERE d.id = ? AND d.id_ditta_proprietaria = ?
        `;
        const [rows] = await dbPool.query(query, [id, dittaId]);

        if (rows.length > 0) {
            res.json({ success: true, data: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Anagrafica non trovata.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore recupero dettaglio.' });
    }
});


// --- POST (Crea Anagrafica con SOTTOCONTO sotto un CONTO specifico) ---
router.post('/anagrafiche', verifyToken, async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const anagraficaData = req.body;
    const { id_conto, ragione_sociale } = anagraficaData; // id_conto è l'ID del CONTO PADRE scelto

    if (!id_conto) {
        return res.status(400).json({ success: false, message: 'È necessario selezionare un conto a cui collegare l\'anagrafica.' });
    }

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const nuovoSottocontoCodice = await findNextAvailableSottoconto(dittaId, id_conto, connection);
        
        const [sottocontoResult] = await connection.query(
            'INSERT INTO sottoconti (id_ditta, id_conto, codice, descrizione) VALUES (?, ?, ?, ?)',
            [dittaId, id_conto, nuovoSottocontoCodice, ragione_sociale]
        );
        const nuovoSottocontoId = sottocontoResult.insertId;

        const dittaToInsert = { ...anagraficaData, id_ditta_proprietaria: dittaId, id_conto_collegato: nuovoSottocontoId };
        delete dittaToInsert.id;
        delete dittaToInsert.id_conto; // Rimuoviamo il campo temporaneo

        const fields = Object.keys(dittaToInsert);
        const values = Object.values(dittaToInsert);
        const placeholders = fields.map(() => '?').join(',');

        const [result] = await connection.query(`INSERT INTO ditte (${fields.join(',')}) VALUES (${placeholders})`, values);
        
        await connection.commit();
        res.status(201).json({ success: true, message: 'Anagrafica e sottoconto creati.', insertId: result.insertId });

    } catch (error) {
        await connection.rollback();
        console.error("Errore creazione anagrafica:", error);
        res.status(500).json({ success: false, message: error.message || 'Errore durante la creazione.' });
    } finally {
        connection.release();
    }
});

// --- PATCH (Aggiorna Anagrafica e SOTTOCONTO) ---
router.patch('/anagrafiche/:id', verifyToken, async (req, res) => {
    // La logica di modifica del conto/sottoconto è complessa e richiede
    // una gestione attenta per evitare dati inconsistenti.
    // Per ora, ci concentriamo sull'aggiornamento dei dati anagrafici.
    // La modifica del conto collegato verrà implementata in un secondo momento.
    const { id_ditta: dittaId } = req.user;
    const { id } = req.params;
    const anagraficaData = req.body;

    // Per ora, non permettiamo la modifica del conto collegato tramite questa rotta
    delete anagraficaData.id_conto_collegato;
    delete anagraficaData.id_conto;
    delete anagraficaData.id;

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();

        const fields = Object.keys(anagraficaData).map(key => `${key} = ?`).join(',');
        const values = [...Object.values(anagraficaData), id, dittaId];
        await connection.query(`UPDATE ditte SET ${fields} WHERE id = ? AND id_ditta_proprietaria = ?`, values);
        
        // Se la ragione sociale cambia, aggiorniamo la descrizione del sottoconto
        if (anagraficaData.ragione_sociale) {
            const [ditta] = await connection.query('SELECT id_conto_collegato FROM ditte WHERE id = ?', [id]);
            if (ditta.length > 0 && ditta[0].id_conto_collegato) {
                await connection.query(
                    'UPDATE sottoconti SET descrizione = ? WHERE id_ditta = ? AND id = ?',
                    [anagraficaData.ragione_sociale, dittaId, ditta[0].id_conto_collegato]
                );
            }
        }
        
        await connection.commit();
        res.json({ success: true, message: 'Anagrafica aggiornata con successo.' });

    } catch (error) {
        await connection.rollback();
        console.error("Errore aggiornamento anagrafica:", error);
        res.status(500).json({ success: false, message: 'Errore durante l\'aggiornamento.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
