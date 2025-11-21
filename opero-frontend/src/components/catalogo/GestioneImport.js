/**
 * @file opero-frontend/src/components/catalogo/GestioneImport.js
 * @description Componente dedicato alla gestione degli import per il catalogo.
 * @date 2025-11-17
 * @version 1.0
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
    DocumentArrowUpIcon, PhotoIcon, QrCodeIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

import ImportCsvModal from './ImportCsvModal';
import EanMassImport from './EanMassImport';
import ImportFotoCatalogoModal from './ImportFotoCatalogoModal';

const GestioneImport = () => {
    const { hasPermission } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Stati per i modali di importazione
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isEanMassImportOpen, setIsEanMassImportOpen] = useState(false);
    const [isImportFotoModalOpen, setIsImportFotoModalOpen] = useState(false);

    const forceRefresh = () => setRefreshTrigger(t => t + 1);

    const handleOpenImportModal = useCallback((type) => {
        switch (type) {
            case 'catalogo':
                setIsImportModalOpen(true);
                break;
            case 'ean':
                setIsEanMassImportOpen(true);
                break;
            case 'foto':
                setIsImportFotoModalOpen(true);
                break;
            default:
                break;
        }
    }, []);

    const handleCloseImportModal = useCallback((type) => {
        switch (type) {
            case 'catalogo':
                setIsImportModalOpen(false);
                break;
            case 'ean':
                setIsEanMassImportOpen(false);
                break;
            case 'foto':
                setIsImportFotoModalOpen(false);
                break;
            default:
                break;
        }
        forceRefresh();
    }, []);

    const importOptions = [
        {
            key: 'catalogo',
            title: 'Importa Catalogo da CSV',
            description: 'Carica un file CSV per importare o aggiornare le entità del catalogo',
            icon: DocumentArrowUpIcon,
            permission: 'CT_IMPORT_CSV',
            color: 'blue'
        },
        {
            key: 'foto',
            title: 'Importa Foto Massivo',
            description: 'Carica più immagini contemporaneamente e abbina automaticamente ai prodotti',
            icon: PhotoIcon,
            permission: 'CT_IMPORT_CSV',
            color: 'teal'
        },
        {
            key: 'ean',
            title: 'Importa EAN Multipli',
            description: 'Aggiungi rapidamente codici EAN a più prodotti',
            icon: QrCodeIcon,
            permission: 'CT_EAN_MANAGE',
            color: 'purple'
        }
    ];

    return (
        <div className="p-6 bg-white h-full">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gestione Importazioni</h1>
                    <p className="mt-2 text-gray-600">Utilizza questi strumenti per importare dati nel catalogo in modo massivo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {importOptions.map(option => {
                        const Icon = option.icon;
                        const hasPermissionToAccess = hasPermission(option.permission);
                        
                        if (!hasPermissionToAccess) return null;
                        
                        return (
                            <div 
                                key={option.key}
                                className={`bg-${option.color}-50 border border-${option.color}-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer`}
                                onClick={() => handleOpenImportModal(option.key)}
                            >
                                <div className={`inline-flex p-3 bg-${option.color}-100 rounded-lg mb-4`}>
                                    <Icon className={`h-6 w-6 text-${option.color}-600`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                                <p className="text-gray-600 text-sm">{option.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={forceRefresh}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Aggiorna Stato
                    </button>
                </div>
            </div>

            {/* Modali di importazione */}
            {isImportModalOpen && (
                <ImportCsvModal 
                    onClose={() => handleCloseImportModal('catalogo')} 
                    onImportSuccess={forceRefresh} 
                />
            )}
            
            {isEanMassImportOpen && (
                <EanMassImport 
                    onClose={() => handleCloseImportModal('ean')} 
                    onImportSuccess={forceRefresh} 
                />
            )}
            
            {isImportFotoModalOpen && (
                <ImportFotoCatalogoModal 
                     isOpen={isImportFotoModalOpen} 
                    onClose={() => handleCloseImportModal('foto')} 
                    onImportSuccess={forceRefresh} 
                />
            )}
        </div>
    );
};

export default GestioneImport;