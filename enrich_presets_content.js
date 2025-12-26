const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('📝 Enriching all presets with detailed content...\n');

// ============================================================
// COMMERCIAL - Aggiungi sezioni dettagliate alla pagina "negozio"
// ============================================================
const commercialNegozioEnrichment = `
          },
          {
            tipo_componente: "HTML",
            ordine: 6,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: #f8fafc; border-radius: 12px; margin: 2rem 0;">
                  <div style="max-width: 1200px; margin: 0 auto;">
                    <h3 style="color: #1e40af; font-size: 2rem; margin-bottom: 2rem; text-align: center;">🏆 I Nostri Servizi Esclusivi</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🚚</div>
                        <h4 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 1rem;">Consegna Rapida</h4>
                        <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                          Ricevi i tuoi ordini in 24/48 ore. Spedizione gratuita per ordini superiori a €50.
                          Tracking in tempo reale dalla spedizione alla consegna.
                        </p>
                        <ul style="color: #64748b; line-height: 2;">
                          <li>✓ Consegna espressa in 24h</li>
                          <li>✓ Ritiro in negozio gratuito</li>
                          <li>✓ Spedizione assicurata</li>
                        </ul>
                      </div>
                      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
                        <h4 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 1rem;">Reso Facile</h4>
                        <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                          Hai 30 giorni di tempo per cambiare idea. Reso gratuito su tutti gli articoli.
                          Sostituzione immediata o rimborso completo.
                        </p>
                        <ul style="color: #64748b; line-height: 2;">
                          <li>✓ 30 giorni per il reso</li>
                          <li>✓ Etichetta prepagata inclusa</li>
                          <li>✓ Rimborso in 48h</li>
                        </ul>
                      </div>
                      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💳</div>
                        <h4 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 1rem;">Pagamenti Sicuri</h4>
                        <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                          Accettiamo tutte le carte di credito, PayPal, bonifico e pagamento alla consegna.
                          Transazioni criptate e sicure al 100%.
                        </p>
                        <ul style="color: #64748b; line-height: 2;">
                          <li>✓ Visa, Mastercard, Amex</li>
                          <li>✓ PayPal e Apple Pay</li>
                          <li>✓ Pagamento in 3 rate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
              \`
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 7,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h3 style="font-size: 2rem; margin-bottom: 1.5rem;">🎟️ Iscriviti alla Newsletter</h3>
                  <p style="font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem; opacity: 0.95;">
                    Ricevi offerte esclusive, sconti personalizzati e anteprime delle nuove collezioni
                  </p>
                  <div style="max-width: 500px; margin: 0 auto; display: flex; gap: 0.5rem;">
                    <input type="email" placeholder="La tua email" style="flex: 1; padding: 1rem; border: none; border-radius: 8px; font-size: 1rem;">
                    <button style="background: #f59e0b; color: #1e293b; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem;">
                      Iscriviti
                    </button>
                  </div>
                  <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">🔒 I tuoi dati sono al sicuro. Nello spam, promesso!</p>
                </section>
              \`
            }
`;

// Inserisci dopo il blocco HTML esistente nella pagina negozio
content = content.replace(
  /(negozio: \{[^}]*titolo: "Negozio"[^}]*blocks: \[[\s\S]*?tipo_componente: "HTML",\s*ordine: 5,\s*dati_config: \{[\s\S]*?`\s*\}\s*\}\s*\])\s*\]/,
  '$1,' + commercialNegozioEnrichment + '\n        ]'
);

// ============================================================
// SERVICES - Aggiungi sezioni dettagliate alla pagina "servizi"
// ============================================================
const servicesServiziEnrichment = `
          },
          {
            tipo_componente: "HTML",
            ordine: 4,
            dati_config: {
              htmlContent: \`
                <section style="padding: 4rem 2rem; background: #f8fafc; border-radius: 12px; margin: 2rem 0;">
                  <div style="max-width: 1000px; margin: 0 auto;">
                    <h3 style="color: #0f172a; font-size: 2rem; margin-bottom: 2rem; text-align: center;">💼 Il Nostro Processo di Lavoro</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; text-align: center;">
                      <div>
                        <div style="width: 60px; height: 60px; background: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">1</div>
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Analisi</h4>
                        <p style="color: #64748b; font-size: 0.9rem;">Studiamo le tue esigenze e obiettivi</p>
                      </div>
                      <div>
                        <div style="width: 60px; height: 60px; background: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">2</div>
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Pianificazione</h4>
                        <p style="color: #64748b; font-size: 0.9rem;">Elaboriamo una strategia personalizzata</p>
                      </div>
                      <div>
                        <div style="width: 60px; height: 60px; background: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">3</div>
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Esecuzione</h4>
                        <p style="color: #64748b; font-size: 0.9rem;">Implementiamo con monitoraggio costante</p>
                      </div>
                      <div>
                        <div style="width: 60px; height: 60px; background: #d97706; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">4</div>
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Valutazione</h4>
                        <p style="color: #64748b; font-size: 0.9rem;">Misuriamo i risultati e ottimizziamo</p>
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
                <section style="padding: 4rem 2rem; background: white; border-radius: 12px; margin: 2rem 0; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="max-width: 900px; margin: 0 auto;">
                    <h3 style="color: #0f172a; font-size: 2rem; margin-bottom: 2rem; text-align: center;">📊 Garanzie e Certificazioni</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 1rem;">💯 Soddisfazione Garantita</h4>
                        <p style="color: #64748b; line-height: 1.8;">
                          Non ci sono costi nascosti. Ogni progetto viene preventivato in modo dettagliato prima dell'inizio.
                          Modifiche incluse senza costi aggiuntivi.
                        </p>
                      </div>
                      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 1rem;">⏱️ Tempi Certi</h4>
                        <p style="color: #64748b; line-height: 1.8;">
                          Rispetto delle deadline garantito. Penali per ritardi oltre il 10% del tempo concordato.
                          Report settimanali sullo stato di avanzamento.
                        </p>
                      </div>
                      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 1rem;">🔐 Privacy Totale</h4>
                        <p style="color: #64748b; line-height: 1.8;">
                          Tutti i dati e le informazioni sono trattati con la massima riservatezza.
                          NDA standard su tutti i progetti.
                        </p>
                      </div>
                      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 1rem;">📞 Supporto Dedicato</h4>
                        <p style="color: #64748b; line-height: 1.8;">
                          Un referente unico sempre disponibile. Supporto via email, telefono e video call.
                          Interventi entro 24 ore su richieste urgenti.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              \`
            }
`;

// Inserisci dopo VETRINA in services
content = content.replace(
  /(servizi: \{[^}]*titolo: "Servizi"[^}]*blocks: \[[\s\S]*?tipo_componente: "VETRINA",[\s\S]*?`\s*\}\s*\}\s*\])\s*\]/,
  '$1,' + servicesServiziEnrichment + '\n        ]'
);

console.log('✅ Commercial and Services presets enriched!');
console.log('📝 Writing enhanced file...\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Content enriched successfully!');
console.log('\n📋 Enhanced sections added:');
console.log('  ✓ Commercial/Negozio: Services section + Newsletter');
console.log('  ✓ Services/Servizi: Process workflow + Guarantees');
