/**
 * Nome File: 20251222_create_catalog_selezioni.js
 * Percorso: migrations/20251222_create_catalog_selezioni.js
 * Data: 22/12/2025
 * Descrizione: Crea tabelle per gestione selezioni prodotti (collezioni, vetrine)
 * - catalogo_selezioni: Intestazione selezione (nome, descrizione, layout)
 * - catalogo_selezioni_articoli: Articoli appartenenti alla selezione
 */

exports.up = async function(knex) {
    console.log('🔧 Creazione tabelle catalogo_selezioni...');

    // Tabella catalogo_selezioni
    const hasSelezioniTable = await knex.schema.hasTable('catalogo_selezioni');

    if (!hasSelezioniTable) {
        await knex.schema.createTable('catalogo_selezioni', function(table) {
            table.increments('id').primary();
            table.integer('id_ditta').unsigned().notNullable();
            table.string('nome', 100).notNullable();
            table.string('slug', 120).notNullable().unique();
            table.text('descrizione').nullable();
            table.enum('layout', ['grid', 'list', 'carousel']).defaultTo('grid');
            table.integer('prodotti_per_riga').unsigned().defaultTo(4);
            table.boolean('mostra_prezzo').defaultTo(true);
            table.boolean('mostra_giacenza').defaultTo(true);
            table.boolean('mostra_descrizione').defaultTo(true);
            table.boolean('attivo').defaultTo(true);
            table.integer('ordine_visualizzazione').defaultTo(0);

            // Campi per personalizzazione grafica
            table.string('colore_sfondo', 20).nullable();
            table.string('colore_testo', 20).nullable();
            table.string('colore_accento', 20).nullable();

            table.timestamps(true, true);

            // Foreign keys
            table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');

            // Index
            table.index('id_ditta');
            table.index('slug');
            table.index('attivo');
        });

        console.log('✅ Tabella catalogo_selezioni creata!');
    } else {
        console.log('ℹ️ Tabella catalogo_selezioni già esistente.');
    }

    // Tabella catalogo_selezioni_articoli
    const hasSelezioniArticoliTable = await knex.schema.hasTable('catalogo_selezioni_articoli');

    if (!hasSelezioniArticoliTable) {
        await knex.schema.createTable('catalogo_selezioni_articoli', function(table) {
            table.increments('id').primary();
            table.integer('id_selezione').unsigned().notNullable();
            table.integer('id_articolo').unsigned().notNullable();
            table.integer('ordine').defaultTo(0);

            // Opzioni override per articolo nella selezione
            table.string('etichetta_personalizzata', 50).nullable(); // es. "Nuovo", "-20%"
            table.boolean('in_evidenza').defaultTo(false);
            table.text('note_interne').nullable();

            table.timestamps(true, true);

            // Foreign keys
            table.foreign('id_selezione').references('id').inTable('catalogo_selezioni').onDelete('CASCADE');
            table.foreign('id_articolo').references('id').inTable('ct_catalogo').onDelete('CASCADE');

            // Index e Unique
            table.unique(['id_selezione', 'id_articolo']);
            table.index('id_selezione');
            table.index('id_articolo');
            table.index('ordine');
        });

        console.log('✅ Tabella catalogo_selezioni_articoli creata!');
    } else {
        console.log('ℹ️ Tabella catalogo_selezioni_articoli già esistente.');
    }

    console.log('✅ Tabelle catalogo_selezioni completate!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione tabelle catalogo_selezioni...');

    await knex.schema.dropTableIfExists('catalogo_selezioni_articoli');
    await knex.schema.dropTableIfExists('catalogo_selezioni');

    console.log('✅ Tabelle catalogo_selezioni rimosse!');
};
