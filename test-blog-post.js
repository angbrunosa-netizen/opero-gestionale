const FormData = require('form-data');
const axios = require('axios');

async function testBlogPost() {
  try {
    console.log('🧪 Test POST /api/admin/blog/posts...');

    // Simula FormData come farebbe il frontend
    const formData = new FormData();

    // Aggiungi campi testo
    formData.append('id_ditta', '1');
    formData.append('titolo', 'Test Post ' + new Date().toISOString());
    formData.append('contenuto_html', '<p>Contenuto di test</p>');
    formData.append('descrizione_breve', 'Descrizione test');
    formData.append('pubblicato', 'true');
    formData.append('autore', 'Test User');

    // Aggiungi un file PDF fittizio (senza dati reali)
    formData.append('pdf', Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n'), 'test.pdf');

    console.log('📤 Invio richiesta...');

    // Prima testiamo l'endpoint senza autenticazione
    const response = await axios.post('http://localhost:3001/api/admin/blog/test-upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      },
      timeout: 10000
    });

    console.log('✅ Successo:', response.data);

  } catch (error) {
    console.error('❌ Errore:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
  }
}

testBlogPost();