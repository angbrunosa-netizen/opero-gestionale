const { dbPool } = require('./config/db');

async function testDirectInsert() {
  try {
    console.log('🧪 TEST INSERIMENTO DIRETTO TRACKING');
    console.log('====================================');

    const testTrackingId = 'test_direct_insert_' + Date.now();
    const testIp = '127.0.0.1';
    const testUserAgent = 'Test Browser Direct Insert';

    console.log('📧 Inserimento record test...');

    // Test inserimento diretto come fa l'endpoint
    const [openCountResult] = await dbPool.query(
      'SELECT COUNT(*) as open_count FROM email_open_tracking WHERE tracking_id = ?',
      [testTrackingId]
    );

    const newOpenCount = (openCountResult[0]?.open_count || 0) + 1;
    console.log(`   Open count calcolato: ${newOpenCount}`);

    // Prova inserimento
    await dbPool.query(
      'INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at, open_count) VALUES (?, ?, ?, NOW(), ?)',
      [testTrackingId, testIp, testUserAgent, newOpenCount]
    );

    console.log('✅ Inserimento completato');

    // Verifica
    const [verify] = await dbPool.query(
      'SELECT * FROM email_open_tracking WHERE tracking_id = ?',
      [testTrackingId]
    );

    if (verify.length > 0) {
      console.log('✅ Record verificato:');
      console.log(`   ID: ${verify[0].id}`);
      console.log(`   Tracking ID: ${verify[0].tracking_id}`);
      console.log(`   IP: ${verify[0].ip_address}`);
      console.log(`   Open Count: ${verify[0].open_count}`);
      console.log(`   Created At: ${verify[0].opened_at}`);

      // Pulizia
      await dbPool.query('DELETE FROM email_open_tracking WHERE tracking_id = ?', [testTrackingId]);
      console.log('🧹 Record test eliminato');

    } else {
      console.log('❌ Record non trovato dopo inserimento!');
    }

  } catch (error) {
    console.error('❌ Errore inserimento diretto:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectInsert();