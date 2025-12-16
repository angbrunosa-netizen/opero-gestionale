/**
 * Nome File: SiteConfig.js
 * Posizione: src/components/cms/SiteConfig.js
 * Data: 16/12/2025
 * Descrizione: Pannello per configurare URL, Template grafico e colori.
 * Include gestione stato di caricamento e feedback utente.
 */
import React, { useState, useEffect } from 'react';
import {api} from '../../services/api';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const SiteConfig = ({ dittaId }) => {
    const [config, setConfig] = useState({
        url_slug: '',
        shop_template: 'standard',
        shop_colore_primario: '#000000',
        shop_colore_secondario: '#ffffff',
        shop_attivo: false
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Web (Sottodominio)</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-mono">
                                    http://
                                </span>
                                <input
                                    type="text"
                                    value={config.url_slug || ''}
                                    onChange={e => setConfig({...config, url_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-semibold text-gray-800"
                                    placeholder="nome-azienda"
                                />
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-mono">
                                    .operocloud.it
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">L'indirizzo che i clienti useranno per visitare il sito.</p>
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
                    </div>
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