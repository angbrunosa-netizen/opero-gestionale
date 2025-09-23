/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.table('ppa_istanzeprocedure', function(table) {
    // Aggiunge i nuovi campi per la relazione polimorfica, inizialmente nullabili
    table.string('TargetEntityType', 20).after('ID_DittaTarget');
    table.integer('TargetEntityID').unsigned().after('TargetEntityType');
  });

  // Migra i dati esistenti: tutte le istanze attuali puntano a ditte.
  await knex('ppa_istanzeprocedure')
    .whereNotNull('ID_DittaTarget')
    .update({
      TargetEntityType: 'DITTA',
      TargetEntityID: knex.raw('ID_DittaTarget') // Copia il valore
    });

  // Ora che i dati sono migrati, possiamo rendere i campi non nullabili
  await knex.schema.table('ppa_istanzeprocedure', function(table) {
      table.string('TargetEntityType', 20).notNullable().alter();
      table.integer('TargetEntityID').unsigned().notNullable().alter();
  });

  // Infine, rimuove la vecchia colonna e la sua foreign key
  await knex.schema.table('ppa_istanzeprocedure', function(table) {
    // Il nome della FK è definito nel file .sql: fk_ppa_istanzeprocedure_ID_DittaTarget
    table.dropForeign('ID_DittaTarget', 'fk_ppa_istanzeprocedure_ID_DittaTarget');
    table.dropColumn('ID_DittaTarget');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // 1. Riaaggiunge la vecchia colonna, nullabile per ora
    await knex.schema.table('ppa_istanzeprocedure', function(table) {
        table.integer('ID_DittaTarget').unsigned().after('ID');
    });

    // 2. Ripristina i dati per le sole entità di tipo 'DITTA'
    await knex('ppa_istanzeprocedure')
        .where('TargetEntityType', 'DITTA')
        .update({
            ID_DittaTarget: knex.raw('TargetEntityID')
        });
    
    // 3. Aggiunge nuovamente la foreign key
    await knex.schema.table('ppa_istanzeprocedure', function(table) {
        table.foreign('ID_DittaTarget', 'fk_ppa_istanzeprocedure_ID_DittaTarget').references('id').inTable('ditte');
    });

    // 4. Rimuove i campi polimorfici
    await knex.schema.table('ppa_istanzeprocedure', function(table) {
        table.dropColumn('TargetEntityType');
        table.dropColumn('TargetEntityID');
    });
};
