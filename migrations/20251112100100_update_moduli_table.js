/**
 * @file opero/migrations/20251112100100_populate_funzioni_mdview.js
 * @description Popola la tabella 'funzioni'.
 * - Legge i moduli dalla tabella 'moduli'.
 * - Crea una funzione di "visualizzazione" (es. 'CONT_SMART_MDVIEW')
 * per ogni modulo e la collega.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Assicurati che la tabella 'funzioni' esista
  const hasTable = await knex.schema.hasTable('funzioni');
  if (!hasTable) {
    console.warn("Tabella 'funzioni' non trovata. Salto il popolamento.");
    return;
  }

  // 2. Leggi tutti i moduli dal DB
  const moduli = await knex('moduli').select('chiave_componente', 'descrizione', 'permission_required');

  // 3. Prepara i nuovi record per la tabella 'funzioni'
  const funzioniDaInserire = moduli.map(m => ({
    codice: m.permission_required, // Es. 'CONT_SMART_MDVIEW'
    descrizione: `Accesso al modulo ${m.descrizione}`,
    Scorciatoia: 0, // Come da tuo SQL
    chiave_componente_modulo: m.chiave_componente // Link al modulo
  }));

  // 4. Inserisci solo se non esistono già
  // (Usa 'ignore' per MySQL/MariaDB per evitare crash se la migrazione gira più volte)
  // Per Knex puro, un try/catch o un 'onConflict' è più sicuro,
  // ma per un inserimento bulk 'insert...on conflict...ignore' è più semplice.
  // Usiamo 'onConflict' per PostgreSQL/SQLite e 'ignore' per MySQL
  try {
    // Sintassi per PostgreSQL / SQLite
    await knex('funzioni').insert(funzioniDaInserire).onConflict('codice').ignore();
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY' || e.errno === 1062) {
      // Errore duplicato (MySQL), lo ignoriamo
      console.log("Alcuni permessi MDVIEW esistono già, ignorati.");
    } else if (e.code === '23505') {
       // Errore duplicato (PostgreSQL), lo ignoriamo
       console.log("Alcuni permessi MDVIEW esistono già, ignorati.");
    } else {
      // Altro errore
      throw e;
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuovi i permessi creati
  const moduli = await knex('moduli').select('permission_required');
  const codiciDaRimuovere = moduli.map(m => m.permission_required);
  
  return knex('funzioni')
    .whereIn('codice', codiciDaRimuovere)
    .del();
};