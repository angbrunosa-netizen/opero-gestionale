/**
 * @file migrations/20251001200000_add_ricarico_cessione_to_ct_listini.js
 * @description Altera la tabella `ct_listini` aggiungendo i campi per il ricarico sul prezzo di cessione.
 * @date 2025-10-01
 * @version 1.0
 */

exports.up = function(knex) {
    return knex.schema.table('ct_listini', function(table) {
        // Aggiungiamo dinamicamente i 6 campi per il ricarico di cessione.
        // Usiamo .after() per posizionarli in modo ordinato dopo le date.
        for (let i = 1; i <= 6; i++) {
            table.decimal(`ricarico_cessione_${i}`, 8, 2).defaultTo(0).after('data_fine_validita');
        }
    });
};

exports.down = function(knex) {
    return knex.schema.table('ct_listini', function(table) {
        // Logica per annullare la migrazione, rimuovendo le colonne.
        for (let i = 1; i <= 6; i++) {
            table.dropColumn(`ricarico_cessione_${i}`);
        }
    });
};
