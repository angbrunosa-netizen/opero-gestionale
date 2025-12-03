#!/usr/bin/env node

// #####################################################################
// # Debug Email con Allegati - Test Completo
// #####################################################################

require('dotenv').config();

const s3Service = require('./services/s3Service');
const { dbPool } = require('./config/db');

console.log('🔍 DEBUG EMAIL CON ALLEGATI');
console.log('============================');

async function testEmailAttachmentFlow() {
    console.log('\n📋 CONFIGURAZIONE:');
    console.log(`PUBLIC_API_URL: ${process.env.PUBLIC_API_URL}`);
    console.log(`S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME}`);
    console.log(`S3_ENDPOINT: ${process.env.S3_ENDPOINT}`);

    // 1. Simula upload di un allegato
    console.log('\n📤 1. Simulazione upload allegato...');
    const testFile = Buffer.from('Questo è un file di test per email con allegati');
    const s3Key = s3Service.generateS3Path(1, 1, 'documento-test.pdf');

    try {
        const uploadResult = await s3Service.uploadFile(testFile, s3Key, {
            originalName: 'documento-test.pdf',
            contentType: 'application/pdf',
            uploadedBy: '1',
            dittaId: '1'
        });
        console.log('✅ Upload S3 successo:', uploadResult);
    } catch (error) {
        console.log('❌ Upload fallito:', error.message);
        return;
    }

    // 2. Genera URL tracking
    console.log('\n🔗 2. Generazione URL tracking...');
    const downloadId = 'test-download-' + Date.now();

    try {
        const trackingUrl = await s3Service.getTrackingUrl(downloadId, s3Key);
        const signedUrl = await s3Service.getSignedDownloadUrl(s3Key, 3600);

        console.log('✅ Tracking URL:', trackingUrl);
        console.log('✅ Signed URL:', signedUrl.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Generazione URL fallita:', error.message);
        return;
    }

    // 3. Simula salvataggio nel database
    console.log('\n💾 3. Simulazione salvataggio database...');
    try {
        const connection = await dbPool.getConnection();

        // Inserisci email di test
        const [emailResult] = await connection.query(`
            INSERT INTO email_inviate (id_utente_mittente, destinatari, oggetto, corpo, tracking_id)
            VALUES (?, ?, ?, ?, ?)
        `, [1, 'test@example.com', 'Test Email con Allegato', '<p>Email di test</p>', downloadId]);

        const emailId = emailResult.insertId;
        console.log('✅ Email salvata, ID:', emailId);

        // Inserisci allegato tracciato
        const [attachmentResult] = await connection.query(`
            INSERT INTO allegati_tracciati (id_email_inviata, nome_file_originale, percorso_file_salvato, download_id, dimensione_file)
            VALUES (?, ?, ?, ?, ?)
        `, [emailId, 'documento-test.pdf', s3Key, downloadId, testFile.length]);

        console.log('✅ Allegato tracciato salvato, ID:', attachmentResult.insertId);

        connection.release();
    } catch (error) {
        console.log('❌ Salvataggio database fallito:', error.message);
        return;
    }

    // 4. Verifica che il download URL sia accessibile
    console.log('\n🌐 4. Test accessibilità URL...');
    const trackingUrl = `${process.env.PUBLIC_API_URL}/api/track/download/${downloadId}`;

    console.log('URL di download test:', trackingUrl);
    console.log('Per testare manualmente:');
    console.log('1. Avvia il server: npm start');
    console.log('2. Apri nel browser:', trackingUrl);
    console.log('3. Dovresti vedere il download del file o un errore dettagliato');

    // 5. Controlla database per tracking
    console.log('\n📊 5. Verifica tracking database...');
    try {
        const connection = await dbPool.getConnection();

        const [trackingRecords] = await connection.query(`
            SELECT * FROM download_tracking WHERE download_id = ?
        `, [downloadId]);

        console.log(`Record tracking trovati: ${trackingRecords.length}`);

        const [attachmentRecord] = await connection.query(`
            SELECT * FROM allegati_tracciati WHERE download_id = ?
        `, [downloadId]);

        if (attachmentRecord.length > 0) {
            const attachment = attachmentRecord[0];
            console.log('Record allegato:');
            console.log(`  Nome: ${attachment.nome_file_originale}`);
            console.log(`  Percorso S3: ${attachment.percorso_file_salvato}`);
            console.log(`  Scaricato: ${attachment.scaricato ? 'Sì' : 'No'}`);
            console.log(`  Download count: ${attachment.download_count || 0}`);
        }

        connection.release();
    } catch (error) {
        console.log('❌ Verifica database fallita:', error.message);
    }

    // 6. Cleanup
    console.log('\n🧹 6. Cleanup test...');
    try {
        await s3Service.deleteFile(s3Key);
        console.log('✅ File S3 eliminato');

        const connection = await dbPool.getConnection();
        await connection.query('DELETE FROM allegati_tracciati WHERE download_id = ?', [downloadId]);
        await connection.query('DELETE FROM email_inviate WHERE tracking_id = ?', [downloadId]);
        connection.release();
        console.log('✅ Record database eliminati');
    } catch (error) {
        console.log('❌ Cleanup fallito:', error.message);
    }

    console.log('\n📝 RIEPILOGO PROBLEMI POSSIBILI:');
    console.log('1. Server non avviato sulla porta 3001');
    console.log('2. Firewall bloccando le connessioni');
    console.log('3. PUBLIC_API_URL errata nel .env');
    console.log('4. Route /api/track/download non registrata correttamente');
    console.log('5. CORS che blocca le richieste dal destinatario');
}

// Esegui test
testEmailAttachmentFlow().catch(console.error);