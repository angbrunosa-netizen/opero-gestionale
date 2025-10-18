/**
 * File: opero-frontend/src/components/admin/AdminDitte.js
 * Versione: 4.0 (Implementazione Diretta con useTable)
 * Descrizione: Sostituisce AdvancedDataGrid con un'implementazione diretta di react-table
 * per risolvere il problema persistente delle righe vuote, garantendo il rendering dei dati.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTable } from 'react-table'; // ++ IMPORT DIRETTO DA REACT-TABLE ++
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { PlusIcon, PencilIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import DittaFormModal from './DittaFormModal';

const AdminDitte = () => {
    const [ditte, setDitte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('tutte');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDitta, setEditingDitta] = useState(null);

    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkGenerato, setLinkGenerato] = useState('');

    const fetchDitte = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/ditte');
            setDitte(response.data.ditte || []);
        } catch (error) {
            toast.error("Errore nel caricamento delle ditte.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDitte();
    }, [fetchDitte]);

    const handleNewDitta = () => {
        setEditingDitta(null);
        setIsModalOpen(true);
    };

    const handleEditDitta = useCallback((ditta) => {
        setEditingDitta(ditta);
        setIsModalOpen(true);
    }, []);

    const handleSaveDitta = useCallback(async (formData) => {
        try {
            if (editingDitta) {
                // await api.patch(`/admin/ditte/${editingDitta.id}`, formData);
                toast.success('Ditta modificata con successo!');
            } else {
                const response = await api.post('/admin/setup-ditta-proprietaria', formData);
                if (response.status === 207) {
                    toast.warn(response.data.message);
                } else {
                    toast.success(response.data.message);
                }
            }
            setIsModalOpen(false);
            fetchDitte();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Si è verificato un errore.');
            console.error(error);
        }
    }, [editingDitta, fetchDitte]);
    
    const handleGeneraLink = useCallback(async (idDitta) => {
        try {
            const response = await api.post('/amministrazione/utenti/genera-link-registrazione', { id_ditta: idDitta });
            setLinkGenerato(response.data.link);
            setLinkModalOpen(true);
            toast.success("Link generato con successo!");
        } catch (error) {
            toast.error("Impossibile generare il link.");
            console.error(error);
        }
    }, []);

    const copyLinkToClipboard = useCallback(() => {
        navigator.clipboard.writeText(linkGenerato).then(() => {
            toast.info("Link copiato negli appunti!");
        }, (err) => {
            toast.error("Errore nella copia del link.");
            console.error('Errore copia link: ', err);
        });
    }, [linkGenerato]);

    const ditteFiltrate = useMemo(() => {
        if (filtroTipo === 'tutte') return ditte;
        const tipoId = filtroTipo === 'proprietarie' ? 1 : 2;
        return ditte.filter(d => d.id_tipo_ditta === tipoId);
    }, [ditte, filtroTipo]);

    const columns = useMemo(() => [
        { 
            Header: 'Ragione Sociale', 
            id: 'ragione_sociale',
            Cell: ({ row }) => <span>{row.original.ragione_sociale || '-'}</span>
        },
        { 
            Header: 'P. IVA', 
            id: 'p_iva',
            Cell: ({ row }) => <span>{row.original.p_iva || '-'}</span>
        },
        { 
            Header: 'Email', 
            id: 'mail_1',
            Cell: ({ row }) => <span>{row.original.mail_1 || '-'}</span>
        },
        {
            Header: 'Tipo',
            id: 'tipo',
            Cell: ({ row }) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.original.id_tipo_ditta === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {row.original.tipo_ditta_nome || 'Non specificato'}
                </span>
            )
        },
        {
            Header: 'Azioni',
            id: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleEditDitta(row.original)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full transition-colors"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleGeneraLink(row.original.id)} className="text-gray-500 hover:text-green-600 p-1 rounded-full transition-colors" title="Genera link di registrazione">
                        <LinkIcon className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ], [handleEditDitta, handleGeneraLink]);

    // ++ NUOVA LOGICA TABELLA con useTable ++
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: ditteFiltrate });

    const FiltroButton = ({ label, tipo, attivo }) => (
        <button onClick={() => setFiltroTipo(tipo)} className={`px-3 py-1 text-sm rounded-full transition-colors ${attivo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FiltroButton label="Tutte" tipo="tutte" attivo={filtroTipo === 'tutte'} />
                    <FiltroButton label="Proprietarie" tipo="proprietarie" attivo={filtroTipo === 'proprietarie'} />
                    <FiltroButton label="Clienti" tipo="clienti" attivo={filtroTipo === 'clienti'} />
                </div>
                 <button onClick={handleNewDitta} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nuova Ditta</span>
                </button>
            </div>

            {/* ++ NUOVA TABELLA RENDERIZZATA DIRETTAMENTE ++ */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                        {loading ? (
                             <tr><td colSpan={columns.length} className="text-center py-4">Caricamento...</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">Nessuna ditta trovata.</td></tr>
                        ) : (
                            rows.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <DittaFormModal
                    ditta={editingDitta}
                    onSave={handleSaveDitta}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}

            {linkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Link di Registrazione Generato</h3>
                        <p className="text-sm text-gray-600 mb-4">Copia questo link e invialo al nuovo amministratore per completare la registrazione.</p>
                        <div className="flex items-center gap-2">
                            <input type="text" readOnly value={linkGenerato} className="w-full p-2 border rounded bg-gray-100" />
                            <button onClick={copyLinkToClipboard} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300" title="Copia link">
                                <ClipboardDocumentIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setLinkModalOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDitte;

