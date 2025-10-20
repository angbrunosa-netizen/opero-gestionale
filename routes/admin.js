// #####################################################################
// # Rotte di Amministrazione Sistema - v8.0 (Fix Definitivo con 'knex')
// # File: opero/routes/admin.js
// # Utilizza 'knex' per tutte le operazioni di query builder, risolvendo il TypeError.
// #####################################################################

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
// ❗ FIX DEFINITIVO: Importiamo e usiamo 'knex' per il query builder.
const { knex } = require('../config/db'); 
const { verifyToken, checkRole, checkPermission } = require('../utils/auth');
const { dbPool } = require('../config/db');
// Middleware per i ruoli
const isSystemAdmin = checkRole([1]); 
const isDittaAdmin = checkRole([1, 2]);

const { v4: uuidv4 } = require('uuid');
const mailer = require('../utils/mailer');

// ====================================================================
// API GESTIONE DITTE (Accesso Esclusivo per System Admin)
// ====================================================================

router.get('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const ditte = await knex('ditte as d')
            .leftJoin('tipo_ditta as td', 'd.id_tipo_ditta', 'td.id')
            .select('d.*', 'td.tipo as tipo_ditta_nome')
            .orderBy('d.ragione_sociale');
        res.json({ success: true, ditte });
    } catch (error) {
        console.error("Errore nel recupero delle ditte:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle ditte.' });
    }
});

router.post('/ditte', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id, ...dittaData } = req.body;
    try {
        if (id) {
            await knex('ditte').where({ id }).update(dittaData);
            res.json({ success: true, message: 'Ditta aggiornata con successo.', id_ditta: id });
        } else {
            const [newId] = await knex('ditte').insert(dittaData);
            res.status(201).json({ success: true, message: 'Ditta creata con successo.', id_ditta: newId });
        }
    } catch (error) {
        console.error("Errore salvataggio ditta:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della ditta.' });
    }
});

// ++ INIZIO NUOVO CODICE: API PER MODIFICARE UNA DITTA (ES. CAMBIO STATO) ++
router.patch('/ditte/:id', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id } = req.params;
    const {
        ragione_sociale,
        p_iva,
        codice_fiscale,
        indirizzo,
        citta,
        provincia,
        cap,
        tel1,
        email_gen, // Assicurati che il nome corrisponda
        pec,
        id_tipo_ditta,
        stato,
        max_utenti_interni, // ++ CAMPO AGGIUNTO ++
        max_utenti_esterni  // ++ CAMPO AGGIUNTO ++
    } = req.body;

    // Costruiamo l'oggetto solo con i campi definiti per evitare di passare 'undefined'
    const dittaData = {};
    if (ragione_sociale !== undefined) dittaData.ragione_sociale = ragione_sociale;
    if (p_iva !== undefined) dittaData.p_iva = p_iva;
    if (codice_fiscale !== undefined) dittaData.codice_fiscale = codice_fiscale;
    if (indirizzo !== undefined) dittaData.indirizzo = indirizzo;
    if (citta !== undefined) dittaData.citta = citta;
    if (provincia !== undefined) dittaData.provincia = provincia;
    if (cap !== undefined) dittaData.cap = cap;
    if (tel1 !== undefined) dittaData.tel1 = tel1;
    if (email_gen !== undefined) dittaData.email = email_gen; // Nota: il campo nel DB è 'email'
    if (pec !== undefined) dittaData.pec = pec;
    if (id_tipo_ditta !== undefined) dittaData.id_tipo_ditta = id_tipo_ditta;
    if (stato !== undefined) dittaData.stato = stato;
    // ++ INCLUDIAMO I CAMPI UTENTI NELL'AGGIORNAMENTO ++
    if (max_utenti_interni !== undefined) dittaData.max_utenti_interni = max_utenti_interni;
    if (max_utenti_esterni !== undefined) dittaData.max_utenti_esterni = max_utenti_esterni;
    

    try {
        const result = await knex('ditte').where({ id }).update(dittaData);
        if (result) {
            res.json({ success: true, message: 'Ditta aggiornata con successo.' });
        } else {
            res.status(404).json({ success: false, message: 'Ditta non trovata.' });
        }
           // Log dell'azione (opzionale ma consigliato)
        const dettagliLog = `Stato: ${stato}, Utenti Interni: ${max_utenti_interni}, Utenti Esterni: ${max_utenti_esterni}`;
        await knex('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta: req.user.id_ditta,
            azione: 'AGGIORNAMENTO_DITTA',
            descrizione: `L'utente admin ${req.user.id} ha modificato la ditta ID ${id}. Dettagli: ${dettagliLog}`,
            modulo: 'Admin'
        });
        
    } catch (error) {
        console.error("Errore durante l'aggiornamento della ditta:", error);
        res.status(500).json({ success: false, message: "Errore interno del server." });
    }
});


// ====================================================================
// API GESTIONE UTENTI (Accesso per Amministratori di Ditta)
// ====================================================================

