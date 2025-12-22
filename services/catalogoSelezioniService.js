/**
 * @file services/catalogoSelezioniService.js
 * @description Servizio per gestione selezioni prodotti (collezioni, vetrine)
 * - Creazione, modifica, eliminazione selezioni
 * - Gestione articoli nelle selezioni con ordinamento
 * - Recupero selezioni con dati commerciali aggiornati
 * @version 1.0.0
 * @date 2025-12-22
 */

const { knex } = require('../config/db');

/**
 * Recupera tutte le selezioni di una ditta
 * @param {number} dittaId - ID ditta
 * @returns {Promise<Array>} Lista selezioni
 */
const getSelezioni = async (dittaId) => {
    try {
        const selezioni = await knex('catalogo_selezioni')
            .where('id_ditta', dittaId)
            .orderBy('ordine_visualizzazione', 'ASC')
            .orderBy('nome', 'ASC');

        // Conta articoli per ogni selezione
        for (const selezione of selezioni) {
            const [count] = await knex('catalogo_selezioni_articoli')
                .where('id_selezione', selezione.id)
                .count('* as count');
            selezione.numero_articoli = count.count;
        }

        return selezioni;
    } catch (error) {
        console.error('Errore recupero selezioni:', error);
        throw error;
    }
};

/**
 * Recupera dettaglio singola selezione
 * @param {number} selezioneId - ID selezione
 * @returns {Promise<object>} Dettaglio selezione
 */
const getSelezione = async (selezioneId) => {
    try {
        const selezione = await knex('catalogo_selezioni')
            .where('id', selezioneId)
            .first();

        if (!selezione) {
            throw new Error('Selezione non trovata');
        }

        return selezione;
    } catch (error) {
        console.error('Errore recupero selezione:', error);
        throw error;
    }
};

/**
 * Recupera selezione per slug
 * @param {string} slug - Slug selezione
 * @returns {Promise<object>} Dettaglio selezione
 */
const getSelezioneBySlug = async (slug) => {
    try {
        const selezione = await knex('catalogo_selezioni')
            .where('slug', slug)
            .where('attivo', true)
            .first();

        if (!selezione) {
            throw new Error('Selezione non trovata');
        }

        return selezione;
    } catch (error) {
        console.error('Errore recupero selezione by slug:', error);
        throw error;
    }
};

/**
 * Crea nuova selezione
 * @param {number} dittaId - ID ditta
 * @param {object} data - Dati selezione
 * @returns {Promise<number>} ID nuova selezione
 */
const createSelezione = async (dittaId, data) => {
    try {
        // Genera slug unico da nome
        let baseSlug = data.nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let slug = baseSlug;
        let counter = 1;

        // Verifica unicità slug
        while (await knex('catalogo_selezioni').where('slug', slug).first()) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const [id] = await knex('catalogo_selezioni').insert({
            id_ditta: dittaId,
            nome: data.nome,
            slug: slug,
            descrizione: data.descrizione || null,
            layout: data.layout || 'grid',
            prodotti_per_riga: data.prodotti_per_riga || 4,
            mostra_prezzo: data.mostra_prezzo !== undefined ? data.mostra_prezzo : true,
            mostra_giacenza: data.mostra_giacenza !== undefined ? data.mostra_giacenza : true,
            mostra_descrizione: data.mostra_descrizione !== undefined ? data.mostra_descrizione : true,
            attivo: data.attivo !== undefined ? data.attivo : true,
            ordine_visualizzazione: data.ordine_visualizzazione || 0,
            colore_sfondo: data.colore_sfondo || null,
            colore_testo: data.colore_testo || null,
            colore_accento: data.colore_accento || null
        });

        return id;
    } catch (error) {
        console.error('Errore creazione selezione:', error);
        throw error;
    }
};

/**
 * Aggiorna selezione esistente
 * @param {number} selezioneId - ID selezione
 * @param {object} data - Dati aggiornamento
 * @returns {Promise<boolean>} Success
 */
const updateSelezione = async (selezioneId, data) => {
    try {
        // Se cambia nome, aggiorna slug
        let updateData = { ...data };
        if (data.nome) {
            let baseSlug = data.nome
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            let slug = baseSlug;
            let counter = 1;

            while (await knex('catalogo_selezioni').where('slug', slug).where('id', '!=', selezioneId).first()) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            updateData.slug = slug;
        }

        await knex('catalogo_selezioni')
            .where('id', selezioneId)
            .update(updateData);

        return true;
    } catch (error) {
        console.error('Errore aggiornamento selezione:', error);
        throw error;
    }
};

