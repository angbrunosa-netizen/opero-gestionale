const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🍽️🛠️  Enriching Restaurant and Craftsman presets...\n');

// ============================================================
// RESTAURANT - Aggiungi sezioni alla pagina "menu"
// ============================================================
const restaurantMenuEnrichment = `
          },
          {
            tipo_componente: "HTML",
            ordine: 4,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: #fafaf9; border-radius: 12px; margin: 2rem 0;">
                  <div style="max-width: 1000px; margin: 0 auto;">
                    <h3 style="color: #000; font-size: 2rem; margin-bottom: 2rem; text-align: center;">🌿 Ingredienti e Filosofia</h3>
                    <p style="color: #666; font-size: 1.1rem; line-height: 1.9; text-align: center; margin-bottom: 3rem;">
                      La nostra cucina nasce dall'amore per la tradizione italiana e dal rispetto per le materie prime.
                      Selezioniamo personalmente ogni ingrediente da produttori locali di fiducia.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
                      <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🍅</div>
                        <h4 style="color: #000; margin-bottom: 0.5rem;">Km Zero</h4>
                        <p style="color: #666; font-size: 0.95rem;">Verdure e ortaggi da aziende agricole locali, raccolti al momento giusto</p>
                      </div>
                      <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🐟</div>
                        <h4 style="color: #000; margin-bottom: 0.5rem;">Pesce Fresco</h4>
                        <p style="color: #666; font-size: 0.95rem;">Selezione quotidiana dal mercato ittico, solo pesce sostenibile</p>
                      </div>
                      <div style="text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🥩</div>
                        <h4 style="color: #000; margin-bottom: 0.5rem;">Carni selezionate</h4>
                        <p style="color: #666; font-size: 0.95rem;">Fornitori certificati, allevamenti etici e macellerie di fiducia</p>
                      </div>
                    </div>
                  </div>
                </section>
              \`
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 5,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: #000; color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h3 style="font-size: 2rem; margin-bottom: 1.5rem;">🍷 Accompagnamenti Vini</h3>
                  <p style="font-size: 1.1rem; max-width: 700px; margin: 0 auto 2rem; opacity: 0.9;">
                    Il nostro sommelier ti guiderà nella scelta del vino perfetto per ogni piatto.
                    Carta con oltre 200 etichette italiane ed estere.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 900px; margin: 0 auto;">
                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🍷</div>
                      <div style="font-weight: bold;">Rossi</div>
                      <div style="font-size: 0.9rem; opacity: 0.8;">Barolo, Chianti, Brunello</div>
                    </div>
                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🥂</div>
                      <div style="font-weight: bold;">Bianchi</div>
                      <div style="font-size: 0.9rem; opacity: 0.8;">Franciacorta, Vermentino</div>
                    </div>
                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🍾</div>
                      <div style="font-weight: bold;">Bollicine</div>
                      <div style="font-size: 0.9rem; opacity: 0.8;">Prosecco, Champagne</div>
                    </div>
                    <div style="padding: 1.5rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🥃</div>
                      <div style="font-weight: bold;">Distillati</div>
                      <div style="font-size: 0.9rem; opacity: 0.8;">Grappa, Amaro, Whisky</div>
                    </div>
                  </div>
                </section>
              \`
            }
`;

