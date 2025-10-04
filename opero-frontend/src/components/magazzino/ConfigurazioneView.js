/**
 * @file opero-frontend/src/components/magazzino/ConfigurazioneView.js
 * @description Vista che unifica i manager per le tabelle di supporto del magazzino.
 * @version 1.0
 * @date 2025-10-04
 */

import React from 'react';
import CategorieManager from '../catalogo/CategorieManager';
import MagazziniManager from './MagazziniManager';
import CausaliManager from './CausaliManager';

const ConfigurazioneView = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestione Magazzini/Depositi</h2>
                <MagazziniManager />
            </div>
            <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestione Causali di Movimento</h2>
                <CausaliManager />
            </div>
             <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestione Categorie Articoli</h2>
                <CategorieManager />
            </div>
        </div>
    );
};

export default ConfigurazioneView;

