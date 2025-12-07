/**
 * Test API aggiornamento sito web
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

async function testUpdate() {
  console.log('🚀 Test aggiornamento sito web\n');

  try {
    // 1. Ottieni lista siti
    console.log('📋 1. Recupero siti disponibili');
    const listResponse = await makeRequest(`${baseURL}/list`);

    if (listResponse.status !== 200 || !listResponse.data.success) {
      throw new Error('Impossibile recuperare siti');
    }

    const sites = listResponse.data.sites;
    if (sites.length === 0) {
      throw new Error('Nessun sito disponibile per il test');
    }

    const testSite = sites[0];
    console.log(`✅ Sito selezionato: ${testSite.site_title} (ID: ${testSite.id})`);

    // 2. Test aggiornamento section 'basic'
    console.log('\n✏️ 2. Test aggiornamento section "basic"');

    const updateData = {
      section: 'basic',
      data: {
        site_title: `${testSite.site_title} - Modificato`,
        site_description: 'Descrizione aggiornata dal test',
        template_id: 2,
        domain_status: 'active',
        logo_url: 'https://example.com/logo.png',
        favicon_url: 'https://example.com/favicon.ico'
      }
    };

    console.log('Dati inviati:', JSON.stringify(updateData, null, 2));

    const updateResponse = await makeRequest(`${baseURL}/${testSite.id}`, {
      method: 'PUT',
      body: updateData
    });

    console.log('Status:', updateResponse.status);
    console.log('Response:', updateResponse.data);

    if (updateResponse.status === 200 && updateResponse.data.success) {
      console.log('✅ Aggiornamento riuscito!');

      // 3. Verifica aggiornamento
      console.log('\n🔍 3. Verifica aggiornamento');

      // Ricarica lista siti per vedere le modifiche
      const verifyResponse = await makeRequest(`${baseURL}/list`);

      if (verifyResponse.status === 200) {
        const updatedSites = verifyResponse.data.sites;
        const updatedSite = updatedSites.find(s => s.id === testSite.id);

        if (updatedSite) {
          console.log('✅ Sito aggiornato nel database:');
          console.log(`   - Titolo: ${updatedSite.site_title}`);
          console.log(`   - Template ID: ${updatedSite.template_id}`);
          console.log(`   - Stato: ${updatedSite.domain_status}`);
          console.log(`   - Descrizione: ${updatedSite.site_description}`);
        } else {
          console.log('❌ Sito non trovato dopo aggiornamento');
        }
      }

    } else {
      console.log('❌ Aggiornamento fallito');
    }

  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }

  console.log('\n🏁 Test completato!');
}

// Esegui il test
testUpdate();