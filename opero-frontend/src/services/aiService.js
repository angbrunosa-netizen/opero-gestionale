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
      const enhancedSections = await Promise.all(
        template.sections.map(async (section, index) => {
          if (progressCallback) {
            progressCallback((index / template.sections.length) * 100);
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
        progressCallback(100);
      }

      return {
        ...template,
        sections: enhancedSections,
        aiGenerated: true,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          confidence: enhancedSections.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / enhancedSections.length,
          prompt: customPrompt
        }
      };
    } catch (error) {
      console.error('Errore generazione template AI:', error);
      throw error;
    }
  }

  // Crea pagine da template AI-enhanced
  async createPagesFromAITemplate(template, websiteId, globalStyles = {}) {
    const pages = [];

    for (let i = 0; i < template.sections.length; i++) {
      const section = template.sections[i];

      const pageData = {
        slug: section.slug || `page-${i + 1}`,
        titolo: section.aiGeneratedContent?.title || section.title || `Pagina ${i + 1}`,
        contenuto_json: JSON.stringify({
          sections: [section],
          template_type: template.id,
          ai_enhanced: true
        }),
        contenuto_html: section.aiGeneratedContent?.content || '<p>Contenuto generato dall\'AI</p>',
        meta_title: section.aiGeneratedContent?.seo?.title || `${section.title} - Website`,
        meta_description: section.aiGeneratedContent?.seo?.description || section.aiGeneratedContent?.subtitle || '',
        is_published: false,
        menu_order: i,
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
        ai_generation_prompt: section.aiGeneratedContent?.prompt || '',
        ai_confidence_score: section.aiConfidence,
        ai_content_sections: JSON.stringify([section.aiGeneratedContent]),
        ai_enhancements: JSON.stringify({}),
        ai_seo_metadata: JSON.stringify(section.aiGeneratedContent?.seo || {}),
        ai_optimized_for_mobile: true
      };

      pages.push(pageData);
    }

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
}

// Export singleton instance
const aiService = new AIService();
export default aiService;