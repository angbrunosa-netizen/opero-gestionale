"use client";
import React from 'react';

export default function HeroBlock({ config }) {
  if (!config) return null;

  const {
    titolo = '',
    sottotitolo = '',
    immagine_url = '',
    allineamento = 'center',
    cta_text = '',
    ctaLink = '#',
    // Stile personalizzato
    titoloColore = '#ffffff',
    titoloFontSize = 'text-4xl md:text-6xl',
    titoloFontWeight = 'font-extrabold',
    titoloFont = 'Inter, sans-serif',
    sottotitoloColore = '#f3f4f6',
    sottotitoloFontSize = 'text-xl',
    sottotitoloFontWeight = 'font-medium',
    sottotitoloFont = 'Inter, sans-serif',
    ctaColoreTesto = '#ffffff',
    ctaColoreSfondo = 'var(--primary-color)',
    ctaColoreSfondoHover = 'var(--primary-color)',
    // Immagine e overlay
    immagineOpacita = 40,
    overlayColore = '#000000',
    overlayOpacita = 20,
    // Altezza blocco
    altezza = 'md', // xs, sm, md, lg, xl, 2xl, custom
    altezzaCustom = null, // in pixels (es. 600)
    // Sfondo sezione - usa tema come default
    backgroundColor = null // fallback to theme background
  } = config;

  const alignClass = allineamento === 'center' ? 'text-center' :
                       allineamento === 'right' ? 'text-right' : 'text-left';

  // Mappa delle altezze predefinite
  const altezze = {
    xs: 'min-h-[300px]',
    sm: 'min-h-[400px]',
    md: 'min-h-[500px]',
    lg: 'min-h-[600px]',
    xl: 'min-h-[700px]',
    '2xl': 'min-h-[800px]',
    custom: '' // Usa minHeight personalizzato
  };

  // Calcola l'altezza del blocco
  const getAltezzaClass = () => {
    if (altezza === 'custom' && altezzaCustom) {
      return '';
    }
    return altezze[altezza] || altezze.md;
  };

  // Stili dinamici
  const titoloStyle = {
    color: titoloColore,
    fontFamily: titoloFont,
  };

  const sottotitoloStyle = {
    color: sottotitoloColore,
    fontFamily: sottotitoloFont,
  };

  const ctaStyle = {
    backgroundColor: ctaColoreSfondo,
    color: ctaColoreTesto,
    transition: 'all 0.3s ease',
  };

  const ctaHoverStyle = {
    backgroundColor: ctaColoreSfondoHover,
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  };

  const immagineStyle = {
    opacity: immagineOpacita / 100,
    objectFit: 'cover',
    objectPosition: 'center center',
  };

  const overlayStyle = {
    backgroundColor: `${overlayColore}${Math.round((overlayOpacita / 100) * 255).toString(16).padStart(2, '0')}`,
  };

  const backgroundStyle = {
    backgroundColor: immagine_url ? 'transparent' : (backgroundColor || 'var(--block-background-color)'),
  };

  const containerStyle = {
    ...backgroundStyle,
    ...(altezza === 'custom' && altezzaCustom ? { minHeight: `${altezzaCustom}px` } : {})
  };

  const altezzaClass = getAltezzaClass();

  return (
    <div className={`relative px-4 overflow-hidden flex items-center ${altezzaClass} py-24`} style={containerStyle}>
      {/* Immagine di sfondo con overlay */}
      {immagine_url && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={immagine_url}
            alt="Background Hero"
            className="w-full h-full object-cover object-center"
            style={immagineStyle}
          />
          <div
            className="absolute inset-0"
            style={overlayStyle}
          />
        </div>
      )}

      {/* Contenuti testuali */}
      <div className={`relative z-10 container mx-auto ${alignClass}`}>
        <h1
          className={`${titoloFontSize} ${titoloFontWeight} mb-4 drop-shadow-lg`}
          style={titoloStyle}
        >
          {titolo || "Titolo Hero"}
        </h1>

        {sottotitolo && (
          <p
            className={`${sottotitoloFontSize} ${sottotitoloFontWeight} max-w-2xl mx-auto drop-shadow-md mb-8`}
            style={sottotitoloStyle}
          >
            {sottotitolo}
          </p>
        )}

        {cta_text && (
          <div className="group relative inline-block">
            <a
              href={ctaLink || '#'}
              target={ctaLink && ctaLink.startsWith('http') ? '_blank' : '_self'}
              rel={ctaLink && ctaLink.startsWith('http') ? 'noopener noreferrer' : ''}
              className="mt-8 px-8 py-3 font-bold rounded-full shadow-lg inline-block cursor-pointer"
              style={ctaStyle}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, ctaHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, {
                  backgroundColor: ctaColoreSfondo,
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                });
              }}
            >
              {cta_text}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}