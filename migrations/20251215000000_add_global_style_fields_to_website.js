/**
 * Migration: Aggiunta campi stile globali per siti web
 * Aggiunge opzioni per background, font e stili personalizzati a livello di sito
 * Questi stili verranno ereditati da tutte le pagine del sito
 */

exports.up = function(knex) {
  return knex.schema
    .alterTable('siti_web_aziendali', (table) => {
      // Background settings globali
      table.string('global_background_type', 20).defaultTo('color').comment('Tipo background globale: color, gradient, image');
      table.string('global_background_color', 50).defaultTo('#ffffff').comment('Colore background globale');
      table.string('global_background_gradient', 200).nullable().comment('Gradiente background globale');
      table.string('global_background_image', 500).nullable().comment('URL immagine di background globale');
      table.enum('global_background_size', ['cover', 'contain', 'auto']).defaultTo('cover').comment('Dimensione immagine background globale');
      table.enum('global_background_position', ['center', 'top', 'bottom', 'left', 'right']).defaultTo('center').comment('Posizione immagine background globale');
      table.enum('global_background_repeat', ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).defaultTo('no-repeat').comment('Ripetizione immagine background globale');
      table.string('global_background_attachment', 20).defaultTo('scroll').comment('Background attachment globale: scroll, fixed');

      // Typography settings globali
      table.string('global_font_family', 100).defaultTo('Inter').comment('Font family principale globale');
      table.string('global_font_size', 20).defaultTo('16').comment('Dimensione font base globale in px');
      table.string('global_font_color', 50).defaultTo('#333333').comment('Colore testo principale globale');
      table.string('global_heading_font', 100).defaultTo('Inter').comment('Font family per titoli globale');
      table.string('global_heading_color', 50).defaultTo('#1a1a1a').comment('Colore titoli globale');

      // Color scheme globale
      table.string('primary_color', 50).defaultTo('#3B82F6').comment('Colore primario del sito');
      table.string('secondary_color', 50).defaultTo('#64748B').comment('Colore secondario del sito');
      table.string('accent_color', 50).defaultTo('#EF4444').comment('Colore d\'accento del sito');
      table.string('button_background_color', 50).defaultTo('#3B82F6').comment('Colore sfondo pulsanti');
      table.string('button_text_color', 50).defaultTo('#ffffff').comment('Colore testo pulsanti');
      table.string('link_color', 50).defaultTo('#2563EB').comment('Colore link');

      // Layout globale
      table.string('global_container_max_width', 50).defaultTo('1200px').comment('Larghezza massima container globale');
      table.string('global_padding_top', 20).defaultTo('60px').comment('Padding superiore pagina globale');
      table.string('global_padding_bottom', 20).defaultTo('60px').comment('Padding inferiore pagina globale');

      // Personalizzazione CSS globale
      table.text('global_custom_css').nullable().comment('CSS personalizzato globale aggiuntivo');
      table.json('global_style_config').defaultTo('{}').comment('Configurazione stili globali in formato JSON');

      // Indici performance
      table.index(['global_background_type']);
      table.index(['global_font_family']);
      table.index(['primary_color']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('siti_web_aziendali', (table) => {
      // Rimozione campi background globali
      table.dropColumn('global_background_type');
      table.dropColumn('global_background_color');
      table.dropColumn('global_background_gradient');
      table.dropColumn('global_background_image');
      table.dropColumn('global_background_size');
      table.dropColumn('global_background_position');
      table.dropColumn('global_background_repeat');
      table.dropColumn('global_background_attachment');

      // Rimozione campi typography globali
      table.dropColumn('global_font_family');
      table.dropColumn('global_font_size');
      table.dropColumn('global_font_color');
      table.dropColumn('global_heading_font');
      table.dropColumn('global_heading_color');

      // Rimozione color scheme globale
      table.dropColumn('primary_color');
      table.dropColumn('secondary_color');
      table.dropColumn('accent_color');
      table.dropColumn('button_background_color');
      table.dropColumn('button_text_color');
      table.dropColumn('link_color');

      // Rimozione layout globale
      table.dropColumn('global_container_max_width');
      table.dropColumn('global_padding_top');
      table.dropColumn('global_padding_bottom');

      // Rimozione personalizzazione CSS globale
      table.dropColumn('global_custom_css');
      table.dropColumn('global_style_config');
    });
};