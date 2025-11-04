/**
 * File: /seeds/20251104123600_add_funzioni_dms.js
 *
 * Versione: 1.0.4 (Corretta)
 *
 * Descrizione: Questo file seed aggiunge le funzioni (permessi) necessarie
 * per il nuovo Modulo Gestione Documentale (DMS) alla tabella `funzioni`.
 * Utilizza le chiavi MAIUSCOLE ('DOCUMENTI', 'AMMINISTRAZIONE') come da DB.
 *
 * Utilizzo:
 * Eseguire questo seed per popolare il database con i permessi:
 * `npx knex seed:run --specific=20251104123600_add_funzioni_dms.js`
 */

exports.seed = async function(knex) {
  // 1. Definisci le nuove funzioni per il modulo DMS
  const funzioniDMS = [
    {
      codice: 'DM_FILE_VIEW',
      descrizione: 'DMS - Visualizzazione e Download File',
      chiave_componente_modulo: 'DOCUMENTI' // CORRETTO (MAIUSCOLO)
    },
    {
      codice: 'DM_FILE_UPLOAD',
      descrizione: 'DMS - Caricamento File',
      chiave_componente_modulo: 'DOCUMENTI' // CORRETTO (MAIUSCOLO)
    },
    {
      codice: 'DM_FILE_DELETE',
      descrizione: 'DMS - Eliminazione/Scollegamento File',
      chiave_componente_modulo: 'DOCUMENTI' // CORRETTO (MAIUSCOLO)
    },
    {
      codice: 'DM_ADMIN_QUOTA',
      descrizione: 'DMS - Gestione Quota Storage Ditte',
      chiave_componente_modulo: 'AMMINISTRAZIONE' // CORRETTO (MAIUSCOLO)
    }
  ];

  // 2. Estrai i codici funzione per il controllo
  const codiciFunzione = funzioniDMS.map(f => f.codice);

  // 3. (Idempotenza) Cancella eventuali funzioni esistenti con gli stessi codici
  await knex('funzioni').whereIn('codice', codiciFunzione).del();

  // 4. Inserisci le nuove funzioni
  await knex('funzioni').insert(funzioniDMS);

  console.log('Seed DMS: Funzioni DM_FILE_VIEW, DM_FILE_UPLOAD, DM_FILE_DELETE, DM_ADMIN_QUOTA inserite con successo.');
};

/**
 * Funzione 'down' (opzionale ma raccomandata)
 *
 * Descrizione: Rimuove i dati inseriti da questo seed in caso di rollback.
 *
 * Utilizzo:
 * `npx knex seed:rollback --specific=20251104123600_add_funzioni_dms.js`
 */
exports.down = async function(knex) {
  // Definisci i codici funzione da rimuovere
  const codiciFunzione = [
    'DM_FILE_VIEW',
    'DM_FILE_UPLOAD',
    'DM_FILE_DELETE',
    'DM_ADMIN_QUOTA'
  ];

  // Rimuovi le funzioni
  await knex('funzioni').whereIn('codice', codiciFunzione).del();

  console.log('Rollback Seed DMS: Funzioni DMS rimosse.');
};