// Inserisci dopo il blocco GUIDE in restaurant/menu
content = content.replace(
  /(menu: \{[^}]*titolo: "Menu"[^}]*blocks: \[[\s\S]*?tipo_componente: "GUIDE",[\s\S]*?`\s*\}\s*\]\s*\}\s*\])\s*\]/,
  '$1,' + restaurantMenuEnrichment + '\n        ]'
);

// ============================================================
// CRAFTSMAN - Aggiungi sezioni alla pagina "lavori"
// ============================================================
const craftsmanLavoriEnrichment = `
          },
          {
            tipo_componente: "HTML",
            ordine: 5,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h3 style="font-size: 2rem; margin-bottom: 1.5rem;">🎨 Progetti su Misura</h3>
                  <p style="font-size: 1.2rem; max-width: 800px; margin: 0 auto 2rem; opacity: 0.95;">
                    Ogni nostro lavoro è un pezzo unico, creato appositamente per te.
                    Dalla progettazione alla consegna, ti seguiamo in ogni fase.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                    <div style="background: rgba(255,255,255,0.2); padding: 2rem; border-radius: 8px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📏</div>
                      <h4 style="margin-bottom: 0.5rem;">Sopralluogo Gratuito</h4>
                      <p style="font-size: 0.95rem; opacity: 0.9;">Veneziamo a misurare e valutiamo insieme</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 2rem; border-radius: 8px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">✏️</div>
                      <h4 style="margin-bottom: 0.5rem;">Preventivo Dettagliato</h4>
                      <p style="font-size: 0.95rem; opacity: 0.9;">Costi trasparenti senza sorprese</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 2rem; border-radius: 8px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
                      <h4 style="margin-bottom: 0.5rem;">Tempi Certi</h4>
                      <p style="font-size: 0.95rem; opacity: 0.9;">Consegna nei tempi pattuiti</p>
                    </div>
                  </div>
                </section>
              \`
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 6,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: #fafaf9; border-radius: 12px; margin: 2rem 0;">
                  <div style="max-width: 1000px; margin: 0 auto;">
                    <h3 style="color: #292524; font-size: 2rem; margin-bottom: 2rem; text-align: center;">🪵 Tecniche Artigianali</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                      <div style="padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h4 style="color: #ea580c; font-size: 1.4rem; margin-bottom: 1rem;">Intaglio Manuale</h4>
                        <p style="color: #78716c; line-height: 1.8; margin-bottom: 1rem;">
                          Ogni dettaglio è scolpito a mano con sgorbie e scalpelli tradizionali.
                          Decorazioni che raccontano storie e rendono ogni pezzo unico.
                        </p>
                        <ul style="color: #78716c; line-height: 2;">
                          <li>✓ Decorazioni a fiore</li>
                          <li>✓ Intrecci complessi</li>
                          <li>✓ Incisioni personalizzate</li>
                        </ul>
                      </div>
                      <div style="padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h4 style="color: #ea580c; font-size: 1.4rem; margin-bottom: 1rem;">Finiture Naturali</h4>
                        <p style="color: #78716c; line-height: 1.8; margin-bottom: 1rem;">
                          Utilizziamo solo vernici e oli naturali che esaltano la bellezza del legno.
                          Nessun prodotto chimico o tossico, solo materie prime pure.
                        </p>
                        <ul style="color: #78716c; line-height: 2;">
                          <li>✓ Cera d'api pura</li>
                          <li>✓ Olio di lino</li>
                          <li>✓ Vernici all'acqua</li>
                        </ul>
                      </div>
                      <div style="padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h4 style="color: #ea580c; font-size: 1.4rem; margin-bottom: 1rem;">Assemblaggio Tradizionale</h4>
                        <p style="color: #78716c; line-height: 1.8; margin-bottom: 1rem;">
                          Giunzioni senza chiodi o viti, usando incastri e colle animali naturali.
                          La stessa tecnica dei maestri artigiani di un tempo.
                        </p>
                        <ul style="color: #78716c; line-height: 2;">
                          <li>✓ Incassi a coda di rondine</li>
                          <li>✓ Tenoni e mortase</li>
                          <li>✓ Colle organiche</li>
                        </ul>
                      </div>
                      <div style="padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <h4 style="color: #ea580c; font-size: 1.4rem; margin-bottom: 1rem;">Restauro</h4>
                        <p style="color: #78716c; line-height: 1.8; margin-bottom: 1rem;">
                          Riportiamo a nuovo vita i mobili antichi di famiglia con rispetto per la loro storia.
                          Interventi conservativi che mantengono il valore del pezzo.
                        </p>
                        <ul style="color: #78716c; line-height: 2;">
                          <li>✓ Tappeti e impiallacciature</li>
                          <li>✓ Sostituzione parti danneggiate</li>
                          <li>✓ Lucidatura a mano</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              \`
            }
`;

// Inserisci dopo DYNAMIC_IMAGE_GALLERY in craftsman/lavori
content = content.replace(
  /(lavori: \{[^}]*titolo: "Lavori"[^}]*blocks: \[[\s\S]*?tipo_componente: "DYNAMIC_IMAGE_GALLERY",[\s\S]*?`\s*\}\s*\]\s*\}\s*\])\s*\]/,
  '$1,' + craftsmanLavoriEnrichment + '\n        ]'
);

console.log('✅ Restaurant and Craftsman presets enriched!');
console.log('📝 Writing enhanced file...\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All presets enriched successfully!');
console.log('\n📋 Enhanced sections added:');
console.log('  ✓ Restaurant/Menu: Ingredients + Wine pairings');
console.log('  ✓ Craftsman/Lavori: Custom projects + Artisan techniques');
