"use client";
/**
 * Nome File: FlipCardGalleryBlock.js
 * Percorso: components/blocks/FlipCardGalleryBlock.js
 * Descrizione: Galleria con card a due facce (immagine + testo) e transizioni animate
 */
import React, { useState } from 'react';

export default function FlipCardGalleryBlock({ config }) {
  if (!config) return null;

  const {
    titolo = '',
    sottotitolo = '',
    // Card data - array di oggetti { immagine, titolo, descrizione, link }
    cards = [],
    // Layout
    layout = 'grid', // grid, masonry
    colonne = 3, // 2, 3, 4
    // Stili
    coloreSfondo = '#ffffff',
    coloreTesto = '#1f2937',
    coloreTitolo = '#111827',
    coloreCardSfondo = '#ffffff',
    coloreCardTesto = '#6b7280',
    raggioBordo = 12,
    ombra = true,
    // Animazioni
    effettoFlip = 'rotate', // rotate, slide, fade, zoom
    durataTransizione = 600,
    // Dimensioni
    altezzaCard = 'md', // sm, md, lg
    mostraTitolo = true,
    mostraSottotitolo = true
  } = config;

  const [flippedCards, setFlippedCards] = useState(new Set());

  // Altezze delle card
  const altezzeCard = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80'
  };

  const colonneGrid = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const handleCardClick = (index) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getTransform = (index) => {
    const isFlipped = flippedCards.has(index);

    switch (effettoFlip) {
      case 'rotate':
        return isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      case 'slide':
        return isFlipped ? 'translateY(-100%)' : 'translateY(0)';
      case 'fade':
        return isFlipped ? 'opacity(0)' : 'opacity(1)';
      case 'zoom':
        return isFlipped ? 'scale(0)' : 'scale(1)';
      default:
        return isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  };

  const getBackOpacity = (index) => {
    const isFlipped = flippedCards.has(index);

    switch (effettoFlip) {
      case 'rotate':
        return isFlipped ? 1 : 0;
      case 'slide':
        return isFlipped ? 1 : 0;
      case 'fade':
        return isFlipped ? 1 : 0;
      case 'zoom':
        return isFlipped ? 1 : 0;
      default:
        return isFlipped ? 1 : 0;
    }
  };

  const getFrontOpacity = (index) => {
    const isFlipped = flippedCards.has(index);

    switch (effettoFlip) {
      case 'rotate':
        return isFlipped ? 0 : 1;
      case 'slide':
        return isFlipped ? 0 : 1;
      case 'fade':
        return isFlipped ? 0 : 1;
      case 'zoom':
        return isFlipped ? 0 : 1;
      default:
        return isFlipped ? 0 : 1;
    }
  };

  return (
    <div className="py-12 px-4" style={{ backgroundColor: coloreSfondo }}>
      <div className="container mx-auto">
        {/* Titolo Sezione */}
        {mostraTitolo && titolo && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: coloreTitolo }}>
              {titolo}
            </h2>
            {mostraSottotitolo && sottotitolo && (
              <p className="text-lg" style={{ color: coloreTesto }}>
                {sottotitolo}
              </p>
            )}
          </div>
        )}

        {/* Griglia Card */}
        <div className={`grid gap-6 ${colonneGrid[colonne] || colonneGrid[3]}`}>
          {cards.map((card, index) => (
            <div
              key={index}
              className="flip-card-container cursor-pointer"
              onClick={() => handleCardClick(index)}
              style={{
                perspective: effettoFlip === 'rotate' ? '1000px' : 'none',
                height: '100%'
              }}
            >
              <div
                className="flip-card relative w-full"
                style={{
                  height: '100%',
                  minHeight: '300px',
                  transition: `transform ${durataTransizione}ms, opacity ${durataTransizione}ms`,
                  transformStyle: effettoFlip === 'rotate' ? 'preserve-3d' : 'flat',
                  transform: getTransform(index)
                }}
              >
                {/* Fronte - Immagine */}
                <div
                  className="flip-card-front absolute inset-0 rounded-2xl overflow-hidden"
                  style={{
                    backgroundColor: coloreCardSfondo,
                    borderRadius: `${raggioBordo}px`,
                    boxShadow: ombra ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                    opacity: getFrontOpacity(index),
                    transition: `opacity ${durataTransizione}ms`,
                    backfaceVisibility: effettoFlip === 'rotate' ? 'hidden' : 'visible',
                    transform: effettoFlip === 'rotate' ? 'translateZ(0)' : 'none'
                  }}
                >
                  {card.immagine ? (
                    <img
                      src={card.immagine}
                      alt={card.titolo || `Card ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{ minHeight: '300px' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-6xl">📷</span>
                    </div>
                  )}

                  {/* Overlay con titolo */}
                  {card.titolo && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg">{card.titolo}</h3>
                    </div>
                  )}
                </div>

                {/* Retro - Descrizione */}
                <div
                  className="flip-card-back absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl"
                  style={{
                    backgroundColor: coloreCardSfondo,
                    borderRadius: `${raggioBordo}px`,
                    boxShadow: ombra ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                    opacity: getBackOpacity(index),
                    transition: `opacity ${durataTransizione}ms`,
                    backfaceVisibility: effettoFlip === 'rotate' ? 'hidden' : 'visible',
                    transform: effettoFlip === 'rotate' ? 'rotateY(180deg) translateZ(0)' : 'none'
                  }}
                >
                  {card.titolo && (
                    <h3
                      className="text-xl font-bold mb-4 text-center"
                      style={{ color: coloreTitolo }}
                    >
                      {card.titolo}
                    </h3>
                  )}

                  {card.descrizione && (
                    <p
                      className="text-center mb-6 flex-grow"
                      style={{ color: coloreCardTesto }}
                    >
                      {card.descrizione}
                    </p>
                  )}

                  {card.link && (
                    <a
                      href={card.link}
                      className="px-6 py-2 rounded-full font-medium text-white text-sm"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: 'var(--primary-color, #3b82f6)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      Scopri di più
                    </a>
                  )}

                  {/* Istruzione */}
                  <p className="text-xs text-center mt-4 opacity-50" style={{ color: coloreCardTesto }}>
                    Clicca per tornare all'immagine
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
