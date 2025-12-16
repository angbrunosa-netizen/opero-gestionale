/**
 * Nome File: HeroBlock.js
 * Percorso: components/blocks/HeroBlock.js
 */
import React from 'react';

export default function HeroBlock({ config }) {
  const { titolo, sottotitolo, immagine_url, allineamento, cta_text } = config || {};
  const alignClass = allineamento === 'center' ? 'text-center' : 
                     allineamento === 'right' ? 'text-right' : 'text-left';

  return (
    <div className="relative bg-gray-100 py-20 px-4 overflow-hidden">
      {immagine_url && (
        <div className="absolute inset-0 z-0">
          <img src={immagine_url} alt="Hero" className="w-full h-full object-cover opacity-30" />
        </div>
      )}
      <div className={`relative z-10 container mx-auto ${alignClass}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--primary-color)] mb-4">
          {titolo || "Titolo Hero"}
        </h1>
        {sottotitolo && <p className="text-xl text-gray-700 max-w-2xl mx-auto">{sottotitolo}</p>}
        {cta_text && (
            <button className="mt-8 px-8 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90">
                {cta_text}
            </button>
        )}
      </div>
    </div>
  );
}