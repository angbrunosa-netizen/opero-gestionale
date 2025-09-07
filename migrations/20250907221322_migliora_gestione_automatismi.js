/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. NUOVA TABELLA: Definisce i collegamenti tra funzioni primarie e secondarie
  await knex.schema.createTable('sc_funzioni_collegate', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');

    // FK verso la funzione che "innesca" l'azione
    table.integer('id_funzione_primaria', 11).unsigned().notNullable();
    table.foreign('id_funzione_primaria', 'fk_coll_funz_primaria').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');

    // FK verso la funzione che "viene innescata"
    table.integer('id_funzione_secondaria', 11).unsigned().notNullable();
    table.foreign('id_funzione_secondaria', 'fk_coll_funz_secondaria').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');
    
    table.integer('ordine').defaultTo(0);
    table.unique(['id_funzione_primaria', 'id_funzione_secondaria'], 'uq_funz_collegate');
  });

  // 2. Tabella per le Partite Aperte (Clienti/Fornitori)
  await knex.schema.createTable('sc_partite_aperte', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');
    
    table.integer('id_ditta_soggetto', 11).unsigned().notNullable();
    table.foreign('id_ditta_soggetto', 'fk_partite_ditte').references('id').inTable('ditte').onDelete('CASCADE');

    table.enum('tipo', ['CLIENTE', 'FORNITORE']).notNullable();
    table.date('data_documento').notNullable();
    table.string('numero_documento', 50).notNullable();
    table.date('data_scadenza').nullable();
    table.decimal('importo_originario', 15, 2).notNullable();
    table.decimal('importo_residuo', 15, 2).notNullable();
    table.enum('stato', ['APERTA', 'CHIUSA', 'PARZIALE']).defaultTo('APERTA');
    table.timestamps(true, true);
  });

  // 3. Tabella per i Movimenti IVA
  await knex.schema.createTable('sc_movimenti_iva', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');
    
    table.enum('tipo_registro', ['VENDITE', 'ACQUISTI']).notNullable();
    table.decimal('imponibile', 15, 2).notNullable();
    table.decimal('aliquota', 5, 2).notNullable();
    table.decimal('imposta', 15, 2).notNullable();
    table.timestamps(true, true);
  });

  // 4. Tabella per la mappatura dei parametri (ora si collega alla tabella corretta)
  await knex.schema.createTable('sc_funzioni_collegate_mapping', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');
    
    table.integer('id_funzione_collegata', 11).unsigned().notNullable();
    table.foreign('id_funzione_collegata', 'fk_mapping_funz_coll').references('id').inTable('sc_funzioni_collegate').onDelete('CASCADE');

    table.string('parametro_origine', 50).notNullable();
    table.string('tabella_destinazione', 50).notNullable();
    table.string('colonna_destinazione', 50).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sc_funzioni_collegate_mapping');
  await knex.schema.dropTableIfExists('sc_movimenti_iva');
  await knex.schema.dropTableIfExists('sc_partite_aperte');
  await knex.schema.dropTableIfExists('sc_funzioni_collegate');
};
