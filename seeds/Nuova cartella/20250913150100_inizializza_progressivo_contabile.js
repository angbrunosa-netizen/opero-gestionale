/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const progressivoContabile = {
    id_ditta: 1,
    codice_progressivo: 'PROT_CONT',
    descrizione: 'Protocollo Registrazioni Contabili',
    ultimo_numero: 0,
    serie: null // Nessuna serie per questo progressivo
  };

  // Logica "upsert": inserisce il record solo se non esiste già.
  // Questo rende il seeder sicuro da eseguire più volte.
  const existing = await knex('an_progressivi')
    .where({
      id_ditta: progressivoContabile.id_ditta,
      codice_progressivo: progressivoContabile.codice_progressivo
    })
    .first();

  if (!existing) {
    await knex('an_progressivi').insert(progressivoContabile);
  }
};
