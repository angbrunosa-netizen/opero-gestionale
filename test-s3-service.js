#!/usr/bin/env node

// #####################################################################
// # Test Diretto S3Service
// #####################################################################

require('dotenv').config();

const s3Service = require('./services/s3Service');

console.log('🧪 TEST DIRETTO S3SERVICE');
console.log('=========================');

async function testS3ServiceDirectly() {
    try {
        // Test 1: Connessione
        console.log('\n1. Test connessione S3...');
        const connected = await s3Service.testConnection();
        console.log(`   Connessione: ${connected ? '✅ OK' : '❌ FAIL'}`);

        // Test 2: Generazione percorso
        console.log('\n2. Test generazione percorso...');
        const s3Key = s3Service.generateS3Path(1, 1, 'test.txt');
        console.log(`   Percorso generato: ${s3Key}`);

        // Test 3: Upload file
        console.log('\n3. Test upload file...');
        const testContent = Buffer.from('Test content from S3Service');
        const uploadResult = await s3Service.uploadFile(testContent, s3Key, {
            originalName: 'test.txt',
            contentType: 'text/plain',
            uploadedBy: '1',
            dittaId: '1'
        });
        console.log(`   Upload result:`, uploadResult);

        // Test 4: Get signed URL
        console.log('\n4. Test generazione signed URL...');
        const signedUrl = await s3Service.getSignedDownloadUrl(s3Key, 300);
        console.log(`   Signed URL: ${signedUrl.substring(0, 100)}...`);

        // Test 5: Get file info
        console.log('\n5. Test recupero info file...');
        const fileInfo = await s3Service.getFileInfo(s3Key);
        console.log(`   File info:`, fileInfo);

        // Test 6: Delete file
        console.log('\n6. Test eliminazione file...');
        const deleted = await s3Service.deleteFile(s3Key);
        console.log(`   Delete result: ${deleted}`);

        console.log('\n✅ TUTTI I TEST S3SERVICE SUPERATI!');

    } catch (error) {
        console.error('\n❌ ERRORE durante test S3Service:');
        console.error('Nome:', error.name);
        console.error('Message:', error.message);
        console.error('Code:', error.Code);
        console.error('Stack:', error.stack);

        if (error.Code === 'InvalidRequest') {
            console.log('\n🔧 POSSIBILE SOLUZIONE:');
            console.log('Controlla che l\'endpoint sia corretto e che il bucket esista.');
        }
    }
}

testS3ServiceDirectly();