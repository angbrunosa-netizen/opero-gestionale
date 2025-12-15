/**
 * @file migrations/20251201220000_add_numero_to_ls_liste_testata.js
 * @description Aggiunge il campo numero progressivo alla tabella ls_liste_testata
 * @version 1.1 - Fix bug destrutturazione array (Cannot read property length of undefined)
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
        // --- FIX BUG ---
        // Prima: const [existingProgressivo] = ... (Se vuoto, existingProgressivo era undefined)
        // Ora: const existingProgressivi = ... (Restituisce sempre un array, anche vuoto)
        
        // Controlla se esiste già il progressivo per le liste (controlliamo per la ditta 1 come campione)
        const existingProgressivi = await knex('an_progressivi')
          .where({
            codice_progressivo: 'NUMERO_LISTA',
            id_ditta: 1 
          });

        // Controlliamo la lunghezza dell'ARRAY, non dell'elemento
        if (existingProgressivi.length === 0) {
          
          // Recupera tutte le ditte
          const ditte = await knex('ditte').select('id');

          // Inserisce il progressivo per ogni ditta
          for (const ditta of ditte) {
            // Un'ulteriore sicurezza: controlliamo se per QUESTA specifica ditta esiste già
            const checkDitta = await knex('an_progressivi')
                .where({ codice_progressivo: 'NUMERO_LISTA', id_ditta: ditta.id })
                .first();

            if (!checkDitta) {
                await knex('an_progressivi').insert({
                  id_ditta: ditta.id,
                  codice_progressivo: 'NUMERO_LISTA',
                  descrizione: 'Numero progressivo liste di distribuzione',
                  ultimo_numero: 0,
                  formato: '{ANNO}/{NUMERO}'
                });
            }
          }

          console.log('Progressivi per NUMERO_LISTA creati per tutte le ditte mancanti.');
        } else {
            console.log('Progressivi per NUMERO_LISTA già presenti. Saltato.');
        }
      } catch (error) {
        console.error('Errore nella creazione dei progressivi:', error);
        // Non lanciamo l'errore per non bloccare la migrazione se il problema è solo l'inserimento dati
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