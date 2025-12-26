/**
 * Nome File: contentGuideGenerator.js
 * Posizione: src/utils/contentGuideGenerator.js
 * Data: 26/12/2025
 * Descrizione: Generatore di PDF con guida completa per creazione contenuti
 */

import jsPDF from 'jspdf';

export const generateContentGuidePDF = (presetData, companyName) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Colori
    const primaryColor = [37, 99, 235]; // Blue
    const accentColor = [245, 158, 11]; // Amber
    const textColor = [55, 65, 81]; // Gray

    // Helper per aggiungere testo
    const addText = (text, x, y, options = {}) => {
        const maxWidth = options.maxWidth || pageWidth - (margin * 2);

        // Handle bold option
        if (options.bold) {
            doc.setFont('helvetica', 'bold');
        }

        doc.text(text, x, y, {
            maxWidth: maxWidth,
            align: options.align || 'left'
        });

        // Reset to normal font after bold
        if (options.bold) {
            doc.setFont('helvetica', 'normal');
        }
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
    const checkPageBreak = (y, requiredSpace = 30) => {
        if (y + requiredSpace > pageHeight - margin) {
            doc.addPage();
            return margin;
        }
        return y;
    };

    // ============================================================
    // COPERTINA
    // ============================================================
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Guida alla Creazione dei Contenuti', pageWidth / 2, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(14);
    doc.text(`Per: ${companyName}`, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Preset: ${presetData.name}`, pageWidth / 2, 37, { align: 'center' });

    yPosition = 60;

    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    addText(
        'Questa guida ti fornirà tutte le informazioni necessarie per personalizzare ' +
        'il tuo sito web con contenuti di qualità, immagini professionali e testi efficaci.',
        margin, yPosition
    );

    yPosition += 20;

    // ============================================================
    // INDICE
    // ============================================================
    yPosition = addSection('📋 Indice della Guida', yPosition);

    const sections = [
        '1. Panoramica del Sito Creato',
        '2. Struttura delle Pagine',
        '3. Linee Guida per i Testi',
        '4. Guida Completa alle Immagini',
        '5. Consigli per Foto Originali',
        '6. Risorse per Immagini Gratis',
        '7. Checklist Pre-Pubblicazione',
        '8. Supporto e Contatti'
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
    yPosition = margin;

    yPosition = addTitle('1. Panoramica del Sito Creato', yPosition, 16);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    yPosition += 10;
    addText(`Tipo di Attività: ${presetData.name}`, margin, yPosition, { bold: true });
    yPosition += 8;
    addText(`Descrizione: ${presetData.description}`, margin, yPosition);
    yPosition += 10;

    yPosition = addSection('📄 Pagine Create', yPosition);

    presetData.pages.forEach((page, idx) => {
        yPosition = checkPageBreak(yPosition, 15);
        addText(`${idx + 1}. ${page.charAt(0).toUpperCase() + page.slice(1)}`, margin + 5, yPosition, { bold: true });
        yPosition += 7;
    });

    // ============================================================
    // SEZIONE 2: Struttura Pagine
    // ============================================================
    doc.addPage();
    yPosition = margin;
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
    yPosition = margin;
    yPosition = addTitle('3. Linee Guida per i Testi', yPosition, 16);

    yPosition = addSection('✍️ Principi Fondamentali', yPosition);

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

    yPosition = addSection('🎯 Esempi Concreti', yPosition);

    const examples = [
        { bad: 'Vendiamo prodotti di alta qualità', good: 'Prodotti che durano nel tempo' },
        { bad: 'Offriamo servizi professionali', good: 'Servizi che risolvono i tuoi problemi' },
        { bad: 'Contattaci per informazioni', good: 'Chiamaci ora: rispondiamo in 24h' }
    ];

    examples.forEach(({ bad, good }) => {
        yPosition = checkPageBreak(yPosition, 20);
        doc.setFontSize(9);
        doc.setTextColor(200, 50, 50); // Red
        yPosition = addText(`❌ ${bad}`, margin, yPosition);
        yPosition += 6;
        doc.setTextColor(50, 150, 50); // Green
        yPosition = addText(`✓ ${good}`, margin, yPosition);
        yPosition += 10;
    });

    // ============================================================
    // SEZIONE 4: Guida Immagini
    // ============================================================
    doc.addPage();
    yPosition = margin;
    yPosition = addTitle('4. Guida Completa alle Immagini', yPosition, 16);

    yPosition = addSection('📐 Dimensioni Consigliate', yPosition);

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
    yPosition = margin;
    yPosition = addTitle('5. Consigli per Foto Originali', yPosition, 16);

    yPosition = addSection('📱 Scatto con Smartphone', yPosition);

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

    yPosition = addSection('🎨 Editing: Solo l\'Essenziale', yPosition);

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
    yPosition = margin;
    yPosition = addTitle('6. Risorse per Immagini di Qualità', yPosition, 16);

    yPosition = addSection('🆓 Siti di Foto Gratis (Royalty-Free)', yPosition);

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

    yPosition = addSection('💡 Consigli per la Ricerca', yPosition);

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
    yPosition = margin;
    yPosition = addTitle('7. Checklist Pre-Pubblicazione', yPosition, 16);

    yPosition = addSection('✅ Contenuti', yPosition);

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

    yPosition = addSection('🖼️ Immagini', yPosition);

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

    yPosition = addSection('📱 Mobile', yPosition);

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
    yPosition = margin;
    yPosition = addTitle('8. Supporto e Contatti', yPosition, 16);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);

    yPosition += 15;
    addText('Hai bisogno di aiuto con il tuo sito?', margin, yPosition, { bold: true });
    yPosition += 10;
    addText('Siamo qui per supportarti!', margin, yPosition);
    yPosition += 15;

    yPosition = addSection('📞 Contatti OperoCloud', yPosition);

    const contacts = [
        { label: 'Email:', value: 'ingo@operocloud.it' },
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

    // Footer
    yPosition = pageHeight - 40;
    doc.setFillColor(...primaryColor);
    doc.rect(0, yPosition, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    addText('Questa guida è stata generata da OperoCloud', margin, yPosition + 15);
    addText('Piattaforma CMS All-in-One per il tuo business', margin, yPosition + 23);

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    addText(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, margin, yPosition + 33);

    // Salva il PDF
    const fileName = `Guida_Contenuti_${companyName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    return fileName;
};
