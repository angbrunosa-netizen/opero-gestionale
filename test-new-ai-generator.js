/**
 * Test del Nuovo AI Content Generator
 * Verifica che la nuova API generi contenuti reali e di qualità
 */

const axios = require('axios');

async function testNewAIGenerator() {
  console.log('🧪 Test del Nuovo AI Content Generator...\n');

  // Configurazione base per il test
  const testPayload = {
    companyId: 16,
    templateId: 'business-landing',
    websiteName: 'Test Sito Professionale',
    businessDescription: 'Azienda specializzata in soluzioni digitali innovative',
    targetAudience: 'Clienti aziendali',
    industry: 'Tecnologia e Digital'
  };

  try {
    console.log('📡 Chiamata API: POST /api/ai-content-generator/generate-complete-website');
    console.log('📋 Dati inviati:', JSON.stringify(testPayload, null, 2));

    const response = await axios.post('http://localhost:3001/api/ai-content-generator/generate-complete-website', testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token-for-testing' // Dobbiamo usare un token valido
      }
    });

    console.log('\n✅ API Response Status:', response.status);
    console.log('📊 Response Data:');

    // Analisi della risposta
    const { success, pages, globalStyles, summary } = response.data;

    if (success) {
      console.log('🎉 SUCCESSO! Sito generato correttamente\n');

      console.log('📄 Pagine generate:');
      pages.forEach((page, index) => {
        console.log(`  ${index + 1}. ${page.title} (slug: ${page.slug})`);
        console.log(`     Sezioni: ${page.sections.length}`);
        console.log(`     Meta: ${page.meta.title}`);

        // Mostra dettagli delle prime 2 sezioni
        page.sections.slice(0, 2).forEach((section, sIndex) => {
          console.log(`       Sez ${sIndex + 1}: ${section.type}`);
          console.log(`         Title: ${section.title || 'N/D'}`);
          console.log(`         Content length: ${(section.content || '').length} chars`);
        });

        if (page.sections.length > 2) {
          console.log(`       ... e altre ${page.sections.length - 2} sezioni`);
        }
        console.log('');
      });

      console.log('🎨 Stili Globali:');
      console.log(`  Primary Color: ${globalStyles.colors.primary}`);
      console.log(`  Font Family: ${globalStyles.typography.fontFamily}`);
      console.log(`  Max Width: ${globalStyles.layout.maxWidth}`);

      console.log('\n📈 Summary:');
      console.log(`  Total Pages: ${summary.totalPages}`);
      console.log(`  Total Sections: ${summary.totalSections}`);
      console.log(`  Template: ${summary.template}`);

      // Verifica qualità dei contenuti
      console.log('\n🔍 Analisi Qualità Contenuti:');
      let totalContentLength = 0;
      let sectionsWithTitles = 0;

      pages.forEach(page => {
        page.sections.forEach(section => {
          totalContentLength += (section.content || '').length;
          if (section.title && section.title !== 'N/D') {
            sectionsWithTitles++;
          }
        });
      });

      console.log(`  Content Length: ${totalContentLength} caratteri totali`);
      console.log(`  Sections with Titles: ${sectionsWithTitles}/${summary.totalSections}`);
      console.log(`  Avg Content per Section: ${Math.round(totalContentLength / summary.totalSections)} chars`);

      // Valutazione finale
      if (totalContentLength > 1000 && sectionsWithTitles > summary.totalSections * 0.7) {
        console.log('\n🏆 VALUTAZIONE: OTTIMO! Contenuti reali e di qualità generati');
      } else if (totalContentLength > 500) {
        console.log('\n👍 VALUTAZIONE: BUONO! Contenuti presenti ma possono essere migliorati');
      } else {
        console.log('\n⚠️  VALUTAZIONE: DA MIGLIORARE! Contenuti insufficienti');
      }

    } else {
      console.log('❌ ERRORE: La risposta indica fallimento');
      console.log('Error details:', response.data);
    }

  } catch (error) {
    console.error('❌ ERRORE API:', error.message);

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('Nessuna risposta ricevuta dal server');
    }
  }
}

// Test di singola sezione
async function testSectionEnhancement() {
  console.log('\n\n🔧 Test Enhancement Singola Sezione...');

  const sectionPayload = {
    sectionType: 'hero',
    currentContent: {
      title: 'Vecchio Titolo',
      content: '<p>Contenuto di base</p>'
    },
    companyInfo: {
      ragione_sociale: 'Azienda Test',
      settore: 'Tecnologia'
    },
    enhancement: 'Rendi il titolo più accattivante e professionale'
  };

  try {
    const response = await axios.post('http://localhost:3001/api/ai-content-generator/enhance-section', sectionPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token-for-testing'
      }
    });

    console.log('✅ Enhancement Response:');
    const { success, enhancedContent } = response.data;

    if (success) {
      console.log(`  Nuovo Title: ${enhancedContent.title}`);
      console.log(`  Content Length: ${(enhancedContent.content || '').length} chars`);
      console.log('✅ Enhancement funzionante!');
    } else {
      console.log('❌ Enhancement fallito');
    }

  } catch (error) {
    console.log('⚠️ Enhancement test fallito (probabilmente per autenticazione)');
  }
}

// Esegui i test
async function runAllTests() {
  console.log('🚀 INIZIO TEST NUOVO AI CONTENT GENERATOR\n');

  await testNewAIGenerator();
  await testSectionEnhancement();

  console.log('\n\n📋 TEST COMPLETATI');
  console.log('Nota: Per test completi, assicurarsi di avere un token di autenticazione valido');
}

// Esegui i test se questo file è eseguito direttamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testNewAIGenerator,
  testSectionEnhancement,
  runAllTests
};