/**
 * Elimina selezione
 * @param {number} selezioneId - ID selezione
 * @returns {Promise<boolean>} Success
 */
const deleteSelezione = async (selezioneId) => {
    try {
        await knex('catalogo_selezioni')
            .where('id', selezioneId)
            .delete();

        return true;
    } catch (error) {
        console.error('Errore eliminazione selezione:', error);
        throw error;
    }
};

/**
 * Recupera articoli di una selezione con dati commerciali aggiornati
 * @param {number} selezioneId - ID selezione
 * @param {object} options - Opzioni listino (override configurazione selezione)
 * @returns {Promise<object>} { selezione, articoli }
 */
const getArticoliSelezione = async (selezioneId, options = {}) => {
    try {
        // Recupera prima la selezione per ottenere id_ditta e configurazione prezzi
        const selezione = await getSelezione(selezioneId);

        // Usa configurazione selezione, con override dalle options
        const listino_tipo = options.listino_tipo || selezione.listino_tipo || 'pubblico';
        const listino_index = options.listino_index || selezione.listino_index || 1;
        const applica_sconto = selezione.applica_sconto || false;
        const sconto_percentuale = selezione.sconto_percentuale || 0;

        const priceColumn = `prezzo_${listino_tipo}_${listino_index}`;

        // Subquery per calcolare le giacenze totali per prodotto
        const giacenzeSubquery = knex('mg_giacenze as g')
            .select('id_catalogo')
            .select(knex.raw('SUM(giacenza_attuale) as total_giacenza'))
            .groupBy('id_catalogo')
            .as('giacenze_totali');

        const articoli = await knex('catalogo_selezioni_articoli as sa')
            .join('ct_catalogo as c', 'sa.id_articolo', 'c.id')
            // JOIN Listino per prezzo aggiornato
            .join('ct_listini as l', function() {
                this.on('c.id', '=', 'l.id_entita_catalogo')
                    .andOn('l.id_ditta', '=', knex.raw('?', [selezione.id_ditta]))
                    .andOn(
                        knex.raw('NOW() BETWEEN l.data_inizio_validita AND COALESCE(l.data_fine_validita, NOW()) OR (l.data_inizio_validita IS NULL)')
                    );
            })
            // LEFT JOIN con subquery giacenze
            .leftJoin(giacenzeSubquery, 'giacenze_totali.id_catalogo', 'c.id')
            // LEFT JOIN Categoria
            .leftJoin('ct_categorie as cat', 'c.id_categoria', 'cat.id')
            .select([
                'c.id',
                'c.codice_entita as codice',
                'c.descrizione',
                'c.id_categoria',
                'cat.nome_categoria as categoria_nome',
                knex.raw(`COALESCE(l.${priceColumn}, 0) as prezzo_finale`),
                knex.raw('COALESCE(giacenze_totali.total_giacenza, 0) as giacenza_totale'),
                'sa.ordine',
                'sa.etichetta_personalizzata',
                'sa.in_evidenza'
            ])
            .where('sa.id_selezione', selezioneId)
            .orderBy('sa.ordine', 'ASC');

        // Recupera immagini per ogni prodotto e calcola prezzo scontato
        const catalogoPublicService = require('./catalogoPublicService');
        const articoliConImmagini = await Promise.all(
            articoli.map(async (articolo) => {
                const immagini = await catalogoPublicService.getImmaginiProdotto(selezione.id_ditta, articolo.id);

                let prezzoFinale = parseFloat(articolo.prezzo_finale) || 0;
                let prezzoOriginale = prezzoFinale;

                // Applica sconto se configurato
                if (applica_sconto && sconto_percentuale > 0) {
                    prezzoFinale = prezzoFinale * (1 - sconto_percentuale / 100);
                }

                return {
                    id: articolo.id,
                    codice: articolo.codice,
                    descrizione: articolo.descrizione,
                    id_categoria: articolo.id_categoria,
                    categoria_nome: articolo.categoria_nome,
                    prezzo: prezzoFinale,
                    prezzo_originale: applica_sconto ? prezzoOriginale : null,
                    valuta: 'EUR',
                    giacenza: parseInt(articolo.giacenza_totale) || 0,
                    disponibile: (parseInt(articolo.giacenza_totale) || 0) > 0,
                    immagini: immagini,
                    // Dati selezione
                    etichetta_personalizzata: articolo.etichetta_personalizzata,
                    in_evidenza: !!articolo.in_evidenza,
                    ordine: articolo.ordine,
                    // Info sconto
                    sconto_applicato: applica_sconto ? sconto_percentuale : 0
                };
            })
        );

        return {
            selezione: selezione,
            articoli: articoliConImmagini
        };
    } catch (error) {
        console.error('Errore recupero articoli selezione:', error);
        throw error;
    }
};

