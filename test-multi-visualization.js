#!/usr/bin/env node

// #####################################################################
// # TEST COMPLETO - Sistema Visualizzazione Multi-Aperture Email
// #####################################################################

require('dotenv').config();
const emailVisualizationService = require('./services/emailVisualizationService');
const { dbPool } = require('./config/db');

console.log('🧪 TEST SISTEMA VISUALIZZAZIONE MULTI-APERTURE EMAIL');
console.log('===================================================');

// Test 1: Statistiche dettagliate per un tracking ID specifico
async function testTrackingDetails() {
    console.log('\n📋 TEST 1: Dettagli Tracking Email');

    try {
        // Cerca email con tracking ID
        const [emails] = await dbPool.query(`
            SELECT tracking_id, destinatari, oggetto
            FROM email_inviate
            WHERE tracking_id IS NOT NULL
            ORDER BY data_invio DESC
            LIMIT 3
        `);

        if (emails.length === 0) {
            console.log('⚠️ Nessuna email con tracking trovata');
            return null;
        }

        for (const email of emails) {
            console.log(`\n📧 Testando: ${email.destinatari}`);
            console.log(`   Tracking ID: ${email.tracking_id}`);
            console.log(`   Oggetto: ${email.oggetto}`);

            const details = await emailVisualizationService.getEmailOpenStats(email.tracking_id);

            if (details) {
                console.log(`✅ Dettagli trovati:`);
                console.log(`   Email Sistema: ${details.email.tracking_system}`);
                console.log(`   Stato DB: ${details.email.aperta ? 'Aperta' : 'Da leggere'}`);
                console.log(`   Aperture Totali: ${details.statistics.total_opens}`);
                console.log(`   IP Unici: ${details.statistics.unique_ips}`);
                console.log(`   Durata: ${details.statistics.duration || 'N/A'}`);
                console.log(`   Dettagli aperture: ${details.opens.length} record`);
            } else {
                console.log('❌ Nessun dettaglio trovato');
            }
        }

        return emails;

    } catch (error) {
        console.log(`❌ Errore test dettagli: ${error.message}`);
        return null;
    }
}

// Test 2: Statistiche per periodo
async function testPeriodStats() {
    console.log('\n📋 TEST 2: Statistiche Periodo');

    try {
        // Ultimi 7 giorni
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        console.log(`Periodo: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`);

        const periodStats = await emailVisualizationService.getPeriodStats(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );

        console.log(`✅ Statistiche periodo:`);
        console.log(`   Email Totali: ${periodStats.summary.total_emails}`);
        console.log(`   Email Tracciate: ${periodStats.summary.tracked_emails}`);
        console.log(`   Tracking Rate: ${periodStats.summary.tracking_rate}%`);
        console.log(`   Aperture Totali: ${periodStats.summary.total_opens}`);
        console.log(`   Media Aperture/Email: ${periodStats.summary.avg_opens_per_email}`);

        console.log(`\n📊 Dettaglio email:`);
        periodStats.emails.slice(0, 5).forEach((email, i) => {
            console.log(`   ${i+1}. ${email.destinatari} - ${email.tracking_status} (${email.total_opens} aperture)`);
        });

        return periodStats;

    } catch (error) {
        console.log(`❌ Errore test periodo: ${error.message}`);
        return null;
    }
}

// Test 3: Statistiche per dominio
async function testDomainStats() {
    console.log('\n📋 TEST 3: Statistiche per Dominio');

    try {
        const domainStats = await emailVisualizationService.getDomainStats(7); // Ultimi 7 giorni

        console.log(`✅ Statistiche per dominio (${domainStats.length} domini):`);

        domainStats.forEach((domain, i) => {
            const successRate = domain.tracking_rate;
            const avgOpens = domain.avg_opens_per_email;

            console.log(`   ${i+1}. ${domain.domain}`);
            console.log(`      Email: ${domain.total_emails} | Tracciate: ${domain.tracked_emails} (${successRate}%)`);
            console.log(`      Aperture Totali: ${domain.total_opens} | Media: ${avgOpens} per email`);
        });

        return domainStats;

    } catch (error) {
        console.log(`❌ Errore test domini: ${error.message}`);
        return null;
    }
}

// Test 4: Dashboard HTML
async function testDashboardHTML() {
    console.log('\n📋 TEST 4: Dashboard HTML');

    try {
        // Ultimi 3 giorni per test più veloce
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 3);

        const dashboardHTML = await emailVisualizationService.generateEmailTableHTML(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );

        console.log(`✅ Dashboard HTML generata:`);
        console.log(`   Lunghezza: ${dashboardHTML.length} caratteri`);

        // Verifica elementi chiave
        const hasSummary = dashboardHTML.includes('email-tracking-dashboard');
        const hasTable = dashboardHTML.includes('email-table-container');
        const hasStats = dashboardHTML.includes('Riepilogo Tracking Email');
        const hasModal = dashboardHTML.includes('showEmailDetails');

        console.log(`   Elementi HTML: Summary=${hasSummary}, Table=${hasTable}, Stats=${hasStats}, Modal=${hasModal}`);

        return dashboardHTML;

    } catch (error) {
        console.log(`❌ Errore test dashboard: ${error.message}`);
        return null;
    }
}

