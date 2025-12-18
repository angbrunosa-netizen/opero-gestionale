"use client"
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Standard/Layout.js
 * Descrizione: Layout Standard con MENU DINAMICO.
 */
import React, { useState } from 'react';
import Link from 'next/link';

export default function StandardLayout({ children, siteConfig }) {
  const { name, logo, navigation } = siteConfig || {};
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtra le pagine per il menu (esclude home se vuoi, o la rinomina)
  // Qui assumiamo che lo slug 'home' diventi il link '/'
  const menuItems = (navigation || []).map(page => ({
    label: page.titolo_seo || page.slug, // Usa titolo SEO o slug come etichetta
    href: page.slug === 'home' ? '/' : `/${page.slug}`
  }));

  // Assicuriamoci che ci sia sempre la Home se non è nel DB (fallback)
  const hasHome = menuItems.find(i => i.href === '/');
  if (!hasHome && menuItems.length > 0) {
      menuItems.unshift({ label: 'Home', href: '/' });
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {logo ? (
              <img src={logo} alt={name} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : (
              <span className="text-2xl font-bold text-gray-900 tracking-tight">{name}</span>
            )}
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className="text-sm font-medium text-gray-600 hover:text-[var(--primary-color)] transition-colors uppercase tracking-wider"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
             {/* Esempio pulsante fisso (opzionale, si può togliere o rendere dinamico) */}
             <Link 
                href="/login" // Link al login per accedere al gestionale
                className="hidden md:block px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Area Riservata
              </Link>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-3 shadow-lg absolute w-full left-0">
                {menuItems.map((item, idx) => (
                  <Link 
                    key={idx} 
                    href={item.href} 
                    className="block text-base font-medium text-gray-700 hover:text-[var(--primary-color)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100">
                    <Link href="/login" className="block text-center w-full py-2 bg-gray-100 rounded-md text-gray-700 font-bold">
                        Accedi
                    </Link>
                </div>
            </div>
        )}
      </nav>

      {/* CONTENUTO */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
                <h3 className="font-bold text-xl mb-6 text-white">{name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                  Siamo impegnati a fornire le migliori soluzioni per i nostri clienti. 
                  Contattaci per scoprire come possiamo aiutarti a crescere.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-lg mb-6 text-gray-200">Esplora</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    {menuItems.map((item, idx) => (
                        <li key={idx}>
                            <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-lg mb-6 text-gray-200">Contatti</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                   <li className="flex items-center gap-2">
                       <span className="opacity-70">Email:</span> info@{name.replace(/\s+/g, '').toLowerCase()}.it
                   </li>
                   <li className="flex items-center gap-2">
                       <span className="opacity-70">Tel:</span> +39 012 345 6789
                   </li>
                </ul>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 border-t border-gray-800 pt-8">
            &copy; {new Date().getFullYear()} {name}. Powered by Opero CMS.
          </div>
        </div>
      </footer>

    </div>
  );
}