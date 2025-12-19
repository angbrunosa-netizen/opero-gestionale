"use client"
/**
 * Nome File: PDFViewer.js
 * Percorso: components/PDFViewer.js
 * Descrizione: PDF viewer component with error handling and fallback
 */
import React, { useState } from 'react';

export default function PDFViewer({ pdfUrl, pdfFilename }) {
    const [showFallback, setShowFallback] = useState(false);

    const handleIframeError = (e) => {
        console.log('PDF iframe error:', e);
        setShowFallback(true);
    };

    if (!pdfUrl) {
        return null;
    }

    return (
        <div style={{ margin: '2rem 0', border: '1px solid #ddd', borderRadius: '8px' }}>
            <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderBottom: '1px solid #ddd',
                fontWeight: 'bold'
            }}>
                📄 Documento PDF: {pdfFilename}
            </div>

            {/* Pulsante primario per apertura PDF */}
            <div style={{ padding: '1.5rem', textAlign: 'center', background: '#fafafa' }}>
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '1rem 2rem',
                        background: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,123,255,0.3)',
                        transition: 'all 0.2s'
                    }}
                >
                    📄 Apri PDF in Nuova Finestra
                </a>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', marginBottom: '0' }}>
                    Clicca per visualizzare il documento in una nuova scheda con zoom e strumenti di lettura completi
                </p>
            </div>

            {/* Visualizzatore PDF integrato */}
            <div style={{ height: '700px', background: '#f5f5f5' }}>
                {!showFallback ? (
                    <iframe
                        src={pdfUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        title={`PDF: ${pdfFilename}`}
                        onError={handleIframeError}
                    />
                ) : (
                    <div style={{
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        padding: '2rem',
                        textAlign: 'center',
                        background: '#fafafa',
                        display: 'flex'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            opacity: 0.5
                        }}>📄</div>
                        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Visualizzatore PDF Non Disponibile</h3>
                        <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '400px' }}>
                            Il tuo browser non supporta la visualizzazione inline dei PDF o si è verificato un errore durante il caricamento.
                        </p>
                        <div>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: '1rem 2rem',
                                    background: '#007bff',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    marginRight: '1rem'
                                }}
                            >
                                📄 Apri PDF
                            </a>
                            <a
                                href={pdfUrl}
                                download={pdfFilename}
                                style={{
                                    display: 'inline-block',
                                    padding: '1rem 2rem',
                                    background: '#28a745',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                💾 Scarica PDF
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}