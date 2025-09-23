/**
 * #####################################################################
 * # Migrazione Knex: Creazione Tabella an_servizi_aziendali_mail - v1.1 (Corretta)
 * # File: migrations/20250923210000_create_an_servizi_aziendali_mail.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: Corretto il tipo di dato della colonna 'id_ditta_mail_account'
 * per risolvere l'errore di foreign key (errno: 150).
 */

exports.up = function(knex) {
    return knex.schema.createTable('an_servizi_aziendali_mail', (table) => {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable();
        table.string('nome_servizio', 100).notNullable().comment("Es: 'PPA_COMMUNICATION', 'FATTURAZIONE'");
        
        // ####################################################################
        // ## CORREZIONE: Rimosso .unsigned() per allineare il tipo di dato  ##
        // ## alla colonna 'id' della tabella 'ditta_mail_accounts'.         ##
        // ####################################################################
        table.integer('id_ditta_mail_account').notNullable();

        // Foreign Keys
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
        // Ora questa foreign key funzionerà perché i tipi di dato corrispondono
        table.foreign('id_ditta_mail_account').references('id').inTable('ditta_mail_accounts').onDelete('CASCADE');

        // Unicità per ditta e servizio
        table.unique(['id_ditta', 'nome_servizio']);
        
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('an_servizi_aziendali_mail');
};

