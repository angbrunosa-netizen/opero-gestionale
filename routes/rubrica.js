// #####################################################################
// # Rotte per la Gestione della Rubrica - v2.0 (Razionalizzato)
// # File: opero/routes/rubrica.js
// #####################################################################

const express = require('express');
const { dbPool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const router = express.Router();
// Applica il middleware di autenticazione a tutte le rotte di questo file
router.use(verifyToken);


// =====================================================================
// =================== GESTIONE CONTATTI (CRUD) ========================
// =====================================================================
/**
 * GET /api/rubrica/liste/:id/emails
 * Recupera tutti gli indirizzi email dei membri di una specifica lista.
 */
router.get('/liste/:id/emails', async (req, res) => {
    const { id: listId } = req.params;
    const { id_ditta: dittaId } = req.user;

    try {
        // Query che unisce la tabella delle associazioni con quella degli utenti
        // per recuperare le email, assicurandosi che la lista appartenga alla ditta corretta.
        const [rows] = await dbPool.query(
            `SELECT u.email 
             FROM utenti u
             JOIN lista_distribuzione_utenti ldu ON u.id = ldu.id_utente
             JOIN liste_distribuzione ld ON ldu.id_lista = ld.id
             WHERE ldu.id_lista = ? AND ld.id_ditta = ?`,
            [listId, dittaId]
        );

        // Estrae solo le email in un array semplice di stringhe
        const emails = rows.map(row => row.email);
        res.status(200).json(emails);

    } catch (error) {
        console.error("Errore nel recuperare le email dalla lista:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});

/*
 * GET /api/rubrica/contatti/:id
 * Recupera i dati completi di un singolo contatto.
 */
router.get('/contatti/:id', async (req, res) => {
    const { id: contactId } = req.params;
    const { id_ditta: dittaId } = req.user;
    try {
        const [rows] = await dbPool.query('SELECT * FROM utenti WHERE id = ? AND id_ditta = ?', [contactId, dittaId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Contatto non trovato.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero del contatto.' });
    }
});


/**
 * GET /api/rubrica/ruoli
 * Fornisce l'elenco di tutti i ruoli disponibili.
 */
router.get('/ruoli', async (req, res) => {
    try {
        const [ruoli] = await dbPool.query('SELECT id, nome_ruolo FROM ruoli ORDER BY nome_ruolo');
        res.status(200).json(ruoli);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei ruoli.' });
    }
});

/**
 * GET /api/rubrica/contatti
 * Recupera tutti i contatti (utenti) associati alla ditta dell'utente loggato.
 */
router.get('/contatti', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [contatti] = await dbPool.query(
            'SELECT id, nome, cognome, email, telefono, citta FROM utenti WHERE id_ditta = ? ORDER BY cognome, nome',
            [dittaId]
        );
        res.status(200).json(contatti);
    } catch (error) {
        console.error("Errore recupero contatti:", error);
        res.status(500).json({ message: 'Errore del server durante il recupero dei contatti.' });
    }
});

/**
 * POST /api/rubrica/contatti
 * Crea un nuovo contatto (utente esterno) per la ditta.
 */
router.post('/contatti', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { nome, cognome, email, telefono, citta } = req.body;

    if (!nome || !cognome || !email) {
        return res.status(400).json({ message: 'Nome, cognome e email sono obbligatori.' });
    }

    try {
        const newUser = {
            email, nome, cognome, telefono, citta, id_ditta: dittaId,
            mail_contatto: email, id_ruolo: 4, livello: 0, Codice_Tipo_Utente: 2, attivo: 0,
            password: 'password_provvisoria' // Password temporanea
        };
        const [result] = await dbPool.query('INSERT INTO utenti SET ?', newUser);
        
        // Recupera e restituisci il contatto appena creato per aggiornare il frontend
        const [newContactRows] = await dbPool.query('SELECT id, nome, cognome, email, telefono, citta FROM utenti WHERE id = ?', [result.insertId]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Contatto aggiunto con successo.', 
            contatto: newContactRows[0]
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        console.error("Errore creazione contatto:", error);
        res.status(500).json({ message: 'Errore del server durante la creazione del contatto.' });
    }
});

/**
 * GET /api/rubrica/tipi-utente
 * Fornisce l'elenco di tutti i tipi di utente disponibili.
 */
router.get('/tipi-utente', async (req, res) => {
    try {
        const [tipi] = await dbPool.query('SELECT codice, descrizione FROM tipi_utente ORDER BY descrizione');
        res.status(200).json(tipi);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei tipi utente.' });
    }
});

/**
 * POST /api/rubrica/contatti
 * Crea un nuovo contatto con tutti i campi anagrafici.
 */
router.post('/contatti', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { nome, cognome, email, codice_fiscale, indirizzo, citta, provincia, cap, id_ruolo, Codice_Tipo_Utente, livello, attivo, privacy, firma } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome ed Email sono obbligatori.' });
    }

    try {
        const newUser = {
            id_ditta: dittaId,
            password: 'password_provvisoria', // Imposta una password di default
            nome, cognome, email, codice_fiscale, indirizzo, citta, provincia, cap,
            id_ruolo, Codice_Tipo_Utente, livello, attivo, privacy, firma,
            mail_contatto: email // Mantiene la coerenza
        };
        const [result] = await dbPool.query('INSERT INTO utenti SET ?', newUser);
        const [newContact] = await dbPool.query('SELECT * FROM utenti WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Contatto creato.', contatto: newContact[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Un utente con questa email esiste già.' });
        }
        res.status(500).json({ message: 'Errore nella creazione del contatto.' });
    }
});

/**
 * PUT /api/rubrica/contatti/:id
 * Modifica un contatto esistente con tutti i campi anagrafici.
 */
router.put('/contatti/:id', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: contactId } = req.params;
    const { nome, cognome, email, codice_fiscale, indirizzo, citta, provincia, cap, id_ruolo, Codice_Tipo_Utente, livello, attivo, privacy, firma } = req.body;

    try {
        const fieldsToUpdate = {
            nome, cognome, email, codice_fiscale, indirizzo, citta, provincia, cap,
            id_ruolo, Codice_Tipo_Utente, livello, attivo, privacy, firma,
            mail_contatto: email
        };
        await dbPool.query('UPDATE utenti SET ? WHERE id = ? AND id_ditta = ?', [fieldsToUpdate, contactId, dittaId]);
        
        const [updatedContact] = await dbPool.query('SELECT * FROM utenti WHERE id = ?', [contactId]);
        res.json({ success: true, message: 'Contatto aggiornato.', contatto: updatedContact[0] });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'aggiornamento.' });
    }
});

