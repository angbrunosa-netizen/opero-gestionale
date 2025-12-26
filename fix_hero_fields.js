const fs = require('fs');

let content = fs.readFileSync('./routes/utils/starterSitePresets.js', 'utf8');

// Fix all HERO blocks - vecchi campi -> nuovi campi
content = content.replace(/title: "([^"]+)"(\s*\n\s*subtit?:)/g, 'titolo: "$1"$1');
content = content.replace(/subtitle: "([^"]+)"/g, 'sottotitolo: "$1"');
content = content.replace(/cta_link: /g, 'ctaLink: ');
content = content.replace(/backgroundImage: "([^"]+)"/g, 'immagine_url: "$1"');
content = content.replace(/textColor: "([^"]+)"/g, 'titoloColore: "$1"');
content = content.replace(/overlay: true,\s*/g, '');
content = content.replace(/overlayOpacity: ([\d.]+),/g, 'overlayOpacita: $1');
content = content.replace(/alignment: "([^"]+)"/g, 'allineamento: "$1"');

// Fix FLIP_CARD_GALLERY - aggiunge campi mancanti per il flip
content = content.replace(/title: "([^"]+)"(\s*\n\s*role:)/g, 'titolo: "$1"$1');
content = content.replace(/subtitle: "([^"]+)"/g, 'subtitolo: "$1"');

fs.writeFileSync('./routes/utils/starterSitePresets.js', content, 'utf8');
console.log('✅ All HERO and gallery fields fixed!');
