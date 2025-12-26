/**
 * Nome File: 20251225_create_main_site.js
 * Percorso: migrations/20251225_create_main_site.js
 * Data: 25/12/2025
 * Descrizione: Aggiunge supporto per sito principale (operocloud.it)
 * - Campo is_main_site nella tabella ditte per marcare la ditta principale
 * - Campo show_in_directory per visibilità nella directory
 * - Campo directory_order per ordinamento personalizzato directory
 * - Campo directory_description per descrizione personalizzata in directory
 * - Campo directory_featured per evidenziare aziende nella directory
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiunta campi per sito principale e directory...');

    // Verifica se le colonne esistono già
    const hasIsMainSite = await knex.schema.hasColumn('ditte', 'is_main_site');
    const hasShowInDirectory = await knex.schema.hasColumn('ditte', 'show_in_directory');
    const hasDirectoryOrder = await knex.schema.hasColumn('ditte', 'directory_order');
    const hasDirectoryDescription = await knex.schema.hasColumn('ditte', 'directory_description');
    const hasDirectoryFeatured = await knex.schema.hasColumn('ditte', 'directory_featured');

    await knex.schema.table('ditte', function(table) {
        // Campo per marcare una ditta come "sito principale" (es. operocloud.it)
        if (!hasIsMainSite) {
            table.boolean('is_main_site')
                .defaultTo(false)
                .after('shop_attivo')
                .comment('Se true, questa ditta alimenta il sito principale del dominio');
        }

        // Campo per controllare la visibilità nella directory pubblica
        if (!hasShowInDirectory) {
            table.boolean('show_in_directory')
                .defaultTo(true)
                .after('is_main_site')
                .comment('Mostra questa ditta nella directory dei siti');
        }

        // Campo per ordinamento personalizzato nella directory
        if (!hasDirectoryOrder) {
            table.integer('directory_order')
                .unsigned()
                .defaultTo(100)
                .after('show_in_directory')
                .comment('Ordine di visualizzazione nella directory (minore = prima)');
        }

        // Campo per descrizione personalizzata nella directory
        if (!hasDirectoryDescription) {
            table.text('directory_description')
                .nullable()
                .after('directory_order')
                .comment('Descrizione personalizzata da mostrare nella directory');
        }

        // Campo per evidenziare aziende nella directory
        if (!hasDirectoryFeatured) {
            table.boolean('directory_featured')
                .defaultTo(false)
                .after('directory_description')
                .comment('Evidenzia questa azienda nella directory (in evidenza)');
        }
    });

    console.log('✅ Campi per sito principale e directory aggiunti!');

    // Crea indice per sito principale (MariaDB non supporta indici parziali)
    const exists = await knex.schema.hasColumn('ditte', 'is_main_site');
    if (exists) {
        await knex.raw(`
            CREATE INDEX IF NOT EXISTS idx_ditte_is_main_site
            ON ditte(is_main_site, shop_attivo)
        `);
        console.log('✅ Indice is_main_site creato!');
    }

    // Crea indice per directory (MariaDB non supporta indici parziali)
    const hasShowInDirectoryNow = await knex.schema.hasColumn('ditte', 'show_in_directory');
    if (hasShowInDirectoryNow) {
        await knex.raw(`
            CREATE INDEX IF NOT EXISTS idx_ditte_directory_visibility
            ON ditte(show_in_directory, directory_order)
        `);
        console.log('✅ Indice directory_visibility creato!');
    }
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione campi per sito principale e directory...');

    await knex.schema.table('ditte', function(table) {
        table.dropColumnIfExists('is_main_site');
        table.dropColumnIfExists('show_in_directory');
        table.dropColumnIfExists('directory_order');
        table.dropColumnIfExists('directory_description');
        table.dropColumnIfExists('directory_featured');
    });

    // Rimuovi indici (Knex non supporta dropIndex con WHERE direttamente)
    await knex.raw('DROP INDEX IF EXISTS idx_ditte_is_main_site');
    await knex.raw('DROP INDEX IF EXISTS idx_ditte_directory_visibility');

    console.log('✅ Campi per sito principale e directory rimossi!');
};
