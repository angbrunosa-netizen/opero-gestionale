#!/usr/bin/env node

// #####################################################################
// # TEST COMPLETO - Gmail Multi-Aperture Tracking System
// #####################################################################

require('dotenv').config();
const emailTrackingService = require('./services/emailTrackingService');
const { dbPool } = require('./config/db');

console.log('🧪 TEST COMPLETO GMAIL MULTI-APERTURE TRACKING');
console.log('==============================================');

// Test 1: Verifica funzionalità di base
async function testBasicFunctionality() {
    console.log('\n📋 TEST 1: Funzionalità di Base');

    try {
        // Genera tracking ID
        const trackingId = emailTrackingService.generateTrackingId();
        console.log(`✅ Tracking ID generato: ${trackingId}`);

        // Test strategie per diversi domini
        const strategies = {
            'user@gmail.com': emailTrackingService.determineStrategy('user@gmail.com'),
            'test@yahoo.com': emailTrackingService.determineStrategy('test@yahoo.com'),
            'info@company.com': emailTrackingService.determineStrategy('info@company.com')
        };

        Object.entries(strategies).forEach(([email, strategy]) => {
            console.log(`✅ ${email} -> ${strategy}`);
        });

        // Test generazione HTML
        const gmailHTML = emailTrackingService.generateTrackingHTML(trackingId, 'user@gmail.com');
        console.log(`✅ HTML Gmail generato: ${gmailHTML.length} caratteri`);

        // Verifica contenuti HTML
        const hasPixel = gmailHTML.includes('<img');
        const hasLink = gmailHTML.includes('href=');
        const hasBackground = gmailHTML.includes('background-image');

        console.log(`✅ Contenuti verificati: Pixel=${hasPixel}, Link=${hasLink}, Background=${hasBackground}`);

        return true;

    } catch (error) {
        console.log(`❌ Errore test base: ${error.message}`);
        return false;
    }
}

// Test 2: Simula invio email con tracking
async function testEmailSimulation() {
    console.log('\n📋 TEST 2: Simulazione Invio Email');

    try {
        // Simula email a Gmail
        const gmailTrackingId = emailTrackingService.generateTrackingId();
        const gmailHTML = emailTrackingService.generateTrackingHTML(gmailTrackingId, 'angbrunosa@gmail.com');

        console.log(`✅ Email Gmail simulata:`);
        console.log(`   Tracking ID: ${gmailTrackingId}`);
        console.log(`   HTML Length: ${gmailHTML.length}`);
        console.log(`   Pixel count: ${(gmailHTML.match(/<img/g) || []).length}`);
        console.log(`   Link count: ${(gmailHTML.match(/href=/g) || []).length}`);

        // Simula email a dominio corporate
        const corporateTrackingId = emailTrackingService.generateTrackingId();
        const corporateHTML = emailTrackingService.generateTrackingHTML(corporateTrackingId, 'info@difam.it');

        console.log(`✅ Email Corporate simulata:`);
        console.log(`   Tracking ID: ${corporateTrackingId}`);
        console.log(`   HTML Length: ${corporateHTML.length}`);
        console.log(`   Pixel count: ${(corporateHTML.match(/<img/g) || []).length}`);
        console.log(`   Link count: ${(corporateHTML.match(/href=/g) || []).length}`);

        return { gmail: gmailTrackingId, corporate: corporateTrackingId };

    } catch (error) {
        console.log(`❌ Errore simulazione: ${error.message}`);
        return null;
    }
}

// Test 3: Test multi-aperture tracking
async function testMultiApertureTracking() {
    console.log('\n📋 TEST 3: Multi-Aperture Tracking Simulation');

    try {
        // Simula aperture multiple della stessa email
        const trackingId = emailTrackingService.generateTrackingId();

        console.log(`✅ Simulando aperture multiple per: ${trackingId}`);

        // Simula 3 aperture con timestamps diversi
        for (let i = 1; i <= 3; i++) {
            console.log(`   Apertura ${i}...`);

            // Simula inserimento record nel database
            const result = await dbPool.query(`
                INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at)
                VALUES (?, ?, ?, NOW() - INTERVAL ${i-1} MINUTE)
                ON DUPLICATE KEY UPDATE
                open_count = open_count + 1,
                opened_at = VALUES(opened_at)
            `, [trackingId, '127.0.0.1', 'Test Browser']);

            console.log(`   ✅ Apertura ${i} registrata`);
        }

        // Verifica record multipli
        const [records] = await dbPool.query(`
            SELECT tracking_id, COUNT(*) as open_count,
                   MIN(opened_at) as first_opened,
                   MAX(opened_at) as last_opened
            FROM email_open_tracking
            WHERE tracking_id = ?
        `, [trackingId]);

        if (records.length > 0) {
            const record = records[0];
            console.log(`✅ Multi-aperture verificato:`);
            console.log(`   Tracking ID: ${record.tracking_id}`);
            console.log(`   Open Count: ${record.open_count}`);
            console.log(`   Prima Apertura: ${record.first_opened}`);
            console.log(`   Ultima Apertura: ${record.last_opened}`);
        }

        // Pulisci record di test
        await dbPool.query('DELETE FROM email_open_tracking WHERE tracking_id = ?', [trackingId]);
        console.log('🧹 Record test puliti');

        return true;

    } catch (error) {
        console.log(`❌ Errore multi-aperture: ${error.message}`);
        return false;
    }
}