// --- NUOVA ROTTA ---
// GET: Ottiene l'elenco delle ditte associate a un singolo utente
router.get('/utenti/:id/ditte', [verifyToken, checkPermission('ADMIN_USER_PERMISSIONS_MANAGE')], async (req, res) => {
    const { id: id_utente_target } = req.params;

    try {
        // La query UNION combina i risultati da entrambe le fonti (moderna e legacy)
        // ed elimina i duplicati automaticamente.
        const ditteAssociateQuery = `
            (SELECT d.id, d.ragione_sociale FROM ad_utenti_ditte aud JOIN ditte d ON aud.id_ditta = d.id WHERE aud.id_utente = ? AND aud.stato = 'attivo')
            UNION
            (SELECT d.id, d.ragione_sociale FROM utenti u JOIN ditte d ON u.id_ditta = d.id WHERE u.id = ? AND u.id_ditta IS NOT NULL)
        `;
        const [ditteRows] = await dbPool.query(ditteAssociateQuery, [id_utente_target, id_utente_target]);
        
        res.json(ditteRows);

    } catch (error) {
        console.error("Errore nel recupero delle ditte associate all'utente:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});



// rotta utenti ditta id_ditta aggiornata nuova logica 20/10




router.get('/utenti/ditta/:id_ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    const requester = req.user;

    // Sicurezza: Un Ditta Admin può vedere solo gli utenti della propria ditta.
    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    try {
        const utenti = await knex('ad_utenti_ditte as aud')
            .join('utenti as u', 'aud.id_utente', 'u.id')
            .join('ruoli as r', 'aud.id_ruolo', 'r.id')
            .where('aud.id_ditta', id_ditta)
            .select(
                'u.id as id', // *** CORREZIONE CRUCIALE per compatibilità frontend ***
                'aud.id as id_associazione',
                knex.raw('CONCAT(u.nome, " ", u.cognome) as username'),
                'u.email',
                'aud.id_ruolo',
                'r.tipo as nome_ruolo',
                'aud.stato'
            );
        res.json({ success: true, utenti });
    } catch (error) {
        console.error(`Errore recupero utenti per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: "Errore nel recupero degli utenti." });
    }
});



router.post('/utenti', [verifyToken, isDittaAdmin], async (req, res) => {
    // Il 'id' si riferisce a utenti.id per mantenere la compatibilità con il frontend
    const { id, password, ...userData } = req.body;
    const requester = req.user;
    const id_ditta_operativa = userData.id_ditta || requester.id_ditta;

    // --- Controlli di Sicurezza ---
    if (requester.id_ruolo === 2) { // Se è un Ditta Admin
        if (parseInt(id_ditta_operativa, 10) !== requester.id_ditta) {
            return res.status(403).json({ success: false, message: 'Non autorizzato a gestire utenti per altre ditte.' });
        }
        if (userData.id_ruolo && parseInt(userData.id_ruolo, 10) <= 2) {
            return res.status(403).json({ success: false, message: 'Non autorizzato ad assegnare ruoli di amministratore.' });
        }
    }

    const datiAnagrafici = {
        nome: userData.nome,
        cognome: userData.cognome,
        email: userData.email,
    };

    if (password) {
        datiAnagrafici.password = await bcrypt.hash(password, 10);
    }

    const trx = await knex.transaction(); // Avvia la transazione
    try {
        if (id) { // --- LOGICA DI AGGIORNAMENTO ---
            // 1. Aggiorna dati anagrafici in 'utenti' (se ce ne sono)
            if (Object.keys(datiAnagrafici).some(key => datiAnagrafici[key] !== undefined)) {
                 await trx('utenti').where({ id }).update(datiAnagrafici);
            }

            // 2. Aggiorna dati di associazione in 'ad_utenti_ditte'
            const datiAssociazione = {
                id_ruolo: userData.id_ruolo,
                Codice_Tipo_Utente: userData.Codice_Tipo_Utente,
                stato: userData.stato
            };
            // Rimuovi chiavi non definite per non sovrascrivere con 'null'
            Object.keys(datiAssociazione).forEach(key => datiAssociazione[key] === undefined && delete datiAssociazione[key]);

            if (Object.keys(datiAssociazione).length > 0) {
                 await trx('ad_utenti_ditte')
                    .where({ id_utente: id, id_ditta: requester.id_ditta }) // Aggiorna l'associazione nel contesto della ditta corrente
                    .update(datiAssociazione);
            }
            
            await trx('log_azioni').insert({
                id_utente: requester.id,
                azione: `Aggiornamento utente ${id} per ditta ${requester.id_ditta}`,
                dettagli: JSON.stringify(userData)
            });

            await trx.commit();
            res.json({ success: true, message: 'Utente aggiornato con successo.' });

        } else { // --- LOGICA DI CREAZIONE ---
            let targetUserId;
            const utenteEsistente = await trx('utenti').where('email', userData.email).first();

            if (utenteEsistente) {
                targetUserId = utenteEsistente.id;
                const associazioneEsistente = await trx('ad_utenti_ditte')
                    .where({ id_utente: targetUserId, id_ditta: userData.id_ditta })
                    .first();
                if (associazioneEsistente) {
                    await trx.rollback();
                    return res.status(409).json({ success: false, message: 'Questo utente è già associato a questa ditta.' });
                }
            } else {
                if (!password) {
                    await trx.rollback();
                    return res.status(400).json({ success: false, message: 'La password è obbligatoria per i nuovi utenti.' });
                }
                const [newUserId] = await trx('utenti').insert(datiAnagrafici).returning('id');
                targetUserId = newUserId;
            }

            const datiNuovaAssociazione = {
                id_utente: targetUserId,
                id_ditta: userData.id_ditta,
                id_ruolo: userData.id_ruolo,
                Codice_Tipo_Utente: userData.Codice_Tipo_Utente,
                stato: userData.stato || 'attivo'
            };
            await trx('ad_utenti_ditte').insert(datiNuovaAssociazione);
            
            await trx('log_azioni').insert({
                id_utente: requester.id,
                azione: `Creazione associazione utente ${targetUserId} a ditta ${userData.id_ditta}`,
                dettagli: JSON.stringify(datiNuovaAssociazione)
            });

            await trx.commit();
            res.status(201).json({ success: true, message: 'Utente creato e associato con successo.' });
        }
    } catch (error) {
        await trx.rollback();
        console.error("Errore salvataggio utente:", error);
        if (error.code === 'ER_DUP_ENTRY' && error.message.includes('utenti.email_unique')) {
            return res.status(409).json({ success: false, message: 'L\'email fornita è già in uso.' });
        }
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio dell\'utente.' });
    }
});


router.delete('/utenti/:id', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

    try {
        const userToDelete = await knex('utenti').select('id_ditta', 'id_ruolo').where({ id }).first();
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        if (requester.id_ruolo === 2) {
            if (userToDelete.id_ditta !== requester.id_ditta) {
                return res.status(403).json({ success: false, message: 'Non autorizzato a eliminare utenti di altre ditte.' });
            }
            if (userToDelete.id_ruolo <= 2) {
                return res.status(403).json({ success: false, message: 'Non autorizzato a eliminare utenti amministratori.' });
            }
        }
        
        await knex('utenti').where({ id }).del();
        res.json({ success: true, message: 'Utente eliminato con successo.' });

    } catch (error) {
        console.error(`Errore eliminazione utente ${id}:`, error);
        res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione dell\'utente.' });
    }
});

// rotta utenti ditta id_ditta aggiornata nuova logica 20/10
router.get('/utenti/:id', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id: id_utente } = req.params; // L'ID nell'URL è l'id_utente
    const requester = req.user;

    try {
        // La query cerca l'associazione specifica tra l'utente richiesto e la ditta dell'admin.
        const utente = await knex('ad_utenti_ditte as aud')
            .join('utenti as u', 'aud.id_utente', 'u.id')
            .select(
                'u.id as id_utente',
                'u.nome',
                'u.cognome',
                'u.email',
                'aud.id as id_associazione',
                'aud.id_ditta',
                'aud.id_ruolo',
                'aud.Codice_Tipo_Utente',
                'aud.stato'
            )
            .where('aud.id_utente', id_utente)
            .andWhere('aud.id_ditta', requester.id_ditta) // Filtra per la ditta del richiedente
            .first();

        if (!utente) {
            // Se non c'è un'associazione per quella ditta, l'utente non viene trovato (corretto e sicuro).
            return res.status(404).json({ success: false, message: 'Utente non trovato in questa ditta.' });
        }

        // Il vecchio controllo di sicurezza non è più necessario perché è gestito dalla query.
        res.json({ success: true, utente });

    } catch (error) {
        console.error(`Errore nel recupero dell'utente ${id_utente}:`, error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

// ====================================================================
// API GESTIONE MODULI e ASSOCIAZIONI (Solo System Admin)
// ====================================================================

router.get('/moduli', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const moduli = await knex('moduli')
            .select({ id: 'codice', nome_modulo: 'descrizione' })
            .orderBy('descrizione');
        res.json({ success: true, moduli });
    } catch (error) {
        console.error("Errore nel recupero dei moduli:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei moduli.' });
    }
});

router.get('/associazioni/:id_ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    try {
        const moduliAssociati = await knex('ditte_moduli').where({ id_ditta }).pluck('codice_modulo');
        res.json({ success: true, moduli: moduliAssociati });
    } catch (error) {
        console.error(`Errore recupero associazioni per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle associazioni.' });
    }
});

router.post('/salva-associazioni', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta, moduli } = req.body;
    try {
        await knex.transaction(async trx => {
            await trx('ditte_moduli').where({ id_ditta }).del();
            if (moduli && moduli.length > 0) {
                const values = moduli.map(codice_modulo => ({ id_ditta, codice_modulo }));
                await trx('ditte_moduli').insert(values);
            }
        });
        res.json({ success: true, message: 'Associazioni salvate con successo.' });
    } catch (error) {
        console.error("Errore salvataggio associazioni:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio delle associazioni.' });
    }
});

// ====================================================================
// API GESTIONE PRIVACY POLICY 
// ====================================================================

router.get('/privacy-ditta/:id_ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    const requester = req.user;

    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    try {
        const privacy = await knex("privacy_policies")
            .select('responsabile_trattamento', 'corpo_lettera')
            .where({ id_ditta })
            .first();
        res.json({ success: true, privacy: privacy || null });
    } catch (error) {
        console.error(`Errore recupero privacy per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: 'Errore durante il recupero della policy.' });
    }
});

router.post('/privacy-ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta, responsabile_trattamento, corpo_lettera } = req.body;
    const requester = req.user;

    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }
    
    const data = {
        id_ditta,
        responsabile_trattamento,
        corpo_lettera,
        data_aggiornamento: knex.fn.now()
    };

    try {
        await knex('privacy_policies').insert(data).onConflict('id_ditta').merge();
        res.json({ success: true, message: 'Privacy policy salvata con successo.' });
    } catch (error) {
        console.error("Errore salvataggio privacy policy:", error);
        res.status(500).json({ success: false, message: 'Errore durante il salvataggio della policy.' });
    }
});

// ====================================================================
// API PER TABELLE DI SUPPORTO
// ====================================================================

router.get('/ruoli', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        let query = knex('ruoli').select({ id: 'id', ruolo: 'tipo' });
        if (req.user.id_ruolo !== 1) {
            query = query.where('id', '>', req.user.id_ruolo);
        }
        const ruoli = await query.orderBy('id');
        res.json({ success: true, ruoli });
    } catch (error) {
        console.error("Errore nel recupero dei ruoli:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero dei ruoli.' });
    }
});

