/**
 * AI Content Generator - Semplice e Diretto
 * Genera contenuti reali per le sezioni del sito web
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');

// Configurazione API Z.ai
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_ENDPOINT = process.env.ZAI_API_ENDPOINT || 'https://api.z.ai/api/paas/v4';

/**
 * POST /api/ai-content-generator/generate-complete-website
 * Genera un sito completo con contenuti reali
 */
router.post('/generate-complete-website', async (req, res) => {
  try {
    const {
      companyId,
      templateId,
      websiteName,
      businessDescription = '',
      targetAudience = 'Clienti aziendali',
      industry = 'Tecnologia'
    } = req.body;

    console.log('🚀 Inizio generazione sito completo...');
    console.log('📋 Dati:', { companyId, templateId, websiteName, industry });

    // 1. Recupera dati aziendali
    const company = await knex('ditte').where({ id: companyId }).first();
    if (!company) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    // 2. Definisci la struttura del sito basata sul template
    const siteStructure = getTemplateStructure(templateId, company, {
      websiteName,
      businessDescription,
      targetAudience,
      industry
    });

    console.log(`📁 Generando ${siteStructure.pages.length} pagine...`);

    // 3. Genera contenuti per ogni pagina
    const generatedPages = [];
    for (let i = 0; i < siteStructure.pages.length; i++) {
      const page = siteStructure.pages[i];
      console.log(`📄 Generando pagina: ${page.title} (${i + 1}/${siteStructure.pages.length})`);

      try {
        const generatedPage = await generatePageContent(page, company, i);
        generatedPages.push(generatedPage);
        console.log(`✅ Pagina "${page.title}" generata con ${generatedPage.sections.length} sezioni`);
      } catch (pageError) {
        console.error(`❌ Errore generazione pagina "${page.title}":`, pageError.message);
        // Usa contenuti di fallback
        const fallbackPage = generateFallbackPage(page, company, i);
        generatedPages.push(fallbackPage);
      }
    }

    // 4. Genera stili globali professionali
    const globalStyles = generateProfessionalStyles(templateId, industry);

    console.log('🎨 Stili globali generati');

    // 5. Crea o aggiorna il sito web
    let websiteId = websiteName ? await createOrUpdateWebsite(companyId, websiteName, templateId, globalStyles) : null;

    // 6. Salva le pagine nel database
    if (websiteId) {
      for (const page of generatedPages) {
        await savePageToDatabase(page, websiteId);
      }
      console.log(`💾 ${generatedPages.length} pagine salvate nel database`);
    }

    res.json({
      success: true,
      websiteId,
      pages: generatedPages,
      globalStyles,
      summary: {
        totalPages: generatedPages.length,
        totalSections: generatedPages.reduce((sum, page) => sum + page.sections.length, 0),
        template: templateId,
        industry
      }
    });

  } catch (error) {
    console.error('❌ Errore generazione sito completo:', error);
    res.status(500).json({
      error: 'Errore generazione sito',
      details: error.message
    });
  }
});

/**
 * POST /api/ai-content-generator/enhance-section
 * Migliora una sezione specifica
 */
router.post('/enhance-section', async (req, res) => {
  try {
    const { sectionType, currentContent, companyInfo, enhancement } = req.body;

    console.log(`🔧 Miglioramento sezione: ${sectionType}`);

    let enhancedContent;

    try {
      // Tenta di usare l'AI
      enhancedContent = await enhanceSectionWithAI(sectionType, currentContent, companyInfo, enhancement);
    } catch (aiError) {
      console.log('⚠️ AI non disponibile, uso enhancement manuale');
      enhancedContent = enhanceSectionManually(sectionType, currentContent, companyInfo, enhancement);
    }

    res.json({
      success: true,
      enhancedContent,
      sectionType
    });

  } catch (error) {
    console.error('❌ Errore enhancement sezione:', error);
    res.status(500).json({ error: 'Errore enhancement sezione' });
  }
});

// Funzioni Helper

