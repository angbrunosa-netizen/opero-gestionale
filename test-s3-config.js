// Test configurazione S3 per debug upload PDF
console.log('🔍 Verifica configurazione S3...');

const awsConfig = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '***CONFIGURATO***' : 'NON CONFIGURATO',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '***CONFIGURATO***' : 'NON CONFIGURATO',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET
};

console.log('\n📋 Configurazione AWS:');
Object.entries(awsConfig).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

// Test import e inizializzazione S3 Client
try {
  const { S3Client } = require('@aws-sdk/client-s3');

  if (awsConfig.AWS_REGION && awsConfig.AWS_ACCESS_KEY_ID && awsConfig.AWS_SECRET_ACCESS_KEY && awsConfig.AWS_S3_BUCKET) {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log('\n✅ S3 Client inizializzato correttamente');
  } else {
    console.log('\n⚠️ S3 Client non inizializzato - configurazione incompleta');
  }
} catch (error) {
  console.error('\n❌ Errore importazione S3 Client:', error.message);
}

console.log('\n💡 Soluzione:');
if (!awsConfig.AWS_REGION) console.log('- Manca AWS_REGION (es. eu-west-1)');
if (!awsConfig.AWS_ACCESS_KEY_ID) console.log('- Manca AWS_ACCESS_KEY_ID');
if (!awsConfig.AWS_SECRET_ACCESS_KEY) console.log('- Manca AWS_SECRET_ACCESS_KEY');
if (!awsConfig.AWS_S3_BUCKET) console.log('- Manca AWS_S3_BUCKET');

console.log('\n🔧 Nel file .env aggiungi:');
console.log('AWS_REGION=eu-west-1');
console.log('AWS_ACCESS_KEY_ID=tua_access_key');
console.log('AWS_SECRET_ACCESS_KEY=tua_secret_key');
console.log('AWS_S3_BUCKET=nome_tuo_bucket');