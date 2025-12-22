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

  // Definisci le variabili CSS globali per i Client Components
  const themeStyles = {
    '--primary-color': siteConfig?.colors?.primary || '#000000',
    '--secondary-color': siteConfig?.colors?.secondary || '#ffffff',
    '--background-color': siteConfig?.colors?.background || '#ffffff',
    '--block-background-color': siteConfig?.colors?.blockBackground || '#ffffff',
    // Header personalization
    '--header-background-color': siteConfig?.colors?.headerBackground || '#ffffff',
    '--header-text-color': siteConfig?.colors?.headerText || '#333333',
  };

  const logoPosition = siteConfig?.colors?.logoPosition || 'center'; // Fashion default: center

  const menuItems = (navigation || []).map(page => ({
    label: page.titolo_seo || page.slug,
    href: page.slug === 'home' ? '/' : `/${page.slug}`
  }));

  if (!menuItems.find(i => i.href === '/') && menuItems.length > 0) {
      menuItems.unshift({ label: 'Home', href: '/' });
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white selection:bg-pink-100 selection:text-pink-900" style={themeStyles}>
      
      {/* NAVBAR FASHION: Personalizzabile */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 backdrop-blur-md" style={{
        backgroundColor: logoPosition === 'center' ? 'rgba(255,255,255,0.9)' : 'var(--header-background-color)',
        color: 'var(--header-text-color)'
      }}>
        
        {/* Top Bar (Promo) */}
        <div className="bg-black text-white text-[10px] py-1 text-center tracking-widest uppercase">
            Spedizione gratuita per ordini superiori a 100€
        </div>

        <div className="container mx-auto px-6 py-6 flex items-center">

          {/* Layout dinamico basato sulla posizione del logo */}
          {logoPosition === 'center' ? (
            // Logo centrato con menu ai lati
            <>
              <div className="flex items-center flex-1">
                <button
                  className="md:hidden p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                   <span className="text-2xl">☰</span>
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link href="/" className="flex items-center px-6">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 object-contain" />
                  ) : (
                    <span className="text-3xl font-serif tracking-tighter uppercase border-2 border-black px-4 py-1">
                      {name}
                    </span>
                  )}
                </Link>
              </div>

              <div className="flex items-center justify-end flex-1">
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
            </>
          ) : logoPosition === 'right' ? (
            // Logo a destra con menu a sinistra
            <>
              <div className="flex items-center gap-8 flex-1">
                <button
                  className="md:hidden p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                   <span className="text-2xl">☰</span>
                </button>
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

              <div className="flex items-center pl-8">
                <Link href="/" className="flex items-center">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 object-contain" />
                  ) : (
                    <span className="text-3xl font-serif tracking-tighter uppercase border-2 border-black px-4 py-1">
                      {name}
                    </span>
                  )}
                </Link>
              </div>
            </>
          ) : (
            // Logo a sinistra (default)
            <>
              <div className="flex items-center">
                <button
                  className="md:hidden p-2 mr-4"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                   <span className="text-2xl">☰</span>
                </button>
                <Link href="/" className="flex items-center">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 object-contain" />
                  ) : (
                    <span className="text-3xl font-serif tracking-tighter uppercase border-2 border-black px-4 py-1">
                      {name}
                    </span>
                  )}
                </Link>
              </div>

              <div className="flex items-center space-x-8 flex-1 justify-end">
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
            </>
          )}
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
      <footer className="border-t pt-16 pb-8 text-center" style={{
          backgroundColor: 'var(--block-background-color)',
          borderColor: 'var(--primary-color)'
      }}>
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