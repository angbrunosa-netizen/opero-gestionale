const { dbPool } = require('./config/db');
const fs = require('fs').promises;
const path = require('path');

async function createTestPDFPost() {
  try {
    console.log('🧪 Creazione post di test con PDF locale...');

    // 1. Crea la cartella uploads se non esiste
    const uploadsDir = path.join(__dirname, 'uploads', 'blog', 'pdfs');
    await fs.mkdir(uploadsDir, { recursive: true });

    // 2. Crea un file PDF di test fittizio
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test PDF Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000079 00000 n
0000000173 00000 n
0000000301 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
396
%%EOF`;

    const pdfFileName = `test-pdf-${Date.now()}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFileName);
    await fs.writeFile(pdfPath, pdfContent);
    console.log('✅ PDF di test creato:', pdfPath);

    // 3. Inserisci il post nel database
    const pdfUrl = `/uploads/blog/pdfs/${pdfFileName}`;

    const [result] = await dbPool.query(
      `INSERT INTO web_blog_posts
       (id_ditta, titolo, slug, contenuto, descrizione_breve,
        pdf_url, pdf_filename, pubblicato, autore, data_pubblicazione)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // ID ditta di test
        'Articolo Test con PDF',
        'articolo-test-con-pdf',
        '<p>Questo è un articolo di test con un PDF allegato.</p>',
        'Descrizione di test con PDF',
        pdfUrl,
        pdfFileName,
        1, // pubblicato
        'Test User',
        new Date()
      ]
    );

    console.log('✅ Post inserito nel database con ID:', result.insertId);
    console.log('📄 URL PDF:', pdfUrl);

    // 4. Test accesso al PDF
    const testPath = path.join(__dirname, pdfUrl);
    console.log('🔍 Test percorso file:', testPath);

    await dbPool.end();
    console.log('🎉 Test completato con successo!');
    console.log('🌐 Ora puoi testare l\'accesso al PDF su: http://localhost:3001' + pdfUrl);

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
}

createTestPDFPost();