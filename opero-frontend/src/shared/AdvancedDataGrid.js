/**
 * @file opero-frontend/src/shared/AdvancedDataGrid.js
 * @description componente griglia dati riutilizzabile e stabile.
 * - v2.0: corretta la logica di rendering delle celle che causava un crash.
 * @date 2025-09-30
 * @version 2.0 (stabile)
 */

import React from 'react';

const AdvancedDataGrid = ({ columns, data, loading, error }) => {

    if (loading) {
        return <div className="text-center p-4">Caricamento dati in corso...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">Errore: {error}</div>;
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th 
                                key={col.accessorKey || col.id} 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td 
                                        key={col.accessorKey || col.id} 
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                                    >
                                        {/* * ###############################################################
                                         * ## CORREZIONE: Logica di rendering della cella semplificata. ##
                                         * ###############################################################
                                         * - Se esiste una funzione 'cell', la usiamo. Le passiamo un oggetto
                                         * che simula la struttura usata da librerie standard, rendendo
                                         * il componente più flessibile.
                                         * - Altrimenti, mostriamo semplicemente il dato usando l'accessorKey.
                                         */
                                        col.cell 
                                            ? col.cell({ row: { original: row }, getValue: () => row[col.accessorKey] }) 
                                            : row[col.accessorKey]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-8 text-gray-500">
                                Nessun dato disponibile.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdvancedDataGrid;

