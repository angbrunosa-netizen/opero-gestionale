#!/usr/bin/env node

/**
 * Script Esecuzione Migration Sicura - Sistema Blog
 * Uso: node scripts/safe-migrate-blog.js [--rollback] [--verify] [--force]
 * Data: 18/12/2025
 */

const { knex } = require('../config/db');
const path = require('path');

// Simula il formato migration di Knex per test
const migration = require('../migrations/20251218_create_web_blog_tables_safe.js');

async function main() {
    const args = process.argv.slice(2);
    const isRollback = args.includes('--rollback');
    const isVerify = args.includes('--verify');
    const isForce = args.includes('--force');

    console.log('🚀 Script Migration Sicura - Sistema Blog Multi-Tenant');
    console.log('='.repeat(60));
    console.log(` Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Database: ${process.env.DB_NAME || 'operodb'}`);
    console.log(` Opzioni: ${args.join(', ') || 'nessuna'}`);
    console.log('='.repeat(60));

    try {
        // Test connessione database
        console.log('🔍 Test connessione database...');
        await knex.raw('SELECT 1 as test');
        console.log('✅ Connessione database attiva');

        if (isRollback) {
            console.log('\n🔄 Eseguo rollback...');
            await migration.down(knex);
            console.log('✅ Rollback completato');
        } else if (isVerify) {
            console.log('\n🔍 Verifica stato tabelle blog...');
            const result = await migration.verify(knex);

            if (result.success) {
                console.log('✅ Verifica superata');
                console.log('📊 Statistiche:');
                console.log(`   - Tabelle: ${Object.values(result.tables).filter(Boolean).length}/2 esistenti`);
                console.log(`   - Indici: Categories (${result.indexes.categories}), Posts (${result.indexes.posts})`);
                console.log(`   - Record: Categories (${result.records.categories}), Posts (${result.records.posts})`);
            } else {
                console.log('❌ Verifica fallita:', result.error);
                process.exit(1);
            }
        } else {
            console.log('\n📝 Eseguo migration sicura...');

            // Controlla se la migration è già stata eseguita
            const [migrationRecord] = await knex('knex_migrations')
                .where('migration_name', '20251218_create_web_blog_tables_safe.js')
                .limit(1);

            if (migrationRecord && !isForce) {
                console.log('⚠️ Migration già eseguita. Usa --force per eseguirla di nuovo.');
                return;
            }

            await migration.up(knex);
            console.log('✅ Migration completata');

            // Esegui verifica automatica
            console.log('\n🔍 Verifica automatica...');
            const result = await migration.verify(knex);

            if (result.success) {
                console.log('✅ Sistema blog pronto all\'uso!');

                if (result.records.categories === 0 || result.records.posts === 0) {
                    console.log('\n💡 Suggerimenti:');
                    if (result.records.categories === 0) {
                        console.log('   - Crea alcune categorie tramite API admin');
                    }
                    if (result.records.posts === 0) {
                        console.log('   - Inserisci articoli di test per verificare il funzionamento');
                    }
                }
            } else {
                console.log('⚠️ Verifica post-migration non superata:', result.error);
            }
        }

    } catch (error) {
        console.error('\n❌ Errore critico:');
        console.error(`   ${error.message}`);
        console.error('\n🔧 Possibili soluzioni:');
        console.error('   1. Verifica che il database sia accessibile');
        console.error('   2. Controlla le credenziali nel file .env');
        console.error('   3. Assicurati di avere i permessi necessari');
        console.error('   4. Prova con --force se pensi sia un errore di stato');

        process.exit(1);
    } finally {
        // Chiudi connessione
        await knex.destroy();
        console.log('\n👋 Script completato');
    }
}

// Gestione segnali per chiusura pulita
process.on('SIGINT', () => {
    console.log('\n\n⚠️ Script interrotto dall\'utente');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️ Script terminato dal sistema');
    process.exit(0);
});

// Esegui funzione principale
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };