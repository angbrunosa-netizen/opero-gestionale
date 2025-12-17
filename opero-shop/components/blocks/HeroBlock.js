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
    <div className="relative bg-gray-100 py-24 px-4 overflow-hidden">
      {immagine_url && (
        <div className="absolute inset-0 z-0">
          <img src={immagine_url} alt="Background" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}
      <div className={`relative z-10 container mx-auto ${alignClass}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--primary-color)] mb-4 drop-shadow-md">
          {titolo || "Titolo Hero"}
        </h1>
        {sottotitolo && <p className="text-xl text-gray-800 font-medium max-w-2xl mx-auto drop-shadow-sm">{sottotitolo}</p>}
        {cta_text && (
            <button className="mt-8 px-8 py-3 bg-[var(--primary-color)] text-white font-bold rounded-full hover:opacity-90 transition shadow-lg">
                {cta_text}
            </button>
        )}
      </div>
    </div>
  );
}