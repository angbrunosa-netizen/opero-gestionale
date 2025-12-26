/**
 * Nome File: PageManager.js
 * Descrizione: Editor CMS con integrazione MediaPicker (Archivio S3).
 */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
    PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, 
    RectangleStackIcon, PhotoIcon 
} from '@heroicons/react/24/outline';

// Importa il nuovo modale
import MediaPickerModal from '../../shared/MediaPickerModal';

const PageManager = ({ dittaId }) => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selezioniOptions, setSelezioniOptions] = useState([]); // Selezione prodotti options

    // Stato per il Media Picker
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState(null); // { compIndex, fieldKey, isArray, arrayIndex }

    // Configurazione Quill
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'clean']
        ],
    };

    const AVAILABLE_BLOCKS = [
        { type: 'HERO', label: 'Banner Hero', icon: '🖼️', defaultData: {
            titolo: 'Benvenuti',
            sottotitolo: '',
            cta_text: '',
            allineamento: 'center',
            immagine_url: '',
            // Nuovi campi per personalizzazione stile
            titoloColore: '#ffffff',
            titoloFontSize: 'text-4xl md:text-6xl',
            titoloFontWeight: 'font-extrabold',
            titoloFont: 'Inter, sans-serif',
            sottotitoloColore: '#f3f4f6',
            sottotitoloFontSize: 'text-xl',
            sottotitoloFontWeight: 'font-medium',
            sottotitoloFont: 'Inter, sans-serif',
            ctaColoreTesto: '#ffffff',
            ctaColoreSfondo: '#2563eb',
            ctaColoreSfondoHover: '#1d4ed8',
            ctaLink: '#', // Nuovo campo per il link del pulsante
            // Opacità e overlay immagine
            immagineOpacita: 40,
            overlayColore: '#000000',
            overlayOpacita: 20,
            // Altezza blocco
            altezza: 'md',
            altezzaCustom: null,
            // Sfondo sezione
            backgroundColor: '#f3f4f6'
        } },
        { type: 'VETRINA', label: 'Vetrina Prodotti', icon: '🛍️', defaultData: { limit: 4, titolo: 'I Nostri Prodotti' } },
        { type: 'CATALOG_SELECTION', label: 'Selezione Prodotti', icon: '📦', defaultData: {
            selezione_id: null,
            layout: 'grid',
            prodotti_per_riga: 4,
            mostra_prezzo: true,
            mostra_giacenza: true,
            mostra_descrizione: true,
            mostra_ricerca: true,
            mostra_filtri: true,
            mostra_ordinamento: true,
            mostra_titolo: true,
            // Stili
            colore_sfondo: '#ffffff',
            colore_testo: '#1f2937',
            colore_accento: '#3b82f6',
            colore_sfondo_card: '#ffffff',
            raggio_bordo: 8,
            ombra: true,
            // Animazioni
            effetto_hover: 'scale',
            animazione_caricamento: 'fade',
            durata_transizione: 300,
            // Badges
            badge_sconto: true,
            badge_nuovo: false,
            badge_esaurito: true,
            // Card
            card_padding: 16,
            card_aspect_ratio: 'square'
        } },
        { type: 'HTML', label: 'HTML / Widget', icon: '📝', defaultData: {
            _activeTab: 'testo',
            html: '<h3>Titolo Sezione</h3><p>Scrivi qui il tuo contenuto...</p>',
            rawHtmlCode: '',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            textColor: '#333333',
            backgroundColor: '#ffffff',
            textAlign: 'left',
            // Social Media Embeds
            socialEmbed: {
                enabled: false,
                type: 'facebook',
                url: '',
                width: '100%',
                height: 'auto'
            },
            // Quick Actions
            quickActions: [],
            // Widgets
            widget: {
                enabled: false,
                type: 'map',
                url: '',
                width: '100%',
                height: '400px'
            },
            // Tracking & Analytics
            tracking: []
        } },
        { type: 'MAPS', label: 'Mappa', icon: '📍', defaultData: {
            lat: 41.90,
            lng: 12.49,
            zoom: 15,
            title: 'La Nostra Sede',
            address: 'Via Roma 1, Milano, Italia',
            googleMapsUrl: '',
            city: 'Milano',
            street: 'Via Roma 1',
            postalCode: '20121'
        } },
        { type: 'BLOG_LIST', label: 'Blog & News', icon: '📰', defaultData: {
            titolo: 'Ultime News',
            limite: 3,
            mostraData: true,
            mostraCategoria: true,
            mostraAutore: false,
            layout: 'grid',
            mostRecentOnly: false,
            categoriaSlug: ''
        } },
        { type: 'MEDIA_SOCIAL', label: 'Galleria & Social', icon: '📸', defaultData: { titolo: 'Seguici', layout: 'grid', facebook: '', instagram: '', images: [] } },
        { type: 'FLIP_CARD_GALLERY', label: 'Galleria Flip Card', icon: '🎴', defaultData: {
            titolo: 'La Nostra Galleria',
            sottotitolo: 'Scopri i nostri servizi',
            cards: [],
            layout: 'grid',
            colonne: 3,
            coloreSfondo: '#ffffff',
            coloreTesto: '#1f2937',
            coloreTitolo: '#111827',
            coloreCardSfondo: '#ffffff',
            coloreCardTesto: '#6b7280',
            raggioBordo: 12,
            ombra: true,
            effettoFlip: 'rotate',
            durataTransizione: 600,
            altezzaCard: 'md',
            mostraTitolo: true,
            mostraSottotitolo: true
        } },
        { type: 'DYNAMIC_IMAGE_GALLERY', label: 'Galleria Immagini Dinamica', icon: '🎨', defaultData: {
            titolo: 'La Nostra Galleria',
            sottotitolo: 'Scopri le nostre immagini',
            immagini: [],
            layout: 'carousel',
            effettoTransizione: 'slide',
            direzione: 'horizontal',
            autoplay: true,
            intervallo: 5000,
            mostraNavigatorio: true,
            mostraIndicatori: true,
            infiniteLoop: true,
            colonne: 3,
            coloreSfondo: '#ffffff',
            coloreTesto: '#1f2937',
            coloreTitolo: '#111827',
            raggioBordo: 12,
            ombra: true,
            altezza: 'md',
            mostraTitolo: true,
            mostraSottotitolo: true,
            zoomOnHover: true
        } },
        { type: 'GUIDE', label: 'Guida Interattiva', icon: '📖', defaultData: {
            title: 'Guida Interattiva',
            subtitle: 'Scopri come utilizzare il nostro servizio',
            theme: 'default',
            showGuide: false, // Imposta a true per mostrare la guida all'uso del componente
            tabs: [
                {
                    label: 'Panoramica',
                    icon: '👁️',
                    title: 'Panoramica Generale',
                    description: 'Benvenuto in questa guida interattiva. Utilizza i tab qui sopra per navigare tra le diverse sezioni.',
                    sections: [
                        {
                            title: 'Introduzione',
                            icon: '👋',
                            content: '<p>Questa guida ti aiuterà a capire tutte le funzionalità disponibili.</p>',
                            points: [
                                'Naviga tra i tab usando i pulsanti in alto',
                                'Usa i pulsanti Precedente/Successivo in basso',
                                'Segui gli esempi e i suggerimenti forniti'
                            ]
                        }
                    ],
                    tip: 'Clicca sui tab per navigare tra le sezioni della guida'
                }
            ]
        } }
    ];

    useEffect(() => { loadPages(); loadSelezioni(); }, [dittaId]);

    const loadPages = async () => {
        try {
            const res = await api.get(`/admin/cms/pages/${dittaId}`);
            setPages(res.data);
        } catch (error) { console.error("Errore pagine:", error); }
    };

    const loadSelezioni = async () => {
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/selezioni`);
            if (res.data.success) {
                setSelezioniOptions(res.data.data);
            }
        } catch (error) { console.error("Errore caricamento selezioni:", error); }
    };

    const selectPage = async (page) => {
        setLoading(true);
        setSelectedPage(page);
        try {
            const res = await api.get(`/admin/cms/page/${page.id}/components`);
            const parsedComponents = res.data.map(c => {
                let config = c.dati_config;
                if (typeof config === 'string') {
                    try { config = JSON.parse(config); } catch(e) {}
                }
                if (c.tipo_componente === 'MEDIA_SOCIAL' && typeof config.images === 'string') {
                     try { config.images = JSON.parse(config.images); } catch(e) { config.images = []; }
                }
                return { ...c, dati_config: config || {} };
            });
            setComponents(parsedComponents);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const addComponent = (type) => {
        const def = AVAILABLE_BLOCKS.find(b => b.type === type);
        setComponents([...components, { tipo_componente: type, dati_config: { ...def.defaultData } }]);
    };

    const updateConfig = (index, key, value) => {
        const newComps = [...components];
        newComps[index].dati_config = { ...newComps[index].dati_config, [key]: value };
        setComponents(newComps);
    };

    // --- LOGICA APERTURA MEDIA PICKER ---
    const openMediaPicker = (compIndex, fieldKey, isArray = false) => {
        setMediaPickerTarget({ compIndex, fieldKey, isArray });
        setIsMediaPickerOpen(true);
    };

    // --- CALLBACK QUANDO SI SELEZIONA UN'IMMAGINE ---
    const handleMediaSelect = (url) => {
        if (!mediaPickerTarget) return;
        const { compIndex, fieldKey, isArray } = mediaPickerTarget;

        if (isArray) {
            // Aggiungi a galleria
            const newComps = [...components];
            const currentImages = newComps[compIndex].dati_config[fieldKey] || [];
            const imgArray = Array.isArray(currentImages) ? currentImages : [];
            imgArray.push({ src: url, caption: '' });
            newComps[compIndex].dati_config[fieldKey] = imgArray;
            setComponents(newComps);
        } else if (fieldKey.startsWith('cards_')) {
            // Gestione immagini card FlipCardGallery (formato: cards_${cardIdx}_immagine)
            const parts = fieldKey.split('_');
            const cardIdx = parseInt(parts[1]);
            const newComps = [...components];
            if (!newComps[compIndex].dati_config.cards) newComps[compIndex].dati_config.cards = [];
            if (!newComps[compIndex].dati_config.cards[cardIdx]) newComps[compIndex].dati_config.cards[cardIdx] = {};
            newComps[compIndex].dati_config.cards[cardIdx].immagine = url;
            setComponents(newComps);
        } else if (fieldKey.startsWith('immagini_')) {
            // Gestione immagini DynamicImageGallery (formato: immagini_${imgIdx}_src)
            const parts = fieldKey.split('_');
            const imgIdx = parseInt(parts[1]);
            const newComps = [...components];
            if (!newComps[compIndex].dati_config.immagini) newComps[compIndex].dati_config.immagini = [];
            if (!newComps[compIndex].dati_config.immagini[imgIdx]) newComps[compIndex].dati_config.immagini[imgIdx] = {};
            newComps[compIndex].dati_config.immagini[imgIdx].src = url;
            setComponents(newComps);
        } else {
            // Sostituisci campo singolo (es. Hero background)
            updateConfig(compIndex, fieldKey, url);
        }
    };

    const removeImageFromGallery = (compIndex, imgIndex) => {
        const newComps = [...components];
        const imgArray = [...(newComps[compIndex].dati_config.images || [])];
        imgArray.splice(imgIndex, 1);
        newComps[compIndex].dati_config.images = imgArray;
        setComponents(newComps);
    };

    const moveComp = (idx, dir) => {
        if ((dir === -1 && idx === 0) || (dir === 1 && idx === components.length - 1)) return;
        const newComps = [...components];
        [newComps[idx], newComps[idx + dir]] = [newComps[idx + dir], newComps[idx]];
        setComponents(newComps);
    };

    const savePage = async () => {
        try {
            const compsToSave = components.map(c => ({ ...c, dati_config: { ...c.dati_config } }));
            await api.post(`/admin/cms/page/${selectedPage.id}/components`, { components: compsToSave });
            alert('Salvato!');
        } catch (e) { alert('Errore: ' + e.message); }
    };

    if (!selectedPage) return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Gestione Pagine</h3>
            <ul className="divide-y">
                {pages.map(p => (
                    <li key={p.id} onClick={() => selectPage(p)} className="py-3 px-2 hover:bg-gray-50 cursor-pointer flex justify-between rounded">
                        <span className="font-mono text-blue-600">/{p.slug}</span>
                        <span className="text-gray-500 text-sm">{p.titolo_seo}</span>
                    </li>
                ))}
            </ul>
             <button className="mt-4 text-sm text-blue-600 underline" onClick={() => {
                const slug = prompt("Slug nuova pagina:");
                if(slug) api.post('/admin/cms/pages', { id_ditta: dittaId, slug, titolo: slug, pubblicata: 1 }).then(loadPages);
             }}>+ Crea Pagina</button>
        </div>
    );

    return (
        <div className="flex h-full gap-6 items-start">
            {/* Toolbox */}
            <div className="w-64 bg-white rounded-lg shadow sticky top-0 p-4">
                <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase">Componenti</h4>
                <div className="space-y-2">
                    {AVAILABLE_BLOCKS.map(b => (
                        <button key={b.type} onClick={() => addComponent(b.type)} className="w-full flex items-center gap-2 p-2 border rounded hover:bg-blue-50 text-sm text-left">
                            <span>{b.icon}</span> {b.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => setSelectedPage(null)} className="mt-6 w-full text-sm text-gray-500">← Indietro</button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 space-y-4 pb-20">
                <div className="bg-white p-4 rounded shadow flex justify-between items-center sticky top-0 z-10 border-b">
                    <h2 className="font-bold text-lg">Modifica: /{selectedPage.slug}</h2>
                    <button onClick={savePage} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Salva Pagina</button>
                </div>

                {components.map((comp, i) => (
                    <div key={i} className="bg-white border rounded shadow-sm p-4 relative group">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <span className="font-bold text-blue-800 text-sm bg-blue-100 px-2 py-1 rounded">
                                {AVAILABLE_BLOCKS.find(b => b.type === comp.tipo_componente)?.label}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => moveComp(i, -1)} className="p-1 hover:text-black">⬆️</button>
                                <button onClick={() => moveComp(i, 1)} className="p-1 hover:text-black">⬇️</button>
                                <button onClick={() => {const newC = [...components]; newC.splice(i, 1); setComponents(newC);}} className="p-1 text-red-500">🗑️</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* --- HERO --- */}
                            {comp.tipo_componente === 'HERO' && (
                                <>
                                    {/* Contenuti Testuali */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">TITOLO</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} placeholder="Titolo principale" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">SOTTOTITOLO</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.sottotitolo || ''} onChange={e => updateConfig(i, 'sottotitolo', e.target.value)} placeholder="Sottotitolo descrittivo" />
                                        </div>
                                    </div>

                                    {/* Stile Testo - Titolo */}
                                    <div className="mb-4 p-4 bg-purple-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Stile Titolo</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Titolo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.titoloColore || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'titoloColore', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.titoloColore || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'titoloColore', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Font Titolo</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.titoloFont || 'Inter, sans-serif'}
                                                    onChange={e => updateConfig(i, 'titoloFont', e.target.value)}
                                                >
                                                    <option value="Inter, sans-serif">Inter (Modern)</option>
                                                    <option value="Arial, sans-serif">Arial (Classic)</option>
                                                    <option value="Helvetica, sans-serif">Helvetica (Clean)</option>
                                                    <option value="Georgia, serif">Georgia (Elegant)</option>
                                                    <option value="Times New Roman, serif">Times New Roman (Traditional)</option>
                                                    <option value="Courier New, monospace">Courier New (Monospace)</option>
                                                    <option value="Verdana, sans-serif">Verdana (Web Safe)</option>
                                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS (Friendly)</option>
                                                    <option value="Palatino, serif">Palatino (Literary)</option>
                                                    <option value="Garamond, serif">Garamond (Sophisticated)</option>
                                                    <option value="Comic Sans MS, cursive">Comic Sans MS (Playful)</option>
                                                    <option value="Impact, sans-serif">Impact (Bold)</option>
                                                    <option value="Lucida Console, monospace">Lucida Console (Technical)</option>
                                                    <option value="Roboto, sans-serif">Roboto (Google)</option>
                                                    <option value="Open Sans, sans-serif">Open Sans (Friendly)</option>
                                                    <option value="Lato, sans-serif">Lato (Soft)</option>
                                                    <option value="Montserrat, sans-serif">Montserrat (Modern)</option>
                                                    <option value="Oswald, sans-serif">Oswald (Strong)</option>
                                                    <option value="Raleway, sans-serif">Raleway (Elegant)</option>
                                                    <option value="Playfair Display, serif">Playfair Display (Luxury)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Dimensione</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.titoloFontSize || 'text-4xl md:text-6xl'}
                                                    onChange={e => updateConfig(i, 'titoloFontSize', e.target.value)}
                                                >
                                                    <option value="text-2xl md:text-3xl">Piccolo</option>
                                                    <option value="text-3xl md:text-4xl">Medio</option>
                                                    <option value="text-4xl md:text-5xl">Grande</option>
                                                    <option value="text-4xl md:text-6xl">Molto Grande</option>
                                                    <option value="text-5xl md:text-7xl">Enorme</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Grassetto</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.titoloFontWeight || 'font-extrabold'}
                                                    onChange={e => updateConfig(i, 'titoloFontWeight', e.target.value)}
                                                >
                                                    <option value="font-normal">Normale</option>
                                                    <option value="font-medium">Medio</option>
                                                    <option value="font-semibold">Semi-grassetto</option>
                                                    <option value="font-bold">Grassetto</option>
                                                    <option value="font-extrabold">Extra-grassetto</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stile Testo - Sottotitolo */}
                                    <div className="mb-4 p-4 bg-blue-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Stile Sottotitolo</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sottotitolo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.sottotitoloColore || '#f3f4f6'}
                                                        onChange={e => updateConfig(i, 'sottotitoloColore', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.sottotitoloColore || '#f3f4f6'}
                                                        onChange={e => updateConfig(i, 'sottotitoloColore', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Font Sottotitolo</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.sottotitoloFont || 'Inter, sans-serif'}
                                                    onChange={e => updateConfig(i, 'sottotitoloFont', e.target.value)}
                                                >
                                                    <option value="Inter, sans-serif">Inter (Modern)</option>
                                                    <option value="Arial, sans-serif">Arial (Classic)</option>
                                                    <option value="Helvetica, sans-serif">Helvetica (Clean)</option>
                                                    <option value="Georgia, serif">Georgia (Elegant)</option>
                                                    <option value="Times New Roman, serif">Times New Roman (Traditional)</option>
                                                    <option value="Courier New, monospace">Courier New (Monospace)</option>
                                                    <option value="Verdana, sans-serif">Verdana (Web Safe)</option>
                                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS (Friendly)</option>
                                                    <option value="Palatino, serif">Palatino (Literary)</option>
                                                    <option value="Garamond, serif">Garamond (Sophisticated)</option>
                                                    <option value="Comic Sans MS, cursive">Comic Sans MS (Playful)</option>
                                                    <option value="Impact, sans-serif">Impact (Bold)</option>
                                                    <option value="Lucida Console, monospace">Lucida Console (Technical)</option>
                                                    <option value="Roboto, sans-serif">Roboto (Google)</option>
                                                    <option value="Open Sans, sans-serif">Open Sans (Friendly)</option>
                                                    <option value="Lato, sans-serif">Lato (Soft)</option>
                                                    <option value="Montserrat, sans-serif">Montserrat (Modern)</option>
                                                    <option value="Oswald, sans-serif">Oswald (Strong)</option>
                                                    <option value="Raleway, sans-serif">Raleway (Elegant)</option>
                                                    <option value="Playfair Display, serif">Playfair Display (Luxury)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Dimensione</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.sottotitoloFontSize || 'text-xl'}
                                                    onChange={e => updateConfig(i, 'sottotitoloFontSize', e.target.value)}
                                                >
                                                    <option value="text-sm">Piccolo</option>
                                                    <option value="text-base">Normale</option>
                                                    <option value="text-lg">Grande</option>
                                                    <option value="text-xl">Molto Grande</option>
                                                    <option value="text-2xl">Enorme</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Grassetto</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.sottotitoloFontWeight || 'font-medium'}
                                                    onChange={e => updateConfig(i, 'sottotitoloFontWeight', e.target.value)}
                                                >
                                                    <option value="font-normal">Normale</option>
                                                    <option value="font-medium">Medio</option>
                                                    <option value="font-semibold">Semi-grassetto</option>
                                                    <option value="font-bold">Grassetto</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stile CTA */}
                                    <div className="mb-4 p-4 bg-green-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Stile Pulsante CTA</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Testo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.ctaColoreTesto || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'ctaColoreTesto', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.ctaColoreTesto || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'ctaColoreTesto', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.ctaColoreSfondo || '#2563eb'}
                                                        onChange={e => updateConfig(i, 'ctaColoreSfondo', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.ctaColoreSfondo || '#2563eb'}
                                                        onChange={e => updateConfig(i, 'ctaColoreSfondo', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Testo Pulsante</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.cta_text || ''} onChange={e => updateConfig(i, 'cta_text', e.target.value)} placeholder="Scopri di più" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Link Pulsante</label>
                                            <input type="url" className="w-full border p-2 rounded text-sm" value={comp.dati_config.ctaLink || ''} onChange={e => updateConfig(i, 'ctaLink', e.target.value)} placeholder="https://esempio.com/pagina" />
                                        </div>
                                    </div>

                                    {/* Immagine e Overlay */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Immagine e Overlay</h4>
                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">IMMAGINE SFONDO</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="text" className="flex-1 border p-2 rounded text-sm bg-gray-50" value={comp.dati_config.immagine_url || ''} readOnly />
                                                <button
                                                    onClick={() => openMediaPicker(i, 'immagine_url', false)}
                                                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                                                >
                                                    <PhotoIcon className="h-4 w-4"/> Seleziona
                                                </button>
                                            </div>
                                            {/* Info dimensioni consigliate */}
                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                <p className="text-xs text-blue-800">
                                                    <span className="font-bold">💡 Dimensioni consigliate:</span> 1920×800px (rapporto 16:7)
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    L'immagine verrà adattata automaticamente mantenendo le proporzioni. Usa immagini orizzontali per il risultato migliore.
                                                </p>
                                            </div>
                                            {comp.dati_config.immagine_url && <img src={comp.dati_config.immagine_url} alt="Preview" className="h-20 mt-2 rounded border object-cover" />}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Opacità Immagine</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        className="flex-1"
                                                        value={comp.dati_config.immagineOpacita || 40}
                                                        onChange={e => updateConfig(i, 'immagineOpacita', parseInt(e.target.value))}
                                                    />
                                                    <span className="text-xs text-gray-500 w-12">{comp.dati_config.immagineOpacita || 40}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Overlay</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.overlayColore || '#000000'}
                                                        onChange={e => updateConfig(i, 'overlayColore', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.overlayColore || '#000000'}
                                                        onChange={e => updateConfig(i, 'overlayColore', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Opacità Overlay</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        className="flex-1"
                                                        value={comp.dati_config.overlayOpacita || 20}
                                                        onChange={e => updateConfig(i, 'overlayOpacita', parseInt(e.target.value))}
                                                    />
                                                    <span className="text-xs text-gray-500 w-12">{comp.dati_config.overlayOpacita || 20}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sfondo Sezione */}
                                    <div className="mb-4 p-4 bg-yellow-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Sfondo Sezione</h4>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo (se non c'è immagine)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    className="w-12 h-8 border rounded cursor-pointer"
                                                    value={comp.dati_config.backgroundColor || '#f3f4f6'}
                                                    onChange={e => updateConfig(i, 'backgroundColor', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 border p-2 rounded text-sm"
                                                    value={comp.dati_config.backgroundColor || '#f3f4f6'}
                                                    onChange={e => updateConfig(i, 'backgroundColor', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Altezza Blocco */}
                                    <div className="mb-4 p-4 bg-orange-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Altezza Blocco</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Altezza Predefinita</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.altezza || 'md'}
                                                    onChange={e => updateConfig(i, 'altezza', e.target.value)}
                                                >
                                                    <option value="xs">Piccola (300px)</option>
                                                    <option value="sm">Media-Piccola (400px)</option>
                                                    <option value="md">Media (500px)</option>
                                                    <option value="lg">Grande (600px)</option>
                                                    <option value="xl">Molto Grande (700px)</option>
                                                    <option value="2xl">Enorme (800px)</option>
                                                    <option value="custom">Personalizzata</option>
                                                </select>
                                            </div>
                                            {comp.dati_config.altezza === 'custom' && (
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Altezza Personalizzata (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border p-2 rounded text-sm"
                                                        value={comp.dati_config.altezzaCustom || 500}
                                                        onChange={e => updateConfig(i, 'altezzaCustom', parseInt(e.target.value) || 500)}
                                                        min="200"
                                                        max="1200"
                                                        placeholder="500"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Min: 200px, Max: 1200px</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- HTML / WIDGET --- */}
                            {comp.tipo_componente === 'HTML' && (
                                <>
                                    {/* Tabs per le diverse sezioni */}
                                    <div className="mb-4 border-b">
                                        <nav className="flex gap-4">
                                            {['Testo', 'Codice HTML', 'Social Embed', 'Quick Actions', 'Widget', 'Tracking'].map((tab, idx) => {
                                                const tabKeys = ['testo', 'codice', 'social', 'actions', 'widget', 'tracking'];
                                                const activeTab = comp.dati_config._activeTab || 'testo';
                                                return (
                                                    <button
                                                        key={tab}
                                                        onClick={() => updateConfig(i, '_activeTab', tabKeys[idx])}
                                                        className={`py-2 px-4 text-sm font-medium border-b-2 transition ${
                                                            activeTab === tabKeys[idx]
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                );
                                            })}
                                        </nav>
                                    </div>

                                    {/* TAB: TESTO */}
                                    {comp.dati_config._activeTab === 'testo' && (
                                        <>
                                            {/* Stile Testo */}
                                            <div className="mb-4 p-4 bg-gray-50 rounded border">
                                                <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Stile Testo</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Font Family</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config.fontFamily || 'Arial, sans-serif'}
                                                            onChange={e => updateConfig(i, 'fontFamily', e.target.value)}
                                                        >
                                                            <option value="Arial, sans-serif">Arial</option>
                                                            <option value="Helvetica, sans-serif">Helvetica</option>
                                                            <option value="Times New Roman, serif">Times New Roman</option>
                                                            <option value="Georgia, serif">Georgia</option>
                                                            <option value="Courier New, monospace">Courier New</option>
                                                            <option value="Verdana, sans-serif">Verdana</option>
                                                            <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Dimensione Testo</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config.fontSize || '16px'}
                                                            onChange={e => updateConfig(i, 'fontSize', e.target.value)}
                                                        >
                                                            <option value="12px">12px</option>
                                                            <option value="14px">14px</option>
                                                            <option value="16px">16px</option>
                                                            <option value="18px">18px</option>
                                                            <option value="20px">20px</option>
                                                            <option value="24px">24px</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Colore Testo</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                className="w-12 h-8 border rounded cursor-pointer"
                                                                value={comp.dati_config.textColor || '#333333'}
                                                                onChange={e => updateConfig(i, 'textColor', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="flex-1 border p-2 rounded text-sm"
                                                                value={comp.dati_config.textColor || '#333333'}
                                                                onChange={e => updateConfig(i, 'textColor', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="color"
                                                                className="w-12 h-8 border rounded cursor-pointer"
                                                                value={comp.dati_config.backgroundColor || '#ffffff'}
                                                                onChange={e => updateConfig(i, 'backgroundColor', e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                className="flex-1 border p-2 rounded text-sm"
                                                                value={comp.dati_config.backgroundColor || '#ffffff'}
                                                                onChange={e => updateConfig(i, 'backgroundColor', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Allineamento</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config.textAlign || 'left'}
                                                            onChange={e => updateConfig(i, 'textAlign', e.target.value)}
                                                        >
                                                            <option value="left">Sinistra</option>
                                                            <option value="center">Centro</option>
                                                            <option value="right">Destra</option>
                                                            <option value="justify">Giustificato</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Editor HTML */}
                                            <div className="h-64 mb-4">
                                                <label className="text-xs font-bold text-gray-500 mb-1 block">CONTENUTO HTML</label>
                                                <ReactQuill
                                                    theme="snow"
                                                    value={comp.dati_config.html || ''}
                                                    onChange={(val) => updateConfig(i, 'html', val)}
                                                    modules={quillModules}
                                                    className="h-48"
                                                />
                                            </div>

                                            {/* Anteprima */}
                                            <div className="p-4 border rounded bg-white">
                                                <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Anteprima</h4>
                                                <div
                                                    style={{
                                                        fontFamily: comp.dati_config.fontFamily || 'Arial, sans-serif',
                                                        fontSize: comp.dati_config.fontSize || '16px',
                                                        color: comp.dati_config.textColor || '#333333',
                                                        backgroundColor: comp.dati_config.backgroundColor || '#ffffff',
                                                        textAlign: comp.dati_config.textAlign || 'left',
                                                        padding: '16px',
                                                        borderRadius: '4px',
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: comp.dati_config.html || '<p>Anteprima...</p>' }}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* TAB: CODICE HTML (RAW CODE) */}
                                    {comp.dati_config._activeTab === 'codice' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-indigo-50 rounded border border-indigo-200">
                                                <h4 className="text-sm font-bold text-indigo-900 mb-2">💻 Codice HTML Personalizzato</h4>
                                                <p className="text-xs text-indigo-700">Inserisci codice HTML, iframe, script di terze parti o qualsiasi codice di embed</p>
                                            </div>

                                            {/* Editor Codice HTML */}
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Codice HTML / JavaScript / iframe</label>
                                                <textarea
                                                    className="w-full border p-3 rounded text-sm font-mono h-64 bg-gray-900 text-green-400"
                                                    value={comp.dati_config.rawHtmlCode || ''}
                                                    onChange={e => updateConfig(i, 'rawHtmlCode', e.target.value)}
                                                    placeholder="<!-- Inserisci qui il tuo codice HTML -->&#10;<div>&#10;  <h1>Titolo</h1>&#10;  <p>Contenuto...</p>&#10;</div>&#;&#10;<script>&#10;  // Il tuo JavaScript&#10;</script>&#;&#10;<iframe src='...' ...></iframe>"
                                                    spellCheck={false}
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    ⚠️ <strong>Attenzione:</strong> Il codice inserito verrà renderizzato così com'è. Usa con cautela.
                                                    Puoi inserire: iframe, script, link, qualsiasi tag HTML.
                                                </p>
                                            </div>

                                            {/* Esempi di codice */}
                                            <div className="border rounded p-4 bg-gray-50">
                                                <h5 className="text-xs font-bold text-gray-700 uppercase mb-3">Esempi di Codice</h5>

                                                {/* Google Maps Embed */}
                                                <details className="mb-3">
                                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                                        📍 Google Maps Embed
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-white border rounded text-xs overflow-x-auto">
{`<iframe
  src="https://www.google.com/maps/embed?pb=..."
  width="100%"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy">
</iframe>`}
                                                    </pre>
                                                    <button
                                                        onClick={() => updateConfig(i, 'rawHtmlCode', '<iframe src="https://www.google.com/maps/embed?pb=..." width="100%" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>')}
                                                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Usa questo esempio
                                                    </button>
                                                </details>

                                                {/* YouTube Embed */}
                                                <details className="mb-3">
                                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                                        🎥 YouTube Video Embed
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-white border rounded text-xs overflow-x-auto">
{`<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube video"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>`}
                                                    </pre>
                                                    <button
                                                        onClick={() => updateConfig(i, 'rawHtmlCode', '<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')}
                                                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Usa questo esempio
                                                    </button>
                                                </details>

                                                {/* Custom Script */}
                                                <details className="mb-3">
                                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                                        📜 Script JavaScript Personalizzato
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-white border rounded text-xs overflow-x-auto">
{`<script>
  console.log('Script eseguito!');
  // Il tuo codice qui
</script>`}
                                                    </pre>
                                                    <button
                                                        onClick={() => updateConfig(i, 'rawHtmlCode', '<script>console.log("Script eseguito!");</script>')}
                                                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Usa questo esempio
                                                    </button>
                                                </details>

                                                {/* Calendly Embed */}
                                                <details>
                                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                                                        📅 Calendly Embed
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-white border rounded text-xs overflow-x-auto">
{`<!-- Calendly inline widget begin -->
<div class="calendly-inline-widget"
  data-url="https://calendly.com/YOUR_LINK"
  style="min-width:320px;height:630px;">
</div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js"></script>
<!-- Calendly inline widget end -->`}
                                                    </pre>
                                                    <button
                                                        onClick={() => updateConfig(i, 'rawHtmlCode', '<div class="calendly-inline-widget" data-url="https://calendly.com/YOUR_LINK" style="min-width:320px;height:630px;"></div><script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js"></script>')}
                                                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Usa questo esempio
                                                    </button>
                                                </details>
                                            </div>

                                            {/* Anteprima del codice */}
                                            {comp.dati_config.rawHtmlCode && (
                                                <div className="border rounded p-4 bg-white">
                                                    <h5 className="text-xs font-bold text-gray-700 mb-3 uppercase">Anteprima Codice</h5>
                                                    <div className="border rounded p-4 bg-gray-50 min-h-[100px]">
                                                        <div dangerouslySetInnerHTML={{ __html: comp.dati_config.rawHtmlCode }} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        💡 L'anteprima mostra come apparirà il codice nella pagina
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB: SOCIAL EMBED */}
                                    {comp.dati_config._activeTab === 'social' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 rounded border border-blue-200">
                                                <h4 className="text-sm font-bold text-blue-900 mb-2">📱 Social Media Embeds</h4>
                                                <p className="text-xs text-blue-700">Incora post e contenuti da Facebook, Instagram, Twitter, YouTube, TikTok, LinkedIn, Pinterest</p>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Piattaforma</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.socialEmbed?.type || 'facebook'}
                                                    onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, type: e.target.value })}
                                                >
                                                    <option value="facebook">Facebook</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="twitter">Twitter/X</option>
                                                    <option value="youtube">YouTube</option>
                                                    <option value="tiktok">TikTok</option>
                                                    <option value="linkedin">LinkedIn</option>
                                                    <option value="pinterest">Pinterest</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">URL Post/Video</label>
                                                <input
                                                    type="text"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.socialEmbed?.url || ''}
                                                    onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, url: e.target.value })}
                                                    placeholder="https://www.facebook.com/posts/..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Incolla l'URL del post o video da incorporare</p>
                                            </div>

                                            {/* Dimensioni Embed */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Larghezza</label>
                                                    <select
                                                        className="w-full border p-2 rounded text-sm"
                                                        value={comp.dati_config.socialEmbed?.width || '100%'}
                                                        onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, width: e.target.value })}
                                                    >
                                                        <option value="100%">Automatica (100%)</option>
                                                        <option value="320px">Piccola (320px) - Mobile</option>
                                                        <option value="400px">Media (400px) - Post Standard</option>
                                                        <option value="500px">Grande (500px) - Post HD</option>
                                                        <option value="600px">Molto Grande (600px)</option>
                                                        <option value="custom">Personalizzata</option>
                                                    </select>
                                                    {comp.dati_config.socialEmbed?.width === 'custom' && (
                                                        <input
                                                            type="number"
                                                            className="w-full border p-2 rounded text-sm mt-2"
                                                            value={comp.dati_config.socialEmbed?.widthCustom || 500}
                                                            onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, widthCustom: e.target.value })}
                                                            min="200"
                                                            max="1200"
                                                            placeholder="500"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Altezza</label>
                                                    <select
                                                        className="w-full border p-2 rounded text-sm"
                                                        value={comp.dati_config.socialEmbed?.height || 'auto'}
                                                        onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, height: e.target.value })}
                                                    >
                                                        <option value="auto">Automatica (Auto)</option>
                                                        <option value="400px">Piccola (400px)</option>
                                                        <option value="500px">Media (500px)</option>
                                                        <option value="600px">Grande (600px)</option>
                                                        <option value="700px">Molto Grande (700px)</option>
                                                        <option value="800px">Enorme (800px)</option>
                                                        <option value="custom">Personalizzata</option>
                                                    </select>
                                                    {comp.dati_config.socialEmbed?.height === 'custom' && (
                                                        <input
                                                            type="number"
                                                            className="w-full border p-2 rounded text-sm mt-2"
                                                            value={comp.dati_config.socialEmbed?.heightCustom || 600}
                                                            onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, heightCustom: e.target.value })}
                                                            min="200"
                                                            max="2000"
                                                            placeholder="600"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Suggerimenti dimensioni */}
                                            <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                                <p className="text-xs font-bold text-yellow-800 mb-1">💡 Suggerimenti per piattaforma:</p>
                                                <ul className="text-xs text-yellow-700 space-y-0.5">
                                                    <li><strong>Instagram/Facebook Post:</strong> 400-500px larghezza, auto altezza</li>
                                                    <li><strong>YouTube:</strong> 100% larghezza, 400-600px altezza</li>
                                                    <li><strong>Twitter/X:</strong> 400-500px larghezza, auto altezza</li>
                                                    <li><strong>LinkedIn:</strong> 400-600px larghezza, auto altezza</li>
                                                </ul>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="socialEnabled"
                                                    checked={comp.dati_config.socialEmbed?.enabled || false}
                                                    onChange={e => updateConfig(i, 'socialEmbed', { ...comp.dati_config.socialEmbed, enabled: e.target.checked })}
                                                    className="rounded"
                                                />
                                                <label htmlFor="socialEnabled" className="text-sm text-gray-700">Attiva Social Embed</label>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: QUICK ACTIONS */}
                                    {comp.dati_config._activeTab === 'actions' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 rounded border border-green-200">
                                                <h4 className="text-sm font-bold text-green-900 mb-2">⚡ Quick Actions</h4>
                                                <p className="text-xs text-green-700">Pulsanti per WhatsApp, Telefono, Email, Download, Link</p>
                                            </div>

                                            {/* Lista Quick Actions esistenti */}
                                            {comp.dati_config.quickActions && comp.dati_config.quickActions.length > 0 && (
                                                <div className="border rounded p-4 space-y-3">
                                                    <h5 className="text-xs font-bold text-gray-700 uppercase">Quick Actions Configurate</h5>
                                                    {comp.dati_config.quickActions.map((action, actionIdx) => (
                                                        <div key={actionIdx} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                                            <span className="text-2xl">{action.icon || '🔗'}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm truncate">{action.label}</div>
                                                                <div className="text-xs text-gray-500 truncate">
                                                                    {action.type}: {action.value}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const newActions = [...comp.dati_config.quickActions];
                                                                    newActions.splice(actionIdx, 1);
                                                                    updateConfig(i, 'quickActions', newActions);
                                                                }}
                                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                                title="Rimuovi"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Form Aggiungi Quick Action */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                <h5 className="text-xs font-bold text-gray-700 uppercase mb-3">Aggiungi Nuova Quick Action</h5>

                                                <div className="space-y-3">
                                                    {/* Tipo */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Tipo Azione</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.type || 'whatsapp'}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, type: e.target.value })}
                                                        >
                                                            <option value="whatsapp">💬 WhatsApp</option>
                                                            <option value="phone">📞 Telefono</option>
                                                            <option value="email">✉️ Email</option>
                                                            <option value="download">📥 Download</option>
                                                            <option value="link">🔗 Link Esterno</option>
                                                        </select>
                                                    </div>

                                                    {/* Label */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Testo Pulsante</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.label || ''}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, label: e.target.value })}
                                                            placeholder="Es: Contattaci su WhatsApp"
                                                        />
                                                    </div>

                                                    {/* Value */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">
                                                            {comp.dati_config._newAction?.type === 'whatsapp' && 'Numero WhatsApp (con prefisso)'}
                                                            {comp.dati_config._newAction?.type === 'phone' && 'Numero di Telefono'}
                                                            {comp.dati_config._newAction?.type === 'email' && 'Indirizzo Email'}
                                                            {comp.dati_config._newAction?.type === 'download' && 'URL File / PDF'}
                                                            {comp.dati_config._newAction?.type === 'link' && 'URL Link'}
                                                            {!comp.dati_config._newAction?.type && 'Valore'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.value || ''}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, value: e.target.value })}
                                                            placeholder={
                                                                comp.dati_config._newAction?.type === 'whatsapp' ? '+39123456789' :
                                                                comp.dati_config._newAction?.type === 'phone' ? '+39123456789' :
                                                                comp.dati_config._newAction?.type === 'email' ? 'info@azienda.it' :
                                                                comp.dati_config._newAction?.type === 'download' ? 'https://...' :
                                                                comp.dati_config._newAction?.type === 'link' ? 'https://...' :
                                                                'Valore...'
                                                            }
                                                        />
                                                    </div>

                                                    {/* Icon */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Icona (Emoji)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.icon || '💬'}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, icon: e.target.value })}
                                                            placeholder="💬"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Suggerimenti: 💬 📞 ✉️ 📥 🔗 🌐 📱</p>
                                                    </div>

                                                    {/* Style */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Stile Pulsante</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.style || 'primary'}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, style: e.target.value })}
                                                        >
                                                            <option value="primary">Primary (Blu)</option>
                                                            <option value="secondary">Secondary (Grigio)</option>
                                                            <option value="success">Success (Verde)</option>
                                                            <option value="danger">Danger (Rosso)</option>
                                                            <option value="outline">Outline (Bordo)</option>
                                                            <option value="ghost">Ghost (Trasparente)</option>
                                                        </select>
                                                    </div>

                                                    {/* Size */}
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Dimensione</label>
                                                        <select
                                                            className="w-full border p-2 rounded text-sm"
                                                            value={comp.dati_config._newAction?.size || 'medium'}
                                                            onChange={e => updateConfig(i, '_newAction', { ...comp.dati_config._newAction, size: e.target.value })}
                                                        >
                                                            <option value="small">Piccolo</option>
                                                            <option value="medium">Medio</option>
                                                            <option value="large">Grande</option>
                                                        </select>
                                                    </div>

                                                    {/* Pulsante Aggiungi */}
                                                    <button
                                                        onClick={() => {
                                                            const newAction = {
                                                                type: comp.dati_config._newAction?.type || 'whatsapp',
                                                                label: comp.dati_config._newAction?.label || 'Contattaci',
                                                                value: comp.dati_config._newAction?.value || '',
                                                                icon: comp.dati_config._newAction?.icon || '💬',
                                                                style: comp.dati_config._newAction?.style || 'primary',
                                                                size: comp.dati_config._newAction?.size || 'medium'
                                                            };

                                                            if (!newAction.value) {
                                                                alert('Inserisci il valore (numero, email o URL)');
                                                                return;
                                                            }

                                                            const currentActions = comp.dati_config.quickActions || [];
                                                            updateConfig(i, 'quickActions', [...currentActions, newAction]);
                                                            updateConfig(i, '_newAction', {}); // Reset form
                                                        }}
                                                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition font-medium text-sm"
                                                    >
                                                        + Aggiungi Quick Action
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Anteprima */}
                                            {(comp.dati_config.quickActions && comp.dati_config.quickActions.length > 0) && (
                                                <div className="p-4 border rounded bg-white">
                                                    <h5 className="text-xs font-bold text-gray-700 mb-3 uppercase">Anteprima Quick Actions</h5>
                                                    <div className="flex flex-wrap gap-3">
                                                        {comp.dati_config.quickActions.map((action, idx) => {
                                                            const styleClasses = {
                                                                primary: 'bg-blue-600 text-white hover:bg-blue-700',
                                                                secondary: 'bg-gray-600 text-white hover:bg-gray-700',
                                                                success: 'bg-green-600 text-white hover:bg-green-700',
                                                                danger: 'bg-red-600 text-white hover:bg-red-700',
                                                                outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
                                                                ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
                                                            };

                                                            const sizeClasses = {
                                                                small: 'px-3 py-1 text-sm',
                                                                medium: 'px-4 py-2 text-base',
                                                                large: 'px-6 py-3 text-lg'
                                                            };

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    className={`flex items-center gap-2 rounded font-medium transition ${sizeClasses[action.size] || sizeClasses.medium} ${styleClasses[action.style] || styleClasses.primary}`}
                                                                >
                                                                    <span>{action.icon}</span>
                                                                    {action.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB: WIDGET */}
                                    {comp.dati_config._activeTab === 'widget' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-purple-50 rounded border border-purple-200">
                                                <h4 className="text-sm font-bold text-purple-900 mb-2">🎨 Widgets</h4>
                                                <p className="text-xs text-purple-700">Google Maps, Vimeo, Calendly, Typeform, ecc.</p>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Tipo Widget</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.widget?.type || 'map'}
                                                    onChange={e => updateConfig(i, 'widget', { ...comp.dati_config.widget, type: e.target.value })}
                                                >
                                                    <option value="map">Google Maps</option>
                                                    <option value="vimeo">Vimeo Video</option>
                                                    <option value="calendly">Calendly</option>
                                                    <option value="typeform">Typeform</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">URL Widget / Embed Code</label>
                                                <textarea
                                                    className="w-full border p-2 rounded text-sm h-24"
                                                    value={comp.dati_config.widget?.url || ''}
                                                    onChange={e => updateConfig(i, 'widget', { ...comp.dati_config.widget, url: e.target.value })}
                                                    placeholder="Incolla l'URL o codice embed..."
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="widgetEnabled"
                                                    checked={comp.dati_config.widget?.enabled || false}
                                                    onChange={e => updateConfig(i, 'widget', { ...comp.dati_config.widget, enabled: e.target.checked })}
                                                    className="rounded"
                                                />
                                                <label htmlFor="widgetEnabled" className="text-sm text-gray-700">Attiva Widget</label>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: TRACKING */}
                                    {comp.dati_config._activeTab === 'tracking' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-orange-50 rounded border border-orange-200">
                                                <h4 className="text-sm font-bold text-orange-900 mb-2">📊 Tracking & Analytics</h4>
                                                <p className="text-xs text-orange-700">Google Analytics 4, Facebook Pixel, Hotjar, Script personalizzati</p>
                                            </div>

                                            <div className="border rounded p-4">
                                                <p className="text-sm text-gray-500 text-center py-4">
                                                    Tracking configuration coming soon...
                                                    <br />
                                                    <span className="text-xs">Configurazione tramite JSON nell'editor HTML</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* --- MEDIA_SOCIAL --- */}
                            {comp.tipo_componente === 'MEDIA_SOCIAL' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">TITOLO SEZIONE</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">LINK FACEBOOK</label>
                                            <input type="url" className="w-full border p-2 rounded text-sm" value={comp.dati_config.facebook || ''} onChange={e => updateConfig(i, 'facebook', e.target.value)} placeholder="https://facebook.com/tua-pagina" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">LINK INSTAGRAM</label>
                                            <input type="url" className="w-full border p-2 rounded text-sm" value={comp.dati_config.instagram || ''} onChange={e => updateConfig(i, 'instagram', e.target.value)} placeholder="https://instagram.com/tuo-profile" />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded border">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-xs font-bold text-gray-700">GALLERIA FOTO</label>
                                            {/* PULSANTE CHE APRE IL MEDIA PICKER PER GALLERIA */}
                                            <button
                                                onClick={() => openMediaPicker(i, 'images', true)}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <PlusIcon className="h-3 w-3" /> Aggiungi Foto
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {(comp.dati_config.images || []).map((img, imgIdx) => (
                                                <div key={imgIdx} className="relative w-24 h-24 border rounded overflow-hidden group">
                                                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                                                    <button onClick={() => removeImageFromGallery(i, imgIdx)} className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!comp.dati_config.images?.length) && <p className="text-xs text-gray-400">Nessuna foto.</p>}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- MAPS --- */}
                            {comp.tipo_componente === 'MAPS' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">TITOLO MAPPA</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.title || ''} onChange={e => updateConfig(i, 'title', e.target.value)} placeholder="La Nostra Sede" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">LATITUDINE</label>
                                            <input type="number" step="0.000001" className="w-full border p-2 rounded text-sm" value={comp.dati_config.lat || ''} onChange={e => updateConfig(i, 'lat', parseFloat(e.target.value))} placeholder="41.902784" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">LONGITUDINE</label>
                                            <input type="number" step="0.000001" className="w-full border p-2 rounded text-sm" value={comp.dati_config.lng || ''} onChange={e => updateConfig(i, 'lng', parseFloat(e.target.value))} placeholder="12.496366" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">CITTÀ</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.city || ''} onChange={e => updateConfig(i, 'city', e.target.value)} placeholder="Milano" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">CAP</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.postalCode || ''} onChange={e => updateConfig(i, 'postalCode', e.target.value)} placeholder="20121" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">INDIRIZZO COMPLETO</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.address || ''} onChange={e => updateConfig(i, 'address', e.target.value)} placeholder="Via Roma 1, Milano, Italia" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">LINK GOOGLE MAPS (opzionale)</label>
                                        <input type="url" className="w-full border p-2 rounded text-sm" value={comp.dati_config.googleMapsUrl || ''} onChange={e => updateConfig(i, 'googleMapsUrl', e.target.value)} placeholder="https://maps.google.com/?q=lat,lng" />
                                        <p className="text-xs text-gray-400 mt-1">Incolla qui il link diretto a Google Maps per la tua attività</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">LIVELLO ZOOM (1-20)</label>
                                        <input type="range" min="1" max="20" className="w-full" value={comp.dati_config.zoom || 15} onChange={e => updateConfig(i, 'zoom', parseInt(e.target.value))} />
                                        <span className="text-xs text-gray-500">Zoom: {comp.dati_config.zoom || 15}</span>
                                    </div>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-xs text-blue-700">
                                            <strong>Suggerimento:</strong> Puoi trovare le coordinate esatte cercando il tuo indirizzo su Google Maps e cliccando su "Condividi" → "Incorpora mappa" o usando il link nella barra degli indirizzi.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* --- BLOG_LIST --- */}
                            {comp.tipo_componente === 'BLOG_LIST' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">TITOLO SEZIONE</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} placeholder="Ultime News" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">NUMERO ARTICOLI</label>
                                            <input type="number" min="1" max="12" className="w-full border p-2 rounded text-sm" value={comp.dati_config.limite || 3} onChange={e => updateConfig(i, 'limite', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">LAYOUT</label>
                                            <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.layout || 'grid'} onChange={e => updateConfig(i, 'layout', e.target.value)}>
                                                <option value="grid">Griglia</option>
                                                <option value="list">Lista</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500">FILTRA CATEGORIA (opzionale)</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.categoriaSlug || ''} onChange={e => updateConfig(i, 'categoriaSlug', e.target.value)} placeholder="slug-categoria" />
                                        <p className="text-xs text-gray-400 mt-1">Inserisci lo slug della categoria da visualizzare</p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-2">ELEMENTI VISIBILI</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraData || false} onChange={e => updateConfig(i, 'mostraData', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra data</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraCategoria || false} onChange={e => updateConfig(i, 'mostraCategoria', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra categoria</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraAutore || false} onChange={e => updateConfig(i, 'mostraAutore', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra autore</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostRecentOnly || false} onChange={e => updateConfig(i, 'mostRecentOnly', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra solo l'articolo più recente</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs text-green-700">
                                            <strong>Nota:</strong> Questo blocco mostra automaticamente gli articoli più recenti del tuo blog. Per gestire gli articoli, vai nel tab "Blog & News".
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* --- CATALOG_SELECTION --- */}
                            {comp.tipo_componente === 'CATALOG_SELECTION' && (
                                <>
                                    <div className="mb-4 p-4 bg-blue-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Selezione Prodotti</h4>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Seleziona una selezione prodotti</label>
                                            <select
                                                className="w-full border p-2 rounded text-sm"
                                                value={comp.dati_config.selezione_id || ''}
                                                onChange={e => updateConfig(i, 'selezione_id', parseInt(e.target.value))}
                                            >
                                                <option value="">-- Seleziona una selezione --</option>
                                                {selezioniOptions.map(sel => (
                                                    <option key={sel.id} value={sel.id}>{sel.nome}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {comp.dati_config.selezione_id
                                                    ? `Verrà mostrata la selezione: ${selezioniOptions.find(s => s.id === comp.dati_config.selezione_id)?.nome}`
                                                    : 'Crea le selezioni nel tab "Catalogo Prodotti" → "Selezioni"'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Layout */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Layout</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Tipo Layout</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.layout || 'grid'}
                                                    onChange={e => updateConfig(i, 'layout', e.target.value)}
                                                >
                                                    <option value="grid">Griglia</option>
                                                    <option value="list">Lista</option>
                                                    <option value="carousel">Carosello</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Prodotti per riga</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.prodotti_per_riga || 4}
                                                    onChange={e => updateConfig(i, 'prodotti_per_riga', parseInt(e.target.value))}
                                                >
                                                    <option value={2}>2</option>
                                                    <option value={3}>3</option>
                                                    <option value={4}>4</option>
                                                    <option value={6}>6</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Elementi Visibili */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Elementi Visibili</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_prezzo !== false} onChange={e => updateConfig(i, 'mostra_prezzo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra prezzo</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_giacenza !== false} onChange={e => updateConfig(i, 'mostra_giacenza', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra giacenza</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_descrizione !== false} onChange={e => updateConfig(i, 'mostra_descrizione', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra descrizione</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_ricerca !== false} onChange={e => updateConfig(i, 'mostra_ricerca', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra ricerca</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_filtri !== false} onChange={e => updateConfig(i, 'mostra_filtri', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra filtri</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_ordinamento !== false} onChange={e => updateConfig(i, 'mostra_ordinamento', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra ordinamento</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostra_titolo !== false} onChange={e => updateConfig(i, 'mostra_titolo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra titolo</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Stili */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Colori e Stili</h4>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore sfondo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.colore_sfondo || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'colore_sfondo', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.colore_sfondo || '#ffffff'}
                                                        onChange={e => updateConfig(i, 'colore_sfondo', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore testo</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.colore_testo || '#1f2937'}
                                                        onChange={e => updateConfig(i, 'colore_testo', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.colore_testo || '#1f2937'}
                                                        onChange={e => updateConfig(i, 'colore_testo', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore accento</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        className="w-12 h-8 border rounded cursor-pointer"
                                                        value={comp.dati_config.colore_accento || '#3b82f6'}
                                                        onChange={e => updateConfig(i, 'colore_accento', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.colore_accento || '#3b82f6'}
                                                        onChange={e => updateConfig(i, 'colore_accento', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Raggio bordo (px)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="30"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.raggio_bordo || 8}
                                                    onChange={e => updateConfig(i, 'raggio_bordo', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Padding card (px)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.card_padding || 16}
                                                    onChange={e => updateConfig(i, 'card_padding', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.ombra !== false} onChange={e => updateConfig(i, 'ombra', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Ombra card</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Effetti */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Effetti e Animazioni</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Effetto hover</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.effetto_hover || 'scale'}
                                                    onChange={e => updateConfig(i, 'effetto_hover', e.target.value)}
                                                >
                                                    <option value="scale">Ingrandimento</option>
                                                    <option value="shadow">Ombra intensificata</option>
                                                    <option value="lift">Elevazione</option>
                                                    <option value="glow">Bagliore</option>
                                                    <option value="none">Nessuno</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Animazione caricamento</label>
                                                <select
                                                    className="w-full border p-2 rounded text-sm"
                                                    value={comp.dati_config.animazione_caricamento || 'fade'}
                                                    onChange={e => updateConfig(i, 'animazione_caricamento', e.target.value)}
                                                >
                                                    <option value="fade">Dissolvenza</option>
                                                    <option value="slide">Scorrimento</option>
                                                    <option value="stagger">A scalare</option>
                                                    <option value="none">Nessuna</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Durata transizione (ms)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="1000"
                                                step="50"
                                                className="w-full border p-2 rounded text-sm"
                                                value={comp.dati_config.durata_transizione || 300}
                                                onChange={e => updateConfig(i, 'durata_transizione', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Badges</h4>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.badge_sconto !== false} onChange={e => updateConfig(i, 'badge_sconto', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra badge sconto (-XX%)</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.badge_nuovo || false} onChange={e => updateConfig(i, 'badge_nuovo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra badge "Nuovo"</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.badge_esaurito !== false} onChange={e => updateConfig(i, 'badge_esaurito', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra badge "Esaurito"</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Aspect Ratio */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Immagine Card</h4>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Proporzioni immagine</label>
                                            <select
                                                className="w-full border p-2 rounded text-sm"
                                                value={comp.dati_config.card_aspect_ratio || 'square'}
                                                onChange={e => updateConfig(i, 'card_aspect_ratio', e.target.value)}
                                            >
                                                <option value="square">Quadrata (1:1)</option>
                                                <option value="portrait">Verticale (4:5)</option>
                                                <option value="landscape">Orizzontale (16:9)</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- FLIP_CARD_GALLERY --- */}
                            {comp.tipo_componente === 'FLIP_CARD_GALLERY' && (
                                <>
                                    {/* Titolo Sezione */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Titolo Sezione</h4>
                                        <div className="mb-3">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} placeholder="La Nostra Galleria" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Sottotitolo</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.sottotitolo || ''} onChange={e => updateConfig(i, 'sottotitolo', e.target.value)} placeholder="Scopri i nostri servizi" />
                                        </div>
                                        <div className="mt-3 flex gap-4">
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraTitolo !== false} onChange={e => updateConfig(i, 'mostraTitolo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra titolo</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraSottotitolo !== false} onChange={e => updateConfig(i, 'mostraSottotitolo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra sottotitolo</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Layout */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Layout</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Numero Colonne</label>
                                                <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.colonne || 3} onChange={e => updateConfig(i, 'colonne', parseInt(e.target.value))}>
                                                    <option value={2}>2 Colonne</option>
                                                    <option value={3}>3 Colonne</option>
                                                    <option value={4}>4 Colonne</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Altezza Card</label>
                                                <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.altezzaCard || 'md'} onChange={e => updateConfig(i, 'altezzaCard', e.target.value)}>
                                                    <option value="sm">Piccola (192px)</option>
                                                    <option value="md">Media (256px)</option>
                                                    <option value="lg">Grande (320px)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Animazioni */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Effetto Transizione</h4>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Tipo di Effetto</label>
                                            <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.effettoFlip || 'rotate'} onChange={e => updateConfig(i, 'effettoFlip', e.target.value)}>
                                                <option value="rotate">Rotazione 3D (Flip)</option>
                                                <option value="slide">Scorrimento Verticale</option>
                                                <option value="fade">Dissolvenza</option>
                                                <option value="zoom">Zoom</option>
                                            </select>
                                        </div>
                                        <div className="mt-3">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Durata Transizione (ms)</label>
                                            <input type="number" min="200" max="2000" step="100" className="w-full border p-2 rounded text-sm" value={comp.dati_config.durataTransizione || 600} onChange={e => updateConfig(i, 'durataTransizione', parseInt(e.target.value))} />
                                        </div>
                                    </div>

                                    {/* Colori e Stili */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Colori e Stili</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo Sezione</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreSfondo', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreSfondo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Testo Sezione</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreTesto || '#1f2937'} onChange={e => updateConfig(i, 'coloreTesto', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreTesto || '#1f2937'} onChange={e => updateConfig(i, 'coloreTesto', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Titolo Card</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreTitolo || '#111827'} onChange={e => updateConfig(i, 'coloreTitolo', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreTitolo || '#111827'} onChange={e => updateConfig(i, 'coloreTitolo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Testo Card</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreCardTesto || '#6b7280'} onChange={e => updateConfig(i, 'coloreCardTesto', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreCardTesto || '#6b7280'} onChange={e => updateConfig(i, 'coloreCardTesto', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo Card</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreCardSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreCardSfondo', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreCardSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreCardSfondo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Raggio Bordo (px)</label>
                                                <input type="number" min="0" max="30" className="w-full border p-2 rounded text-sm" value={comp.dati_config.raggioBordo || 12} onChange={e => updateConfig(i, 'raggioBordo', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.ombra !== false} onChange={e => updateConfig(i, 'ombra', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra ombra card</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Gestione Card */}
                                    <div className="mb-4 p-4 bg-blue-50 rounded border">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase">Card della Galleria</h4>
                                            <button
                                                onClick={() => {
                                                    const newComps = [...components];
                                                    if (!newComps[i].dati_config.cards) newComps[i].dati_config.cards = [];
                                                    newComps[i].dati_config.cards.push({
                                                        immagine: '',
                                                        titolo: '',
                                                        descrizione: '',
                                                        link: ''
                                                    });
                                                    setComponents(newComps);
                                                }}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <PlusIcon className="h-3 w-3" /> Aggiungi Card
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(comp.dati_config.cards || []).map((card, cardIdx) => (
                                                <div key={cardIdx} className="p-3 bg-white rounded border">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-gray-700">Card {cardIdx + 1}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newComps = [...components];
                                                                newComps[i].dati_config.cards = newComps[i].dati_config.cards.filter((_, idx) => idx !== cardIdx);
                                                                setComponents(newComps);
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Immagine</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 border p-2 rounded text-sm bg-gray-50"
                                                                    value={card.immagine || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.cards[cardIdx].immagine = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    readOnly
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        setMediaPickerTarget({ compIndex: i, fieldKey: `cards_${cardIdx}_immagine`, isArray: false });
                                                                        setIsMediaPickerOpen(true);
                                                                    }}
                                                                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200"
                                                                >
                                                                    <PhotoIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo</label>
                                                            <input
                                                                type="text"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={card.titolo || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.cards[cardIdx].titolo = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Titolo della card"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Descrizione</label>
                                                            <textarea
                                                                className="w-full border p-2 rounded text-sm"
                                                                rows="3"
                                                                value={card.descrizione || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.cards[cardIdx].descrizione = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Descrizione che appare sul retro della card"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Link (opzionale)</label>
                                                            <input
                                                                type="url"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={card.link || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.cards[cardIdx].link = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="https://esempio.com/pagina"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!comp.dati_config.cards?.length) && (
                                                <p className="text-xs text-gray-400 text-center py-4">
                                                    Nessuna card aggiunta. Clicca "Aggiungi Card" per iniziare.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- DYNAMIC_IMAGE_GALLERY --- */}
                            {comp.tipo_componente === 'DYNAMIC_IMAGE_GALLERY' && (
                                <>
                                    {/* Titolo Sezione */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Titolo Sezione</h4>
                                        <div className="mb-3">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} placeholder="La Nostra Galleria" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Sottotitolo</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.sottotitolo || ''} onChange={e => updateConfig(i, 'sottotitolo', e.target.value)} placeholder="Scopri le nostre immagini" />
                                        </div>
                                        <div className="mt-3 flex gap-4">
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraTitolo !== false} onChange={e => updateConfig(i, 'mostraTitolo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra titolo</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.mostraSottotitolo !== false} onChange={e => updateConfig(i, 'mostraSottotitolo', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra sottotitolo</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Layout e Tipo */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Layout e Visualizzazione</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Tipo Layout</label>
                                                <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.layout || 'carousel'} onChange={e => updateConfig(i, 'layout', e.target.value)}>
                                                    <option value="carousel">Carosello</option>
                                                    <option value="slider">Slider</option>
                                                    <option value="grid">Griglia</option>
                                                    <option value="masonry">Masonry</option>
                                                    <option value="fullscreen">Fullscreen</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Effetto Transizione</label>
                                                <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.effettoTransizione || 'slide'} onChange={e => updateConfig(i, 'effettoTransizione', e.target.value)}>
                                                    <option value="slide">Scorrimento</option>
                                                    <option value="fade">Dissolvenza</option>
                                                    <option value="zoom">Zoom</option>
                                                    <option value="blur">Blur</option>
                                                    <option value="pixelate">Pixelate</option>
                                                </select>
                                            </div>
                                        </div>
                                        {(comp.dati_config.layout === 'carousel' || comp.dati_config.layout === 'slider' || comp.dati_config.layout === 'fullscreen') && (
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Direzione</label>
                                                    <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.direzione || 'horizontal'} onChange={e => updateConfig(i, 'direzione', e.target.value)}>
                                                        <option value="horizontal">Orizzontale</option>
                                                        <option value="vertical">Verticale</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Altezza</label>
                                                    <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.altezza || 'md'} onChange={e => updateConfig(i, 'altezza', e.target.value)}>
                                                        <option value="sm">Piccola</option>
                                                        <option value="md">Media</option>
                                                        <option value="lg">Grande</option>
                                                        <option value="xl">Molto Grande</option>
                                                        <option value="fullscreen">Schermo Intero</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {(comp.dati_config.layout === 'grid' || comp.dati_config.layout === 'masonry') && (
                                            <div className="mb-3">
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Numero Colonne</label>
                                                <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.colonne || 3} onChange={e => updateConfig(i, 'colonne', parseInt(e.target.value))}>
                                                    <option value={2}>2 Colonne</option>
                                                    <option value={3}>3 Colonne</option>
                                                    <option value={4}>4 Colonne</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Opzioni Carosello/Slider */}
                                    {(comp.dati_config.layout === 'carousel' || comp.dati_config.layout === 'slider' || comp.dati_config.layout === 'fullscreen') && (
                                        <div className="mb-4 p-4 bg-gray-50 rounded border">
                                            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Opzioni Animazione</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.autoplay !== false} onChange={e => updateConfig(i, 'autoplay', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Autoplay</span>
                                                </label>
                                                {comp.dati_config.autoplay !== false && (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 block mb-1">Intervallo (ms)</label>
                                                        <input type="number" min="1000" max="10000" step="500" className="w-full border p-2 rounded text-sm" value={comp.dati_config.intervallo || 5000} onChange={e => updateConfig(i, 'intervallo', parseInt(e.target.value))} />
                                                    </div>
                                                )}
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.mostraNavigatorio !== false} onChange={e => updateConfig(i, 'mostraNavigatorio', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Mostra frecce navigazione</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.mostraIndicatori !== false} onChange={e => updateConfig(i, 'mostraIndicatori', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Mostra indicatori</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.infiniteLoop !== false} onChange={e => updateConfig(i, 'infiniteLoop', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Ciclo infinito</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="checkbox" checked={comp.dati_config.zoomOnHover !== false} onChange={e => updateConfig(i, 'zoomOnHover', e.target.checked)} className="mr-2" />
                                                    <span className="text-sm">Zoom al passaggio del mouse</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Colori e Stili */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Colori e Stili</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Colore Sfondo</label>
                                                <div className="flex gap-2">
                                                    <input type="color" className="w-12 h-8 border rounded cursor-pointer" value={comp.dati_config.coloreSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreSfondo', e.target.value)} />
                                                    <input type="text" className="flex-1 border p-2 rounded text-sm" value={comp.dati_config.coloreSfondo || '#ffffff'} onChange={e => updateConfig(i, 'coloreSfondo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Raggio Bordo (px)</label>
                                                <input type="number" min="0" max="30" className="w-full border p-2 rounded text-sm" value={comp.dati_config.raggioBordo || 12} onChange={e => updateConfig(i, 'raggioBordo', parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center">
                                                <input type="checkbox" checked={comp.dati_config.ombra !== false} onChange={e => updateConfig(i, 'ombra', e.target.checked)} className="mr-2" />
                                                <span className="text-sm">Mostra ombra</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Gestione Immagini */}
                                    <div className="mb-4 p-4 bg-blue-50 rounded border">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase">Immagini della Galleria</h4>
                                            <button
                                                onClick={() => {
                                                    const newComps = [...components];
                                                    if (!newComps[i].dati_config.immagini) newComps[i].dati_config.immagini = [];
                                                    newComps[i].dati_config.immagini.push({
                                                        src: '',
                                                        alt: '',
                                                        title: '',
                                                        link: ''
                                                    });
                                                    setComponents(newComps);
                                                }}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <PlusIcon className="h-3 w-3" /> Aggiungi Immagine
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(comp.dati_config.immagini || []).map((img, imgIdx) => (
                                                <div key={imgIdx} className="p-3 bg-white rounded border">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-gray-700">Immagine {imgIdx + 1}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newComps = [...components];
                                                                newComps[i].dati_config.immagini = newComps[i].dati_config.immagini.filter((_, idx) => idx !== imgIdx);
                                                                setComponents(newComps);
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">File Immagine</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 border p-2 rounded text-sm bg-gray-50"
                                                                    value={img.src || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.immagini[imgIdx].src = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    readOnly
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        setMediaPickerTarget({ compIndex: i, fieldKey: `immagini_${imgIdx}_src`, isArray: false });
                                                                        setIsMediaPickerOpen(true);
                                                                    }}
                                                                    className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200"
                                                                >
                                                                    <PhotoIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Testo Alternativo (Alt)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={img.alt || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.immagini[imgIdx].alt = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Descrizione per accessibilità"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo (opzionale)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={img.title || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.immagini[imgIdx].title = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Titolo mostrato sull'immagine"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Link (opzionale)</label>
                                                            <input
                                                                type="url"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={img.link || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.immagini[imgIdx].link = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="https://esempio.com/pagina"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!comp.dati_config.immagini?.length) && (
                                                <p className="text-xs text-gray-400 text-center py-4">
                                                    Nessuna immagine aggiunta. Clicca "Aggiungi Immagine" per iniziare.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- GUIDE --- */}
                            {comp.tipo_componente === 'GUIDE' && (
                                <>
                                    {/* Titolo e Sottotitolo */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Titolo Guida</h4>
                                        <div className="mb-3">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo Principale</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.title || ''} onChange={e => updateConfig(i, 'title', e.target.value)} placeholder="Guida Interattiva" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Sottotitolo</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.subtitle || ''} onChange={e => updateConfig(i, 'subtitle', e.target.value)} placeholder="Scopri come utilizzare il nostro servizio" />
                                        </div>
                                    </div>

                                    {/* Tema */}
                                    <div className="mb-4 p-4 bg-gray-50 rounded border">
                                        <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase">Aspetto Grafico</h4>
                                        <div className="mb-3">
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Tema</label>
                                            <select className="w-full border p-2 rounded text-sm" value={comp.dati_config.theme || 'default'} onChange={e => updateConfig(i, 'theme', e.target.value)}>
                                                <option value="default">Blu (Default)</option>
                                                <option value="green">Verde</option>
                                                <option value="purple">Viola</option>
                                                <option value="dark">Scuro</option>
                                            </select>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={comp.dati_config.showGuide || false}
                                                    onChange={e => updateConfig(i, 'showGuide', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">🎓 Mostra Guida all'Uso</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Attiva una guida interattiva che spiega come utilizzare questo componente
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Gestione Tab */}
                                    <div className="mb-4 p-4 bg-blue-50 rounded border">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase">Tab della Guida</h4>
                                            <button
                                                onClick={() => {
                                                    const newComps = [...components];
                                                    if (!newComps[i].dati_config.tabs) newComps[i].dati_config.tabs = [];
                                                    newComps[i].dati_config.tabs.push({
                                                        label: `Tab ${(newComps[i].dati_config.tabs.length + 1)}`,
                                                        icon: '📄',
                                                        title: '',
                                                        description: '',
                                                        sections: [],
                                                        tip: '',
                                                        note: ''
                                                    });
                                                    setComponents(newComps);
                                                }}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                            >
                                                <PlusIcon className="h-3 w-3" /> Aggiungi Tab
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {(comp.dati_config.tabs || []).map((tab, tabIdx) => (
                                                <div key={tabIdx} className="p-4 bg-white rounded border">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <span className="text-xl">{tab.icon || '📄'}</span>
                                                            Tab {tabIdx + 1}: {tab.label || 'Senza nome'}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const newComps = [...components];
                                                                    const tabs = [...newComps[i].dati_config.tabs];
                                                                    [tabs[tabIdx], tabs[tabIdx - 1]] = [tabs[tabIdx - 1], tabs[tabIdx]];
                                                                    newComps[i].dati_config.tabs = tabs;
                                                                    setComponents(newComps);
                                                                }}
                                                                disabled={tabIdx === 0}
                                                                className="p-1 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                title="Sposta su"
                                                            >
                                                                ⬆️
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const newComps = [...components];
                                                                    const tabs = [...newComps[i].dati_config.tabs];
                                                                    [tabs[tabIdx], tabs[tabIdx + 1]] = [tabs[tabIdx + 1], tabs[tabIdx]];
                                                                    newComps[i].dati_config.tabs = tabs;
                                                                    setComponents(newComps);
                                                                }}
                                                                disabled={tabIdx === (comp.dati_config.tabs?.length || 0) - 1}
                                                                className="p-1 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                title="Sposta giù"
                                                            >
                                                                ⬇️
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.tabs = newComps[i].dati_config.tabs.filter((_, idx) => idx !== tabIdx);
                                                                    setComponents(newComps);
                                                                }}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Elimina tab"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Configurazione Tab */}
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 block mb-1">Etichetta Tab</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border p-2 rounded text-sm"
                                                                    value={tab.label || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.tabs[tabIdx].label = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    placeholder="Panoramica"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 block mb-1">Icona (emoji)</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full border p-2 rounded text-sm"
                                                                    value={tab.icon || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.tabs[tabIdx].icon = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    placeholder="👁️"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Titolo Contenuto</label>
                                                            <input
                                                                type="text"
                                                                className="w-full border p-2 rounded text-sm"
                                                                value={tab.title || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.tabs[tabIdx].title = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Panoramica Generale"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 block mb-1">Descrizione</label>
                                                            <textarea
                                                                className="w-full border p-2 rounded text-sm h-20"
                                                                value={tab.description || ''}
                                                                onChange={e => {
                                                                    const newComps = [...components];
                                                                    newComps[i].dati_config.tabs[tabIdx].description = e.target.value;
                                                                    setComponents(newComps);
                                                                }}
                                                                placeholder="Descrizione del contenuto di questo tab..."
                                                            />
                                                        </div>

                                                        {/* Sezioni del tab */}
                                                        <div className="pt-2 border-t">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <label className="text-xs font-bold text-gray-700">Sezioni</label>
                                                                <button
                                                                    onClick={() => {
                                                                        const newComps = [...components];
                                                                        if (!newComps[i].dati_config.tabs[tabIdx].sections) {
                                                                            newComps[i].dati_config.tabs[tabIdx].sections = [];
                                                                        }
                                                                        newComps[i].dati_config.tabs[tabIdx].sections.push({
                                                                            title: '',
                                                                            icon: '',
                                                                            content: '',
                                                                            points: [],
                                                                            codeExample: '',
                                                                            image: '',
                                                                            imageCaption: ''
                                                                        });
                                                                        setComponents(newComps);
                                                                    }}
                                                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                                >
                                                                    + Aggiungi Sezione
                                                                </button>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {(tab.sections || []).map((section, sectIdx) => (
                                                                    <div key={sectIdx} className="p-3 bg-gray-50 rounded border">
                                                                        <div className="flex justify-between items-center mb-2">
                                                                            <span className="text-xs font-bold text-gray-700">Sezione {sectIdx + 1}</span>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newComps = [...components];
                                                                                    newComps[i].dati_config.tabs[tabIdx].sections = newComps[i].dati_config.tabs[tabIdx].sections.filter((_, idx) => idx !== sectIdx);
                                                                                    setComponents(newComps);
                                                                                }}
                                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                                            >
                                                                                Elimina
                                                                            </button>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <div className="grid grid-cols-3 gap-2">
                                                                                <div className="col-span-2">
                                                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Titolo Sezione</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border p-2 rounded text-sm"
                                                                                        value={section.title || ''}
                                                                                        onChange={e => {
                                                                                            const newComps = [...components];
                                                                                            newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].title = e.target.value;
                                                                                            setComponents(newComps);
                                                                                        }}
                                                                                        placeholder="Titolo sezione"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Icona</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border p-2 rounded text-sm"
                                                                                        value={section.icon || ''}
                                                                                        onChange={e => {
                                                                                            const newComps = [...components];
                                                                                            newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].icon = e.target.value;
                                                                                            setComponents(newComps);
                                                                                        }}
                                                                                        placeholder="📌"
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <label className="text-xs font-bold text-gray-500 block mb-1">Contenuto (HTML)</label>
                                                                                <textarea
                                                                                    className="w-full border p-2 rounded text-sm h-20 font-mono"
                                                                                    value={section.content || ''}
                                                                                    onChange={e => {
                                                                                        const newComps = [...components];
                                                                                        newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].content = e.target.value;
                                                                                        setComponents(newComps);
                                                                                    }}
                                                                                    placeholder="<p>Contenuto della sezione...</p>"
                                                                                />
                                                                            </div>

                                                                            <div>
                                                                                <label className="text-xs font-bold text-gray-500 block mb-1">Esempio di Codice</label>
                                                                                <textarea
                                                                                    className="w-full border p-2 rounded text-sm h-16 font-mono bg-gray-900 text-green-400 text-xs"
                                                                                    value={section.codeExample || ''}
                                                                                    onChange={e => {
                                                                                        const newComps = [...components];
                                                                                        newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].codeExample = e.target.value;
                                                                                        setComponents(newComps);
                                                                                    }}
                                                                                    placeholder="// Esempio di codice"
                                                                                />
                                                                            </div>

                                                                            <div>
                                                                                <label className="text-xs font-bold text-gray-500 block mb-1">Punti Elenco (uno per riga)</label>
                                                                                <textarea
                                                                                    className="w-full border p-2 rounded text-sm h-20"
                                                                                    value={(section.points || []).join('\n')}
                                                                                    onChange={e => {
                                                                                        const newComps = [...components];
                                                                                        newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].points = e.target.value.split('\n').filter(p => p.trim());
                                                                                        setComponents(newComps);
                                                                                    }}
                                                                                    placeholder="Primo punto&#10;Secondo punto&#10;Terzo punto"
                                                                                />
                                                                            </div>

                                                                            <div>
                                                                                <label className="text-xs font-bold text-gray-500 block mb-1">URL Immagine</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="w-full border p-2 rounded text-sm"
                                                                                    value={section.image || ''}
                                                                                    onChange={e => {
                                                                                        const newComps = [...components];
                                                                                        newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].image = e.target.value;
                                                                                        setComponents(newComps);
                                                                                    }}
                                                                                    placeholder="https://esempio.com/immagine.jpg"
                                                                                />
                                                                            </div>

                                                                            {section.image && (
                                                                                <div>
                                                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Didascalia Immagine</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full border p-2 rounded text-sm"
                                                                                        value={section.imageCaption || ''}
                                                                                        onChange={e => {
                                                                                            const newComps = [...components];
                                                                                            newComps[i].dati_config.tabs[tabIdx].sections[sectIdx].imageCaption = e.target.value;
                                                                                            setComponents(newComps);
                                                                                        }}
                                                                                        placeholder="Didascalia dell'immagine"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Note e Suggerimenti */}
                                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 block mb-1">💡 Suggerimento</label>
                                                                <textarea
                                                                    className="w-full border p-2 rounded text-sm h-16"
                                                                    value={tab.tip || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.tabs[tabIdx].tip = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    placeholder="Consiglio utile per l'utente..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-bold text-gray-500 block mb-1">⚠️ Nota Importante</label>
                                                                <textarea
                                                                    className="w-full border p-2 rounded text-sm h-16"
                                                                    value={tab.note || ''}
                                                                    onChange={e => {
                                                                        const newComps = [...components];
                                                                        newComps[i].dati_config.tabs[tabIdx].note = e.target.value;
                                                                        setComponents(newComps);
                                                                    }}
                                                                    placeholder="Avvertenza importante..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!comp.dati_config.tabs?.length) && (
                                                <p className="text-xs text-gray-400 text-center py-4">
                                                    Nessun tab aggiunto. Clicca "Aggiungi Tab" per iniziare.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE MEDIA PICKER */}
            <MediaPickerModal 
                isOpen={isMediaPickerOpen} 
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                dittaId={dittaId}
            />
        </div>
    );
};

export default PageManager;