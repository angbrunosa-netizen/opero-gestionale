"use client";
import React from 'react';

export default function HtmlBlock({ config }) {
    if (!config) return null;

    const {
        html = '',
        fontFamily = 'Arial, sans-serif',
        fontSize = '16px',
        textColor = '#333333',
        backgroundColor = null, // fallback to theme background
        textAlign = 'left'
    } = config;

    // Stile dinamico basato sulla configurazione
    const containerStyle = {
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: textColor,
        backgroundColor: backgroundColor || 'var(--block-background-color)',
        textAlign: textAlign,
        padding: '2rem',
        minHeight: '100px',
        borderRadius: '0.5rem',
        margin: '1rem auto',
        maxWidth: '1200px',
        lineHeight: '1.6'
    };

    // Se non c'è HTML, mostra un placeholder
    if (!html || html.trim() === '') {
        return (
            <div style={containerStyle} className="html-block">
                <div className="text-gray-400 italic">
                    {config.fontSize ? (
                        <span>Contenuto HTML personalizzato</span>
                    ) : (
                        <span>Aggiungi contenuto HTML dal pannello CMS</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle} className="html-block">
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}