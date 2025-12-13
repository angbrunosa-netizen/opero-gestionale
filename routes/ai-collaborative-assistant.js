/**
 * AI Collaborative Assistant Routes
 * Rotte per assistenza AI collaborativa nella modifica contenuti
 */

const express = require('express');
const router = express.Router();
const { checkPermission } = require('../utils/auth');
const { knex } = require('../config/db');
const axios = require('axios');

// Configurazione API Z.ai
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_ENDPOINT = process.env.ZAI_API_ENDPOINT || 'https://api.z.ai/api/paas/v4';

/**
 * POST /api/ai-collaborative-assistant/section-assist
 * Assistenza AI per modifiche sezioni specifiche
 */
router.post('/section-assist', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { sectionType, currentContent, request, context } = req.body;

    if (!sectionType || !currentContent || !request) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: sectionType, currentContent, request'
      });
    }

    // Costruisci prompt specifico per il tipo di sezione
    const prompt = buildSectionAssistancePrompt(sectionType, currentContent, request, context);

    // Chiama API Z.ai
    const response = await callZAI(prompt);

    // Processa risposta
    const processedResponse = processSectionAssistanceResponse(
      response,
      sectionType,
      currentContent,
      request
    );

    res.json({
      success: true,
      suggestion: processedResponse.suggestion,
      updatedContent: processedResponse.updatedContent,
      confidence: processedResponse.confidence,
      appliedChanges: processedResponse.appliedChanges,
      reasoning: processedResponse.reasoning
    });

  } catch (error) {
    console.error('Errore assistenza sezione:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante assistenza AI: ' + error.message
    });
  }
});

/**
 * POST /api/ai-collaborative-assistant/generate-variations
 * Genera variazioni di contenuto
 */
router.post('/generate-variations', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { sectionType, baseContent, variationType, count = 3, preserveStructure = true } = req.body;

    if (!sectionType || !baseContent || !variationType) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: sectionType, baseContent, variationType'
      });
    }

    const prompt = buildVariationPrompt(sectionType, baseContent, variationType, count, preserveStructure);
    const response = await callZAI(prompt);

    const variations = processVariationsResponse(response, baseContent);

    res.json({
      success: true,
      variations
    });

  } catch (error) {
    console.error('Errore generazione variazioni:', error);
    res.status(500).json({
      success: false,
      error: 'Errore generazione variazioni: ' + error.message
    });
  }
});

/**
 * POST /api/ai-collaborative-assistant/seo-suggestions
 * Suggerimenti SEO per contenuti
 */
router.post('/seo-suggestions', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { content, keywords, targetAudience } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Parametro mancante: content'
      });
    }

    const prompt = buildSEOPrompt(content, keywords, targetAudience);
    const response = await callZAI(prompt);

    const seoSuggestions = processSEOResponse(response);

    res.json({
      success: true,
      ...seoSuggestions
    });

  } catch (error) {
    console.error('Errore suggerimenti SEO:', error);
    res.status(500).json({
      success: false,
      error: 'Errore suggerimenti SEO: ' + error.message
    });
  }
});

/**
 * POST /api/ai-collaborative-assistant/evaluate-content
 * Valuta qualità del contenuto
 */
router.post('/evaluate-content', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { content, sectionType, targetAudience } = req.body;

    if (!content || !sectionType) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: content, sectionType'
      });
    }

    const prompt = buildEvaluationPrompt(content, sectionType, targetAudience);
    const response = await callZAI(prompt);

    const evaluation = processEvaluationResponse(response);

    res.json({
      success: true,
      ...evaluation
    });

  } catch (error) {
    console.error('Errore valutazione contenuto:', error);
    res.status(500).json({
      success: false,
      error: 'Errore valutazione contenuto: ' + error.message
    });
  }
});

/**
 * POST /api/ai-collaborative-assistant/generate-section-template
 * Genera template per nuove sezioni
 */
router.post('/generate-section-template', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { sectionType, companyInfo, theme } = req.body;

    if (!sectionType || !companyInfo) {
      return res.status(400).json({
        success: false,
        error: 'Parametri mancanti: sectionType, companyInfo'
      });
    }

    const prompt = buildTemplatePrompt(sectionType, companyInfo, theme);
    const response = await callZAI(prompt);

    const template = processTemplateResponse(response, sectionType);

    res.json({
      success: true,
      ...template
    });

  } catch (error) {
    console.error('Errore generazione template:', error);
    res.status(500).json({
      success: false,
      error: 'Errore generazione template: ' + error.message
    });
  }
});

