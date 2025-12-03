#!/usr/bin/env node

// #####################################################################
// # Trova il tuo IP locale per configurazione Opero
// #####################################################################

const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const ips = [];

    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Interfaccia IPv4 che non è loopback e non è interna
            if (interface.family === 'IPv4' && !interface.internal) {
                ips.push({
                    name: name,
                    ip: interface.address,
                    mac: interface.mac
                });
            }
        }
    }

    return ips;
}

console.log('🌐 RILEVAZIONE IP LOCALI');
console.log('=======================');

const localIPs = getLocalIP();

if (localIPs.length === 0) {
    console.log('❌ Nessun IP locale trovato');
} else {
    console.log('📡 IP trovati:');
    localIPs.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: ${item.ip}`);
        console.log(`   MAC: ${item.mac}`);
        console.log('');
    });

    console.log('🔧 CONFIGURAZIONE SUGGERITA:');
    console.log(`PUBLIC_API_URL=http://${localIPs[0].ip}:3001`);

    console.log('\n📝 NOTE:');
    console.log('- Questo funziona solo nella tua rete locale');
    console.log('- I destinatari devono essere nella stessa rete');
    console.log('- Per test esterni, usa una delle opzioni seguenti');
}

console.log('\n🌍 OPZIONI PER ACCESSO ESTERNO:');
console.log('1. Port Forwarding sul router');
console.log('2. Cloudflare Tunnel (gratuito)');
console.log('3. LocalXpose (alternativa a ngrok)');
console.log('4. Serveo (gratuito)');