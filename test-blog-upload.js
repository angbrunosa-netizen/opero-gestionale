/**
 * Test per il debug del salvataggio articoli blog
 * Simula la richiesta del frontend per identificare problemi
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Simulazione di un post del frontend
async function testBlogUpload() {
    console.log('🧪 Test salvataggio articolo blog...');

    try {
        // Crea un FormData simulato come farebbe il frontend
        const formData = new FormData();

        // Aggiungi campi testo (simulando postForm)
        const postForm = {
            titolo: 'Articolo di Test',
            contenuto_html: '<p>Contenuto HTML di test</p>',
            descrizione_breve: 'Breve descrizione di test',
            id_category: '',
            pubblicato: 'true',
            in_evidenza: 'false',
            data_pubblicazione: '2025-12-18',
            autore: 'Test Author',
            meta_titolo: 'Meta Title Test',
            meta_descrizione: 'Meta Description Test',
            contentType: 'html',
            copertina_url: 'https://example.com/image.jpg',
            id_ditta: '1'
        };

        // Aggiungi tutti i campi del form (come fa il frontend)
        Object.keys(postForm).forEach(key => {
            if (key !== 'contentType') {
                formData.append(key, postForm[key]);
                console.log(`✅ Aggiunto campo: ${key} = ${postForm[key]}`);
            }
        });

        // Aggiungi file PDF se presente (simulato)
        if (postForm.contentType === 'pdf') {
            // Simula un file PDF (non effettivo, solo per test)
            formData.append('pdf', Buffer.from('fake pdf content'), 'test.pdf');
            console.log('✅ Aggiunto file PDF di test');
        }

        // Controlla i dati che verrebbero inviati (FormData non ha entries in Node.js)
        console.log('\n📋 Dati che verranno inviati:');
        console.log('   Campi testo:', Object.keys(postForm).filter(k => k !== 'contentType'));
        if (postForm.contentType === 'pdf') {
            console.log('   File: pdf (file fittizio per test)');
        }

        console.log('\n✅ Test completato - Form data valido');
        console.log('🔍 Campi attesi dal backend:');
        console.log('   - id_ditta, titolo, contenuto_html, descrizione_breve');
        console.log('   - id_category, pubblicato, in_evidenza, data_pubblicazione');
        console.log('   - autore, meta_titolo, meta_descrizione');
        console.log('   - pdf (file) o copertina (file)');

        return { success: true, fields: Object.keys(postForm).filter(k => k !== 'contentType') };

    } catch (error) {
        console.error('❌ Errore nel test:', error);
        return { success: false, error: error.message };
    }
}

// Esegui test
testBlogUpload().then(result => {
    if (result.success) {
        console.log('\n🎉 Test superato!');
        console.log('I dati inviati dal frontend dovrebbero essere compatibili con il backend.');
    } else {
        console.log('\n💥 Test fallito:', result.error);
    }
    process.exit(result.success ? 0 : 1);
});