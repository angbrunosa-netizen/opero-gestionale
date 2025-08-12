// #####################################################################
// # Componente FattureAttiveManager
// # File: opero-frontend/src/components/FattureAttiveManager.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

// Importiamo il componente generico per la gestione delle tabelle
// (Assumiamo che sia stato esportato da AmministrazioneModule.js o spostato in un file separato)
// Per semplicità, lo ridefiniamo qui. In un progetto reale, andrebbe in un file di utilità.
function TableManager({ title, endpoint, columns, session, selectOptions = {} }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/${endpoint}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const result = await response.json();
            if (result.success) setData(result.data);
            else setError(result.message || 'Errore sconosciuto.');
        } catch (err) { setError('Errore di connessione al server.'); }
        setIsLoading(false);
    }, [endpoint, session.token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (item) => {
        const url = item.id ? `${API_URL}/api/amministrazione/${endpoint}/${item.id}` : `${API_URL}/api/amministrazione/${endpoint}`;
        const method = item.id ? 'PATCH' : 'POST';
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify(item)
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                setIsModalOpen(false);
                setCurrentItem(null);
                fetchData();
            }
        } catch (error) { alert('Errore di connessione'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questo record?')) {
            try {
                const response = await fetch(`${API_URL}/api/amministrazione/${endpoint}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${session.token}` }
                });
                const result = await response.json();
                alert(result.message);
                if (result.success) fetchData();
            } catch (error) { alert('Errore di connessione'); }
        }
    };

    const handleOpenModal = (item = {}) => {
        const initialItem = columns.reduce((acc, col) => ({...acc, [col.key]: ''}), {});
        setCurrentItem(item.id ? item : initialItem);
        setIsModalOpen(true);
    };

    return (
        <div>
            {isModalOpen && <CrudModal item={currentItem} columns={columns} onSave={handleSave} onCancel={() => setIsModalOpen(false)} title={currentItem.id ? `Modifica ${title}` : `Nuova ${title}`} selectOptions={selectOptions} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
                <button onClick={() => handleOpenModal()} style={{ padding: '8px 12px', cursor: 'pointer' }}>+ Aggiungi</button>
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p style={{ color: 'red' }}>Errore: {error}</p>}
            {!isLoading && !error && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {columns.map(col => <th key={col.key} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>{col.label}</th>)}
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.id}>
                                {columns.map(col => <td key={col.key} style={{ border: '1px solid #ddd', padding: '8px' }}>{row[col.key]}</td>)}
                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                    <button onClick={() => handleOpenModal(row)}>Mod</button> 
                                    <button onClick={() => handleDelete(row.id)} style={{ marginLeft: '8px' }}>Canc</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function CrudModal({ item, columns, onSave, onCancel, title, selectOptions = {} }) {
    const [formData, setFormData] = useState(item);
    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{title}</h3>
                <form onSubmit={handleSubmit}>
                    {columns.map(col => (
                        <div key={col.key} style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px' }}>{col.label}</label>
                            {col.type === 'select' ? (
                                <select name={col.key} value={formData[col.key] || ''} onChange={handleChange} required={col.required} style={{ width: '100%', padding: '8px' }}>
                                    <option value="">Seleziona...</option>
                                    {selectOptions[col.key] && selectOptions[col.key].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            ) : (
                                <input type={col.type || 'text'} name={col.key} value={formData[col.key] || ''} onChange={handleChange} required={col.required} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={onCancel}>Annulla</button>
                        <button type="submit">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FattureAttiveManager({ session }) {
    const [clienti, setClienti] = useState([]);
    const [iva, setIva] = useState([]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const anagraficheRes = await fetch(`${API_URL}/api/amministrazione/anagrafiche`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const anagraficheData = await anagraficheRes.json();
            if (anagraficheData.success) {
                setClienti(anagraficheData.data.filter(d => d.codice_relazione === 'C' || d.codice_relazione === 'E'));
            }

            const ivaRes = await fetch(`${API_URL}/api/amministrazione/iva_contabili`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const ivaData = await ivaRes.json();
            if (ivaData.success) setIva(ivaData.data);

        } catch (error) {
            console.error("Errore nel caricamento dei dati per i menu a tendina", error);
        }
    }, [session.token]);

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
            { value: 'Stornata', label: 'Stornata' },
            { value: 'Scaduta', label: 'Scaduta' },
        ]
    };

    return <TableManager title="Fatture di Vendita" endpoint="fatture_attive" columns={columns} session={session} selectOptions={selectOptions} />;
}

export default FattureAttiveManager;
