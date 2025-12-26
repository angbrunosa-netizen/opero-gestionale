/**
 * Nome File: StarterSiteWizard.js
 * Posizione: src/components/cms/StarterSiteWizard.js
 * Data: 25/12/2025
 * Descrizione: Wizard per la creazione di siti starter completi
 * - 4 target: commercial, services, restaurant, craftsman
 * - Accessibile a System Admin e Company Admin
 * - Avvisa sulla cancellazione irreversibile dei contenuti esistenti
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon,
    ArrowPathIcon, XMarkIcon, InformationCircleIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { generateContentGuidePDF } from '../../utils/contentGuideGenerator';

const StarterSiteWizard = ({ dittaId, dittaName, onCreateComplete }) => {
    const [step, setStep] = useState(1); // 1: select, 2: warning, 3: creating, 4: success/download
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);

    // Carica i preset disponibili
    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const res = await api.get('/admin/cms/starter-presets');
            setPresets(res.data.presets);
        } catch (err) {
            console.error('Errore caricamento preset:', err);
            setError('Impossibile caricare i preset disponibili');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPreset = (presetKey) => {
        setSelectedPreset(presetKey);
        setStep(2); // Vai alla schermata di conferma
    };

    const handleConfirmCreation = async () => {
        setStep(3);
        setCreating(true);
        setError(null);

        try {
            const res = await api.post('/admin/cms/create-starter-site', {
                idDitta: dittaId,
                targetPreset: selectedPreset
            });

            if (res.data.success) {
                setSuccess(res.data);
                setStep(4); // Vai allo step success/download
            } else {
                setError(res.data.error || 'Errore durante la creazione del sito');
                setStep(2); // Torna alla conferma per permettere riprovare
            }
        } catch (err) {
            console.error('Errore creazione sito:', err);
            setError(err.response?.data?.error || 'Errore durante la creazione del sito');
            setStep(2); // Torna alla conferma per permettere riprovare
        } finally {
            setCreating(false);
        }
    };

    const handleDownloadPDF = () => {
        const preset = presets.find(p => p.key === selectedPreset);
        generateContentGuidePDF(preset, dittaName);
        setPdfDownloaded(true);
    };

    const handleContinue = () => {
        if (onCreateComplete) {
            onCreateComplete(success);
        }
    };

    const handleCancel = () => {
        setStep(1);
        setSelectedPreset(null);
        setError(null);
        setSuccess(null);
    };

    // STEP 1: Selezione Preset
    if (step === 1) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <SparklesIcon className="h-7 w-7 text-purple-600" />
                            Crea il tuo Sito Starter
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Scegli il tipo di attività che meglio rappresenta la tua azienda.
                            Creeremo automaticamente un sito completo di 4 pagine con contenuti di esempio.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Caricamento preset...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {presets.map((preset) => (
                            <PresetCard
                                key={preset.key}
                                preset={preset}
                                onSelect={() => handleSelectPreset(preset.key)}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Come funziona</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Seleziona il tipo di attività più adatto alla tua azienda</li>
                                <li>Il sistema creerà automaticamente 4 pagine con contenuti di esempio</li>
                                <li>Puoi successivamente personalizzare tutti i contenuti dal CMS</li>
                                <li>I colori e il template saranno già ottimizzati per il tipo di attività scelto</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">Attenzione</p>
                            <p className="mt-1">
                                Se il sito contiene già delle pagine, queste verranno <strong>cancellate definitivamente</strong> prima di creare il nuovo sito starter.
                                L'operazione è <strong>irreversibile</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 2: Conferma e Avvertenze
    if (step === 2) {
        const preset = presets.find(p => p.key === selectedPreset);

        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
                        Conferma Creazione Sito Starter
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Riepilogo selezione */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Riepilogo</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Azienda:</span>
                                <p className="font-medium text-gray-900">{dittaName}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Tipo Sito:</span>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    <span className="text-2xl">{preset?.icon}</span>
                                    {preset?.name}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Template:</span>
                                <p className="font-medium text-gray-900 capitalize">{preset?.template}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Pagine da creare:</span>
                                <p className="font-medium text-gray-900">{preset?.pages?.length || 4} pagine</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-gray-500 text-sm">Pagine:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {preset?.pages?.map((page, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                    >
                                        {page.charAt(0).toUpperCase() + page.slice(1)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AVVERTENZE CRITICHE */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-2">AVVERTENZE IMPORTANTI</h3>
                                <ul className="space-y-2 text-sm text-red-800">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">⚠️</span>
                                        <span>
                                            Tutte le pagine e i contenuti esistenti verranno <strong>cancellati definitivamente</strong>
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">⚠️</span>
                                        <span>
                                            L'operazione è <strong>completamente irreversibile</strong> - non è possibile recuperare i contenuti cancellati
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">⚠️</span>
                                        <span>
                                            Il menu di navigazione verrà completamente ricostruito
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold">⚠️</span>
                                        <span>
                                            I colori e il template verranno sovrascritti con quelli del preset selezionato
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-sm">
                        <p className="text-gray-700">
                            <strong>Disclaimer:</strong> L'utilizzo di questa funzione è esclusiva responsabilità dell'utente.
                            La piattaforma Opero Cloud declina ogni responsabilità per la perdita di dati derivante dall'uso di questo wizard.
                            Si consiglia di eseguire un backup dei contenuti importanti prima di procedere.
                        </p>
                    </div>

                    {/* Pulsanti azione */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t">
                        <button
                            onClick={handleCancel}
                            disabled={creating}
                            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleConfirmCreation}
                            disabled={creating}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? (
                                <>
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    Creazione in corso...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-5 w-5" />
                                    Conferma e Crea Sito
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // STEP 3: Creazione in corso
    if (step === 3) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900">Creazione sito in corso...</h3>
                    <p className="mt-2 text-gray-600">Stiamo creando le pagine e i contenuti del tuo nuovo sito.</p>
                    <p className="mt-1 text-sm text-gray-500">Questo potrebbe richiedere alcuni secondi.</p>
                </div>
            </div>
        );
    }

    // STEP 4: Successo con download PDF
    if (step === 4) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-gray-900">Sito creato con successo!</h3>
                    <p className="mt-2 text-gray-600">
                        Il sito starter "<strong>{success.data?.presetName}</strong>" è stato creato per <strong>{success.data?.companyName}</strong>
                    </p>

                    {/* Riepilogo */}
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left max-w-md mx-auto">
                        <h4 className="font-semibold text-green-900 mb-3">Riepilogo Creazione</h4>
                        <ul className="space-y-2 text-sm text-green-800">
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                                Pagine create: <strong>{success.data?.pagesCreated}</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                                Template applicato: <strong className="capitalize">{success.data?.template}</strong>
                            </li>
                            {success.data?.hadExistingContent && (
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                                    Contenuti precedenti rimossi
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* PDF Guide Download - BOX PRINCIPALE */}
                    <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl shadow-lg">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <DocumentArrowDownIcon className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-center">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">📚 Scarica la Guida Completa!</h4>
                                <p className="text-gray-600 max-w-md">
                                    Ottieni un PDF professionale con istruzioni dettagliate per personalizzare contenuti, immagini, testi e molto altro.
                                </p>
                            </div>

                            {/* Preview contenuti PDF */}
                            <div className="grid grid-cols-2 gap-3 text-left w-full max-w-lg mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Linee guida testi</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Dimensioni immagini</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Consigli fotocamera</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Siti foto gratis</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Checklist completo</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <span className="text-green-600">✓</span>
                                    <span>Supporto OperoCloud</span>
                                </div>
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                className="mt-4 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <DocumentArrowDownIcon className="h-6 w-6" />
                                Scarica Guida PDF
                            </button>

                            {pdfDownloaded && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-100 px-4 py-2 rounded-lg animate-pulse">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span className="font-medium">PDF scaricato con successo!</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pulsante continua */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleContinue}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Vai alla Gestione Sito →
                        </button>
                        <p className="mt-3 text-sm text-gray-500">
                            {pdfDownloaded
                                ? "Puoi scaricare la guida anche più tardi dalla documentazione."
                                : "Ti consigliamo di scaricare la guida prima di continuare."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Errore STEP 3
    if (!creating && !success && error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900">Errore nella creazione</h3>
                    <p className="mt-2 text-gray-600">{error || 'Si è verificato un errore imprevisto'}</p>
                    <button
                        onClick={handleCancel}
                        className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                    >
                        Torna alla selezione
                    </button>
                </div>
            </div>
        );
    }

    // Fallback
    return null;
}; // Chiude StarterSiteWizard

// Componente Card per preset
function PresetCard({ preset, onSelect }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-left w-full bg-white border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg"
            style={{
                borderColor: isHovered ? preset.colors?.primary : '#e5e7eb',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
            }}
        >
            {/* Icona e nome */}
            <div className="flex items-center gap-4 mb-4">
                <div
                    className="h-16 w-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${preset.colors?.primary}20` }}
                >
                    {preset.icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{preset.name}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1 capitalize">
                        {preset.template}
                    </span>
                </div>
            </div>

            {/* Descrizione */}
            <p className="text-gray-600 text-sm mb-4">{preset.description}</p>

            {/* Colori */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Colori:</span>
                <div
                    className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: preset.colors?.primary }}
                    title="Colore primario"
                />
                <div
                    className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: preset.colors?.secondary }}
                    title="Colore secondario"
                />
                {preset.colors?.accent && (
                    <div
                        className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: preset.colors.accent }}
                        title="Colore accento"
                    />
                )}
            </div>

            {/* Pagine */}
            <div className="mb-4">
                <span className="text-xs text-gray-500 block mb-2">Pagine incluse:</span>
                <div className="flex flex-wrap gap-1">
                    {preset.pages?.map((page, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: preset.colors?.primary }}
                        >
                            {page.charAt(0).toUpperCase() + page.slice(1)}
                        </span>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div
                className="text-sm font-medium transition-colors"
                style={{ color: preset.colors?.primary }}
            >
                {isHovered ? 'Crea questo sito →' : 'Seleziona per creare'}
            </div>
        </button>
    );
}

export default StarterSiteWizard;
