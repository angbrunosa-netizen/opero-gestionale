/**
 * Migrazione per la creazione e aggiornamento della tabella 'allegati_tracciati'.
 * ATTENZIONE: Contenuto svuotato per risolvere il conflitto di stato nel database. 
 * Le modifiche a allegati_tracciati sono già state gestite nella migrazione 20251203010000_email_tracking_enhancements.js.
 */

exports.up = async function(knex) {
    console.log('--- IGNORE --- Migrazione 20251215... saltata per risoluzione conflitto di stato.');
    return Promise.resolve();
};

exports.down = function(knex) {
    console.log('--- IGNORE --- Rollback 20251215... saltato.');
    return Promise.resolve();
};