/**
 * Recupera articoli di una selezione per slug con dati commerciali aggiornati
 * @param {string} slug - Slug selezione
 * @param {object} options - Opzioni listino
 * @returns {Promise<object>} { selezione, articoli }
 */
const getArticoliSelezioneBySlug = async (slug, options = {}) => {
    try {
        // Recupera selezione per slug
        const selezione = await getSelezioneBySlug(slug);

        // Usa la funzione esistente getArticoliSelezione
        return await getArticoliSelezione(selezione.id, options);
    } catch (error) {
        console.error('Errore recupero articoli selezione by slug:', error);
        throw error;
    }
};

/**
 * Aggiunge articolo a selezione
 * @param {number} selezioneId - ID selezione
 * @param {number} articoloId - ID articolo
 * @param {object} options - Opzioni aggiunta (etichetta, in_evidenza, ordine)
 * @returns {Promise<boolean>} Success
 */
const addArticoloToSelezione = async (selezioneId, articoloId, options = {}) => {
    try {
        // Verifica se articolo già presente
        const existing = await knex('catalogo_selezioni_articoli')
            .where({
                id_selezione: selezioneId,
                id_articolo: articoloId
            })
            .first();

        if (existing) {
            throw new Error('Articolo già presente nella selezione');
        }

        // Se ordine non specificato, usa il massimo + 1
        let ordine = options.ordine || 0;
        if (!options.ordine) {
            const [maxOrdine] = await knex('catalogo_selezioni_articoli')
                .where('id_selezione', selezioneId)
                .max('ordine as max_ordine');
            ordine = (maxOrdine.max_ordine || 0) + 1;
        }

        await knex('catalogo_selezioni_articoli').insert({
            id_selezione: selezioneId,
            id_articolo: articoloId,
            ordine: ordine,
            etichetta_personalizzata: options.etichetta_personalizzata || null,
            in_evidenza: options.in_evidenza || false,
            note_interne: options.note_interne || null
        });

        return true;
    } catch (error) {
        console.error('Errore aggiunta articolo a selezione:', error);
        throw error;
    }
};

/**
 * Rimuove articolo da selezione
 * @param {number} selezioneId - ID selezione
 * @param {number} articoloId - ID articolo
 * @returns {Promise<boolean>} Success
 */
const removeArticoloFromSelezione = async (selezioneId, articoloId) => {
    try {
        await knex('catalogo_selezioni_articoli')
            .where({
                id_selezione: selezioneId,
                id_articolo: articoloId
            })
            .delete();

        return true;
    } catch (error) {
        console.error('Errore rimozione articolo da selezione:', error);
        throw error;
    }
};

/**
 * Aggiorna ordine articoli nella selezione
 * @param {number} selezioneId - ID selezione
 * @param {Array} articoliOrdine - Array [{id_articolo, ordine}]
 * @returns {Promise<boolean>} Success
 */
const updateOrdineArticoli = async (selezioneId, articoliOrdine) => {
    try {
        await Promise.all(
            articoliOrdine.map(item =>
                knex('catalogo_selezioni_articoli')
                    .where({
                        id_selezione: selezioneId,
                        id_articolo: item.id_articolo
                    })
                    .update({ ordine: item.ordine })
            )
        );

        return true;
    } catch (error) {
        console.error('Errore aggiornamento ordine articoli:', error);
        throw error;
    }
};

/**
 * Aggiorna options articolo nella selezione
 * @param {number} selezioneId - ID selezione
 * @param {number} articoloId - ID articolo
 * @param {object} options - Opzioni da aggiornare
 * @returns {Promise<boolean>} Success
 */
const updateArticoloOptions = async (selezioneId, articoloId, options) => {
    try {
        await knex('catalogo_selezioni_articoli')
            .where({
                id_selezione: selezioneId,
                id_articolo: articoloId
            })
            .update({
                etichetta_personalizzata: options.etichetta_personalizzata,
                in_evidenza: options.in_evidenza,
                note_interne: options.note_interne
            });

        return true;
    } catch (error) {
        console.error('Errore aggiornamento options articolo:', error);
        throw error;
    }
};

module.exports = {
    getSelezioni,
    getSelezione,
    getSelezioneBySlug,
    createSelezione,
    updateSelezione,
    deleteSelezione,
    getArticoliSelezione,
    getArticoliSelezioneBySlug,
    addArticoloToSelezione,
    removeArticoloFromSelezione,
    updateOrdineArticoli,
    updateArticoloOptions
};
