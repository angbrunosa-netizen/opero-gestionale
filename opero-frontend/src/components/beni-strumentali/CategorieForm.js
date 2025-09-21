// #####################################################################
// # Componente Form per Categorie Beni Strumentali v1.0
// # File: opero-frontend/src/components/beni-strumentali/CategorieForm.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const CategorieForm = ({ categoriaToEdit, onClose, onSave }) => {
    const [categoria, setCategoria] = useState({ codice: '', descrizione: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (categoriaToEdit) {
            setCategoria(categoriaToEdit);
        }
    }, [categoriaToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            if (categoria.id) {
                await api.patch(`/beni-strumentali/categorie/${categoria.id}`, categoria);
            } else {
                await api.post('/beni-strumentali/categorie', categoria);
            }
            onSave();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Errore durante il salvataggio.';
            setError(errorMsg);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{categoria.id ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                        <input
                            type="text" name="codice" value={categoria.codice} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div className="mb-6">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input
                            type="text" name="descrizione" value={categoria.descrizione} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Annulla
                        </button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'Salvataggio...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategorieForm;

