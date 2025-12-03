#!/usr/bin/env node

// #####################################################################
// # Debug S3 Aruba - Diagnostica Dettagliata
// #####################################################################

require('dotenv').config();

const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

console.log('🔍 DEBUG DETTAGLIATO S3 ARUBA');
console.log('================================');

// 1. Verifica variabili environment
console.log('\n📋 VARIABILI AMBIENTE:');
console.log(`S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME || 'NON DEFINITO'}`);
console.log(`S3_ENDPOINT: ${process.env.S3_ENDPOINT || 'NON DEFINITO'}`);
console.log(`S3_ACCESS_KEY: ${process.env.S3_ACCESS_KEY ? process.env.S3_ACCESS_KEY.substring(0, 10) + '...' : 'NON DEFINITO'}`);
console.log(`S3_SECRET_KEY: ${process.env.S3_SECRET_KEY ? 'DEFINITA (' + process.env.S3_SECRET_KEY.length + ' chars)' : 'NON DEFINITA'}`);
console.log(`S3_REGION: ${process.env.S3_REGION || 'NON DEFINITO'}`);

// 2. Test con diverse configurazioni S3
const configs = [
    {
        name: 'Configurazione Base (Endpoint HTTP)',
        config: {
            region: process.env.S3_REGION || 'it-mil-1',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            },
            forcePathStyle: true
        }
    },
    {
        name: 'Configurazione con Path Style Disabilitato',
        config: {
            region: process.env.S3_REGION || 'it-mil-1',
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            },
            forcePathStyle: false
        }
    },
    {
        name: 'Configurazione Senza Endpoint',
        config: {
            region: process.env.S3_REGION || 'it-mil-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            },
            forcePathStyle: true
        }
    }
];

async function testConfig(configName, s3Config) {
    console.log(`\n🧪 Test: ${configName}`);
    console.log('   Config:', JSON.stringify(s3Config, null, 2));

    const s3Client = new S3Client(s3Config);

    try {
        // Test 1: Lista bucket
        console.log('   1. Test lista bucket...');
        const listCommand = new ListBucketsCommand({});
        const listResult = await s3Client.send(listCommand);
        console.log(`   ✅ Bucket trovati: ${listResult.Buckets?.length || 0}`);
        if (listResult.Buckets) {
            listResult.Buckets.forEach(bucket => {
                console.log(`      - ${bucket.Name} (creato: ${bucket.CreationDate})`);
            });
        }

        // Test 2: Head bucket (verifica esistenza e permessi)
        if (process.env.S3_BUCKET_NAME) {
            console.log('   2. Test head bucket...');
            const headCommand = new HeadBucketCommand({ Bucket: process.env.S3_BUCKET_NAME });
            await s3Client.send(headCommand);
            console.log(`   ✅ Bucket "${process.env.S3_BUCKET_NAME}" accessibile`);
        }

        // Test 3: Upload file test
        if (process.env.S3_BUCKET_NAME) {
            console.log('   3. Test upload file...');
            const testContent = 'Test content ' + new Date().toISOString();
            const testKey = `test/debug-${Date.now()}.txt`;

            const putCommand = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: testKey,
                Body: testContent,
                ContentType: 'text/plain',
                Metadata: {
                    test: 'debug-s3'
                }
            });

            const putResult = await s3Client.send(putCommand);
            console.log(`   ✅ Upload successo: ${testKey}`);
            console.log(`      ETag: ${putResult.ETag}`);
        }

        return { success: true, error: null };

    } catch (error) {
        console.log(`   ❌ Errore: ${error.name}`);
        console.log(`      Message: ${error.message}`);
        console.log(`      Code: ${error.Code || 'N/A'}`);
        console.log(`      HTTP Status: ${error.$metadata?.httpStatusCode || 'N/A'}`);
        console.log(`      RequestId: ${error.RequestId || 'N/A'}`);

        if (error.Code === 'InvalidAccessKeyId') {
            console.log('      🔑 Suggerimento: Access Key non valida');
        } else if (error.Code === 'SignatureDoesNotMatch') {
            console.log('      🔑 Suggerimento: Secret Key non valida');
        } else if (error.Code === 'NoSuchBucket') {
            console.log('      📦 Suggerimento: Bucket non esiste');
        } else if (error.Code === 'AccessDenied') {
            console.log('      🚫 Suggerimento: Permessi insufficienti');
        } else if (error.Code === 'InvalidRequest') {
            console.log('      ⚙️ Suggerimento: Richiesta non valida - controlla configurazione endpoint');
        }

        return { success: false, error: error.message, code: error.Code };
    }
}

async function runAllTests() {
    let workingConfig = null;

    for (const config of configs) {
        const result = await testConfig(config.name, config.config);

        if (result.success) {
            workingConfig = config;
            console.log(`   🎉 CONFIGURAZIONE FUNZIONANTE TROVATA!`);
            break;
        } else {
            console.log(`   ❌ Configurazione fallita`);
        }
    }

    if (workingConfig) {
        console.log(`\n✅ RISULTATO: Usa la configurazione "${workingConfig.name}"`);

        // Genera configurazione consigliata per .env
        console.log(`\n📝 CONFIGURAZIONE CONSIGLIATA PER .env:`);
        console.log(`S3_ENDPOINT=${workingConfig.config.endpoint || ''}`);
        console.log(`S3_REGION=${workingConfig.config.region}`);
        console.log(`FORCE_PATH_STYLE=${workingConfig.config.forcePathStyle}`);

    } else {
        console.log(`\n❌ NESSUNA CONFIGURAZIONE HA FUNZIONATO`);
        console.log(`\n🔧 POSSIBILI SOLUZIONI:`);
        console.log(`1. Verifica credenziali S3 nel pannello Aruba Cloud`);
        console.log(`2. Controlla che il bucket "${process.env.S3_BUCKET_NAME}" esista`);
        console.log(`3. Verifica permessi IAM/S3 per l'access key`);
        console.log(`4. Prova senza specificare l'endpoint`);
        console.log(`5. Controlla firewall/proxy che possano bloccare le connessioni`);
    }
}

// Esegui test
runAllTests().catch(error => {
    console.error('Errore imprevisto:', error);
    process.exit(1);
});