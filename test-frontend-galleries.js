/**
 * @file test-frontend-galleries.js
 * @description Test per verificare che i componenti frontend delle gallerie siano accessibili
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test Componenti Frontend Gallerie\n');

try {
  // 1. Verifica esistenza TemplateCustomizer
  const templateCustomizerPath = path.join(__dirname, 'opero-frontend/src/components/website/TemplateCustomizer.js');
  if (fs.existsSync(templateCustomizerPath)) {
    console.log('✅ TemplateCustomizer.js - ESISTE');

    const content = fs.readFileSync(templateCustomizerPath, 'utf8');

    // Verifica sezione galleries
    if (content.includes("name: 'Gallerie Fotografiche'")) {
      console.log('✅ Sezione "Gallerie Fotografiche" - TROVATA');
    } else {
      console.log('❌ Sezione "Gallerie Fotografiche" - MANCANTE');
    }

    // Verifica case 'galleries'
    if (content.includes("case 'galleries':")) {
      console.log('✅ Render case galleries - PRESENTE');
    } else {
      console.log('❌ Render case galleries - MANCANTE');
    }

    // Verifica import GalleryAdvancedCustomizer
    if (content.includes("import GalleryAdvancedCustomizer")) {
      console.log('✅ Import GalleryAdvancedCustomizer - PRESENTE');
    } else {
      console.log('❌ Import GalleryAdvancedCustomizer - MANCANTE');
    }

  } else {
    console.log('❌ TemplateCustomizer.js - MANCANTE');
  }

  // 2. Verifica GalleryAdvancedCustomizer
  const galleryAdvancedPath = path.join(__dirname, 'opero-frontend/src/components/website/GalleryAdvancedCustomizer.js');
  if (fs.existsSync(galleryAdvancedPath)) {
    console.log('✅ GalleryAdvancedCustomizer.js - ESISTE');
  } else {
    console.log('❌ GalleryAdvancedCustomizer.js - MANCANTE');
  }

  // 3. Verifica WebsiteBuilder integrazione
  const websiteBuilderPath = path.join(__dirname, 'opero-frontend/src/components/WebsiteBuilder.js');
  if (fs.existsSync(websiteBuilderPath)) {
    const wbContent = fs.readFileSync(websiteBuilderPath, 'utf8');

    if (wbContent.includes("import TemplateCustomizer")) {
      console.log('✅ Import TemplateCustomizer in WebsiteBuilder - PRESENTE');
    } else {
      console.log('❌ Import TemplateCustomizer in WebsiteBuilder - MANCANTE');
    }

    if (wbContent.includes("{ id: 'template', name: 'Aspetto'")) {
      console.log('✅ Tab "Aspetto" in WebsiteBuilder - PRESENTE');
    } else {
      console.log('❌ Tab "Aspetto" in WebsiteBuilder - MANCANTE');
    }

    if (wbContent.includes("activeTab === 'template'")) {
      console.log('✅ Render condizionale TemplateCustomizer - PRESENTE');
    } else {
      console.log('❌ Render condizionale TemplateCustomizer - MANCANTE');
    }
  }

  // 4. Verifica service
  const servicePath = path.join(__dirname, 'opero-frontend/src/services/websiteGalleryService.js');
  if (fs.existsSync(servicePath)) {
    console.log('✅ websiteGalleryService.js - ESISTE');
  } else {
    console.log('❌ websiteGalleryService.js - MANCANTE');
  }

  // 5. Verifica altri componenti gallerie
  const galleryComponents = [
    'ImageGalleryManager.js',
    'GalleryBlock.js',
    'PublicGallery.js'
  ];

  galleryComponents.forEach(comp => {
    const compPath = path.join(__dirname, `opero-frontend/src/components/website/${comp}`);
    if (fs.existsSync(compPath)) {
      console.log(`✅ ${comp} - ESISTE`);
    } else {
      console.log(`❌ ${comp} - MANCANTE`);
    }
  });

  console.log('\n📋 ISTRUZIONI PER VISUALIZZARE LE GALLERIE:');
  console.log('1. Apri il browser su http://localhost:3000');
  console.log('2. Accedi al Website Builder');
  console.log('3. Clicca sul tab "ASPETTO" (icona pennello 🎨)');
  console.log('4. Nella sidebar a sinistra, clicca su "Gallerie Fotografiche" (icona 📷)');
  console.log('5. Potrai vedere tutte le opzioni di personalizzazione gallerie');

} catch (error) {
  console.error('❌ Errore durante il test:', error.message);
}