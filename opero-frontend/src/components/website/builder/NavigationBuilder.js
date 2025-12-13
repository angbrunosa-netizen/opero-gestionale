/**
 * Navigation Builder Component
 * Genera automaticamente menu di navigazione per siti multi-pagina
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavigationBuilder = ({ pages, currentPage, globalStyles, onNavigate }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!pages || pages.length === 0) {
    return null;
  }

  const navigationStyle = {
    backgroundColor: globalStyles?.primary_color || '#3b82f6',
    fontFamily: globalStyles?.heading_font || 'Inter, sans-serif',
    boxShadow: globalStyles?.box_shadow || '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    transition: 'all 0.3s ease'
  };

  const menuItemStyle = (isActive, isHovered) => ({
    color: globalStyles?.button_text_color || '#ffffff',
    padding: '12px 20px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    backgroundColor: isActive
      ? (globalStyles?.accent_color || '#ef4444')
      : isHovered
        ? 'rgba(255, 255, 255, 0.1)'
        : 'transparent',
    borderRadius: '4px',
    marginLeft: '8px',
    marginRight: '8px',
    border: isActive ? `2px solid ${globalStyles?.accent_color || '#ef4444'}` : 'none',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
  });

  const logoStyle = {
    color: globalStyles?.button_text_color || '#ffffff',
    fontSize: '20px',
    fontWeight: 'bold',
    textDecoration: 'none',
    marginRight: '40px'
  };

  return (
    <nav style={navigationStyle}>
      <div className="container mx-auto px-4">
        <div
          className="flex items-center justify-between h-16"
          style={{ maxWidth: globalStyles?.container_max_width || '1200px', margin: '0 auto' }}
        >
          {/* Logo o Nome Sito */}
          <Link
            to="/"
            style={logoStyle}
            onClick={() => onNavigate && onNavigate(0)}
          >
            {pages[0]?.titolo?.split(' ')[0] || 'Website'}
          </Link>

          {/* Menu Items */}
          <div className="flex items-center space-x-4">
            {pages.map((page, index) => (
              <Link
                key={page.id || index}
                to={`/${page.slug}`}
                style={menuItemStyle(
                  currentPage === index,
                  hoveredItem === index
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) {
                    onNavigate(index);
                  }
                }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {page.titolo || `Pagina ${index + 1}`}
              </Link>
            ))}

            {/* Call to Action Button */}
            <button
              style={{
                backgroundColor: globalStyles?.accent_color || '#ef4444',
                color: globalStyles?.button_text_color || '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              Contatti
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <button
          style={{
            color: globalStyles?.button_text_color || '#ffffff',
            padding: '8px'
          }}
          onClick={() => {
            // Implement mobile menu toggle
            console.log('Mobile menu toggle');
          }}
        >
          <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default NavigationBuilder;