// ====================================================================
// API GESTIONE FUNZIONI DI SISTEMA (CRUD - Solo System Admin)
// ====================================================================

router.get('/funzioni', [verifyToken, isSystemAdmin, checkPermission('ADMIN_FUNZIONI_VIEW')], async (req, res) => {
    try {
        const funzioni = await knex('funzioni').select('*').orderBy('codice');
        res.json({ success: true, funzioni });
    } catch (error) {
        console.error("Errore nel recupero delle funzioni:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.post('/funzioni', [verifyToken, isSystemAdmin, checkPermission('FUNZIONI_MANAGE')], async (req, res) => {
    const { codice, descrizione, chiave_componente_modulo } = req.body;
    const id_utente = req.user?.id_utente;

    if (!codice || !descrizione || !chiave_componente_modulo) {
        return res.status(400).json({ message: 'Codice, descrizione e modulo sono obbligatori.' });
    }

    try {
        const [id] = await knex('funzioni').insert({
            codice,
            descrizione,
            chiave_componente_modulo
        });

        if (id_utente) {
            await knex('log_azioni').insert({
                id_utente: id_utente,
                tipo_azione: 'CREATE',
                descrizione: `L'utente ha creato la funzione con codice: ${codice}`,
                tabella_riferimento: 'funzioni',
                id_riferimento: id
            });
        }
        res.status(201).json({ id, codice, descrizione, chiave_componente_modulo });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Il codice funzione '${codice}' esiste già.` });
        }
        console.error("Errore nella creazione della funzione:", error);
        res.status(500).json({ message: 'Errore del server durante la creazione della funzione.' });
    }
});

router.put('/funzioni/:id', [verifyToken, isSystemAdmin, checkPermission('FUNZIONI_MANAGE')], async (req, res) => {
    const { id } = req.params;
    const { descrizione, chiave_componente_modulo } = req.body;
    const id_utente = req.user?.id_utente;

    if (!descrizione || !chiave_componente_modulo) {
        return res.status(400).json({ message: 'Descrizione e modulo sono obbligatori.' });
    }

    try {
        const updated = await knex('funzioni').where({ id }).update({
            descrizione,
            chiave_componente_modulo
        });

        if (updated === 0) {
            return res.status(404).json({ message: 'Funzione non trovata.' });
        }

        if (id_utente) {
            await knex('log_azioni').insert({
                id_utente: id_utente,
                tipo_azione: 'UPDATE',
                descrizione: `L'utente ha aggiornato la funzione con ID: ${id}`,
                tabella_riferimento: 'funzioni',
                id_riferimento: id
            });
        }
        res.json({ message: 'Funzione aggiornata con successo.' });
    } catch (error) {
        console.error("Errore nell'aggiornamento della funzione:", error);
        res.status(500).json({ message: "Errore del server durante l'aggiornamento della funzione." });
    }
});

