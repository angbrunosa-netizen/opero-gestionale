// #####################################################################
// # Migrazione Knex - v2.0 (Corretta e Robusta)
// # File: opero/migrations/20251019170000_add_role_to_tokens.js
// # Aggiunge la colonna 'id_ruolo' alla tabella 'registration_tokens'.
// # 1. Corregge l'errore del Foreign Key usando .unsigned().
// # 2. Implementa un controllo per evitare errori se la migrazione viene eseguita più volte.
// #####################################################################

exports.up = function(knex) {
  return knex.schema.alterTable('registration_tokens', function(table) {
    // Prima verifichiamo se la colonna ESISTE GIA' per evitare errori
    return knex.schema.hasColumn('registration_tokens', 'id_ruolo').then(function(exists) {
      if (!exists) {
        console.log("La colonna 'id_ruolo' non esiste. Procedo con la creazione...");
        // Aggiungiamo la colonna. .unsigned() è FONDAMENTALE per la compatibilità con la FK
        table.integer('id_ruolo').unsigned().nullable().after('id_ditta');
        
        // Aggiungiamo la foreign key che fa riferimento alla tabella 'ruoli'
        table.foreign('id_ruolo').references('id').inTable('ruoli').onDelete('SET NULL');
        
        console.log("Colonna 'id_ruolo' e foreign key create con successo.");
      } else {
        console.log("La colonna 'id_ruolo' esiste già. Salto la creazione.");
      }
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('registration_tokens', function(table) {
    return knex.schema.hasColumn('registration_tokens', 'id_ruolo').then(function(exists) {
      if (exists) {
        console.log("Rimuovo la colonna 'id_ruolo' e la sua foreign key...");
        // Rimuovi prima la foreign key per evitare errori
        table.dropForeign('id_ruolo');
        // Poi rimuovi la colonna
        table.dropColumn('id_ruolo');
        console.log("Colonna 'id_ruolo' rimossa con successo.");
      } else {
        console.log("La colonna 'id_ruolo' non esiste. Salto la rimozione.");
      }
    });
  });
};