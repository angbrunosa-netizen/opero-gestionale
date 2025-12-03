#!/usr/bin/env node

// #####################################################################
// # Test S3 Minimale - Identifica il problema esatto
// #####################################################################

require('dotenv').config();

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Test 1: Stessa configurazione del debug-s3.js (che funziona)
async function testWorkingConfig() {
    console.log('🧪 TEST 1: Configurazione che funziona (dal debug)');

    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'it-mil-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        forcePathStyle: true
    });

    try {
        const testContent = 'Test content from working config';
        const testKey = `test/working-${Date.now()}.txt`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain'
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        console.log('✅ SUCCESSO:', result.ETag);
        return true;
    } catch (error) {
        console.log('❌ ERRORE:', error.message, error.Code);
        return false;
    }
}

// Test 2: Con ServerSideEncryption (dal nostro servizio)
async function testWithEncryption() {
    console.log('\n🧪 TEST 2: Con ServerSideEncryption AES256');

    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'it-mil-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        forcePathStyle: true
    });

    try {
        const testContent = 'Test content with encryption';
        const testKey = `test/encryption-${Date.now()}.txt`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
            ServerSideEncryption: 'AES256'
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        console.log('✅ SUCCESSO:', result.ETag);
        return true;
    } catch (error) {
        console.log('❌ ERRORE:', error.message, error.Code);
        return false;
    }
}

// Test 3: Con Metadata (dal nostro servizio)
async function testWithMetadata() {
    console.log('\n🧪 TEST 3: Con Metadata');

    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'it-mil-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        forcePathStyle: true
    });

    try {
        const testContent = 'Test content with metadata';
        const testKey = `test/metadata-${Date.now()}.txt`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
            Metadata: {
                originalName: 'test.txt',
                uploadedBy: '1',
                dittaId: '1'
            }
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        console.log('✅ SUCCESSO:', result.ETag);
        return true;
    } catch (error) {
        console.log('❌ ERRORE:', error.message, error.Code);
        return false;
    }
}

// Test 4: Combinazione completa (dal nostro servizio)
async function testFullConfig() {
    console.log('\n🧪 TEST 4: Configurazione completa (dal s3Service)');

    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'it-mil-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        forcePathStyle: true
    });

    try {
        const testContent = 'Test content full config';
        const testKey = `test/full-${Date.now()}.txt`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain',
            Metadata: {
                originalName: 'test.txt',
                uploadedBy: '1',
                dittaId: '1',
                emailId: '1'
            },
            ServerSideEncryption: 'AES256'
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        console.log('✅ SUCCESSO:', result.ETag);
        return true;
    } catch (error) {
        console.log('❌ ERRORE:', error.message, error.Code);
        console.log('Dettagli:', JSON.stringify({
            name: error.name,
            message: error.message,
            code: error.Code,
            requestId: error.RequestId,
            bucket: error.BucketName
        }, null, 2));
        return false;
    }
}

// Test 5: Con percorso lungo (tipo nostro servizio)
async function testWithPathStructure() {
    console.log('\n🧪 TEST 5: Con struttura percorso del nostro servizio');

    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'it-mil-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        },
        forcePathStyle: true
    });

    try {
        const testContent = 'Test content with long path';
        const testKey = `mail-attachments/1/1/2025/12/03/test_${Date.now()}_abc123.txt`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: testKey,
            Body: testContent,
            ContentType: 'text/plain'
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        console.log('✅ SUCCESSO:', result.ETag);
        return true;
    } catch (error) {
        console.log('❌ ERRORE:', error.message, error.Code);
        return false;
    }
}

async function runAllTests() {
    const results = [];

    results.push(await testWorkingConfig());
    results.push(await testWithEncryption());
    results.push(await testWithMetadata());
    results.push(await testFullConfig());
    results.push(await testWithPathStructure());

    const successCount = results.filter(r => r).length;
    console.log(`\n📊 RISULTATI: ${successCount}/${results.length} test superati`);

    if (successCount < results.length) {
        console.log('\n🔧 ANALISI: Qualche test fallisce. Il problema potrebbe essere:');
        console.log('1. ServerSideEncryption non supportato da Aruba S3');
        console.log('2. Limitazioni sui metadati');
        console.log('3. Limitazioni sulla lunghezza del percorso');
        console.log('4. Problemi con caratteri speciali nel percorso');
    }
}

runAllTests().catch(console.error);