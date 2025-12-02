// File di migrazione per creare una nuova tabella clienti
exports.up = function(knex) {
  return knex.schema.createTable('va_clienti', function(table) {
    table.increments('id').primary(); // Chiave primaria
    table.string('ragione_sociale').notNullable();
    table.string('partita_iva').unique();
    table.string('indirizzo');
    table.string('cap');
    table.string('comune');
    table.string('provincia');
    table.enum('stato', ['Attivo', 'Sospeso', 'Bloccato']).defaultTo('Attivo');
    // Altri campi che ti servono...
    table.timestamps(true, true); // Aggiunge created_at e updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('va_clienti');
};