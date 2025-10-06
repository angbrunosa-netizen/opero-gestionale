/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // --- 1. Creazione Tabella Principale ANAGRAFICA CLIENTI ---
  await knex.schema.createTable('va_clienti_anagrafica', function(table) {
    // Chiave primaria e Foreign Key sulla tabella 'ditte'. Se una ditta viene cancellata, anche i suoi dati cliente vengono cancellati.
    table.integer('id_ditta').unsigned().primary().references('id').inTable('ditte').onDelete('CASCADE');

    // Listini e Sconti
    table.integer('listino_cessione').comment('Indica quale colonna prezzo_cessione_X usare da ct_listini');
    table.integer('listino_pubblico').comment('Indica quale colonna prezzo_pubblico_X usare da ct_listini');
    table.integer('id_matrice_sconti').unsigned().nullable().references('id').inTable('va_matrici_sconti').onDelete('SET NULL');
    table.integer('riga_matrice_sconti').comment('Indica la riga da usare nella matrice sconti associata');

    // Raggruppamenti
    table.integer('id_categoria_cliente').unsigned().nullable().references('id').inTable('va_categorie_clienti').onDelete('SET NULL');
    table.integer('id_gruppo_cliente').unsigned().nullable().references('id').inTable('va_gruppi_clienti').onDelete('SET NULL');

    // Referenti interni (collegati a utenti)
    table.integer('id_referente').unsigned().nullable().references('id').inTable('utenti').onDelete('SET NULL');
    table.integer('id_referente_allert').unsigned().nullable().references('id').inTable('utenti').onDelete('SET NULL');
    table.integer('id_referente_ppa').unsigned().nullable().references('id').inTable('utenti').onDelete('SET NULL');
    table.integer('id_agente').unsigned().nullable().references('id').inTable('utenti').onDelete('SET NULL');

    // Logistica e Consegna
    table.enum('giorno_di_consegna', ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']);
    table.string('giro_consegna', 100);
    table.integer('id_trasportatore_assegnato').unsigned().nullable().references('id').inTable('va_trasportatori').onDelete('SET NULL');
    table.string('metodo_di_consegna', 255);
    table.text('allestimento_logistico');

    // Dati Amministrativi
    table.enum('tipo_fatturazione', ['Immediata', 'Fine Mese', 'A Consegna']);
    table.integer('id_tipo_pagamento').nullable().references('id').inTable('tipi_pagamento').onDelete('SET NULL');
    table.enum('stato', ['Attivo', 'Sospeso', 'Bloccato']).defaultTo('Attivo');

    // Dati Commerciali e Marketing
    table.string('sito_web');
    table.string('pagina_facebook');
    table.string('pagina_instagram');
    table.string('url_link').comment('Link generico, es. per portali');
    table.text('google_maps');
    table.text('concorrenti');
    table.string('foto_url');
    table.decimal('fatturato_anno_pr', 15, 2).comment('Fatturato anno precedente');
    table.decimal('fatturato_anno_cr', 15, 2).comment('Fatturato anno corrente');
    table.integer('id_contratto').unsigned().nullable().references('id').inTable('va_contratti').onDelete('SET NULL');

    console.log('Tabella va_clienti_anagrafica creata.');
  });

  // --- 2. Creazione Tabella PUNTI DI CONSEGNA (dipende dall'esistenza delle ditte/clienti) ---
  await knex.schema.createTable('va_punti_consegna', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
    table.integer('id_cliente').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
    table.string('descrizione', 255).notNullable();
    table.string('indirizzo');
    table.string('citta');
    table.string('cap', 10);
    table.string('provincia', 5);
    table.string('referente');
    table.string('telefono');
    console.log('Tabella va_punti_consegna creata.');
  });
  
  // --- 3. Aggiunta FK per punto di consegna predefinito (dopo che la tabella va_punti_consegna è stata creata) ---
  await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
      table.integer('id_punto_consegna_predefinito').unsigned().nullable().references('id').inTable('va_punti_consegna').onDelete('SET NULL');
      console.log('Aggiunta FK id_punto_consegna_predefinito a va_clienti_anagrafica.');
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuove le tabelle in ordine inverso di creazione e di dipendenza
  await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
      table.dropForeign('id_punto_consegna_predefinito');
      table.dropColumn('id_punto_consegna_predefinito');
  });
  await knex.schema.dropTableIfExists('va_punti_consegna');
  await knex.schema.dropTableIfExists('va_clienti_anagrafica');
};