/**
 * PUT /api/rubrica/contatti/:id
 * Modifica un contatto esistente.
 */
router.put('/contatti/:id', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: contactId } = req.params;
    const { nome, cognome, email, telefono, citta } = req.body;

    if (!nome || !cognome || !email) {
        return res.status(400).json({ message: 'Nome, cognome e email sono obbligatori.' });
    }

    try {
        const [updateResult] = await dbPool.query(
            'UPDATE utenti SET nome = ?, cognome = ?, email = ?, telefono = ?, citta = ? WHERE id = ? AND id_ditta = ?',
            [nome, cognome, email, telefono, citta, contactId, dittaId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Contatto non trovato o non appartenente alla tua ditta.' });
        }
        
        // Recupera e restituisci l'oggetto del contatto aggiornato
        const [updatedContactRows] = await dbPool.query('SELECT id, nome, cognome, email, telefono, citta FROM utenti WHERE id = ?', [contactId]);

        res.json({ 
            success: true, 
            message: 'Contatto aggiornato con successo.',
            contatto: updatedContactRows[0]
        });
    } catch (error) {
        console.error("Errore aggiornamento contatto:", error);
        res.status(500).json({ message: 'Errore del server durante l\'aggiornamento.' });
    }
});

/**
 * DELETE /api/rubrica/contatti/:id
 * Elimina un contatto.
 */
