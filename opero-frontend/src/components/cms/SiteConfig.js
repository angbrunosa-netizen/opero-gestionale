/**
 * Nome File: SiteConfig.js
 * Posizione: src/components/cms/SiteConfig.js
 * Data: 16/12/2025
 * Versione: 2.0 (Con Controllo Accessi per Ruolo)
 * Descrizione: Pannello per configurare URL, Template grafico e colori.
 * - SUPER_ADMIN: Può modificare URL slug e tutti i campi
 * - Altri ruoli: NON possono modificare URL slug (nome sito)
 */
import React, { useState, useEffect } from 'react';
import {api} from '../../services/api';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

const SiteConfig = ({ dittaId }) => {
    const { hasPermission } = useAuth();
    const isSystemAdmin = hasPermission('SUPER_ADMIN');
    const [config, setConfig] = useState({
        url_slug: '',
        favicon_url: '', // URL favicon personalizzata
        shop_template: 'standard',
        shop_colore_primario: '#000000',
        shop_colore_secondario: '#ffffff',
        shop_colore_sfondo_blocchi: '#ffffff', // Colore sfondo per tutti i blocchi
        // Header personalization
        shop_colore_header_sfondo: '#ffffff',
        shop_colore_header_testo: '#333333',
        shop_logo_posizione: 'left', // left, center, right
        shop_descrizione_home: '', // Descrizione footer (azienda)
        shop_attivo: false,
        // Nuovi campi per sito principale e directory
        is_main_site: false,
        show_in_directory: true,
        directory_order: 100,
        directory_description: '',
        directory_featured: false
    });
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        loadConfig();
    }, [dittaId]);

    const loadConfig = async () => {
        try {
            const res = await api.get(`/admin/cms/config/${dittaId}`);
            if (res.data) setConfig(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error("Errore caricamento config:", error);
            setFeedback({ type: 'error', message: 'Impossibile caricare la configurazione corrente.' });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setFeedback(null);
        try {
            await api.post(`/admin/cms/config/${dittaId}`, config);
            setFeedback({ type: 'success', message: 'Configurazione pubblicata con successo!' });
            // Nascondi messaggio dopo 3 secondi
            setTimeout(() => setFeedback(null), 3000);
        } catch (error) {
            setFeedback({ type: 'error', message: 'Errore: ' + (error.response?.data?.message || error.message) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Identità Digitale</h3>
                        <p className="text-sm text-gray-500">Definisci come appare la tua azienda online.</p>
                    </div>
                    {/* Status Indicator */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.shop_attivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {config.shop_attivo ? 'Sito Online' : 'Sito Offline'}
                    </span>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* URL e Attivazione */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Indirizzo Web (Sottodominio)
                                {!isSystemAdmin && (
                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                        Solo lettura
                                    </span>
                                )}
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-mono">
                                    http://
                                </span>
                                <input
                                    type="text"
                                    value={config.url_slug || ''}
                                    onChange={e => setConfig({...config, url_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                                    disabled={!isSystemAdmin}
                                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 sm:text-sm font-semibold text-gray-800 ${
                                        !isSystemAdmin
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                    placeholder="nome-azienda"
                                />
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-mono">
                                    .operocloud.it
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {isSystemAdmin
                                    ? "L'indirizzo che i clienti useranno per visitare il sito."
                                    : "L'indirizzo web è gestito dall'amministratore di sistema."}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Favicon Personalizzata
                            </label>
                            <input
                                type="text"
                                value={config.favicon_url || ''}
                                onChange={e => setConfig({...config, favicon_url: e.target.value})}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="https://example.com/favicon.ico"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Inserisci l'URL completo dell'immagine della favicon (ico, png, jpg). Lascia vuoto per usare quella predefinita.
                            </p>
                            {config.favicon_url && (
                                <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                    <span className="text-xs text-gray-600">Anteprima:</span>
                                    <img
                                        src={config.favicon_url}
                                        alt="Favicon preview"
                                        className="w-6 h-6"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'inline';
                                        }}
                                    />
                                    <span className="text-xs text-red-500 hidden" ref={el => {
                                        if (el && el.previousSibling && el.previousSibling.style.display === 'none') {
                                            el.style.display = 'inline';
                                        }
                                    }}>Impossibile caricare l'immagine</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <label className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={Boolean(config.shop_attivo)}
                                        onChange={e => setConfig({...config, shop_attivo: e.target.checked})}
                                    />
                                    <div className={`block w-14 h-8 rounded-full transition ${config.shop_attivo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${config.shop_attivo ? 'translate-x-6' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-gray-700 font-medium">
                                    {config.shop_attivo ? 'Sito Pubblico Attivo' : 'Sito in Manutenzione'}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Template e Stile */}
                    <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                            Personalizzazione Grafica
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template Strutturale</label>
                                <select
                                    value={config.shop_template}
                                    onChange={e => setConfig({...config, shop_template: e.target.value})}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="standard">Standard (Aziendale)</option>
                                    <option value="fashion">Fashion (Moda & Design)</option>
                                    <option value="industrial">Industrial (Tecnico)</option>
                                </select>
                            </div>
                            
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Colore Primario</label>
                                <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                                    <input
                                        type="color"
                                        value={config.shop_colore_primario}
                                        onChange={e => setConfig({...config, shop_colore_primario: e.target.value})}
                                        className="h-8 w-8 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                    />
                                    <span className="text-sm font-mono text-gray-600 uppercase">{config.shop_colore_primario}</span>
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Colore Secondario</label>
                                <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-md shadow-sm bg-white">
                                    <input
                                        type="color"
                                        value={config.shop_colore_secondario}
                                        onChange={e => setConfig({...config, shop_colore_secondario: e.target.value})}
                                        className="h-8 w-8 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                    />
                                    <span className="text-sm font-mono text-gray-600 uppercase">{config.shop_colore_secondario}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sfondo Blocchi Pagina */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-green-500 rounded-sm"></span>
                                    Sfondo Blocchi Pagina
                                </h4>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded border border-gray-300"
                                        style={{ backgroundColor: config.shop_colore_sfondo_blocchi }}
                                    ></div>
                                    <span className="text-xs text-gray-500 font-mono uppercase">{config.shop_colore_sfondo_blocchi}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Colore Sfondo Unico</label>
                                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-md shadow-sm bg-white">
                                        <input
                                            type="color"
                                            value={config.shop_colore_sfondo_blocchi}
                                            onChange={e => setConfig({...config, shop_colore_sfondo_blocchi: e.target.value})}
                                            className="h-10 w-12 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={config.shop_colore_sfondo_blocchi}
                                            onChange={e => setConfig({...config, shop_colore_sfondo_blocchi: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm font-mono"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Questo colore verrà applicato come sfondo a tutti i blocchi delle pagine.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Colori Predefiniti</label>
                                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-md bg-white">
                                        {['#ffffff', '#f8f9fa', '#f3f4f6', '#e5e7eb', '#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3', '#d1fae5', '#fed7aa'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setConfig({...config, shop_colore_sfondo_blocchi: color})}
                                                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                                                    config.shop_colore_sfondo_blocchi === color ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Anteprima Sfondo */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Anteprima Sfondo</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div
                                        className="h-20 rounded-md border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                                        style={{ backgroundColor: config.shop_colore_sfondo_blocchi }}
                                    >
                                        Blocco 1
                                    </div>
                                    <div
                                        className="h-20 rounded-md border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                                        style={{ backgroundColor: config.shop_colore_sfondo_blocchi }}
                                    >
                                        Blocco 2
                                    </div>
                                    <div
                                        className="h-20 rounded-md border border-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                                        style={{ backgroundColor: config.shop_colore_sfondo_blocchi }}
                                    >
                                        Blocco 3
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Personalization */}
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personalizzazione Header</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Colore Sfondo Header</label>
                                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-md shadow-sm bg-white">
                                        <input
                                            type="color"
                                            value={config.shop_colore_header_sfondo}
                                            onChange={e => setConfig({...config, shop_colore_header_sfondo: e.target.value})}
                                            className="h-10 w-12 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={config.shop_colore_header_sfondo}
                                            onChange={e => setConfig({...config, shop_colore_header_sfondo: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm font-mono"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Colore Testo Header</label>
                                    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-md shadow-sm bg-white">
                                        <input
                                            type="color"
                                            value={config.shop_colore_header_testo}
                                            onChange={e => setConfig({...config, shop_colore_header_testo: e.target.value})}
                                            className="h-10 w-12 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                        />
                                        <input
                                            type="text"
                                            value={config.shop_colore_header_testo}
                                            onChange={e => setConfig({...config, shop_colore_header_testo: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm font-mono"
                                            placeholder="#333333"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Posizione Logo</label>
                                    <select
                                        value={config.shop_logo_posizione}
                                        onChange={e => setConfig({...config, shop_logo_posizione: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="left">Sinistra</option>
                                        <option value="center">Centro</option>
                                        <option value="right">Destra</option>
                                    </select>
                                    <p className="mt-2 text-xs text-gray-500">Scegli dove posizionare il logo nell'header</p>
                                </div>
                            </div>

                            {/* Header Preview */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Anteprima Header</label>
                                <div
                                    className="border border-gray-300 rounded-md overflow-hidden"
                                    style={{
                                        backgroundColor: config.shop_colore_header_sfondo,
                                        color: config.shop_colore_header_testo
                                    }}
                                >
                                    <div className="h-16 flex items-center px-4" style={{
                                        justifyContent: config.shop_logo_posizione === 'center' ? 'center' : config.shop_logo_posizione === 'right' ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">
                                                L
                                            </div>
                                            <span className="text-sm font-medium">{config.url_slug || 'Nome Azienda'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descrizione Azienda - Footer */}
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Descrizione Azienda (Footer)</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testo Descrittivo</label>
                                <textarea
                                    value={config.shop_descrizione_home || ''}
                                    onChange={e => setConfig({...config, shop_descrizione_home: e.target.value})}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Siamo impegnati a fornire le migliori soluzioni per i nostri clienti. Contattaci per scoprire come possiamo aiutarti a crescere."
                                />
                                <p className="mt-2 text-xs text-gray-500">Questo testo apparirà nel footer del sito web. Descrivi brevemente la tua azienda e i tuoi valori.</p>
                            </div>
                        </div>
                    </div>

                    {/* Sezione Sito Principale e Directory - Solo System Admin */}
                    {isSystemAdmin && (
                        <>
                            <div className="border-t border-gray-200"></div>

                            {/* Sito Principale */}
                            <div className="mt-6">
                                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-purple-500 rounded-sm"></span>
                                    Sito Principale (Dominio Root)
                                </h4>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <label className="flex items-center cursor-pointer justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                    checked={Boolean(config.is_main_site)}
                                                    onChange={e => setConfig({...config, is_main_site: e.target.checked})}
                                                />
                                                <span className="text-sm font-medium text-gray-900">Sito Principale</span>
                                            </div>
                                            <p className="text-xs text-gray-600 ml-6">
                                                Se attivo, questo sito verrà mostrato sul dominio principale (es. operocloud.it).
                                                Solo una ditta può essere il sito principale.
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.is_main_site ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {config.is_main_site ? 'Sito Principale' : 'Sito Standard'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Directory */}
                            <div className="mt-6">
                                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-green-500 rounded-sm"></span>
                                    Directory Pubblica
                                </h4>
                                <div className="space-y-4">
                                    {/* Visibilità Directory */}
                                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                checked={Boolean(config.show_in_directory)}
                                                onChange={e => setConfig({...config, show_in_directory: e.target.checked})}
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">Mostra nella Directory</span>
                                                <p className="text-xs text-gray-600">Visibilità nella directory pubblica dei siti</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.show_in_directory ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {config.show_in_directory ? 'Visibile' : 'Nascosto'}
                                        </span>
                                    </div>

                                    {/* Featured */}
                                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                                            checked={Boolean(config.directory_featured)}
                                            onChange={e => setConfig({...config, directory_featured: e.target.checked})}
                                            disabled={!config.show_in_directory}
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900">In Evidenza</span>
                                            <p className="text-xs text-gray-600">Evidenzia questo sito nella directory (in primo piano)</p>
                                        </div>
                                    </div>

                                    {/* Ordine */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordine Visualizzazione</label>
                                            <input
                                                type="number"
                                                value={config.directory_order}
                                                onChange={e => setConfig({...config, directory_order: parseInt(e.target.value) || 100})}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                min="1"
                                                max="999"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Valore più basso = appare prima (default: 100)</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Directory</label>
                                            <input
                                                type="text"
                                                value={config.directory_description || ''}
                                                onChange={e => setConfig({...config, directory_description: e.target.value})}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                                placeholder="Azienda leader nel settore..."
                                                disabled={!config.show_in_directory}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Descrizione breve mostrata nella directory</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Azioni */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex items-center">
                        {feedback && (
                            <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {feedback.type === 'success' ? <CheckCircleIcon className="h-5 w-5"/> : <XCircleIcon className="h-5 w-5"/>}
                                {feedback.message}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                            ${loading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
                            transition-all duration-200 ease-in-out`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Salvataggio...
                            </>
                        ) : 'Salva Modifiche'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiteConfig;