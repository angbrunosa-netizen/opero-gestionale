const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing all field names...');

// 1. Fix HERO blocks - title/subtitle -> titolo/sottotitolo
content = content.replace(/title: "([^"]+)"(\s*\n\s*subtit?:)/g, 'titolo: "$1"$2');
content = content.replace(/subtit(?:le|olo): "([^"]+)"/g, 'sottotitolo: "$1"');

// 2. Fix all remaining standalone title/subtitle in HERO
content = content.replace(/(\s+)title: "([^"]+)"(\s*\n\s+backgroundColor:)/g, '$1titolo: "$2"$3');

// 3. Fix VETRINA blocks - title/subtitle -> titolo/subtitolo
content = content.replace(/title: "([^"]+)"(\s*,\s*layout:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,)/g, 'subtitolo: "$1"$2');

// 4. Fix GUIDE blocks - title/subtitle -> titolo/subtitolo
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*tabs:)/g, 'subtitolo: "$1"$2');

// 5. Fix FLIP_CARD_GALLERY blocks - title/subtitle -> titolo/subtitolo
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*items:)/g, 'subtitolo: "$1"$2');

// 6. Fix DYNAMIC_IMAGE_GALLERY blocks - title/subtitle -> titolo/subtitolo
content = content.replace(/(\s+)title: "([^"]+)"(\s*\n\s+subtit?:)/g, '$1titolo: "$2"$3');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*layout:)/g, 'subtitolo: "$1"$2');

// 7. Fix cta_link -> ctaLink
content = content.replace(/cta_link: /g, 'ctaLink: ');

// 8. Fix backgroundImage -> immagine_url
content = content.replace(/backgroundImage: "([^"]+)"/g, 'immagine_url: "$1"');

// 9. Fix textColor -> titoloColore
content = content.replace(/textColor: "([^"]+)"/g, 'titoloColore: "$1"');

// 10. Fix overlay: true, removal
content = content.replace(/overlay: true,\s*/g, '');

// 11. Fix overlayOpacity -> overlayOpacita
content = content.replace(/overlayOpacity: ([\d.]+),/g, 'overlayOpacita: $1');

// 12. Fix alignment -> allineamento
content = content.replace(/alignment: "([^"]+)"/g, 'allineamento: "$1"');

console.log('✅ Field names fixed!');
console.log('📝 Writing enhanced file...');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All fields fixed successfully!');