router.delete('/contatti/:id', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: contactId } = req.params;

    // Per sicurezza, potresti voler impedire l'eliminazione di utenti non esterni
    // o aggiungere controlli sui ruoli qui.

    try {
        const [result] = await dbPool.query('DELETE FROM utenti WHERE id = ? AND id_ditta = ?', [contactId, dittaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contatto non trovato o non appartenente alla tua ditta.' });
        }

        res.status(200).json({ success: true, message: 'Contatto eliminato con successo.' });
    } catch (error) {
        console.error("Errore eliminazione contatto:", error);
        res.status(500).json({ message: 'Errore del server durante l\'eliminazione.' });
    }
});


// =====================================================================
// ============= GESTIONE LISTE DI DISTRIBUZIONE (CRUD) ================
// =====================================================================

/**
 * GET /api/rubrica/liste
 * Recupera tutte le liste di distribuzione della ditta.
 */
router.get('/liste', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    try {
        const [lists] = await dbPool.query('SELECT id, nome_lista FROM liste_distribuzione WHERE id_ditta = ? ORDER BY nome_lista', [dittaId]);
        res.status(200).json(lists);
    } catch (error) {
        console.error("Errore recupero liste:", error);
        res.status(500).json({ message: 'Errore nel recupero delle liste.' });
    }
});

/**
 * POST /api/rubrica/liste
 * Crea una nuova lista di distribuzione.
 */
router.post('/liste', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { nome_lista } = req.body;
    if (!nome_lista) {
        return res.status(400).json({ message: 'Il nome della lista è obbligatorio.' });
    }
    try {
        const [result] = await dbPool.query('INSERT INTO liste_distribuzione (id_ditta, nome_lista) VALUES (?, ?)', [dittaId, nome_lista]);
        const [newList] = await dbPool.query('SELECT * FROM liste_distribuzione WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, message: 'Lista creata.', lista: newList[0] });
    } catch (error) {
        console.error("Errore creazione lista:", error);
        res.status(500).json({ message: 'Errore nella creazione della lista.' });
    }
});

/**
 * DELETE /api/rubrica/liste/:id
 * Elimina una lista di distribuzione e tutte le sue associazioni.
 */
