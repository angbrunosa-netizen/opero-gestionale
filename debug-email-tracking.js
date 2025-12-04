#!/usr/bin/env node

// #####################################################################
// # Debug Email Tracking - Test Tracking Pixel
// #####################################################################

require('dotenv').config();

const { dbPool } = require('./config/db');
const crypto = require('crypto');

console.log('🔍 DEBUG EMAIL TRACKING');
console.log('========================');

async function testEmailTracking() {
    try {
        console.log('\n📋 CONFIGURAZIONE ATTUALE:');
        console.log(`PUBLIC_API_URL: ${process.env.PUBLIC_API_URL}`);

        // 1. Genera un tracking ID test
        const testTrackingId = 'test-tracking-' + Date.now();
        console.log(`\n🎯 Tracking ID Test: ${testTrackingId}`);

        // 2. Inserisci email test nel database
        console.log('\n💾 1. Inserimento email test nel database...');
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [emailResult] = await connection.query(`
            INSERT INTO email_inviate (
                id_ditta, id_utente_mittente, destinatari,
                oggetto, corpo, tracking_id, aperta, open_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [1, 1, 'test@example.com', 'Test Email Tracking',
           '<p>Test email content</p>', testTrackingId, 0, 0]);

        const emailId = emailResult.insertId;
        console.log(`✅ Email inserita con ID: ${emailId}`);

        await connection.commit();
        connection.release();

        // 3. Genera URL tracking pixel
        const trackingPixelUrl = `${process.env.PUBLIC_API_URL}/api/track/open/${testTrackingId}`;
        console.log(`\n🔗 URL Tracking Pixel: ${trackingPixelUrl}`);

        // 4. Simula chiamata tracking
        console.log('\n📡 4. Simulazione chiamata tracking...');
        try {
            const mockRequest = {
                params: { trackingId: testTrackingId },
                get: (header) => header === 'User-Agent' ? 'Mozilla/5.0 Test Browser' : null,
                ip: () => '192.168.1.100'
            };

            // Simula la chiamata al tracking endpoint
            console.log('   Simulando GET /api/track/open/' + testTrackingId);

            // Inserimento tracking apertura
            await dbPool.query(`
                INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE opened_at = IF(opened_at IS NULL, NOW(), opened_at), open_count = open_count + 1
            `, [testTrackingId, mockRequest.ip(), mockRequest.get()]);

            // Aggiorna stato email inviata
            const [updateResult] = await dbPool.query(`
                UPDATE email_inviate
                SET aperta = 1, data_prima_apertura = IF(data_prima_apertura IS NULL, NOW(), data_prima_apertura), open_count = COALESCE(open_count, 0) + 1
                WHERE tracking_id = ?
            `, [testTrackingId]);

            console.log(`✅ Email aggiornata: ${updateResult.affectedRows} righe modificate`);

        } catch (trackingError) {
            console.error('❌ Errore durante tracking:', trackingError.message);
        }

        // 5. Verifica risultati nel database
        console.log('\n📊 5. Verifica risultati nel database...');
        const connection2 = await dbPool.getConnection();

        // Verifica stato email
        const [emailStatus] = await connection2.query(`
            SELECT id, aperta, data_prima_apertura, tracking_id, open_count
            FROM email_inviate
            WHERE tracking_id = ?
        `, [testTrackingId]);

        if (emailStatus.length > 0) {
            const email = emailStatus[0];
            console.log('✅ Stato email:');
            console.log(`   ID: ${email.id}`);
            console.log(`   Aperta: ${email.aperta ? 'Sì' : 'No'}`);
            console.log(`   Data Prima Apertura: ${email.data_prima_apertura || 'N/D'}`);
            console.log(`   Open Count: ${email.open_count}`);
            console.log(`   Tracking ID: ${email.tracking_id}`);
        }

        // Verifica tracking records
        const [trackingRecords] = await connection2.query(`
            SELECT * FROM email_open_tracking WHERE tracking_id = ?
        `, [testTrackingId]);

        console.log('\n✅ Record tracking aperture:');
        trackingRecords.forEach((record, i) => {
            console.log(`   ${i+1}. IP: ${record.ip_address}, User-Agent: ${record.user_agent}, Apertura: ${record.opened_at}`);
        });

        connection2.release();

        // 6. Test URL real accessibilità
        console.log('\n🌐 6. Test accessibilità URL tracking...');
        console.log('Per testare manualmente:');
        console.log(`1. Apri nel browser: ${trackingPixelUrl}`);
        console.log('2. Dovresti vedere un pixel trasparente 1x1');
        console.log('3. Controlla che lo stato email si aggiorni');

        // 7. Cleanup test data
        console.log('\n🧹 7. Cleanup test data...');
        const connection3 = await dbPool.getConnection();
        await connection3.query('DELETE FROM email_open_tracking WHERE tracking_id = ?', [testTrackingId]);
        await connection3.query('DELETE FROM email_inviate WHERE tracking_id = ?', [testTrackingId]);
        connection3.release();
        console.log('✅ Dati di test eliminati');

        console.log('\n📝 ANALISI DEL PROBLEMA:');
        console.log('Se le email reali rimangono "da leggere", il problema potrebbe essere:');
        console.log('1. Il tracking pixel non viene caricato dai client email');
        console.log('2. PUBLIC_API_URL errato o non accessibile esternamente');
        console.log('3. I client email bloccano il caricamento di immagini da host sconosciuti');
        console.log('4. Problemi con CORS o headers');
        console.log('5. Il tracking ID non viene salvato correttamente nel database');

        console.log('\n🔧 POSSIBILI SOLUZIONI:');
        console.log('1. Testa con client email diversi (Gmail, Outlook, Thunderbird)');
        console.log('2. Usa un URL pubblico (ngrok, Cloudflare Tunnel) per test');
        console.log('3. Aggiungi header CORS appropriati nel tracking endpoint');
        console.log('4. Implementa un fallback tracking se il pixel fallisce');

    } catch (error) {
        console.error('❌ Errore generale:', error.message);
    }
}

// Esegui test
testEmailTracking().catch(console.error);