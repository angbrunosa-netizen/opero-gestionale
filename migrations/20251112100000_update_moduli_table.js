/**
 * @file opero/migrations/20251112100000_update_moduli_table.js
 * @description Aggiorna la tabella 'moduli' esistente (v1.1)
 * - Aggiunge 'icon_name', 'permission_required', 'ordine', 'attivo'.
 * - Popola i nuovi campi per TUTTI i 12 moduli da 'moduli (2).sql'.
 * - Crea i nuovi permessi (es. 'CONT_SMART_MDVIEW') come richiesto.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Aggiungi le nuove colonne
  await knex.schema.alterTable('moduli', (table) => {
    table.string('icon_name', 50).nullable().after('chiave_componente');
    table.string('permission_required', 100).nullable().after('icon_name');
    table.integer('ordine').defaultTo(0).after('permission_required');
    table.boolean('attivo').defaultTo(true).after('ordine');
  });

  // 2. Popola i nuovi campi per tutti i moduli
  const moduli = [
    { chiave: 'AMMINISTRAZIONE', icon: 'BuildingOffice2Icon', ordine: 10 },
    { chiave: 'CONT_SMART', icon: 'CalculatorIcon', ordine: 20 },
    { chiave: 'ADMIN_PANEL', icon: 'UserCircleIcon', ordine: 100 },
    { chiave: 'MAIL', icon: 'EnvelopeIcon', ordine: 60 },
    { chiave: 'RUBRICA', icon: 'UserGroupIcon', ordine: 15 },
    { chiave: 'FIN_SMART', icon: 'BanknotesIcon', ordine: 80 },
    { chiave: 'BSSMART', icon: 'ComputerDesktopIcon', ordine: 70 },
    { chiave: 'PPA SIS', icon: 'ClipboardDocumentListIcon', ordine: 90 },
    { chiave: 'CT_VIEW', icon: 'BookOpenIcon', ordine: 40 },
    { chiave: 'MG_VIEW', icon: 'ArchiveBoxIcon', ordine: 95 },
    { chiave: 'VA_CLIENTI_VIEW', icon: 'CurrencyDollarIcon', ordine: 96 },
    { chiave: 'DOCUMENTI', icon: 'ArchiveBoxIcon', ordine: 50 }
  ];

  const updates = moduli.map(m => {
    return knex('moduli')
      .where('chiave_componente', m.chiave)
      .update({
        icon_name: m.icon,
        ordine: m.ordine,
        // Crea il nuovo permesso (es. 'CONT_SMART_MDVIEW')
        permission_required: `${m.chiave}_MDVIEW` 
      });
  });
  
  await Promise.all(updates);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('moduli', (table) => {
    table.dropColumn('icon_name');
    table.dropColumn('permission_required');
    table.dropColumn('ordine');
    table.dropColumn('attivo');
  });
};