/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('bs_categorie', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice', 50);
      table.string('descrizione', 255);
      table.decimal('aliquota_ammortamento', 5, 2);
      table.integer('id_sottoconto_costi').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.integer('id_sottoconto_ammortamenti').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.integer('id_sottoconto_fondo').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.timestamps(true, true);
    })
    .createTable('bs_beni', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_categoria').unsigned().notNullable().references('id').inTable('bs_categorie').onDelete('CASCADE');
      table.string('codice_bene', 100).notNullable();
      table.text('descrizione');
      table.string('matricola', 255);
      table.string('url_foto', 500);
      table.date('data_acquisto');
      table.decimal('valore_acquisto', 15, 2);
      table.integer('id_sottoconto_cespite').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.integer('id_fornitore').unsigned().nullable().references('id').inTable('ditte').onDelete('SET NULL');
      table.string('riferimento_fattura', 255);
      table.enum('stato', ['In uso', 'In manutenzione', 'Dismesso', 'In magazzino']).defaultTo('In magazzino');
      table.string('ubicazione', 255);
      table.date('data_dismissione').nullable();
      table.decimal('valore_dismissione', 15, 2).nullable();
      table.text('note').nullable();
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice_bene']);
    })
    .createTable('bs_manutenzioni', function(table) {
      table.increments('id').primary();
      table.integer('id_bene').unsigned().notNullable().references('id').inTable('bs_beni').onDelete('CASCADE');
      table.date('data_intervento');
      table.enum('tipo_intervento', ['Ordinaria', 'Straordinaria', 'Programmata']);
      table.text('descrizione_intervento');
      table.integer('id_fornitore_manutenzione').unsigned().nullable().references('id').inTable('ditte').onDelete('SET NULL');
      table.decimal('costo_intervento', 15, 2);
      table.integer('id_sottoconto_contabile').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.string('documento_riferimento', 255);
      table.timestamps(true, true);
    })
    .createTable('bs_attivita', function(table) {
      table.increments('id').primary();
      table.integer('id_bene').unsigned().notNullable().references('id').inTable('bs_beni').onDelete('CASCADE');
      // <span style="color:green; font-weight:bold;">// CORREZIONE DEFINITIVA: Rimosso .unsigned() per allinearsi alla reale struttura della tabella 'utenti'.</span>
      table.integer('id_utente_utilizzatore').nullable().references('id').inTable('utenti').onDelete('SET NULL');
      table.datetime('data_inizio');
      table.datetime('data_fine');
      table.decimal('ore_utilizzo', 10, 2);
      table.decimal('unita_prodotte', 15, 2).nullable();
      table.decimal('valore_contatore', 15, 2).nullable();
      table.text('descrizione_attivita');
      table.timestamps(true, true);
    })
    .createTable('bs_costi', function(table) {
      table.increments('id').primary();
      table.integer('id_bene').unsigned().notNullable().references('id').inTable('bs_beni').onDelete('CASCADE');
      table.date('data_costo');
      table.string('descrizione_costo', 255);
      table.decimal('importo', 15, 2);
      table.integer('id_sottoconto_contabile').nullable().references('id').inTable('sc_piano_dei_conti').onDelete('SET NULL');
      table.string('documento_riferimento', 255).nullable();
      table.timestamps(true, true);
    })
    .createTable('bs_scadenze', function(table) {
      table.increments('id').primary();
      table.integer('id_bene').unsigned().notNullable().references('id').inTable('bs_beni').onDelete('CASCADE');
      table.string('tipo_scadenza', 255);
      table.text('descrizione').nullable();
      table.date('data_scadenza');
      table.integer('giorni_preavviso').defaultTo(7);
      table.integer('id_fornitore_associato').unsigned().nullable().references('id').inTable('ditte').onDelete('SET NULL');
      table.decimal('importo_previsto', 15, 2).nullable();
      table.enum('stato', ['Pianificata', 'Completata', 'Annullata']).defaultTo('Pianificata');
      table.date('data_completamento').nullable();
      table.text('note').nullable();
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('bs_scadenze')
    .dropTableIfExists('bs_costi')
    .dropTableIfExists('bs_attivita')
    .dropTableIfExists('bs_manutenzioni')
    .dropTableIfExists('bs_beni')
    .dropTableIfExists('bs_categorie');
};