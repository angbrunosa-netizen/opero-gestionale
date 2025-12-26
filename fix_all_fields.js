const fs = require('fs');

let content = fs.readFileSync('./routes/utils/starterSitePresets.js', 'utf8');

// Fix VETRINA blocks - change title/subtitle to titolo/subtitolo
content = content.replace(/title: "([^"]+)"(\s*,\s*layout:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,)/g, 'subtitolo: "$1"$2');

// Fix GUIDE blocks
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*tabs:)/g, 'subtitolo: "$1"$2');

// Fix DYNAMIC_IMAGE_GALLERY blocks
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*layout:)/g, 'subtitolo: "$1"$2');

// Fix FLIP_CARD_GALLERY blocks
content = content.replace(/title: "([^"]+)"(\s*,\s*subtitle:)/g, 'titolo: "$1"$2');
content = content.replace(/subtitle: "([^"]+)"(\s*,\s*items:)/g, 'subtitolo: "$1"$2');

fs.writeFileSync('./routes/utils/starterSitePresets.js', content, 'utf8');
console.log('✅ All block fields fixed!');
