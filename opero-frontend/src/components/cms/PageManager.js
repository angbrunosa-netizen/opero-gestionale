/**
 * Nome File: PageManager.js
 * Percorso: src/components/cms/PageManager.js
 * Descrizione: Gestisce l'elenco delle pagine e l'aggiunta di componenti (blocchi).
 */

import React, { useState, useEffect } from 'react';
import  {api} from '../../services/api';

const PageManager = ({ dittaId }) => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [components, setComponents] = useState([]); // Componenti della pagina selezionata
    
    // Lista dei blocchi disponibili (deve coincidere con BlockRegistry su Next.js)
    const AVAILABLE_BLOCKS = [
        { type: 'HERO', label: 'Banner Hero', defaultData: { titolo: 'Benvenuti', sottotitolo: 'Sottotitolo qui', cta_text: 'Scopri di più' } },
        { type: 'VETRINA', label: 'Griglia Prodotti', defaultData: { limit: 8 } },
        { type: 'HTML', label: 'Testo Libero', defaultData: { html: '<p>Inserisci qui il tuo testo...</p>' } },
        { type: 'MAPS', label: 'Mappa Google', defaultData: { lat: 41.90, lng: 12.49 } }
    ];

    useEffect(() => {
        loadPages();
    }, [dittaId]);

    const loadPages = async () => {
        try {
            const res = await api.get(`/admin/cms/pages/${dittaId}`);
            setPages(res.data);
        } catch (error) {
            console.error("Errore caricamento pagine:", error);
        }
    };

    const selectPage = async (page) => {
        setSelectedPage(page);
        try {
            const res = await api.get(`/admin/cms/page/${page.id}/components`);
            // Parsifica il JSON dei dati di configurazione
            const parsedComponents = res.data.map(c => ({
                ...c,
                dati_config: typeof c.dati_config === 'string' ? JSON.parse(c.dati_config) : c.dati_config
            }));
            setComponents(parsedComponents);
        } catch (error) {
            console.error("Errore caricamento componenti:", error);
        }
    };

    const addComponent = (blockType) => {
        const blockDef = AVAILABLE_BLOCKS.find(b => b.type === blockType);
        const newComponent = {
            tipo_componente: blockType,
            dati_config: { ...blockDef.defaultData } // Clone
        };
        setComponents([...components, newComponent]);
    };

    const removeComponent = (index) => {
        const newComponents = [...components];
        newComponents.splice(index, 1);
        setComponents(newComponents);
    };
    
    const moveComponent = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === components.length - 1) return;
        
        const newComponents = [...components];
        const temp = newComponents[index];
        newComponents[index] = newComponents[index + direction];
        newComponents[index + direction] = temp;
        setComponents(newComponents);
    };
    
    const updateComponentConfig = (index, key, value) => {
        const newComponents = [...components];
        newComponents[index].dati_config = { 
            ...newComponents[index].dati_config, 
            [key]: value 
        };
        setComponents(newComponents);
    };

    const savePageComponents = async () => {
        if (!selectedPage) return;
        try {
            await api.post(`/admin/cms/page/${selectedPage.id}/components`, { components });
            alert('Pagina salvata!');
        } catch (error) {
            alert('Errore salvataggio: ' + error.message);
        }
    };

    // --- RENDER ---
    
    if (selectedPage) {
        // VISTA EDITOR PAGINA
        return (
            <div className="flex h-full gap-6">
                {/* Sidebar Componenti Disponibili */}
                <div className="w-1/4 bg-white p-4 rounded shadow">
                    <h3 className="font-bold mb-4">Aggiungi Blocco</h3>
                    <div className="space-y-2">
                        {AVAILABLE_BLOCKS.map(block => (
                            <button 
                                key={block.type}
                                onClick={() => addComponent(block.type)}
                                className="w-full text-left px-4 py-2 border rounded hover:bg-gray-50 flex items-center justify-between"
                            >
                                <span>{block.label}</span>
                                <span className="text-xl text-blue-500">+</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setSelectedPage(null)}
                        className="mt-8 w-full py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                    >
                        ← Torna alla lista
                    </button>
                </div>

                {/* Area Editor Centrale */}
                <div className="flex-1 bg-white p-6 rounded shadow overflow-y-auto">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xl font-bold">Modifica Pagina: {selectedPage.slug}</h2>
                        <button 
                            onClick={savePageComponents}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Salva Modifiche
                        </button>
                    </div>

                    <div className="space-y-6">
                        {components.length === 0 && <p className="text-gray-400 text-center py-10">Nessun componente. Aggiungine uno dalla sinistra.</p>}
                        
                        {components.map((comp, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-gray-50 relative group">
                                {/* Header del blocco */}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {AVAILABLE_BLOCKS.find(b => b.type === comp.tipo_componente)?.label || comp.tipo_componente}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => moveComponent(index, -1)} className="p-1 hover:bg-gray-200 rounded">⬆️</button>
                                        <button onClick={() => moveComponent(index, 1)} className="p-1 hover:bg-gray-200 rounded">⬇️</button>
                                        <button onClick={() => removeComponent(index)} className="p-1 hover:bg-red-100 text-red-600 rounded">🗑️</button>
                                    </div>
                                </div>
                                
                                {/* Controlli specifici per tipo (Semplificati per ora) */}
                                <div className="grid grid-cols-1 gap-3">
                                    {comp.tipo_componente === 'HERO' && (
                                        <>
                                            <input 
                                                type="text" 
                                                placeholder="Titolo"
                                                className="border p-2 rounded w-full"
                                                value={comp.dati_config.titolo || ''}
                                                onChange={(e) => updateComponentConfig(index, 'titolo', e.target.value)}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Sottotitolo"
                                                className="border p-2 rounded w-full"
                                                value={comp.dati_config.sottotitolo || ''}
                                                onChange={(e) => updateComponentConfig(index, 'sottotitolo', e.target.value)}
                                            />
                                        </>
                                    )}
                                    
                                    {comp.tipo_componente === 'HTML' && (
                                        <textarea 
                                            placeholder="Contenuto HTML"
                                            className="border p-2 rounded w-full h-32 font-mono text-sm"
                                            value={comp.dati_config.html || ''}
                                            onChange={(e) => updateComponentConfig(index, 'html', e.target.value)}
                                        />
                                    )}
                                    
                                    {/* Altri controlli generici */}
                                    {comp.tipo_componente !== 'HERO' && comp.tipo_componente !== 'HTML' && (
                                        <p className="text-xs text-gray-500">Configurazione JSON diretta non supportata in questa vista semplificata.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // VISTA LISTA PAGINE
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug URL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titolo SEO</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {pages.map(page => (
                        <tr key={page.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => selectPage(page)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">/{page.slug}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.titolo_seo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.pubblicata ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {page.pubblicata ? 'Pubblicata' : 'Bozza'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={(e) => { e.stopPropagation(); selectPage(page); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Modifica</button>
                            </td>
                        </tr>
                    ))}
                    {pages.length === 0 && (
                        <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                Nessuna pagina trovata. Crea la "home" per iniziare.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Pulsante Crea Pagina (Logica semplificata: crea home se vuoto) */}
            <div className="p-4 border-t bg-gray-50">
                <button 
                    onClick={async () => {
                        const slug = prompt("Inserisci lo slug della pagina (es. 'chi-siamo'):");
                        if(slug) {
                             await api.post('/admin/cms/pages', { id_ditta: dittaId, slug, titolo: slug, pubblicata: 1 });
                             loadPages();
                        }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    + Crea Nuova Pagina
                </button>
            </div>
        </div>
    );
};

export default PageManager;