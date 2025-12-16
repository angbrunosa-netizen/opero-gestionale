/**
 * Nome File: Layout.js
 * Percorso: components/templates/Standard/Layout.js
 * Data: 15/12/2025
 */
import React from 'react';
import Link from 'next/link';

export default function StandardLayout({ children, siteConfig }) {
  const { name, logo, colors } = siteConfig || {};
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {logo ? <img src={logo} alt={name} className="h-10" /> : <span className="text-xl font-bold">{name}</span>}
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-[var(--primary-color)]">Home</Link>
            <Link href="/chi-siamo" className="hover:text-[var(--primary-color)]">Chi Siamo</Link>
            <Link href="/catalogo" className="hover:text-[var(--primary-color)]">Catalogo</Link>
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {name}. Powered by Opero.
      </footer>
    </div>
  );
}