router.delete('/funzioni/:id', [verifyToken, isSystemAdmin, checkPermission('FUNZIONI_MANAGE')], async (req, res) => {
    const { id } = req.params;
    const id_utente = req.user?.id_utente;

    try {
        await knex.transaction(async trx => {
            await trx('ruoli_funzioni').where('id_funzione', id).del();
            const count = await trx('funzioni').where({ id }).del();
            if (count === 0) {
                throw new Error('Funzione non trovata.');
            }
            if (id_utente) {
                await trx('log_azioni').insert({
                    id_utente: id_utente,
                    tipo_azione: 'DELETE',
                    descrizione: `L'utente ha eliminato la funzione con ID: ${id}`,
                    tabella_riferimento: 'funzioni',
                    id_riferimento: id
                });
            }
        });
        res.json({ message: 'Funzione e associazioni rimosse con successo.' });
    } catch (error) {
        if (error.message === 'Funzione non trovata.') {
            return res.status(404).json({ message: error.message });
        }
        console.error("Errore nell'eliminazione della funzione:", error);
        res.status(500).json({ message: 'Errore del server durante l\'eliminazione della funzione.' });
    }
});

// ====================================================================
// API GESTIONE ASSOCIAZIONI DITTA-FUNZIONE (Solo System Admin)
// ====================================================================

