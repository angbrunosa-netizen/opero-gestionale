/**
 * @file services/catalogoPublicService.js
 * @description Servizio per il catalogo pubblico con integrazione S3/DMS
 * - Calcolo prezzi dinamici da listini
 * - Integrazione immagini da dm_files + dm_allegati_link
 * - Supporto ricerca avanzata (EAN, codici fornitore)
 * @version 1.0.0
 * @date 2025-12-22
 */

const { knex } = require('../config/db');
const CDN_BASE_URL = process.env.CDN_BASE_URL || 'https://cdn.operocloud.it';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'opero-storage';

/**
 * Recupera catalogo pubblico con immagini S3
 * @param {number} dittaId - ID della ditta
 * @param {object} options - Opzioni query
 * @returns {Promise<Array>} Lista prodotti con immagini
 */
const getPublicCatalog = async (dittaId, options = {}) => {
    const {
        listino_tipo = 'pubblico',  // 'pubblico' | 'cessione'
        listino_index = 1,           // 1-6
        categoria_id = null,
        search_term = null,
        prezzo_min = null,
        prezzo_max = null,
        mostra_esauriti = true,
        page = 1,
        limit = 20,
        sort_by = 'descrizione',     // 'descrizione' | 'prezzo' | 'giacenza'
        sort_order = 'ASC'           // 'ASC' | 'DESC'
    } = options;

    // Validazione listino_index
    if (listino_index < 1 || listino_index > 6) {
        throw new Error('listino_index deve essere tra 1 e 6');
    }

    // Colonna prezzo dinamica
    const priceColumn = `prezzo_${listino_tipo}_${listino_index}`;

    try {
        // Subquery per calcolare le giacenze totali per prodotto
        const giacenzeSubquery = knex('mg_giacenze as g')
            .select('id_catalogo')
            .select(knex.raw('SUM(giacenza_attuale) as total_giacenza'))
            .groupBy('id_catalogo')
            .as('giacenze_totali');

        // Query principale
        const query = knex('ct_catalogo as c')
            // JOIN Listino (prezzo valido per data)
            .join('ct_listini as l', function() {
                this.on('c.id', '=', 'l.id_entita_catalogo')
                    .andOn('l.id_ditta', '=', knex.raw('?', [dittaId]))
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
                knex.raw('COALESCE(giacenze_totali.total_giacenza, 0) as giacenza_totale')
            ])
            .where('c.id_ditta', dittaId)
            .modify(qb => {
                // Filtro categoria
                if (categoria_id) {
                    qb.where('c.id_categoria', categoria_id);
                }

                // Filtro ricerca avanzata (codice, descrizione, EAN, codici fornitore)
                if (search_term && search_term.trim()) {
                    const search = `%${search_term.trim()}%`;
                    qb.where(function() {
                        this.where('c.codice_entita', 'like', search)
                            .orWhere('c.descrizione', 'like', search)
                            // OR con EAN
                            .orWhereIn('c.id', function() {
                                this.select('id_catalogo')
                                    .from('ct_ean')
                                    .where('codice_ean', 'like', search);
                            })
                            // OR con codici fornitore
                            .orWhereIn('c.id', function() {
                                this.select('id_catalogo')
                                    .from('ct_codici_fornitore')
                                    .where('codice_articolo_fornitore', 'like', search);
                            });
                    });
                }

                // Filtro prezzo min
                if (prezzo_min !== null && prezzo_min !== undefined) {
                    qb.havingRaw(`COALESCE(l.${priceColumn}, 0) >= ?`, [parseFloat(prezzo_min)]);
                }

                // Filtro prezzo max
                if (prezzo_max !== null && prezzo_max !== undefined) {
                    qb.havingRaw(`COALESCE(l.${priceColumn}, 0) <= ?`, [parseFloat(prezzo_max)]);
                }

                // Filtro esauriti
                if (!mostra_esauriti) {
                    qb.havingRaw('COALESCE(giacenze_totali.total_giacenza, 0) > 0');
                }

                // Ordinamento
                const validSortFields = ['descrizione', 'prezzo_finale', 'giacenza_totale', 'codice'];
                const sortField = validSortFields.includes(sort_by) ? sort_by : 'descrizione';
                const sortDir = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

                if (sortField === 'prezzo_finale') {
                    qb.orderByRaw(`COALESCE(l.${priceColumn}, 0) ${sortDir}`);
                } else if (sortField === 'giacenza_totale') {
                    qb.orderByRaw('COALESCE(giacenze_totali.total_giacenza, 0) ${sortDir}');
                } else if (sortField === 'codice') {
                    qb.orderBy('c.codice_entita', sortDir);
                } else {
                    qb.orderBy(`c.${sortField}`, sortDir);
                }
            })
            .limit(parseInt(limit))
            .offset((parseInt(page) - 1) * parseInt(limit));

        const results = await query;

        // Recupera immagini per ogni prodotto (subquery separata per performance)
        const prodottiConImmagini = await Promise.all(
            results.map(async (prodotto) => {
                const immagini = await getImmaginiProdotto(dittaId, prodotto.id);

                return {
                    id: prodotto.id,
                    codice: prodotto.codice,
                    descrizione: prodotto.descrizione,
                    id_categoria: prodotto.id_categoria,
                    categoria_nome: prodotto.categoria_nome,
                    prezzo: parseFloat(prodotto.prezzo_finale) || 0,
                    valuta: 'EUR',
                    giacenza: parseInt(prodotto.giacenza_totale) || 0,
                    disponibile: (parseInt(prodotto.giacenza_totale) || 0) > 0,
                    immagini: immagini,
                    // Meta info per frontend
                    stato_giacenza: getStatoGiacenza(parseInt(prodotto.giacenza_totale) || 0)
                };
            })
        );

        return prodottiConImmagini;

    } catch (error) {
        console.error('Errore in getPublicCatalog:', error);
        throw error;
    }
};

