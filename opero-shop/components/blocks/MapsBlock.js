"use client";
import React, { useState } from 'react';

export default function MapsBlock({ config }) {
    if (!config) return null;

    const {
        lat,
        lng,
        zoom = 15,
        title = 'La Nostra Sede',
        address = '',
        googleMapsUrl = '',
        city = '',
        street = '',
        postalCode = ''
    } = config;

    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Genera URL Google Maps se non fornito
    const generateMapsUrl = () => {
        if (googleMapsUrl) return googleMapsUrl;
        if (lat && lng) {
            return `https://maps.google.com/?q=${lat},${lng}&z=${zoom}`;
        }
        if (address) {
            return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
        }
        return `https://maps.google.com/?q=${encodeURIComponent(`${street || ''} ${city || ''} ${postalCode || ''}`)}`;
    };

    const mapsUrl = generateMapsUrl();

    return (
        <section className="py-16" style={{ backgroundColor: 'var(--block-background-color)' }}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    {title && <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>}
                    {address && <p className="text-lg text-gray-600">{address}</p>}
                </div>

                {/* Maps Container */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Interactive Map */}
                    <div className="relative h-96 bg-gray-200">
                        {!isMapLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Caricamento mappa...</p>
                                </div>
                            </div>
                        )}

                        {/* Google Maps iframe */}
                        <iframe
                            src={`https://maps.google.com/maps?q=${lat || ''},${lng || ''}&z=${zoom}&output=embed&iwloc=near`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            onLoad={() => setIsMapLoaded(true)}
                            className="w-full h-full"
                            title={`Mappa di ${title}`}
                        />
                    </div>

                    {/* Address Details */}
                    <div className="p-6 bg-white">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-4">Indirizzo</h3>
                                <div className="space-y-2 text-gray-600">
                                    {street && <p className="flex items-start">{street}</p>}
                                    {city && postalCode && (
                                        <p className="flex items-start">
                                            {postalCode} {city}
                                        </p>
                                    )}
                                    {address && <p className="flex items-start">{address}</p>}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-4">Azioni Rapide</h3>
                                <div className="space-y-3">
                                    <a
                                        href={mapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-colors hover:opacity-90"
                                        style={{ backgroundColor: 'var(--primary-color)' }}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Apri in Google Maps
                                    </a>

                                    {street && city && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${street}, ${city}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                            Indicazioni Stradali
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}