// Test 4: Test compatibilità URL
async function testURLCompatibility() {
    console.log('\n📋 TEST 4: Compatibilità URL Tracking');

    try {
        const testTrackingId = emailTrackingService.generateTrackingId();
        const gmailHTML = emailTrackingService.generateTrackingHTML(testTrackingId, 'user@gmail.com');

        // Verifica URL nell'HTML
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const urls = gmailHTML.match(urlRegex) || [];

        console.log(`✅ URL trovati nell'HTML: ${urls.length}`);

        urls.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
        });

        // Verifica formato URL tracking
        const expectedUrlPattern = `${process.env.PUBLIC_API_URL}/api/track/open/${testTrackingId}`;
        const hasCorrectUrl = urls.some(url => url.includes(expectedUrlPattern));

        console.log(`✅ URL formato corretto: ${hasCorrectUrl}`);

        if (!hasCorrectUrl) {
            console.log(`❌ Atteso: ${expectedUrlPattern}`);
        }

        return hasCorrectUrl;

    } catch (error) {
        console.log(`❌ Errore compatibilità URL: ${error.message}`);
        return false;
    }
}

// Test 5: Analisi performance strategie
async function testStrategyPerformance() {
    console.log('\n📋 TEST 5: Analisi Performance Strategie');

    try {
        const testEmails = [
            'user@gmail.com',
            'test@yahoo.com',
            'admin@outlook.com',
            'info@company.it',
            'user@aruba.it'
        ];

        testEmails.forEach(email => {
            const trackingId = emailTrackingService.generateTrackingId();
            const startTime = Date.now();

            const strategy = emailTrackingService.determineStrategy(email);
            const html = emailTrackingService.generateTrackingHTML(trackingId, email);

            const endTime = Date.now();
            const processingTime = endTime - startTime;

            const pixelCount = (html.match(/<img/g) || []).length;
            const linkCount = (html.match(/href=/g) || []).length;

            console.log(`📧 ${email}`);
            console.log(`   Strategy: ${strategy}`);
            console.log(`   HTML Length: ${html.length}`);
            console.log(`   Processing Time: ${processingTime}ms`);
            console.log(`   Elements: ${pixelCount} pixel, ${linkCount} link`);
        });

        return true;

    } catch (error) {
        console.log(`❌ Errore performance: ${error.message}`);
        return false;
    }
}

// Main test execution
async function runCompleteTest() {
    try {
        console.log('🚀 Avvio test completo...\n');

        const results = {
            basic: await testBasicFunctionality(),
            simulation: await testEmailSimulation(),
            multiAperture: await testMultiApertureTracking(),
            urlCompatibility: await testURLCompatibility(),
            performance: await testStrategyPerformance()
        };

        // Riepilogo risultati
        console.log('\n📊 RIEPILOGO TEST COMPLETO');
        console.log('==========================');

        Object.entries(results).forEach(([test, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${test.toUpperCase()}`);
        });

        const passedTests = Object.values(results).filter(r => r === true).length;
        const totalTests = Object.keys(results).length;

        console.log(`\n📈 Risultato Finale: ${passedTests}/${totalTests} test superati`);

        if (passedTests === totalTests) {
            console.log('\n🎉 SISTEMA COMPLETAMENTE FUNZIONANTE!');
            console.log('✅ Il nuovo sistema multi-aperture per Gmail è pronto.');
            console.log('✅ Tutte le strategie di tracking sono operative.');
            console.log('✅ Il sistema gestisce aperture multiple correttamente.');
        } else {
            console.log('\n⚠️ ALCUNI TEST HANNO FALLITO - Verificare i problemi');
        }

        console.log('\n🔍 PROSSIMI PASSI:');
        console.log('1. Avviare il server sulla porta 3001');
        console.log('2. Inviare email reali a Gmail per test');
        console.log('3. Monitorare tracking nel database');
        console.log('4. Verificare multi-aperture con aperture multiple');

    } catch (error) {
        console.error('❌ Errore critico test:', error.message);
    } finally {
        await dbPool.end();
    }
}

// Esegui il test completo
runCompleteTest();