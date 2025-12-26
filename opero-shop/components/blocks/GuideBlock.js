/**
 * Nome File: GuideBlock.js
 * Percorso: opero-shop/components/blocks/GuideBlock.js
 * Data: 25/12/2025
 * Versione: 1.0.0
 * Descrizione: Blocco per creare guide interattive con tab configurabili dal CMS.
 * - Supporta tab multipli (Panoramica, Menu, Blocchi, Anteprima, ecc.)
 * - Contenuto ricco per ogni tab (testo, immagini, esempi, codice)
 * - Design responsivo e accessibile
 * - Completamente configurabile dal CMS
 */
'use client';
import React, { useState, useEffect } from 'react';

const GuideBlock = ({ config = {}, dittaId = '' }) => {
    const {
        title = 'Guida Interattiva',
        subtitle = '',
        tabs = [],
        theme = 'default',
        iconPosition = 'top',
        showGuide = false // Mostra la guida all'uso del componente
    } = config;

    // Stato per il tab attivo
    const [activeTab, setActiveTab] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Se non ci sono tab e non è richiesta la guida, non renderizzare nulla
    if ((!tabs || tabs.length === 0) && !showGuide) {
        return null;
    }

    // Se showGuide è true o non ci sono tab, mostra la guida all'uso
    const isShowingGuide = showGuide || !tabs || tabs.length === 0;

    // Guida predefinita all'uso del componente
    const guideTabs = [
        {
            label: 'Introduzione',
            icon: '👋',
            title: 'Benvenuto nel GuidaBlock',
            description: 'Questo componente ti permette di creare guide interattive professionali con tab navigabili. Segui questa guida per imparare come utilizzarlo.',
            sections: [
                {
                    title: 'Cos\'è il GuidaBlock?',
                    icon: '📖',
                    content: '<p>Il <strong>GuidaBlock</strong> è un componente potente e flessibile che ti permette di creare <strong>guide interattive</strong> per i tuoi utenti. È perfetto per:</p>',
                    points: [
                        'Documentazione e tutorial',
                        'Guide all\'uso di prodotti/servizi',
                        'FAQ e supporto clienti',
                        'Presentazioni step-by-step',
                        'Manuali operativi'
                    ]
                },
                {
                    title: 'Funzionalità Principali',
                    icon: '⭐',
                    content: '<p>Ecco cosa puoi fare con questo componente:</p>',
                    points: [
                        'Creare <strong>tab illimitati</strong> per organizzare i contenuti',
                        'Aggiungere <strong>sezioni</strong> con testo, HTML, immagini e codice',
                        'Personalizzare con <strong>4 temi</strong> colorati (blu, verde, viola, scuro)',
                        'Inserire <strong>note importanti</strong> e <strong>suggerimenti</strong> evidenziati',
                        'Includere <strong>esempi di codice</strong> con sintassi colorata',
                        'Aggiungere <strong>liste puntate</strong> e <strong>immagini</strong>'
                    ]
                }
            ],
            tip: 'Usa i pulsanti Precedente/Successivo in basso per navigare tra i tab'
        },
        {
            label: 'Struttura',
            icon: '🏗️',
            title: 'Struttura del Componente',
            description: 'Il GuidaBlock è organizzato in una struttura gerarchica semplice e intuitiva.',
            sections: [
                {
                    title: 'Livello 1: La Guida',
                    icon: '📘',
                    content: '<p>Il livello più alto è la <strong>Guida</strong> stessa, che include:</p>',
                    points: [
                        '<strong>Titolo</strong>: Il nome principale della guida (es. "Guida all\'Uso")',
                        '<strong>Sottotitolo</strong>: Una breve descrizione (opzionale)',
                        '<strong>Tema</strong>: Il colore predominante (blu, verde, viola, scuro)'
                    ]
                },
                {
                    title: 'Livello 2: I Tab',
                    icon: '📑',
                    content: '<p>Ogni guida è divisa in <strong>Tab</strong> (come le schede di un raccoglitore). Ogni tab ha:</p>',
                    points: [
                        '<strong>Etichetta</strong>: Il nome breve che appare nel pulsante del tab (es. "Introduzione")',
                        '<strong>Icona</strong>: Un\'emoji per rendere il tab più riconoscibile (es. 👋)',
                        '<strong>Titolo</strong>: Il titolo completo del contenuto del tab',
                        '<strong>Descrizione</strong>: Un testo introduttivo al contenuto'
                    ]
                },
                {
                    title: 'Livello 3: Le Sezioni',
                    icon: '📄',
                    content: '<p>Dentro ogni tab puoi inserire più <strong>Sezioni</strong>. Ogni sezione può contenere:</p>',
                    points: [
                        '<strong>Titolo</strong> + <strong>Icona</strong>: Per identificare la sezione',
                        '<strong>Contenuto HTML</strong>: Testo formattato con paragrafi, grassetto, ecc.',
                        '<strong>Esempio di codice</strong>: Per mostrare snippet di codice con sintassi colorata',
                        '<strong>Punti elenco</strong>: Liste di punti (uno per riga)',
                        '<strong>Immagine</strong>: URL di un\'immagine con didascalia'
                    ]
                }
            ],
            tip: 'Pensa alla struttura come: Guida → Tab → Sezioni → Contenuto'
        },
        {
            label: 'Configurazione',
            icon: '⚙️',
            title: 'Come Configurarlo nel CMS',
            description: 'Segui questi passaggi nel CMS (PageManager) per creare la tua guida.',
            sections: [
                {
                    title: 'Passo 1: Aggiungi il Blocco',
                    icon: '1️⃣',
                    content: '<p>Nella toolbox a sinistra, clicca sul blocco <strong>📖 Guida Interattiva</strong>. Questo aggiungerà un nuovo blocco guida alla tua pagina.</p>'
                },
                {
                    title: 'Passo 2: Configura Titolo e Tema',
                    icon: '2️⃣',
                    content: '<p>Nella sezione "Titolo Guida", inserisci:</p>',
                    points: [
                        '<strong>Titolo Principale</strong>: Il nome della guida',
                        '<strong>Sottotitolo</strong>: Una breve descrizione (opzionale)',
                        '<strong>Tema</strong>: Scegli tra Blu, Verde, Viola o Scuro'
                    ]
                },
                {
                    title: 'Passo 3: Crea i Tab',
                    icon: '3️⃣',
                    content: '<p>Clicca su <strong>"+ Aggiungi Tab"</strong> per creare ogni scheda. Per ogni tab compila:</p>',
                    points: [
                        '<strong>Etichetta</strong>: Nome breve (es. "Introduzione", "Configurazione", "FAQ")',
                        '<strong>Icona</strong>: Un\'emoji rappresentativa (es. 👋, ⚙️, ❓)',
                        '<strong>Titolo Contenuto</strong>: Il titolo completo',
                        '<strong>Descrizione</strong>: Testo introduttivo'
                    ]
                },
                {
                    title: 'Passo 4: Aggiungi Sezioni',
                    icon: '4️⃣',
                    content: '<p>Dentro ogni tab, clicca su <strong>"+ Aggiungi Sezione"</strong> per organizzare il contenuto in paragrafi.</p>'
                },
                {
                    title: 'Passo 5: Compila le Sezioni',
                    icon: '5️⃣',
                    content: '<p>Per ogni sezione puoi aggiungere:</p>',
                    points: [
                        '<strong>Titolo + Icona</strong>: Per identificare la sezione',
                        '<strong>Contenuto HTML</strong>: Usa <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;ul&gt;</code>, ecc.',
                        '<strong>Esempio di Codice</strong>: Inserisci snippet di codice',
                        '<strong>Punti Elenco</strong>: Uno per riga',
                        '<strong>URL Immagine</strong>: Link all\'immagine',
                        '<strong>Didascalia</strong>: Descrizione dell\'immagine'
                    ]
                },
                {
                    title: 'Passo 6: Note e Suggerimenti',
                    icon: '6️⃣',
                    content: '<p>In fondo a ogni tab puoi aggiungere:</p>',
                    points: [
                        '<strong>💡 Suggerimento</strong>: Consigli utili per l\'utente',
                        '<strong>⚠️ Nota Importante</strong>: Avvertenze o informazioni critiche'
                    ]
                }
            ],
            tip: 'Salva spesso mentre lavori per non perdere le modifiche!'
        },
        {
            label: 'Esempi',
            icon: '💡',
            title: 'Esempi Pratici',
            description: 'Ecco alcuni esempi di come puoi utilizzare il GuidaBlock in scenari reali.',
            sections: [
                {
                    title: 'Esempio 1: Guida all\'Acquisto',
                    icon: '🛒',
                    content: '<p>Una guida per aiutare i clienti a scegliere il prodotto giusto.</p>',
                    points: [
                        '<strong>Tab 1</strong>: "Come Ordinare" - Spiega il processo di acquisto passo-passo',
                        '<strong>Tab 2</strong>: "Metodi di Pagamento" - Lista dei pagamenti accettati',
                        '<strong>Tab 3</strong>: "Spedizione" - Tempi e costi di consegna',
                        '<strong>Tab 4</strong>: "Resi e Rimborsi" - Politica di reso'
                    ],
                    tip: 'Usa icone diverse per ogni tab per renderli più riconoscibili'
                },
                {
                    title: 'Esempio 2: Documentazione Tecnica',
                    icon: '👨‍💻',
                    content: '<p>Una guida tecnica per sviluppatori o utenti avanzati.</p>',
                    points: [
                        '<strong>Tab 1</strong>: "Installazione" - Guida all\'installazione',
                        '<strong>Tab 2</strong>: "Configurazione" - Impostazioni iniziali',
                        '<strong>Tab 3</strong>: "API Reference" - Documentazione API con esempi di codice',
                        '<strong>Tab 4</strong>: "Troubleshooting" - Soluzione problemi comuni'
                    ],
                    codeExample: '// Esempio di configurazione\nconst config = {\n  apiKey: "tua-chiave",\n  endpoint: "https://api.example.com"\n};'
                },
                {
                    title: 'Esempio 3: FAQ Domande Frequenti',
                    icon: '❓',
                    content: '<p>Una guida alle domande più frequenti dei clienti.</p>',
                    points: [
                        '<strong>Tab 1</strong>: "Ordini" - Domande sugli ordini',
                        '<strong>Tab 2</strong>: "Account" - Gestione account e password',
                        '<strong>Tab 3</strong>: "Prodotti" - Informazioni sui prodotti',
                        '<strong>Tab 4</strong>: "Assistenza" - Come contattare il supporto'
                    ]
                }
            ],
            tip: 'Personalizza i colori in base al brand della tua azienda!'
        },
        {
            label: 'Best Practices',
            icon: '✨',
            title: 'Consigli per Ottime Guide',
            description: 'Segui queste best practices per creare guide efficaci e professionali.',
            sections: [
                {
                    title: 'Organizzazione dei Contenuti',
                    icon: '📋',
                    content: '<p>Una buona guida è ben organizzata e facile da navigare.</p>',
                    points: [
                        'Usa <strong>3-7 tab</strong> per non sopraffare l\'utente',
                        'Inizia con un\'<strong>introduzione</strong> chiara',
                        'Organizza i tab in <strong>ordine logico</strong> (dal più semplice al più complesso)',
                        'Usa titoli <strong>descrittivi</strong> per ogni tab e sezione',
                        'Aggiungi una <strong>tab "FAQ"</strong> o "Risorse" alla fine'
                    ]
                },
                {
                    title: 'Scrittura Efficace',
                    icon: '✍️',
                    content: '<p>Scrivi in modo chiaro, conciso e facile da capire.</p>',
                    points: [
                        'Usa un linguaggio <strong>semplice e diretto</strong>',
                        'Evita il gergo tecnico quando possibile',
                        'Spiega i termini tecnici con <strong>esempi concreti</strong>',
                        'Usa il <strong>tu</strong> per rivolgersi direttamente al lettore',
                        'Includi <strong>esempi pratici</strong> e casi d\'uso'
                    ]
                },
                {
                    title: 'Uso delle Immagini',
                    icon: '🖼️',
                    content: '<p>Le immagini aiutano a capire meglio i concetti.</p>',
                    points: [
                        'Usa <strong>screenshot</strong> per mostrare interfacce',
                        'Includi <strong>diagrammi</strong> per processi complessi',
                        'Aggiungi <strong>didascalie</strong> descrittive a ogni immagine',
                        'Usa immagini di <strong>alta qualità</strong> ma legger',
                        'Mantieni uno <strong>stile coerente</strong>'
                    ]
                },
                {
                    title: 'Accessibilità',
                    icon: '♿',
                    content: '<p>Assicurati che la guida sia fruibile da tutti.</p>',
                    points: [
                        'Usa <strong>contrasti adeguati</strong> tra testo e sfondo',
                        'Scegli icone <strong>chiare e riconoscibili</strong>',
                        'Fornisci <strong>didascalie</strong> per le immagini',
                        'Usa una <strong>gerarchia visiva</strong> chiara',
                        'Testa la guida su <strong>dispositivi diversi</strong>'
                    ]
                }
            ],
            tip: 'Metti sempre te stesso nei panni dell\'utente finale: è tutto chiaro?',
            note: 'Ricorda di aggiornare regolarmente la guida quando cambiano processi o funzionalità!'
        },
        {
            label: 'Presets Starter',
            icon: '🚀',
            title: 'Siti Starter Preconfigurati',
            description: 'Scopri i 4 tipi di siti starter che puoi creare automaticamente con il Site Starter Wizard. Ogni preset include 4 pagine complete con contenuti di esempio in italiano.',
            sections: [
                {
                    title: '🏪 Attività Commerciali',
                    icon: '🏪',
                    content: '<p>Perfetto per <strong>negozi, e-commerce e attività commerciali</strong>. Include:</p>',
                    points: [
                        '<strong>Home</strong>: HERO + VETRINA servizi + CATEGORIE PRODOTTI (Flip Card) + NEGOZI PARTNER (Carousel) + CTA + Social',
                        '<strong>Negozio</strong>: Offerte in evidenza + GALLERIA OFFERTE (Grid) + BRAND TRATTATI (Flip Card) + Consigli shopping',
                        '<strong>Prodotti</strong>: Catalogo completo con filtri e categorie',
                        '<strong>Contatti</strong>: Mappa + orari + form contatti + social',
                        '<strong>Colori</strong>: Blu vibrante (#2563eb) con accenti arancioni',
                        '<strong>Blocchi totali</strong>: 7 blocchi Home + 5 Negozio + 2 Prodotti + 4 Contatti = 18 blocchi'
                    ]
                },
                {
                    title: '💼 Servizi e Consulenza',
                    icon: '💼',
                    content: '<p>Ideale per <strong>professionisti, studi e consulenti</strong>. Include:</p>',
                    points: [
                        '<strong>Home</strong>: HERO professionale + VETRINA punti di forza + GUIDE competenze + CASE STUDY (Flip Card) + UFFICI (Grid) + CTA',
                        '<strong>Servizi</strong>: VETRINA servizi principali + PROCESSO DI LAVORO + GARANZIE',
                        '<strong>Chi Siamo</strong>: Filosofia + TEAM (Flip Card 4 membri)',
                        '<strong>Contatti</strong>: Mappa + form + social LinkedIn',
                        '<strong>Colori</strong>: Grigio scuro professionale (#0f172a) con accenti ambra',
                        '<strong>Blocchi totali</strong>: 6 blocchi Home + 4 Servizi + 3 Chi Siamo + 4 Contatti = 17 blocchi'
                    ]
                },
                {
                    title: '🍝 Ristoranti e Bar',
                    icon: '🍝',
                    content: '<p>Progettato per <strong>ristoranti, pizzerie, bar e locali</strong>. Include:</p>',
                    points: [
                        '<strong>Home</strong>: HERO elegante + SPECIALITÀ (Carousel) + VETRINA + STAFF (Flip Card 4 membri) + CTA prenotazione',
                        '<strong>Menu</strong>: GUIDE completo (Antipasti, Primi, Secondi, Dessert) + INGREDIENTI + VINO',
                        '<strong>Chi Siamo</strong>: Storia + INGREDIENTI PREMIUM (Flip Card) + AMBIENTI (Grid 6 foto)',
                        '<strong>Prenota</strong>: Form prenotazione + disponibilità + social Instagram',
                        '<strong>Colori</strong>: Nero elegante (#000000) con accenti rosso scuro',
                        '<strong>Blocchi totali</strong>: 5 blocchi Home + 5 Menu + 4 Chi Siamo + 3 Prenota = 17 blocchi'
                    ]
                },
                {
                    title: '🛠️ Artigiani e Laboratori',
                    icon: '🛠️',
                    content: '<p>Perfetto per <strong>artigiani, falegnami, laboratori</strong>. Include:</p>',
                    points: [
                        '<strong>Home</strong>: HERO artigianale + VETRINA servizi + LAVORI (Grid 6) + CTA preventivo',
                        '<strong>Lavori</strong>: HTML descrizione + MATERIALI E TECNICHE (Flip Card) + PORTFOLIO (Grid 9)',
                        '<strong>Prodotti</strong>: VETRINA categorie + catalogo disponibili',
                        '<strong>Contatti</strong>: Mappa + form contatti + social Instagram/Pinterest',
                        '<strong>Colori</strong>: Marrone caldo (#292524) con accenti arancione ocra',
                        '<strong>Blocchi totali</strong>: 4 blocchi Home + 4 Lavori + 3 Prodotti + 4 Contatti = 15 blocchi'
                    ]
                },
                {
                    title: '📊 Confronto Completo',
                    icon: '📊',
                    content: '<p>Tabella comparativa dei 4 preset:</p>',
                    table: {
                        headers: ['Preset', 'Pagine', 'Blocchi', 'Gallerie Flip', 'Gallerie Dynamic', 'Target'],
                        rows: [
                            ['Commercial', '4', '18', '2', '2', 'Negozi e e-commerce'],
                            ['Services', '4', '17', '2', '2', 'Professionisti'],
                            ['Restaurant', '4', '17', '2', '2', 'Ristorazione'],
                            ['Craftsman', '4', '15', '2', '2', 'Artigiani']
                        ]
                    }
                },
                {
                    title: '✨ Caratteristiche Comuni',
                    icon: '⭐',
                    content: '<p>Tutti i preset includono:</p>',
                    points: [
                        '<strong>Immagini Unsplash reali</strong>: Foto professionali di alta qualità',
                        '<strong>Contenuti in italiano</strong>: Testi pronti all\'uso',
                        '<strong>SEO ottimizzato</strong>: Titoli, descrizioni e keywords',
                        '<strong>Responsive design</strong>: Perfetto su mobile, tablet e desktop',
                        '<strong>Social media integrati</strong>: Piattaforme pertinenti al settore',
                        '<strong>Call-to-action strategiche</strong>: Pulsanti per conversione',
                        '<strong>Colori coordinati</strong>: Palette armonica per ogni settore',
                        '<strong>Mappe Google</strong>: Integrazione mappa nella pagina contatti'
                    ]
                }
            ],
            tip: 'Puoi modificare tutti i contenuti dopo aver creato il sito starter! I preset sono solo un punto di partenza.',
            note: 'I siti starter cancellano TUTTE le pagine esistenti. Fai un backup prima di procedere!'
        }
    ];

    // Temi disponibili
    const themes = {
        default: {
            container: 'bg-white border border-gray-200 rounded-lg shadow-md',
            header: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
            tabActive: 'bg-blue-600 text-white border-blue-600',
            tabInactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
            content: 'text-gray-800'
        },
        green: {
            container: 'bg-white border border-green-200 rounded-lg shadow-md',
            header: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
            tabActive: 'bg-green-600 text-white border-green-600',
            tabInactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
            content: 'text-gray-800'
        },
        purple: {
            container: 'bg-white border border-purple-200 rounded-lg shadow-md',
            header: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
            tabActive: 'bg-purple-600 text-white border-purple-600',
            tabInactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent',
            content: 'text-gray-800'
        },
        dark: {
            container: 'bg-gray-800 border border-gray-700 rounded-lg shadow-md',
            header: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white',
            tabActive: 'bg-gray-700 text-white border-gray-600',
            tabInactive: 'bg-gray-900 text-gray-400 hover:bg-gray-750 border-transparent',
            content: 'text-gray-200'
        }
    };

    const currentTheme = themes[theme] || themes.default;

    // Funzione per renderizzare il contenuto del tab
    const renderTabContent = (tab) => {
        if (!tab) return null;

        return (
            <div className="space-y-6">
                {/* Titolo del tab se presente */}
                {tab.title && (
                    <h3 className="text-2xl font-bold mb-4">{tab.title}</h3>
                )}

                {/* Descrizione del tab */}
                {tab.description && (
                    <p className="text-lg leading-relaxed">{tab.description}</p>
                )}

                {/* Content HTML diretto (per tabs con contenuto custom come le ricette) */}
                {tab.content && !tab.sections && (
                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: tab.content }}
                    />
                )}

                {/* Sezioni della guida */}
                {tab.sections && tab.sections.length > 0 && (
                    <div className="space-y-6">
                        {tab.sections.map((section, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                                <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    {section.icon && <span className="text-2xl">{section.icon}</span>}
                                    {section.title}
                                </h4>

                                {section.content && (
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: section.content }}
                                    />
                                )}

                                {/* Esempio di codice se presente */}
                                {section.codeExample && (
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold mb-2 text-gray-600">Esempio:</p>
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                            <code>{section.codeExample}</code>
                                        </pre>
                                    </div>
                                )}

                                {/* Lista di punti se presente */}
                                {section.points && section.points.length > 0 && (
                                    <ul className="mt-3 space-y-2">
                                        {section.points.map((point, pIdx) => (
                                            <li key={pIdx} className="flex items-start gap-2">
                                                <span className="text-blue-600 font-bold">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Immagine se presente */}
                                {section.image && (
                                    <div className="mt-4">
                                        <img
                                            src={section.image}
                                            alt={section.title}
                                            className="rounded-lg shadow-md max-w-full h-auto"
                                        />
                                        {section.imageCaption && (
                                            <p className="text-sm text-gray-600 mt-2 italic">
                                                {section.imageCaption}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Tabella se presente */}
                                {section.table && (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                                            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                                <tr>
                                                    {section.table.headers.map((header, hIdx) => (
                                                        <th key={hIdx} className="px-4 py-3 text-left text-sm font-semibold border-b border-blue-500">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {section.table.rows.map((row, rIdx) => (
                                                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        {row.map((cell, cIdx) => (
                                                            <td key={cIdx} className="px-4 py-3 text-sm border-b border-gray-200">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Nota importante se presente */}
                {tab.note && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h5 className="font-semibold text-yellow-800">Nota Importante</h5>
                                <p className="text-yellow-700 mt-1">{tab.note}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Suggerimento se presente */}
                {tab.tip && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h5 className="font-semibold text-blue-800">Suggerimento</h5>
                                <p className="text-blue-700 mt-1">{tab.tip}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!isClient) {
        return null;
    }

    // Usa la guida integrata se showGuide è true o non ci sono tab configurati
    const displayTabs = isShowingGuide ? guideTabs : tabs;
    const displayTitle = isShowingGuide ? '📖 Come Usare il GuidaBlock' : title;
    const displaySubtitle = isShowingGuide ? 'Guida completa alla creazione di guide interattive' : subtitle;

    return (
        <div className={`guide-block my-8 ${currentTheme.container}`}>
            {/* Badge modalità guida */}
            {isShowingGuide && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
                    <span>🎓</span>
                    <span>Modalità Guida - Questo è un esempio interattivo</span>
                </div>
            )}

            {/* Header della Guida */}
            <div className={currentTheme.header}>
                <div className="px-6 py-4">
                    <h2 className="text-3xl font-bold">{displayTitle}</h2>
                    {displaySubtitle && (
                        <p className="mt-1 text-blue-100">{displaySubtitle}</p>
                    )}
                </div>
            </div>

            {/* Navigazione Tab */}
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="px-6">
                    <nav className="flex space-x-2 overflow-x-auto py-2">
                        {displayTabs.map((tab, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`
                                    px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 flex items-center gap-2
                                    ${activeTab === index
                                        ? `${currentTheme.tabActive}`
                                        : `${currentTheme.tabInactive}`
                                    }
                                `}
                            >
                                {tab.icon && <span className="text-lg">{tab.icon}</span>}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Contenuto del Tab Attivo */}
            <div className="p-6">
                {renderTabContent(displayTabs[activeTab])}
            </div>

            {/* Footer con navigazione */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button
                    onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                    disabled={activeTab === 0}
                    className={`
                        px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition
                        ${activeTab === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                    `}
                >
                    ← Precedente
                </button>

                <div className="text-sm text-gray-600">
                    {activeTab + 1} di {displayTabs.length}
                </div>

                <button
                    onClick={() => setActiveTab(Math.min(displayTabs.length - 1, activeTab + 1))}
                    disabled={activeTab === displayTabs.length - 1}
                    className={`
                        px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition
                        ${activeTab === displayTabs.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                    `}
                >
                    Successivo →
                </button>
            </div>
        </div>
    );
};

export default GuideBlock;
