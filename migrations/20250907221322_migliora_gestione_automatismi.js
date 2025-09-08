/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 2. Tabella per le Partite Aperte (Clienti/Fornitori)
  if (!(await knex.schema.hasTable('sc_partite_aperte'))) {
    await knex.schema.createTable('sc_partite_aperte', (table) => {
      table.increments('id').unsigned().primary();

      // Corretto: Rimosso .unsigned() per farlo corrispondere a ditte.id (che è SIGNED)
      table.integer('id_ditta_anagrafica').notNullable();
      table.foreign('id_ditta_anagrafica').references('id').inTable('ditte').onDelete('CASCADE');
      
      table.date('data_scadenza').notNullable();
      table.decimal('importo', 15, 2).notNullable();
      table.enum('stato', ['APERTA', 'CHIUSA', 'INSOLUTA']).defaultTo('APERTA');
      table.timestamps(true, true);
    });
  }

  // 3. Tabella per i Movimenti IVA
  if (!(await knex.schema.hasTable('sc_movimenti_iva'))) {
    await knex.schema.createTable('sc_movimenti_iva', (table) => {
      table.increments('id').unsigned().primary();
      table.enum('tipo_registro', ['VENDITE', 'ACQUISTI']).notNullable();
      table.decimal('imponibile', 15, 2).notNullable();
      table.decimal('aliquota', 5, 2).notNullable();
      table.decimal('imposta', 15, 2).notNullable();
      table.timestamps(true, true);
    });
  }

  // 4. Tabella per la mappatura dei parametri
  if (!(await knex.schema.hasTable('sc_funzioni_collegate_mapping'))) {
    await knex.schema.createTable('sc_funzioni_collegate_mapping', (table) => {
      table.increments('id').unsigned().primary();
      // Corretto: .unsigned() è necessario qui perché sc_funzioni_collegate.id è unsigned
      table.integer('id_funzione_collegata').unsigned().notNullable();
      table.foreign('id_funzione_collegata', 'fk_mapping_funz_coll').references('id').inTable('sc_funzioni_collegate').onDelete('CASCADE');
      table.string('parametro_origine', 50).notNullable();
      table.string('tabella_destinazione', 50).notNullable();
      table.string('colonna_destinazione', 50).notNullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sc_funzioni_collegate_mapping');
  await knex.schema.dropTableIfExists('sc_movimenti_iva');
  await knex.schema.dropTableIfExists('sc_partite_aperte');
};