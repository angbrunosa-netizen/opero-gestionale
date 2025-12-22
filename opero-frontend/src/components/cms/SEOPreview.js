/**
 * Nome File: SEOPreview.js
 * Posizione: src/components/cms/SEOPreview.js
 * Data: 21/12/2025
 * Descrizione: Componente per anteprima SEO Google e Social Media
 */
import React from 'react';
import { GlobeAltIcon, PhotographIcon, ShareIcon } from '@heroicons/react/24/outline';

const SEOPreview = ({ pageData, siteName }) => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(pageData.titolo_seo || '')}`;

    const formatDescription = (text, maxLength = 160) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="space-y-6">
            {/* Google Search Preview */}
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
                    <GlobeAltIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Anteprima Google Search</span>
                    <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-blue-600 hover:underline"
                    >
                        Apri Google
                    </a>
                </div>

                <div className="p-4 bg-white">
                    <div className="space-y-2">
                        <div className="text-sm text-green-700 hover:underline cursor-pointer">
                            https://{siteName?.toLowerCase().replace(/\s/g, '')}.operocloud.it/{pageData.slug}
                        </div>

                        <h3 className="text-xl text-blue-800 hover:underline cursor-pointer">
                            {pageData.titolo_seo || siteName}
                        </h3>

                        <div className="text-sm text-gray-600 leading-relaxed">
                            {formatDescription(pageData.descrizione_seo)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Media Preview */}
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-blue-100 px-4 py-2 border-b flex items-center gap-2">
                    <ShareIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Anteprima Social Media (Facebook/Twitter)</span>
                </div>

                <div className="p-4 bg-white">
                    <div className="border rounded-lg overflow-hidden">
                        {pageData.immagine_social ? (
                            <img
                                src={pageData.immagine_social}
                                alt="Social preview"
                                className="w-full h-48 object-cover"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <PhotographIcon className="h-12 w-12 text-gray-400" />
                                <span className="ml-2 text-gray-500">Nessuna immagine social</span>
                            </div>
                        )}

                        <div className="p-3">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                {pageData.titolo_seo || siteName}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {formatDescription(pageData.descrizione_seo, 100)}
                            </p>
                            <div className="text-xs text-gray-500 mt-2">
                                {siteName?.toLowerCase().replace(/\s/g, '')}.operocloud.it
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Stats */}
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-purple-100 px-4 py-2 border-b flex items-center gap-2">
                    <PhotographIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Statistiche SEO</span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Titolo SEO:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                {(pageData.titolo_seo || '').length}/60
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        (pageData.titolo_seo || '').length <= 60
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                    }`}
                                    style={{
                                        width: `${Math.min(((pageData.titolo_seo || '').length / 60) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Descrizione SEO:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                {(pageData.descrizione_seo || '').length}/160
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        (pageData.descrizione_seo || '').length <= 160
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                    }`}
                                    style={{
                                        width: `${Math.min(((pageData.descrizione_seo || '').length / 160) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Immagine Social:</span>
                        <span className={`text-sm font-medium ${
                            pageData.immagine_social ? 'text-green-600' : 'text-orange-600'
                        }`}>
                            {pageData.immagine_social ? 'Configurata ✓' : 'Non configurata'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">URL Canonical:</span>
                        <span className={`text-sm font-medium ${
                            pageData.canonical_url ? 'text-green-600' : 'text-gray-500'
                        }`}>
                            {pageData.canonical_url ? 'Impostato ✓' : 'Non impostato'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Robots:</span>
                        <span className="text-sm font-medium text-gray-700">
                            {pageData.robots_index || 'index'},{pageData.robots_follow || 'follow'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEOPreview;