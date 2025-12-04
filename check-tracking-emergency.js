const { dbPool } = require('./config/db');
require('dotenv').config();

async function checkTrackingEmergency() {
  try {
    console.log('🚨 EMERGENZA - CONTROLLO TRACKING ARUBA');
    console.log('========================================');

    // Email inviate negli ultimi 30 minuti
    const [recentEmails] = await dbPool.query(`
      SELECT
        id,
        destinatari,
        oggetto,
        aperta,
        data_prima_apertura,
        tracking_id,
        open_count,
        data_invio
      FROM email_inviate
      WHERE tracking_id IS NOT NULL
        AND data_invio >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
      ORDER BY data_invio DESC
      LIMIT 10
    `);

    console.log(`📧 Email inviate ultime 30 minuti: ${recentEmails.length}`);

    if (recentEmails.length === 0) {
      console.log('⚠️ Nessuna email inviata di recente per testare');
      return;
    }

    recentEmails.forEach((email, i) => {
      const domain = email.destinatari.split('@')[1];
      console.log(`
${i+1}. ID: ${email.id}
   Destinatario: ${email.destinatari}
   Dominio: ${domain}
   Tracking ID: ${email.tracking_id}
   Stato DB: ${email.aperta ? '✅ Aperta' : '❌ Da leggere'}
   Inviata: ${email.data_invio}
      `);
    });

    // Controlla tracking records
    const trackingIds = recentEmails.map(e => e.tracking_id);

    if (trackingIds.length > 0) {
      const [trackingRecords] = await dbPool.query(`
        SELECT tracking_id, COUNT(*) as open_count, MAX(opened_at) as last_opened
        FROM email_open_tracking
        WHERE tracking_id IN (${trackingIds.map(() => '?').join(',')})
        GROUP BY tracking_id
      `, trackingIds);

      console.log(`\n🔍 Record tracking trovati: ${trackingRecords.length}`);

      trackingRecords.forEach((record, i) => {
        console.log(`  ${i+1}. Tracking: ${record.tracking_id} -> ${record.open_count} aperture (${record.last_opened})`);
      });

      // Analisi critica
      console.log('\n🚨 ANALISI CRITICA:');
      const trackedEmails = recentEmails.filter(e =>
        trackingRecords.some(r => r.tracking_id === e.tracking_id)
      );

      console.log(`Email con tracking funzionante: ${trackedEmails.length}/${recentEmails.length}`);

      if (trackedEmails.length === 0) {
        console.log('\n❌ ERRORE CRITICO: NESSUN EMAIL HA TRACKING!');
        console.log('Il tracking è completamente interrotto');

        // Test endpoint diretto
        console.log('\n🔧 TEST ENDPOINT TRACKING:');
        const testTrackingId = recentEmails[0].tracking_id;
        console.log(`Test con tracking ID: ${testTrackingId}`);

        try {
          const axios = require('axios');
          const testUrl = `http://localhost:3001/api/track/open/${testTrackingId}`;
          console.log(`URL: ${testUrl}`);

          const response = await axios.get(testUrl);
          console.log(`✅ Endpoint risponde: ${response.status}`);
        } catch (err) {
          console.log(`❌ Endpoint error: ${err.message}`);
          console.log(`Status: ${err.response?.status || 'No status'}`);
        }

      } else {
        console.log('\n✅ Alcuni tracking funzionano, problemi parziali');
      }
    }

  } catch (error) {
    console.error('❌ Errore critico:', error.message);
  }
}

checkTrackingEmergency();