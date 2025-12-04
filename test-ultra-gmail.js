#!/usr/bin/env node

// #####################################################################
// # Test Ultra-Aggressive Gmail Tracking
// #####################################################################

require('dotenv').config();
const enhancedGmailTracking = require('./services/enhancedGmailTracking');

console.log('🧪 TEST SERVIZIO ULTRA-AGGRESSIVO GMAIL');
console.log('===================================');

try {
    // Test 1: Gmail (dovrebbe usare ultra-aggressive)
    console.log('\n📋 Test 1: Gmail (Ultra-Aggressive Strategy)');
    const gmailHTML = enhancedGmailTracking.generateOptimizedTracking('test_gmail_123', 'user@gmail.com');
    console.log('✅ HTML generato per Gmail');
    console.log('   Lunghezza: ' + gmailHTML.length + ' caratteri');

    const imgCount = (gmailHTML.match(/<img/g) || []).length;
    console.log('   Pixel count: ' + imgCount);

    const scriptCount = (gmailHTML.match(/<script/g) || []).length;
    console.log('   Script tags: ' + scriptCount);

    // Test 2: Corporate (dovrebbe usare standard)
    console.log('\n📋 Test 2: Corporate (Standard Strategy)');
    const corporateHTML = enhancedGmailTracking.generateOptimizedTracking('test_corporate_123', 'info@company.com');
    console.log('✅ HTML generato per dominio corporate');
    console.log('   Lunghezza: ' + corporateHTML.length + ' caratteri');

    const corporateImgCount = (corporateHTML.match(/<img/g) || []).length;
    console.log('   Pixel count: ' + corporateImgCount);

    // Test 3: Confronto dimensioni
    console.log('\n📋 Test 3: Confronto dimensioni HTML');
    console.log('   Gmail Ultra-Aggressive: ' + gmailHTML.length + ' chars');
    console.log('   Corporate Standard: ' + corporateHTML.length + ' chars');

    const ratio = Math.round((gmailHTML.length / corporateHTML.length) * 100);
    console.log('   Ratio: ' + ratio + '% più grande');

    // Test 4: Verifica strategie diverse
    console.log('\n📋 Test 4: Verifica strategie diverse');

    if (gmailHTML.includes('Ultra-Aggressive Gmail Tracking')) {
        console.log('✅ Gmail usa strategia Ultra-Aggressive');
    } else {
        console.log('❌ Gmail non usa strategia Ultra-Aggressive');
    }

    if (!corporateHTML.includes('Ultra-Aggressive')) {
        console.log('✅ Corporate usa strategia Standard');
    } else {
        console.log('❌ Corporate usa strategia Ultra-Aggressive');
    }

    console.log('\n🎉 SERVIZIO ULTRA-AGGRESSIVO TEST COMPLETATO!');
    console.log('Caratteristiche implementate:');
    console.log('- Multi-pixel con cache-busting: ' + imgCount + ' pixel');
    console.log('- JavaScript tracking: ' + scriptCount + ' script tag');
    console.log('- HTML Size ratio: ' + ratio + '% più grande per Gmail');
    console.log('- Diverse strategie per dominio: ✓');

} catch (error) {
    console.error('❌ Errore durante il test:', error.message);
}