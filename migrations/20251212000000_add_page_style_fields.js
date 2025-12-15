/**
 * Migration: Aggiunta campi stile personalizzati pagine
 * Aggiunge opzioni per background, font e stili testo alle pagine
 * Fix: Rimosso defaultTo da colonne JSON/TEXT per compatibilità MySQL 8.0
 */

exports.up = function(knex) {
  return knex.schema
    .alterTable('pagine_sito_web', (table) => {
      console.log('🚀 Aggiunta campi stile alla tabella pagine_sito_web...');
      
      // Background settings
      table.string('background_type', 20).defaultTo('color').comment('Tipo background: color, gradient, image');
      table.string('background_color', 50).nullable().comment('Colore background es. #ffffff');
      table.string('background_gradient', 200).nullable().comment('Gradiente background es. linear-gradient(45deg, #667eea, #764ba2)');
      table.string('background_image', 500).nullable().comment('URL immagine di background');
      table.enum('background_size', ['cover', 'contain', 'auto']).defaultTo('cover').comment('Dimensione immagine background');
      table.enum('background_position', ['center', 'top', 'bottom', 'left', 'right']).defaultTo('center').comment('Posizione immagine background');
      table.enum('background_repeat', ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).defaultTo('no-repeat').comment('Ripetizione immagine background');
      table.string('background_attachment', 20).defaultTo('scroll').comment('Background attachment: scroll, fixed');

      // Typography settings
      table.string('font_family', 100).defaultTo('Inter').comment('Font family principale');
      table.string('font_size', 20).defaultTo('16').comment('Dimensione font base in px');
      table.string('font_color', 50).defaultTo('#333333').comment('Colore testo principale');
      table.string('heading_font', 100).nullable().comment('Font family per titoli');
      table.string('heading_color', 50).defaultTo('#1a1a1a').comment('Colore titoli');

      // Layout e spaziatura
      table.string('container_max_width', 50).defaultTo('1200px').comment('Larghezza massima container');
      table.string('padding_top', 20).defaultTo('60px').comment('Padding superiore pagina');
      table.string('padding_bottom', 20).defaultTo('60px').comment('Padding inferiore pagina');

      // Altri stili
      table.text('custom_css').nullable().comment('CSS personalizzato aggiuntivo');
      
      // --- FIX: Rimosso defaultTo('{}') per risolvere l'errore MySQL ---
      table.json('style_config').nullable().comment('Configurazione stili in formato JSON');

      // Indici
      table.index(['background_type']);
      table.index(['font_family']);

      console.log('✅ Campi stile aggiunti.');
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('pagine_sito_web', (table) => {
      console.log('🔄 Rimozione campi stile...');
      
      // Rimozione campi background
      table.dropColumn('background_type');
      table.dropColumn('background_color');
      table.dropColumn('background_gradient');
      table.dropColumn('background_image');
      table.dropColumn('background_size');
      table.dropColumn('background_position');
      table.dropColumn('background_repeat');
      table.dropColumn('background_attachment');

      // Rimozione campi typography
      table.dropColumn('font_family');
      table.dropColumn('font_size');
      table.dropColumn('font_color');
      table.dropColumn('heading_font');
      table.dropColumn('heading_color');

      // Rimozione layout e spaziatura
      table.dropColumn('container_max_width');
      table.dropColumn('padding_top');
      table.dropColumn('padding_bottom');

      // Rimozione altri stili
      table.dropColumn('custom_css');
      table.dropColumn('style_config');
      
      console.log('✅ Campi stile rimossi.');
    });
};