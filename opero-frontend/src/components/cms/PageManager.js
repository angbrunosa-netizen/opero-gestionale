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
            // Sfondo sezione
            backgroundColor: '#f3f4f6'
        } },
        { type: 'VETRINA', label: 'Vetrina Prodotti', icon: '🛍️', defaultData: { limit: 4, titolo: 'I Nostri Prodotti' } },
        { type: 'HTML', label: 'Testo Formattato', icon: '📝', defaultData: {
            html: '<h3>Titolo Sezione</h3><p>Scrivi qui il tuo contenuto...</p>',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            textColor: '#333333',
            backgroundColor: '#ffffff',
            textAlign: 'left'
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
        { type: 'MEDIA_SOCIAL', label: 'Galleria & Social', icon: '📸', defaultData: { titolo: 'Seguici', layout: 'grid', facebook: '', instagram: '', images: [] } }
    ];

    useEffect(() => { loadPages(); }, [dittaId]);

    const loadPages = async () => {
        try {
            const res = await api.get(`/admin/cms/pages/${dittaId}`);
            setPages(res.data);
        } catch (error) { console.error("Errore pagine:", error); }
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
                                </>
                            )}

                            {/* --- HTML --- */}
                            {comp.tipo_componente === 'HTML' && (
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
                                                    <option value="Palatino, serif">Palatino</option>
                                                    <option value="Garamond, serif">Garamond</option>
                                                    <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                                                    <option value="Impact, sans-serif">Impact</option>
                                                    <option value="Lucida Console, monospace">Lucida Console</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Dimensione Testo</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={comp.dati_config.fontSize || '16px'}
                                                        onChange={e => updateConfig(i, 'fontSize', e.target.value)}
                                                    >
                                                        <option value="12px">12px (Piccolo)</option>
                                                        <option value="14px">14px</option>
                                                        <option value="16px">16px (Normale)</option>
                                                        <option value="18px">18px</option>
                                                        <option value="20px">20px</option>
                                                        <option value="24px">24px (Grande)</option>
                                                        <option value="28px">28px</option>
                                                        <option value="32px">32px (Molto Grande)</option>
                                                    </select>
                                                </div>
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
                                                        placeholder="#333333"
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
                                                        placeholder="#ffffff"
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    updateConfig(i, 'fontFamily', 'Arial, sans-serif');
                                                    updateConfig(i, 'fontSize', '16px');
                                                    updateConfig(i, 'textColor', '#333333');
                                                    updateConfig(i, 'backgroundColor', '#ffffff');
                                                    updateConfig(i, 'textAlign', 'left');
                                                }}
                                                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                                            >
                                                Reset Stile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Editor Contenuto */}
                                    <div className="h-64 mb-10">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">CONTENUTO</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={comp.dati_config.html || ''}
                                            onChange={(val) => updateConfig(i, 'html', val)}
                                            modules={quillModules}
                                            className="h-48"
                                        />
                                    </div>

                                    {/* Anteprima Stile */}
                                    <div className="p-4 border rounded bg-white">
                                        <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Anteprima Stile</h4>
                                        <div
                                            style={{
                                                fontFamily: comp.dati_config.fontFamily || 'Arial, sans-serif',
                                                fontSize: comp.dati_config.fontSize || '16px',
                                                color: comp.dati_config.textColor || '#333333',
                                                backgroundColor: comp.dati_config.backgroundColor || '#ffffff',
                                                textAlign: comp.dati_config.textAlign || 'left',
                                                padding: '16px',
                                                borderRadius: '4px',
                                                border: '1px solid #e5e7eb'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: comp.dati_config.html || '<p>Anteprima del contenuto...</p>' }}
                                        />
                                    </div>
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