/**
 * Recupera immagini di un prodotto da dm_files + dm_allegati_link
 * @param {number} dittaId - ID ditta
 * @param {number} prodottoId - ID prodotto (ct_catalogo)
 * @returns {Promise<Array>} Lista immagini con URL CDN
 */
const getImmaginiProdotto = async (dittaId, prodottoId) => {
    try {
        const immagini = await knex('dm_allegati_link as link')
            .join('dm_files as f', 'link.id_file', 'f.id')
            .where({
                'link.id_ditta': dittaId,
                'link.entita_tipo': 'ct_catalogo',
                'link.entita_id': prodottoId
            })
            .where('f.mime_type', 'like', 'image/%')
            .orderBy('f.created_at', 'desc')
            .select(
                'f.id',
                'f.file_name_originale',
                'f.mime_type',
                'f.s3_key',
                'f.privacy'
            );

        // Genera URL pubblici per immagini privacy=public
        return immagini.map(img => ({
            id: img.id,
            file_name_originale: img.file_name_originale,
            mime_type: img.mime_type,
            previewUrl: img.privacy === 'public'
                ? `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${img.s3_key}`
                : null // Solo immagini pubbliche per catalogo pubblico
        })).filter(img => img.previewUrl !== null); // Filtra solo immagini con URL valido

    } catch (error) {
        console.error(`Errore recupero immagini prodotto ${prodottoId}:`, error);
        return []; // Ritorna array vuoto in caso di errore
    }
};

/**
 * Determina stato giacenza per UI
 * @param {number} giacenza - Giacenza totale
 * @returns {string} 'disponibile' | 'esaurito' | 'ultimi_pezzi'
 */
const getStatoGiacenza = (giacenza) => {
    if (giacenza <= 0) return 'esaurito';
    if (giacenza <= 5) return 'ultimi_pezzi';
    return 'disponibile';
};

/**
 * Recupera categorie catalogo
 * @param {number} dittaId - ID ditta
 * @returns {Promise<Array>} Lista categorie gerarchica
 */
const getCategorie = async (dittaId) => {
    try {
        const categorie = await knex('ct_categorie')
            .where('id_ditta', dittaId)
            .select('*')
            .orderBy('nome_categoria', 'ASC');

        // Costruisci albero gerarchico
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.id_padre === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        return buildTree(categorie);

    } catch (error) {
        console.error('Errore recupero categorie:', error);
        throw error;
    }
};

/**
 * Recupera configurazione listino per sito web
 * @param {number} dittaId - ID ditta
 * @returns {Promise<object>} Configurazione listino
 */
const getConfigListino = async (dittaId) => {
    try {
        const [config] = await knex('ditte')
            .where('id', dittaId)
            .select('catalog_listino_tipo', 'catalog_listino_index', 'catalog_mostra_esauriti', 'catalog_mostra_ricerca', 'catalog_mostra_filtri')
            .first();

        return config || {
            catalog_listino_tipo: 'pubblico',
            catalog_listino_index: 1,
            catalog_mostra_esauriti: true,
            catalog_mostra_ricerca: true,
            catalog_mostra_filtri: true
        };

    } catch (error) {
        console.error('Errore recupero config listino:', error);
        // Ritorna default in caso di errore
        return {
            catalog_listino_tipo: 'pubblico',
            catalog_listino_index: 1,
            catalog_mostra_esauriti: true,
            catalog_mostra_ricerca: true,
            catalog_mostra_filtri: true
        };
    }
};

/**
 * Salva configurazione listino per sito web
 * @param {number} dittaId - ID ditta
 * @param {object} config - Configurazione da salvare
 * @returns {Promise<boolean>} Success
 */
const saveConfigListino = async (dittaId, config) => {
    try {
        await knex('ditte')
            .where('id', dittaId)
            .update({
                catalog_listino_tipo: config.listino_tipo || 'pubblico',
                catalog_listino_index: config.listino_index || 1,
                catalog_mostra_esauriti: config.mostra_esauriti !== undefined ? config.mostra_esauriti : true,
                catalog_mostra_ricerca: config.mostra_ricerca !== undefined ? config.mostra_ricerca : true,
                catalog_mostra_filtri: config.mostra_filtri !== undefined ? config.mostra_filtri : true
            });

        return true;

    } catch (error) {
        console.error('Errore salvataggio config listino:', error);
        throw error;
    }
};

/**
 * Conta totale prodotti per paginazione
 * @param {number} dittaId - ID ditta
 * @param {object} options - Stessi filtri di getPublicCatalog
 * @returns {Promise<number>} Totale prodotti
 */
const countProdotti = async (dittaId, options = {}) => {
    const {
        categoria_id = null,
        search_term = null,
        prezzo_min = null,
        prezzo_max = null,
        listino_tipo = 'pubblico',
        listino_index = 1,
        mostra_esauriti = true
    } = options;

    const priceColumn = `prezzo_${listino_tipo}_${listino_index}`;

    try {
        // Subquery per calcolare le giacenze totali per prodotto
        const giacenzeSubquery = knex('mg_giacenze as g')
            .select('id_catalogo')
            .select(knex.raw('SUM(giacenza_attuale) as total_giacenza'))
            .groupBy('id_catalogo')
            .as('giacenze_totali');

        const query = knex('ct_catalogo as c')
            .join('ct_listini as l', function() {
                this.on('c.id', '=', 'l.id_entita_catalogo')
                    .andOn('l.id_ditta', '=', knex.raw('?', [dittaId]))
                    .andOn(
                        knex.raw('NOW() BETWEEN l.data_inizio_validita AND COALESCE(l.data_fine_validita, NOW()) OR (l.data_inizio_validita IS NULL)')
                    );
            })
            .leftJoin(giacenzeSubquery, 'giacenze_totali.id_catalogo', 'c.id')
            .where('c.id_ditta', dittaId)
            .modify(qb => {
                if (categoria_id) qb.where('c.id_categoria', categoria_id);
                if (search_term) {
                    const search = `%${search_term}%`;
                    qb.where(function() {
                        this.where('c.codice_entita', 'like', search)
                            .orWhere('c.descrizione', 'like', search)
                            .orWhereIn('c.id', function() {
                                this.select('id_catalogo').from('ct_ean').where('codice_ean', 'like', search);
                            })
                            .orWhereIn('c.id', function() {
                                this.select('id_catalogo').from('ct_codici_fornitore').where('codice_articolo_fornitore', 'like', search);
                            });
                    });
                }
                if (!mostra_esauriti) {
                    qb.havingRaw('COALESCE(giacenze_totali.total_giacenza, 0) > 0');
                }
            });

        const [result] = await query.count('* as count');
        return result.count;

    } catch (error) {
        console.error('Errore countProdotti:', error);
        return 0;
    }
};

module.exports = {
    getPublicCatalog,
    getImmaginiProdotto,
    getCategorie,
    getConfigListino,
    saveConfigListino,
    countProdotti
};
