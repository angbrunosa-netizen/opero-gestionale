#!/usr/bin/env node

// #####################################################################
// # ANALISI COMPLETA ARCHITETTURA SISTEMA ARCHIVIAZIONE
// #####################################################################

const { dbPool } = require('./config/db');
require('dotenv').config();

console.log('🏗️  ANALISI ARCHITETTURA SISTEMA ARCHIVIAZIONE');
console.log('===========================================');

async function analyzeSystemArchitecture() {
    try {
        console.log('\n🗄️ 1. STRUTTURA DATABASE ESISTENTE');

        // Analizza tabelle esistenti correlate alla gestione file
        const [tables] = await dbPool.query("SHOW TABLES LIKE '%allegat%'");
        console.log('\n📋 Tabelle correlate agli allegati:');
        tables.forEach((table, i) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${i+1}. ${tableName}`);
        });

        // Analizza dm_allegati_link che conosciamo esiste
        console.log('\n🔗 Tabella dm_allegati_link (collegamenti entità):');
        const [linkStructure] = await dbPool.query('DESCRIBE dm_allegati_link');
        linkStructure.forEach((col, i) => {
            console.log(`  ${i+1}. ${col.Field} | ${col.Type} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} | ${col.Key || ''} | ${col.Default || ''}`);
        });

        // Statistiche dm_allegati_link
        const [linkStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_links,
                COUNT(DISTINCT id_ditta) as aziende,
                COUNT(DISTINCT entita_tipo) as tipi_entita,
                COUNT(DISTINCT entita_id) as entita_uniche,
                COUNT(DISTINCT id_file) as file_collegati
            FROM dm_allegati_link
        `);

        console.log('\n📊 Statistiche dm_allegati_link:');
        console.log(`   Collegamenti totali: ${linkStats[0].total_links}`);
        console.log(`   Aziende coinvolte: ${linkStats[0].aziende}`);
        console.log(`   Tipi entità: ${linkStats[0].tipi_entita}`);
        console.log(`   Entità uniche: ${linkStats[0].entita_uniche}`);
        console.log(`   File collegati: ${linkStats[0].file_collegati}`);

        // Analizza tutti i tipi di entità esistenti
        console.log('\n🏷️  Tipi di entità attualmente utilizzati:');
        const [entityTypes] = await dbPool.query(`
            SELECT DISTINCT entita_tipo, COUNT(*) as count
            FROM dm_allegati_link
            GROUP BY entita_tipo
            ORDER BY count DESC
        `);

        entityTypes.forEach((type, i) => {
            console.log(`  ${i+1}. ${type.entita_tipo} - ${type.count} collegamenti`);
        });

        // Verifica integrità con altre tabelle
        console.log('\n🔍 ANALISI INTEGRITÀ COLLEGAMENTI:');

        // Controlla se i file_id puntano a tabelle esistenti
        const [possibleFileTables] = await dbPool.query("SHOW TABLES LIKE '%file%' OR LIKE '%allegat%' OR LIKE '%document%'");
        console.log('\n📁 Tabelle potenziali per file:');
        possibleFileTables.forEach((table, i) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${i+1}. ${tableName}`);
        });

        // Analizza se ci sono già allegati per email
        console.log('\n📧 ANALISI PER INTEGRAZIONE EMAIL:');

        // Controlla se esiste già entita_tipo per email
        const [emailEntities] = await dbPool.query(`
            SELECT COUNT(*) as count
            FROM dm_allegati_link
            WHERE entita_tipo LIKE '%email%'
        `);

        console.log(`📊 Entità email esistenti: ${emailEntities[0].count}`);

        if (emailEntities[0].count > 0) {
            const [emailDetails] = await dbPool.query(`
                SELECT DISTINCT entita_tipo, entita_id, COUNT(*) as files
                FROM dm_allegati_link
                WHERE entita_tipo LIKE '%email%'
                GROUP BY entita_tipo, entita_id
                LIMIT 5
            `);

            console.log('Dettaglio entità email:');
            emailDetails.forEach((detail, i) => {
                console.log(`  ${i+1}. ${detail.entita_tipo} - ID: ${detail.entita_id} - ${detail.files} file`);
            });
        }

        // Verifica se esistono tabelle per email tracking
        const [emailTables] = await dbPool.query("SHOW TABLES LIKE '%email%'");
        console.log('\n📧 Tabelle correlate email:');
        emailTables.forEach((table, i) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${i+1}. ${tableName}`);
        });

        // Proposta architettura per "allegati_tracciati"
        console.log('\n🎯 PROPOSTA ARCHITETTURA "allegati_tracciati":');
        console.log('   ┌─────────────────────────────────────────────────────────┐');
        console.log('   │ dm_allegati_link (tabella esistente)                    │');
        console.log('   │ • id_file → punta a tabella file (da creare/identificare) │');
        console.log('   │ • entita_tipo = "allegati_tracciati"                    │');
        console.log('   │ • entita_id → ID email_inviate (destinatario specifico)  │');
        console.log('   │ • id_ditta → multi-tenancy                            │');
        console.log('   └─────────────────────────────────────────────────────────┘');
        console.log('');
        console.log('   ┌─────────────────────────────────────────────────────────┐');
        console.log('   │ dm_allegati (tabella da creare/verificare)             │');
        console.log('   │ • id_file (PK)                                         │');
        console.log('   │ • id_ditta (multi-tenancy)                             │');
        console.log('   │ • nome_file                                            │');
        console.log('   │ • file_size                                            │');
        console.log('   │ • mime_type                                            │');
        console.log('   │ • s3_key ( percorso su Aruba S3 )                      │');
        console.log('   │ • privacy (public/private)                             │');
        console.log('   │ • created_at, updated_at                               │');
        console.log('   └─────────────────────────────────────────────────────────┘');

        // Analisi API endpoints necessarie
        console.log('\n🚀 API ENDPOINTS NECESSARI:');
        console.log('   1. POST /api/archivio/upload');
        console.log('      • FormData con file + metadati');
        console.log('      • entitaTipo = "allegati_tracciati"');
        console.log('      • entitaId = email_inviate.id');
        console.log('      • privacy = "public" (per accessibilità esterna)');
        console.log('');
        console.log('   2. GET /api/archivio/entita/allegati_tracciati/{emailId}');
        console.log('      • Restituisce allegati per email specifica');
        console.log('      • Include previewUrl per download diretto');
        console.log('');
        console.log('   3. GET /api/documenti/generate-download-url/{fileId}');
        console.log('      • Genera URL firmato S3 per file privati');
        console.log('');
        console.log('   4. DELETE /api/documenti/link/{linkId}');
        console.log('      • Elimina collegamento file-email');

        // Analisi configurazione S3
        console.log('\n☁️  CONFIGURAZIONE ARUBA S3:');
        console.log('   • Endpoint: già configurato nel sistema');
        console.log('   • Bucket: probabilmente già esistente');
        console.log('   • Policy: ACL per file pubblici + signed URLs per privati');
        console.log('   • Integration: già presente in AllegatiManager.js');

        console.log('\n✅ ANALISI ARCHITETTURA COMPLETATA');

    } catch (error) {
        console.error('❌ Errore analisi architettura:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Esegui analisi
analyzeSystemArchitecture().then(() => {
    console.log('\n🏁 Analisi architettura completata con successo');
    process.exit(0);
}).catch(error => {
    console.error('💥 Analisi architettura fallita:', error);
    process.exit(1);
});