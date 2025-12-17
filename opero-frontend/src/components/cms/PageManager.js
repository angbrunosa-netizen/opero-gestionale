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
        { type: 'HERO', label: 'Banner Hero', icon: '🖼️', defaultData: { titolo: 'Benvenuti', sottotitolo: '', cta_text: '', allineamento: 'center', immagine_url: '' } },
        { type: 'VETRINA', label: 'Vetrina Prodotti', icon: '🛍️', defaultData: { limit: 4, titolo: 'I Nostri Prodotti' } },
        { type: 'HTML', label: 'Testo Formattato', icon: '📝', defaultData: { html: '<h3>Titolo Sezione</h3><p>Scrivi qui il tuo contenuto...</p>' } },
        { type: 'MAPS', label: 'Mappa', icon: '📍', defaultData: { lat: 41.90, lng: 12.49, zoom: 15 } },
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">TITOLO</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">SOTTOTITOLO</label>
                                            <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.sottotitolo || ''} onChange={e => updateConfig(i, 'sottotitolo', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1">IMMAGINE SFONDO</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="text" className="flex-1 border p-2 rounded text-sm bg-gray-50" value={comp.dati_config.immagine_url || ''} readOnly />
                                            {/* PULSANTE CHE APRE IL MEDIA PICKER */}
                                            <button 
                                                onClick={() => openMediaPicker(i, 'immagine_url', false)}
                                                className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                                            >
                                                <PhotoIcon className="h-4 w-4"/> Seleziona
                                            </button>
                                        </div>
                                        {comp.dati_config.immagine_url && <img src={comp.dati_config.immagine_url} alt="Preview" className="h-20 mt-2 rounded border object-cover" />}
                                    </div>
                                </>
                            )}

                            {/* --- HTML --- */}
                            {comp.tipo_componente === 'HTML' && (
                                <div className="h-64 mb-10">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">CONTENUTO</label>
                                    <ReactQuill theme="snow" value={comp.dati_config.html || ''} onChange={(val) => updateConfig(i, 'html', val)} modules={quillModules} className="h-48" />
                                </div>
                            )}

                            {/* --- MEDIA_SOCIAL --- */}
                            {comp.tipo_componente === 'MEDIA_SOCIAL' && (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">TITOLO SEZIONE</label>
                                        <input type="text" className="w-full border p-2 rounded text-sm" value={comp.dati_config.titolo || ''} onChange={e => updateConfig(i, 'titolo', e.target.value)} />
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