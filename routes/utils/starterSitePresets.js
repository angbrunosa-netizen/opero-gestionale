/**
 * Nome File: starterSitePresets.js
 * Percorso: routes/utils/starterSitePresets.js
 * Data: 25/12/2025
 * Descrizione: Configurazioni predefinite per creazione siti starter
 * Versione: 2.0 - Con immagini di alta qualità e palette colori ottimizzate
 */

const STARTER_SITE_PRESETS = {
  // ============================================
  // 1. ATTIVITÀ COMMERCIALI 🏪
  // ============================================
  commercial: {
    name: "Negozio / E-commerce",
    icon: "🏪",
    description: "Per negozi, attività commerciali e e-commerce",
    template: "standard",
    pages: ["home", "negozio", "prodotti", "contatti"],
    colors: {
      primary: "#2563eb",           // Blue vibrante
      secondary: "#1e40af",         // Blue scuro
      accent: "#f59e0b",            // Ambra/Arancio per CTA
      background: "#ffffff",
      blockBackground: "#f1f5f9",   // Grigio molto chiaro
      headerBackground: "#1e293b",  // Grigio scuro quasi nero
      headerText: "#ffffff"
    },
    pagesStructure: {
      home: {
        title: "Home",
        slug: "home",
        isHomepage: true,
        order: 1,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Benvenuti da [Nome Azienda]",
              sottotitolo: "Qualità e convenienza per ogni tua esigenza",
              cta_text: "Scopri le Offerte",
              ctaLink: "/negozio",
              immagine_url: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1920&q=80",
              backgroundColor: "#1e293b",
              titoloColore: "#ffffff",
              sottotitoloColore: "#f3f4f6",
              ctaColoreTesto: "#ffffff",
              ctaColoreSfondo: "#f59e0b",
              ctaColoreSfondoHover: "#d97706",
              overlayColore: "#000000",
              overlayOpacita: 60,
              allineamento: "center",
              altezza: "lg"
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 2,
            dati_config: {
              titolo: "Perché Sceglierci",
              sottotitolo: "4 motivi per affidarsi a noi",
              layout: "grid-4",
              items: [
                {
                  icon: "📦",
                  title: "Prodotti di Qualità",
                  description: "Solo i migliori brand selezionati per la tua soddisfazione",
                  link: "/prodotti",
                  color: "#2563eb"
                },
                {
                  icon: "🚚",
                  title: "Consegna Rapida",
                  description: "Ricevi i tuoi ordini in 24/48 ore direttamente a casa tua",
                  link: "/contatti",
                  color: "#10b981"
                },
                {
                  icon: "💳",
                  title: "Pagamenti Sicuri",
                  description: "Tutte le modalità di pagamento disponibili e sicure",
                  link: "/prodotti",
                  color: "#f59e0b"
                },
                {
                  icon: "🎁",
                  title: "Offerte Speciali",
                  description: "Sconti esclusivi e promozioni riservate ai nostri clienti",
                  link: "/negozio",
                  color: "#ef4444"
                }
              ]
            }
          },
          {
            tipo_componente: "CATALOG_SELECTION",
            ordine: 3,
            dati_config: {
              titolo: "Prodotti in Evidenza",
              subtitolo: "Le migliori offerte del momento",
              layout: "grid-4",
              maxItems: 4,
              showPrices: true,
              showAddToCart: true
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Categorie Prodotti",
              subtitolo: "Scopri la nostra offerta completa",
              cards: [
                { titolo: "Elettronica", descrizione: "Smartphone, tablet, computer e accessori tecnologici", immagine: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Moda", descrizione: "Capi d'abbigliamento uomo, donna e bambino", immagine: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Casa", descrizione: "Arredamento, decorazione e accessori per la casa", immagine: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Sport", descrizione: "Attrezzatura sportiva e abbigliamento tecnico", immagine: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 5,
            dati_config: {
              titolo: "Negozi Partner",
              subtitolo: "I migliori brand selezionati per te",
              layout: "carousel",
              autoplay: true,
              interval: 3500,
              immagini: [
                { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop", alt: "Centro commerciale", titolo: "Centro commerciale" },
                { src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=600&fit=crop", alt: "Showroom esclusivo", title: "Showroom esclusivo" },
                { src: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop", alt: "Area shop", title: "Area shop" },
                { src: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop", alt: "Reparto abbigliamento", title: "Reparto abbigliamento" }
              ]
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 6,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h2 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Vieni a Trovarci</h2>
                  <p style="font-size: 1.2rem; max-width: 700px; margin: 0 auto 2rem; opacity: 0.95;">
                    Siamo aperti dal Lunedì al Venerdì: 9:00 - 13:00 / 15:30 - 19:30<br>
                    Sabato: 9:00 - 13:00 / 15:00 - 19:00<br>
                    Domenica chiusi
                  </p>
                  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/contatti" style="display: inline-block; background: #f59e0b; color: #1e293b; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                      📞 Contattaci
                    </a>
                    <a href="https://maps.google.com" target="_blank" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; backdrop-filter: blur(10px);">
                      📍 Mappa
                    </a>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "MEDIA_SOCIAL",
            ordine: 7,
            dati_config: {
              titolo: "Seguici sui Social",
              sottotitolo: "Rimani aggiornato su offerte e novità",
              layout: "horizontal",
              platforms: ["facebook", "instagram", "whatsapp", "telegram"],
              customLinks: {
                facebook: "https://www.facebook.com/profile.php?id=61579972817746",
                instagram: "https://www.instagram.com/operocloud/",
                whatsapp: "+393356738658"
              }
            }
          }
        ]
      },
      negozio: {
        titolo: "Negozio",
        slug: "negozio",
        order: 2,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Il Nostro Negozio",
              sottotitolo: "Scopri tutti i nostri prodotti e servizi",
              cta_text: "Vedi Offerte",
              ctaLink: "#offers",
              immagine_url: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1920&q=80",
              backgroundColor: "#1e293b",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "CATALOG_SELECTION",
            ordine: 2,
            dati_config: {
              titolo: "Tutte le Offerte",
              subtitolo: "Sconti e promozioni imperdibili",
              layout: "grid-4",
              maxItems: 12,
              showPrices: true,
              showAddToCart: true,
              showFilters: true
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 3,
            dati_config: {
              titolo: "Offerte del Momento",
              subtitolo: "Le migliori promozioni in evidenza",
              columns: 3,
              layout: "grid",
              columns: 3,
              immagini: [
                { src: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop", alt: "Sconti elettronica fino al 50%", titolo: "Sconti elettronica fino al 50%" },
                { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop", alt: "Collezione moda nuova", title: "Collezione moda nuova" },
                { src: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop", alt: "Offerte casa e arredo", title: "Offerte casa e arredo" },
                { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop", alt: "Sport e fitness", title: "Sport e fitness" },
                { src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", alt: "Accessori tech", title: "Accessori tech" },
                { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop", alt: "Scarpe e sneaker", title: "Scarpe e sneaker" }
              ]
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Marchi Trattati",
              subtitolo: "I migliori brand a tua disposizione",
              cards: [
                { titolo: "Apple", descrizione: "iPhone, iPad, Mac e tutto l'ecosistema Apple", immagine: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Samsung", descrizione: "Smartphone, TV e elettrodomestici intelligenti", immagine: "https://images.unsplash.com/photo-1616469829941-c7200edec809?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Nike", descrizione: "Scarpe, abbigliamento e accessori sportivi", immagine: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Sony", descrizione: "PlayStation, audio e fotografia professionale", immagine: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 5,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; background: #f1f5f9; border-radius: 12px; margin: 2rem 0;">
                  <div style="max-width: 900px; margin: 0 auto; text-align: center;">
                    <h3 style="color: #1e40af; font-size: 2rem; margin-bottom: 1.5rem;">💡 Consigli per lo Shopping</h3>
                    <ul style="color: #64748b; text-align: left; display: inline-block; line-height: 2;">
                      <li style="margin-bottom: 0.75rem;">✓ Verifica la disponibilità dei prodotti in negozio</li>
                      <li style="margin-bottom: 0.75rem;">✓ Approfitta delle nostre offerte stagionali</li>
                      <li style="margin-bottom: 0.75rem;">✓ Chiedi informazioni sui nostri servizi personalizzati</li>
                      <li style="margin-bottom: 0.75rem;">✓ Iscriviti alla newsletter per ricevere sconti esclusivi</li>
                    </ul>
                  </div>
                </section>
              `
            }
          }
        ]
      },
      prodotti: {
        titolo: "Prodotti",
        slug: "prodotti",
        order: 3,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "I Nostri Prodotti",
              sottotitolo: "Qualità garantita per ogni esigenza",
              cta_text: "Esplora Catalogo",
              ctaLink: "#catalog",
              immagine_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80",
              backgroundColor: "#1e293b",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "CATALOG_SELECTION",
            ordine: 2,
            dati_config: {
              titolo: "Catalogo Completo",
              sottotitolo: "Tutti i nostri prodotti organizzati per categoria",
              layout: "grid-4",
              maxItems: 24,
              showPrices: true,
              showAddToCart: true,
              showFilters: true,
              showCategories: true
            }
          }
        ]
      },
      contatti: {
        titolo: "Contatti",
        slug: "contatti",
        order: 4,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Contattaci",
              sottotitolo: "Siamo a tua disposizione per ogni informazione",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80",
              backgroundColor: "#1e293b",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; max-width: 1000px; margin: 2rem auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                    <div>
                      <h3 style="color: #1e40af; font-size: 1.8rem; margin-bottom: 1.5rem;">📍 Dove Siamo</h3>
                      <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                        <strong>Indirizzo:</strong><br>
                        Via Roma 123<br>
                        00100 Città (RM)<br><br>
                        <strong>Orari:</strong><br>
                        Lun-Ven: 9:00-13:00 / 15:30-19:30<br>
                        Sab: 9:00-13:00 / 15:00-19:00<br>
                        Dom: Chiuso
                      </p>
                    </div>
                    <div>
                      <h3 style="color: #1e40af; font-size: 1.8rem; margin-bottom: 1.5rem;">📞 Contatti Diretti</h3>
                      <p style="color: #64748b; line-height: 1.8;">
                        <strong>Telefono:</strong> 06 12345678<br><br>
                        <strong>Email:</strong> info@tuaazienda.it<br><br>
                        <strong>WhatsApp:</strong> +39 333 1234567
                      </p>
                    </div>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "MAPS",
            ordine: 3,
            dati_config: {
              titolo: "Mappa",
              address: "Via Roma 123, Roma",
              zoom: 15,
              height: "400px"
            }
          },
          {
            tipo_componente: "MEDIA_SOCIAL",
            ordine: 4,
            dati_config: {
              titolo: "Seguici sui Social",
              sottotitolo: "Rimani sempre connesso con noi",
              layout: "horizontal",
              platforms: ["facebook", "instagram", "whatsapp", "telegram"]
            }
          }
        ]
      }
    }
  },

  // ============================================
  // 2. SERVIZI PROFESSIONALI 💼
  // ============================================
  services: {
    name: "Servizi Professionali",
    icon: "💼",
    description: "Per studi professionali, consulenti e servizi B2B",
    template: "standard",
    pages: ["home", "servizi", "chi-siamo", "contatti"],
    colors: {
      primary: "#0f172a",           // Navy scuro elegante
      secondary: "#334155",         // Grigio ardesia
      accent: "#d97706",            // Oro/Ambrato premium
      background: "#ffffff",
      blockBackground: "#f8fafc",
      headerBackground: "#0f172a",
      headerText: "#ffffff"
    },
    pagesStructure: {
      home: {
        title: "Home",
        slug: "home",
        isHomepage: true,
        order: 1,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Eccellenza e Professionalità",
              sottotitolo: "Soluzioni su misura per la tua attività",
              cta_text: "Scopri i Nostri Servizi",
              ctaLink: "/servizi",
              immagine_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
              backgroundColor: "#0f172a",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 2,
            dati_config: {
              titolo: "I Nostri Punti di Forza",
              sottotitolo: "Perché scegliere i nostri servizi",
              layout: "grid-4",
              items: [
                {
                  icon: "🎯",
                  title: "Consulenza Specializzata",
                  description: "Anni di esperienza al servizio dei nostri clienti",
                  link: "/servizi",
                  color: "#0f172a"
                },
                {
                  icon: "⚖️",
                  title: "Affidabilità",
                  description: "Trasparenza e correttezza in ogni interazione",
                  link: "/chi-siamo",
                  color: "#d97706"
                },
                {
                  icon: "📊",
                  title: "Risultati Misurabili",
                  description: "KPI e reportistica dettagliata per ogni progetto",
                  link: "/servizi",
                  color: "#334155"
                },
                {
                  icon: "🤝",
                  title: "Supporto Dedicato",
                  description: "Un team sempre disponibile per le tue esigenze",
                  link: "/contatti",
                  color: "#64748b"
                }
              ]
            }
          },
          {
            tipo_componente: "GUIDE",
            ordine: 3,
            dati_config: {
              titolo: "Le Nostre Aree di Competenza",
              sottotitolo: "Soluzioni complete per ogni esigenza",
              tabs: [
                {
                  label: "Metodo",
                  icon: "🔧",
                  content: `
                    <h4 style="color: #0f172a; margin-bottom: 1rem; font-size: 1.5rem;">Il Nostro Metodo di Lavoro</h4>
                    <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                      Utilizziamo un approccio strutturato basato su tre fasi:
                    </p>
                    <ol style="color: #64748b; line-height: 2; padding-left: 1.5rem;">
                      <li style="margin-bottom: 0.75rem;"><strong>Analisi:</strong> Studiamo a fondo le tue esigenze e obiettivi</li>
                      <li style="margin-bottom: 0.75rem;"><strong>Pianificazione:</strong> Elaboriamo una strategia personalizzata</li>
                      <li style="margin-bottom: 0.75rem;"><strong>Esecuzione:</strong> Implementiamo con monitoraggio costante</li>
                    </ol>
                  `
                },
                {
                  label: "Esperienza",
                  icon: "⭐",
                  content: `
                    <h4 style="color: #0f172a; margin-bottom: 1rem; font-size: 1.5rem;">Anni di Esperienza</h4>
                    <p style="color: #64748b; line-height: 1.8; margin-bottom: 1rem;">
                      Operiamo nel settore da oltre 15 anni, seguendo centinaia di clienti con soddisfazione garantita.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem;">
                      <div style="text-align: center; padding: 1.5rem; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #d97706;">15+</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Anni di attività</div>
                      </div>
                      <div style="text-align: center; padding: 1.5rem; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #d97706;">500+</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Clienti soddisfatti</div>
                      </div>
                      <div style="text-align: center; padding: 1.5rem; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 2.5rem; font-weight: bold; color: #d97706;">98%</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Tasso di soddisfazione</div>
                      </div>
                    </div>
                  `
                },
                {
                  label: "Certificazioni",
                  icon: "🏆",
                  content: `
                    <h4 style="color: #0f172a; margin-bottom: 1rem; font-size: 1.5rem;">Certificazioni e Riconoscimenti</h4>
                    <p style="color: #64748b; line-height: 1.8; margin-bottom: 1.5rem;">
                      Il nostro team possiede le certificazioni più importanti del settore:
                    </p>
                    <ul style="color: #64748b; line-height: 2; padding-left: 1.5rem;">
                      <li>Certificazione ISO 9001:2015</li>
                      <li>Iscrizione Albo Professionale</li>
                      <li>Formazione continua accreditata</li>
                      <li>Partecipazione a conferenze internazionali</li>
                    </ul>
                  `
                }
              ]
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Case Study di Successo",
              subtitolo: "Alcuni dei nostri progetti più importanti",
              cards: [
                { titolo: "Azienda Manifatturiera", descrizione: "Ottimizzazione processi e riduzione costi del 35%", immagine: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Startup Tech", descrizione: "Piano strategico e fundraising da €2 milioni", immagine: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Catena Retail", descrizione: "Apertura 5 nuovi punti vendita in 2 anni", immagine: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Studio Professionale", descrizione: "Implementazione CRM e gestione documentale", immagine: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 5,
            dati_config: {
              titolo: "I Nostri Uffici",
              subtitolo: "Ambienti di lavoro professionali e accoglienti",
              columns: 3,
              layout: "grid",
              columns: 3,
              immagini: [
                { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop", alt: "Sala riunioni principale", titolo: "Sala riunioni principale" },
                { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop", alt: "Area workspace open space", title: "Area workspace open space" },
                { src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop", alt: "Ufficio direzionale", title: "Ufficio direzionale" },
                { src: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&h=400&fit=crop", alt: "Area clienti", title: "Area clienti" },
                { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop", alt: "Sala formazione", title: "Sala formazione" },
                { src: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=400&fit=crop", alt: "Zona relax", title: "Zona relax" }
              ]
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 6,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h2 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Pronto per Iniziare?</h2>
                  <p style="font-size: 1.2rem; max-width: 700px; margin: 0 auto 2rem; opacity: 0.95;">
                    Contattaci oggi per una consulenza gratuita e scopri come possiamo aiutarti
                  </p>
                  <a href="/contatti" style="display: inline-block; background: #d97706; color: white; padding: 1rem 3rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    Richiedi Consulenza Gratuita
                  </a>
                </section>
              `
            }
          }
        ]
      },
      servizi: {
        titolo: "Servizi",
        slug: "servizi",
        order: 2,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "I Nostri Servizi",
              sottotitolo: "Soluzioni professionali per ogni esigenza",
              cta_text: "Richiedi Preventivo",
              ctaLink: "/contatti",
              immagine_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80",
              backgroundColor: "#0f172a",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 2,
            dati_config: {
              titolo: "Servizi Principali",
              sottotitolo: "Cosa possiamo fare per te",
              layout: "grid-3",
              items: [
                {
                  icon: "📋",
                  title: "Consulenza Aziendale",
                  description: "Analisi, pianificazione strategica e miglioramento processi",
                  link: "#consulenza",
                  color: "#0f172a"
                },
                {
                  icon: "💰",
                  title: "Consulenza Fiscale",
                  description: "Pianificazione fiscale, dichiarazioni e ottimizzazione",
                  link: "#fiscale",
                  color: "#d97706"
                },
                {
                  icon: "⚖️",
                  title: "Servizi Legali",
                  description: "Assistenza legale, contrattualistica e compliance",
                  link: "#legale",
                  color: "#334155"
                },
                {
                  icon: "📈",
                  title: "Business Planning",
                  description: "Piani business, finanziamenti e sviluppo",
                  link: "#business",
                  color: "#64748b"
                },
                {
                  icon: "👥",
                  title: "Risorse Umane",
                  description: "Recruiting, formazione e gestione del personale",
                  link: "#hr",
                  color: "#475569"
                },
                {
                  icon: "💻",
                  title: "Digital Transformation",
                  description: "Implementazione tecnologie e processi digitali",
                  link: "#digital",
                  color: "#1e293b"
                }
              ]
            }
          }
        ]
      },
      "chi-siamo": {
        title: "Chi Siamo",
        slug: "chi-siamo",
        order: 3,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Chi Siamo",
              sottotitolo: "Il nostro team, la nostra storia",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
              backgroundColor: "#0f172a",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; max-width: 1000px; margin: 2rem auto;">
                  <div style="text-align: center; margin-bottom: 3rem;">
                    <h2 style="color: #0f172a; font-size: 2.5rem; margin-bottom: 1rem;">La Nostra Storia</h2>
                    <p style="color: #64748b; font-size: 1.1rem; line-height: 1.8;">
                      Fondata nel [Anno], la nostra attività è cresciuta grazie alla passione e alla dedizione del nostro team.
                      Oggi siamo un punto di riferimento per aziende e privati che cercano professionalità e competenza.
                    </p>
                  </div>
                  <div style="background: #f8fafc; padding: 3rem; border-radius: 12px; margin: 2rem 0;">
                    <h3 style="color: #0f172a; font-size: 2rem; margin-bottom: 2rem; text-align: center;">I Nostri Valori</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                      <div style="padding: 1.5rem; background: white; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Eccellenza</h4>
                        <p style="color: #64748b; font-size: 0.95rem;">Perseguiamo la qualità in ogni aspetto del nostro lavoro</p>
                      </div>
                      <div style="padding: 1.5rem; background: white; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Integrità</h4>
                        <p style="color: #64748b; font-size: 0.95rem;">Agiamo con trasparenza e onestà in ogni situazione</p>
                      </div>
                      <div style="padding: 1.5rem; background: white; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Innovazione</h4>
                        <p style="color: #64748b; font-size: 0.95rem;">Ci aggiorniamo costantemente per offrire le migliori soluzioni</p>
                      </div>
                      <div style="padding: 1.5rem; background: white; border-radius: 8px; border-left: 4px solid #d97706;">
                        <h4 style="color: #0f172a; margin-bottom: 0.5rem;">Cliente al Centro</h4>
                        <p style="color: #64748b; font-size: 0.95rem;">Ogni cliente è unico e merita attenzione personalizzata</p>
                      </div>
                    </div>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 3,
            dati_config: {
              titolo: "Il Nostro Team",
              sottotitolo: "Professionisti esperti al tuo servizio",
              cards: [
                { titolo: "Nome Cognome", descrizione: "15+ anni di esperienza nel settore", immagine: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Nome Cognome", descrizione: "Specialista in strategia aziendale", immagine: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Nome Cognome", descrizione: "Esperto contabile certificato", immagine: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Nome Cognome", descrizione: "Avvocato specializzato in diritto commerciale", immagine: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          }
        ]
      },
      contatti: {
        titolo: "Contatti",
        slug: "contatti",
        order: 4,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Contattaci",
              sottotitolo: "Siamo a tua disposizione per una consulenza gratuita",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80",
              backgroundColor: "#0f172a",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; max-width: 1000px; margin: 2rem auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                    <div>
                      <h3 style="color: #0f172a; font-size: 1.8rem; margin-bottom: 1.5rem;">📍 Uffici</h3>
                      <p style="color: #64748b; line-height: 1.8; margin-bottom: 1.5rem;">
                        <strong>Indirizzo:</strong><br>
                        Corso Italia 456<br>
                        00100 Roma (RM)<br><br>
                        <strong>Orari:</strong><br>
                        Lun - Ven: 9:00 - 13:00 / 14:30 - 18:30
                      </p>
                    </div>
                    <div>
                      <h3 style="color: #0f172a; font-size: 1.8rem; margin-bottom: 1.5rem;">📞 Contatti</h3>
                      <p style="color: #64748b; line-height: 1.8;">
                        <strong>Telefono:</strong> 06 12345678<br><br>
                        <strong>Email:</strong> info@tuaazienda.it<br><br>
                        <strong>PEC:</strong> tuaazienda@pec.it
                      </p>
                    </div>
                  </div>
                </section>
              `}
          },
          {
            tipo_componente: "HTML",
            ordine: 99,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h3 style="font-size: 2rem; margin-bottom: 2rem;">📬 Contattaci Subito</h3>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Email</h4>
                      <a href="mailto:ingo@operocloud.it" style="color: #fbbf24; text-decoration: none; font-weight: bold; font-size: 1.1rem;">ingo@operocloud.it</a>
                      <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 0.9rem;">Rispondiamo entro 24h</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">WhatsApp</h4>
                      <a href="https://wa.me/393356738658" style="color: #fbbf24; text-decoration: none; font-weight: bold; font-size: 1.1rem;">+393356738658</a>
                      <p style="margin-top: 0.5rem; opacity: 0.9; font-size: 0.9rem;">Assistenza immediata</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; backdrop-filter: blur(10px);">
                      <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                      <h4 style="font-size: 1.3rem; margin-bottom: 0.5rem;">Social</h4>
                      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                        <a href="https://www.instagram.com/operocloud/" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px; color: white; text-decoration: none;">Instagram</a>
                        <a href="https://www.facebook.com/profile.php?id=61579972817746" target="_blank" rel="noopener noreferrer" style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px; color: white; text-decoration: none;">Facebook</a>
                      </div>
                    </div>
                  </div>
                </section>
`
            }
          },
          {
            tipo_componente: "MAPS",
            ordine: 3,
            dati_config: {
              titolo: "Mappa",
              address: "Corso Italia 456, Roma",
              zoom: 15,
              height: "400px"
            }
          },
          {
            tipo_componente: "MEDIA_SOCIAL",
            ordine: 4,
            dati_config: {
              titolo: "Seguici sui Social",
              sottotitolo: "Aggiornamenti e approfondimenti",
              layout: "horizontal",
              platforms: ["linkedin", "twitter", "facebook", "instagram"],
              customLinks: {
                facebook: "https://www.facebook.com/profile.php?id=61579972817746",
                instagram: "https://www.instagram.com/operocloud/",
                whatsapp: "+393356738658"
              }
            }
          }
        ]
      }
    }
  },

  // ============================================
  // 3. RISTORANTE / BAR 🍽️
  // ============================================
  restaurant: {
    name: "Ristorante / Bar",
    icon: "🍽️",
    description: "Per ristoranti, bar, pizzerie e locali pubblici",
    template: "fashion",
    pages: ["home", "menu", "chi-siamo", "prenota"],
    colors: {
      primary: "#000000",           // Nero elegante
      secondary: "#292524",         // Grigio molto scuro
      accent: "#7c2d12",            // Bordeaux rosso scuro
      background: "#fafaf9",
      blockBackground: "#ffffff",
      headerBackground: "#000000",
      headerText: "#ffffff"
    },
    pagesStructure: {
      home: {
        title: "Home",
        slug: "home",
        isHomepage: true,
        order: 1,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Benvenuti da [Nome Ristorante]",
              sottotitolo: "L'arte del gusto in ogni piatto",
              cta_text: "Scopri il Menu",
              ctaLink: "/menu",
              immagine_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80",
              backgroundColor: "#000000",
              titoloColore: "#ffffff",
              overlayOpacita: 0.6,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 2,
            dati_config: {
              titolo: "Le Nostre Specialità",
              sottotitolo: "Un'anticipazione dei nostri piatti",
              layout: "carousel",
              autoplay: true,
              interval: 4000,
              immagini: [
                { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop", alt: "Primi piatti fatti in casa", title: "Primi piatti fatti in casa" },
                { src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop", alt: "Carni alla griglia", title: "Carni alla griglia" },
                { src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop", alt: "Pizza napoletana autentica", title: "Pizza napoletana autentica" },
                { src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop", alt: "Dessert artigianali", title: "Dessert artigianali" }
              ]
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 3,
            dati_config: {
              titolo: "Perché Sceglierci",
              sottotitolo: "L'esperienza che offriamo",
              layout: "grid-3",
              items: [
                {
                  icon: "🍝",
                  title: "Cucina Autentica",
                  description: "Ricette tradizionali con ingredienti freschi e locali",
                  link: "/menu",
                  color: "#7c2d12"
                },
                {
                  icon: "🍷",
                  title: "Carta dei Vini",
                  description: "Selezione esclusiva di vini nazionali e internazionali",
                  link: "/menu",
                  color: "#000000"
                },
                {
                  icon: "📍",
                  title: "Atmosfera Unica",
                  description: "Un ambiente elegante e accogliente nel cuore della città",
                  link: "/chi-siamo",
                  color: "#292524"
                }
              ]
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Il Nostro Staff",
              subtitolo: "Il team dietro ai tuoi piatti preferiti",
              cards: [
                { titolo: "Mario Rossi", descrizione: "20 anni di esperienza nella cucina italiana e internazionale", immagine: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Laura Bianchi", descrizione: "Specialista in pasta fresca e dessert artigianali", immagine: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Giuseppe Verdi", descrizione: "Esperto enologo con certificazioni AIS", immagine: "https://images.unsplash.com/photo-1599598425947-d3527b144d6e?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Anna Neri", descrizione: "Responsabile di sala e customer experience", immagine: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 5,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; background: #000000; color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h2 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Prenota il Tuo Tavolo</h2>
                  <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem; opacity: 0.9;">
                    Assicurati il posto perfetto per un'esperienza indimenticabile
                  </p>
                  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/prenota" style="display: inline-block; background: #7c2d12; color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
                      📅 Prenota Online
                    </a>
                    <a href="tel:+390612345678" style="display: inline-block; background: transparent; border: 2px solid white; color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
                      📞 Chiama Ora
                    </a>
                  </div>
                </section>
              `
            }
          }
        ]
      },
      menu: {
        titolo: "Menu",
        slug: "menu",
        order: 2,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Il Nostro Menu",
              sottotitolo: "Scopri le nostre proposte gastronomiche",
              cta_text: "Prenota",
              ctaLink: "/prenota",
              immagine_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
              backgroundColor: "#000000",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "GUIDE",
            ordine: 2,
            dati_config: {
              titolo: "Menu Completo",
              sottotitolo: "Le nostre specialità",
              tabs: [
                {
                  label: "Antipasti",
                  icon: "🥗",
                  content: `
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
                  
                `
                },
                {
                  label: "Primi",
                  icon: "🍝",
                  content: `
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
                  
                `
                },
                {
                  label: "Secondi",
                  icon: "🥩",
                  content: `
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
                  
                `
                },
                {
                  label: "Dolci",
                  icon: "🍰",
                  content: `
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
                  
                `
                }
              ]
            }
          }
        ]
      },
      "chi-siamo": {
        title: "Chi Siamo",
        slug: "chi-siamo",
        order: 3,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "La Nostra Storia",
              sottotitolo: "Passione e tradizione dal [Anno]",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80",
              backgroundColor: "#000000",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; max-width: 900px; margin: 2rem auto; text-align: center;">
                  <h2 style="color: #000; font-size: 2.5rem; margin-bottom: 2rem;">La Nostra Filosofia</h2>
                  <p style="color: #666; font-size: 1.1rem; line-height: 1.9; margin-bottom: 2rem;">
                    Dal [Anno], il nostro ristorante porta in tavola la migliore tradizione culinaria italiana.
                    Ogni piatto racconta una storia di passione, ricerca e rispetto per gli ingredienti.
                  </p>
                  <p style="color: #666; font-size: 1.1rem; line-height: 1.9; margin-bottom: 2rem;">
                    Selezioniamo solo materie prime di eccellenza, lavorate con tecniche tradizionali
                    e presentate con cura in ogni dettaglio.
                  </p>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem;">
                    <div style="padding: 2rem; background: #fafaf9; border-radius: 8px;">
                      <div style="font-size: 2.5rem; margin-bottom: 1rem;">🍅</div>
                      <h3 style="color: #000; margin-bottom: 0.5rem;">Ingredienti Freschi</h3>
                      <p style="color: #666; font-size: 0.9rem;">Da produttori locali ogni giorno</p>
                    </div>
                    <div style="padding: 2rem; background: #fafaf9; border-radius: 8px;">
                      <div style="font-size: 2.5rem; margin-bottom: 1rem;">👨‍🍳</div>
                      <h3 style="color: #000; margin-bottom: 0.5rem;">Chef Esperti</h3>
                      <p style="color: #666; font-size: 0.9rem;">Anni di esperienza e passione</p>
                    </div>
                    <div style="padding: 2rem; background: #fafaf9; border-radius: 8px;">
                      <div style="font-size: 2.5rem; margin-bottom: 1rem;">❤️</div>
                      <h3 style="color: #000; margin-bottom: 0.5rem;">Amore per il Cibo</h3>
                      <p style="color: #666; font-size: 0.9rem;">In ogni piatto che prepariamo</p>
                    </div>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 3,
            dati_config: {
              titolo: "Ingredienti Premium",
              subtitolo: "La qualità delle nostre materie prime",
              cards: [
                {
                  titolo: "Olio Extra Vergine",
                  role: "Prodotto locale",
                  description: "Olio DOP da frantoiani selezionati",
                  image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop"
                },
                { titolo: "Parmigiano Reggiano", descrizione: "Parmigiano stagionato 24 mesi", immagine: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Prosciutto di Parma", descrizione: "Prosciutto crudo stagionato 18 mesi", immagine: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Mozzarella di Bufala", descrizione: "Mozzarella fresca ogni giorno", immagine: "https://images.unsplash.com/photo-1631206753348-db44968fd440?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Il Nostro Ristorante",
              subtitolo: "Gli ambienti del locale",
              columns: 3,
              layout: "grid",
              columns: 3,
              immagini: [
                { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop", alt: "Sala principale", titolo: "Sala principale" },
                { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop", alt: "Area terrazza", title: "Area terrazza" },
                { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", alt: "Sala privata", title: "Sala privata" },
                { src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop", alt: "Bar area", title: "Bar area" },
                { src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop", alt: "Cucina a vista", title: "Cucina a vista" },
                { src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop", alt: "Degustazioni", title: "Degustazioni" }
              ]
            }
          }
        ]
      },
      prenota: {
        titolo: "Prenota",
        slug: "prenota",
        order: 4,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Prenota il Tuo Tavolo",
              sottotitolo: "Assicurati un'esperienza indimenticabile",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1920&q=80",
              backgroundColor: "#000000",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; max-width: 700px; margin: 2rem auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <h2 style="color: #000; font-size: 2rem; margin-bottom: 2rem; text-align: center;">Prenotazione Online</h2>
                  <form style="display: grid; gap: 1.5rem;">
                    <div>
                      <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Nome *</label>
                      <input type="text" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" placeholder="Il tuo nome">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                      <div>
                        <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Data *</label>
                        <input type="date" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                      </div>
                      <div>
                        <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Ora *</label>
                        <select required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                          <option value="">Seleziona orario</option>
                          <option value="12:30">12:30</option>
                          <option value="13:00">13:00</option>
                          <option value="13:30">13:30</option>
                          <option value="14:00">14:00</option>
                          <option value="19:30">19:30</option>
                          <option value="20:00">20:00</option>
                          <option value="20:30">20:30</option>
                          <option value="21:00">21:00</option>
                          <option value="21:30">21:30</option>
                          <option value="22:00">22:00</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Numero di Ospiti *</label>
                      <select required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;">
                        <option value="">Seleziona numero</option>
                        <option value="1">1 persona</option>
                        <option value="2">2 persone</option>
                        <option value="3">3 persone</option>
                        <option value="4">4 persone</option>
                        <option value="5">5 persone</option>
                        <option value="6">6 persone</option>
                        <option value="7+">7+ persone (contattaci via telefono)</option>
                      </select>
                    </div>
                    <div>
                      <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Email</label>
                      <input type="email" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" placeholder="tua@email.it">
                    </div>
                    <div>
                      <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Telefono *</label>
                      <input type="tel" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" placeholder="+39 333 1234567">
                    </div>
                    <div>
                      <label style="display: block; color: #000; font-weight: bold; margin-bottom: 0.5rem;">Note</label>
                      <textarea rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px;" placeholder="Allergie, preferenze, occasioni speciali..."></textarea>
                    </div>
                    <button type="submit" style="width: 100%; background: #7c2d12; color: white; padding: 1rem; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">
                      Conferma Prenotazione
                    </button>
                  </form>
                </section>
              `
            }
          },
          {
            tipo_componente: "MEDIA_SOCIAL",
            ordine: 3,
            dati_config: {
              titolo: "Seguici sui Social",
              sottotitolo: "Resta aggiornato sul nostro menu e eventi",
              layout: "horizontal",
              platforms: ["instagram", "facebook"],
              customLinks: {
                facebook: "https://www.facebook.com/profile.php?id=61579972817746",
                instagram: "https://www.instagram.com/operocloud/"
              }
            }
          }
        ]
      }
    }
  },

  // ============================================
  // 4. ARTIGIANO / LABORATORIO 🛠️
  // ============================================
  craftsman: {
    name: "Artigiano / Laboratorio",
    icon: "🛠️",
    description: "Per artigiani, laboratori e botteghe",
    template: "industrial",
    pages: ["home", "lavori", "prodotti", "contatti"],
    colors: {
      primary: "#ea580c",           // Arancione vibrante
      secondary: "#292524",         // Grigio molto scuro quasi nero
      accent: "#fbbf24",            // Oro ocra
      background: "#fafaf9",
      blockBackground: "#f5f5f4",
      headerBackground: "#292524",
      headerText: "#ffffff"
    },
    pagesStructure: {
      home: {
        titolo: "Home",
        slug: "home",
        isHomepage: true,
        order: 1,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Artigianato Italiano dal [Anno]",
              sottotitolo: "Lavoro a mano, qualità garantita",
              cta_text: "Scopri i Nostri Lavori",
              ctaLink: "/lavori",
              immagine_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
              backgroundColor: "#292524",
              titoloColore: "#ffffff",
              overlayOpacita: 0.6,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 2,
            dati_config: {
              titolo: "Cosa Facciamo",
              sottotitolo: "I nostri servizi artigianali",
              layout: "grid-4",
              items: [
                {
                  icon: "🔨",
                  title: "Lavorazione Artigianale",
                  description: "Ogni pezzo è unico, realizzato a mano con cura",
                  link: "/lavori",
                  color: "#ea580c"
                },
                {
                  icon: "🪵",
                  title: "Materiali Premium",
                  description: "Solo legni pregiati e materiali di prima scelta",
                  link: "/prodotti",
                  color: "#fbbf24"
                },
                {
                  icon: "📐",
                  title: "Design su Misura",
                  description: "Progettiamo insieme la soluzione perfetta",
                  link: "/contatti",
                  color: "#292524"
                },
                {
                  icon: "✨",
                  title: "Finiture Eccellenti",
                  description: "Attenzione al dettaglio in ogni fase",
                  link: "/lavori",
                  color: "#78716c"
                }
              ]
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 3,
            dati_config: {
              titolo: "I Nostri Lavori",
              sottotitolo: "Alcuni dei nostri progetti recenti",
              layout: "grid",
              columns: 3,
              immagini: [
                { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", alt: "Mobile su misura", title: "Mobile su misura" },
                { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop", alt: "Cucina artigianale", title: "Cucina artigianale" },
                { src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop", alt: "Tavolo in massello", title: "Tavolo in massello" },
                { src: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=400&fit=crop", alt: "Armadio su misura", title: "Armadio su misura" },
                { src: "https://images.unsplash.com/photo-1595808563634-8f223f002d8b?w=600&h=400&fit=crop", alt: "Libreria design", title: "Libreria design" },
                { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop", alt: "Sedia artigianale", title: "Sedia artigianale" }
              ]
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 4,
            dati_config: {
              htmlContent: `
                <section style="padding: 4rem 2rem; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; border-radius: 12px; margin: 2rem 0; text-align: center;">
                  <h2 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: bold;">Hai un Progetto in Mente?</h2>
                  <p style="font-size: 1.2rem; max-width: 700px; margin: 0 auto 2rem; opacity: 0.95;">
                    Parliamone! Realizziamo insieme i tuoi desideri con la qualità dell'artigianato italiano
                  </p>
                  <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="/contatti" style="display: inline-block; background: #292524; color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
                      Richiedi Preventivo
                    </a>
                    <a href="tel:+390612345678" style="display: inline-block; background: white; color: #ea580c; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 1.1rem;">
                      📞 Chiama Ora
                    </a>
                  </div>
                </section>
              `
            }
          }
        ]
      },
      lavori: {
        titolo: "Lavori",
        slug: "lavori",
        order: 2,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "I Nostri Lavori",
              sottotitolo: "Progetti realizzati con passione e maestria",
              cta_text: "Contattaci",
              ctaLink: "/contatti",
              immagine_url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1920&q=80",
              backgroundColor: "#292524",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; max-width: 900px; margin: 2rem auto; text-align: center;">
                  <h3 style="color: #292524; font-size: 2rem; margin-bottom: 1.5rem;">Il Nostro Processo di Lavoro</h3>
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: 2rem;">
                    <div>
                      <div style="width: 60px; height: 60px; background: #ea580c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">1</div>
                      <h4 style="color: #292524; margin-bottom: 0.5rem;">Consulenza</h4>
                      <p style="color: #78716c; font-size: 0.9rem;">Ascoltiamo le tue idee</p>
                    </div>
                    <div>
                      <div style="width: 60px; height: 60px; background: #ea580c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">2</div>
                      <h4 style="color: #292524; margin-bottom: 0.5rem;">Progetto</h4>
                      <p style="color: #78716c; font-size: 0.9rem;">Disegniamo insieme</p>
                    </div>
                    <div>
                      <div style="width: 60px; height: 60px; background: #ea580c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">3</div>
                      <h4 style="color: #292524; margin-bottom: 0.5rem;">Realizzazione</h4>
                      <p style="color: #78716c; font-size: 0.9rem;">Lavoriamo a mano</p>
                    </div>
                    <div>
                      <div style="width: 60px; height: 60px; background: #ea580c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem;">4</div>
                      <h4 style="color: #292524; margin-bottom: 0.5rem;">Consegna</h4>
                      <p style="color: #78716c; font-size: 0.9rem;">Soddisfazione garantita</p>
                    </div>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "FLIP_CARD_GALLERY",
            ordine: 3,
            dati_config: {
              titolo: "Materiali e Tecniche",
              sottotitolo: "Scopri come lavoriamo",
              cards: [
                { titolo: "Legno Massello", descrizione: "Usiamo solo legni masselli certificati, stagionati naturalmente", immagine: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Intaglio Artigianale", descrizione: "Ogni dettaglio è scolpito a mano con strumenti tradizionali", immagine: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Finiture Naturali", descrizione: "Utilizziamo solo vernici e oli naturali ecologici", immagine: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", link: "#" },
                { titolo: "Assemblaggio", descrizione: "Giunzioni tradizionali senza colle o chiodi metallici", immagine: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop", link: "#" }
              ]
            }
          },
          {
            tipo_componente: "DYNAMIC_IMAGE_GALLERY",
            ordine: 4,
            dati_config: {
              titolo: "Portfolio Completo",
              sottotitolo: "Tutti i nostri progetti",
              layout: "grid",
              columns: 3,
              immagini: [
                { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop", alt: "Cucina completa", title: "Cucina completa" },
                { src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop", alt: "Tavolo dining", title: "Tavolo dining" },
                { src: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=400&fit=crop", alt: "Armadio walk-in", title: "Armadio walk-in" },
                { src: "https://images.unsplash.com/photo-1595808563634-8f223f002d8b?w=600&h=400&fit=crop", alt: "Libreria design", title: "Libreria design" },
                { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop", alt: "Sedia artigianale", title: "Sedia artigianale" },
                { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", alt: "Comò moderno", title: "Comò moderno" },
                { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", alt: "Tavolo da lavoro", title: "Tavolo da lavoro" },
                { src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop", alt: "Mobile bagno", title: "Mobile bagno" },
                { src: "https://images.unsplash.com/photo-1540932296774-1bed3605c6a5?w=600&h=400&fit=crop", alt: "Scrivania studio", title: "Scrivania studio" }
              ]
            }
          }
        ]
      },
      prodotti: {
        titolo: "Prodotti",
        slug: "prodotti",
        order: 3,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "I Nostri Prodotti",
              sottotitolo: "Creazioni artigianali pronte per la tua casa",
              cta_text: "Richiedi Info",
              ctaLink: "/contatti",
              immagine_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
              backgroundColor: "#292524",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "VETRINA",
            ordine: 2,
            dati_config: {
              titolo: "Categorie Prodotti",
              sottotitolo: "Scopri le nostre creazioni",
              layout: "grid-3",
              items: [
                {
                  icon: "🪑",
                  title: "Sedie e Sgabelli",
                  description: "Sedie artigianali in vari stili e finiture",
                  link: "#",
                  color: "#ea580c"
                },
                {
                  icon: "🛋️",
                  title: "Tavoli e Tavolini",
                  description: "Tavoli da pranzo, lavoro e coffee table",
                  link: "#",
                  color: "#fbbf24"
                },
                {
                  icon: "🗄️",
                  title: "Armadi e Mobili",
                  description: "Armadi, comò, credenze e librerie",
                  link: "#",
                  color: "#292524"
                },
                {
                  icon: "🛏️",
                  title: "Camera da Letto",
                  description: "Letti, comodini e armadi cabina",
                  link: "#",
                  color: "#78716c"
                },
                {
                  icon: "🍽️",
                  title: "Cucina",
                  description: "Mobili e accessori per la cucina",
                  link: "#",
                  color: "#ea580c"
                },
                {
                  icon: "🖼️",
                  title: "Accessori",
                  description: "Cornici, specchi e oggetti decorativi",
                  link: "#",
                  color: "#fbbf24"
                }
              ]
            }
          },
          {
            tipo_componente: "CATALOG_SELECTION",
            ordine: 3,
            dati_config: {
              titolo: "Prodotti Disponibili",
              sottotitolo: "Pezzi unici pronti per la consegna",
              layout: "grid-4",
              maxItems: 8,
              showPrices: true,
              showFilters: true
            }
          }
        ]
      },
      contatti: {
        titolo: "Contatti",
        slug: "contatti",
        order: 4,
        blocks: [
          {
            tipo_componente: "HERO",
            ordine: 1,
            dati_config: {
              titolo: "Contattaci",
              sottotitolo: "Richiedi un preventivo gratuito",
              cta_text: "",
              ctaLink: "",
              immagine_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
              backgroundColor: "#292524",
              titoloColore: "#ffffff",
              overlayOpacita: 0.7,
              allineamento: "center"
            }
          },
          {
            tipo_componente: "HTML",
            ordine: 2,
            dati_config: {
              htmlContent: `
                <section style="padding: 3rem 2rem; max-width: 900px; margin: 2rem auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
                    <div>
                      <h3 style="color: #292524; font-size: 1.8rem; margin-bottom: 1.5rem;">📍 Laboratorio</h3>
                      <p style="color: #78716c; line-height: 1.8; margin-bottom: 1.5rem;">
                        <strong>Indirizzo:</strong><br>
                        Via dell'Artigiano 78<br>
                        00100 Roma (RM)<br><br>
                        <strong>Orari:</strong><br>
                        Lun - Ven: 8:00 - 12:00 / 14:00 - 18:00<br>
                        Sab: 9:00 - 12:00<br>
                        Dom: Chiuso
                      </p>
                    </div>
                    <div>
                      <h3 style="color: #292524; font-size: 1.8rem; margin-bottom: 1.5rem;">📞 Contatti</h3>
                      <p style="color: #78716c; line-height: 1.8;">
                        <strong>Telefono:</strong> 06 12345678<br><br>
                        <strong>Cellulare:</strong> +39 333 1234567<br><br>
                        <strong>Email:</strong> info@tuaazienda.it<br><br>
                        <strong>WhatsApp:</strong> +39 333 1234567
                      </p>
                    </div>
                  </div>
                </section>
              `
            }
          },
          {
            tipo_componente: "MAPS",
            ordine: 3,
            dati_config: {
              titolo: "Mappa",
              address: "Via dell'Artigiano 78, Roma",
              zoom: 15,
              height: "400px"
            }
          },
          {
            tipo_componente: "MEDIA_SOCIAL",
            ordine: 4,
            dati_config: {
              titolo: "Seguici sui Social",
              sottotitolo: "I nostri lavori in tempo reale",
              layout: "horizontal",
              platforms: ["instagram", "facebook", "pinterest"],
              customLinks: {
                facebook: "https://www.facebook.com/profile.php?id=61579972817746",
                instagram: "https://www.instagram.com/operocloud/"
              }
            }
          }
        ]
      }
    }
  }
};

module.exports = STARTER_SITE_PRESETS;
