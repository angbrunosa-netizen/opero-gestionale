#!/usr/bin/env node

// #####################################################################
// # Test Integrazione S3 - Opero Mail System
// # File: test-s3-integration.js
// #####################################################################

require('dotenv').config();

const s3Service = require('./services/s3Service');
const { dbPool } = require('./config/db');

// Colors per output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

async function testS3Connection() {
    log('\n=== TEST CONNESSIONE S3 ===', 'bright');

    try {
        const connected = await s3Service.testConnection();

        if (connected) {
            logSuccess('Connessione S3 stabilita con successo');
            logInfo(`Bucket: ${s3Service.bucket}`);
            logInfo(`Endpoint: ${process.env.ARUBA_S3_ENDPOINT || 'Non configurato'}`);
            return true;
        } else {
            logError('Connessione S3 fallita');
            return false;
        }
    } catch (error) {
        logError(`Errore connessione S3: ${error.message}`);
        return false;
    }
}

async function testS3UploadDownload() {
    log('\n=== TEST UPLOAD/DOWNLOAD S3 ===', 'bright');

    try {
        const testContent = Buffer.from('Questo è un test di integrazione S3 per Opero Mail System');
        const testFilename = `test-${Date.now()}.txt`;
        const testDittaId = 1;
        const testUserId = 1;

        // Genera percorso S3
        const s3Key = s3Service.generateS3Path(testDittaId, testUserId, testFilename);
        logInfo(`Percorso S3: ${s3Key}`);

        // Upload
        const uploadResult = await s3Service.uploadFile(testContent, s3Key, {
            originalName: testFilename,
            contentType: 'text/plain',
            uploadedBy: testUserId.toString(),
            dittaId: testDittaId.toString()
        });

        logSuccess(`Upload completato: ${uploadResult.etag}`);

        // Genera URL firmato
        const signedUrl = await s3Service.getSignedDownloadUrl(s3Key, 300); // 5 minuti
        logSuccess(`URL firmato generato (valido 5 minuti)`);

        // Test info file
        const fileInfo = await s3Service.getFileInfo(s3Key);
        logSuccess(`Info file recuperate: ${fileInfo.size} bytes`);

        // Cleanup
        const deleted = await s3Service.deleteFile(s3Key);
        if (deleted) {
            logSuccess('File test eliminato con successo');
        }

        return true;

    } catch (error) {
        logError(`Errore test upload/download: ${error.message}`);
        return false;
    }
}

async function testDatabaseConnection() {
    log('\n=== TEST CONNESSIONE DATABASE ===', 'bright');

    try {
        const [result] = await dbPool.query('SELECT 1 as test');

        if (result.length > 0 && result[0].test === 1) {
            logSuccess('Connessione database stabilita con successo');
            return true;
        } else {
            logError('Connessione database fallita');
            return false;
        }
    } catch (error) {
        logError(`Errore connessione database: ${error.message}`);
        return false;
    }
}

async function testRequiredTables() {
    log('\n=== TEST TABELLE DATABASE NECESSARIE ===', 'bright');

    const requiredTables = [
        'allegati_tracciati',
        'email_inviate',
        'download_tracking',
        'email_open_tracking',
        'cleanup_stats'
    ];

    let allTablesExist = true;

    for (const table of requiredTables) {
        try {
            const [result] = await dbPool.query(`SHOW TABLES LIKE '${table}'`);

            if (result.length > 0) {
                logSuccess(`Tabella '${table}' trovata`);

                // Check colonne per allegati_tracciati
                if (table === 'allegati_tracciati') {
                    const [columns] = await dbPool.query(`SHOW COLUMNS FROM ${table}`);
                    const requiredColumns = ['id', 'nome_file_originale', 'percorso_file_salvato', 'download_id', 'dimensione_file'];

                    const columnNames = columns.map(col => col.Field);
                    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

                    if (missingColumns.length > 0) {
                        logWarning(`Colonne mancanti in '${table}': ${missingColumns.join(', ')}`);
                        allTablesExist = false;
                    } else {
                        logSuccess(`Tabella '${table}' ha tutte le colonne richieste`);
                    }
                }
            } else {
                logError(`Tabella '${table}' non trovata`);
                allTablesExist = false;
            }
        } catch (error) {
            logError(`Errore controllo tabella '${table}': ${error.message}`);
            allTablesExist = false;
        }
    }

    return allTablesExist;
}

async function testEnvironmentVariables() {
    log('\n=== TEST VARIABILI AMBIENTE ===', 'bright');

    const requiredVars = [
        'S3_BUCKET_NAME',
        'S3_ACCESS_KEY',
        'S3_SECRET_KEY',
        'PUBLIC_API_URL'
    ];

    const optionalVars = [
        'S3_ENDPOINT',
        'S3_REGION'
    ];

    let allRequiredPresent = true;

    for (const varName of requiredVars) {
        if (process.env[varName]) {
            logSuccess(`${varName}: ✓`);
        } else {
            logError(`${varName}: ✗ mancante`);
            allRequiredPresent = false;
        }
    }

    for (const varName of optionalVars) {
        if (process.env[varName]) {
            logSuccess(`${varName}: ✓ (impostato)`);
        } else {
            logWarning(`${varName}: ⚠ non impostato (userà default)`);
        }
    }

    return allRequiredPresent;
}

async function runAllTests() {
    log('\n🚀 INTEGRAZIONE S3 OPERO - TEST COMPLETO', 'bright');
    log('=====================================', 'bright');

    const testResults = {
        environment: await testEnvironmentVariables(),
        database: await testDatabaseConnection(),
        tables: await testRequiredTables(),
        s3Connection: await testS3Connection(),
        s3UploadDownload: false // Esegui solo se S3 connection funziona
    };

    if (testResults.s3Connection) {
        testResults.s3UploadDownload = await testS3UploadDownload();
    }

    // Riepilogo finale
    log('\n=== RIEPILOGO TEST ===', 'bright');

    const allPassed = Object.values(testResults).every(result => result === true);

    for (const [test, passed] of Object.entries(testResults)) {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const color = passed ? 'green' : 'red';
        log(`${test.toUpperCase()}: ${status}`, color);
    }

    if (allPassed) {
        log('\n🎉 TUTTI I TEST SUPERATI!', 'green');
        log('✨ Sistema pronto per l\'uso con storage S3 Aruba', 'green');
    } else {
        log('\n⚠️ ALCUNI TEST FALLITI', 'yellow');
        log('Per favore, risolvi i problemi evidenziati prima di procedere', 'yellow');

        if (!testResults.environment) {
            log('\n📝 Suggerimento:', 'cyan');
            log('Crea un file .env basandoti su .env.example', 'cyan');
        }

        if (!testResults.tables) {
            log('\n🗄️ Suggerimento:', 'cyan');
            log('Esegui le migrazioni del database:', 'cyan');
            log('npx knex migrate:latest', 'yellow');
        }

        if (!testResults.s3Connection) {
            log('\n☁️ Suggerimento:', 'cyan');
            log('Verifica le credenziali S3 e la configurazione di Aruba Cloud', 'cyan');
        }
    }

    process.exit(allPassed ? 0 : 1);
}

// Esegui tutti i test
if (require.main === module) {
    runAllTests().catch(error => {
        logError(`Errore imprevisto: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    testS3Connection,
    testS3UploadDownload,
    testDatabaseConnection,
    testRequiredTables,
    testEnvironmentVariables
};