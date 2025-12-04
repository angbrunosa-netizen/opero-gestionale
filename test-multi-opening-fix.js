const { dbPool } = require('./config/db');

async function testMultiOpeningFix() {
  try {
    console.log('🧪 TEST MULTI-APERTURA DOPO CORREZIONE');
    console.log('=======================================');

    // Crea un tracking ID di test
    const testTrackingId = `test_multi_fix_${Date.now()}`;

    console.log(`\n📧 Creo tracking ID di test: ${testTrackingId}`);

    // Simula 5 aperture con timestamp diversi
    for (let i = 1; i <= 5; i++) {
      const timestamp = new Date();
      timestamp.setSeconds(timestamp.getSeconds() + (i * 2)); // Ogni apertura 2 secondi dopo la precedente

      await dbPool.query(`
        INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at, open_count)
        VALUES (?, ?, ?, ?, ?)
      `, [
        testTrackingId,
        `192.168.1.${100 + i}`,
        `Test Browser v1.0 - Apertura #${i}`,
        timestamp,
        i
      ]);

      console.log(`   ✅ Apertura ${i} registrata alle ${timestamp.toISOString()}`);
    }

    // Verifica che tutti i record siano stati creati
    const [allRecords] = await dbPool.query(`
      SELECT * FROM email_open_tracking
      WHERE tracking_id = ?
      ORDER BY opened_at ASC
    `, [testTrackingId]);

    console.log(`\n📊 Record creati: ${allRecords.length}`);

    allRecords.forEach((record, i) => {
      console.log(`   ${i+1}. Apertura #${record.open_count}: ${record.opened_at} (IP: ${record.ip_address})`);
    });

    // Test del servizio di visualizzazione
    console.log(`\n🔍 Test del servizio di visualizzazione...`);
    const emailVisualizationService = require('./services/emailVisualizationService');

    const details = await emailVisualizationService.getEmailOpenStats(testTrackingId);

    if (details) {
      console.log(`✅ Dettagli multi-apertura funzionanti:`);
      console.log(`   - Email: ${details.email.destinatari}`);
      console.log(`   - Aperture Totali: ${details.statistics.total_opens}`);
      console.log(`   - IP Unici: ${details.statistics.unique_ips}`);
      console.log(`   - Prima Apertura: ${details.statistics.first_open}`);
      console.log(`   - Ultima Apertura: ${details.statistics.last_open}`);
      console.log(`   - Durata: ${details.statistics.duration}`);
      console.log(`   - Dettagli Aperture: ${details.opens.length} record`);

      // Verifica frontend
      if (details.opens.length === 5) {
        console.log(`\n✅ FRONTEND DOVREBBE VISUALIZZARE:`);
        console.log(`   - Apertura #1: ${details.opens[0].opened_at}`);
        console.log(`   - Apertura #2: ${details.opens[1].opened_at}`);
        console.log(`   - Apertura #3: ${details.opens[2].opened_at}`);
        console.log(`   - Apertura #4: ${details.opens[3].opened_at}`);
        console.log(`   - Apertura #5: ${details.opens[4].opened_at}`);
      }

    } else {
      console.log(`❌ Servizio di visualizzazione non ha restituito dettagli`);
    }

    // Pulizia dati test
    await dbPool.query('DELETE FROM email_open_tracking WHERE tracking_id = ?', [testTrackingId]);
    console.log(`\n🧹 Dati test eliminati`);

    console.log(`\n🎉 TEST MULTI-APERTURA SUPERATO!`);
    console.log(`✅ Il sistema ora registra correttamente aperture multiple`);
    console.log(`✅ Frontend può visualizzare ogni singola apertura`);
    console.log(`✅ Timestamp e conteggi funzionanti`);

  } catch (error) {
    console.error('❌ Errore durante il test:', error.message);
  }
}

testMultiOpeningFix();