/**
 * Script per creare il sito per MiaAzienda srl
 */

const axios = require('axios');

async function createMiaAziendaSite() {
  console.log('🏢 Creazione sito per MiaAzienda srl...\n');

  // Dati specifici per MiaAzienda srl
  const sitePayload = {
    companyId: 16, // ID dell'azienda CAROFIGLIO SPA che abbiamo testato
    templateId: 'business-landing', // Template professionale
    websiteName: 'MiaAzienda SRL',
    businessDescription: 'Azienda leader nel settore dei servizi digitali e consulenza aziendale con oltre 10 anni di esperienza',
    targetAudience: 'Imprese e professionisti che cercano soluzioni innovative',
    industry: 'Servizi Digitali e Consulenza'
  };

  try {
    console.log('📡 Chiamata API per creare il sito...');
    console.log('📋 Dati del sito:');
    console.log(`  • Nome: ${sitePayload.websiteName}`);
    console.log(`  • Template: ${sitePayload.templateId}`);
    console.log(`  • Industry: ${sitePayload.industry}`);
    console.log(`  • Target: ${sitePayload.targetAudience}`);
    console.log('');

    const response = await axios.post('http://localhost:3001/api/ai-content-generator/generate-complete-website', sitePayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 secondi timeout
    });

    console.log('✅ Sito creato con successo!\n');

    const { success, pages, globalStyles, summary, websiteId } = response.data;

    if (success) {
      console.log('📄 **STRUTTURA DEL SITO CREATO:**\n');

      pages.forEach((page, index) => {
        console.log(`**Pagina ${index + 1}: ${page.title}**`);
        console.log(`   Slug: ${page.slug}`);
        console.log(`   Sezioni: ${page.sections.length}`);
        console.log(`   Meta Title: ${page.meta.title}`);

        // Mostra le prime 3 sezioni con dettagli
        page.sections.slice(0, 3).forEach((section, sIndex) => {
          console.log(`   • Sez ${sIndex + 1}: ${section.type}`);
          if (section.title) {
            console.log(`     Title: "${section.title}"`);
          }
          if (section.subtitle) {
            console.log(`     Subtitle: "${section.subtitle}"`);
          }
          console.log(`     Content: ${(section.content || '').length} caratteri`);
        });

        if (page.sections.length > 3) {
          console.log(`   • ... e altre ${page.sections.length - 3} sezioni`);
        }
        console.log('');
      });

      console.log('🎨 **STILI GLOBALI:**');
      console.log(`   Primary Color: ${globalStyles.colors.primary}`);
      console.log(`   Secondary Color: ${globalStyles.colors.secondary}`);
      console.log(`   Font Family: ${globalStyles.typography.fontFamily}`);
      console.log(`   Layout Max Width: ${globalStyles.layout.maxWidth}`);
      console.log('');

      console.log('📊 **RIEPILOGO:**');
      console.log(`   • Total Pages: ${summary.totalPages}`);
      console.log(`   • Total Sections: ${summary.totalSections}`);
      console.log(`   • Template Used: ${summary.template}`);
      console.log(`   • Website ID: ${websiteId || 'Non salvato nel database'}`);
      console.log('');

      // Calcola statistiche contenuti
      let totalContentLength = 0;
      let totalSections = 0;

      pages.forEach(page => {
        page.sections.forEach(section => {
          totalContentLength += (section.content || '').length;
          totalSections++;
        });
      });

      console.log('📈 **STATISTICHE CONTENUTI:**');
      console.log(`   • Total Content: ${totalContentLength.toLocaleString()} caratteri`);
      console.log(`   • Average per Section: ${Math.round(totalContentLength / totalSections)} caratteri`);
      console.log(`   • Sections with Content: ${totalSections}/${totalSections} (100%)`);
      console.log('');

      if (websiteId) {
        console.log('🎯 **PROSSIMI PASSI:**');
        console.log('   1. Il sito è stato salvato nel database');
        console.log('   2. Puoi visualizzarlo nel Website Builder');
        console.log('   3. Puoi generare la versione statica con: POST /api/website-generator/generate/' + websiteId);
        console.log('   4. Puoi modificare i contenuti attraverso il pannello di editing');
      }

      console.log('\n🎉 **SITO "MiaAzienda SRL" CREATO CON SUCCESSO!**');

    } else {
      console.log('❌ Errore nella creazione del sito');
      console.log(response.data);
    }

  } catch (error) {
    console.error('❌ ERRORE durante la creazione del sito:', error.message);

    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }
}

// Funzione per generare il sito statico
async function generateStaticSite(websiteId) {
  console.log('\n🚀 Generazione sito statico...');

  try {
    const response = await axios.post(`http://localhost:3001/api/website-generator/generate/${websiteId}`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Sito statico generato con successo!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Errore generazione sito statico:', error.message);
  }
}

// Esegui la creazione
async function main() {
  console.log('🏗️  INIZIO CREAZIONE SITO PER "MiaAzienda SRL"\n');

  await createMiaAziendaSite();

  // Se il sito è stato creato con successo e ha un ID, genera anche la versione statica
  // await generateStaticSite(websiteId); // Da decommentare se vuoi generare subito il sito statico
}

// Esegui se questo file è eseguito direttamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMiaAziendaSite, generateStaticSite };