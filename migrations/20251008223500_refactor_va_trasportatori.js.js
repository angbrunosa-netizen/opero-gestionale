/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // VERSIONE 5 (FINALE): Aggiunge il campo per la gestione multi-tenancy.
  
  // 1. Eseguo tutti i controlli sullo schema in anticipo.
  const hasRagioneSociale = await knex.schema.hasColumn('va_trasportatori', 'ragione_sociale');
  const hasReferente = await knex.schema.hasColumn('va_trasportatori', 'referente');
  const hasTelefono = await knex.schema.hasColumn('va_trasportatori', 'telefono');
  const hasIdDitta = await knex.schema.hasColumn('va_trasportatori', 'id_ditta');
  const hasIdUtenteReferente = await knex.schema.hasColumn('va_trasportatori', 'id_utente_referente');
  // NUOVO CONTROLLO: Verifico l'esistenza del campo per la multi-utenza.
  const hasIdDittaProprietaria = await knex.schema.hasColumn('va_trasportatori', 'id_ditta_proprietaria');

  // 2. Eseguo l'alterazione della tabella.
  await knex.schema.alterTable('va_trasportatori', (table) => {
    if (hasRagioneSociale) table.dropColumn('ragione_sociale');
    if (hasReferente) table.dropColumn('referente');
    if (hasTelefono) table.dropColumn('telefono');

    // NUOVO: Aggiungo il campo per la multi-tenancy, che collega questo record alla ditta dell'utente.
    if (!hasIdDittaProprietaria) {
        table.integer('id_ditta_proprietaria').unsigned().notNullable().after('id');
        table.foreign('id_ditta_proprietaria').references('ditte.id').onDelete('CASCADE');
    }

    // Questo è l'ID dell'anagrafica del trasportatore nella tabella 'ditte'.
    if (!hasIdDitta) {
      table.integer('id_ditta').unsigned().notNullable().after('id_ditta_proprietaria');
      table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');
    }
    
    // Questo è l'ID del referente nella tabella 'utenti'.
    if (!hasIdUtenteReferente) {
      table.integer('id_utente_referente').nullable().after('id_ditta');
      table.foreign('id_utente_referente').references('utenti.id').onDelete('SET NULL');
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rollback sicuro
  
  const hasIdDitta = await knex.schema.hasColumn('va_trasportatori', 'id_ditta');
  const hasIdUtenteReferente = await knex.schema.hasColumn('va_trasportatori', 'id_utente_referente');
  const hasIdDittaProprietaria = await knex.schema.hasColumn('va_trasportatori', 'id_ditta_proprietaria');
  const hasRagioneSociale = await knex.schema.hasColumn('va_trasportatori', 'ragione_sociale');
  const hasReferente = await knex.schema.hasColumn('va_trasportatori', 'referente');
  const hasTelefono = await knex.schema.hasColumn('va_trasportatori', 'telefono');

  await knex.schema.alterTable('va_trasportatori', (table) => {
    if (hasIdDitta) table.dropForeign('id_ditta');
    if (hasIdUtenteReferente) table.dropForeign('id_utente_referente');
    if (hasIdDittaProprietaria) table.dropForeign('id_ditta_proprietaria');
    
    if (hasIdDitta) table.dropColumn('id_ditta');
    if (hasIdUtenteReferente) table.dropColumn('id_utente_referente');
    if (hasIdDittaProprietaria) table.dropColumn('id_ditta_proprietaria');

    if (!hasRagioneSociale) table.string('ragione_sociale', 255);
    if (!hasReferente) table.string('referente', 100);
    if (!hasTelefono) table.string('telefono', 30);
  });
};

