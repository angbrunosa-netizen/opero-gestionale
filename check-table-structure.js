const { dbPool } = require('./config/db');

async function checkTableStructure() {
  try {
    console.log('🔍 STRUTTURA TABELLA email_open_tracking');
    console.log('=======================================');

    const [structure] = await dbPool.query('DESCRIBE email_open_tracking');

    structure.forEach((column, i) => {
      console.log(`  ${i+1}. ${column.Field} - ${column.Type} - ${column.Key || ''} - ${column.Null || ''} - ${column.Default || ''}`);
    });

    // Controlla indici
    const [indexes] = await dbPool.query('SHOW INDEX FROM email_open_tracking');

    console.log('\n🔑 INDICI:');
    indexes.forEach((index, i) => {
      console.log(`  ${i+1}. ${index.Key_name} - ${index.Column_name} - ${index.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

checkTableStructure();