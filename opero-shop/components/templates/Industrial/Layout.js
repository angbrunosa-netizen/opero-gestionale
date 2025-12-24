"use client";
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Industrial/Layout.js
 * Descrizione: Layout "Industrial". Robusto, scuro, font tecnici, enfasi su affidabilità.
 */
import React, { useState } from 'react';
import Link from 'next/link';

export default function IndustrialLayout({ children, siteConfig }) {
  const { name, logo, navigation, contact, description } = siteConfig || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Definisci le variabili CSS globali per i Client Components
  const themeStyles = {
    '--primary-color': siteConfig?.colors?.primary || '#000000',
    '--secondary-color': siteConfig?.colors?.secondary || '#ffffff',
    '--background-color': siteConfig?.colors?.background || '#ffffff',
    '--block-background-color': siteConfig?.colors?.blockBackground || '#ffffff',
    // Header personalization
    '--header-background-color': siteConfig?.colors?.headerBackground || '#1e293b', // Industrial default: dark
    '--header-text-color': siteConfig?.colors?.headerText || '#ffffff',
  };

  const logoPosition = siteConfig?.colors?.logoPosition || 'left'; // Industrial default: left

  const menuItems = (navigation || []).map(page => ({
    label: page.titolo_seo || page.slug,
    href: page.slug === 'home' ? '/' : `/${page.slug}`
  }));
  if (!menuItems.find(i => i.href === '/') && menuItems.length > 0) menuItems.unshift({ label: 'Home', href: '/' });

  return (
    <div className="flex flex-col min-h-screen font-mono text-gray-800 bg-gray-50" style={themeStyles}>
      
      {/* NAVBAR INDUSTRIAL: Personalizzabile */}
      <nav className="sticky top-0 z-50 border-b-4 shadow-lg" style={{
        backgroundColor: 'var(--header-background-color)',
        color: 'var(--header-text-color)',
        borderBottomColor: 'var(--primary-color)'
      }}>
        <div className="container mx-auto px-4 h-20 flex items-center">

          {/* Layout dinamico basato sulla posizione del logo */}
          {logoPosition === 'center' ? (
            // Logo centrato con menu ai lati
            <>
              <div className="flex items-center flex-1">
                <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  ☰
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link href="/" className="flex items-center gap-3 px-4">
                  {logo ? (
                    <img src={logo} alt={name} className="h-10 bg-white p-1 rounded-sm" />
                  ) : (
                    <div className="bg-[var(--primary-color)] text-slate-900 font-black px-3 py-1 text-xl uppercase tracking-tighter">
                      {name.substring(0, 3).toUpperCase()}
                      <span className="text-white bg-slate-800 px-1 ml-1">{name.substring(3)}</span>
                    </div>
                  )}
                </Link>
              </div>

              <div className="flex items-center justify-end flex-1 gap-4">
                <div className="hidden md:flex items-center space-x-1">
                  {menuItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="px-4 py-2 hover:bg-slate-800 text-sm font-bold uppercase tracking-wide transition-colors border-r border-slate-800 last:border-r-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link href="/login" className="hidden md:block bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-bold uppercase rounded-sm border border-slate-500">
                  Portale B2B
                </Link>
              </div>
            </>
          ) : logoPosition === 'right' ? (
            // Logo a destra con menu a sinistra
            <>
              <div className="flex items-center gap-4 flex-1">
                <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  ☰
                </button>
                <div className="hidden md:flex items-center space-x-1">
                  {menuItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="px-4 py-2 hover:bg-slate-800 text-sm font-bold uppercase tracking-wide transition-colors border-r border-slate-800 last:border-r-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link href="/login" className="hidden md:block bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-bold uppercase rounded-sm border border-slate-500">
                  Portale B2B
                </Link>
              </div>

              <div className="flex items-center pl-6">
                <Link href="/" className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt={name} className="h-10 bg-white p-1 rounded-sm" />
                  ) : (
                    <div className="bg-[var(--primary-color)] text-slate-900 font-black px-3 py-1 text-xl uppercase tracking-tighter">
                      {name.substring(0, 3).toUpperCase()}
                      <span className="text-white bg-slate-800 px-1 ml-1">{name.substring(3)}</span>
                    </div>
                  )}
                </Link>
              </div>
            </>
          ) : (
            // Logo a sinistra (default)
            <>
              <div className="flex items-center">
                <button className="md:hidden text-white p-2 mr-4" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  ☰
                </button>
                <Link href="/" className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt={name} className="h-10 bg-white p-1 rounded-sm" />
                  ) : (
                    <div className="bg-[var(--primary-color)] text-slate-900 font-black px-3 py-1 text-xl uppercase tracking-tighter">
                      {name.substring(0, 3).toUpperCase()}
                      <span className="text-white bg-slate-800 px-1 ml-1">{name.substring(3)}</span>
                    </div>
                  )}
                </Link>
              </div>

              <div className="flex items-center space-x-1 flex-1 justify-end gap-4">
                <div className="hidden md:flex items-center space-x-1">
                  {menuItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      className="px-4 py-2 hover:bg-slate-800 text-sm font-bold uppercase tracking-wide transition-colors border-r border-slate-800 last:border-r-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link href="/login" className="hidden md:block bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-bold uppercase rounded-sm border border-slate-500">
                  Portale B2B
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-slate-800 p-4 border-t border-slate-700">
                {menuItems.map((item, idx) => (
                <Link key={idx} href={item.href} className="block py-3 text-sm font-bold uppercase border-b border-slate-700" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                </Link>
                ))}
            </div>
        )}
      </nav>

      {/* CONTENUTO */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER INDUSTRIAL - Dinamico con dati dalla tabella ditte */}
      <footer className="text-slate-400 pt-12 pb-6 border-t-8" style={{
          backgroundColor: 'var(--secondary-color)',
          borderColor: 'var(--primary-color)'
      }}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
                <h4 className="text-white font-bold uppercase mb-4">Azienda</h4>
                <p>{name}</p>
                {description && (
                    <p className="mt-2 text-xs text-slate-500">{description}</p>
                )}

                {/* Indirizzo dinamico */}
                {contact?.indirizzo && (
                    <p className="mt-2">
                        📍 {contact.indirizzo}
                        {contact.cap && `, ${contact.cap}`}
                        {contact.citta && ` ${contact.citta}`}
                        {contact.provincia && ` (${contact.provincia})`}
                    </p>
                )}
            </div>
            <div>
                <h4 className="text-white font-bold uppercase mb-4">Navigazione</h4>
                <ul className="space-y-2">
                    {menuItems.map((item, idx) => (
                        <li key={idx}><Link href={item.href} className="hover:text-[var(--primary-color)]">→ {item.label}</Link></li>
                    ))}
                </ul>
            </div>
            <div>
                 <h4 className="text-white font-bold uppercase mb-4">Contatti</h4>
                 <div className="space-y-2">
                    {contact?.mail1 && (
                        <p className="font-mono bg-slate-800 p-2 inline-block rounded">
                            <a href={`mailto:${contact.mail1}`} className="hover:text-[var(--primary-color)]">
                                ✉️ {contact.mail1}
                            </a>
                        </p>
                    )}
                    {contact?.tel1 && (
                        <p className="font-mono bg-slate-800 p-2 inline-block rounded">
                            <a href={`tel:${contact.tel1}`} className="hover:text-[var(--primary-color)]">
                                📞 {contact.tel1}
                            </a>
                        </p>
                    )}
                    {contact?.pec && (
                        <p className="font-mono bg-slate-800 p-2 inline-block rounded text-xs">
                            <a href={`mailto:${contact.pec}`} className="hover:text-[var(--primary-color)]">
                                📧 PEC: {contact.pec}
                            </a>
                        </p>
                    )}
                 </div>
            </div>
        </div>
      </footer>
    </div>
  );
}