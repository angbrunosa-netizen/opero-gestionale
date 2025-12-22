"use client"
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Standard/Layout.js
 * Descrizione: Layout Standard con MENU DINAMICO e FALLBACK.
 */
import React, { useState } from 'react';
import Link from 'next/link';

export default function StandardLayout({ children, siteConfig }) {
  const { name, logo, navigation } = siteConfig || {};
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DEBUG FORZATO - Rimuovi dopo aver testato
  console.log('🎨🎨🎨 StandardLayout CALLED - siteConfig.colors:', siteConfig?.colors);
  console.log('🎨🎨🎨 Header Background:', siteConfig?.colors?.headerBackground);
  console.log('🎨🎨🎨 Header Text:', siteConfig?.colors?.headerText);
  console.log('🎨🎨🎨 Logo Position:', siteConfig?.colors?.logoPosition);

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

  const logoPosition = siteConfig?.colors?.logoPosition || 'left';

  // Fallback menu se navigation non è disponibile o vuoto
  const defaultMenuItems = [
    { label: 'Home', href: '/' },
    { label: 'Chi DSiamo', href: '/chi-siamo' }
  ];

  // Funzione per costruire menu gerarchico
  const buildHierarchicalMenu = (pages) => {
    if (!pages || pages.length === 0) return defaultMenuItems;

    // Prima, converti le pagine in una struttura più gestibile
    const pageMap = {};
    const rootPages = [];

    // Crea una mappa delle pagine
    pages.forEach(page => {
      pageMap[page.id] = {
        ...page,
        children: []
      };
    });

    // Organizza le pagine in gerarchia
    pages.forEach(page => {
      const pageObj = pageMap[page.id];
      if (page.id_page_parent && pageMap[page.id_page_parent]) {
        pageMap[page.id_page_parent].children.push(pageObj);
      } else {
        rootPages.push(pageObj);
      }
    });

    // Funzione ricorsiva per convertire in formato menu
    const convertToMenuItems = (pages, level = 0) => {
      return pages.map(page => ({
        label: page.titolo_seo || page.slug,
        href: page.slug === 'home' ? '/' : `/${page.slug}`,
        level: level,
        icon: page.icona_menu,
        isExternal: !!page.link_esterno,
        externalHref: page.link_esterno,
        externalTarget: page.target_link || '_self',
        children: page.children && page.children.length > 0
          ? convertToMenuItems(page.children, level + 1)
          : []
      }));
    };

    return convertToMenuItems(rootPages);
  };

  const menuItems = buildHierarchicalMenu(navigation);

  // Assicuriamoci che ci sia sempre la Home se non è nel DB (fallback)
  const hasHome = menuItems.find(i => i.href === '/');
  if (!hasHome) {
      menuItems.unshift({ label: 'Home', href: '/' });
  }

  // Componente per renderizzare menu item con sotto-menu
  const MenuItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      // Per dropdown annidati (livelli > 1), usa un approccio diverso
      const isNested = level > 0;

      return (
        <div className={`relative ${!isNested ? 'group' : ''}`}>
          <div className="flex items-center gap-1">
            {/* Link della pagina parent - sempre cliccabile */}
            <Link
              href={item.href}
              className={`text-sm hover:text-[var(--primary-color)] transition-colors ${
                level === 0 ? 'font-medium uppercase tracking-wider' : 'font-normal'
              }`}
              style={{ color: 'inherit' }}
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Link>

            {/* Freccia per dropdown */}
            <div className={`${!isNested ? 'group' : 'group'} relative`}>
              <button
                className="p-1 text-sm hover:text-[var(--primary-color)] transition-colors"
                style={{ color: 'inherit' }}
                aria-label={`Espandi menu per ${item.label}`}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${
                    !isNested ? 'group-hover:rotate-180' : 'group-hover:rotate-90'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sotto-menu dropdown */}
              <div className={`
                absolute bg-white border border-gray-200 rounded-lg shadow-xl
                transition-all duration-300 z-50
                ${isNested
                  ? 'top-0 left-full ml-1 w-56' // Livelli > 1: a destra
                  : 'top-full left-0 mt-1 w-64' // Livello 1: sotto
                }
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
              `}>
                <div className="py-1">
                  {item.children.map((child, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-b-0">
                      {/* Ricorsione: usa MenuItem per il child */}
                      <MenuItem item={child} level={level + 1} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Menu item semplice
      const isSubmenu = level > 0;
      const textStyle = level === 0
        ? "text-sm font-medium hover:text-[var(--primary-color)] transition-colors uppercase tracking-wider flex items-center gap-1"
        : `text-sm hover:text-[var(--primary-color)] transition-colors py-2 px-4 block w-full text-left ${
            level === 1 ? 'font-normal' : 'font-light text-xs'
          } ${level > 0 ? 'pl-8' : ''}`;

      if (item.isExternal && item.externalHref) {
        return (
          <a
            href={item.externalHref}
            target={item.externalTarget}
            rel="noopener noreferrer"
            className={textStyle}
            style={{ color: 'inherit' }}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {isSubmenu && <span className="text-xs text-gray-400 ml-2">↗</span>}
          </a>
        );
      } else {
        return (
          <Link
            href={item.href}
            className={textStyle}
            style={{ color: 'inherit' }}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
            {level === 2 && <span className="text-xs text-gray-400 ml-2">›</span>}
            {level === 3 && <span className="text-xs text-gray-400 ml-2">•</span>}
          </Link>
        );
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800" style={themeStyles}>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 shadow-sm border-b border-gray-200" style={{
        backgroundColor: siteConfig?.colors?.headerBackground || '#ffffff',
        color: siteConfig?.colors?.headerText || '#333333'
      }}>
        <div className="container mx-auto px-4 h-20 flex items-center">

          {/* Layout dinamico basato sulla posizione del logo */}
          {logoPosition === 'center' ? (
            // Logo centrato con menu ai lati
            <>
              <div className="flex items-center flex-1">
                {/* Spazio vuoto a sinistra per bilanciare */}
              </div>

              <div className="flex items-center justify-center">
                <Link href="/" className="flex items-center gap-3 group px-4">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{name}</span>
                  )}
                </Link>
              </div>

              <div className="flex items-center justify-end flex-1 gap-8">
                {menuItems.map((item, idx) => (
                  <MenuItem key={idx} item={item} />
                ))}
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Area Riservata
                </Link>
              </div>
            </>
          ) : logoPosition === 'right' ? (
            // Logo a destra con menu a sinistra
            <>
              <div className="flex items-center gap-8 flex-1">
                {menuItems.map((item, idx) => (
                  <MenuItem key={idx} item={item} />
                ))}
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Area Riservata
                </Link>
              </div>

              <div className="flex items-center pl-8">
                <Link href="/" className="flex items-center gap-3 group">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{name}</span>
                  )}
                </Link>
              </div>
            </>
          ) : (
            // Logo a sinistra (default)
            <>
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-3 group">
                  {logo ? (
                    <img src={logo} alt={name} className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">{name}</span>
                  )}
                </Link>
              </div>

              <div className="flex items-center gap-8 flex-1 justify-end">
                {menuItems.map((item, idx) => (
                  <MenuItem key={idx} item={item} />
                ))}
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Area Riservata
                </Link>
              </div>
            </>
          )}

          {/* Mobile Toggle - sempre visibile su mobile */}
          <button
            className="md:hidden p-2"
            style={{ color: 'inherit' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 px-4 space-y-3 shadow-lg absolute w-full left-0" style={{
                backgroundColor: 'var(--header-background-color)',
                borderColor: 'var(--header-text-color)'
            }}>
                {menuItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className="block hover:text-[var(--primary-color)] transition-colors font-medium"
                        style={{ color: 'inherit' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER - In futuro rendilo dinamico dal CMS se vuoi */}
      <footer className="text-white pt-16 pb-8" style={{ backgroundColor: 'var(--secondary-color)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">{name || 'Nome Azienda'}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Siamo impegnati a fornire le migliori soluzioni per i nostri clienti. Contattaci per scoprire come possiamo aiutarti a crescere.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-200">Esplora</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {menuItems.slice(1).map((item, idx) => (
                  <li key={idx}>
                    <Link href={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-gray-200">Contatti</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="opacity-70">Email:</span> info@miaazienda.it
                </li>
                <li className="flex items-center gap-2">
                  <span className="opacity-70">Tel:</span> +39 012 345 6789
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 border-t border-gray-800 pt-8">
            © {new Date().getFullYear()} {name || 'Nome Azienda'}. Powered by OperoCloud CMS.
          </div>
        </div>
      </footer>
    </div>
  );
}