// #####################################################################
// # Componente Form per Beni Strumentali - v3.5 (Import Corretto)
// # File: opero-frontend/src/components/beni-strumentali/BeneForm.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

// --- IMPORT CORRETTO E FONDAMENTALE ---
import { useAuth } from '../../context/AuthContext';

// --- NUOVO: Import del nostro gestore allegati ---
import AllegatiManager from '../../shared/AllegatiManager';

const BeneForm = ({ beneToEdit, onClose, onSave }) => {
    const [bene, setBene] = useState({
        codice_bene: '', descrizione: '', id_categoria: '', id_sottoconto_cespite: '',
        id_sottoconto_costo: '', matricola: '', url_foto: '', data_acquisto: '',
        valore_acquisto: '', id_fornitore: '', riferimento_fattura: '',
        stato: 'In magazzino', ubicazione: '', data_dismissione: null,
        valore_dismissione: null, note: ''
    });
    
    const [categorie, setCategorie] = useState([]);
    const [fornitori, setFornitori] = useState([]);
    const [sottocontiCespite, setSottocontiCespite] = useState([]);
    const [sottocontiCosto, setSottocontiCosto] = useState([]);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            try {
                const [categorieRes, anagraficheRes, pdcRes] = await Promise.all([
                    api.get('/beni-strumentali/categorie'),
                    api.get('/amministrazione/anagrafiche'),
                    api.get('/contsmart/pdc-tree')
                ]);

                if (categorieRes.data && categorieRes.data.success && Array.isArray(categorieRes.data.data)) {
                    setCategorie(categorieRes.data.data);
                } else { setCategorie([]); }
                
                if (anagraficheRes.data && anagraficheRes.data.success && Array.isArray(anagraficheRes.data.data)) {
                    const allAnagrafiche = anagraficheRes.data.data;
                    const filteredFornitori = allAnagrafiche.filter(anag => anag.relazione === 'Fornitore' || anag.relazione === 'Entrambe');
                    setFornitori(filteredFornitori);
                } else { setFornitori([]); }

                if (pdcRes.data && pdcRes.data.success && Array.isArray(pdcRes.data.data)) {
                    const cespiti = []; const costi = [];
                    const findSottoconti = (nodes) => {
                        nodes.forEach(node => {
                            if (node.children) {
                                node.children.forEach(conto => {
                                    if (conto.children) {
                                        conto.children.forEach(sottoconto => {
                                            const option = { id: sottoconto.id, descrizione: `${sottoconto.codice} - ${sottoconto.descrizione}` };
                                            if (sottoconto.natura === 'Attività') cespiti.push(option);
                                            if (sottoconto.natura === 'Costo') costi.push(option);
                                        });
                                    }
                                });
                            }
                        });
                    };
                    findSottoconti(pdcRes.data.data);
                    setSottocontiCespite(cespiti);
                    setSottocontiCosto(costi);
                }

            } catch (err) {
                console.error("Errore nel caricamento dei dati per il form:", err);
                setError("Impossibile caricare i dati di supporto per il form.");
            }
        };
        fetchDataForDropdowns();
    }, []);
    
    useEffect(() => {
        if (beneToEdit) {
            const formattedBene = { ...beneToEdit, data_acquisto: beneToEdit.data_acquisto ? new Date(beneToEdit.data_acquisto).toISOString().split('T')[0] : '', data_dismissione: beneToEdit.data_dismissione ? new Date(beneToEdit.data_dismissione).toISOString().split('T')[0] : null, };
            setBene(formattedBene);
        }
    }, [beneToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBene(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            if (bene.id) { await api.patch(`/beni-strumentali/${bene.id}`, bene); } else { await api.post('/beni-strumentali', bene); }
            onSave();
        } catch (err) {
            setError('Errore durante il salvataggio del bene. Controlla i dati inseriti.');
            console.error(err);
        } finally { setIsSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{bene.id ? 'Modifica Bene' : 'Nuovo Bene'}</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Colonna Sinistra */}
                        <div>
                             <div className="mb-4"><label htmlFor="codice_bene" className="block text-sm font-medium text-gray-700">Codice Bene</label><input type="text" name="codice_bene" value={bene.codice_bene} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
                            <div className="mb-4"><label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label><textarea name="descrizione" value={bene.descrizione} onChange={handleChange} rows="3" className="mt-1 block w-full input-style" required /></div>
                             <div className="mb-4"><label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoria</label><select name="id_categoria" value={bene.id_categoria || ''} onChange={handleChange} className="mt-1 block w-full input-style" required><option value="">Seleziona una categoria</option>{categorie.map(cat => <option key={cat.id} value={cat.id}>{cat.descrizione}</option>)}</select></div>
                            <div className="mb-4"><label htmlFor="id_sottoconto_cespite" className="block text-sm font-medium text-gray-700">Sottoconto Cespite (Attività)</label><select name="id_sottoconto_cespite" value={bene.id_sottoconto_cespite || ''} onChange={handleChange} className="mt-1 block w-full input-style"><option value="">Nessun conto specifico</option>{sottocontiCespite.map(conto => <option key={conto.id} value={conto.id}>{conto.descrizione}</option>)}</select></div>
                            <div className="mb-4"><label htmlFor="id_sottoconto_costo" className="block text-sm font-medium text-gray-700">Sottoconto di Costo Diretto (Costi)</label><select name="id_sottoconto_costo" value={bene.id_sottoconto_costo || ''} onChange={handleChange} className="mt-1 block w-full input-style"><option value="">Nessun conto specifico</option>{sottocontiCosto.map(conto => <option key={conto.id} value={conto.id}>{conto.descrizione}</option>)}</select></div>
                            <div className="mb-4"><label htmlFor="matricola" className="block text-sm font-medium text-gray-700">Matricola / Seriale</label><input type="text" name="matricola" value={bene.matricola || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                        </div>
                        {/* Colonna Destra */}
                        <div>
                             <div className="mb-4"><label htmlFor="data_acquisto" className="block text-sm font-medium text-gray-700">Data Acquisto</label><input type="date" name="data_acquisto" value={bene.data_acquisto} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                            <div className="mb-4"><label htmlFor="valore_acquisto" className="block text-sm font-medium text-gray-700">Valore Acquisto (€)</label><input type="number" step="0.01" name="valore_acquisto" value={bene.valore_acquisto || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                            <div className="mb-4"><label htmlFor="id_fornitore" className="block text-sm font-medium text-gray-700">Fornitore</label><select name="id_fornitore" value={bene.id_fornitore || ''} onChange={handleChange} className="mt-1 block w-full input-style"><option value="">Nessun fornitore</option>{fornitori.map(f => <option key={f.id} value={f.id}>{f.ragione_sociale}</option>)}</select></div>
                             <div className="mb-4"><label htmlFor="riferimento_fattura" className="block text-sm font-medium text-gray-700">Riferimento Fattura Acquisto</label><input type="text" name="riferimento_fattura" value={bene.riferimento_fattura || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                            <div className="mb-4"><label htmlFor="ubicazione" className="block text-sm font-medium text-gray-700">Ubicazione</label><input type="text" name="ubicazione" value={bene.ubicazione || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                             <div className="mb-4"><label htmlFor="url_foto" className="block text-sm font-medium text-gray-700">URL Foto</label><input type="text" name="url_foto" value={bene.url_foto || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
                        </div>
                    </div>

                    {/* --- SEZIONE ALLEGATI (visibile solo in modifica) --- */}
                    {bene.id && (
                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <AllegatiManager 
                                entita_tipo="bs_bene"
                                entita_id={bene.id}
                            />
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">{isSaving ? 'Salvataggio...' : 'Salva'}</button>
                    </div>
                </form>
                <style jsx>{`.input-style{...}.input-style:focus{...}`}</style>
            </div>
        </div>
    );
};

export default BeneForm;