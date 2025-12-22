/**
 * Nome File: 20251222_add_catalog_config_to_ditte.js
 * Percorso: migrations/20251222_add_catalog_config_to_ditte.js
 * Data: 22/12/2025
 * Descrizione: Aggiunge campi configurazione catalogo alla tabella ditte
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiunta campi configurazione catalogo alla tabella ditte...');

    const hasListinoTipo = await knex.schema.hasColumn('ditte', 'catalog_listino_tipo');
    const hasListinoIndex = await knex.schema.hasColumn('ditte', 'catalog_listino_index');
    const hasMostraEsauriti = await knex.schema.hasColumn('ditte', 'catalog_mostra_esauriti');
    const hasMostraRicerca = await knex.schema.hasColumn('ditte', 'catalog_mostra_ricerca');
    const hasMostraFiltri = await knex.schema.hasColumn('ditte', 'catalog_mostra_filtri');

    await knex.schema.table('ditte', function(table) {
        if (!hasListinoTipo) {
            table.enum('catalog_listino_tipo', ['pubblico', 'cessione'])
                .defaultTo('pubblico')
                .after('shop_template');
        }
        if (!hasListinoIndex) {
            table.integer('catalog_listino_index')
                .unsigned()
                .defaultTo(1)
                .after('catalog_listino_tipo')
                .comment('Indice listino 1-6 da utilizzare');
        }
        if (!hasMostraEsauriti) {
            table.boolean('catalog_mostra_esauriti')
                .defaultTo(true)
                .after('catalog_listino_index')
                .comment('Mostra prodotti con giacenza 0');
        }
        if (!hasMostraRicerca) {
            table.boolean('catalog_mostra_ricerca')
                .defaultTo(true)
                .after('catalog_mostra_esauriti')
                .comment('Mostra barra di ricerca prodotti');
        }
        if (!hasMostraFiltri) {
            table.boolean('catalog_mostra_filtri')
                .defaultTo(true)
                .after('catalog_mostra_ricerca')
                .comment('Mostra filtri laterali categorie');
        }
    });

    console.log('✅ Campi configurazione catalogo aggiunti con successo!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione campi configurazione catalogo dalla tabella ditte...');

    await knex.schema.table('ditte', function(table) {
        table.dropColumnIfExists('catalog_listino_tipo');
        table.dropColumnIfExists('catalog_listino_index');
        table.dropColumnIfExists('catalog_mostra_esauriti');
        table.dropColumnIfExists('catalog_mostra_ricerca');
        table.dropColumnIfExists('catalog_mostra_filtri');
    });

    console.log('✅ Campi configurazione catalogo rimossi con successo!');
};