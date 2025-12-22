/**
 * Nome File: 20251222_add_listino_sconto_to_selezioni.js
 * Percorso: migrations/20251222_add_listino_sconto_to_selezioni.js
 * Data: 22/12/2025
 * Descrizione: Aggiunge campi per configurazione listino e sconto alle selezioni
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiunta campi listino e sconto a catalogo_selezioni...');

    // Verifica se le colonne esistono già
    const hasListinoTipo = await knex.schema.hasColumn('catalogo_selezioni', 'listino_tipo');
    const hasListinoIndex = await knex.schema.hasColumn('catalogo_selezioni', 'listino_index');
    const hasApplicaSconto = await knex.schema.hasColumn('catalogo_selezioni', 'applica_sconto');
    const hasScontoPercentuale = await knex.schema.hasColumn('catalogo_selezioni', 'sconto_percentuale');

    if (!hasListinoTipo) {
        await knex.schema.table('catalogo_selezioni', function(table) {
            table.enum('listino_tipo', ['pubblico', 'cessione']).defaultTo('pubblico').after('colore_accento');
        });
        console.log('✅ Colonna listino_tipo aggiunta');
    } else {
        console.log('ℹ️ Colonna listino_tipo già esistente');
    }

    if (!hasListinoIndex) {
        await knex.schema.table('catalogo_selezioni', function(table) {
            table.integer('listino_index').unsigned().defaultTo(1).after('listino_tipo');
        });
        console.log('✅ Colonna listino_index aggiunta');
    } else {
        console.log('ℹ️ Colonna listino_index già esistente');
    }

    if (!hasApplicaSconto) {
        await knex.schema.table('catalogo_selezioni', function(table) {
            table.boolean('applica_sconto').defaultTo(false).after('listino_index');
        });
        console.log('✅ Colonna applica_sconto aggiunta');
    } else {
        console.log('ℹ️ Colonna applica_sconto già esistente');
    }

    if (!hasScontoPercentuale) {
        await knex.schema.table('catalogo_selezioni', function(table) {
            table.integer('sconto_percentuale').unsigned().defaultTo(0).after('applica_sconto');
        });
        console.log('✅ Colonna sconto_percentuale aggiunta');
    } else {
        console.log('ℹ️ Colonna sconto_percentuale già esistente');
    }

    console.log('✅ Migrazione listino e sconto completata!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione campi listino e sconto da catalogo_selezioni...');

    await knex.schema.table('catalogo_selezioni', function(table) {
        table.dropColumn('sconto_percentuale');
        table.dropColumn('applica_sconto');
        table.dropColumn('listino_index');
        table.dropColumn('listino_tipo');
    });

    console.log('✅ Campi listino e sconto rimossi!');
};
