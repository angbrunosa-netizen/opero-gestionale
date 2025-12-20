/**
 * Nome File: 20251220_add_header_personalization_fields.js
 * Percorso: migrations/20251220_add_header_personalization_fields.js
 * Data: 20/12/2025
 * Descrizione: Aggiunge i campi per la personalizzazione dell'header alla tabella ditte
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiungendo campi personalizzazione header alla tabella ditte...');

    // Verifica se le colonne esistono già
    const hasHeaderBackground = await knex.schema.hasColumn('ditte', 'shop_colore_header_sfondo');
    const hasHeaderText = await knex.schema.hasColumn('ditte', 'shop_colore_header_testo');
    const hasLogoPosition = await knex.schema.hasColumn('ditte', 'shop_logo_posizione');

    if (!hasHeaderBackground) {
        await knex.schema.table('ditte', function(table) {
            table.string('shop_colore_header_sfondo', 7).defaultTo('#ffffff').after('shop_colore_sfondo_blocchi');
            console.log('✅ Colonna shop_colore_header_sfondo aggiunta');
        });
    } else {
        console.log('ℹ️  La colonna shop_colore_header_sfondo esiste già');
    }

    if (!hasHeaderText) {
        await knex.schema.table('ditte', function(table) {
            table.string('shop_colore_header_testo', 7).defaultTo('#333333').after('shop_colore_header_sfondo');
            console.log('✅ Colonna shop_colore_header_testo aggiunta');
        });
    } else {
        console.log('ℹ️  La colonna shop_colore_header_testo esiste già');
    }

    if (!hasLogoPosition) {
        await knex.schema.table('ditte', function(table) {
            table.enum('shop_logo_posizione', ['left', 'center', 'right']).defaultTo('left').after('shop_colore_header_testo');
            console.log('✅ Colonna shop_logo_posizione aggiunta');
        });
    } else {
        console.log('ℹ️  La colonna shop_logo_posizione esiste già');
    }

    console.log('🎉 Migration completata con successo!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimuovendo campi personalizzazione header dalla tabella ditte...');

    const hasHeaderBackground = await knex.schema.hasColumn('ditte', 'shop_colore_header_sfondo');
    const hasHeaderText = await knex.schema.hasColumn('ditte', 'shop_colore_header_testo');
    const hasLogoPosition = await knex.schema.hasColumn('ditte', 'shop_logo_posizione');

    if (hasHeaderBackground) {
        await knex.schema.table('ditte', function(table) {
            table.dropColumn('shop_colore_header_sfondo');
            console.log('❌ Colonna shop_colore_header_sfondo rimossa');
        });
    }

    if (hasHeaderText) {
        await knex.schema.table('ditte', function(table) {
            table.dropColumn('shop_colore_header_testo');
            console.log('❌ Colonna shop_colore_header_testo rimossa');
        });
    }

    if (hasLogoPosition) {
        await knex.schema.table('ditte', function(table) {
            table.dropColumn('shop_logo_posizione');
            console.log('❌ Colonna shop_logo_posizione rimossa');
        });
    }

    console.log('✅ Rollback completato!');
};