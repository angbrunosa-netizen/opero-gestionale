#!/usr/bin/env node

// #####################################################################
// # ANALISI COMPLETA SISTEMA ARCHIVIAZIONE ALLEGATI
// #####################################################################

const { dbPool } = require('./config/db');
require('dotenv').config();

console.log('📋 ANALISI COMPLETA SISTEMA ARCHIVIAZIONE');
console.log('========================================');

// Analisi completa delle tabelle del sistema archivio
async function analyzeStorageSystem() {
    try {
        console.log('\n🗄️ 1. STRUTTURA DATABASE ARCHIVIO');

        // Analisi dm_allegati (tabella principale files)
        console.log('\n📁 Tabella dm_allegati (metadati file):');
        const [allegatiStructure] = await dbPool.query('DESCRIBE dm_allegati');
        allegatiStructure.forEach((col, i) => {
            console.log(`  ${i+1}. ${col.Field} | ${col.Type} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} | ${col.Key || ''} | ${col.Default || ''}`);
        });

        // Statistiche dm_allegati
        const [allegatiStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_files,
                COUNT(DISTINCT id_ditta) as aziende,
                SUM(file_size) as total_size,
                AVG(file_size) as avg_size,
                COUNT(CASE WHEN privacy = 'public' THEN 1 END) as public_files,
                COUNT(CASE WHEN privacy = 'private' THEN 1 END) as private_files
            FROM dm_allegati
        `);

        console.log('\n📊 Statistiche dm_allegati:');
        console.log(`   File totali: ${allegatiStats[0].total_files}`);
        console.log(`   Aziende: ${allegatiStats[0].aziende}`);
        console.log(`   Spazio totale: ${formatBytes(allegatiStats[0].total_size)}`);
        console.log(`   Dimensione media: ${formatBytes(allegatiStats[0].avg_size)}`);
        console.log(`   File pubblici: ${allegatiStats[0].public_files}`);
        console.log(`   File privati: ${allegatiStats[0].private_files}`);

        // Analisi dm_allegati_link (già analizzata, ma riepilogo)
        console.log('\n🔗 Tabella dm_allegati_link (collegamenti entità):');
        const [linkStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_links,
                COUNT(DISTINCT id_ditta) as aziende,
                COUNT(DISTINCT entita_tipo) as tipi_entita,
                COUNT(DISTINCT entita_id) as entita_uniche,
                COUNT(DISTINCT id_file) as file_collegati
            FROM dm_allegati_link
        `);

        console.log(`   Collegamenti totali: ${linkStats[0].total_links}`);
        console.log(`   Aziende coinvolte: ${linkStats[0].aziende}`);
        console.log(`   Tipi entità: ${linkStats[0].tipi_entita}`);
        console.log(`   Entità uniche: ${linkStats[0].entita_uniche}`);
        console.log(`   File collegati: ${linkStats[0].file_collegati}`);

        // Analisi estensioni file
        console.log('\n📄 Estensioni file più comuni:');
        const [extensionStats] = await dbPool.query(`
            SELECT
                SUBSTRING_INDEX(nome_file, '.', -1) as estensione,
                COUNT(*) as count,
                SUM(file_size) as total_size
            FROM dm_allegati
            WHERE nome_file LIKE '%.%'
            GROUP BY estensione
            ORDER BY count DESC
            LIMIT 10
        `);

        extensionStats.forEach((ext, i) => {
            console.log(`  ${i+1}. .${ext.estensione} - ${ext.count} file (${formatBytes(ext.total_size)})`);
        });

        // Test per nuova gestione allegati email
        console.log('\n📧 ANALISI PER NUOVA GESTIONE ALLEGATI EMAIL:');

        // Verifica se esistono già allegati per email
        const [emailAllegati] = await dbPool.query(`
            SELECT
                dal.*,
                da.nome_file,
                da.mime_type,
                da.file_size,
                da.privacy
            FROM dm_allegati_link dal
            JOIN dm_allegati da ON dal.id_file = da.id
            WHERE dal.entita_tipo = 'email_inviate'
            LIMIT 5
        `);

        console.log(`📊 Allegati email esistenti: ${emailAllegati.length}`);

        if (emailAllegati.length > 0) {
            emailAllegati.forEach((allegato, i) => {
                console.log(`  ${i+1}. File: ${allegato.nome_file} (${allegato.mime_type}) - Email ID: ${allegato.entita_id}`);
            });
        }

        // Proposta struttura per "allegati_tracciati"
        console.log('\n🎯 PROPOSTA PER "allegati_tracciati":');
        console.log('   - entita_tipo: "allegati_tracciati"');
        console.log('   - entita_id: ID email_inviate (destinatario specifico)');
        console.log('   - id_file: ID file da dm_allegati');
        console.log('   - Campo aggiuntivo per tracking download?');

        // Verifica integrità collegamenti
        console.log('\n🔍 VERIFICA INTEGRITÀ COLLEGAMENTI:');
        const [orphanLinks] = await dbPool.query(`
            SELECT COUNT(*) as count
            FROM dm_allegati_link dal
            LEFT JOIN dm_allegati da ON dal.id_file = da.id
            WHERE da.id IS NULL
        `);

        const [orphanFiles] = await dbPool.query(`
            SELECT COUNT(*) as count
            FROM dm_allegati da
            LEFT JOIN dm_allegati_link dal ON da.id = dal.id_file
            WHERE dal.id IS NULL
        `);

        console.log(`   Collegamenti orfani (link senza file): ${orphanLinks[0].count}`);
        console.log(`   File orfani (file senza collegamenti): ${orphanFiles[0].count}`);

        console.log('\n✅ ANALISI DATABASE COMPLETATA');

    } catch (error) {
        console.error('❌ Errore analisi storage system:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Funzione helper per formattare bytes
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Esegui analisi
analyzeStorageSystem().then(() => {
    console.log('\n🏁 Analisi completata con successo');
    process.exit(0);
}).catch(error => {
    console.error('💥 Analisi fallita:', error);
    process.exit(1);
});