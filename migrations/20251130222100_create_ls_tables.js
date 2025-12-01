/**
 * @file migrations/20251130222100_create_ls_tables.js
 * @description Migrazione per la creazione delle tabelle delle liste (ls_liste_testata e ls_liste_righe)
 * @version 2.0 - Corretta per l'integrazione con mg_causali_movimento
 */

exports.up = function(knex) {
  return knex.schema
    // Creazione della tabella ls_liste_testata
    .createTable('ls_liste_testata', function(table) {
      // Chiave primaria
      table.increments('id').primary();
      
      // Campi principali
      table.integer('id_ditta').unsigned().notNullable();
      table.string('codice', 20).notNullable();
      table.string('descrizione').notNullable();
      
      // Riferimento alla causale di movimento (elemento centrale)
      table.integer('id_causale_movimento').unsigned().notNullable().comment('Causale di movimento che definisce il tipo di lista');
      
      // Campi relazionali (dipendono dalla causale)
      table.integer('id_ditta_destinataria').unsigned().nullable().comment('Ditta cliente/fornitore controparte del movimento');
      table.integer('id_magazzino').unsigned().nullable().comment('Magazzino di riferimento per i movimenti');
      
      // Campi di stato e data
      table.date('data_riferimento').notNullable();
      table.enu('stato', ['BOZZA', 'PROCESSATO', 'ANNULLATO']).notNullable().defaultTo('BOZZA');
      
      // Riferimento al documento generato (polimorfico)
      table.integer('id_documento_generato').unsigned().nullable().comment('ID del documento generato (es. ID di un movimento)');
      table.string('tipo_documento_generato', 50).nullable().comment('Tipo di documento generato (es. mg_movimenti)');
      
      // Campo flessibile per metadati aggiuntivi
      table.jsonb('meta_dati').nullable().comment('Dati aggiuntivi specifici (es. note interne, condizioni particolari)');
      
      // Timestamp e audit
      table.timestamps(true, true);
      table.integer('created_by').unsigned().nullable().comment('Utente che ha creato la lista');
      table.integer('updated_by').unsigned().nullable().comment('Utente che ha modificato la lista');
      
      // Indici
      table.unique(['id_ditta', 'codice']); // Unicità del codice per ditta
      table.index('id_ditta');
      table.index('id_causale_movimento');
      table.index('stato');
      
      // Foreign Keys
      table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');
      table.foreign('id_causale_movimento').references('mg_causali_movimento.id').onDelete('RESTRICT'); // Non si può eliminare una causale se è usata in una lista
      table.foreign('id_ditta_destinataria').references('ditte.id').onDelete('SET NULL');
      table.foreign('id_magazzino').references('mg_magazzini.id').onDelete('SET NULL');
      table.foreign('created_by').references('utenti.id').onDelete('SET NULL');
      table.foreign('updated_by').references('utenti.id').onDelete('SET NULL');
    })
    
    // La tabella ls_liste_righe rimane invariata
    .createTable('ls_liste_righe', function(table) {
      table.increments('id').primary();
      table.integer('id_testata').unsigned().notNullable();
      table.integer('id_articolo').unsigned().notNullable();
      table.decimal('quantita', 12, 4).notNullable().defaultTo(0);
      table.decimal('prezzo_unitario', 12, 4).nullable();
      table.decimal('sconto_percentuale', 5, 2).nullable().defaultTo(0);
      table.decimal('sconto_importo', 12, 4).nullable().defaultTo(0);
      table.decimal('prezzo_netto', 12, 4).nullable();
      table.text('note').nullable();
      table.integer('ordine').notNullable().defaultTo(0);
      
      table.index('id_testata');
      table.index('id_articolo');
      
      table.foreign('id_testata').references('ls_liste_testata.id').onDelete('CASCADE');
      table.foreign('id_articolo').references('ct_catalogo.id').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ls_liste_righe')
    .dropTableIfExists('ls_liste_testata');
};