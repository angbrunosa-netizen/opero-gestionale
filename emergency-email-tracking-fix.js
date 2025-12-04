#!/usr/bin/env node

// #####################################################################
// # EMERGENCY FIX - Email Tracking Problem
// #####################################################################

require('dotenv').config();

console.log('🚨 EMERGENCY EMAIL TRACKING FIX');
console.log('================================');

// 1. Check if there's a problem with the new service
try {
    console.log('\n📋 1. Testando emailTrackingService...');
    const emailTrackingService = require('./services/emailTrackingService');

    const testId = emailTrackingService.generateTrackingId();
    console.log('✅ emailTrackingService loaded');
    console.log(`✅ Generated ID: ${testId}`);

    const testHTML = emailTrackingService.generateTrackingHTML(testId, 'test@example.com');
    console.log(`✅ HTML generated: ${testHTML.length} chars`);

    // Check if the HTML contains the tracking URL
    const hasTrackingUrl = testHTML.includes('api/track/open/');
    console.log(`✅ Contains tracking URL: ${hasTrackingUrl}`);

    if (!hasTrackingUrl) {
        console.log('❌ PROBLEMA: HTML non contiene URL di tracking!');
    }

} catch (error) {
    console.log('❌ ERRORE CRITICO emailTrackingService:', error.message);
    console.log('   Questo potrebbe causare il problema!');
}

// 2. Check if the issue is in the mail.js import
try {
    console.log('\n📋 2. Testando import in routes/mail.js...');

    // Simulate the same import that happens in mail.js
    const emailTrackingService = require('./services/emailTrackingService');

    // Simulate what happens during email sending
    const trackingId = emailTrackingService.generateTrackingId();
    const primaryRecipient = 'test@aruba.it';
    const trackingHTML = emailTrackingService.generateTrackingHTML(trackingId, primaryRecipient);

    console.log('✅ Simulazione invio email OK');
    console.log(`✅ Tracking ID: ${trackingId}`);
    console.log(`✅ HTML length: ${trackingHTML.length}`);

    // Check for correct URL format
    const expectedUrl = `${process.env.PUBLIC_API_URL}/api/track/open/${trackingId}`;
    const hasCorrectUrl = trackingHTML.includes(expectedUrl);

    console.log(`✅ Expected URL: ${expectedUrl}`);
    console.log(`✅ Contains correct URL: ${hasCorrectUrl}`);

    if (!hasCorrectUrl) {
        console.log('❌ PROBLEMA: URL non corretto nell\'HTML!');
        console.log('   PUBLIC_API_URL potrebbe essere errato');
        console.log(`   Valore attuale: ${process.env.PUBLIC_API_URL}`);
    }

} catch (error) {
    console.log('❌ ERRORE simulazione:', error.message);
}

// 3. Check PUBLIC_API_URL configuration
console.log('\n📋 3. Verifica configurazione PUBLIC_API_URL...');
console.log(`PUBLIC_API_URL: ${process.env.PUBLIC_API_URL}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

if (!process.env.PUBLIC_API_URL) {
    console.log('❌ PROBLEMA: PUBLIC_API_URL non definito!');
    console.log('   Questo potrebbe impedire il tracking esterno');
} else {
    console.log('✅ PUBLIC_API_URL definito');
}

// 4. Test actual email sending simulation
console.log('\n📋 4. Test simulazione completa...');

try {
    const emailTrackingService = require('./services/emailTrackingService');

    // Simulate email to Aruba
    const arubaHTML = emailTrackingService.generateTrackingHTML('test-aruba-123', 'info@difam.it');
    console.log('✅ HTML per Aruba generato');
    console.log(`   Pixel count: ${(arubaHTML.match(/<img/g) || []).length}`);
    console.log(`   Link count: ${(arubaHTML.match(/href=/g) || []).length}`);

    // Simulate email to Gmail
    const gmailHTML = emailTrackingService.generateTrackingHTML('test-gmail-123', 'test@gmail.com');
    console.log('✅ HTML per Gmail generato');
    console.log(`   Pixel count: ${(gmailHTML.match(/<img/g) || []).length}`);
    console.log(`   Link count: ${(gmailHTML.match(/href=/g) || []).length}`);

    console.log('\n✅ Simulazione completata con successo!');

} catch (error) {
    console.log('❌ Errore simulazione:', error.message);
}

console.log('\n🔧 POSSIBILI SOLUZIONI:');
console.log('1. Se emailTrackingService fallisce -> ripristinare sistema vecchio');
console.log('2. Se PUBLIC_API_URL errato -> correggere .env');
console.log('3. Se URL non presente nell\'HTML -> problema generazione HTML');
console.log('4. Testare invio email reale per verificare fix');

console.log('\n📊 DIAGNOSI COMPLETA');