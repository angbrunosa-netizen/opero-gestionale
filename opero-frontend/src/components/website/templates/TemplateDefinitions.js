/**
 * Template Definitions System
 * Definisce la struttura e le sezioni configurabili per ogni template
 */

export const templateDefinitions = {
  1: {
    id: 1,
    name: 'Professional',
    description: 'Template professionale pulito e moderno',
    defaultSections: [
      {
        id: 'hero',
        type: 'content',
        name: 'Hero Section',
        icon: 'home',
        required: true,
        defaultContent: {
          title: 'Benvenuti nella Nostra Azienda',
          subtitle: 'Soluzioni innovative per il vostro business',
          cta_text: 'Scopri di più',
          cta_link: '#contatti',
          background_color: '#3B82F6',
          background_image: null
        },
        fields: [
          { key: 'title', type: 'text', label: 'Titolo', required: true },
          { key: 'subtitle', type: 'textarea', label: 'Sottotitolo', rows: 2 },
          { key: 'cta_text', type: 'text', label: 'Testo pulsante CTA' },
          { key: 'cta_link', type: 'text', label: 'Link pulsante CTA' },
          { key: 'background_color', type: 'color', label: 'Colore sfondo' },
          { key: 'background_image', type: 'image', label: 'Immagine sfondo' }
        ]
      },
      {
        id: 'about',
        type: 'content',
        name: 'Chi Siamo',
        icon: 'information',
        required: true,
        defaultContent: {
          title: 'La Nostra Storia',
          subtitle: 'Esperienza e professionalità al vostro servizio',
          content: '<p>Siamo un team di professionisti dedicati a fornire soluzioni innovative e personalizzate per le esigenze della tua azienda.</p>',
          layout: 'text-left',
          image: null
        },
        fields: [
          { key: 'title', type: 'text', label: 'Titolo', required: true },
          { key: 'subtitle', type: 'textarea', label: 'Sottotitolo', rows: 2 },
          { key: 'content', type: 'richtext', label: 'Contenuto' },
          { key: 'layout', type: 'select', label: 'Layout', options: [
            { value: 'text-left', label: 'Testo a sinistra' },
            { value: 'text-right', label: 'Testo a destra' },
            { value: 'text-center', label: 'Testo centrato' }
          ]},
          { key: 'image', type: 'image', label: 'Immagine azienda' }
        ]
      },
      {
        id: 'services',
        type: 'content',
        name: 'Servizi',
        icon: 'briefcase',
        required: true,
        defaultContent: {
          title: 'I Nostri Servizi',
          subtitle: 'Soluzioni complete per ogni esigenza',
          services: [
            { title: 'Consulenza', description: 'Analisi e strategie personalizzate' },
            { title: 'Sviluppo', description: 'Soluzioni software su misura' },
            { title: 'Supporto', description: 'Assistenza tecnica continua' }
          ],
          background_image: null
        },
        fields: [
          { key: 'title', type: 'text', label: 'Titolo', required: true },
          { key: 'subtitle', type: 'textarea', label: 'Sottotitolo', rows: 2 },
          { key: 'background_image', type: 'image', label: 'Immagine sezione' },
          { key: 'cta_text', type: 'text', label: 'Testo pulsante CTA' },
          { key: 'cta_link', type: 'text', label: 'Link pulsante CTA' }
        ]
      },
      {
        id: 'gallery',
        type: 'media',
        name: 'Galleria Immagini',
        icon: 'photo',
        required: false,
        defaultContent: {
          title: 'La Nostra Galleria',
          subtitle: 'Scopri i nostri lavori e progetti',
          layout: 'grid-3',
          images: []
        },
        fields: [
          { key: 'title', type: 'text', label: 'Titolo galleria' },
          { key: 'subtitle', type: 'textarea', label: 'Sottotitolo', rows: 2 },
          { key: 'layout', type: 'select', label: 'Layout', options: [
            { value: 'grid-2', label: 'Griglia 2 colonne' },
            { value: 'grid-3', label: 'Griglia 3 colonne' },
            { value: 'grid-4', label: 'Griglia 4 colonne' },
            { value: 'masonry', label: 'Masonry' }
          ]},
          { key: 'images', type: 'images', label: 'Immagini galleria', maxImages: 12 }
        ]
      },
      {
        id: 'gallery',
        type: 'media',
        name: 'Galleria Immagini',
        icon: 'photo',
        required: false,
        defaultContent: {
          title: 'La Nostra Galleria',
          subtitle: 'Immagine della nostra attività',
          layout: 'grid-3',
          max_images: 12,
          aspect_ratio: '16:9'
        }
      },
      {
        id: 'contact',
        type: 'contact',
        name: 'Contatti e Mappa',
        icon: 'map',
        required: true,
        defaultContent: {
          title: 'Contattaci',
          subtitle: 'Siamo a tua disposizione',
          show_map: true,
          show_form: true,
          map_zoom: 15
        }
      },
      {
        id: 'social',
        type: 'social',
        name: 'Social Sharing',
        icon: 'share',
        required: false,
        defaultContent: {
          enabled: true,
          platforms: ['facebook', 'linkedin', 'twitter', 'whatsapp'],
          show_follow_buttons: true
        }
      }
    ]
  },

  2: {
    id: 2,
    name: 'Modern',
    description: 'Template moderno con design minimalista',
    defaultSections: [
      {
        id: 'hero',
        type: 'content',
        name: 'Hero Section',
        icon: 'home',
        required: true,
        defaultContent: {
          title: 'Design Moderno',
          subtitle: 'Semplicità ed eleganza',
          cta_text: 'Inizia Ora',
          cta_link: '#servizi',
          background_color: '#10B981'
        }
      },
      {
        id: 'features',
        type: 'content',
        name: 'Caratteristiche',
        icon: 'star',
        required: true,
        defaultContent: {
          title: 'Perché Sceglierci',
          features: [
            { icon: 'zap', title: 'Velocità', description: 'Performance ottimizzate' },
            { icon: 'shield', title: 'Sicurezza', description: 'Protezione dei dati garantita' },
            { icon: 'mobile', title: 'Mobile First', description: 'Esperienza perfetta su tutti i dispositivi' }
          ]
        }
      },
      {
        id: 'portfolio',
        type: 'media',
        name: 'Portfolio',
        icon: 'photo',
        required: false,
        defaultContent: {
          title: 'I Nostri Lavori',
          layout: 'masonry',
          max_images: 20,
          show_descriptions: true
        }
      },
      {
        id: 'testimonials',
        type: 'content',
        name: 'Testimonianze',
        icon: 'quote',
        required: false,
        defaultContent: {
          title: 'Cosa Dicono di Noi',
          testimonials: [
            { name: 'Mario Rossi', role: 'CEO', text: 'Servizio eccellente e professionale' },
            { name: 'Laura Bianchi', role: 'Manager', text: 'Risultati oltre le aspettative' }
          ]
        }
      }
    ]
  },

  3: {
    id: 3,
    name: 'Creative',
    description: 'Template creativo con design accattivante',
    defaultSections: [
      {
        id: 'hero',
        type: 'content',
        name: 'Hero Section Creativa',
        icon: 'home',
        required: true,
        defaultContent: {
          title: 'Creatività Senza Limiti',
          subtitle: 'Dove l\'immaginazione diventa realtà',
          cta_text: 'Esplora',
          background_video: true,
          background_color: '#8B5CF6'
        }
      },
      {
        id: 'showcase',
        type: 'media',
        name: 'Showcase Creativo',
        icon: 'photo',
        required: true,
        defaultContent: {
          title: 'Mostriamo il Talento',
          layout: 'carousel',
          auto_play: true,
          show_captions: true
        }
      },
      {
        id: 'team',
        type: 'content',
        name: 'Il Nostro Team',
        icon: 'users',
        required: false,
        defaultContent: {
          title: 'I Creativi',
          layout: 'grid-4',
          show_roles: true
        }
      }
    ]
  },

  4: {
    id: 4,
    name: 'Ecommerce',
    description: 'Template ottimizzato per vendita online',
    defaultSections: [
      {
        id: 'hero',
        type: 'content',
        name: 'Hero Ecommerce',
        icon: 'shopping-cart',
        required: true,
        defaultContent: {
          title: 'Shop Online',
          subtitle: 'I migliori prodotti a portata di click',
          cta_text: 'Acquista Ora',
          background_color: '#F97316'
        }
      },
      {
        id: 'products',
        type: 'catalog',
        name: 'Prodotti in Evidenza',
        icon: 'package',
        required: true,
        defaultContent: {
          title: 'Prodotti Popolari',
          layout: 'grid-4',
          show_prices: true,
          show_ratings: true
        }
      },
      {
        id: 'categories',
        type: 'content',
        name: 'Categorie',
        icon: 'grid',
        required: true,
        defaultContent: {
          title: 'Naviga per Categoria',
          layout: 'grid-3',
          show_product_count: true
        }
      }
    ]
  },

  5: {
    id: 5,
    name: 'Corporate',
    description: 'Template corporate elegante e formale',
    defaultSections: [
      {
        id: 'hero',
        type: 'content',
        name: 'Hero Corporate',
        icon: 'building',
        required: true,
        defaultContent: {
          title: 'Eccellenza Aziendale',
          subtitle: 'Leadership nel settore da oltre 20 anni',
          cta_text: 'Contattaci',
          background_color: '#6B7280'
        }
      },
      {
        id: 'about',
        type: 'content',
        name: 'Profilo Aziendale',
        icon: 'information',
        required: true,
        defaultContent: {
          title: 'La Nostra Azienda',
          content: '<p>Con una consolidata esperienza nel settore, offriamo soluzioni corporate di alta qualità.</p>',
          show_company_data: true
        }
      },
      {
        id: 'values',
        type: 'content',
        name: 'Valori Aziendali',
        icon: 'heart',
        required: true,
        defaultContent: {
          title: 'I Nostri Valori',
          values: [
            { title: 'Integrità', description: 'Trasparenza e onestà in ogni azione' },
            { title: 'Innovazione', description: 'Sempre all\'avanguardia nel settore' },
            { title: 'Qualità', description: 'Standard elevati in tutto ciò che facciamo' }
          ]
        }
      }
    ]
  }
};

