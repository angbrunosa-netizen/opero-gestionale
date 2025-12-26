const fs = require('fs');

const filePath = './routes/utils/starterSitePresets.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🍽️ Enriching Restaurant menu guide with detailed recipes...\n');

// ============================================================
// ANTIPASTI - Ricetta dettagliata per ogni piatto
// ============================================================
const antipastiContent = `
                    <h4 style="color: #000; margin-bottom: 1.5rem; font-size: 1.8rem;">Antipasti</h4>
                    <div style="display: grid; gap: 2rem;">
                      <!-- Bruschette Miste -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&h=400&fit=crop" alt="Bruschette Miste" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Bruschette Miste</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€8</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Pomodoro fresco, patè di olive, crema di carciofi</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 15 min prep + 10 min cottura</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Pane casereccio tostato 8 fette</li>
                            <li>Pomodori San Marzano 4 pezzi</li>
                            <li>Aglio 2 spicchi</li>
                            <li>Basilico fresco q.b.</li>
                            <li>Olive taggiasche 100g</li>
                            <li>Carciofi 2 pezzi</li>
                            <li>Olio EVO, sale, pepe</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Grigliare il pane finché dorato</li>
                            <li>Strofinare aglio sulle bruschette calde</li>
                            <li>Preparare patè di olive frullando con olio</li>
                            <li>Cuocere i carciofi e frullare con pecorino</li>
                            <li>Tagliare pomodori a cubetti con basilico</li>
                            <li>Spalmare ogni crema su diverse bruschette</li>
                            <li>Servire immediatamente calde</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Usa pane raffermo di 1-2 giorni per una migliore consistenza croccante!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Carpaccio di Manzo -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=400&fit=crop" alt="Carpaccio" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Carpaccio di Manzo</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€12</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Rucola, parmigiano, granella di noci</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 20 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 2 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Fesa di manzo 200g</li>
                            <li>Rucola fresca 50g</li>
                            <li>Parmigiano Reggiano 24 mesi 80g</li>
                            <li>Noci sgusciate 50g</li>
                            <li>Limone 1/2</li>
                            <li>Olio EVO, sale, pepe</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Congelare la fesa per 30 minuti (facilita il taglio)</li>
                            <li>Affettare sottilmente con coltello affilato</li>
                            <li>Disporre le fette sul piatto da portata</li>
                            <li>Tostare le noci e tritare grossolanamente</li>
                            <li>Tagliare il parmigiano a scaglie</li>
                            <li>Condire con olio, limone, sale e pepe</li>
                            <li>Completare con rucola e granella di noci</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Usa solo manzo frollato 21 giorni per la massima tenerezza!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Tagliere del Contadino -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=400&fit=crop" alt="Tagliere" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Tagliere del Contadino</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€15</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Salumi, formaggi, miele, composte</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 30 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 2-3 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Prosciutto crudo 24 mesi 80g</li>
                            <li>Salame gentile 70g</li>
                            <li>Pecorino Toscano DOP 100g</li>
                            <li>Gorgonzola DOLCE 80g</li>
                            <li>Miele di acacia 50g</li>
                            <li>Composta di cipolle rosse 80g</li>
                            <li>Frutta secca e pane toscano</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Togliere salumi e formaggi dal frigo 1 ora prima</li>
                            <li>Affettare il prosciutto a mano</li>
                            <li>Tagliare il salame a fette regolari</li>
                            <li>Creare scaglie di pecorino con mandarino</li>
                            <li>Disporre gorgonzola a piccoli pezzi</li>
                            <li>Comporre il tagliere alternando colori</li>
                            <li>Aggiungere composte e miele in ciotoline</li>
                            <li>Servire con pane toscano tostato</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Abbinamenti: gorgonzola con miele, pecorino con composta di cipolle!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;

// ============================================================
// PRIMI - Ricette dettagliate
// ============================================================
const primiContent = `
                    <h4 style="color: #000; margin-bottom: 1.5rem; font-size: 1.8rem;">Primi Piatti</h4>
                    <div style="display: grid; gap: 2rem;">
                      <!-- Carbonara -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=400&fit=crop" alt="Carbonara" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Spaghetti Carbonara</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€14</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Guanciale croccante, pecorino, tuorlo d'uovo</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 25 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Spaghetti 320g</li>
                            <li>Guanciale 150g</li>
                            <li>Tuorli d'uovo 4</li>
                            <li>Pecorino Romano DOP 80g</li>
                            <li>Pepe nero in grani q.b.</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Tagliare il guanciale a listarelle</li>
                            <li>Rosolare il guanciale senza olio finché croccante</li>
                            <li>Sbattere i tuorli con pecorino e pepe</li>
                            <li>Cuocere gli spaghetti al dente</li>
                            <li>Scolare e saltare nella padella col guanciale</li>
                            <li>Sfuocare e aggiungere la crema di uova</li>
                            <li>Aggiungere acqua di cottura se necessario</li>
                            <li>Servire immediatamente con pecorino extra</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> MAI aggiungere panna o cipolla! La cremosa viene dai tuorli e l'acqua di cottura!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Cacio e Pepe -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=800&h=400&fit=crop" alt="Cacio e Pepe" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Tonnarelli Cacio e Pepe</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€13</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Pecorino romano DOP, pepe nero</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 20 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Tonnarelli 320g</li>
                            <li>Pecorino Romano DOP 150g</li>
                            <li>Pepe nero in grani 2 cucchiai</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Macinare finemente il pepe nero</li>
                            <li>Tostare il pepe in padella 30 secondi</li>
                            <li>Aggiungere acqua di cottura e creare crema</li>
                            <li>Grattugiare il pecorino a crema</li>
                            <li>Cuocere i tonnarelli al dente</li>
                            <li>Scolare direttamente in padella</li>
                            <li>Aggiungere crema di pecorino e pepe</li>
                            <li>Mantecare con acqua di cottura</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Prepara la crema di pecorino con acqua di cottura PRIMA di scolare la pasta!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Risotto ai Funghi -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=400&fit=crop" alt="Risotto Funghi" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Risotto ai Funghi Porcini</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€16</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Funghi freschi, parmigiano, prezzemolo</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 35 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Riso Carnaroli 320g</li>
                            <li>Funghi porcini freschi 300g</li>
                            <li>Brodo vegetale 1L</li>
                            <li>Vino bianco 1/2 bicchiere</li>
                            <li>Parmigiano Reggiano 80g</li>
                            <li>Prezzemolo, aglio, olio EVO</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Pulire e tagliare i funghi a lamelle</li>
                            <li>Saltare i funghi con aglio e prezzemolo</li>
                            <li>Tostare il riso con olio</li>
                            <li>Sfumare con vino bianco</li>
                            <li>Aggiungere brodo bollente gradualmente</li>
                            <li>Aggiungere funghi a metà cottura</li>
                            <li>Ultimare con mantecatura burro+parmigiano</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Usa funghi porcini freschi, non quelli surgelati per il massimo sapore!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Gnocchi alla Sorrentina -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=400&fit=crop" alt="Gnocchi Sorrentina" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Gnocchi alla Sorrentina</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€14</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Pomodoro San Marzano, mozzarella di bufala, basilico</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 40 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Gnocchi di patate 500g</li>
                            <li>Pomodori San Marzano 800g</li>
                            <li>Mozzarella di bufala 250g</li>
                            <li>Grana Padano 80g</li>
                            <li>Basilico fresco q.b.</li>
                            <li>Olio EVO, aglio, sale</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Preparare salsa con pomodoro e aglio</li>
                            <li>Cuocere gli gnocchi in acqua bollente</li>
                            <li>Scolare quando vengono a galla</li>
                            <li>Passare gli gnocchi nella salsa</li>
                            <li>Disporre in teglia con parmigiano</li>
                            <li>Aggiungere mozzarella a cubetti</li>
                            <li>Gratinare in forno 200°C per 15 min</li>
                            <li>Guarnire con basilico fresco</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Usa gnocchi fatti in casa per un risultato eccezionale!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;

// ============================================================
// SECONDI - Ricette dettagliate
// ============================================================
const secondiContent = `
                    <h4 style="color: #000; margin-bottom: 1.5rem; font-size: 1.8rem;">Secondi Piatti</h4>
                    <div style="display: grid; gap: 2rem;">
                      <!-- Tagliata -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop" alt="Tagliata" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Tagliata al Rosmarino</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€22</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Manzo, patate al forno, verdure grigliate</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 45 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 2 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Tagliata di manzo 400g</li>
                            <li>Patate 500g</li>
                            <li>Zucchine, melanzane, peperoni</li>
                            <li>Rosmarino fresco, timo</li>
                            <li>Olio EVO, sale, pepe</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Tagliare le patate a cubetti</li>
                            <li>Condire con olio, rosmarino e sale</li>
                            <li>Cuocere in forno 200°C per 30 min</li>
                            <li>Grigliare le verdure a fette</li>
                            <li>Scaldare padella alla massima temperatura</li>
                            <li>Seare la carne 2 min per lato</li>
                            <li>Riposare 5 min prima di tagliare</li>
                            <li>Completare con olio e rosmarino</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> La carne DEVE riposare 5 minuti dopo la cottura per rimanere succosa!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Salmone -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=400&fit=crop" alt="Salmone" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Salmone alla Griglia</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€20</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Salmone fresco, asparagi, salsa al limone</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 30 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 2 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Salmone fresco (filetto) 400g</li>
                            <li>Asparagi verdi 200g</li>
                            <li>Limone 2</li>
                            <li>Erba cipollina, aneto</li>
                            <li>Olio EVO, sale, pepe</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Pulire gli asparagi e togliere parte legnosa</li>
                            <li>Grigliare gli asparagi 5-7 min</li>
                            <li>Condire il salmone con olio e sale</li>
                            <li>Grigliare pelle verso il basso 4 min</li>
                            <li>Girare e cuocere altri 3 min</li>
                            <li>Preparare salsa con olio, limone, erbe</li>
                            <li>Servire con asparagi e salsa</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Non cuocere troppo! Il salmone deve rimanendo rosa al centro!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Ossobuco -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop" alt="Ossubuco" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Ossobuco alla Milanese</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€24</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Risotto allo zafferano, gremolata</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 2h 30 min preparazione</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 4 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Ossobuchi di vitello 4 (600g)</li>
                            <li>Vino bianco 1 bicchiere</li>
                            <li>Brodo di carne 1L</li>
                            <li>Passata di pomodoro 200g</li>
                            <li>Cipolla, carota, sedano</li>
                            <li>Farina, burro, olio</li>
                            <li>Zafferano, limone, prezzemolo</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Infarinare gli ossibuchi</li>
                            <li>Rosolare nel burro e olio</li>
                            <li>Aggiungere soffritto di verdure</li>
                            <li>Sfumare con vino bianco</li>
                            <li>Aggiungere passata e brodo</li>
                            <li>Cuocere a fuoco lento 2 ore</li>
                            <li>Preparare gremolata (prezzemolo+aglio+limone)</li>
                            <li>Servire con risotto allo zafferano</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> La gremolata va aggiunta a crudo alla fine per massimo freschezza!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;

// ============================================================
// DOLCI - Ricette dettagliate
// ============================================================
const dolciContent = `
                    <h4 style="color: #000; margin-bottom: 1.5rem; font-size: 1.8rem;">Dolci Fatti in Casa</h4>
                    <div style="display: grid; gap: 2rem;">
                      <!-- Tiramisù -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=400&fit=crop" alt="Tiramisu" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Tiramisù Classico</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€7</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Mascarpone, savoiardi, caffè, cacao amaro</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 30 min + 4h riposo</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 8 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Mascarpone 500g</li>
                            <li>Uova fresche 6 (tuorli)</li>
                            <li>Zucchero 100g</li>
                            <li>Savoiardi 300g</li>
                            <li>Caffè espresso 400ml</li>
                            <li>Cacao amaro in polvere</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Montare i tuorli con lo zucchero</li>
                            <li>Aggiungere il mascarpone mescolando delicatamente</li>
                            <li>Preparare il caffè e farlo raffreddare</li>
                            <li>Bagnare velocemente i savoiardi nel caffè</li>
                            <li>Creare strato alternato: biscotti+crema</li>
                            <li>Completare con strato di crema</li>
                            <li>Riposare in frigo almeno 4 ore</li>
                            <li>Spolverizzare cacao prima di servire</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> NON bagnare troppo i savoiardi! Devono essere bagnati ma non molli!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Panna Cotta -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=400&fit=crop" alt="Panna Cotta" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Panna Cotta</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€6</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Coulis di frutti di bosco</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 20 min + 4h riposo</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 6 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Panna fresca 500ml</li>
                            <li>Panna fresca 250ml</li>
                            <li>Zucchero 90g</li>
                            <li>Gelatina in fogli 12g</li>
                            <li>Baccello di vaniglia 1</li>
                            <li>Frutti di bosco 300g</li>
                            <li>Zucchero a velo 50g</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Ammorbidire la gelatina in acqua fredda</li>
                            <li>Scaldare panna con zucchero e vaniglia</li>
                            <li>Aggiungere gelatina strizzata</li>
                            <li>Versare in stampini monoporo</li>
                            <li>Riposare in frigo 4 ore</li>
                            <li>Preparare coulis frullando frutti di bosco</li>
                            <li>Staccare dal bordo con coltellino</li>
                            <li>Servire con coulis caldo</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Usa panna fresca intera, non panna da cucina per la migliore consistenza!</p>
                          </div>
                        </div>
                      </div>

                      <!-- Crostata -->
                      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <img src="https://images.unsplash.com/photo-1567327613485-fbc7bf196198?w=800&h=400&fit=crop" alt="Crostata" style="width: 100%; height: 250px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="color: #000; font-size: 1.3rem;">Crostata di Frutta</strong>
                            <span style="color: #7c2d12; font-weight: bold; font-size: 1.3rem;">€7</span>
                          </div>
                          <p style="color: #666; margin-bottom: 1rem;">Pasta frolla al burro, frutta di stagione</p>
                          <div style="background: #fafaf9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <p style="font-size: 0.85rem; color: #7c2d12; margin-bottom: 0.5rem;"><strong>⏱️ Tempi:</strong> 1h preparazione + 30 min cottura</p>
                            <p style="font-size: 0.85rem; color: #7c2d12;"><strong>👥 Persone:</strong> 8 persone</p>
                          </div>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">📝 Ingredienti:</h5>
                          <ul style="color: #666; line-height: 1.8; margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>Farina 00 300g</li>
                            <li>Burro freddo 150g</li>
                            <li>Zucchero 100g</li>
                            <li>Uova 2 tuorli</li>
                            <li>Scorza di limone</li>
                            <li>Marmellata di albicocche 200g</li>
                            <li>Fragole, more, lamponi q.b.</li>
                          </ul>
                          <h5 style="color: #000; margin-bottom: 0.5rem;">👨‍🍳 Preparazione:</h5>
                          <ol style="color: #666; line-height: 2; padding-left: 1.5rem;">
                            <li>Impastare farina, burro freddo, zucchero</li>
                            <li>Aggiungere tuorli e scorza di limone</li>
                            <li>Formare palla, riposare in frigo 30 min</li>
                            <li>Stendere 2/3 della frolla nella teglia</li>
                            <li>Spalmare marmellata sulla base</li>
                            <li>Creare strisce con resto della frolla</li>
                            <li>Intrecciare le strisce (griglia)</li>
                            <li>Cuocere 180°C per 30 min</li>
                            <li>Raffreddare e aggiungere frutta fresca</li>
                          </ol>
                          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 0.75rem; margin-top: 1rem;">
                            <p style="font-size: 0.85rem; color: #92400e;"><strong>💡 Consiglio dello Chef:</strong> Il burro deve essere freddo di frigo per una frolla friabile!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;

