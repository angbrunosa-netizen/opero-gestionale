/**
 * Migration: Aggiunta campi stile globali per siti web
 * Aggiunge opzioni per background, font e stili personalizzati a livello di sito
 * Questi stili verranno ereditati da tutte le pagine del sito
 * FIX: Rimosso defaultTo da JSON e aggiunti controlli di idempotenza (hasColumn)
 */

exports.up = function(knex) {
  return knex.schema
    .alterTable('siti_web_aziendali', async (table) => { // Aggiunto 'async' per i controlli
      const tableName = 'siti_web_aziendali';
      const hasColumn = async (column) => await knex.schema.hasColumn(tableName, column);

      // Background settings globali
      if (!(await hasColumn('global_background_type'))) {
          table.string('global_background_type', 20).defaultTo('color').comment('Tipo background globale: color, gradient, image');
      }
      if (!(await hasColumn('global_background_color'))) {
          table.string('global_background_color', 50).defaultTo('#ffffff').comment('Colore background globale');
      }
      if (!(await hasColumn('global_background_gradient'))) {
          table.string('global_background_gradient', 200).nullable().comment('Gradiente background globale');
      }
      if (!(await hasColumn('global_background_image'))) {
          table.string('global_background_image', 500).nullable().comment('URL immagine di background globale');
      }
      if (!(await hasColumn('global_background_size'))) {
          table.enum('global_background_size', ['cover', 'contain', 'auto']).defaultTo('cover').comment('Dimensione immagine background globale');
      }
      if (!(await hasColumn('global_background_position'))) {
          table.enum('global_background_position', ['center', 'top', 'bottom', 'left', 'right']).defaultTo('center').comment('Posizione immagine background globale');
      }
      if (!(await hasColumn('global_background_repeat'))) {
          table.enum('global_background_repeat', ['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).defaultTo('no-repeat').comment('Ripetizione immagine background globale');
      }
      if (!(await hasColumn('global_background_attachment'))) {
          table.string('global_background_attachment', 20).defaultTo('scroll').comment('Background attachment globale: scroll, fixed');
      }

      // Typography settings globali
      if (!(await hasColumn('global_font_family'))) {
          table.string('global_font_family', 100).defaultTo('Inter').comment('Font family principale globale');
      }
      if (!(await hasColumn('global_font_size'))) {
          table.string('global_font_size', 20).defaultTo('16').comment('Dimensione font base globale in px');
      }
      if (!(await hasColumn('global_font_color'))) {
          table.string('global_font_color', 50).defaultTo('#333333').comment('Colore testo principale globale');
      }
      if (!(await hasColumn('global_heading_font'))) {
          table.string('global_heading_font', 100).defaultTo('Inter').comment('Font family per titoli globale');
      }
      if (!(await hasColumn('global_heading_color'))) {
          table.string('global_heading_color', 50).defaultTo('#1a1a1a').comment('Colore titoli globale');
      }

      // Color scheme globale
      if (!(await hasColumn('primary_color'))) {
          table.string('primary_color', 50).defaultTo('#3B82F6').comment('Colore primario del sito');
      }
      if (!(await hasColumn('secondary_color'))) {
          table.string('secondary_color', 50).defaultTo('#64748B').comment('Colore secondario del sito');
      }
      if (!(await hasColumn('accent_color'))) {
          table.string('accent_color', 50).defaultTo('#EF4444').comment('Colore d\'accento del sito');
      }
      if (!(await hasColumn('button_background_color'))) {
          table.string('button_background_color', 50).defaultTo('#3B82F6').comment('Colore sfondo pulsanti');
      }
      if (!(await hasColumn('button_text_color'))) {
          table.string('button_text_color', 50).defaultTo('#ffffff').comment('Colore testo pulsanti');
      }
      if (!(await hasColumn('link_color'))) {
          table.string('link_color', 50).defaultTo('#2563EB').comment('Colore link');
      }

      // Layout globale
      if (!(await hasColumn('global_container_max_width'))) {
          table.string('global_container_max_width', 50).defaultTo('1200px').comment('Larghezza massima container globale');
      }
      if (!(await hasColumn('global_padding_top'))) {
          table.string('global_padding_top', 20).defaultTo('60px').comment('Padding superiore pagina globale');
      }
      if (!(await hasColumn('global_padding_bottom'))) {
          table.string('global_padding_bottom', 20).defaultTo('60px').comment('Padding inferiore pagina globale');
      }

      // Personalizzazione CSS globale
      if (!(await hasColumn('global_custom_css'))) {
          table.text('global_custom_css').nullable().comment('CSS personalizzato globale aggiuntivo');
      }
      
      // --- FIX: Rimosso defaultTo('{}') ---
      if (!(await hasColumn('global_style_config'))) {
          table.json('global_style_config').nullable().comment('Configurazione stili globali in formato JSON');
      }

      // Indici performance (aggiungi solo se le colonne sono state aggiunte ora)
      // La gestione dell'indice è più sicura quando si ricrea il file. Qui li manteniamo semplici.
      if (!(await hasColumn('global_background_type'))) { table.index(['global_background_type']); }
      if (!(await hasColumn('global_font_family'))) { table.index(['global_font_family']); }
      if (!(await hasColumn('primary_color'))) { table.index(['primary_color']); }
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('siti_web_aziendali', async (table) => { // Aggiunto 'async'
      const tableName = 'siti_web_aziendali';
      const dropIfExists = async (column) => {
          if (await knex.schema.hasColumn(tableName, column)) {
              table.dropColumn(column);
          }
      };
      
      // Rimozione campi background globali
      await dropIfExists('global_background_type');
      await dropIfExists('global_background_color');
      await dropIfExists('global_background_gradient');
      await dropIfExists('global_background_image');
      await dropIfExists('global_background_size');
      await dropIfExists('global_background_position');
      await dropIfExists('global_background_repeat');
      await dropIfExists('global_background_attachment');

      // Rimozione campi typography globali
      await dropIfExists('global_font_family');
      await dropIfExists('global_font_size');
      await dropIfExists('global_font_color');
      await dropIfExists('global_heading_font');
      await dropIfExists('global_heading_color');

      // Rimozione color scheme globale
      await dropIfExists('primary_color');
      await dropIfExists('secondary_color');
      await dropIfExists('accent_color');
      await dropIfExists('button_background_color');
      await dropIfExists('button_text_color');
      await dropIfExists('link_color');

      // Rimozione layout globale
      await dropIfExists('global_container_max_width');
      await dropIfExists('global_padding_top');
      await dropIfExists('global_padding_bottom');

      // Rimozione personalizzazione CSS globale
      await dropIfExists('global_custom_css');
      await dropIfExists('global_style_config');
    });
};