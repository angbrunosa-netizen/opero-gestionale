/**
 * #####################################################################
 * # Migrazione Knex: Creazione Tabella ppa_team_comunicazioni - v1.1 (Corretta)
 * # File: migrations/20250924160000_create_ppa_team_comunicazioni.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: Corretto il tipo di dato della colonna 'id_team' per
 * risolvere l'errore di foreign key (errno: 150), rimuovendo .unsigned().
 */
exports.up = function(knex) {
    return knex.schema.createTable('ppa_team_comunicazioni', (table) => {
        table.increments('id').primary();
        
        // ##################################################################
        // ## CORREZIONE: Rimosso .unsigned() per allineare il tipo di     ##
        // ## dato alla colonna 'ID' della tabella 'ppa_team'.             ##
        // ##################################################################
        table.integer('id_team').notNullable();
        
        table.integer('id_utente_mittente').notNullable();
        table.text('messaggio').notNullable();
        
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Foreign Keys
        // Ora questa foreign key funzionerà perché i tipi di dato corrispondono
        table.foreign('id_team').references('ID').inTable('ppa_team').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('ppa_team_comunicazioni');
};

