const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing ALL remaining field names...');

// Fix VETRINA blocks - title -> titolo
content = content.replace(/title: "([^"]+)"(\s*\n\s+subtit(?:olo|itle):)/g, 'titolo: "$1"$2');
content = content.replace(/title: "([^"]+)"(\s*,\s*layout:)/g, 'titolo: "$1"$2');
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');

// Fix GUIDE blocks - title -> titolo
content = content.replace(/(\s+)title: "([^"]+)"(\s*\n\s+subtitle:)/g, '$1titolo: "$2"$3');

// Fix CATALOG_SELECTION blocks - title -> titolo
content = content.replace(/title: "([^"]+)"(\s*\n\s+subtitolo:)/g, 'titolo: "$1"$2');

// Fix FLIP_CARD_GALLERY - title -> titolo
content = content.replace(/title: "([^"]+)"(\s*,\s*subtit(?:olo|itle):)/g, 'titolo: "$1"$2');

// Fix DYNAMIC_IMAGE_GALLERY - title -> titolo
content = content.replace(/title: "([^"]+)"(\s*\n\s+subtit(?:olo|itle):)/g, 'titolo: "$1"$2');

// Fix MEDIA_SOCIAL blocks - title -> titolo
content = content.replace(/(\s+)title: "([^"]+)"(\s*\n\s+sottotitolo:)/g, '$1titolo: "$2"$3');

// Fix HERO blocks with remaining title fields
content = content.replace(/title: "([^"]+)"(\s*\n\s+sottotitolo:)/g, 'titolo: "$1"$2');
content = content.replace(/title: "([^"]+)"(\s*,\s*backgroundColor:)/g, 'titolo: "$1"$2');

console.log('✅ All field names fixed!');
console.log('📝 Writing file...');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Complete! All VETRINA, GUIDE, CATALOG, FLIP_CARD_GALLERY, DYNAMIC_IMAGE_GALLERY, MEDIA_SOCIAL and HERO blocks now use correct field names.');