/**
 * Page types predefiniti con sezioni consigliate per ogni template
 */
export const pageTypeTemplates = {
  home: {
    name: 'Home Page',
    description: 'Pagina principale del sito',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section =>
        ['hero', 'about', 'services', 'gallery'].includes(section.id)
      );
    }
  },

  about: {
    name: 'Chi Siamo',
    description: 'Pagina aziendale',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section =>
        ['about', 'team', 'values'].includes(section.id)
      );
    }
  },

  contact: {
    name: 'Contatti',
    description: 'Pagina contatti e mappa',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section =>
        ['contact', 'social'].includes(section.id)
      );
    }
  },

  services: {
    name: 'Servizi',
    description: 'Pagina servizi aziendali',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section =>
        ['services', 'features', 'testimonials'].includes(section.id)
      );
    }
  },

  gallery: {
    name: 'Galleria',
    description: 'Vetrina foto e immagini',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section =>
        ['gallery', 'showcase', 'portfolio'].includes(section.id)
      );
    }
  },

  custom: {
    name: 'Personalizzata',
    description: 'Pagina completamente personalizzabile',
    getRecommendedSections: (templateId) => {
      const template = templateDefinitions[templateId];
      return template.defaultSections.filter(section => section.required);
    }
  }
};

/**
 * Funzione utility per ottenere le opzioni di layout per ogni tipo di sezione
 */
