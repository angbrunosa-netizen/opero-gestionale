/**
 * Nome File: 20251226_add_favicon_to_ditte.js
 * Percorso: migrations/20251226_add_favicon_to_ditte.js
 * Data: 26/12/2025
 * Descrizione: Aggiunge campo favicon_url alla tabella ditte per favicon personalizzate
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiunta campo favicon_url alla tabella ditte...');

    const hasFaviconUrl = await knex.schema.hasColumn('ditte', 'favicon_url');

    if (!hasFaviconUrl) {
        await knex.schema.table('ditte', function(table) {
            table.string('favicon_url', 500).nullable().comment('URL favicon personalizzata per il sito');
        });
        console.log('✅ Campo favicon_url aggiunto con successo!');
    } else {
        console.log('⚡ Il campo favicon_url esiste già.');
    }
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione campo favicon_url dalla tabella ditte...');

    await knex.schema.table('ditte', function(table) {
        table.dropColumnIfExists('favicon_url');
    });

    console.log('✅ Campo favicon_url rimosso con successo!');
};
