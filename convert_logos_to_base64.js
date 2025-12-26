/**
 * Converte i loghi Opero e Abanexus in base64
 * per essere utilizzati nel PDF senza problemi CORS
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const logoUrls = {
    abanexus: 'https://cdn.operocloud.it/operogo/ditta-1;3;website;91-logo-abanexus_1764792689186_d20699ce.png',
    opero: 'https://cdn.operocloud.it/operogo/ditta-1;3;website;75-opero.jpg'
};

function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                const ext = url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'jpeg' : 'png';
                const base64 = `data:image/${ext};base64,${buffer.toString('base64')}`;
                resolve(base64);
            });
        }).on('error', reject);
    });
}

async function convertLogos() {
    console.log('🔄 Download dei loghi in corso...\n');

    try {
        const [abanexusBase64, operoBase64] = await Promise.all([
            downloadImage(logoUrls.abanexus),
            downloadImage(logoUrls.opero)
        ]);

        console.log('✅ Loghi scaricati con successo!\n');
        console.log('📝 Copia questi valori nel tuo codice:\n');
        console.log('====================================\n');

        console.log('// Logo Abanexus:');
        console.log(`const abanexusLogoBase64 = "${abanexusBase64.substring(0, 50)}...";`);
        console.log(`// Lunghezza completa: ${abanexusBase64.length} caratteri\n`);

        console.log('// Logo Opero:');
        console.log(`const operoLogoBase64 = "${operoBase64.substring(0, 50)}...";`);
        console.log(`// Lunghezza completa: ${operoBase64.length} caratteri\n`);

        console.log('====================================\n');
        console.log('💾 Salvataggio in file...');

        // Salva in un file JavaScript
        const output = `
// Loghi in base64 per PDF
// Generato automaticamente il ${new Date().toISOString()}

export const LOGOS = {
    abanexus: "${abanexusBase64}",
    opero: "${operoBase64}"
};
`;

        fs.writeFileSync(
            path.join(__dirname, 'logos_base64.js'),
            output,
            'utf8'
        );

        console.log('✅ Salvato in logos_base64.js\n');

        // Crea anche versione minimizzata da inserire nel contentGuideGenerator
        const jsOutput = `
// Inserisci queste costanti all'inizio del contentGuideGenerator.js

const LOGOS_ABANEXUS = "${abanexusBase64}";
const LOGOS_OPERO = "${operoBase64}";
`;

        fs.writeFileSync(
            path.join(__dirname, 'logos_for_generator.js'),
            jsOutput,
            'utf8'
        );

        console.log('✅ Salvato anche logos_for_generator.js');
        console.log('\n🎯 Puoi ora copiare queste costanti nel contentGuideGenerator.js!');

    } catch (error) {
        console.error('❌ Errore durante il download:', error.message);
        process.exit(1);
    }
}

convertLogos();
