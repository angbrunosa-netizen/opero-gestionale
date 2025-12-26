const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Final comprehensive fix for ALL block field names...');

// Fix VETRINA blocks - specifically target VETRINA blocks
content = content.replace(/(tipo_componente: "VETRINA"[^}]*dati_config: \{[\s\S]*?)title: "/g, '$1titolo: "');

// Fix GUIDE blocks - specifically target GUIDE blocks
content = content.replace(/(tipo_componente: "GUIDE"[^}]*dati_config: \{[\s\S]*?)title: "/g, '$1titolo: "');

// Fix MEDIA_SOCIAL blocks
content = content.replace(/(tipo_componente: "MEDIA_SOCIAL"[^}]*dati_config: \{[\s\S]*?)title: "/g, '$1titolo: "');

// Fix HERO blocks that still have title
content = content.replace(/(tipo_componente: "HERO"[^}]*dati_config: \{[\s\S]*?)title: "/g, '$1titolo: "');

// Fix HTML blocks (if they have title)
content = content.replace(/(tipo_componente: "HTML"[^}]*dati_config: \{[\s\S]*?)title: "/g, '$1titolo: "');

console.log('✅ All VETRINA, GUIDE, MEDIA_SOCIAL, HERO and HTML block titles fixed!');
console.log('📝 Writing file...');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Complete!');
