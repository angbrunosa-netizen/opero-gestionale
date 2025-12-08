/**
 * Script per aggiornare tutte le query del backend Website Gallery
 * Sostituisce i nomi vecchi delle tabelle con quelli nuovi (wg_*)
 */

const fs = require('fs');
const path = require('path');

const oldToNew = {
  'gallerie_sito_web': 'wg_galleries',
  'gallerie_immagini': 'wg_gallery_images'
};

const filePath = path.join(__dirname, '../routes/website.js');

function updateQueries() {
  console.log('🔄 Aggiornamento query Website Gallery...');

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Sostituisci tutte le occorrenze dei nomi delle tabelle
    Object.entries(oldToNew).forEach(([oldName, newName]) => {
      const regex = new RegExp(oldName, 'g');
      const before = content;
      content = content.replace(regex, newName);

      if (before !== content) {
        console.log(`✅ Sostituito: ${oldName} → ${newName}`);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log('✅ File aggiornato con successo');
    } else {
      console.log('ℹ️  Nessuna modifica necessaria');
    }

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
  }
}

// Esegui l'aggiornamento
updateQueries();