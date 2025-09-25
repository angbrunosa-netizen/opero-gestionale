/**
 * #####################################################################
 * # Migrazione Knex: Aggiunta Campo NoteParticolari - v1.1 (Corretta)
 * # File: migrations/202502209160052_PPA_3.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: Questa migrazione ora è "idempotente". Controlla se la
 * colonna 'NoteParticolari' esiste già prima di tentare di aggiungerla,
 * risolvendo l'errore 'Duplicate column name'.
 */

exports.up = function(knex) {
    return knex.schema.hasColumn('ppa_istanzeazioni', 'NoteParticolari').then(exists => {
        if (!exists) {
            return knex.schema.alterTable('ppa_istanzeazioni', (table) => {
                // Aggiunge la colonna solo se non è già presente
                table.text('NoteParticolari').nullable().after('NoteSvolgimento');
            });
        }
        // Se la colonna esiste già, non fa nulla e restituisce una promise risolta
        return Promise.resolve();
    });
};

exports.down = function(knex) {
    return knex.schema.hasColumn('ppa_istanzeazioni', 'NoteParticolari').then(exists => {
        if (exists) {
            return knex.schema.alterTable('ppa_istanzeazioni', (table) => {
                // Rimuove la colonna solo se esiste
                table.dropColumn('NoteParticolari');
            });
        }
        return Promise.resolve();
    });
};
