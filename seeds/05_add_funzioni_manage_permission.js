/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Nome del ruolo e codice della funzione da inserire
  const adminRoleName = 'Amministratore di Sistema';
  const manageFunctionCode = 'FUNZIONI_MANAGE';
  const manageFunctionDescription = 'Gestione anagrafica funzioni di sistema';
  const moduleName = 'ADMIN';

  // 1. Cerca l'ID del ruolo "Amministratore di Sistema"
  const adminRole = await knex('ruoli').where('nome_ruolo', adminRoleName).first();

  if (!adminRole) {
    console.log(`ATTENZIONE: Il ruolo '${adminRoleName}' non è stato trovato. Impossibile assegnare il permesso.`);
    return;
  }

  // 2. Inserisce la nuova funzione se non esiste già
  // Usiamo onConflict().ignore() per evitare errori se il codice esiste già.
  await knex('funzioni')
    .insert({
      codice: manageFunctionCode,
      descrizione: manageFunctionDescription,
      modulo: moduleName,
    })
    .onConflict('codice')
    .ignore();
  
  // Recupera l'ID della funzione appena inserita o già esistente
  const newFunction = await knex('funzioni').where('codice', manageFunctionCode).first();

  if (!newFunction) {
    console.error(`ERRORE: La funzione '${manageFunctionCode}' non è stata trovata dopo il tentativo di inserimento.`);
    return;
  }

  // 3. Verifica se l'associazione tra ruolo e funzione esiste già
  const existingLink = await knex('ruoli_funzioni')
    .where({
      id_ruolo: adminRole.id,
      id_funzione: newFunction.id,
    })
    .first();

  // 4. Se l'associazione non esiste, la crea
  if (!existingLink) {
    await knex('ruoli_funzioni').insert({
      id_ruolo: adminRole.id,
      id_funzione: newFunction.id,
    });
    console.log(`Permesso '${manageFunctionCode}' assegnato correttamente al ruolo '${adminRoleName}'.`);
  } else {
    console.log(`Il permesso '${manageFunctionCode}' era già assegnato al ruolo '${adminRoleName}'. Nessuna modifica apportata.`);
  }
};
