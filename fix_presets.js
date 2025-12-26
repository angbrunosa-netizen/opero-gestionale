const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

// Funzione per convertire i config HERO
content = content.replace(/backgroundImage:\s*"([^"]+)"/g, 'immagine_url: "$1"');
content = content.replace(/title:\s*"([^"]+)"/g, 'titolo: "$1"');
content = content.replace(/subtitle:\s*"([^"]+)"/g, 'sottotitolo: "$1"');
content = content.replace(/cta_link:\s*"([^"]+)"/g, 'ctaLink: "$1"');
content = content.replace(/alignment:\s*"([^"]+)"/g, 'allineamento: "$1"');
content = content.replace(/overlay:\s*true,/g, '');
content = content.replace(/overlayOpacity:\s*([\d.]+)/g, 'overlayOpacita: $1');
content = content.replace(/textColor:\s*"([^"]+)"/g, 'titoloColore: "$1"');

// Salva il file aggiornato
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Preset aggiornati con i campi corretti per HeroBlock!');