router.delete('/liste/:id', async (req, res) => {
    const { id_ditta: dittaId } = req.user;
    const { id: listId } = req.params;
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        // Prima elimina le associazioni utenti-lista
        await connection.query('DELETE FROM lista_distribuzione_utenti WHERE id_lista = ?', [listId]);
        
        // Poi elimina la lista stessa, controllando che appartenga alla ditta corretta
        const [result] = await connection.query('DELETE FROM liste_distribuzione WHERE id = ? AND id_ditta = ?', [listId, dittaId]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Lista non trovata o non appartenente alla tua ditta.' });
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Lista eliminata con successo.' });
    } catch (error) {
        await connection.rollback();
        console.error("Errore eliminazione lista:", error);
        res.status(500).json({ message: 'Errore del server durante l\'eliminazione.' });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/rubrica/liste/:id/utenti
 * Recupera tutti gli utenti membri di una specifica lista.
 */
router.get('/liste/:id/members', async (req, res) => {
    const { id: listId } = req.params;
    try {
        const [users] = await dbPool.query('SELECT id_utente FROM lista_distribuzione_utenti WHERE id_lista = ?', [listId]);
        const [ditte] = await dbPool.query('SELECT id_ditta FROM lista_distribuzione_ditte WHERE id_lista = ?', [listId]);

        const members = [
            ...users.map(u => `user-${u.id_utente}`),
            ...ditte.map(d => `ditta-${d.id_ditta}`)
        ];
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei membri della lista.' });
    }
});

// SOSTITUISCI la vecchia rotta POST /liste/:id/utenti CON QUESTA:
/**
 * POST /api/rubrica/liste/:id/members
 * Aggiorna l'elenco completo dei membri (utenti e ditte) di una lista.
 */
router.post('/liste/:id/members', async (req, res) => {
    const { id: listId } = req.params;
    const { memberIds } = req.body; // Es: ['user-1', 'ditta-5', 'user-12']

    const userIds = memberIds.filter(id => id.startsWith('user-')).map(id => id.replace('user-', ''));
    const dittaIds = memberIds.filter(id => id.startsWith('ditta-')).map(id => id.replace('ditta-', ''));

    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        // Svuota le associazioni esistenti
        await connection.query('DELETE FROM lista_distribuzione_utenti WHERE id_lista = ?', [listId]);
        await connection.query('DELETE FROM lista_distribuzione_ditte WHERE id_lista = ?', [listId]);

        // Inserisci le nuove associazioni per gli utenti
        if (userIds.length > 0) {
            const userValues = userIds.map(userId => [listId, userId]);
            await connection.query('INSERT INTO lista_distribuzione_utenti (id_lista, id_utente) VALUES ?', [userValues]);
        }

        // Inserisci le nuove associazioni per le ditte
        if (dittaIds.length > 0) {
            const dittaValues = dittaIds.map(dittaId => [listId, dittaId]);
            await connection.query('INSERT INTO lista_distribuzione_ditte (id_lista, id_ditta) VALUES ?', [dittaValues]);
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Membri della lista aggiornati.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Errore durante l\'aggiornamento dei membri.' });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/rubrica/contatti/:id/liste
 * Recupera gli ID di tutte le liste a cui un utente è iscritto.
 */
router.get('/contatti/:id/liste', async (req, res) => {
    const { id: contactId } = req.params;
    try {
        const [lists] = await dbPool.query(
            'SELECT id_lista FROM lista_distribuzione_utenti WHERE id_utente = ?',
            [contactId]
        );
        // Restituisce un array semplice di ID, es: [1, 5, 12]
        res.status(200).json(lists.map(l => l.id_lista));
    } catch (error) {
        res.status(500).json({ message: 'Errore recupero iscrizioni utente.' });
    }
});

/**
 * POST /api/rubrica/contatti/:id/liste
 * Aggiorna l'elenco completo delle liste per un utente.
 */
router.post('/contatti/:id/liste', async (req, res) => {
    const { id: contactId } = req.params;
    const { listIds } = req.body; // Array di ID lista
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM lista_distribuzione_utenti WHERE id_utente = ?', [contactId]);
        if (listIds && listIds.length > 0) {
            const values = listIds.map(listId => [listId, contactId]);
            await connection.query('INSERT INTO lista_distribuzione_utenti (id_lista, id_utente) VALUES ?', [values]);
        }
        await connection.commit();
        res.status(200).json({ success: true, message: 'Iscrizioni dell\'utente aggiornate.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Errore durante l\'aggiornamento delle iscrizioni.' });
    } finally {
        connection.release();
    }
});

// Aggiungi questo codice nel tuo file /routes/rubrica.js

/**
 * GET /api/rubrica/all-contacts
 * Recupera un elenco unificato di contatti (utenti e ditte).
 */
router.get('/all-contacts', async (req, res) => {
    const { id_ditta: dittaId } = req.user;

    try {
        // 1. Recupera gli utenti
        const [users] = await dbPool.query(
            'SELECT id, nome, cognome, email FROM utenti WHERE id_ditta = ? AND attivo = 1',
            [dittaId]
        );
        const userContacts = users.map(u => ({
            id: `user-${u.id}`,
            type: 'user',
            displayName: `${u.nome} ${u.cognome}`,
            email: u.email
        }));

        // 2. Recupera le ditte (clienti, fornitori, etc.)
        const [ditte] = await dbPool.query(
            'SELECT id, ragione_sociale, citta, provincia, mail_1 FROM ditte WHERE id_ditta_proprietaria = ? AND stato = 1',
            [dittaId]
        );
        const dittaContacts = ditte.map(d => ({
            id: `ditta-${d.id}`,
            type: 'ditta',
            displayName: d.ragione_sociale,
            email: d.mail_1,
            secondaryInfo: `${d.citta || ''} (${d.provincia || ''})`
        }));

        // 3. Unisci e invia i risultati
        const allContacts = [...userContacts, ...dittaContacts];
        res.json(allContacts);

    } catch (error) {
        console.error("Errore nel recuperare i contatti unificati:", error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});

module.exports = router;
