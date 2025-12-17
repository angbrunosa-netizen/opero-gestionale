"use client";
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Fashion/Layout.js
 * Descrizione: Layout "Fashion". Elegante, minimale, header centrato, font serif per titoli.
 */
import React, { useState } from 'react';
import Link from 'next/link';

export default function FashionLayout({ children, siteConfig }) {
  const { name, logo, navigation } = siteConfig || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = (navigation || []).map(page => ({
    label: page.titolo_seo || page.slug,
    href: page.slug === 'home' ? '/' : `/${page.slug}`
  }));

  if (!menuItems.find(i => i.href === '/') && menuItems.length > 0) {
      menuItems.unshift({ label: 'Home', href: '/' });
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white selection:bg-pink-100 selection:text-pink-900">
      
      {/* NAVBAR FASHION: Centrata, Minimal, Fondo Bianco o Trasparente */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        
        {/* Top Bar (Promo) */}
        <div className="bg-black text-white text-[10px] py-1 text-center tracking-widest uppercase">
            Spedizione gratuita per ordini superiori a 100€
        </div>

        <div className="container mx-auto px-6 py-6 flex flex-col items-center justify-between md:flex-row">
          
          {/* Mobile Toggle (Left) */}
          <button className="md:hidden absolute left-4 top-8" onClick={() => setIsMenuOpen(!isMenuOpen)}>
             <span className="text-2xl">☰</span>
          </button>

          {/* Logo (Centered) */}
          <Link href="/" className="mb-4 md:mb-0">
            {logo ? (
              <img src={logo} alt={name} className="h-12 object-contain" />
            ) : (
              <span className="text-3xl font-serif tracking-tighter uppercase border-2 border-black px-4 py-1">
                {name}
              </span>
            )}
          </Link>

          {/* Menu Desktop (Right/Distributed) */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className="text-xs font-bold uppercase tracking-widest hover:text-[var(--primary-color)] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <Link href="/login" className="text-xs font-bold uppercase border-b border-black pb-0.5 hover:text-gray-500">
                Login
            </Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 px-6 py-8 h-screen animate-fade-in-down">
                <div className="flex flex-col space-y-6 text-center">
                    {menuItems.map((item, idx) => (
                    <Link key={idx} href={item.href} className="text-xl font-serif italic" onClick={() => setIsMenuOpen(false)}>
                        {item.label}
                    </Link>
                    ))}
                    <Link href="/login" className="text-sm uppercase tracking-widest pt-4 text-gray-500">Area Riservata</Link>
                </div>
            </div>
        )}
      </nav>

      {/* CONTENUTO */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER FASHION: Minimalista */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 text-center">
        <h3 className="font-serif text-2xl mb-6">{name}</h3>
        <div className="flex justify-center space-x-6 mb-8 text-xs uppercase tracking-widest text-gray-500">
            {menuItems.map((item, idx) => (
                <Link key={idx} href={item.href} className="hover:text-black">{item.label}</Link>
            ))}
        </div>
        <div className="text-[10px] text-gray-400">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}