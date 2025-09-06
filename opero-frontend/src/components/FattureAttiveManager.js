// #####################################################################
// # Componente FattureAttiveManager - v2.0 (Refactoring con Servizio API)
// # File: opero-frontend/src/components/FattureAttiveManager.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- Componente Generico per la Gestione delle Tabelle ---
function TableManager({ title, endpoint, columns, selectOptions = {} }) {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    
    const fetchData = useCallback(async () => {
        if (!user) return; // Non fare nulla se l'utente non è ancora caricato
        setIsLoading(true);
        setError('');
        try {
            const { data: result } = await api.get(`/api/amministrazione/${endpoint}`);
            if (result.success) setData(result.data);
            else setError(result.message || 'Errore sconosciuto.');
        } catch (err) { 
            setError(err.response?.data?.message || 'Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, [endpoint, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (itemData) => {
        const url = currentItem ? `/api/amministrazione/${endpoint}/${currentItem.id}` : `/api/amministrazione/${endpoint}`;
        const method = currentItem ? 'put' : 'post';
        try {
            const { data: result } = await api[method](url, itemData);
            if (result.success) {
                fetchData();
                setIsModalOpen(false);
            } else {
                alert(`Errore: ${result.message}`);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questo elemento?')) {
            try {
                const { data: result } = await api.delete(`/api/amministrazione/${endpoint}/${id}`);
                if (result.success) {
                    fetchData();
                } else {
                    alert(`Errore: ${result.message}`);
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };
    
    // ... Il resto del componente (UI, modale, etc.) rimane pressoché invariato ...
    
    return (
        <div>
            {/* UI per visualizzare la tabella, i pulsanti, e la modale di modifica/creazione */}
            {/* Questa parte è omessa per brevità ma è la stessa della sua versione originale */}
            <h2>{title}</h2>
            {/* ... Pulsanti e tabella qui ... */}
        </div>
    );
}


// --- Componente Specifico per le Fatture Attive ---
const FattureAttiveManager = () => {
    const [clienti, setClienti] = useState([]);
    const [iva, setIva] = useState([]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [clientiRes, ivaRes] = await Promise.all([
                api.get('/api/amministrazione/anagrafiche?tipo=cliente'),
                api.get('/api/amministrazione/iva')
            ]);
            if (clientiRes.data.success) setClienti(clientiRes.data.data);
            if (ivaRes.data.success) setIva(ivaRes.data.data);
        } catch (error) {
            console.error("Errore nel caricamento dei dati per i menu a tendina", error);
        }
    }, []);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const columns = [
        { key: 'id_cliente', label: 'Cliente', type: 'select', required: true },
        { key: 'numero_fattura', label: 'Numero Fattura', required: true },
        { key: 'data_emissione', label: 'Data Emissione', type: 'date', required: true },
        { key: 'importo_imponibile', label: 'Imponibile', type: 'number', required: true },
        { key: 'id_iva', label: 'Aliquota IVA', type: 'select' },
        { key: 'importo_totale', label: 'Totale', type: 'number', required: true },
        { key: 'data_scadenza', label: 'Data Scadenza', type: 'date' },
        { key: 'stato', label: 'Stato', type: 'select' },
    ];

    const selectOptions = {
        id_cliente: clienti.map(c => ({ value: c.id, label: c.ragione_sociale })),
        id_iva: iva.map(i => ({ value: i.id, label: `${i.codice} - ${i.aliquota}%` })),
        stato: [
            { value: 'Emessa', label: 'Emessa' },
            { value: 'Pagata', label: 'Pagata' },
            { value: 'Scaduta', label: 'Scaduta' },
        ],
    };

    return (
        <TableManager
            title="Gestione Fatture Attive"
            endpoint="fatture-attive"
            columns={columns}
            selectOptions={selectOptions}
        />
    );
};

export default FattureAttiveManager;