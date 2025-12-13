/**
 * AI Service
 * Servizio per integrazione funzionalità AI nel Website Builder
 */

import { api } from './api';

class AIService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minuti
  }

  // Analisi aziendale con AI
  async analyzeCompany(companyId, options = {}) {
    const cacheKey = `company-analysis-${companyId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    try {
      const response = await api.post('/ai-enhanced-website/analyze-company', {
        companyId,
        includeIndustryAnalysis: true,
        includeContentSuggestions: true,
        ...options
      });

      const result = response.data;
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Errore analisi AI:', error);
      throw new Error('Impossibile analizzare l\'azienda con AI');
    }
  }

  // Genera contenuto per sezione specifica
  async generateSectionContent(sectionType, companyId, customPrompt = '', options = {}) {
    try {
      const response = await api.post('/ai-enhanced-website/generate-section-content', {
        sectionType,
        companyId,
        customPrompt,
        sectionIndex: options.sectionIndex || 0,
        totalSections: options.totalSections || 1,
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Errore generazione contenuto AI:', error);
      throw new Error('Impossibile generare il contenuto con AI');
    }
  }

  // Enhance company data
  async enhanceCompanyData(companyId) {
    try {
      const response = await api.post('/ai-enhanced-website/enhance-company-data', {
        companyId
      });

      return response.data;
    } catch (error) {
      console.error('Errore enhancement dati azienda:', error);
      throw new Error('Impossibile arricchire i dati aziendali');
    }
  }

  // Genera template completo con contenuti AI
  async generateAITemplate(template, companyId, customPrompt = '', progressCallback = null) {
    try {
      // 1. Analizza sezioni mancanti
      const missingSections = this.analyzeMissingSections(template);

      if (missingSections.length > 0) {
        console.log(`🔍 Rilevate ${missingSections.length} sezioni mancanti, inizio generazione guidata AI...`);

        // 2. Genera sezioni mancanti con progress callback
        await this.generateMissingSections(missingSections, template, (progress) => {
          if (progressCallback) {
            // Calcola progresso combinato: 50% per sezioni mancanti, 50% per sezioni esistenti
            const combinedProgress = (progress.progress * 0.5);
            progressCallback(combinedProgress, progress.message);
          }
        });

        console.log(`✅ Sezioni mancanti generate. Template ora ha ${template.sections.length} sezioni totali.`);
      }

      // 3. Potenzia sezioni esistenti con AI
      const enhancedSections = await Promise.all(
        template.sections.map(async (section, index) => {
          if (progressCallback) {
            // Progresso dal 50% al 100% per sezioni esistenti
            const existingProgress = 50 + ((index / template.sections.length) * 50);
            progressCallback(existingProgress, `Potenziamento sezione ${section.type}...`);
          }

          // Se la sezione è stata appena generata come mancante, non rigenerarla
          if (section.generated) {
            return section;
          }

          const contentResponse = await this.generateSectionContent(
            section.type,
            companyId,
            customPrompt,
            {
              sectionIndex: index,
              totalSections: template.sections.length,
              sectionData: section.data
            }
          );

          return {
            ...section,
            aiGeneratedContent: contentResponse.content,
            aiConfidence: contentResponse.confidence || 0.8,
            aiSuggestions: contentResponse.suggestions || [],
            aiEnhanced: true
          };
        })
      );

      if (progressCallback) {
        progressCallback(100, 'Template completato con successo!');
      }

      return {
        ...template,
        sections: enhancedSections,
        aiGenerated: true,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          confidence: enhancedSections.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / enhancedSections.length,
          prompt: customPrompt,
          missingSectionsGenerated: missingSections.length
        }
      };
    } catch (error) {
      console.error('Errore generazione template AI:', error);
      throw error;
    }
  }

  // Crea pagine complete da template AI-enhanced
  async createPagesFromAITemplate(template, websiteId, globalStyles = {}) {
    const pages = [];

    // Definisci struttura pagine logiche basate su tipi di sezione
    const pageStructures = {
      home: {
        sections: ['hero', 'services'],
        title: 'Home',
        slug: 'home',
        description: 'Pagina principale con hero e servizi'
      },
      about: {
        sections: ['about', 'testimonial'],
        title: 'Chi Siamo',
        slug: 'chi-siamo',
        description: 'Pagina aziendale con storia e testimonianze'
      },
      contact: {
        sections: ['contact', 'social'],
        title: 'Contatti',
        slug: 'contatti',
        description: 'Pagina contatti e social media'
      },
      gallery: {
        sections: ['gallery'],
        title: 'Galleria',
        slug: 'galleria',
        description: 'Galleria immagini e progetti'
      }
    };

    // Raggruppa sezioni per tipo di pagina
    Object.entries(pageStructures).forEach(([pageType, pageConfig], pageIndex) => {
      // Filtra sezioni disponibili per questa pagina
      const availableSections = template.sections.filter(section =>
        pageConfig.sections.includes(section.type)
      );

      // Se non ci sono sezioni disponibili, crea una pagina di base comunque
      if (availableSections.length === 0) {
        console.log(`✅ Creazione pagina ${pageType} con contenuto fallback (template sections disponibili: ${template.sections.map(s => s.type).join(', ')})`);
        // Crea una pagina base con contenuto generico
        const defaultContent = this.getDefaultContentForPage(pageType, template.companyName || 'Azienda');

        const pageData = {
          slug: pageConfig.slug,
          titolo: pageConfig.title,
          contenuto_json: JSON.stringify({
            sections: [{
              type: pageType,
              data: defaultContent,
              aiGeneratedContent: defaultContent
            }],
            template_type: template.id,
            ai_enhanced: true,
            page_type: pageType,
            default_generated: true
          }),
          contenuto_html: defaultContent.content || `<p>Contenuto per ${pageConfig.title}</p>`,
          meta_title: `${pageConfig.title} - ${template.companyName || 'Website'}`,
          meta_description: pageConfig.description,
          is_published: false,
          menu_order: pageIndex,
          // Campi stile ereditati da globali con valori di default fallback
          background_type: globalStyles.background_type || 'color',
          background_color: globalStyles.background_color || '#ffffff',
          background_gradient: globalStyles.background_gradient || null,
          background_image: globalStyles.background_image || null,
          background_size: globalStyles.background_size || 'cover',
          background_position: globalStyles.background_position || 'center',
          background_repeat: globalStyles.background_repeat || 'no-repeat',
          background_attachment: globalStyles.background_attachment || 'scroll',
          font_family: globalStyles.font_family || 'Inter',
          font_size: globalStyles.font_size || '16',
          font_color: globalStyles.font_color || '#333333',
          heading_font: globalStyles.heading_font || 'Inter',
          heading_color: globalStyles.heading_color || '#1a1a1a',
          container_max_width: globalStyles.container_max_width || '1200px',
          padding_top: globalStyles.padding_top || '60px',
          padding_bottom: globalStyles.padding_bottom || '60px',
          border_radius: globalStyles.border_radius || '8px',
          box_shadow: globalStyles.box_shadow || '0 2px 4px rgba(0, 0, 0, 0.1)',
          style_config: globalStyles.style_config || {},
          custom_css: globalStyles.custom_css || null,
          ai_generated: true,
          ai_generation_prompt: template.customPrompt || 'Generazione automatica sito AI',
          ai_confidence_score: 0.8,
          ai_content_sections: JSON.stringify([pageType]),
          ai_enhancements: JSON.stringify(defaultContent),
          ai_seo_metadata: JSON.stringify({
            keywords: [pageConfig.title.toLowerCase(), template.companyName?.toLowerCase()],
            difficulty: 'medium'
          }),
          ai_optimized_for_mobile: true
        };

        pages.push(pageData);
        return; // Vai alla prossima pagina
      }

      // Prepara contenuto combinato delle sezioni
      let combinedContent = '';
      let aiContentData = {};

      availableSections.forEach(section => {
        if (section.aiGeneratedContent) {
          combinedContent += section.aiGeneratedContent.content || '';
          aiContentData = {
            ...aiContentData,
            [section.type]: section.aiGeneratedContent
          };
        }
      });

      const pageData = {
        slug: pageConfig.slug,
        titolo: pageConfig.title,
        contenuto_json: JSON.stringify({
          sections: availableSections,
          template_type: template.id,
          ai_enhanced: true,
          page_type: pageType
        }),
        contenuto_html: combinedContent || '<p>Contenuto generato dall\'AI</p>',
        meta_title: `${pageConfig.title} - ${template.companyName || 'Website'}`,
        meta_description: pageConfig.description,
        is_published: false,
        menu_order: pageIndex,
        // Campi stile ereditati da globali con valori di default fallback
        background_type: globalStyles.background_type || 'color',
        background_color: globalStyles.background_color || '#ffffff',
        background_gradient: globalStyles.background_gradient || null,
        background_image: globalStyles.background_image || null,
        background_size: globalStyles.background_size || 'cover',
        background_position: globalStyles.background_position || 'center',
        background_repeat: globalStyles.background_repeat || 'no-repeat',
        background_attachment: globalStyles.background_attachment || 'scroll',
        font_family: globalStyles.font_family || 'Inter',
        font_size: globalStyles.font_size || '16',
        font_color: globalStyles.font_color || '#333333',
        heading_font: globalStyles.heading_font || 'Inter',
        heading_color: globalStyles.heading_color || '#1a1a1a',
        container_max_width: globalStyles.container_max_width || '1200px',
        padding_top: globalStyles.padding_top || '60px',
        padding_bottom: globalStyles.padding_bottom || '60px',
        custom_css: globalStyles.custom_css || null,
        style_config: globalStyles.style_config || {},
        // Campi AI
        ai_generated: true,
        ai_generation_prompt: JSON.stringify(aiContentData),
        ai_confidence_score: availableSections.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / availableSections.length,
        ai_content_sections: JSON.stringify(aiContentData),
        ai_enhancements: JSON.stringify({
          pageType: pageType,
          sectionsCount: availableSections.length,
          totalConfidence: availableSections.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / availableSections.length
        }),
        ai_seo_metadata: JSON.stringify({
          keywords: availableSections.flatMap(s => s.aiGeneratedContent?.seo?.keywords || []),
          description: pageConfig.description
        }),
        ai_optimized_for_mobile: true
      };

      pages.push(pageData);
    });

    return pages;
  }

  // Salva sito completo AI-generated
  async saveAIGeneratedSite(websiteId, template, pages) {
    try {
      // 1. Aggiorna sito con metadata AI
      await api.put(`/website/${websiteId}`, {
        section: 'ai_metadata',
        data: {
          ai_generated: true,
          ai_company_context: JSON.stringify(template.aiMetadata),
          ai_model_version: 'z-ai-v1',
          ai_generation_metadata: JSON.stringify(template.aiMetadata)
        }
      });

      // 2. Crea pagine
      for (const page of pages) {
        await api.post(`/website/${websiteId}/pages`, page);
      }

      return {
        success: true,
        websiteId,
        pagesCount: pages.length,
        template
      };
    } catch (error) {
      console.error('Errore salvataggio sito AI:', error);
      throw error;
    }
  }

  // Genera stili globali basati su template
  async generateGlobalStyles(template, companyId, customPrompt = '') {
    const cacheKey = `global_styles_${template.id}_${companyId}_${customPrompt}`;

    try {
      // 1. Prima controlla cache
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }

      // 2. Chiama API generazione stili
      const response = await api.post('/ai-enhanced-website/generate-global-styles', {
        templateId: template.id,
        templateName: template.name || template.nome_template,
        templateDescription: template.description || template.descrizione,
        companyId,
        customPrompt
      });

      if (response.data.success) {
        // 3. Converti stili AI al formato per StyleEditor
        const convertedStyles = this.convertAIGlobalStyles(response.data.styles);

        // 4. Salva in cache
        this.setCache(cacheKey, convertedStyles);

        return {
          ...convertedStyles,
          aiGenerated: true,
          metadata: response.data.styles.metadata,
          templateAnalysis: response.data.templateAnalysis,
          cached: false
        };
      }

      throw new Error('Generazione stili fallita');

    } catch (error) {
      console.error('Errore generazione stili globali AI:', error);

      // Fallback a stili di default
      return this.getFallbackGlobalStyles(template);
    }
  }

  // Converti stili AI al formato StyleEditor
  convertAIGlobalStyles(aiStyles) {
    return {
      // Background
      background_type: aiStyles.background?.type || 'color',
      background_color: aiStyles.background?.color || '#ffffff',
      background_gradient: aiStyles.background?.gradient || null,
      background_image: aiStyles.background?.image || null,
      background_size: 'cover',
      background_position: 'center',
      background_repeat: 'no-repeat',
      background_attachment: 'scroll',

      // Typography
      font_family: aiStyles.typography?.fontFamily || 'Inter',
      font_size: aiStyles.typography?.fontSize || '16',
      font_color: aiStyles.typography?.fontColor || '#333333',
      heading_font: aiStyles.typography?.headingFont || 'Inter',
      heading_color: aiStyles.typography?.headingColor || '#1a1a1a',

      // Colors
      primary_color: aiStyles.colors?.primary || '#3B82F6',
      secondary_color: aiStyles.colors?.secondary || '#64748B',
      accent_color: aiStyles.colors?.accent || '#EF4444',
      button_background_color: aiStyles.colors?.buttonBackground || '#3B82F6',
      button_text_color: aiStyles.colors?.buttonText || '#ffffff',
      link_color: aiStyles.colors?.link || '#2563EB',

      // Layout
      container_max_width: aiStyles.layout?.containerMaxWidth || '1200px',
      padding_top: aiStyles.layout?.paddingTop || '60px',
      padding_bottom: aiStyles.layout?.paddingBottom || '60px',

      // Custom
      custom_css: aiStyles.customCss || '',
      style_config: {
        styleRationale: aiStyles.styleRationale || '',
        aiGenerated: true,
        generatedAt: aiStyles.metadata?.generatedAt
      }
    };
  }

  // Stili di default basati su template
  getFallbackGlobalStyles(template) {
    const templateName = (template.name || template.nome_template || '').toLowerCase();

    if (templateName.includes('business') || templateName.includes('corporate')) {
      return {
        background_type: 'color',
        background_color: '#ffffff',
        font_family: 'Inter',
        font_size: '16',
        font_color: '#1f2937',
        heading_font: 'Inter',
        heading_color: '#111827',
        primary_color: '#2563eb',
        secondary_color: '#64748b',
        accent_color: '#3b82f6',
        button_background_color: '#2563eb',
        button_text_color: '#ffffff',
        link_color: '#1d4ed8',
        container_max_width: '1200px',
        padding_top: '60px',
        padding_bottom: '60px',
        custom_css: '',
        style_config: {
          styleRationale: 'Stile professionale corporate'
        }
      };
    }

    if (templateName.includes('creative') || templateName.includes('portfolio')) {
      return {
        background_type: 'gradient',
        background_color: '#ffffff',
        background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        font_family: 'Montserrat',
        font_size: '16',
        font_color: '#1a1a1a',
        heading_font: 'Playfair Display',
        heading_color: '#000000',
        primary_color: '#8b5cf6',
        secondary_color: '#ec4899',
        accent_color: '#f59e0b',
        button_background_color: '#8b5cf6',
        button_text_color: '#ffffff',
        link_color: '#7c3aed',
        container_max_width: '1200px',
        padding_top: '80px',
        padding_bottom: '80px',
        custom_css: 'font-weight: 500;',
        style_config: {
          styleRationale: 'Stile creativo e dinamico'
        }
      };
    }

    if (templateName.includes('local') || templateName.includes('negozio')) {
      return {
        background_type: 'color',
        background_color: '#fef3c7',
        font_family: 'Lato',
        font_size: '16',
        font_color: '#374151',
        heading_font: 'Oswald',
        heading_color: '#1f2937',
        primary_color: '#f59e0b',
        secondary_color: '#10b981',
        accent_color: '#ef4444',
        button_background_color: '#f59e0b',
        button_text_color: '#ffffff',
        link_color: '#d97706',
        container_max_width: '1024px',
        padding_top: '60px',
        padding_bottom: '60px',
        custom_css: 'border-radius: 8px;',
        style_config: {
          styleRationale: 'Stile accogliente per attività locali'
        }
      };
    }

    // Default modern
    return {
      background_type: 'gradient',
      background_color: '#ffffff',
      background_gradient: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 100%)',
      font_family: 'Roboto',
      font_size: '16',
      font_color: '#f3f4f6',
      heading_font: 'Oswald',
      heading_color: '#ffffff',
      primary_color: '#3b82f6',
      secondary_color: '#6366f1',
      accent_color: '#f59e0b',
      button_background_color: '#f59e0b',
      button_text_color: '#000000',
      link_color: '#60a5fa',
      container_max_width: '100%',
      padding_top: '40px',
      padding_bottom: '40px',
      custom_css: 'backdrop-filter: blur(10px);',
      style_config: {
        styleRationale: 'Stile moderno e tecnologico'
      }
    };
  }

  // Helper functions
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Fallback content generation
  generateFallbackContent(sectionType, context) {
    const fallbacks = {
      hero: {
        title: `Benvenuti in ${context?.name || 'Azienda'}`,
        subtitle: 'Soluzioni innovative per il tuo business',
        content: '<p>Scopri i nostri servizi di alta qualità.</p>',
        seo: {
          title: `Home - ${context?.name || 'Azienda'}`,
          description: `Servizi professionali di ${context?.name || 'Azienda'}`
        }
      },
      services: {
        title: 'I Nostri Servizi',
        subtitle: 'Soluzioni su misura per te',
        content: '<p>Offriamo una vasta gamma di servizi professionali.</p>',
        seo: {
          title: 'Servizi',
          description: 'Scopri tutti i nostri servizi'
        }
      },
      about: {
        title: 'Chi Siamo',
        subtitle: 'La nostra storia',
        content: '<p>Siamo un team di professionisti dedicati all\'eccellenza.</p>',
        seo: {
          title: 'Chi Siamo',
          description: 'Scopri la nostra storia e i nostri valori'
        }
      },
      contact: {
        title: 'Contatti',
        subtitle: 'Scrivici o chiamaci',
        content: '<p>Saremo felici di rispondere alle tue domande.</p>',
        seo: {
          title: 'Contatti',
          description: 'Informazioni di contatto e modulo'
        }
      }
    };

    return fallbacks[sectionType] || fallbacks.hero;
  }

  // Genera contenuto di default per pagine senza sezioni corrispondenti
  getDefaultContentForPage(pageType, companyName = 'Azienda') {
    const defaultContents = {
      home: {
        title: `Benvenuti da ${companyName}`,
        subtitle: 'La vostra soddisfazione è la nostra priorità',
        content: `<h1>Benvenuti da ${companyName}</h1><p>Siamo leader nel settore grazie alla nostra esperienza e professionalità.</p>`,
        ctaButton: 'Scopri di più',
        keywords: ['home', companyName.toLowerCase(), 'benvenuti']
      },
      about: {
        title: 'Chi Siamo',
        subtitle: 'La nostra storia e la nostra passione',
        content: `<h2>La Nostra Storia</h2><p>Dal ${new Date().getFullYear() - 10} offriamo servizi di alta qualità per i nostri clienti.</p>`,
        values: ['Professionalità', 'Qualità', 'Innovazione'],
        keywords: ['chi siamo', 'storia', 'azienda']
      },
      contact: {
        title: 'Contatti',
        subtitle: 'Siamo a vostra disposizione',
        content: `<h2>Contattaci</h2><p>Telefono: +39 0XX XXXXXXX<br>Email: info@${companyName.toLowerCase().replace(/\s+/g, '')}.it</p>`,
        address: 'Via Roma 1, Milano',
        keywords: ['contatti', 'telefono', 'email']
      },
      gallery: {
        title: 'Galleria',
        subtitle: 'I nostri lavori migliori',
        content: `<h2>I Nostri Lavori</h2><p>Scopri alcuni dei nostri progetti più recenti.</p>`,
        images: [],
        keywords: ['galleria', 'portfolio', 'lavori']
      }
    };

    return defaultContents[pageType] || defaultContents.home;
  }

  // Analizza le sezioni mancanti e suggerisce generazione AI
  analyzeMissingSections(template) {
    const pageStructures = {
      home: { sections: ['hero', 'services'], title: 'Home' },
      about: { sections: ['about', 'testimonial'], title: 'Chi Siamo' },
      contact: { sections: ['contact', 'social'], title: 'Contatti' },
      gallery: { sections: ['gallery'], title: 'Galleria' }
    };

    const missingSections = [];
    Object.entries(pageStructures).forEach(([pageType, pageConfig]) => {
      pageConfig.sections.forEach(sectionType => {
        if (!template.sections.some(s => s.type === sectionType)) {
          missingSections.push({
            type: sectionType,
            pageType,
            pageTitle: pageConfig.title,
            description: this.getSectionDescription(sectionType, template.companyName),
            priority: this.getSectionPriority(sectionType),
            prompt: this.getSectionPrompt(sectionType, template.companyName)
          });
        }
      });
    });

    return missingSections;
  }

  // Genera sezioni mancanti con AI
  async generateMissingSections(missingSections, template, onProgress = null) {
    const generatedSections = [];

    for (let i = 0; i < missingSections.length; i++) {
      const sectionInfo = missingSections[i];

      // Notifica progresso
      if (onProgress) {
        onProgress({
          step: 'generating_section',
          section: sectionInfo.type,
          page: sectionInfo.pageType,
          progress: (i / missingSections.length) * 100,
          message: `Generazione sezione ${sectionInfo.type} per la pagina ${sectionInfo.pageTitle}...`
        });
      }

      try {
        // Genera contenuto per la sezione mancante
        const sectionContent = await this.generateSectionContent(
          sectionInfo.type,
          template.companyId || 1,
          sectionInfo.prompt,
          {
            pageTitle: sectionInfo.pageTitle,
            companyName: template.companyName,
            businessSector: template.businessSector
          }
        );

        // Crea la sezione generata
        const generatedSection = {
          type: sectionInfo.type,
          data: sectionContent.data || {},
          aiGeneratedContent: sectionContent,
          generated: true,
          pageType: sectionInfo.pageType
        };

        generatedSections.push(generatedSection);

        // Aggiungi al template
        template.sections.push(generatedSection);

        console.log(`✅ Sezione ${sectionInfo.type} generata con successo per ${sectionInfo.pageTitle}`);

      } catch (error) {
        console.error(`❌ Errore generazione sezione ${sectionInfo.type}:`, error);

        // Crea contenuto fallback anche in caso di errore
        const fallbackContent = this.generateFallbackContent(sectionInfo.type, template.companyName);
        generatedSections.push({
          type: sectionInfo.type,
          data: fallbackContent,
          aiGeneratedContent: fallbackContent,
          fallback: true,
          pageType: sectionInfo.pageType
        });
      }
    }

    return generatedSections;
  }

  // Get descrizione sezione per UI
  getSectionDescription(sectionType, companyName) {
    const descriptions = {
      hero: `Sezione principale con titolo accattivante e call-to-action per ${companyName}`,
      services: `Presentazione dei servizi principali offerti da ${companyName}`,
      about: `Storia e valori aziendali di ${companyName}`,
      testimonial: `Recensioni e feedback dei clienti di ${companyName}`,
      contact: `Informazioni di contatto e modulo per contattare ${companyName}`,
      social: `Link ai social media e presenza online di ${companyName}`,
      gallery: `Galleria visiva dei lavori e prodotti di ${companyName}`
    };
    return descriptions[sectionType] || `Sezione ${sectionType} per ${companyName}`;
  }

  // Get priorità sezione
  getSectionPriority(sectionType) {
    const priorities = {
      hero: 'high',
      services: 'high',
      about: 'medium',
      contact: 'high',
      testimonial: 'medium',
      social: 'low',
      gallery: 'medium'
    };
    return priorities[sectionType] || 'medium';
  }

  // Get prompt per generazione sezione
  getSectionPrompt(sectionType, companyName) {
    const prompts = {
      hero: `Crea una hero section accattivante per ${companyName} con titolo, sottotitolo, call-to-action e suggerimento visivo.`,
      services: `Descrivi i servizi principali offerti da ${companyName}, evidenziando i benefici per i clienti.`,
      about: `Racconta la storia, la missione e i valori di ${companyName} in modo coinvolgente.`,
      testimonial: `Crea recensioni realistiche e positive per ${companyName} che dimostrino la qualità del servizio.`,
      contact: `Crea una sezione contatti professionale per ${companyName} con indirizzo, telefono, email e modulo.`,
      social: `Genera contenuti per la sezione social di ${companyName} con invito a seguire sui social media.`,
      gallery: `Descrivi i servizi principali e i lavori migliori di ${companyName} per una galleria visiva.`
    };
    return prompts[sectionType] || `Crea contenuto per la sezione ${sectionType} di ${companyName}.`;
  }

  // Nuova versione migliorata di createPagesFromAITemplate
  async createPagesFromAITemplateWithAI(template, websiteId, globalStyles = {}, onProgress = null) {
    // 1. Analizza sezioni mancanti
    const missingSections = this.analyzeMissingSections(template);

    if (missingSections.length > 0) {
      console.log(`🔍 Rilevate ${missingSections.length} sezioni mancanti, inizio generazione AI...`);

      // 2. Genera sezioni mancanti
      await this.generateMissingSections(missingSections, template, onProgress);
    }

    // 3. Usa il metodo esistente con le sezioni ora complete
    return this.createPagesFromAITemplate(template, websiteId, globalStyles);
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;