/**
 * @file migrations/20251201220000_add_numero_to_ls_liste_testata.js
 * @description Aggiunge il campo numero progressivo alla tabella ls_liste_testata
 * @version 1.0 - Integrazione con sistema progressivi
 */

exports.up = function(knex) {
  return knex.schema
    .alterTable('ls_liste_testata', function(table) {
      // Aggiunge il campo numero progressivo
      table.integer('numero').nullable().comment('Numero progressivo univoco della lista');

      // Aggiunge un indice univoco per evitare duplicati (id_ditta, numero)
      table.unique(['id_ditta', 'numero'], 'uk_ls_liste_numero');
    })
    // Inserisce il record di progressivo per le liste se non esiste
    .then(async () => {
      try {
        // Controlla se esiste già il progressivo per le liste
        const [existingProgressivo] = await knex('an_progressivi')
          .where({
            codice_progressivo: 'NUMERO_LISTA',
            id_ditta: 1 // Controlliamo per la ditta 1 come esempio
          });

        if (existingProgressivo.length === 0) {
          // Recupera tutte le ditte
          const ditte = await knex('ditte').select('id');

          // Inserisce il progressivo per ogni ditta
          for (const ditta of ditte) {
            await knex('an_progressivi').insert({
              id_ditta: ditta.id,
              codice_progressivo: 'NUMERO_LISTA',
              descrizione: 'Numero progressivo liste di distribuzione',
              ultimo_numero: 0,
              formato: '{ANNO}/{NUMERO}'
            });
          }

          console.log('Progressivi per NUMERO_LISTA creati per tutte le ditte');
        }
      } catch (error) {
        console.error('Errore nella creazione dei progressivi:', error);
      }
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('ls_liste_testata', function(table) {
      // Rimuove l'indice univoco
      table.dropUnique('uk_ls_liste_numero');

      // Rimuove il campo numero
      table.dropColumn('numero');
    });
};