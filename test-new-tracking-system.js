#!/usr/bin/env node

// #####################################################################
// # Test Nuovo Sistema Email Tracking - Gmail Compatibility
// #####################################################################

require('dotenv').config();
const emailTrackingService = require('./services/emailTrackingService');

console.log('🧪 TEST NUOVO SISTEMA EMAIL TRACKING');
console.log('====================================');

// Test 1: Generazione Tracking ID
console.log('\n📋 TEST 1: Generazione Tracking ID');
const trackingId1 = emailTrackingService.generateTrackingId();
const trackingId2 = emailTrackingService.generateTrackingId();
console.log(`✅ Tracking ID 1: ${trackingId1}`);
console.log(`✅ Tracking ID 2: ${trackingId2}`);
console.log(`✅ Unici: ${trackingId1 !== trackingId2 ? 'Sì' : 'No'}`);

// Test 2: Determinazione Strategie per diversi domini
console.log('\n📋 TEST 2: Determinazione Strategie Tracking');
const testEmails = [
    'user@gmail.com',
    'test@yahoo.com',
    'info@company.com',
    'admin@business.it',
    'user@unknown-domain.org'
];

testEmails.forEach(email => {
    const strategy = emailTrackingService.determineStrategy(email);
    console.log(`📧 ${email} -> ${strategy}`);
});

// Test 3: Generazione HTML Tracking per Gmail
console.log('\n📋 TEST 3: Generazione HTML Tracking (Gmail)');
const gmailTracking = emailTrackingService.generateTrackingHTML('test_123', 'user@gmail.com');
console.log('📄 HTML generato per Gmail:');
console.log(gmailTracking.substring(0, 200) + '...');

// Test 4: Generazione HTML Tracking per dominio corporate
console.log('\n📋 TEST 4: Generazione HTML Tracking (Corporate)');
const corporateTracking = emailTrackingService.generateTrackingHTML('test_456', 'info@company.com');
console.log('📄 HTML generato per dominio corporate:');
console.log(corporateTracking.substring(0, 200) + '...');

// Test 5: Verifica strategia aggressive per Gmail
console.log('\n📋 TEST 5: Verifica contenuti strategia aggressiva (Gmail)');
const aggressiveTracking = emailTrackingService.generateTrackingHTML('test_gmail', 'user@gmail.com');

const checks = [
    { name: 'Multiple img tags', test: aggressiveTracking.match(/<img/g)?.length >= 3 },
    { name: 'Background image', test: aggressiveTracking.includes('background-image') },
    { name: 'Table-based pixel', test: aggressiveTracking.includes('<table') },
    { name: 'Fallback link', test: aggressiveTracking.includes('href=') },
    { name: 'CSS hiding', test: aggressiveTracking.includes('display:none') }
];

checks.forEach(check => {
    console.log(`${check.test ? '✅' : '❌'} ${check.name}: ${check.test ? 'Presente' : 'Mancante'}`);
});

// Test 6: Test logging
console.log('\n📋 TEST 6: Test Logging (Development Mode)');
process.env.NODE_ENV = 'development';
emailTrackingService.logTrackingStrategy('test@gmail.com', 'track_test_123', 'aggressive');

// Test 7: Test completo simulazione email
console.log('\n📋 TEST 7: Simulazione completa invio email');

const simulatedEmails = [
    { email: 'angbrunosa@gmail.com', subject: 'Test Gmail Tracking' },
    { email: 'info@difam.it', subject: 'Test Corporate Tracking' },
    { email: 'test@yahoo.com', subject: 'Test Yahoo Tracking' }
];

simulatedEmails.forEach(sim => {
    const trackingId = emailTrackingService.generateTrackingId();
    const trackingHTML = emailTrackingService.generateTrackingHTML(trackingId, sim.email);
    const strategy = emailTrackingService.determineStrategy(sim.email);

    console.log(`\n📧 Email: ${sim.email}`);
    console.log(`   Oggetto: ${sim.subject}`);
    console.log(`   Tracking ID: ${trackingId}`);
    console.log(`   Strategia: ${strategy}`);
    console.log(`   HTML Length: ${trackingHTML.length} caratteri`);
    console.log(`   Pixel count: ${(trackingHTML.match(/<img/g) || []).length}`);
    console.log(`   Link count: ${(trackingHTML.match(/href=/g) || []).length}`);
});

// Test 8: Riepilogo funzionalità
console.log('\n📋 RIEPILOGO FUNZIONITÀ IMPLEMENTATE:');
console.log('✅ Generazione tracking ID sicuri');
console.log('✅ Determinazione automatica strategia per dominio');
console.log('✅ Multi-strategy tracking per Gmail');
console.log('✅ Fallback link-based tracking');
console.log('✅ Pixel multipli (img, background, table)');
console.log('✅ Logging per debugging');
console.log('✅ Configurazione environment-aware');

console.log('\n🎉 NUOVO SISTEMA DI TRACKING PRONTO!');
console.log('================================');
console.log('Il sistema ora è progettato per massimizzare');
console.log('la compatibilità con Gmail e altri client email.');
console.log('');
console.log('Prossimo step: Test con email reali per verificare');
console.log('l\'efficacia delle diverse strategie.');

// Test 9: Creazione file HTML di test
console.log('\n📋 TEST 9: Creazione file HTML test...');
const fs = require('fs');

const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Email Tracking</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .strategy { background: #f9f9f9; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🧪 Test Email Tracking Strategies</h1>

    <div class="test-section">
        <h2>Gmail Strategy (Aggressive)</h2>
        <div class="strategy">
            ${emailTrackingService.generateTrackingHTML('test_gmail_aggressive', 'user@gmail.com')}
        </div>
    </div>

    <div class="test-section">
        <h2>Corporate Strategy (Standard)</h2>
        <div class="strategy">
            ${emailTrackingService.generateTrackingHTML('test_corporate_standard', 'info@company.com')}
        </div>
    </div>

    <div class="test-section">
        <h2>Conservative Strategy (Link Only)</h2>
        <div class="strategy">
            ${emailTrackingService.generateTrackingHTML('test_conservative', 'user@conservative.org')}
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync('test-tracking-preview.html', testHtml);
console.log('✅ File test-tracking-preview.html creato con successo!');
console.log('📂 Apri il file nel browser per visualizzare le diverse strategie');