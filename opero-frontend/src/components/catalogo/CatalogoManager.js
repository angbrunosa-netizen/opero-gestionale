/**
 * @file opero-frontend/src/components/catalogo/CatalogoManager.js
 * @description componente per la gestione dell'anagrafica entità catalogo.
 * - v2.1: Corretto un errore di sintassi nell'optional chaining.
 * @date 2025-09-30
 * @version 2.1
 */

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
import {
    useAuth
} from '../../context/AuthContext';
import {
    api
} from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import {
    PlusIcon,
    ArrowPathIcon,
    ArchiveBoxArrowDownIcon,
    DocumentArrowUpIcon
} from '@heroicons/react/24/solid';

// Importiamo il nuovo componente modale
import ImportCsvModal from './ImportCsvModal';

// --- Componente Modale per Creazione/Modifica ---
const CatalogoFormModal = ({
    item,
    onSave,
    onCancel,
    supportData
}) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (item) {
            setFormData({
                codice_entita: item.codice_entita || '',
                descrizione: item.descrizione || '',
                id_categoria: item.id_categoria || null,
                tipo_entita: item.tipo_entita || 'bene',
                id_unita_misura: item.id_unita_misura || null,
                id_aliquota_iva: item.id_aliquota_iva || null,
                prezzo_acquisto: item.prezzo_acquisto || 0,
                prezzo_vendita: item.prezzo_vendita || 0,
                gestito_a_magazzino: item.gestito_a_magazzino || false,
                id_stato_entita: item.id_stato_entita || null,
            });
        } else {
            setFormData({
                codice_entita: '',
                descrizione: '',
                id_categoria: null,
                tipo_entita: 'bene',
                id_unita_misura: null,
                id_aliquota_iva: null,
                prezzo_acquisto: 0,
                prezzo_vendita: 0,
                gestito_a_magazzino: false,
                id_stato_entita: null
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;
        setFormData(prev => ({ ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };

    const renderCategoryOptions = (nodes, depth = 0) => {
        let options = [];
        nodes.forEach(node => {
            options.push( <
                option key = {
                    node.id
                }
                value = {
                    node.id
                } > {
                    '\u00A0'.repeat(depth * 4)
                } {
                    node.codice_categoria
                } - {
                    node.nome_categoria
                } <
                /option>
            );
            if (node.children && node.children.length > 0) {
                options = options.concat(renderCategoryOptions(node.children, depth + 1));
            }
        });
        return options;
    };


    return ( <
        div className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" >
        <
        div className = "bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" >
        <
        h2 className = "text-xl font-bold mb-4" > {
            item && item.id ? 'Modifica Entità Catalogo' : 'Nuova Entità Catalogo'
        } < /h2> <
        form onSubmit = {
            handleSubmit
        }
        className = "flex-1 overflow-y-auto pr-2" >
        <
        div className = "grid grid-cols-1 md:grid-cols-2 gap-4" >
        <
        div >
        <
        label htmlFor = "codice_entita"
        className = "block text-sm font-medium text-gray-700" > Codice < /label> <
        input type = "text"
        name = "codice_entita"
        value = {
            formData.codice_entita || ''
        }
        onChange = {
            handleChange
        }
        required className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" / >
        <
        /div> <
        div >
        <
        label htmlFor = "descrizione"
        className = "block text-sm font-medium text-gray-700" > Descrizione < /label> <
        input type = "text"
        name = "descrizione"
        value = {
            formData.descrizione || ''
        }
        onChange = {
            handleChange
        }
        required className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" / >
        <
        /div> <
        div className = "col-span-2" >
        <
        label htmlFor = "id_categoria"
        className = "block text-sm font-medium text-gray-700" > Categoria < /label> <
        select name = "id_categoria"
        value = {
            formData.id_categoria || ''
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" >
        <
        option value = "" > --Seleziona una categoria-- < /option> {
            renderCategoryOptions(supportData.categorie)
        } <
        /select> <
        /div> <
        div >
        <
        label htmlFor = "tipo_entita"
        className = "block text-sm font-medium text-gray-700" > Tipo < /label> <
        select name = "tipo_entita"
        value = {
            formData.tipo_entita || 'bene'
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" >
        <
        option value = "bene" > Bene < /option> <
        option value = "servizio" > Servizio < /option> <
        option value = "composito" > Composito < /option> <
        /select> <
        /div> <
        div >
        <
        label htmlFor = "id_unita_misura"
        className = "block text-sm font-medium text-gray-700" > Unità di Misura < /label> <
        select name = "id_unita_misura"
        value = {
            formData.id_unita_misura || ''
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" >
        <
        option value = "" > --Seleziona-- < /option> {
            supportData.unitaMisura.map(um => ( <
                option key = {
                    um.id
                }
                value = {
                    um.id
                } > {
                    um.sigla
                } - {
                    um.descrizione
                } < /option>
            ))
        } <
        /select> <
        /div> <
        div >
        <
        label htmlFor = "prezzo_acquisto"
        className = "block text-sm font-medium text-gray-700" > Prezzo Acquisto < /label> <
        input type = "number"
        step = "0.01"
        name = "prezzo_acquisto"
        value = {
            formData.prezzo_acquisto || 0
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" / >
        <
        /div> <
        div >
        <
        label htmlFor = "prezzo_vendita"
        className = "block text-sm font-medium text-gray-700" > Prezzo Vendita < /label> <
        input type = "number"
        step = "0.01"
        name = "prezzo_vendita"
        value = {
            formData.prezzo_vendita || 0
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" / >
        <
        /div> <
        div >
        <
        label htmlFor = "id_aliquota_iva"
        className = "block text-sm font-medium text-gray-700" > Aliquota IVA < /label> <
        select name = "id_aliquota_iva"
        value = {
            formData.id_aliquota_iva || ''
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" >
        <
        option value = "" > --Seleziona-- < /option> {
            supportData.aliquoteIva.map(iva => ( <
                option key = {
                    iva.id
                }
                value = {
                    iva.id
                } > {
                    iva.codice
                } - {
                    iva.descrizione
                } < /option>
            ))
        } <
        /select> <
        /div> <
        div >
        <
        label htmlFor = "id_stato_entita"
        className = "block text-sm font-medium text-gray-700" > Stato < /label> <
        select name = "id_stato_entita"
        value = {
            formData.id_stato_entita || ''
        }
        onChange = {
            handleChange
        }
        className = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" >
        <
        option value = "" > --Seleziona-- < /option> {
            supportData.statiEntita.map(stato => ( <
                option key = {
                    stato.id
                }
                value = {
                    stato.id
                } > {
                    stato.descrizione
                } < /option>
            ))
        } <
        /select> <
        /div> <
        div className = "col-span-2 flex items-center" >
        <
        input type = "checkbox"
        id = "gestito_a_magazzino"
        name = "gestito_a_magazzino"
        checked = {
            formData.gestito_a_magazzino || false
        }
        onChange = {
            handleChange
        }
        className = "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" / >
        <
        label htmlFor = "gestito_a_magazzino"
        className = "ml-2 block text-sm text-gray-900" > Gestito a Magazzino < /label> <
        /div> <
        /div> <
        div className = "mt-6 pt-4 border-t flex justify-end gap-4" >
        <
        button type = "button"
        onClick = {
            onCancel
        }
        className = "px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" > Annulla < /button> <
        button type = "submit"
        className = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" > Salva < /button> <
        /div> <
        /form> <
        /div> <
        /div>
    );
};


// --- Componente Principale ---
const CatalogoManager = () => {
    const {
        hasPermission
    } = useAuth();
    const [entita, setEntita] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [supportData, setSupportData] = useState({
        categorie: [],
        unitaMisura: [],
        aliquoteIva: [],
        statiEntita: []
    });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Stato per il modale di import

    const fetchSupportData = useCallback(async () => {
        try {
            const [catRes, umRes, ivaRes, statiRes] = await Promise.all([
                api.get('/catalogo/categorie'),
                api.get('/catalogo/unita-misura'),
                api.get('/amministrazione/iva'),
                api.get('/catalogo/stati-entita')
            ]);
            setSupportData({
                categorie: catRes.data,
                unitaMisura: umRes.data.data,
                aliquoteIva: ivaRes.data.data,
                statiEntita: statiRes.data.data,
            });
        } catch (err) {
            console.error("Errore nel caricamento dei dati di supporto", err);
            setError("Impossibile caricare i dati di supporto necessari.");
        }
    }, []);

    const fetchEntita = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/catalogo/entita?includeArchived=${includeArchived}`);
            setEntita(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle entità del catalogo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [includeArchived]);

    useEffect(() => {
        fetchSupportData();
        fetchEntita();
    }, [fetchSupportData, fetchEntita]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    const handleArchive = async (item) => {
        if (window.confirm(`Sei sicuro di voler archiviare l'entità "${item.descrizione}"?`)) {
            try {
                await api.delete(`/catalogo/entita/${item.id}`);
                fetchEntita();
            } catch (err) {
                // #################################################
                // ## CORREZIONE: rimossa sintassi errata (? .)   ##
                // #################################################
                alert('Errore durante l\'archiviazione: ' + (err.response?.data?.message || err.message));
            }
        }
    };
    const handleSave = async (data, itemId) => {
        try {
            if (itemId) {
                await api.patch(`/catalogo/entita/${itemId}`, data);
            } else {
                await api.post('/catalogo/entita', data);
            }
            fetchEntita();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            // #################################################
            // ## CORREZIONE: rimossa sintassi errata (? .)   ##
            // #################################################
            alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message));
        }
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice_entita' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        { header: 'Categoria', accessorKey: 'nome_categoria' },
        { header: 'Stato', accessorKey: 'stato_entita' },
        { header: 'Prezzo Vendita', accessorKey: 'prezzo_vendita', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        {
            header: 'Azioni',
            id: 'actions',
            cell: ({ row }) => ( <
                div className = "flex gap-2" > {
                    hasPermission('CT_MANAGE') && ( <
                        >
                        <
                        button onClick = {
                            () => handleEdit(row.original)
                        }
                        className = "text-blue-600 hover:text-blue-800" > Modifica < /button> {
                            row.original.codice_stato !== 'DEL' && ( <
                                button onClick = {
                                    () => handleArchive(row.original)
                                }
                                className = "text-red-600 hover:text-red-800" > Archivia < /button>
                            )
                        } <
                        />
                    )
                } <
                /div>
            )
        }
    ], [hasPermission]);

    return ( <
        div className = "p-4" >
        <
        div className = "flex justify-between items-center mb-4" >
        <
        h1 className = "text-xl font-bold" > Anagrafica Entità Catalogo < /h1> <
        div className = "flex items-center gap-2" >
        <
        div className = "flex items-center" >
        <
        input type = "checkbox"
        id = "includeArchived"
        checked = {
            includeArchived
        }
        onChange = {
            (e) => setIncludeArchived(e.target.checked)
        }
        className = "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" / >
        <
        label htmlFor = "includeArchived"
        className = "ml-2 text-sm text-gray-600" > Mostra Archiviati < /label> <
        /div>

        {
            hasPermission('CT_IMPORT_CSV') && ( <
                button onClick = {
                    () => setIsImportModalOpen(true)
                }
                className = "flex items-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm" >
                <
                DocumentArrowUpIcon className = "h-5 w-5 mr-1" / > Importa da CSV <
                /button>
            )
        }

        {
            hasPermission('CT_MANAGE') && ( <
                button onClick = {
                    handleAdd
                }
                className = "flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm" > < PlusIcon className = "h-5 w-5 mr-1" / > Nuova < /button>
            )
        } <
        button onClick = {
            fetchEntita
        }
        title = "Ricarica dati"
        className = "p-2 text-gray-500 hover:text-gray-800" > < ArrowPathIcon className = "h-5 w-5" / > < /button> <
        /div> <
        /div>

        <
        AdvancedDataGrid columns = {
            columns
        }
        data = {
            entita
        }
        loading = {
            loading
        }
        error = {
            error
        }
        />

        {
            isModalOpen && ( <
                CatalogoFormModal item = {
                    editingItem
                }
                onSave = {
                    handleSave
                }
                onCancel = {
                    handleCancel
                }
                supportData = {
                    supportData
                }
                />
            )
        }

        {
            isImportModalOpen && ( <
                ImportCsvModal onClose = {
                    () => setIsImportModalOpen(false)
                }
                onImportSuccess = {
                    () => {
                        setIsImportModalOpen(false);
                        fetchEntita(); // Ricarica i dati dopo l'import
                    }
                }
                />
            )
        } <
        /div>
    );
};

export default CatalogoManager;