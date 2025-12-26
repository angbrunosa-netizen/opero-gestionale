const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔗 Aggiornamento link social OperoCloud...\n');

// Link social OperoCloud reali
const socialLinks = {
  instagram: 'https://www.instagram.com/operocloud/',
  facebook: 'https://www.facebook.com/profile.php?id=61579972817746',
  whatsapp: '+393356738658',
  email: 'ingo@operocloud.it'
};

// ============================================================
// 1. COMMERCIAL - Aggiorna social in Home e Contatti
// ============================================================
console.log('🏪 Aggiornamento preset Commercial...');

// Home - MEDIA_SOCIAL block
content = content.replace(
  /(tipo_componente: "MEDIA_SOCIAL",\s*ordine: 7,\s*dati_config: \{\s*titolo: "Seguici sui Social",[\s\S]*?)platforms: \["facebook", "instagram", "whatsapp"\]/,
  '$1platforms: ["facebook", "instagram", "whatsapp", "telegram"],\n              customLinks: {\n                facebook: "' + socialLinks.facebook + '",\n                instagram: "' + socialLinks.instagram + '",\n                whatsapp: "' + socialLinks.whatsapp + '"\n              }'
);

// ============================================================
// 2. SERVICES - Aggiorna social in Contatti
// ============================================================
console.log('💼 Aggiornamento preset Services...');

content = content.replace(
  /(services: \{[\s\S]*?contatti: \{[\s\S]*?tipo_componente: "MEDIA_SOCIAL",[\s\S]*?)platforms: \["linkedin", "twitter", "facebook"\]/,
  '$1platforms: ["linkedin", "twitter", "facebook", "instagram"],\n              customLinks: {\n                facebook: "' + socialLinks.facebook + '",\n                instagram: "' + socialLinks.instagram + '",\n                whatsapp: "' + socialLinks.whatsapp + '"\n              }'
);

// ============================================================
// 3. RESTAURANT - Aggiorna social in Home e Prenota
// ============================================================
console.log('🍝 Aggiornamento preset Restaurant...');

// Restaurant - Home media social doesn't exist, but we add to Prenota page
content = content.replace(
  /(restaurant: \{[\s\S]*?prenota: \{[\s\S]*?tipo_componente: "MEDIA_SOCIAL",[\s\S]*?)platforms: \["instagram", "facebook", "tiktok"\]/,
  '$1platforms: ["instagram", "facebook"],\n              customLinks: {\n                facebook: "' + socialLinks.facebook + '",\n                instagram: "' + socialLinks.instagram + '"\n              }'
);

// ============================================================
// 4. CRAFTSMAN - Aggiorna social in Contatti
// ============================================================
console.log('🛠️  Aggiornamento preset Craftsman...');

content = content.replace(
  /(craftsman: \{[\s\S]*?contatti: \{[\s\S]*?tipo_componente: "MEDIA_SOCIAL",[\s\S]*?)platforms: \["instagram", "facebook", "pinterest"\]/,
  '$1platforms: ["instagram", "facebook", "pinterest"],\n              customLinks: {\n                facebook: "' + socialLinks.facebook + '",\n                instagram: "' + socialLinks.instagram + '"\n              }'
);

// ============================================================
// 5. Aggiungi blocco contatti con email in tutte le pagine contatti
// ============================================================
console.log('📧 Aggiunta email e WhatsApp nelle pagine Contatti...');

const contactHTML = `
                <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h3 style="font-size: 2rem; margin-bottom: 2rem;">📬 Contattaci Subito</h3>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Email</h4>
                      <a href="mailto:${socialLinks.email}" style="color: #fbbf24; text-decoration: none; font-weight: bold; font-size: 1.1rem;">${socialLinks.email}</a>
                      <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 0.9rem;">Rispondiamo entro 24h</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">WhatsApp</h4>
                      <a href="https://wa.me/${socialLinks.whatsapp.replace('+', '')}" style="color: #fbbf24; text-decoration: none; font-weight: bold; font-size: 1.1rem;">${socialLinks.whatsapp}</a>
                      <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 0.9rem;">Assistenza immediata</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Social</h4>
                      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                        <a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px; color: white; text-decoration: none;">Instagram</a>
                        <a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px; color: white; text-decoration: none;">Facebook</a>
                      </div>
                    </div>
                  </div>
                </section>
`;

// Inserisci dopo il primo blocco HTML in ogni pagina contatti
content = content.replace(
  /(contatti: \{[\s\S]*?htmlContent: `\s*<section style="padding: 4rem 2rem;[\s\S]*?)`\s*\}\s*\},\s*\{\s*tipo_componente: "MAPS"/g,
  '$1`}\n          },\n          {\n            tipo_componente: "HTML",\n            ordine: 99,\n            dati_config: {\n              htmlContent: `' + contactHTML + '`\n            }\n          },\n          {\n            tipo_componente: "MAPS"'
);

console.log('\n✅ Link social aggiornati!');
console.log('📝 Scrittura file...\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Completato!\n');
console.log('📋 Riepilogo link aggiunti:');
console.log('  Instagram: ' + socialLinks.instagram);
console.log('  Facebook:  ' + socialLinks.facebook);
console.log('  WhatsApp:  ' + socialLinks.whatsapp);
console.log('  Email:     ' + socialLinks.email);