export const getSectionLayoutOptions = (sectionType) => {
  const layouts = {
    content: {
      hero: ['center', 'left', 'right', 'split'],
      about: ['text-left', 'text-center', 'split'],
      services: ['grid-3', 'grid-4', 'list'],
      features: ['grid-3', 'timeline', 'tabs'],
      team: ['grid-3', 'grid-4', 'carousel'],
      values: ['grid-3', 'timeline', 'cards']
    },
    media: {
      gallery: ['grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel'],
      portfolio: ['grid-3', 'masonry', 'showcase'],
      showcase: ['carousel', 'grid-2', 'fullscreen']
    },
    contact: {
      contact: ['split', 'stacked', 'map-only', 'form-only']
    },
    social: {
      social: ['inline', 'floating', 'sidebar']
    }
  };

  return layouts[sectionType] || [];
};

/**
 * Funzione per validare i contenuti di una sezione in base al tipo
 */
export const validateSectionContent = (sectionType, content) => {
  const validation = {
    content: {
      hero: ['title', 'subtitle'],
      about: ['title', 'content'],
      services: ['title', 'services'],
      features: ['title', 'features']
    },
    media: {
      gallery: ['layout'],
      portfolio: ['layout']
    },
    contact: {
      contact: ['title']
    },
    social: {
      social: ['platforms']
    }
  };

  const required = validation[sectionType] || [];
  const missing = required.filter(field => !content[field]);

  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

export default templateDefinitions;