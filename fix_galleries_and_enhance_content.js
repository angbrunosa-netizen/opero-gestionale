const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing gallery field names and enhancing content...\n');

// ============================================================
// 1. FIX FLIP_CARD_GALLERY - items -> cards, image -> immagine
// ============================================================
console.log('📸 Fixing FLIP_CARD_GALLERY field names...');

// Sostituisci tutti i blocchi FLIP_CARD_GALLERY con items -> cards
content = content.replace(
  /(\{[^}]*tipo_componente: "FLIP_CARD_GALLERY"[^}]*dati_config: \{[\s\S]*?)items: \[([\s\S]*?)\]/g,
  (match, prefix, itemsContent) => {
    // Converti ogni item: title -> titolo, image -> immagine, role -> elimina, description -> descrizione
    const fixedItems = itemsContent.replace(
      /\{\s*(title): "([^"]+)",\s*(role): "([^"]*)",\s*(description): "([^"]*)",\s*(image): "([^"]+)"\s*\}/g,
      (itemMatch, titleLabel, titleVal, roleLabel, roleVal, descLabel, descVal, imageLabel, imageVal) => {
        return `{ titolo: "${titleVal}", descrizione: "${descVal}", immagine: "${imageVal}", link: "#" }`;
      }
    ).replace(
      /\{\s*(title): "([^"]+)",\s*(role): "([^"]*)",\s*(description): "([^"]*)",\s*(image): "([^"]+)"\s*\}/g,
      (itemMatch, titleLabel, titleVal, roleLabel, roleVal, descLabel, descVal, imageLabel, imageVal) => {
        return `{ titolo: "${titleVal}", descrizione: "${descVal}", immagine: "${imageVal}", link: "#" }`;
      }
    );
    return `${prefix}cards: [${fixedItems}]`;
  }
);

// ============================================================
// 2. FIX DYNAMIC_IMAGE_GALLERY - images -> immagini, url -> src, caption -> alt
// ============================================================
console.log('🖼️  Fixing DYNAMIC_IMAGE_GALLERY field names...');

content = content.replace(
  /(\{[^}]*tipo_componente: "DYNAMIC_IMAGE_GALLERY"[^}]*dati_config: \{[\s\S]*?)images: \[([\s\S]*?)\]/g,
  (match, prefix, imagesContent) => {
    // Converti ogni immagine: url -> src, caption -> alt/title
    const fixedImages = imagesContent.replace(
      /\{\s*url: "([^"]+)",\s*caption: "([^"]+)"\s*\}/g,
      (imgMatch, urlVal, captionVal) => {
        return `{ src: "${urlVal}", alt: "${captionVal}", title: "${captionVal}" }`;
      }
    );
    return `${prefix}immagini: [${fixedImages}]`;
  }
);

// ============================================================
// 3. FIX CATALOG_SELECTION title -> titolo
// ============================================================
console.log('📦 Fixing CATALOG_SELECTION field names...');

// Fix singolo title in CATALOG_SELECTION
content = content.replace(
  /(tipo_componente: "CATALOG_SELECTION"[^}]*dati_config: \{[^}]*?)title: "([^"]+)"/g,
  '$1titolo: "$2"'
);

// ============================================================
// 4. FIX page title -> titolo (restaurant prenota, craftsman products)
// ============================================================
console.log('📄 Fixing page titles...');

content = content.replace(
  /(prenota: \{[^}]*?)title: "([^"]+)"/g,
  '$1titolo: "$2"'
);

content = content.replace(
  /(prodotti: \{[^}]*?)title: "([^"]+)"/g,
  '$1titolo: "$2"'
);

content = content.replace(
  /(contatti: \{[^}]*?)title: "([^"]+)"/g,
  '$1titolo: "$2"'
);

// ============================================================
// 5. FIX remaining DYNAMIC_IMAGE_GALLERY title -> titolo
// ============================================================
console.log('🎨 Fixing DYNAMIC_IMAGE_GALLERY titles...');

content = content.replace(
  /(tipo_componente: "DYNAMIC_IMAGE_GALLERY"[^}]*dati_config: \{[^}]*?)title: "([^"]+)"/g,
  '$1titolo: "$2"'
);

// ============================================================
// 6. Aggiungiamo campi mancanti ai blocchi
// ============================================================
console.log('✨ Adding missing configuration fields...');

// Aggiunge layout: "grid" ai DYNAMIC_IMAGE_GALLERY che non ce l'hanno
content = content.replace(
  /(tipo_componente: "DYNAMIC_IMAGE_GALLERY"[^}]*dati_config: \{[^}]*?titolo: "[^"]*"[^}]*?subtitolo: "[^"]*"[^}]*?)layout: "grid"/g,
  '$1columns: 3,\n              layout: "grid"'
);

console.log('\n✅ All fixes applied!');
console.log('📝 Writing enhanced file...\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File updated successfully!');
console.log('\n📋 Summary of changes:');
console.log('  ✓ FLIP_CARD_GALLERY: items → cards, image → immagine, title → titolo');
console.log('  ✓ DYNAMIC_IMAGE_GALLERY: images → immagini, url → src, caption → alt');
console.log('  ✓ CATALOG_SELECTION: title → titolo');
console.log('  ✓ Page titles: title → titolo');
