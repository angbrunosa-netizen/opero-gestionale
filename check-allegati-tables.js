const { dbPool } = require('./config/db');

async function checkAllegatiTables() {
    try {
        console.log('🔍 ANALISI TABELLE ALLEGATI NEL DATABASE');
        console.log('===========================================');

        // Lista delle tabelle da analizzare
        const tablesToCheck = [
            'allegati_tracciati',
            'dm_files',
            'dm_allegati_link',
            'email_inviate',
            'ditta_mail_inviate'
        ];

        for (const tableName of tablesToCheck) {
            console.log(`\n📋 Analisi tabella: ${tableName}`);
            console.log('-'.repeat(40));

            try {
                // Verifica se la tabella esiste
                const [tableExists] = await dbPool.query(`
                    SELECT COUNT(*) as exists_table
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                    AND table_name = ?
                `, [tableName]);

                if (tableExists[0].exists_table === 0) {
                    console.log(`   ❌ Tabella ${tableName} non esiste`);
                    continue;
                }

                // Descrizione struttura
                const [describe] = await dbPool.query(`DESCRIBE ${tableName}`);
                console.log(`   📋 Struttura tabella (${describe.length} colonne):`);
                describe.forEach((col, i) => {
                    console.log(`      ${i+1}. ${col.Field} | ${col.Type} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} | ${col.Key || ''} | ${col.Default || ''}`);
                });

                // Conteggio record
                const [count] = await dbPool.query(`SELECT COUNT(*) as total FROM ${tableName}`);
                console.log(`   📊 Record totali: ${count[0].total}`);

                // Dati di esempio (limitati)
                if (count[0].total > 0) {
                    const [sampleData] = await dbPool.query(`SELECT * FROM ${tableName} LIMIT 3`);
                    console.log(`   📋 Dati di esempio (primi 3 record):`);
                    sampleData.forEach((row, i) => {
                        console.log(`      ${i+1}. ${JSON.stringify(row, null, 6)}`);
                    });
                }

                console.log(`   ✅ Tabella ${tableName} analizzata con successo\n`);

            } catch (tableError) {
                console.log(`   ❌ Errore analisi tabella ${tableName}: ${tableError.message}`);
            }
        }

        // Analisi specifica per gestione upload allegati
        console.log('\n🔍 ANALISI GESTIONE UPLOAD ALLEGATI');
        console.log('=====================================');

        // Controlla se ci sono allegati nelle email inviate
        try {
            const [emailAllegati] = await dbPool.query(`
                SELECT COUNT(*) as total_with_attachments FROM email_inviate
                WHERE id IN (
                    SELECT DISTINCT id_email_inviata FROM allegati_tracciati
                    WHERE id_email_inviata IS NOT NULL
                )
            `);
            console.log(`   📧 Email con allegati: ${emailAllegati[0].total_with_attachments}`);
        } catch (error) {
            console.log(`   ℹ️ Tabella allegati_tracciati potrebbe non avere relazione con email_inviate`);
        }

        // Verifica integrità dati allegati
        try {
            const [allegatiStats] = await dbPool.query(`
                SELECT
                    COUNT(*) as total_allegati,
                    COUNT(DISTINCT id_email_inviata) as email_con_allegati,
                    SUM(dimensione_file) as dimensione_totale,
                    AVG(dimensione_file) as dimensione_media
                FROM allegati_tracciati
                WHERE id_email_inviata IS NOT NULL
            `);

            if (allegatiStats[0].total_allegati > 0) {
                console.log(`   📊 Statistiche allegati email:`);
                console.log(`      - Totali: ${allegatiStats[0].total_allegati}`);
                console.log(`      - Email con allegati: ${allegatiStats[0].email_con_allegati}`);
                console.log(`      - Spazio occupato: ${Math.round(allegatiStats[0].dimensione_totale / 1024 / 1024 * 100) / 100} MB`);
                console.log(`      - Dimensione media: ${Math.round(allegatiStats[0].dimensione_media / 1024 * 100) / 100} KB`);
            } else {
                console.log(`   ℹ️ Nessun allegato trovato nella tabella allegati_tracciati`);
            }
        } catch (error) {
            console.log(`   ℹ️ Tabella allegati_tracciati non disponibile`);
        }

    } catch (error) {
        console.error('❌ Errore generale durante l\'analisi:', error.message);
    } finally {
        await dbPool.end();
    }
}

checkAllegatiTables();