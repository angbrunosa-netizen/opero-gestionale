/**
 * Test rapido API sulla porta 3000
 */

const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/website/list',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('✅ API Risponde correttamente!');
        console.log('Status:', res.statusCode);
        console.log('Siti trovati:', json.sites?.length || 0);
        if (json.sites && json.sites.length > 0) {
          console.log('Primo sito:', json.sites[0].site_title);
        }
      } catch (error) {
        console.log('❌ Errore parsing JSON:', error.message);
        console.log('Risposta grezza:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Errore connessione:', error.message);
  });

  req.end();
}

console.log('🧪 Test rapido API Website Builder...');
testAPI();