/**
 * POST /api/ai-collaborative-assistant/analyze-consistency
 * Analizza coerenza tra sezioni
 */
router.post('/analyze-consistency', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { sections, globalStyle } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        error: 'Parametro mancante o invalido: sections'
      });
    }

    const prompt = buildConsistencyPrompt(sections, globalStyle);
    const response = await callZAI(prompt);

    const analysis = processConsistencyResponse(response);

    res.json({
      success: true,
      ...analysis
    });

  } catch (error) {
    console.error('Errore analisi coerenza:', error);
    res.status(500).json({
      success: false,
      error: 'Errore analisi coerenza: ' + error.message
    });
  }
});

// Funzioni helper

async function callZAI(prompt, temperature = 0.7, maxTokens = 2000) {
  if (!ZAI_API_KEY || ZAI_API_KEY === 'undefined') {
    throw new Error('API Z.ai non configurata');
  }

  const response = await axios.post(`${ZAI_API_ENDPOINT}/chat/completions`, {
    model: 'glm-4.6',
    messages: [
      {
        role: 'system',
        content: `Sei un assistente AI esperto in web design, copywriting e marketing digitale.
        Analizza i contenuti forniti e fornisci suggerimenti professionali e specifici.
        Rispondi sempre in formato JSON valido e strutturato.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature,
    max_tokens: maxTokens
  }, {
    headers: {
      'Authorization': `Bearer ${ZAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

function buildSectionAssistancePrompt(sectionType, content, request, context) {
  return `
Analizza e migliora questo contenuto per una sezione "${sectionType}" di un sito web:

CONTENUTO ATTUALE:
${JSON.stringify(content, null, 2)}

RICHIESTA UTENTE: "${request}"

CONTESTO:
- Tema: ${context.theme || 'default'}
- Stili globali: ${JSON.stringify(context.globalStyles || {}, null, 2)}

Fornisci una risposta JSON con questo formato:
{
  "suggestion": "Spiegazione dettagliata dei miglioramenti suggeriti",
  "updatedContent": { /* contenuto aggiornato con modifiche applicate */ },
  "confidence": 0.9,
  "appliedChanges": [
    {
      "field": "headline",
      "before": "Testo originale",
      "after": "Testo migliorato",
      "reason": "Motivo del cambiamento"
    }
  ],
  "reasoning": "Spiegazione completa della logica dietro i miglioramenti"
}`;
}

function buildVariationPrompt(sectionType, baseContent, variationType, count, preserveStructure) {
  const variationMap = {
    'style': 'diversi stili di scrittura (formale, amichevole, professionale, creativo)',
    'tone': 'diversi toni (entusiasta, serio, umoristico, ispiratore)',
    'structure': 'diverse strutture organizzative',
    'complete': 'variazioni complete e diverse'
  };

  return `
Genera ${count} variazioni di questo contenuto per una sezione "${sectionType}":

CONTENUTO BASE:
${JSON.stringify(baseContent, null, 2)}

TIPO DI VARIAZIONE: ${variationTypeMap[variationType] || variationType}
PRESERVA STRUTTURA: ${preserveStructure}

Fornisci risposta JSON:
{
  "variations": [
    {
      "content": { /* contenuto variante */ },
      "preview": "Breve descrizione dei cambiamenti",
      "changes": ["lista dei cambiamenti principali"],
      "confidence": 0.8,
      "type": "${variationType}"
    }
  ]
}`;
}

function buildSEOPrompt(content, keywords, targetAudience) {
  return `
Analizza questo contenuto per ottimizzazione SEO:

CONTENUTO:
${content}

KEYWORDS TARGET: ${keywords ? keywords.join(', ') : 'Non specificate'}
TARGET AUDIENCE: ${targetAudience || 'Generale'}

Fornisci analisi SEO in formato JSON:
{
  "titleSuggestions": ["titolo1", "titolo2", "titolo3"],
  "metaDescription": "Descrizione meta ottimizzata",
  "keywordOptimizations": [
    {
      "keyword": "keyword",
      "currentDensity": "2%",
      "recommendedDensity": "3%",
      "suggestions": ["suggerimenti"]
    }
  ],
  "readabilityImprovements": ["miglioramenti leggibilità"],
  "contentGaps": ["contenuti mancanti suggeriti"],
  "overallScore": 85
}`;
}

function buildEvaluationPrompt(content, sectionType, targetAudience) {
  return `
Valuta la qualità di questo contenuto per una sezione "${sectionType}":

CONTENUTO:
${content}

TARGET AUDIENCE: ${targetAudience || 'Generale'}

Fornisci valutazione in formato JSON:
{
  "overallScore": 85,
  "clarity": 80,
  "engagement": 75,
  "professionalism": 90,
  "completeness": 70,
  "suggestions": ["suggerimento1", "suggerimento2"],
  "strengths": ["punto di forza1", "punto di forza2"],
  "weaknesses": ["debolezza1", "debolezza2"]
}`;
}

function buildTemplatePrompt(sectionType, companyInfo, theme) {
  return `
Crea un template per una sezione "${sectionType}" basato su queste informazioni aziendali:

INFO AZIENDA:
${JSON.stringify(companyInfo, null, 2)}

TEMA: ${theme || 'professional'}

Fornisci template in formato JSON:
{
  "content": { /* contenuto template completo */ },
  "structure": ["struttura della sezione"],
  "suggestedColors": ["#primary", "#secondary", "#accent"],
  "recommendedImages": ["descrizione immagini consigliate"],
  "copywritingTips": ["consigli copywriting specifici"]
}`;
}

function buildConsistencyPrompt(sections, globalStyle) {
  return `
Analizza la coerenza tra queste sezioni e lo stile globale:

SEZIONI:
${JSON.stringify(sections, null, 2)}

STILE GLOBALE:
${JSON.stringify(globalStyle || {}, null, 2)}

Fornisci analisi in formato JSON:
{
  "overallConsistency": 85,
  "styleIssues": [
    {
      "section": "hero",
      "issue": "colore primario non coerente",
      "suggestion": "suggerimento"
    }
  ],
  "contentGaps": ["contenuti mancanti per coerenza"],
  "toneConsistency": 80,
  "recommendations": ["raccomandazioni per migliorare coerenza"]
}`;
}

function processSectionAssistanceResponse(response, sectionType, currentContent, request) {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Nessuna risposta dall\'AI');
    }

    const parsed = JSON.parse(content);
    return {
      suggestion: parsed.suggestion || 'Ho analizzato il tuo contenuto e suggerito miglioramenti.',
      updatedContent: parsed.updatedContent || currentContent,
      confidence: parsed.confidence || 0.8,
      appliedChanges: parsed.appliedChanges || [],
      reasoning: parsed.reasoning || 'Miglioramenti basati su best practices di web design e copywriting.'
    };
  } catch (error) {
    console.error('Errore processamento risposta AI:', error);
    return {
      suggestion: 'Ho analizzato il contenuto e suggerisco miglioramenti generali.',
      updatedContent: currentContent,
      confidence: 0.5,
      appliedChanges: [],
      reasoning: 'Errore nell\'analisi dettagliata, mantengo il contenuto originale.'
    };
  }
}

function processVariationsResponse(response, baseContent) {
  try {
    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    return parsed.variations || [];
  } catch (error) {
    console.error('Errore processamento variazioni:', error);
    return [];
  }
}

function processSEOResponse(response) {
  try {
    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Errore processamento SEO:', error);
    return {
      titleSuggestions: [],
      metaDescription: '',
      keywordOptimizations: [],
      readabilityImprovements: [],
      contentGaps: [],
      overallScore: 0
    };
  }
}

function processEvaluationResponse(response) {
  try {
    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Errore processamento valutazione:', error);
    return {
      overallScore: 50,
      clarity: 50,
      engagement: 50,
      professionalism: 50,
      completeness: 50,
      suggestions: [],
      strengths: [],
      weaknesses: []
    };
  }
}

function processTemplateResponse(response, sectionType) {
  try {
    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Errore processamento template:', error);
    return {
      content: {},
      structure: [],
      suggestedColors: [],
      recommendedImages: [],
      copywritingTips: []
    };
  }
}

function processConsistencyResponse(response) {
  try {
    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Errore processamento coerenza:', error);
    return {
      overallConsistency: 70,
      styleIssues: [],
      contentGaps: [],
      toneConsistency: 70,
      recommendations: []
    };
  }
}

module.exports = router;