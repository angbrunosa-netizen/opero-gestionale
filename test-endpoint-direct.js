const { dbPool } = require('./config/db');

async function testEndpointDirect() {
  try {
    console.log('🧪 TEST ENDPOINT TRACKING DIRETTO');
    console.log('=================================');

    // Simula i dati del tracking ID dall'emergenza
    const trackingId = 'track_1764874242715_5434159f5e0cc713';
    const ip = '127.0.0.1';
    const userAgent = 'Test Browser Endpoint';

    console.log(`📧 Test con tracking ID reale: ${trackingId}`);

    // Step 1: Calcola numero di apertura come fa l'endpoint
    const [openCountResult] = await dbPool.query(
      'SELECT COUNT(*) as open_count FROM email_open_tracking WHERE tracking_id = ?',
      [trackingId]
    );

    const newOpenCount = (openCountResult[0]?.open_count || 0) + 1;
    console.log(`   Open count calcolato: ${newOpenCount}`);

    // Step 2: Inserisci come fa l'endpoint
    await dbPool.query(
      'INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at, open_count) VALUES (?, ?, ?, NOW(), ?)',
      [trackingId, ip, userAgent, newOpenCount]
    );

    console.log('✅ Inserimento completato');

    // Step 3: Aggiorna email_inviate come fa l'endpoint
    await dbPool.query(
      'UPDATE email_inviate SET aperta = 1, data_prima_apertura = IF(data_prima_apertura IS NULL, NOW(), data_prima_apertura), open_count = COALESCE(open_count, 0) + 1 WHERE tracking_id = ?',
      [trackingId]
    );

    console.log('✅ Aggiornamento email_inviate completato');

    // Step 4: Verifica completa
    const [verifyTracking] = await dbPool.query(
      'SELECT * FROM email_open_tracking WHERE tracking_id = ? ORDER BY opened_at DESC',
      [trackingId]
    );

    console.log(`🔍 Record tracking trovati: ${verifyTracking.length}`);
    verifyTracking.forEach((record, i) => {
      console.log(`  ${i+1}. ID: ${record.id}, IP: ${record.ip_address}, Count: ${record.open_count}, Time: ${record.opened_at}`);
    });

    const [verifyEmail] = await dbPool.query(
      'SELECT aperta, data_prima_apertura, open_count FROM email_inviate WHERE tracking_id = ?',
      [trackingId]
    );

    if (verifyEmail.length > 0) {
      console.log('✅ Email inviata aggiornata:');
      console.log(`   Aperta: ${verifyEmail[0].aperta}`);
      console.log(`   Prima Apertura: ${verifyEmail[0].data_prima_apertura}`);
      console.log(`   Open Count: ${verifyEmail[0].open_count}`);
    }

    // Pulisci i dati test
    await dbPool.query('DELETE FROM email_open_tracking WHERE ip_address = ?', [ip]);
    await dbPool.query('UPDATE email_inviate SET aperta = 0, data_prima_apertura = NULL, open_count = 0 WHERE tracking_id = ?', [trackingId]);

    console.log('🧹 Dati test ripristinati');

  } catch (error) {
    console.error('❌ Errore test endpoint:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEndpointDirect();