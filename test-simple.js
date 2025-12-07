/**
 * Test Semplice API Website Builder
 * Verifica base delle API
 */

const https = require('https');
const http = require('http');

const baseURL = 'http://localhost:3002/api/website';

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

async function simpleTest() {
  console.log('🚀 Test Semplice API Website Builder\n');

  try {
    // Test 1: GET lista siti
    console.log('📋 Test GET /api/website/list');
    const listResponse = await makeRequest(`${baseURL}/list`);
    console.log('Status:', listResponse.status);
    console.log('Response:', listResponse.data);

    if (listResponse.status === 200 && listResponse.data.success) {
      const sites = listResponse.data.sites;
      console.log(`✅ Trovati ${sites.length} siti`);

      if (sites.length > 0) {
        const firstSite = sites[0];
        console.log(`📝 Test con sito: ${firstSite.site_title} (ID: ${firstSite.id})`);

        // Test 2: GET pagine del primo sito
        console.log(`\n📄 Test GET /api/website/${firstSite.id}/pages`);
        const pagesResponse = await makeRequest(`${baseURL}/${firstSite.id}/pages`);
        console.log('Status:', pagesResponse.status);
        console.log('Response:', pagesResponse.data);

        if (pagesResponse.status === 200 && pagesResponse.data.success) {
          const pages = pagesResponse.data.pages;
          console.log(`✅ Trovate ${pages.length} pagine per il sito`);

          // Test 3: POST crea nuova pagina
          console.log(`\n➕ Test POST creazione pagina`);
          const newPageData = {
            slug: `test-page-${Date.now()}`,
            titolo: 'Pagina di Test',
            contenuto_html: '<h1>Pagina di Test</h1><p>Contenuto di prova...</p>',
            meta_title: 'Pagina di Test',
            meta_description: 'Descrizione pagina di test',
            is_published: false,
            menu_order: 999
          };

          const createResponse = await makeRequest(`${baseURL}/${firstSite.id}/pages`, {
            method: 'POST',
            body: newPageData
          });

          console.log('Status:', createResponse.status);
          console.log('Response:', createResponse.data);

          if (createResponse.status === 200 && createResponse.data.success) {
            console.log('✅ Pagina creata con successo!');

            // Test 4: GET pagine dopo creazione
            console.log(`\n📄 Verifica pagine dopo creazione`);
            const pagesAfterResponse = await makeRequest(`${baseURL}/${firstSite.id}/pages`);
            console.log('Status:', pagesAfterResponse.status);
            console.log('Numero pagine:', pagesAfterResponse.data.pages?.length);

            if (pagesAfterResponse.data.pages) {
              const lastPage = pagesAfterResponse.data.pages[pagesAfterResponse.data.pages.length - 1];
              console.log('Ultima pagina:', lastPage.titolo);

              // Test 5: DELETE pagina creata
              console.log(`\n🗑️ Test DELETE pagina`);
              const deleteResponse = await makeRequest(`${baseURL}/${firstSite.id}/pages/${createResponse.data.id}`, {
                method: 'DELETE'
              });

              console.log('Status:', deleteResponse.status);
              console.log('Response:', deleteResponse.data);

              if (deleteResponse.status === 200 && deleteResponse.data.success) {
                console.log('✅ Pagina eliminata con successo!');
              } else {
                console.log('❌ Errore eliminazione pagina');
              }
            }
          } else {
            console.log('❌ Errore creazione pagina');
          }
        } else {
          console.log('❌ Errore recupero pagine');
        }
      }
    } else {
      console.log('❌ Errore recupero siti');
    }

  } catch (error) {
    console.error('❌ Errore test:', error.message);
  }

  console.log('\n🏁 Test completato!');
}

// Esegui il test
simpleTest();