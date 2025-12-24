"use client"
/**
 * Nome File: Layout.js
 * Percorso: components/templates/Standard/Layout.js
 * Descrizione: Layout Standard con MENU DINAMICO e FALLBACK.
 */
import React, { useState } from 'react';
import Link from 'next/link';

export default function StandardLayout({ children, siteConfig }) {
  const { name, logo, navigation, contact, description } = siteConfig || {};
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  // Rimuovi debug logging dopo aver verificato il funzionamento

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

  // Funzione per toggle espansione menu mobile
  const toggleMenuExpansion = (menuId) => {
      setExpandedMenus(prev => {
          const newSet = new Set(prev);
          if (newSet.has(menuId)) {
              newSet.delete(menuId);
          } else {
              newSet.add(menuId);
          }
          return newSet;
      });
  };

  // Componente MobileMenuItem ricorsivo per menu hamburger
  const MobileMenuItem = ({ item, level = 0 }) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedMenus.has(item.href);
      const paddingLeft = level * 16 + 16; // 16px base + 16px per livello

      if (hasChildren) {
          return (
              <div className="w-full">
                  <button
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
                      style={{
                          color: 'inherit',
                          paddingLeft: `${paddingLeft}px`,
                          backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                          e.target.style.backgroundColor = `${siteConfig?.colors?.headerText || '#333333'}10`;
                      }}
                      onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => toggleMenuExpansion(item.href)}
                  >
                      <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                              {item.icon && <span className="text-lg">{item.icon}</span>}
                              <span>{item.label}</span>
                          </div>
                          <svg
                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                          >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                      </div>
                  </button>

                  {/* Sottomenu espanso */}
                  <div
                      className={`overflow-hidden transition-all duration-300 ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                      <div className="py-2 space-y-1">
                          {item.children.map((child, idx) => (
                              <MobileMenuItem
                                  key={`${item.href}-${idx}`}
                                  item={child}
                                  level={level + 1}
                              />
                          ))}
                      </div>
                  </div>
              </div>
          );
      }

      // Menu item senza figli (link)
      const LinkComponent = item.isExternal ? 'a' : Link;
      const linkProps = item.isExternal
          ? { href: item.externalHref, target: item.externalTarget, rel: 'noopener noreferrer' }
          : { href: item.href };

      return (
          <LinkComponent
              {...linkProps}
              className="block py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                  color: 'inherit',
                  paddingLeft: `${paddingLeft}px`,
                  backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${siteConfig?.colors?.headerText || '#333333'}10`;
              }}
              onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
              }}
              onClick={() => setIsMobileMenuOpen(false)}
          >
              <div className="flex items-center gap-3">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {item.isExternal && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                  )}
              </div>
          </LinkComponent>
      );
  };

  // Componente per renderizzare menu item con sotto-menu
  const MenuItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      // Per dropdown annidati (livelli > 1), usa un approccio diverso
      const isNested = level > 0;

      return (
        <div className={`relative group`}>
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

            {/* Freccia per dropdown - wrapper con group per hover cascade */}
            <div className="group relative">
              <button
                className="p-1 text-sm hover:text-[var(--primary-color)] transition-colors"
                style={{ color: 'inherit' }}
                aria-label={`Espandi menu per ${item.label}`}
              >
                <svg
                  className={`w-3 h-3 transition-transform ${
                    isNested ? 'group-hover:rotate-90' : 'group-hover:rotate-180'
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
                absolute rounded-lg shadow-xl
                transition-all duration-300 z-50
                ${isNested
                  ? 'top-0 left-full ml-1 w-56' // Livelli > 1: a destra
                  : 'top-full left-0 mt-1 w-64' // Livello 1: sotto
                }
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
              `}
              style={{
                backgroundColor: siteConfig?.colors?.headerBackground || '#ffffff',
                borderColor: siteConfig?.colors?.headerText || '#333333',
                border: '1px solid'
              }}>
                <div className="py-1">
                  {item.children.map((child, idx) => (
                    <div key={idx} className="border-b last:border-b-0"
                         style={{ borderColor: `${siteConfig?.colors?.headerText || '#333333'}20` }}>
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

              <div className="hidden md:flex items-center justify-end flex-1 gap-8">
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
              <div className="hidden md:flex items-center gap-8 flex-1">
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

              <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
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

          {/* Mobile Hamburger Menu - sempre visibile su mobile */}
          <button
            className="md:hidden p-2 relative z-50 transition-all duration-300"
            style={{ color: 'inherit' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            <div className="w-6 h-5 relative flex flex-col justify-center">
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out origin-center ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
              }`}></span>
              <span className={`h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out origin-center ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown - Hamburger Style */}
        <div className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>

            {/* Menu Panel */}
            <div className={`absolute top-0 right-0 h-full w-80 max-w-full transition-transform duration-300 ease-in-out transform ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
                backgroundColor: siteConfig?.colors?.headerBackground || '#ffffff'
            }}>
                {/* Header del Menu Mobile */}
                <div className="flex items-center justify-between p-4 border-b"
                     style={{ borderColor: `${siteConfig?.colors?.headerText || '#333333'}20` }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'inherit' }}>
                        Menu
                    </h2>
                    <button
                        className="p-2 rounded-lg transition-colors duration-200"
                        style={{ color: 'inherit' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Chiudi menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Menu Items con supporto sottomenu */}
                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
                    {menuItems.map((item, idx) => (
                        <MobileMenuItem
                            key={`${item.href}-${idx}`}
                            item={item}
                            level={0}
                        />
                    ))}

                    {/* Pulsante Area Riservata */}
                    <div className="pt-4 mt-4 border-t"
                         style={{ borderColor: `${siteConfig?.colors?.headerText || '#333333'}20` }}>
                        <Link
                            href="/login"
                            className="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            Area Riservata
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER - Dinamico con dati dalla tabella ditte */}
      <footer className="text-white pt-16 pb-8" style={{ backgroundColor: 'var(--secondary-color)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">{name || 'Nome Azienda'}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {description || 'Siamo impegnati a fornire le migliori soluzioni per i nostri clienti. Contattaci per scoprire come possiamo aiutarti a crescere.'}
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
                {contact?.mail1 && (
                  <li className="flex items-center gap-2">
                    <span className="opacity-70">Email:</span>
                    <a href={`mailto:${contact.mail1}`} className="hover:text-white transition-colors">
                      {contact.mail1}
                    </a>
                  </li>
                )}
                {contact?.tel1 && (
                  <li className="flex items-center gap-2">
                    <span className="opacity-70">Tel:</span>
                    <a href={`tel:${contact.tel1}`} className="hover:text-white transition-colors">
                      {contact.tel1}
                    </a>
                  </li>
                )}
                {contact?.pec && (
                  <li className="flex items-center gap-2">
                    <span className="opacity-70">PEC:</span>
                    <a href={`mailto:${contact.pec}`} className="hover:text-white transition-colors">
                      {contact.pec}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Indirizzo dinamico */}
          {contact?.indirizzo && (
            <div className="mb-8 text-sm text-gray-400 text-center">
              <p>
                📍 {contact.indirizzo}
                {contact.cap && `, ${contact.cap}`}
                {contact.citta && ` ${contact.citta}`}
                {contact.provincia && ` (${contact.provincia})`}
              </p>
            </div>
          )}

          <div className="text-center text-xs text-gray-600 border-t border-gray-800 pt-8">
            © {new Date().getFullYear()} {name || 'Nome Azienda'}. Powered by OperoCloud CMS.
          </div>
        </div>
      </footer>
    </div>
  );
}