// ============================================================
// SOSTITUZIONI NEL FILE
// ============================================================

// Antipasti
content = content.replace(
  /(\{[\s\S]*?label: "Antipasti"[\s\S]*?icon: "🥗"[\s\S]*?content: `)[\s\S]*?(`[\s\S]*?\})/,
  '$1' + antipastiContent + '\n                $2'
);

// Primi
content = content.replace(
  /(\{[\s\S]*?label: "Primi"[\s\S]*?icon: "🍝"[\s\S]*?content: `)[\s\S]*?(`[\s\S]*?\})/,
  '$1' + primiContent + '\n                $2'
);

// Secondi
content = content.replace(
  /(\{[\s\S]*?label: "Secondi"[\s\S]*?icon: "🥩"[\s\S]*?content: `)[\s\S]*?(`[\s\S]*?\})/,
  '$1' + secondiContent + '\n                $2'
);

// Dolci
content = content.replace(
  /(\{[\s\S]*?label: "Dolci"[\s\S]*?icon: "🍰"[\s\S]*?content: `)[\s\S]*?(`[\s\S]*?\})/,
  '$1' + dolciContent + '\n                $2'
);

console.log('✅ Restaurant recipes enriched!');
console.log('📝 Writing enhanced file...\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ All recipes added successfully!');
console.log('\n📋 Enhanced sections:');
console.log('  ✓ Antipasti: 3 ricette complete con foto e preparazione');
console.log('  ✓ Primi: 4 ricette complete con foto e preparazione');
console.log('  ✓ Secondi: 3 ricette complete con foto e preparazione');
console.log('  ✓ Dolci: 3 ricette complete con foto e preparazione');
console.log('\n🍽️ Ogni ricetta include:');
console.log('  • Foto in alta risoluzione');
console.log('  • Ingredienti dettagliati');
console.log('  • Fasi di preparazione passo-passo');
console.log('  • Tempi di preparazione e cottura');
console.log('  • Consigli dello chef');
