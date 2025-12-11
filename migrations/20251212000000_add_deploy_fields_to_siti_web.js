/**
 * Migration: Aggiunta campi deploy alla tabella siti_web_aziendali
 * Data: 2025-12-12
 * Scopo: Supporto generazione e deploy siti statici
 */

exports.up = function(knex) {
  return knex.schema.alterTable('siti_web_aziendali', (table) => {
    // Stati deploy: 'pending', 'building', 'success', 'error', 'cleaned'
    table.string('deploy_status', 20).defaultTo('pending').after('catalog_settings');

    // Dominio personalizzato
    table.string('deploy_domain', 255).nullable().after('deploy_status');

    // Path sito generato
    table.string('deploy_path', 500).nullable().after('deploy_domain');

    // Timestamp deploy
    table.timestamp('deployed_at').nullable().after('deploy_path');

    // Messaggio errore deploy
    table.text('deploy_error').nullable().after('deployed_at');

    // Timestamp cleanup
    table.timestamp('cleaned_at').nullable().after('deploy_error');

    // Configurazione VPS (JSON)
    table.json('vps_config').nullable().after('cleaned_at');

    // URL sito pubblicato
    table.string('published_url', 500).nullable().after('vps_config');

    // Stats deploy
    table.integer('total_deploys').defaultTo(0).after('published_url');
    table.timestamp('last_deploy_success').nullable().after('total_deploys');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('siti_web_aziendali', (table) => {
    table.dropColumn('deploy_status');
    table.dropColumn('deploy_domain');
    table.dropColumn('deploy_path');
    table.dropColumn('deployed_at');
    table.dropColumn('deploy_error');
    table.dropColumn('cleaned_at');
    table.dropColumn('vps_config');
    table.dropColumn('published_url');
    table.dropColumn('total_deploys');
    table.dropColumn('last_deploy_success');
  });
};