router.get('/funzioni-ditta/:id_ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    try {
        const { id_ditta } = req.params;
        const funzioni = await knex('funzioni_ditte').where({ id_ditta }).pluck('id_funzione');
        res.json({ success: true, funzioni });
    } catch (error) {
        console.error("Errore recupero funzioni per ditta:", error);
        res.status(500).json({ success: false, message: 'Errore nel recupero delle funzioni associate.' });
    }
});

router.post('/funzioni-ditta', [verifyToken, isSystemAdmin], async (req, res) => {
    const { id_ditta, funzioni } = req.body;

    if (!id_ditta || !Array.isArray(funzioni)) {
        return res.status(400).json({ success: false, message: 'ID ditta e array di funzioni sono richiesti.' });
    }

    try {
        await knex.transaction(async trx => {
            await trx('funzioni_ditte').where({ id_ditta }).del();
            if (funzioni.length > 0) {
                const values = funzioni.map(id_funzione => ({ id_ditta, id_funzione }));
                await trx('funzioni_ditte').insert(values);
            }
        });
        res.json({ success: true, message: 'Associazioni funzioni-ditta aggiornate.' });
    } catch (error) {
        console.error("Errore durante l aggiornamento delle associazioni funzioni-ditta:", error);
        res.status(500).json({ success: false, message: 'Errore del server.' });
    }
});

// ====================================================================
// API GESTIONE RUOLI E PERMESSI (Per Amministratori di Ditta)
// ====================================================================

router.get('/ditta/funzioni', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        const id_ditta = req.user.id_ditta;
        const funzioni = await knex('funzioni as f')
            .join('funzioni_ditte as fd', 'f.id', 'fd.id_funzione')
            .where('fd.id_ditta', id_ditta)
            .select('f.id', 'f.codice', 'f.descrizione', 'f.chiave_componente_modulo')
            .orderBy(['f.chiave_componente_modulo', 'f.codice']);
        res.json({ success: true, funzioni });
    } catch (error) {
        console.error("Errore recupero funzioni per la ditta:", error);
        res.status(500).json({ success: false, message: "Errore del server." });
    }
});

