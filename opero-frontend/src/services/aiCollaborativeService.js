/**
 * AI Collaborative Service
 * Servizio per assistenza AI collaborativa nella modifica dei contenuti
 */

import { api } from './api';

class AICollaborativeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minuti cache per suggerimenti
  }

  // Cache management
  getCacheKey(type, content, request) {
    const key = `${type}-${JSON.stringify(content)}-${request}`;
    return btoa(key).substring(0, 20); // Limit key length
  }

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

  // Richiedi assistenza AI per una sezione specifica
  async requestSectionAssistance({ sectionType, currentContent, request, context }) {
    try {
      const cacheKey = this.getCacheKey(sectionType, currentContent, request);
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await api.post('/ai-collaborative-assistant/section-assist', {
        sectionType,
        currentContent,
        request,
        context: {
          theme: context.theme || 'default',
          globalStyles: context.globalStyles || {},
          sectionId: context.sectionId,
          websiteId: context.websiteId
        }
      });

      const result = {
        suggestion: response.data.suggestion,
        updatedContent: response.data.updatedContent,
        confidence: response.data.confidence || 0.8,
        appliedChanges: response.data.appliedChanges || [],
        reasoning: response.data.reasoning || ''
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Errore assistenza AI:', error);
      throw new Error('Impossibile ottenere assistenza AI: ' + (error.response?.data?.message || error.message));
    }
  }

  // Genera variazioni di contenuto
  async generateContentVariations({ sectionType, baseContent, variationType, count = 3 }) {
    try {
      const response = await api.post('/ai-collaborative-assistant/generate-variations', {
        sectionType,
        baseContent,
        variationType, // 'style', 'tone', 'structure', 'complete'
        count,
        preserveStructure: true
      });

      return response.data.variations.map((variation, index) => ({
        id: `variation_${index}`,
        content: variation.content,
        preview: variation.preview,
        changes: variation.changes,
        confidence: variation.confidence,
        type: variation.type
      }));

    } catch (error) {
      console.error('Errore generazione variazioni:', error);
      throw new Error('Impossibile generare variazioni: ' + (error.response?.data?.message || error.message));
    }
  }

  // Suggerisci miglioramenti SEO
  async suggestSEOImprovements({ content, keywords, targetAudience }) {
    try {
      const response = await api.post('/ai-collaborative-assistant/seo-suggestions', {
        content,
        keywords,
        targetAudience
      });

      return {
        titleSuggestions: response.data.titleSuggestions || [],
        metaDescription: response.data.metaDescription,
        keywordOptimizations: response.data.keywordOptimizations || [],
        readabilityImprovements: response.data.readabilityImprovements || [],
        contentGaps: response.data.contentGaps || [],
        overallScore: response.data.overallScore || 0
      };

    } catch (error) {
      console.error('Errore suggerimenti SEO:', error);
      throw new Error('Impossibile generare suggerimenti SEO: ' + (error.response?.data?.message || error.message));
    }
  }

  // Valuta la qualità del contenuto
  async evaluateContentQuality({ content, sectionType, targetAudience }) {
    try {
      const response = await api.post('/ai-collaborative-assistant/evaluate-content', {
        content,
        sectionType,
        targetAudience
      });

      return {
        overallScore: response.data.overallScore || 0,
        clarity: response.data.clarity || 0,
        engagement: response.data.engagement || 0,
        professionalism: response.data.professionalism || 0,
        completeness: response.data.completeness || 0,
        suggestions: response.data.suggestions || [],
        strengths: response.data.strengths || [],
        weaknesses: response.data.weaknesses || []
      };

    } catch (error) {
      console.error('Errore valutazione contenuto:', error);
      throw new Error('Impossibile valutare il contenuto: ' + (error.response?.data?.message || error.message));
    }
  }

  // Ottieni suggerimenti contestuali rapidi
  getQuickSuggestions(sectionType, activeField) {
    const suggestions = {
      hero: {
        headline: [
          "Rendi il titolo più diretto e conciso",
          "Aggiungi benefici specifici",
          "Usa parole più potenti",
          "Includi il target nel titolo"
        ],
        subheadline: [
          "Spiega meglio il valore offerto",
          "Aggiungi statistiche o dati",
          "Rendi più personale il messaggio",
          "Includi prova sociale"
        ],
        ctaText: [
          "Usa verbi di azione più forti",
          "Aggiungi urgenza o esclusività",
          "Rendi più specifica l'azione",
          "Abbrevia e rendi più diretto"
        ]
      },
      services: {
        title: [
          "Rendi il titolo più accattivante",
          "Includi il beneficio principale",
          "Usa numeri per evidenziare",
          "Fai una domanda provocatoria"
        ],
        'services.*.title': [
          "Rendi più specifico il servizio",
          "Includi il risultato principale",
          "Usa un linguaggio più professionale",
          "Aggiungi aggettivi qualificanti"
        ],
        'services.*.description': [
          "Espandi con esempi pratici",
          "Quantifica i benefici",
          "Rendi più persuasivo",
          "Includi casi di successo"
        ]
      },
      about: {
        title: [
          "Rendi più personale il titolo",
          "Includi la storia aziendale",
          "Evidenzia i valori",
          "Usa un approccio storytellare"
        ],
        description: [
          "Aggiungi dati concreti",
          "Includi la mission e vision",
          "Racconta la storia della crescita",
          "Evidenzia i punti di forza unici"
        ]
      },
      contact: {
        title: [
          "Rendi più invitante il titolo",
          "Includi call-to-action",
          "Aggiungi orari di disponibilità",
          "Usa un tono più accogliente"
        ]
      }
    };

    return suggestions[sectionType]?.[activeField] || [
      "Migliora la chiarezza del testo",
      "Rendi più professionale il linguaggio",
      "Aggiungi dettagli specifici",
      "Ottimizza per il target audience"
    ];
  }

  // Genera template base per nuove sezioni
  async generateSectionTemplate({ sectionType, companyInfo, theme }) {
    try {
      const response = await api.post('/ai-collaborative-assistant/generate-section-template', {
        sectionType,
        companyInfo,
        theme
      });

      return {
        content: response.data.content,
        structure: response.data.structure,
        suggestedColors: response.data.suggestedColors,
        recommendedImages: response.data.recommendedImages,
        copywritingTips: response.data.copywritingTips
      };

    } catch (error) {
      console.error('Errore generazione template:', error);
      throw new Error('Impossibile generare template: ' + (error.response?.data?.message || error.message));
    }
  }

  // Analizza la coerenza tra sezioni
  async analyzeConsistency({ sections, globalStyle }) {
    try {
      const response = await api.post('/ai-collaborative-assistant/analyze-consistency', {
        sections,
        globalStyle
      });

      return {
        overallConsistency: response.data.overallConsistency || 0,
        styleIssues: response.data.styleIssues || [],
        contentGaps: response.data.contentGaps || [],
        toneConsistency: response.data.toneConsistency || 0,
        recommendations: response.data.recommendations || []
      };

    } catch (error) {
      console.error('Errore analisi coerenza:', error);
      throw new Error('Impossibile analizzare coerenza: ' + (error.response?.data?.message || error.message));
    }
  }

  // Pulisci cache
  clearCache() {
    this.cache.clear();
  }

  // Statistiche utilizzo
  getUsageStats() {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0 // Da implementare con contatori
    };
  }
}

export default new AICollaborativeService();