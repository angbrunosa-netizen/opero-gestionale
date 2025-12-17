"use client";
/**
 * Nome File: MediaSocialBlock.js
 * Percorso: components/blocks/MediaSocialBlock.js
 * Data: 17/12/2025
 * Descrizione: Galleria avanzata con Lightbox, Masonry Grid, Hover Effects e Social.
 */
import React, { useState } from 'react';

// --- ICONE SVG ---
const Icons = {
  Instagram: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
  Facebook: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

// --- COMPONENTE LIGHTBOX ---
const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
    if (currentIndex === null) return null;
    const currentImg = images[currentIndex];

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition z-50">
                <Icons.Close />
            </button>
            
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 p-3 hover:bg-white/10 rounded-full transition hidden md:block">
                <Icons.ArrowLeft />
            </button>

            <div className="max-w-[90vw] max-h-[90vh] relative">
                <img 
                    src={currentImg.src} 
                    alt={currentImg.caption || "Full"} 
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
                />
                {currentImg.caption && (
                    <div className="text-white text-center mt-4 text-lg font-light tracking-wide">
                        {currentImg.caption}
                    </div>
                )}
                <div className="text-gray-400 text-center text-sm mt-2">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 p-3 hover:bg-white/10 rounded-full transition hidden md:block">
                <Icons.ArrowRight />
            </button>
        </div>
    );
};

export default function MediaSocialBlock({ config }) {
    if (!config) return null;
    const { titolo, layout, facebook, instagram, images } = config;
    const [lightboxIndex, setLightboxIndex] = useState(null);
    
    let imageList = [];
    try {
        imageList = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images || '[]') : []);
    } catch { imageList = []; }

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => setLightboxIndex((prev) => (prev + 1) % imageList.length);
    const prevImage = () => setLightboxIndex((prev) => (prev - 1 + imageList.length) % imageList.length);

    if (!imageList.length && !facebook && !instagram) return null;

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                
                {/* Intestazione */}
                <div className="text-center mb-12">
                    {titolo && <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-6">{titolo}</h2>}
                    
                    {(instagram || facebook) && (
                        <div className="flex justify-center gap-6">
                            {instagram && (
                                <a href={instagram} target="_blank" rel="noopener" className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-white hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                                    <Icons.Instagram />
                                </a>
                            )}
                            {facebook && (
                                <a href={facebook} target="_blank" rel="noopener" className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-white hover:bg-[#1877F2] transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                                    <Icons.Facebook />
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Griglia / Carosello */}
                {imageList.length > 0 && (
                    <div className={layout === 'carousel' 
                        ? 'flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide px-4' 
                        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}>
                        
                        {imageList.map((img, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => openLightbox(idx)}
                                className={`group relative overflow-hidden rounded-xl cursor-pointer bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300
                                    ${layout === 'carousel' ? 'min-w-[300px] h-80 snap-center shrink-0' : 'aspect-[4/3]'}`}
                            >
                                <img 
                                    src={img.src} 
                                    alt={img.caption || ""} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                                    </div>
                                </div>
                                {img.caption && (
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-sm font-medium truncate text-center">{img.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Lightbox 
                images={imageList} 
                currentIndex={lightboxIndex} 
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </section>
    );
}