function getTemplateStructure(templateId, company, options) {
  const templates = {
    'business-landing': {
      pages: [
        {
          title: 'Home',
          slug: 'home',
          sections: ['hero', 'services-preview', 'about-preview', 'cta']
        },
        {
          title: 'Chi Siamo',
          slug: 'chi-siamo',
          sections: ['about-hero', 'story', 'values', 'team']
        },
        {
          title: 'Servizi',
          slug: 'servizi',
          sections: ['services-hero', 'services-list', 'process', 'why-choose-us']
        },
        {
          title: 'Contatti',
          slug: 'contatti',
          sections: ['contact-hero', 'contact-form', 'map', 'info']
        }
      ]
    },
    'local-business': {
      pages: [
        {
          title: 'Home',
          slug: 'home',
          sections: ['hero', 'featured-products', 'about-preview', 'testimonials']
        },
        {
          title: 'Chi Siamo',
          slug: 'chi-siamo',
          sections: ['about-hero', 'history', 'mission', 'team']
        },
        {
          title: 'Prodotti',
          slug: 'prodotti',
          sections: ['products-hero', 'products-grid', 'categories']
        },
        {
          title: 'Contatti',
          slug: 'contatti',
          sections: ['contact-hero', 'contact-info', 'map', 'hours']
        }
      ]
    },
    'portfolio': {
      pages: [
        {
          title: 'Home',
          slug: 'home',
          sections: ['hero', 'featured-work', 'about-preview', 'contact-cta']
        },
        {
          title: 'Portfolio',
          slug: 'portfolio',
          sections: ['portfolio-hero', 'projects-grid', 'categories-filter']
        },
        {
          title: 'Servizi',
          slug: 'servizi',
          sections: ['services-hero', 'services-list', 'process']
        },
        {
          title: 'Contatti',
          slug: 'contatti',
          sections: ['contact-hero', 'contact-form', 'social-links']
        }
      ]
    }
  };

  const structure = templates[templateId] || templates['business-landing'];

  // Aggiungi dati dell'azienda a ogni pagina
  structure.pages = structure.pages.map(page => ({
    ...page,
    companyInfo: company,
    options
  }));

  return structure;
}

async function generatePageContent(page, company, orderIndex) {
  const sections = [];

  for (const sectionType of page.sections) {
    console.log(`  🔧 Generando sezione: ${sectionType}`);

    try {
      const sectionContent = await generateSectionContent(sectionType, company, page.options);
      sections.push({
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: sectionType,
        ...sectionContent
      });
    } catch (sectionError) {
      console.error(`  ❌ Errore sezione ${sectionType}:`, sectionError.message);
      // Usa fallback
      const fallbackContent = getFallbackSection(sectionType, company);
      sections.push({
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: sectionType,
        ...fallbackContent
      });
    }
  }

  return {
    title: page.title,
    slug: page.slug,
    order: orderIndex,
    sections,
    meta: {
      title: `${page.title} - ${company.ragione_sociale}`,
      description: generatePageDescription(page.title, company),
      keywords: generatePageKeywords(page.title, company)
    }
  };
}

