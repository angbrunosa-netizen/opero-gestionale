"use client";
/**
 * Nome File: DynamicImageGalleryBlock.js
 * Percorso: components/blocks/DynamicImageGalleryBlock.js
 * Descrizione: Galleria immagini con effetti di transizione dinamici (slider, carousel, grid, masonry)
 */
import React, { useState, useEffect } from 'react';

export default function DynamicImageGalleryBlock({ config }) {
  if (!config) return null;

  const {
    titolo = '',
    sottotitolo = '',
    immagini = [], // Array di { src, alt, title, link }
    layout = 'carousel', // carousel, slider, grid, masonry, fullscreen
    effettoTransizione = 'slide', // slide, fade, zoom, blur, pixelate
    direzione = 'horizontal', // horizontal, vertical
    autoplay = true,
    intervallo = 5000,
    mostraNavigatorio = true,
    mostraIndicatori = true,
    infiniteLoop = true,
    // Stili
    coloreSfondo = '#ffffff',
    coloreTesto = '#1f2937',
    coloreTitolo = '#111827',
    raggioBordo = 12,
    ombra = true,
    altezza = 'md', // sm, md, lg, xl, fullscreen
    mostraTitolo = true,
    mostraSottotitolo = true,
    zoomOnHover = true
  } = config;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  // Altezze della galleria
  const altezze = {
    sm: 'h-64',
    md: 'h-96',
    lg: 'h-[500px]',
    xl: 'h-[600px]',
    fullscreen: 'h-screen'
  };

  // Auto-play
  useEffect(() => {
    if (!autoplay || layout !== 'carousel' && layout !== 'slider' && layout !== 'fullscreen') return;

    const timer = setInterval(() => {
      if (!isTransitioning) {
        handleNext();
      }
    }, intervallo);

    return () => clearInterval(timer);
  }, [currentIndex, isTransitioning, autoplay, intervallo, layout]);

  const handleNext = () => {
    if (immagini.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % immagini.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (immagini.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + immagini.length) % immagini.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Funzione per ottenere l'effetto di transizione
  const getTransitionStyle = (index) => {
    const isActive = index === currentIndex;
    const baseStyle = {
      transition: 'all 0.5s ease-in-out'
    };

    switch (effettoTransizione) {
      case 'fade':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 1 : 0
        };
      case 'zoom':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(1.2)',
          zIndex: isActive ? 1 : 0
        };
      case 'blur':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          filter: isActive ? 'blur(0px)' : 'blur(10px)',
          zIndex: isActive ? 1 : 0
        };
      case 'pixelate':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          imageRendering: isActive ? 'auto' : 'pixelated',
          zIndex: isActive ? 1 : 0
        };
      case 'slide':
      default:
        return {
          ...baseStyle,
          transform: direzione === 'horizontal'
            ? `translateX(${(index - currentIndex) * 100}%)`
            : `translateY(${(index - currentIndex) * 100}%)`,
          opacity: 1
        };
    }
  };

  // Se non ci sono immagini
  if (!immagini || immagini.length === 0) {
    return (
      <div className="py-12 px-4" style={{ backgroundColor: coloreSfondo }}>
        <div className="container mx-auto text-center">
          <p style={{ color: coloreTesto }}>Nessuna immagine disponibile</p>
        </div>
      </div>
    );
  }

  // Layout: CAROUSEL / SLIDER / FULLSCREEN
  if (layout === 'carousel' || layout === 'slider' || layout === 'fullscreen') {
    // Calcola l'altezza in base alla configurazione utente
    const getHeightClass = () => {
      if (layout === 'fullscreen') return '100vh';
      return altezze[altezza] || altezze.md;
    };

    return (
      <div className="py-8 px-4" style={{ backgroundColor: coloreSfondo }}>
        <div className="container mx-auto">
          {/* Titolo Sezione */}
          {mostraTitolo && titolo && (
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: coloreTitolo }}>
                {titolo}
              </h2>
              {mostraSottotitolo && sottotitolo && (
                <p className="text-lg" style={{ color: coloreTesto }}>
                  {sottotitolo}
                </p>
              )}
            </div>
          )}

          {/* Slider Container */}
          <div
            className={`relative mx-auto overflow-hidden rounded-2xl ${layout === 'fullscreen' ? '' : altezze[altezza] || altezze.md}`}
            style={{
              height: layout === 'fullscreen' ? getHeightClass() : undefined,
              maxHeight: layout === 'fullscreen' ? '100vh' : undefined,
              borderRadius: `${raggioBordo}px`,
              boxShadow: ombra ? '0 20px 40px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {/* Immagini */}
            {immagini.map((img, index) => (
              <div
                key={index}
                className="absolute inset-0"
                style={getTransitionStyle(index)}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: zoomOnHover ? 'zoom-in' : 'default',
                    transition: 'transform 0.3s ease',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                  onLoad={() => {
                    setImageLoaded(prev => ({ ...prev, [index]: true }));
                  }}
                />

                {/* Overlay con titolo */}
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                    <h3 className="text-white font-bold text-xl md:text-2xl">{img.title}</h3>
                  </div>
                )}
              </div>
            ))}

            {/* Navigatorio - Frecce */}
            {mostraNavigatorio && immagini.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Indicatori */}
            {mostraIndicatori && immagini.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {immagini.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: currentIndex === index ? '24px' : '10px',
                      height: '10px',
                      backgroundColor: currentIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
                      opacity: currentIndex === index ? 1 : 0.7
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Layout: GRID
  if (layout === 'grid') {
    const colonne = config.colonne || 3;

    // Altezza massima per le immagini in grid in base all'impostazione utente
    const gridHeight = {
      sm: '250px',
      md: '350px',
      lg: '450px',
      xl: '550px',
      fullscreen: '400px'
    };

    return (
      <div className="py-12 px-4" style={{ backgroundColor: coloreSfondo }}>
        <div className="container mx-auto">
          {/* Titolo Sezione */}
          {mostraTitolo && titolo && (
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: coloreTitolo }}>
                {titolo}
              </h2>
              {mostraSottotitolo && sottotitolo && (
                <p className="text-lg" style={{ color: coloreTesto }}>
                  {sottotitolo}
                </p>
              )}
            </div>
          )}

          {/* Grid */}
          <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${colonne}`}>
            {immagini.map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
                style={{
                  borderRadius: `${raggioBordo}px`,
                  boxShadow: ombra ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                  height: gridHeight[altezza] || gridHeight.md,
                  maxHeight: gridHeight[altezza] || gridHeight.md
                }}
                onClick={() => {
                  if (img.link) {
                    window.open(img.link, '_blank');
                  }
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: zoomOnHover ? 'scale(1)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {img.title && (
                      <h3 className="text-white font-bold text-lg">{img.title}</h3>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Layout: MASONRY (Grid uniforme con celle identiche)
  if (layout === 'masonry') {
    const colonne = config.colonne || 3;

    // Altezza fissa per tutte le celle Masonry - identiche per tutte le immagini
    const masonryHeight = {
      sm: '280px',
      md: '380px',
      lg: '480px',
      xl: '580px',
      fullscreen: '450px'
    };

    return (
      <div className="py-12 px-4" style={{ backgroundColor: coloreSfondo }}>
        <div className="container mx-auto">
          {/* Titolo Sezione */}
          {mostraTitolo && titolo && (
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: coloreTitolo }}>
                {titolo}
              </h2>
              {mostraSottotitolo && sottotitolo && (
                <p className="text-lg" style={{ color: coloreTesto }}>
                  {sottotitolo}
                </p>
              )}
            </div>
          )}

          {/* Masonry Grid - celle tutte identiche */}
          <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${colonne}`}>
            {immagini.map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
                style={{
                  borderRadius: `${raggioBordo}px`,
                  boxShadow: ombra ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                  height: masonryHeight[altezza] || masonryHeight.md,
                  maxHeight: masonryHeight[altezza] || masonryHeight.md,
                  minHeight: masonryHeight[altezza] || masonryHeight.md
                }}
                onClick={() => {
                  if (img.link) {
                    window.open(img.link, '_blank');
                  }
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: 'block',
                    transform: zoomOnHover ? 'scale(1)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (zoomOnHover) {
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {img.title && (
                      <h3 className="text-white font-bold">{img.title}</h3>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
