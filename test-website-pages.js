/**
 * Test API Website Builder - Gestione Pagine
 * Script per verificare il funzionamento delle API delle pagine
 */

const https = require('https');
const http = require('http');

const baseURL = 'http://localhost:3002/api/website';

// Helper per fare richieste HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = lib.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Dati di test
const testWebsiteId = 1; // Sostituire con ID reale
const testPageData = {
  slug: 'chi-siamo-test',
  titolo: 'Chi Siamo - Test',
  contenuto_html: '<h1>Chi Siamo</h1><p>Siamo un\'azienda test...</p>',
  meta_title: 'Chi Siamo - La Nostra Azienda',
  meta_description: 'Scopri chi siamo e cosa facciamo',
  is_published: true,
  menu_order: 1
};

async function testAPI() {
  console.log('🚀 Inizio test API Website Builder - Pagine\n');

  try {
    // 1. Test GET lista pagine
    console.log('📋 1. Test GET /api/website/:id/pages');
    const getResponse = await makeRequest(`${baseURL}/${testWebsiteId}/pages`);
    console.log('Status:', getResponse.status);
    console.log('Response:', getResponse.data);
    console.log('✅ GET pages test completato\n');

    // 2. Test POST creazione pagina
    console.log('➕ 2. Test POST /api/website/:id/pages');
    console.log('Dati inviati:', testPageData);

    const postResponse = await makeRequest(`${baseURL}/${testWebsiteId}/pages`, {
      method: 'POST',
      body: testPageData
    });

    console.log('Status:', postResponse.status);
    console.log('Response:', postResponse.data);

    if (postData.success) {
      const newPageId = postData.id;
      console.log('✅ Pagina creata con ID:', newPageId);

      // 3. Test GET lista pagine dopo creazione
      console.log('\n📋 3. Test GET dopo creazione');
      const getAfterResponse = await fetch(`${baseURL}/${testWebsiteId}/pages`);
      const getAfterData = await getAfterResponse.json();
      console.log('Pagine trovate:', getAfterData.pages?.length);
      console.log('Ultima pagina:', getAfterData.pages?.[getAfterData.pages.length - 1]);

      // 4. Test PUT aggiornamento pagina
      console.log('\n✏️ 4. Test PUT aggiornamento pagina');
      const updateData = {
        ...testPageData,
        titolo: 'Chi Siamo - Aggiornato',
        contenuto_html: '<h1>Chi Siamo</h1><p>Contenuto aggiornato...</p>',
        is_published: false
      };

      const putResponse = await fetch(`${baseURL}/${testWebsiteId}/pages/${newPageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const putData = await putResponse.json();
      console.log('Status:', putResponse.status);
      console.log('Response:', putData);

      // 5. Test POST toggle pubblicazione
      console.log('\n🔄 5. Test POST toggle pubblicazione');
      const toggleResponse = await fetch(`${baseURL}/${testWebsiteId}/pages/${newPageId}/publish`, {
        method: 'POST'
      });

      const toggleData = await toggleResponse.json();
      console.log('Status:', toggleResponse.status);
      console.log('Response:', toggleData);

      // 6. Test DELETE pagina
      console.log('\n🗑️ 6. Test DELETE eliminazione pagina');
      const deleteResponse = await fetch(`${baseURL}/${testWebsiteId}/pages/${newPageId}`, {
        method: 'DELETE'
      });

      const deleteData = await deleteResponse.json();
      console.log('Status:', deleteResponse.status);
      console.log('Response:', deleteData);

      // 7. Verifica finale
      console.log('\n📋 7. Verifica finale - GET pagine');
      const finalResponse = await fetch(`${baseURL}/${testWebsiteId}/pages`);
      const finalData = await finalResponse.json();
      console.log('Pagine finali:', finalData.pages?.length);

    } else {
      console.log('❌ Errore creazione pagina:', postData.error);
    }

  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }

  console.log('\n🏁 Test completato!');
}

// Funzione per testare con siti reali
async function findWebsiteId() {
  console.log('🔍 Ricerca siti web esistenti...\n');

  try {
    const response = await fetch(`${baseURL}/list`);
    const data = await response.json();

    if (data.success && data.sites.length > 0) {
      console.log('Siti trovati:');
      data.sites.forEach((site, index) => {
        console.log(`${index + 1}. ID: ${site.id}, Titolo: ${site.site_title}, Subdomain: ${site.subdomain}`);
      });
      return data.sites[0].id; // Ritorna ID del primo sito
    } else {
      console.log('Nessun sito trovato. Creane uno prima di testare le pagine.');
      return null;
    }
  } catch (error) {
    console.error('Errore ricerca siti:', error.message);
    return null;
  }
}

// Main
async function main() {
  // Trova un sito reale da testare
  const realWebsiteId = await findWebsiteId();

  if (realWebsiteId) {
    // Aggiorna il testWebsiteId con l'ID reale
    console.log(`\n🎯 Utilizzo sito ID: ${realWebsiteId} per i test\n`);

    // Testa le API
    await testAPI(realWebsiteId);
  } else {
    console.log('\n❌ Impossibile procedere con i test: nessun sito disponibile');
    console.log('Crea prima un sito web utilizzando il frontend.');
  }
}

// Esegui il test
main();