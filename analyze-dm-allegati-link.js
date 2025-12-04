const { dbPool } = require('./config/db');

async function analyzeDmAllegatiLink() {
  try {
    console.log('🔍 ANALISI TABELLA dm_allegati_link');
    console.log('=====================================');

    // Descrizione tabella
    const [describe] = await dbPool.query('DESCRIBE dm_allegati_link');

    console.log('📋 Struttura tabella:');
    describe.forEach((col, i) => {
      console.log(`  ${i+1}. ${col.Field} | ${col.Type} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} | ${col.Key || ''} | ${col.Default || ''}`);
    });

    // Dati di esempio
    const [sampleData] = await dbPool.query('SELECT * FROM dm_allegati_link LIMIT 5');

    console.log('\n📊 Dati di esempio:');
    if (sampleData.length === 0) {
      console.log('   ⚠️ Tabella vuota');
    } else {
      sampleData.forEach((row, i) => {
        console.log(`  ${i+1}. ${JSON.stringify(row)}`);
      });
    }

    // Statistiche
    const [stats] = await dbPool.query(`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT id_ditta) as aziende,
        COUNT(DISTINCT entita_tipo) as entita_tipi,
        COUNT(DISTINCT entita_id) as entita_uniche
      FROM dm_allegati_link
    `);

    console.log('\n📈 Statistiche:');
    console.log(`   Record totali: ${stats[0].total_records}`);
    console.log(`   Aziende coinvolte: ${stats[0].aziende}`);
    console.log(`   Tipi entità: ${stats[0].entita_tipi}`);
    console.log(`   Entità uniche: ${stats[0].entita_uniche}`);

  } catch (error) {
    console.error('❌ Errore analisi dm_allegati_link:', error.message);
  }
}

analyzeDmAllegatiLink();