router.post('/ditta/ruoli', [verifyToken, isDittaAdmin, checkPermission('ADMIN_RUOLI_MANAGE')], async (req, res) => {
    const { tipo, livello } = req.body;
    const { id_ditta, livello: userLevel, id_utente } = req.user;

    if (livello >= userLevel) {
        return res.status(403).json({ success: false, message: 'Non puoi creare un ruolo con un livello uguale o superiore al tuo.' });
    }

    try {
        const [id] = await knex('ruoli').insert({ tipo, livello, id_ditta });
        if(id_utente){
            await knex('log_azioni').insert({ 
                id_utente, 
                tipo_azione: 'CREATE', 
                descrizione: `Creazione ruolo di ditta: ${tipo}`,
                tabella_riferimento: 'ruoli',
                id_riferimento: id
            });
        }
        res.status(201).json({ success: true, message: 'Ruolo creato con successo.', id });
    } catch (error) {
        console.error("Errore nella creazione del ruolo di ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});

router.get('/ditta/permessi/:id_ruolo', [verifyToken, isDittaAdmin], async (req, res) => {
    try {
        const { id_ruolo } = req.params;
        const permessi = await knex('ruoli_funzioni').where({ id_ruolo }).pluck('id_funzione');
        res.json({ success: true, permessi });
    } catch (error) {
        console.error("Errore nel recupero dei permessi del ruolo", error);
        res.status(500).json({ success: false, message: 'Errore del server' });
    }
});

router.post('/ditta/permessi', [verifyToken, isDittaAdmin, checkPermission('ADMIN_RUOLI_MANAGE')], async (req, res) => {
    const { id_ruolo, permessi } = req.body;
    const id_ditta = req.user.id_ditta;

    if (!id_ruolo || !Array.isArray(permessi)) {
        return res.status(400).json({ success: false, message: 'ID ruolo e array di permessi sono richiesti.' });
    }

    try {
        await knex.transaction(async trx => {
            const funzioniAbilitateRows = await trx('funzioni_ditte').where({ id_ditta }).select('id_funzione');
            const setFunzioniAbilitate = new Set(funzioniAbilitateRows.map(f => f.id_funzione));
            
            for (const id_permesso of permessi) {
                if (!setFunzioniAbilitate.has(parseInt(id_permesso, 10))) {
                    throw new Error(`Tentativo di assegnare il permesso ${id_permesso} non abilitato per questa ditta.`);
                }
            }
            
            await trx('ruoli_funzioni').where({ id_ruolo }).del();
            if (permessi.length > 0) {
                const values = permessi.map(id_funzione => ({ id_ruolo, id_funzione }));
                await trx('ruoli_funzioni').insert(values);
            }
        });
        res.json({ success: true, message: 'Permessi del ruolo aggiornati con successo.' });
    } catch (error) {
        console.error("Errore durante il salvataggio dei permessi del ruolo:", error);
        res.status(error.message.startsWith('Tentativo') ? 403 : 500).json({ success: false, message: error.message });
    }
});

// ====================================================================
// API GESTIONE PERMESSI PERSONALIZZATI UTENTE (Ditta/System Admin)
// ====================================================================
// GET: Ottiene lo stato completo dei permessi per un utente su una SPECIFICA ditta
router.get('/utenti/:id/permissions', [verifyToken, checkPermission('ADMIN_USER_PERMISSIONS_MANAGE')], async (req, res) => {
    const { id: id_utente_target } = req.params;
    const { id_ditta } = req.query; // <-- MODIFICA: Riceviamo l'id_ditta dalla query string
    const requester = req.user;

    if (!id_ditta) {
        return res.status(400).json({ message: 'ID Ditta non specificato.' });
    }

    try {
        // Sicurezza: Un Admin Ditta (ruolo 2) può agire solo sulla propria ditta
        if (requester.id_ruolo === 2 && parseInt(requester.id_ditta, 10) !== parseInt(id_ditta, 10)) {
            return res.status(403).json({ message: 'Non autorizzato a visualizzare i permessi per questa ditta.' });
        }

        // Troviamo il ruolo dell'utente per la ditta specificata
        const associazione = await knex('ad_utenti_ditte')
            .where({ id_utente: id_utente_target, id_ditta: id_ditta })
            .first();

        const utenteTarget = associazione ? { id_ruolo: associazione.id_ruolo, id_ditta: associazione.id_ditta } : 
                               await knex('utenti').where({ id: id_utente_target }).select('id_ditta', 'id_ruolo').first();
        
        if (!utenteTarget) {
            return res.status(404).json({ message: 'Utente non trovato o non associato a questa ditta.' });
        }

        const [funzioniAbilitate, permessiRuolo, overrides] = await Promise.all([
            knex('funzioni as f')
                .join('funzioni_ditte as fd', 'f.id', 'fd.id_funzione')
                .where('fd.id_ditta', id_ditta)
                .select('f.id', 'f.codice', 'f.descrizione', 'f.chiave_componente_modulo'),
            knex('ruoli_funzioni').where({ id_ruolo: utenteTarget.id_ruolo }).pluck('id_funzione'),
            // MODIFICA: Filtriamo gli override anche per ditta
            knex('utenti_funzioni_override').where({ id_utente: id_utente_target, id_ditta: id_ditta })
        ]);
        
        const setPermessiRuolo = new Set(permessiRuolo);
        const mapOverrides = new Map(overrides.map(o => [o.id_funzione, o.azione]));

        const response = funzioniAbilitate.map(funzione => ({
            ...funzione,
            abilitato_da_ruolo: setPermessiRuolo.has(funzione.id),
            stato_override: mapOverrides.get(funzione.id) || 'default'
        }));

        res.json(response);

    } catch (error) {
        console.error("Errore nel recupero dei permessi utente:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});


// POST: Salva gli override dei permessi per un utente su una SPECIFICA ditta
router.post('/utenti/:id/permissions', [verifyToken, checkPermission('ADMIN_USER_PERMISSIONS_MANAGE')], async (req, res) => {
    const { id: id_utente_target } = req.params;
    // --- MODIFICA: Riceviamo id_ditta e overrides dal body ---
    const { overrides, id_ditta } = req.body;
    const requester = req.user;

    if (!id_ditta || !Array.isArray(overrides)) {
        return res.status(400).json({ message: 'Dati mancanti o malformattati (id_ditta e overrides sono richiesti).' });
    }

    try {
        // Sicurezza: Un Admin Ditta (ruolo 2) può agire solo sulla propria ditta
        if (requester.id_ruolo === 2 && parseInt(requester.id_ditta, 10) !== parseInt(id_ditta, 10)) {
            return res.status(403).json({ message: 'Non autorizzato a modificare i permessi per questa ditta.' });
        }

        await knex.transaction(async (trx) => {
            // 1. Cancella solo gli override dell'utente per la ditta specifica
            await trx('utenti_funzioni_override')
                .where({ id_utente: id_utente_target, id_ditta: id_ditta })
                .del();

            // 2. Inserisci i nuovi override, se ce ne sono
            if (overrides.length > 0) {
                const dataToInsert = overrides.map(o => ({
                    id_utente: id_utente_target,
                    id_funzione: o.id_funzione,
                    azione: o.azione,
                    id_ditta: id_ditta // Aggiungiamo l'ID della ditta
                }));
                await trx('utenti_funzioni_override').insert(dataToInsert);
            }
        });

        res.json({ success: true, message: 'Permessi aggiornati con successo.' });

    } catch (error) {
        console.error("Errore nel salvataggio dei permessi:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});


// ## NOVITÀ: ROTTA PER SBLOCCARE UN UTENTE ##
// Questa rotta è protetta e accessibile solo da chi ha il permesso 'ADMIN_UTENTI_SBLOCCA'.
// ## NOVITÀ: ROTTA PER SBLOCCARE UN UTENTE ##
// Questa rotta è protetta e accessibile solo da chi ha il permesso 'ADMIN_UTENTI_SBLOCCA'.
router.post('/utenti/:id/sblocca', verifyToken, checkPermission('ADMIN_UTENTI_SBLOCCA'), async (req, res) => {
    const { id } = req.params; // ID dell'utente da sbloccare

    let connection;
    try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        // Esegue l'aggiornamento per riattivare l'utente e azzerare i tentativi
        const [updateResult] = await connection.query(
            "UPDATE utenti SET stato = 'attivo', tentativi_falliti = 0 WHERE id = ? AND id_ditta = ?",
            [id, req.user.id_ditta] // Aggiunto controllo su id_ditta per sicurezza
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Utente non trovato o non appartenente a questa ditta.' });
        }
        
        // Logga l'azione di sblocco (come da requisiti di progetto)
        await connection.query(
            'INSERT INTO log_azioni (id_utente, id_ditta, azione, dettagli) VALUES (?, ?, ?, ?)',
            [req.user.id, req.user.id_ditta, 'SBLOCCO_UTENTE', `L'utente ${req.user.id} ha sbloccato l'account ID: ${id}`]
        );

        await connection.commit();
        res.json({ success: true, message: 'Utente sbloccato con successo.' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Errore durante lo sblocco dell'utente:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    } finally {
        if (connection) connection.release();
    }
});


router.get('/utenti/ditta/:dittaId', verifyToken, checkPermission('UTENTI_VIEW'), async (req, res) => {
    const { dittaId } = req.params;
    let connection;
    try {
        connection = await dbPool.getConnection();
        const [utenti] = await connection.query(
            `SELECT 
                u.id, 
                u.nome, 
                u.cognome, 
                u.email, 
                u.id_ruolo, 
                r.tipo as nome_ruolo, 
                u.stato  -- Assicura che questo campo venga selezionato
             FROM utenti u 
             LEFT JOIN ruoli r ON u.id_ruolo = r.id 
             WHERE u.id_ditta = ?`,
            [dittaId]
        );
        res.json({ success: true, utenti });
    } catch (error) {
        console.error("Errore nel recuperare gli utenti:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server.' });
    }
});


// ===================================================================
// NUOVE API DI MONITORAGGIO (Accesso con Permessi Specifici)
// ===================================================================

/**
 * @route GET /api/admin/logs/azioni
 * @description Recupera i log delle azioni effettuate nel sistema.
 * @access Privato, Permesso: ADMIN_LOGS_VIEW
 */
router.get('/logs/azioni', [verifyToken, checkPermission('ADMIN_LOGS_VIEW')], async (req, res) => {
    try {
        const logAzioni = await knex('log_azioni as la')
            .join('utenti as u', 'la.id_utente', 'u.id')
            .join('ditte as d', 'la.id_ditta', 'd.id')
            .select('la.id', 'la.timestamp', 'u.email', 'd.ragione_sociale', 'la.azione', 'la.dettagli')
            .orderBy('la.timestamp', 'desc');
        res.json({ success: true, data: logAzioni });
    } catch (error) {
        console.error("Errore nel recupero dei log delle azioni:", error);
        res.status(500).json({ success: false, message: "Errore durante il recupero dei log." });
    }
});

/**
 * @route GET /api/admin/logs/accessi
 * @description Recupera i log degli accessi al sistema.
 * @access Privato, Permesso: ADMIN_LOGS_VIEW
 */
router.get('/logs/accessi', [verifyToken, checkPermission('ADMIN_LOGS_VIEW')], async (req, res) => {
    try {
        const logAccessi = await knex('log_accessi as la')
            .join('utenti as u', 'la.id_utente', 'u.id')
            .select('la.id', 'la.data_ora_accesso', 'u.email', 'la.indirizzo_ip', 'la.dettagli_azione')
            .orderBy('la.data_ora_accesso', 'desc');
        res.json({ success: true, data: logAccessi });
    } catch (error) {
        console.error("Errore nel recupero dei log di accesso:", error);
        res.status(500).json({ success: false, message: "Errore durante il recupero dei log." });
    }
});

/**
 * @route GET /api/admin/logs/sessioni-attive
 * @description Recupera le sessioni utente attualmente attive.
 * @access Privato, Permesso: ADMIN_SESSIONS_VIEW
 */
router.get('/logs/sessioni-attive', [verifyToken, checkPermission('ADMIN_SESSIONS_VIEW')], async (req, res) => {
    try {
        const sessioni = await knex('utenti_sessioni_attive as usa')
            .join('utenti as u', 'usa.id_utente', 'u.id')
            .join('ditte as d', 'usa.id_ditta_attiva', 'd.id')
            .select(
                'u.email',
                'u.nome',
                'u.cognome',
                'd.ragione_sociale as ditta_attiva',
                'usa.login_timestamp',
                'usa.last_heartbeat_timestamp'
            );
        res.json({ success: true, data: sessioni });
    } catch (error) {
        console.error("Errore nel recupero delle sessioni attive:", error);
        res.status(500).json({ success: false, message: "Errore durante il recupero delle sessioni." });
    }
});


// ===================================================================
// NUOVA API CREAZIONE DITTA PROPRIETARIA (Accesso System Admin)
// ===================================================================

/**
 * @route POST /api/admin/setup-ditta-proprietaria
 * @description Crea una nuova ditta proprietaria e il suo primo utente amministratore.
 * @access Privato, Ruolo: System Admin
 */
/**
 * POST /api/admin/setup-ditta-proprietaria
 * Crea una nuova ditta e invia automaticamente un link di registrazione 
 * all'email dell'amministratore specificata.
 * Richiede ruolo System Admin.
 */
router.post('/setup-ditta-proprietaria', [verifyToken, isSystemAdmin], async (req, res) => {
    const { email_amministratore, ...dittaData } = req.body;
    
    // Validazione base
    if (!dittaData.ragione_sociale || !email_amministratore) {
        return res.status(400).json({ success: false, message: 'Ragione sociale e email amministratore sono obbligatori.' });
    }

    const trx = await knex.transaction();
    try {
        // 1. Crea la Ditta
        const [dittaId] = await trx('ditte').insert({
            ragione_sociale: dittaData.ragione_sociale,
            p_iva: dittaData.p_iva,
            codice_fiscale: dittaData.codice_fiscale,
            indirizzo: dittaData.indirizzo,
            cap: dittaData.cap,
            citta: dittaData.citta,
            provincia: dittaData.provincia,
            tel1: dittaData.tel1,
            mail_1: dittaData.mail_1,
            id_tipo_ditta: dittaData.id_tipo_ditta,
            stato: dittaData.stato,
            max_utenti_interni: dittaData.max_utenti_interni,
            max_utenti_esterni: dittaData.max_utenti_esterni,
        });

        // 2. Logga l'azione
        await trx('log_azioni').insert({
            id_utente: req.user.id,
            id_ditta: req.user.id_ditta,
            azione: 'CREAZIONE_DITTA',
            dettagli: `Creata ditta '${dittaData.ragione_sociale}' (ID: ${dittaId}).`
        });

        await trx.commit();
        
        // 3. Genera token e invia email (dopo il commit della transazione)
        let emailSent = false;
        if (email_amministratore) {
            try {
                const token = uuidv4();
                
                // ++ FIX: Calcoliamo la scadenza direttamente nel DB ++
                await knex('registration_tokens').insert({
                    id_ditta: dittaId,
                    id_ruolo: 2, // <-- FIX: SPECIFICA IL RUOLO DI DITTA ADMIN
                    token: token,
                    scadenza: knex.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'),
                });

                const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/${token}`;

                await mailer.sendRegistrationInvite(email_amministratore, dittaData.ragione_sociale, registrationLink);
                emailSent = true;
                
                if (dittaData.mail_1) {
                    await mailer.sendNewDittaNotification(dittaData.mail_1, dittaData.ragione_sociale, email_amministratore);
                }

            } catch (emailError) {
                console.error("Errore durante la generazione token o invio email:", emailError);
            }
        }
        
        if (!emailSent) {
            return res.status(207).json({ 
                success: true, 
                message: "Ditta creata con successo, ma l'invio automatico dell'email è fallito. Generare il link manualmente.",
                id_ditta: dittaId 
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Ditta creata e link di registrazione inviato con successo.', 
            id_ditta: dittaId 
        });

    } catch (error) {
        await trx.rollback();
        console.error("Errore durante la creazione della ditta:", error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante la creazione della ditta.' });
    }
});






module.exports = router;