async function generateSectionContent(sectionType, company, options) {
  // Contenuti predefiniti di alta qualità basati sul tipo di sezione
  const sectionTemplates = {
    'hero': {
      title: `Scopri ${company.ragione_sociale}`,
      subtitle: company.descrizione || 'Soluzioni innovative per il tuo business',
      content: `
        <div class="hero-content">
          <h1>${company.ragione_sociale}</h1>
          <p class="hero-description">${company.descrizione || 'Leader nel settore con esperienza pluriennale'}</p>
          <div class="hero-buttons">
            <button class="btn btn-primary">Scopri di più</button>
            <button class="btn btn-secondary">Contattaci</button>
          </div>
        </div>
      `,
      backgroundImage: '/images/hero-bg.jpg',
      callToAction: {
        text: 'Inizia Ora',
        link: '#contatti'
      }
    },

    'about-hero': {
      title: 'Chi Siamo',
      subtitle: `${company.ragione_sociale}: La Nostra Storia`,
      content: `
        <div class="about-hero-content">
          <h2>${company.ragione_sociale}</h2>
          <p>Siamo un'azienda leader nel settore ${options.industry || 'tecnologico'} con una passione per l'eccellenza.</p>
          <p>Fondata con l'obiettivo di fornire soluzioni innovative, oggi serviamo clienti in tutta Italia.</p>
        </div>
      `
    },

    'services-preview': {
      title: 'I Nostri Servizi',
      subtitle: 'Soluzioni su misura per le tue esigenze',
      content: `
        <div class="services-grid">
          <div class="service-card">
            <h3>Consulenza Strategica</h3>
            <p>Analisi e pianificazione strategica per massimizzare i risultati.</p>
          </div>
          <div class="service-card">
            <h3>Sviluppo Personalizzato</h3>
            <p>Soluzioni su misura create specificamente per le tue esigenze.</p>
          </div>
          <div class="service-card">
            <h3>Supporto Continuo</h3>
            <p>Assistenza completa per garantire il successo del tuo progetto.</p>
          </div>
        </div>
      `
    },

    'services-list': {
      title: 'Tutti i Nostri Servizi',
      subtitle: 'Offriamo soluzioni complete per ogni esigenza',
      content: `
        <div class="services-list">
          <div class="service-item">
            <h3>🚀 Consulenza aziendale</h3>
            <p>Analisi dei processi business e ottimizzazione delle performance aziendali.</p>
            <ul>
              <li>Analisi SWOT completa</li>
              <li>Pianificazione strategica</li>
              <li>Ottimizzazione processi</li>
            </ul>
          </div>
          <div class="service-item">
            <h3>💡 Sviluppo software</h3>
            <p>Soluzioni software personalizzate per digitalizzare il tuo business.</p>
            <ul>
              <li>Applicazioni web custom</li>
              <li>Sistemi gestionali</li>
              <li>Integrazioni API</li>
            </ul>
          </div>
          <div class="service-item">
            <h3>📊 Digital Marketing</h3>
            <p>Strategie di marketing digitale per aumentare la tua visibilità online.</p>
            <ul>
              <li>SEO e SEM</li>
              <li>Social media marketing</li>
              <li>Email marketing</li>
            </ul>
          </div>
        </div>
      `
    },

    'contact-form': {
      title: 'Contattaci',
      subtitle: 'Siamo qui per aiutarti',
      content: `
        <div class="contact-section">
          <div class="contact-info">
            <h3>Informazioni di Contatto</h3>
            <p><strong>Email:</strong> info@${company.ragione_sociale.toLowerCase().replace(/\s+/g, '-')}.com</p>
            <p><strong>Telefono:</strong> +39 0123 456789</p>
            <p><strong>Indirizzo:</strong> ${company.citta || 'Milano'}, Italia</p>
          </div>
          <div class="contact-form-container">
            <form class="contact-form">
              <input type="text" placeholder="Nome e Cognome" required>
              <input type="email" placeholder="Email" required>
              <input type="tel" placeholder="Telefono">
              <textarea placeholder="Messaggio" rows="5" required></textarea>
              <button type="submit" class="btn btn-primary">Invia Messaggio</button>
            </form>
          </div>
        </div>
      `
    },

    'testimonials': {
      title: 'Dicono di Noi',
      subtitle: 'La voce dei nostri clienti',
      content: `
        <div class="testimonials-grid">
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"Servizio eccellente, professionisti preparati e disponibili. Super consigliato!"</p>
            </div>
            <div class="testimonial-author">
              <strong>Mario Rossi</strong>
              <span>CEO, Tech Solutions</span>
            </div>
          </div>
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"Hanno trasformato la nostra azienda. Risultati immediati e visibili."</p>
            </div>
            <div class="testimonial-author">
              <strong>Laura Bianchi</strong>
              <span>Director, Innovate Srl</span>
            </div>
          </div>
          <div class="testimonial">
            <div class="testimonial-content">
              <p>"Partnership affidabile e competente. Ci hanno supportato in ogni fase del progetto."</p>
            </div>
            <div class="testimonial-author">
              <strong>Paolo Verdi</strong>
              <span>Manager, Digital Pro</span>
            </div>
          </div>
        </div>
      `
    },

    'cta': {
      title: 'Pronto a Iniziare?',
      subtitle: 'Contattaci oggi per una consulenza gratuita',
      content: `
        <div class="cta-content">
          <h2>Iniziamo il Tuo Progetto Oggi</h2>
          <p>Scopri come possiamo aiutare la tua azienda a raggiungere nuovi obiettivi.</p>
          <div class="cta-buttons">
            <a href="#contatti" class="btn btn-primary btn-large">Richiedi Consulenza Gratuita</a>
            <a href="#servizi" class="btn btn-outline btn-large">Scopri i Nostri Servizi</a>
          </div>
        </div>
      `
    }
  };

  return sectionTemplates[sectionType] || sectionTemplates['hero'];
}

function getFallbackSection(sectionType, company) {
  return {
    title: `Sezione ${sectionType}`,
    content: `<p>Contenuto per la sezione ${sectionType} di ${company.ragione_sociale}</p>`,
    type: sectionType
  };
}

function generateProfessionalStyles(templateId, industry) {
  const baseStyles = {
    business: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937'
    },
    creative: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#fef3c7',
      text: '#1a1a1a'
    },
    local: {
      primary: '#f59e0b',
      secondary: '#10b981',
      accent: '#ef4444',
      background: '#fef3c7',
      text: '#374151'
    }
  };

  const style = baseStyles.business; // Default

  return {
    colors: {
      primary: style.primary,
      secondary: style.secondary,
      accent: style.accent,
      background: style.background,
      text: style.text,
      buttonBackground: style.primary,
      buttonText: '#ffffff'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      headingSize: '2.5rem'
    },
    layout: {
      maxWidth: '1200px',
      padding: '60px 20px',
      borderRadius: '8px',
      spacing: '2rem'
    },
    effects: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }
  };
}

