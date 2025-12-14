/**
 * Script diagnostico per verificare le tabelle del database
 */

const { knex } = require('./config/db');

async function checkDatabaseTables() {
  console.log('🔍 Analisi del Database...\n');

  try {
    // Lista tutte le tabelle
    console.log('📋 Tabelle nel database:');
    const tables = await knex.raw('SHOW TABLES');
    console.log(tables[0]);

    console.log('\n🔍 Verifica tabelle siti web:');

    // Controlla diverse possibili tabelle
    const possibleTables = [
      'siti_web',
      'websites',
      'sito_web',
      'wg_sites',
      'website',
      'pagine_sito_web'
    ];

    for (const tableName of possibleTables) {
      try {
        const exists = await knex.schema.hasTable(tableName);
        console.log(`   ${tableName}: ${exists ? '✅ ESISTE' : '❌ NON ESISTE'}`);

        if (exists) {
          // Conta i record
          const count = await knex(tableName).count('* as total');
          console.log(`      Record: ${count[0].total}`);

          // Mostra la struttura
          if (count[0].total > 0) {
            const sample = await knex(tableName).first();
            console.log(`      Campi: ${Object.keys(sample).join(', ')}`);

            // Mostra un record di esempio
            console.log(`      Esempio:`, JSON.stringify(sample, null, 2));
          }
        }
      } catch (error) {
        console.log(`   ${tableName}: ❌ ERRORE - ${error.message}`);
      }
    }

    console.log('\n🔍 Verifica tabelle pagine:');
    const pageTables = [
      'pagine_sito_web',
      'pages',
      'website_pages',
      'pagine',
      'site_pages'
    ];

    for (const tableName of pageTables) {
      try {
        const exists = await knex.schema.hasTable(tableName);
        console.log(`   ${tableName}: ${exists ? '✅ ESISTE' : '❌ NON ESISTE'}`);

        if (exists) {
          const count = await knex(tableName).count('* as total');
          console.log(`      Record: ${count[0].total}`);
        }
      } catch (error) {
        console.log(`   ${tableName}: ❌ ERRORE - ${error.message}`);
      }
    }

    console.log('\n🔍 Verifica azienda (companyId: 16):');
    try {
      const company = await knex('ditte').where({ id: 16 }).first();
      if (company) {
        console.log('   ✅ Azienda trovata:');
        console.log(`      ID: ${company.id}`);
        console.log(`      Nome: ${company.ragione_sociale}`);
        console.log(`      Settore: ${company.settore}`);
        console.log(`      Descrizione: ${company.descrizione ? company.descrizione.substring(0, 100) + '...' : 'N/D'}`);
      } else {
        console.log('   ❌ Azienda ID=16 non trovata');
      }
    } catch (error) {
      console.log(`   ❌ Errore verifica azienda: ${error.message}`);
    }

    console.log('\n🎯 RACCOMANDAZIONI:');
    console.log('1. Identifica la tabella corretta per i siti');
    console.log('2. Usa quella tabella nell AI Content Generator');
    console.log('3. Verifica che la tabella pagine sia corrispondente');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

async function testExistingSites() {
  console.log('\n🌐 Test siti esistenti...');

  try {
    // Prova a cercare siti usando diverse tabelle
    const possibleSiteQueries = [
      'SELECT * FROM siti_web WHERE id_ditta = 16',
      'SELECT * FROM websites WHERE company_id = 16',
      'SELECT * FROM wg_sites WHERE id_ditta = 16'
    ];

    for (const query of possibleSiteQueries) {
      try {
        const result = await knex.raw(query);
        if (result[0] && result[0].length > 0) {
          console.log(`✅ Trovati siti con query: ${query}`);
          console.log(`   Resultati: ${result[0].length}`);
          result[0].forEach((site, index) => {
            console.log(`   ${index + 1}. ID: ${site.id}, Nome: ${site.nome_sito || site.name || 'N/D'}`);
          });
        }
      } catch (error) {
        console.log(`❌ Query fallita: ${query}`);
      }
    }

  } catch (error) {
    console.error('❌ Errore test siti:', error);
  }
}

// Esegui i controlli
async function main() {
  await checkDatabaseTables();
  await testExistingSites();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkDatabaseTables, testExistingSites };