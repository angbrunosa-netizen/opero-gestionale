/**
 * Nome File: contentGuideGenerator.js
 * Posizione: src/utils/contentGuideGenerator.js
 * Data: 26/12/2025
 * Descrizione: Generatore di PDF con guida completa per creazione contenuti
 */

import jsPDF from 'jspdf';
import { LOGOS } from './logos_base64.js';

export const generateContentGuidePDF = async (presetData, companyName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Colori
    const primaryColor = [37, 99, 235]; // Blue
    const accentColor = [245, 158, 11]; // Amber
    const textColor = [55, 65, 81]; // Gray

    // Loghi in base64 (già caricati)
    const abanexusLogoBase64 = LOGOS.abanexus;
    const operoLogoBase64 = LOGOS.opero;

    // Helper per aggiungere header con logo Abanexus
    const addHeader = (pageNum = null) => {
        const headerHeight = 25;
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        // Logo Abanexus a sinistra
        if (abanexusLogoBase64) {
            try {
                doc.addImage(abanexusLogoBase64, 'PNG', margin, 5, 35, 15);
            } catch (e) {
                console.warn('Impossibile aggiungere logo Abanexus nel header');
            }
        }

        // Testo a destra
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('Guida Creazione Contenuti', pageWidth - margin, 10, { align: 'right' });
        doc.text('Powered by Opero - Abanexus', pageWidth - margin, 16, { align: 'right' });

        if (pageNum) {
            doc.text(`Pagina ${pageNum}`, pageWidth - margin, 22, { align: 'right' });
        }
    };

    // Helper per aggiungere footer con logo Opero
    const addFooter = () => {
        const footerY = pageHeight - 12;
        doc.setFillColor(...primaryColor);
        doc.rect(0, footerY, pageWidth, 12, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);

        // Logo Opero al centro se disponibile
        if (operoLogoBase64) {
            try {
                const logoWidth = 20;
                const logoHeight = 8;
                doc.addImage(operoLogoBase64, 'PNG', pageWidth / 2 - logoWidth / 2, footerY + 2, logoWidth, logoHeight);
            } catch (e) {
                doc.text('Opero - Piattaforma CMS Abanexus', pageWidth / 2, footerY + 8, { align: 'center' });
            }
        } else {
            doc.text('Opero - Piattaforma CMS Abanexus', pageWidth / 2, footerY + 8, { align: 'center' });
        }
    };

    // Helper per aggiungere testo
    const addText = (text, x, y, options = {}) => {
        // Handle bold option
        if (options.bold) {
            doc.setFont('helvetica', 'bold');
        }

        // Split text into lines if it's too long
        const maxWidth = options.maxWidth || pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, maxWidth);

        // Add each line
        const align = options.align || 'left';
        const lineHeight = doc.getFontSize() * 0.5;

        lines.forEach((line, index) => {
            const lineY = y + (index * lineHeight);

            // Handle alignment
            if (align === 'center') {
                doc.text(line, pageWidth / 2, lineY, { align: 'center' });
            } else if (align === 'right') {
                doc.text(line, pageWidth - margin, lineY, { align: 'right' });
            } else {
                doc.text(line, x, lineY);
            }
        });

        // Reset to normal font after bold
        if (options.bold) {
            doc.setFont('helvetica', 'normal');
        }

        // Return the Y position after the text
        return y + (lines.length * lineHeight);
    };

    // Helper per aggiungere titolo
    const addTitle = (text, y, fontSize = 18) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        doc.setFont('helvetica', 'normal'); // Reset to normal
        return y + 10;
    };

    // Helper per aggiungere sezione
    const addSection = (title, y) => {
        y = addTitle(title, y, 14);
        doc.setDrawColor(...primaryColor);
        doc.line(margin, y, pageWidth - margin, y);
        return y + 8;
    };

    // Helper per nuova pagina
    let currentPage = 1;
    const checkPageBreak = (y, requiredSpace = 30) => {
        if (y + requiredSpace > pageHeight - 40) {
            doc.addPage();
            currentPage++;
            addHeader(currentPage);
            addFooter();
            return 35; // Margin top dopo l'header
        }
        return y;
    };

    // ============================================================
    // COPERTINA
    // ============================================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Logo Opero in alto a sinistra
    if (operoLogoBase64) {
        try {
            doc.addImage(operoLogoBase64, 'JPEG', margin, 8, 40, 16);
        } catch (e) {
            console.warn('Impossibile aggiungere logo Opero in copertina');
        }
    }

    // Titolo principale
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('Guida Completa per la Creazione dei Contenuti', pageWidth / 2, 32, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(16);
    doc.text(`Per: ${companyName}`, pageWidth / 2, 44, { align: 'center' });

    doc.setFontSize(13);
    doc.text(`Preset: ${presetData.name}`, pageWidth / 2, 52, { align: 'center' });

    yPosition = 80;

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    addText(
        'Questa guida ti fornira tutte le informazioni necessarie per personalizzare ' +
        'il tuo sito web con contenuti di qualita, immagini professionali e testi efficaci.',
        margin, yPosition
    );

    yPosition += 20;

    // ============================================================
    // INDICE
    // ============================================================
    yPosition = addSection('Indice della Guida', yPosition);

    const sections = [
        '1. Panoramica del Sito Creato',
        '2. Struttura delle Pagine',
        '3. Linee Guida per i Testi',
        '4. Guida Completa alle Immagini',
        '5. Consigli per Foto Originali',
        '6. Risorse per Immagini Gratis',
        '7. Checklist Pre-Pubblicazione',
        '8. Supporto e Contatti',
        '9. Guida Completa alla SEO',
        '10. Le Tecnologie Opero',
        '11. Next.js - Il Futuro del Web',
        '12. Abanexus - Il Partner Tecnologico',
        '13. Risorse e Strumenti Utili'
    ];

    sections.forEach(section => {
        yPosition = checkPageBreak(yPosition, 10);
        addText(`• ${section}`, margin + 5, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    // ============================================================
    // SEZIONE 1: Panoramica
    // ============================================================
    doc.addPage();
    currentPage = 2;
    addHeader(2);
    addFooter();
    yPosition = 35;

    yPosition = addTitle('1. Panoramica del Sito Creato', yPosition, 16);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    yPosition += 10;
    addText(`Tipo di Attività: ${presetData.name}`, margin, yPosition, { bold: true });
    yPosition += 8;
    addText(`Descrizione: ${presetData.description}`, margin, yPosition);
    yPosition += 10;

    yPosition = addSection('Pagine Create', yPosition);

    presetData.pages.forEach((page, idx) => {
        yPosition = checkPageBreak(yPosition, 15);
        addText(`${idx + 1}. ${page.charAt(0).toUpperCase() + page.slice(1)}`, margin + 5, yPosition, { bold: true });
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 2: Struttura Pagine
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('2. Struttura delle Pagine', yPosition, 16);

    const pageDescriptions = {
        'home': 'La homepage è il biglietto da visita del tuo sito. Deve catturare l\'attenzione ' +
                 'immediatamente e comunicare chi sei e cosa offri.',
        'negozio': 'Presenta i tuoi prodotti o servizi in modo organizzato. Usa categorie chiare ' +
                   'e immagini accattivanti.',
        'servizi': 'Descrivi in dettaglio i servizi che offri. Focus sui benefici per il cliente.',
        'menu': 'Il tuo menu completo con foto appetitose e descrizioni dettagliate di ogni piatto.',
        'chi-siamo': 'Racconta la tua storia, i tuoi valori e il tuo team. Crea connessione emotiva.',
        'lavori': 'Mostra i tuoi migliori lavori progetti con foto prima/dopo.',
        'prodotti': 'Catalogo prodotti completo con schede dettagliate.',
        'prenota': 'Sistema di prenotazione easy-to-use con conferma immediata.',
        'contatti': 'Tutte le informazioni per contattarti: mappa, orari, form, social.'
    };

    Object.entries(pageDescriptions).forEach(([pageKey, description], idx) => {
        if (presetData.pages.includes(pageKey)) {
            yPosition = checkPageBreak(yPosition, 25);
            doc.setFontSize(12);
            doc.setTextColor(...primaryColor);
            addText(`${idx + 1}. ${pageKey.replace('-', ' ').toUpperCase()}`, margin, yPosition, { bold: true });
            yPosition += 8;

            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            yPosition = addText(description, margin + 5, yPosition);
            yPosition += 10;
        }
    });

    // ============================================================
    // SEZIONE 3: Linee Guida Testi
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('3. Linee Guida per i Testi', yPosition, 16);

    yPosition = addSection('Principi Fondamentali', yPosition);

    const textPrinciples = [
        { principle: 'CHIAREZZA', desc: 'Usa frasi brevi e semplici. Niente gergo tecnico.' },
        { principle: 'BREVITÀ', desc: 'Vai dritto al punto. Less is more.' },
        { principle: 'AZIONE', desc: 'Usa verbi forti e attivi. "Scopri", "Contatta", "Prenota"' },
        { principle: 'BENEFICI', desc: 'Focus su ciò che il cliente GUADAGNA, non su ciò che fai.' },
        { principle: 'UNICITÀ', desc: 'Cosa ti rende diverso dai competitor?' }
    ];

    textPrinciples.forEach(({ principle, desc }) => {
        yPosition = checkPageBreak(yPosition, 15);
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        addText(principle, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        yPosition = addText(desc, margin + 5, yPosition);
        yPosition += 10;
    });

    yPosition = addSection('Esempi Concreti', yPosition);

    const examples = [
        { bad: 'Vendiamo prodotti di alta qualità', good: 'Prodotti che durano nel tempo' },
        { bad: 'Offriamo servizi professionali', good: 'Servizi che risolvono i tuoi problemi' },
        { bad: 'Contattaci per informazioni', good: 'Chiamaci ora: rispondiamo in 24h' }
    ];

    examples.forEach(({ bad, good }) => {
        yPosition = checkPageBreak(yPosition, 20);
        doc.setFontSize(9);
        doc.setTextColor(200, 50, 50); // Red
        yPosition = addText(`X ${bad}`, margin, yPosition);
        yPosition += 6;
        doc.setTextColor(50, 150, 50); // Green
        yPosition = addText(`V ${good}`, margin, yPosition);
        yPosition += 10;
    });

    // ============================================================
    // SEZIONE 4: Guida Immagini
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('4. Guida Completa alle Immagini', yPosition, 16);

    yPosition = addSection('Dimensioni Consigliate', yPosition);

    const imageSizes = [
        { type: 'Hero Header', width: '1920px', height: '800px', ratio: '2.4:1' },
        { type: 'Card / Vetrina', width: '800px', height: '600px', ratio: '4:3' },
        { type: 'Gallery Grid', width: '600px', height: '600px', ratio: '1:1 (quadrata)' },
        { type: 'Carousel', width: '1200px', height: '800px', ratio: '3:2' },
        { type: 'Team / Staff', width: '400px', height: '500px', ratio: '4:5' },
        { type: 'Product', width: '1000px', height: '1000px', ratio: '1:1' },
        { type: 'Blog / Social', width: '1200px', height: '630px', ratio: '1.91:1' }
    ];

    // Table header
    const tableTop = yPosition;
    const colWidths = [60, 40, 35, 25];
    const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];

    doc.setFillColor(...primaryColor);
    doc.rect(margin, tableTop, pageWidth - (margin * 2), 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Tipo', colPositions[0], tableTop + 7);
    doc.text('Dimensioni', colPositions[1], tableTop + 7);
    doc.text('Ratio', colPositions[2], tableTop + 7);
    doc.text('Formato', colPositions[3], tableTop + 7);
    doc.setFont('helvetica', 'normal');

    yPosition = tableTop + 10;

    // Table rows
    imageSizes.forEach((size, idx) => {
        yPosition = checkPageBreak(yPosition, 12);
        doc.setTextColor(...textColor);
        doc.setFontSize(8);

        const rowY = yPosition;
        doc.text(size.type, colPositions[0], rowY + 5);
        doc.text(`${size.width} x ${size.height}`, colPositions[1], rowY + 5);
        doc.text(size.ratio, colPositions[2], rowY + 5);

        // Format recommendation
        const format = size.width >= 1000 ? 'JPG' : 'PNG';
        doc.text(format, colPositions[3], rowY + 5);

        // Add border
        if (idx % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, rowY, pageWidth - (margin * 2), 10, 'F');
        }

        yPosition += 10;
    });

    yPosition += 10;

    // ============================================================
    // SEZIONE 5: Consigli Foto Originali
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('5. Consigli per Foto Originali', yPosition, 16);

    yPosition = addSection('Scatto con Smartphone', yPosition);

    const smartphoneTips = [
        { tip: 'LUCE', detail: 'Usa luce naturale. Mai contro luce.' },
        { tip: 'STABILITÀ', detail: 'Usa treppiede o appoggia il telefono.' },
        { tip: 'ANGOLO', detail: 'Prova diverse prospettive. 45° = prodotti più dinamici.' },
        { tip: 'SFONDO', detail: 'Semplice, pulito, contrastante con il soggetto.' },
        { tip: 'FOCUS', detail: 'Tocca lo schermo per mettere a fuoco il soggetto principale.' },
        { tip: 'HDR', detail: 'Attiva HDR per bilanciare luci e ombre.' }
    ];

    smartphoneTips.forEach(({ tip, detail }) => {
        yPosition = checkPageBreak(yPosition, 15);
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        addText(`${tip}:`, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(detail, margin + 8, yPosition);
        yPosition += 8;
    });

    yPosition = addSection('Editing: Solo l\'Essenziale', yPosition);

    const editingTips = [
        'Correggi luminosità e contrasto',
        'Ritaglia alle dimensioni consigliate',
        'Rimuovi imperfezioni evidenti',
        'NON esagerare con filtri e effetti',
        'Mantieni colori realistici'
    ];

    editingTips.forEach(tip => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`• ${tip}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 6: Risorse Immagini Gratis
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('6. Risorse per Immagini di Qualità', yPosition, 16);

    yPosition = addSection('Siti di Foto Gratis (Royalty-Free)', yPosition);

    const freeResources = [
        { name: 'Unsplash', url: 'unsplash.com', desc: 'Foto professionali, gratis, alta qualità' },
        { name: 'Pexels', url: 'pexels.com', desc: 'Video e foto, ampie selezione' },
        { name: 'Pixabay', url: 'pixabay.com', desc: 'Foto, vettori, illustrazioni' },
        { name: 'Burst', url: 'burst.shopify.com', desc: 'Per e-commerce e business' }
    ];

    freeResources.forEach(resource => {
        yPosition = checkPageBreak(yPosition, 20);
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        addText(resource.name, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 150); // Blue-ish
        addText(resource.url, margin, yPosition);
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(resource.desc, margin, yPosition);
        yPosition += 10;
    });

    yPosition = addSection('Consigli per la Ricerca', yPosition);

    const searchTips = [
        'Usa termini specifici in INGLESE: "restaurant food", "craftsman woodworking"',
        'Aggiungi dettagli: "italian cuisine", "handmade pottery"',
        'Filtra per orientamento: orizzontale (landscape) per hero, quadrato per card',
        'Cerca foto "realistiche", non troppo stock o artificiali',
        'Verifica la risoluzione: minimo 1920px per uso web'
    ];

    searchTips.forEach(tip => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`• ${tip}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 7: Checklist
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('7. Checklist Pre-Pubblicazione', yPosition, 16);

    yPosition = addSection('Contenuti', yPosition);

    const contentChecklist = [
        'Testi originali, non copiati da altri siti',
        'Nessun errore grammaticale o ortografico',
        'Descrizioni chiare e dettagliate',
        'Call-to-action ben visibili',
        'Informazioni di contatto aggiornate'
    ];

    contentChecklist.forEach(item => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`☐ ${item}`, margin + 5, yPosition);
        yPosition += 7;
    });

    yPosition = addSection('Immagini', yPosition);

    const imageChecklist = [
        'Tutte le immagini hanno dimensioni corrette',
        'File ottimizzati (max 500KB per foto)',
        'Formato corretto (JPG per foto, PNG per grafica)',
        'Nomi file descrittivi (non IMG_1234.jpg)',
        'Alt text descrittivo per SEO',
        'Diritti d\'autorio verificati'
    ];

    imageChecklist.forEach(item => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`☐ ${item}`, margin + 5, yPosition);
        yPosition += 7;
    });

    yPosition = addSection('Mobile', yPosition);

    const mobileChecklist = [
        'Testo leggibile su smartphone',
        'Immagini cariche velocemente',
        'Menu navigabile con un dito',
        'Form facili da compilare',
        'Pulsanti CTA ben visibili'
    ];

    mobileChecklist.forEach(item => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`☐ ${item}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 8: Supporto
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('8. Supporto e Contatti', yPosition, 16);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    yPosition += 15;
    addText('Hai bisogno di aiuto con il tuo sito?', margin, yPosition, { bold: true });
    yPosition += 10;
    addText('Siamo qui per supportarti!', margin, yPosition);
    yPosition += 15;

    yPosition = addSection('Contatti OperoCloud', yPosition);

    const contacts = [
        { label: 'Email:', value: 'clienti@operocloud.it' },
        { label: 'WhatsApp:', value: '+39 335 673 8658' },
        { label: 'Instagram:', value: '@operocloud' },
        { label: 'Facebook:', value: 'OperoCloud' }
    ];

    contacts.forEach(contact => {
        yPosition = checkPageBreak(yPosition, 12);
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        addText(contact.label, margin, yPosition, { bold: true });
        yPosition += 7;
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        addText(contact.value, margin + 5, yPosition);
        yPosition += 10;
    });

    // ============================================================
    // SEZIONE 9: SEO - Guida Completa
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('9. Guida Completa alla SEO', yPosition, 16);

    yPosition = addSection('Cos\'è la SEO e Perché È Importante', yPosition);

    const seoIntro = [
        'La SEO (Search Engine Optimization) è l\'ottimizzazione per i motori di ricerca.',
        'Permette al tuo sito di comparire nelle prime posizioni su Google.',
        'Più sei in alto, più visitatori ottieni.',
        'Il 75% degli utenti non va oltre la prima pagina dei risultati.'
    ];

    seoIntro.forEach(point => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        addText(`• ${point}`, margin + 5, yPosition);
        yPosition += 7;
    });

    yPosition += 10;

    yPosition = addSection('SEO On-Page: Ottimizza i Contenuti', yPosition);

    const seoOnPage = [
        { element: 'Title Tag', desc: 'Titolo della pagina (max 60 caratteri). Deve contenere la parola chiave principale all\'inizio.' },
        { element: 'Meta Description', desc: 'Descrizione nei risultati (max 160 caratteri). Deve essere accattivante e contenere keyword.' },
        { element: 'H1, H2, H3', desc: 'Usa una gerarchia chiara. H1 unico per pagina, H2 per sezioni, H3 per sottosezioni.' },
        { element: 'URL', desc: 'Breve, descrittivo, con keyword. Esempio: /servizi/consulenza-aziendale invece di /page?id=123' },
        { element: 'Keyword Density', desc: 'Usa le keyword naturalmente (1-2% del testo). Non forzare!' },
        { element: 'Immagini', desc: 'Usa attributo ALT descrittivo con keyword. Nome file: foto-ristorante.jpg non IMG_1234.jpg' },
        { element: 'Contenuto', desc: 'Minimo 300 parole per pagina. Contenuto unico, utile e di qualità.' },
        { element: 'Internal Link', desc: 'Collega le pagine tra loro con anchor text descrittivi.' }
    ];

    seoOnPage.forEach(({ element, desc }) => {
        yPosition = checkPageBreak(yPosition, 20);
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        addText(`${element}:`, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(desc, margin + 5, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    yPosition = addSection('SEO Locale per Attività Locali', yPosition);

    const localSeo = [
        'Registra la tua attività su Google Business Profile (gratis)',
        'Inserisci nome, indirizzo, telefono (NAP) coerenti ovunque',
        'Aggiungi foto dei prodotti, servizi, locale',
        'Chiedi ai clienti felici di lasciare recensioni (fondamentale!)',
        'Usa keyword locali: "ristorante a Milano" invece di solo "ristorante"',
        'Crea pagine per ogni località se servi più zone',
        'Inserisci mappa Google nella pagina contatti'
    ];

    localSeo.forEach(tip => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`• ${tip}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 10: Tecnologie Opero
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('10. Le Tecnologie Opero', yPosition, 16);

    yPosition = addSection('Infrastruttura all\'Avanguardia', yPosition);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    yPosition += 10;
    addText('Opero utilizza le tecnologie più avanzate per garantirti massime prestazioni, sicurezza e affidabilità.', margin, yPosition);
    yPosition += 15;

    yPosition = addSection('Storage Cloud Ridondante', yPosition);

    const storageFeatures = [
        'Server distribuiti su più data center in Europa',
        'Replicazione automatica dei dati (nessuna perdita!)',
        'Backup giornalieri automatici con conservazione per 30 giorni',
        'Storage SSD NVMe per velocità 10x superiori agli HDD',
        'Scalabilità illimitata: il sito cresce con te',
        '99.9% uptime garantito (meno di 1 ora di downtime all\'anno!)'
    ];

    storageFeatures.forEach(feature => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        addText(`[+] ${feature}`, margin + 5, yPosition);
        yPosition += 7;
    });

    yPosition += 10;

    yPosition = addSection('CDN Global Content Delivery', yPosition);

    const cdnFeatures = [
        'I tuoi contenuti vengono serviti dal server più vicino all\'utente',
        'Riduzione dei tempi di caricamento fino al 70%',
        'Server edge in 50+ città nel mondo',
        'Compressione automatica immagini e file (WebP, Brotli)',
        'HTTP/3 per connessioni più veloci',
        'SSL/TLS automatico per ogni sito (certificato HTTPS gratis)'
    ];

    cdnFeatures.forEach(feature => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        addText(`[*] ${feature}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 11: Next.js - Il Futuro del Web
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('11. Next.js: La Tecnologia dei Tuoi Siti', yPosition, 16);

    yPosition = addSection('Perché Next.js è Superiore', yPosition);

    const nextjsBenefits = [
        { benefit: 'Velocità Estrema', detail: 'Siti caricati in meno di 1 secondo. Google premia la velocità!' },
        { benefit: 'SEO Perfetta', detail: 'Server-Side Rendering genera HTML completo per Google. Indicizzazione ottimale.' },
        { benefit: 'Mobile First', detail: 'Ottimizzato per smartphone da zero. Il 70% del traffico è mobile!' },
        { benefit: 'PWA Ready', detail: 'Possibilità di trasformare il sito in app installabile. Notifiche push!' },
        { benefit: 'Sicurezza', detail: 'Protezione automatica da XSS, CSRF e altre vulnerabilità.' },
        { benefit: 'Aggiornamenti', detail: 'Zero downtime durante gli aggiornamenti. Il sito è sempre online.' },
        { benefit: 'Scalabilità', detail: 'Da 10 a 10 milioni di visitatori senza problemi. Cresci senza limiti.' },
        { benefit: 'Futuro-Proof', detail: 'Tecnologia mantenuta da Vercel e Facebook. Sempre aggiornata.' }
    ];

    nextjsBenefits.forEach(({ benefit, detail }) => {
        yPosition = checkPageBreak(yPosition, 20);
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        addText(`${benefit}:`, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(detail, margin + 5, yPosition);
        yPosition += 10;
    });

    yPosition += 10;

    yPosition = addSection('Confronto Con Altre Tecnologie', yPosition);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    addText('WordPress', margin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    addText('Richiede plugin per tutto, lento, vulnerabile agli attacchi, aggiornamenti frequenti che rompono il sito.', margin + 5, yPosition);
    yPosition += 12;

    doc.setFont('helvetica', 'bold');
    addText('Siti Statici Tradizionali', margin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    addText('Veloce ma limitato: niente CMS, niente database, difficile aggiornare i contenuti.', margin + 5, yPosition);
    yPosition += 12;

    doc.setFont('helvetica', 'bold');
    addText('Next.js con Opero', margin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    yPosition = addText('Il meglio di entrambi: velocità dei siti statici + flessibilità di un CMS completo + aggiornamenti facili.', margin + 5, yPosition);
    yPosition += 15;

    yPosition = addSection('Cosa Significa Per Te', yPosition);

    const benefits = [
        'Miglior posizionamento su Google = più clienti',
        'Siti veloci = utenti felici = più conversioni',
        'Nessuna manutenzione tecnica richiesta',
        'Aggiornamenti contenuti con click intuitivi',
        'Sicurezza garantita senza pensieri',
        'Business che cresce senza limiti tecnici'
    ];

    benefits.forEach(benefit => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(10);
        doc.setTextColor(50, 150, 50);
        addText(`[OK] ${benefit}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 12: Informazioni su Abanexus
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('12. Abanexus: Il Partner Tecnologico', yPosition, 16);

    yPosition = addSection('Chi È Abanexus', yPosition);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    yPosition += 10;

    const abanexusDesc = [
        'Abanexus è l\'azienda produttrice di Opero, leader nelle soluzioni digitali innovative.',
        'Offriamo piattaforme avanzate per la gestione e la crescita aziendale.',
        'La nostra missione: democratizzare l\'accesso a tecnologie enterprise per PMI.',
        'Anni di esperienza nello sviluppo di soluzioni web e mobile.',
        'Team di esperti in sviluppo, design e marketing digitale.',
        'Formazione specifica per la crescita aziendale del tuo business.'
    ];

    abanexusDesc.forEach(line => {
        yPosition = checkPageBreak(yPosition, 10);
        yPosition = addText(line, margin, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    yPosition = addSection('I Nostri Servizi', yPosition);

    const services = [
        { name: 'Piattaforma OperoCMS', desc: 'Sistema All-in-One per gestire siti, e-commerce, clienti' },
        { name: 'Formazione Aziendale', desc: 'Corsi personalizzati per crescita digitale del personale' },
        { name: 'Consulenza Strategica', desc: 'Analisi, pianificazione e implementazione strategie digitali' },
        { name: 'Sviluppo Custom', desc: 'Soluzioni su misura per esigenze specifiche' },
        { name: 'Supporto Dedicato', desc: 'Assistenza tecnica e strategica continua' }
    ];

    services.forEach(({ name, desc }) => {
        yPosition = checkPageBreak(yPosition, 18);
        doc.setFontSize(11);
        doc.setTextColor(...primaryColor);
        addText(name, margin, yPosition, { bold: true });
        yPosition += 6;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(desc, margin + 5, yPosition);
        yPosition += 10;
    });

    // ============================================================
    // SEZIONE 13: Risorse Utili
    // ============================================================
    doc.addPage();
    currentPage++;
    addHeader(currentPage);
    addFooter();
    yPosition = 35;
    yPosition = addTitle('13. Risorse e Strumenti Utili', yPosition, 16);

    yPosition = addSection('Strumenti SEO', yPosition);

    const seoTools = [
        { tool: 'Google Search Console', desc: 'Gratuito. Monitora come Google vede il tuo sito.' },
        { tool: 'Google Analytics', desc: 'Gratuito. Analizza il traffico e il comportamento utenti.' },
        { tool: 'Google Keyword Planner', desc: 'Gratuito. Trova parole chiave per il tuo settore.' },
        { tool: 'PageSpeed Insights', desc: 'Gratuito. Testa la velocità del tuo sito.' },
        { tool: 'Screaming Frog', desc: 'Freemium. Audit tecnico completo del sito.' },
        { tool: 'Ubersuggest', desc: 'Freemium. Idee keyword e analisi competitor.' }
    ];

    seoTools.forEach(({ tool, desc }) => {
        yPosition = checkPageBreak(yPosition, 15);
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        addText(tool, margin, yPosition, { bold: true });
        yPosition += 5;
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        yPosition = addText(desc, margin + 5, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    yPosition = addSection('Guide e Risorse Formazione', yPosition);

    const resources = [
        'Google Central: https://developers.google.com/search',
        'SEO Guide Moz: https://moz.com/beginners-guide-to-seo',
        'Schema Markup: https://schema.org/ (rich snippet)',
        'Google My Business: https://business.google.com/',
        'Corso SEO gratis Google: https://learndigital.withgoogle.com/'
    ];

    resources.forEach(resource => {
        yPosition = checkPageBreak(yPosition, 10);
        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        addText(`-> ${resource}`, margin + 5, yPosition);
        yPosition += 7;
    });

    // Footer finale
    yPosition = pageHeight - 40;
    doc.setFillColor(...primaryColor);
    doc.rect(0, yPosition, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    addText('Questa guida è stata generata da Opero', margin, yPosition + 15);
    addText('Una piattaforma Abanexus - Soluzioni Digitali per la Crescita Aziendale', margin, yPosition + 23);

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    addText(`Generato il: ${new Date().toLocaleDateString('it-IT')} - www.operocloud.it`, margin, yPosition + 33);

    // Salva il PDF
    const fileName = `Guida_Contenuti_${companyName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    return fileName;
};