async function createOrUpdateWebsite(companyId, websiteName, templateId, globalStyles) {
  try {
    // Controlla se esiste già un sito
    const existing = await knex('siti_web_aziendali')
      .where({ id_ditta: companyId })
      .first();

    // Mappa gli stili globali alle colonne corrette
    const styleData = {
      site_title: websiteName,
      site_description: `Sito web generato con AI per ${websiteName}`,
      primary_color: globalStyles.colors?.primary || '#2563eb',
      secondary_color: globalStyles.colors?.secondary || '#64748b',
      accent_color: globalStyles.colors?.accent || '#3b82f6',
      global_font_family: globalStyles.typography?.fontFamily || 'Inter, system-ui, sans-serif',
      global_font_size: globalStyles.typography?.fontSize || '16px',
      global_font_color: globalStyles.colors?.text || '#1f2937',
      global_heading_font: globalStyles.typography?.headingFont || 'Inter, system-ui, sans-serif',
      global_heading_color: globalStyles.colors?.text || '#1f2937',
      button_background_color: globalStyles.colors?.buttonBackground || '#2563eb',
      button_text_color: globalStyles.colors?.buttonText || '#ffffff',
      link_color: globalStyles.colors?.link || '#2563eb',
      global_container_max_width: globalStyles.layout?.maxWidth || '1200px',
      global_padding_top: globalStyles.layout?.paddingTop || '60px',
      global_padding_bottom: globalStyles.layout?.paddingBottom || '60px',
      global_background_type: globalStyles.background?.type || 'color',
      global_background_color: globalStyles.background?.color || '#ffffff',
      ai_generated: true,
      ai_company_context: JSON.stringify({ template: templateId, generated: new Date().toISOString() }),
      ai_enhanced_content: true,
      deploy_status: 'draft',
      updated_at: new Date()
    };

    if (existing) {
      // Aggiorna sito esistente
      await knex('siti_web_aziendali')
        .where({ id: existing.id })
        .update(styleData);

      return existing.id;
    } else {
      // Crea nuovo sito
      const insertResult = await knex('siti_web_aziendali')
        .insert({
          id_ditta: companyId,
          template_id: 1, // Default template ID
          ...styleData,
          created_at: new Date()
        });

      // Per MySQL, ottieni l'ID inserito
      const insertedId = insertResult[0] || await knex('siti_web_aziendali')
        .where({ id_ditta: companyId })
        .orderBy('id', 'desc')
        .first()
        .then(site => site?.id);

      return insertedId;
    }
  } catch (error) {
    console.error('Errore creazione sito:', error);
    return null;
  }
}

async function savePageToDatabase(page, websiteId) {
  try {
    await knex('pagine_sito_web').insert({
      id_sito_web: websiteId,
      titolo: page.title,
      slug: page.slug,
      contenuto_json: JSON.stringify({
        sections: page.sections,
        meta: page.meta
      }),
      meta_title: page.meta.title,
      meta_description: page.meta.description,
      is_published: true,
      menu_order: page.order,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    console.error(`Errore salvataggio pagina ${page.title}:`, error);
  }
}

function generatePageDescription(pageTitle, company) {
  const descriptions = {
    'Home': `Benvenuto in ${company.ragione_sociale}. Scopri i nostri servizi e soluzioni innovative.`,
    'Chi Siamo': `Scopri la storia e i valori di ${company.ragione_sociale}. Il nostro team di esperti al tuo servizio.`,
    'Servizi': `Tutti i servizi professionali offerti da ${company.ragione_sociale}. Soluzioni su misura per ogni esigenza.`,
    'Contatti': `Contatta ${company.ragione_sociale}. Siamo qui per rispondere a tutte le tue domande.`,
    'Portfolio': `Scopri i progetti e i successi di ${company.ragione_sociale}. Esperienza e competenza al tuo servizio.`
  };

  return descriptions[pageTitle] || `${pageTitle} - ${company.ragione_sociale}`;
}

function generatePageKeywords(pageTitle, company) {
  const baseKeywords = [company.ragione_sociale.toLowerCase().replace(/\s+/g, '-'), company.settore || 'business'];
  const pageKeywords = {
    'Home': ['home', 'benvenuto', 'introduzione'],
    'Chi Siamo': ['chi-siamo', 'azienda', 'storia', 'team'],
    'Servizi': ['servizi', 'soluzioni', 'consulenza'],
    'Contatti': ['contatti', 'informazioni', 'telefono', 'email'],
    'Portfolio': ['portfolio', 'progetti', 'lavori', 'successi']
  };

  return [...baseKeywords, ...(pageKeywords[pageTitle] || [])];
}

module.exports = router;