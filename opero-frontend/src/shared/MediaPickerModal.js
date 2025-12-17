/**
 * Nome File: MediaPickerModal.js
 * Descrizione: Modale per selezionare immagini dall'archivio S3 o caricarne di nuove.
 * Sostituisce l'input file standard nel CMS.
 */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { XMarkIcon, CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

const MediaPickerModal = ({ isOpen, onClose, onSelect, dittaId }) => {
    const [activeTab, setActiveTab] = useState('archive'); // 'archive' | 'upload'
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'archive') {
            loadImages();
        }
    }, [isOpen, activeTab, dittaId]);

    const loadImages = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/cms/media/${dittaId}`);
            setImages(res.data);
        } catch (error) {
            console.error("Errore caricamento immagini:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gestione Upload (Dropzone)
    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/admin/cms/media/upload/${dittaId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data.success) {
                // Seleziona automaticamente l'immagine appena caricata
                onSelect(res.data.url);
                onClose();
            }
        } catch (error) {
            alert("Errore caricamento: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: {'image/*': []},
        multiple: false 
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Seleziona Media</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button 
                        onClick={() => setActiveTab('archive')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'archive' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Archivio Immagini
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Carica Nuovo
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    
                    {/* TAB ARCHIVIO */}
                    {activeTab === 'archive' && (
                        <>
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((img) => (
                                        <div 
                                            key={img.id} 
                                            onClick={() => { onSelect(img.publicUrl); onClose(); }}
                                            className="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                                        >
                                            <img 
                                                src={img.publicUrl} 
                                                alt={img.file_name_originale} 
                                                className="w-full h-full object-cover" 
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                <CheckCircleIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] p-1 truncate px-2">
                                                {img.file_name_originale}
                                            </div>
                                        </div>
                                    ))}
                                    {images.length === 0 && (
                                        <div className="col-span-full text-center py-20 text-gray-400">
                                            Nessuna immagine trovata nell'archivio.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB UPLOAD */}
                    {activeTab === 'upload' && (
                        <div className="h-full flex flex-col justify-center items-center">
                            <div 
                                {...getRootProps()} 
                                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors w-full max-w-lg
                                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                            >
                                <input {...getInputProps()} />
                                {uploading ? (
                                    <div className="py-10">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-blue-600 font-medium">Caricamento su S3 in corso...</p>
                                    </div>
                                ) : (
                                    <div className="py-10">
                                        <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-700">Trascina qui l'immagine</p>
                                        <p className="text-sm text-gray-500 mt-2">oppure clicca per selezionare dal computer</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;