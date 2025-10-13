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

// Middleware per i ruoli
const isSystemAdmin = checkRole([1]); 
const isDittaAdmin = checkRole([1, 2]);

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

// ====================================================================
// API GESTIONE UTENTI (Accesso per Amministratori di Ditta)
// ====================================================================

router.get('/utenti/ditta/:id_ditta', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id_ditta } = req.params;
    const requester = req.user;

    if (requester.id_ruolo === 2 && parseInt(id_ditta, 10) !== requester.id_ditta) {
        return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
    }

    try {
        const utenti = await knex('utenti')
            .select('id', knex.raw('CONCAT(nome, " ", cognome) as username'), 'email', 'id_ruolo')
            .where({ id_ditta });
        res.json({ success: true, utenti });
    } catch (error) {
        console.error(`Errore recupero utenti per ditta ${id_ditta}:`, error);
        res.status(500).json({ success: false, message: "Errore nel recupero degli utenti." });
    }
});

router.post('/utenti', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id, password, ...userData } = req.body;
    const requester = req.user;
    
    if (requester.id_ruolo === 2) {
        if (parseInt(userData.id_ditta, 10) !== requester.id_ditta) {
            return res.status(403).json({ success: false, message: 'Non autorizzato a gestire utenti di altre ditte.' });
        }
        if (parseInt(userData.id_ruolo, 10) <= 2) {
            return res.status(403).json({ success: false, message: 'Non autorizzato ad assegnare ruoli di amministratore.' });
        }
    }

    try {
        if (password) {
            userData.password = await bcrypt.hash(password, 10);
        }

        if (id) { 
            await knex('utenti').where({id}).update(userData);
            res.json({ success: true, message: 'Utente aggiornato con successo.' });
        } else { 
            await knex('utenti').insert(userData);
            res.status(201).json({ success: true, message: 'Utente creato con successo.' });
        }
    } catch (error) {
        console.error("Errore salvataggio utente:", error);
        if (error.code === 'ER_DUP_ENTRY') {
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

router.get('/utenti/:id', [verifyToken, isDittaAdmin], async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

    try {
        const utente = await knex('utenti')
            .select('id', 'nome', 'cognome', 'email', 'id_ditta', 'id_ruolo')
            .where({ id })
            .first();

        if (!utente) {
            return res.status(404).json({ success: false, message: 'Utente non trovato.' });
        }

        if (requester.id_ruolo === 2 && utente.id_ditta !== requester.id_ditta) {
            return res.status(403).json({ success: false, message: 'Accesso non autorizzato.' });
        }

        res.json({ success: true, utente });

    } catch (error) {
        console.error(`Errore nel recupero dell'utente ${id}:`, error);
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
        const privacy = await knex("privacy_ditta")
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
        await knex('privacy_ditta').insert(data).onConflict('id_ditta').merge();
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

// GET: Ottiene lo stato completo dei permessi per un singolo utente
router.get('/utenti/:id/permissions', [verifyToken, isDittaAdmin, checkPermission('ADMIN_USER_PERMISSIONS_MANAGE')], async (req, res) => {
    const { id: id_utente_target } = req.params;
    const requester = req.user;

    try {
        const utenteTarget = await knex('utenti').where({ id: id_utente_target }).select('id_ditta', 'id_ruolo').first();
        if (!utenteTarget) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Sicurezza: Un Admin Ditta può gestire solo utenti della propria ditta
        if (requester.id_ruolo === 2 && utenteTarget.id_ditta !== requester.id_ditta) {
            return res.status(403).json({ message: 'Non autorizzato a gestire i permessi di questo utente.' });
        }

        // 1. Prendi tutte le funzioni abilitate per la ditta
        const funzioniAbilitate = await knex('funzioni as f')
            .join('funzioni_ditte as fd', 'f.id', 'fd.id_funzione')
            .where('fd.id_ditta', utenteTarget.id_ditta)
            .select('f.id', 'f.codice', 'f.descrizione', 'f.chiave_componente_modulo');

        // 2. Prendi i permessi base del ruolo dell'utente
        const permessiRuolo = await knex('ruoli_funzioni').where({ id_ruolo: utenteTarget.id_ruolo }).pluck('id_funzione');
        const setPermessiRuolo = new Set(permessiRuolo);

        // 3. Prendi gli override specifici dell'utente
        const overrides = await knex('utenti_funzioni_override').where({ id_utente: id_utente_target });
        const mapOverrides = new Map(overrides.map(o => [o.id_funzione, o.azione]));

        // 4. Combina i dati per il frontend
        const response = funzioniAbilitate.map(funzione => {
            let stato = 'default'; // Ereditato dal ruolo
            if (mapOverrides.has(funzione.id)) {
                stato = mapOverrides.get(funzione.id); // 'allow' o 'deny'
            }
            return {
                ...funzione,
                abilitato_da_ruolo: setPermessiRuolo.has(funzione.id),
                stato_override: stato
            };
        });

        res.json(response);

    } catch (error) {
        console.error("Errore nel recupero dei permessi utente:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});

// POST: Salva gli override dei permessi per un utente
router.post('/utenti/:id/permissions', [verifyToken, isDittaAdmin, checkPermission('ADMIN_USER_PERMISSIONS_MANAGE')], async (req, res) => {
    const { id: id_utente_target } = req.params;
    const { overrides } = req.body; // Array di { id_funzione, azione }
    const requester = req.user;
    const id_utente_loggato = requester.id_utente;

    try {
        const utenteTarget = await knex('utenti').where({ id: id_utente_target }).select('id_ditta').first();
        if (!utenteTarget) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }

        // Sicurezza: Un Admin Ditta può gestire solo utenti della propria ditta
        if (requester.id_ruolo === 2 && utenteTarget.id_ditta !== requester.id_ditta) {
            return res.status(403).json({ message: 'Non autorizzato a gestire i permessi di questo utente.' });
        }

        await knex.transaction(async trx => {
            // 1. Cancella i vecchi override per questo utente
            await trx('utenti_funzioni_override').where({ id_utente: id_utente_target }).del();

            // 2. Inserisci i nuovi override, se ce ne sono
            if (overrides && overrides.length > 0) {
                const dataToInsert = overrides.map(o => ({
                    id_utente: id_utente_target,
                    id_funzione: o.id_funzione,
                    azione: o.azione
                }));
                await trx('utenti_funzioni_override').insert(dataToInsert);
            }

            // 3. Logga l'azione
            if (id_utente_loggato) {
                await trx('log_azioni').insert({
                    id_utente: id_utente_loggato,
                    tipo_azione: 'PERMISSIONS_UPDATE',
                    descrizione: `L'utente ha modificato i permessi personalizzati per l'utente ID: ${id_utente_target}`,
                    tabella_riferimento: 'utenti',
                    id_riferimento: id_utente_target
                });
            }
        });

        res.json({ message: 'Permessi utente aggiornati con successo.' });

    } catch (error) {
        console.error("Errore nel salvataggio dei permessi utente:", error);
        res.status(500).json({ message: 'Errore del server.' });
    }
});


module.exports = router;