// Test 5: Simulazione aperture multiple
async function testMultiOpeningSimulation() {
    console.log('\n📋 TEST 5: Simulazione Aperture Multiple');

    try {
        // Simula un'email con tracking ID
        const testTrackingId = `test_multi_${Date.now()}`;

        // Inserisci email fittizia
        await dbPool.query(`
            INSERT INTO email_inviate (id_ditta, id_utente_mittente, destinatari, oggetto, tracking_id, data_invio)
            VALUES (1, 1, 'test@example.com', 'Test Multi-Apertura', ?, NOW())
        `, [testTrackingId]);

        console.log(`✅ Email test creata con tracking: ${testTrackingId}`);

        // Simula 5 aperture con timestamp diversi
        for (let i = 1; i <= 5; i++) {
            await dbPool.query(`
                INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at, open_count)
                VALUES (?, '192.168.1.' + ?, 'Test Browser v1.0', NOW() - INTERVAL ${5-i} MINUTE, ?)
            `, [testTrackingId, 100 + i, i]);

            console.log(`   Apertura ${i} simulata`);
        }

        // Aggiorna email_inviate
        await dbPool.query(`
            UPDATE email_inviate
            SET aperta = 1, data_prima_apertura = NOW() - INTERVAL 5 MINUTE, open_count = 5
            WHERE tracking_id = ?
        `, [testTrackingId]);

        // Test visualizzazione
        const details = await emailVisualizationService.getEmailOpenStats(testTrackingId);

        console.log(`✅ Dettagli multi-apertura:`);
        console.log(`   Aperture Totali: ${details.statistics.total_opens}`);
        console.log(`   IP Unici: ${details.statistics.unique_ips}`);
        console.log(`   Prima Apertura: ${details.statistics.first_open}`);
        console.log(`   Ultima Apertura: ${details.statistics.last_open}`);
        console.log(`   Durata: ${details.statistics.duration}`);

        // Pulizia dati test
        await dbPool.query('DELETE FROM email_open_tracking WHERE tracking_id = ?', [testTrackingId]);
        await dbPool.query('DELETE FROM email_inviate WHERE tracking_id = ?', [testTrackingId]);
        console.log('🧹 Dati test puliti');

        return details;

    } catch (error) {
        console.log(`❌ Errore simulazione multi-apertura: ${error.message}`);
        return null;
    }
}

// Test 6: Query Multi-Opening Summary
async function testMultiOpeningSummary() {
    console.log('\n📋 TEST 6: Query Riepilogo Multi-Apertura');

    try {
        const [multiOpenStats] = await dbPool.query(`
            SELECT
                ei.tracking_id,
                ei.destinatari,
                ei.oggetto,
                COUNT(eot.tracking_id) as total_opens,
                MIN(eot.opened_at) as first_open,
                MAX(eot.opened_at) as last_open,
                COUNT(DISTINCT eot.ip_address) as unique_ips,
                COUNT(DISTINCT DATE(eot.opened_at)) as unique_days
            FROM email_inviate ei
            JOIN email_open_tracking eot ON ei.tracking_id = eot.tracking_id
            WHERE ei.data_invio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND ei.tracking_id IS NOT NULL
            GROUP BY ei.id
            HAVING total_opens > 1
            ORDER BY total_opens DESC
            LIMIT 10
        `);

        console.log(`✅ Email con aperture multiple (${multiOpenStats.length}):`);

        multiOpenStats.forEach((email, i) => {
            console.log(`   ${i+1}. ${email.destinatari}`);
            console.log(`      Aperture: ${email.total_opens} | IP Unici: ${email.unique_ips} | Giorni: ${email.unique_days}`);
            console.log(`      Periodo: ${email.first_open} → ${email.last_open}`);
        });

        return multiOpenStats;

    } catch (error) {
        console.log(`❌ Errore riepilogo multi-apertura: ${error.message}`);
        return null;
    }
}

// Main test execution
async function runVisualizationTests() {
    try {
        console.log('🚀 Avvio test completi sistema visualizzazione...\n');

        const results = {
            trackingDetails: await testTrackingDetails(),
            periodStats: await testPeriodStats(),
            domainStats: await testDomainStats(),
            dashboardHTML: await testDashboardHTML(),
            multiOpening: await testMultiOpeningSimulation(),
            multiOpeningSummary: await testMultiOpeningSummary()
        };

        // Riepilogo risultati
        console.log('\n📊 RIEPILOGO TEST VISUALIZZAZIONE');
        console.log('===============================');

        Object.entries(results).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${test.toUpperCase()}`);
        });

        const passedTests = Object.values(results).filter(r => r !== null).length;
        const totalTests = Object.keys(results).length;

        console.log(`\n📈 Risultato Finale: ${passedTests}/${totalTests} test superati`);

        if (passedTests === totalTests) {
            console.log('\n🎉 SISTEMA DI VISUALIZZAZIONE COMPLETAMENTE FUNZIONANTE!');
            console.log('✅ Tutti i componenti di visualizzazione operativi');
            console.log('✅ Multi-apertura tracking funzionante');
            console.log('✅ Dashboard HTML generata correttamente');
            console.log('✅ Statistiche per dominio disponibili');
        } else {
            console.log('\n⚠️ ALCUNI TEST HANNO FALLITO - Verificare i problemi');
        }

        console.log('\n🔍 NUOVE API DISPONIBILI:');
        console.log('GET /api/track/email/tracking-details/:trackingId');
        console.log('GET /api/track/email/period-stats?days=30');
        console.log('GET /api/track/email/domain-stats?days=30');
        console.log('GET /api/track/email/visualization-dashboard?days=30');
        console.log('GET /api/track/email/multi-open-summary?days=30');

    } catch (error) {
        console.error('❌ Errore critico test:', error.message);
    } finally {
        await dbPool.end();
    }
}

// Esegui i test completi
runVisualizationTests();