/**
 * AI-Enhanced Website Builder API Routes
 * Estensione delle API esistenti per supporto AI integration
 * Mantiene retrocompatibilità con sistema esistente
 */

const express = require('express');
const router = express.Router();
const { checkPermission } = require('../utils/auth');
const { knex } = require('../config/db');
const axios = require('axios');
const crypto = require('crypto');

// Configurazione API Z.ai
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_ENDPOINT = process.env.ZAI_API_ENDPOINT || 'https://api.z.ai/api/paas/v4';

/**
 * POST /api/ai-enhanced-website/analyze-company
 * Analisi AI dell'azienda per suggerimenti template e contenuti
 */
router.post('/analyze-company', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { companyId, includeIndustryAnalysis = true, includeContentSuggestions = true } = req.body;

    // 1. Recupera dati aziendali completi
    const company = await knex('ditte').where({ id: companyId }).first();
    if (!company) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    // 2. Recupera prodotti/servizi se disponibili
    const products = await knex('ct_catalogo')
      .where({ id_ditta: companyId, visibile_sito: true })
      .limit(10);

    // 3. Recupera immagini aziendali
    const images = await knex('dm_files')
      .where({ id_ditta: companyId, visibile_sito: true })
      .limit(20);

    // 4. Crea contesto per AI
    const companyContext = {
      name: company.ragione_sociale,
      description: company.descrizione || '',
      sector: company.settore || 'Generale',
      city: company.citta || '',
      products: products.map(p => ({
        name: p.descrizione,
        description: p.descrizione.substring(0, 100) + '...',
        category: p.tipo_entita || 'Prodotto/Servizio'
      })),
      imageCount: images.length,
      hasProducts: products.length > 0,
      companySize: products.length > 5 ? 'media' : products.length > 0 ? 'piccola' : 'micro'
    };

    // 5. Analisi AI (con fallback)
    let aiAnalysis = null;
    let aiPrompt = '';

    try {
      aiPrompt = `
        Analizza questa azienda e fornisci suggerimenti per un sito web professionale:

        Nome: ${companyContext.name}
        Descrizione: ${companyContext.description}
        Settore: ${companyContext.sector}
        Città: ${companyContext.city}
        Prodotti: ${companyContext.products.map(p => p.name).join(', ')}

        Fornisci una risposta JSON con:
        {
          "industry": "Settore specifico",
          "recommendedPages": ["Home", "Chi Siamo", "Servizi", "Contatti"],
          "contentStyle": "Professionale|Moderno|Creativo|Tecnologico",
          "primaryColor": "#hexcode",
          "targetAudience": "B2B|B2C|Mixed",
          "keyDifferentiators": ["punto1", "punto2"],
          "contentTone": "Formale|Amichevole|Tecnico",
          "seoKeywords": ["keyword1", "keyword2"]
        }
      `;

      // Verifica se API key è configurata
      if (!ZAI_API_KEY || ZAI_API_KEY === 'undefined' || ZAI_API_KEY.trim() === '') {
        throw new Error('API Z.ai non configurata. Impostare ZAI_API_KEY nel file .env');
      }

      const response = await axios.post(`${ZAI_API_ENDPOINT}/chat/completions`, {
        model: 'glm-4.6',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di web design e marketing digitale. Analizza aziende e fornisci suggerimenti professionali per la creazione di siti web efficaci. Rispondi in formato JSON valido.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${ZAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      aiAnalysis = JSON.parse(response.data.choices[0].message.content);

    } catch (error) {
      console.error('Errore analisi AI:', error);
      // Fallback analysis
      aiAnalysis = {
        industry: companyContext.sector || 'Generale',
        recommendedPages: ['Home', 'Chi Siamo', 'Contatti'].concat(
          companyContext.hasProducts ? ['Prodotti'] : []
        ),
        contentStyle: companyContext.companySize === 'media' ? 'Professionale' : 'Moderno',
        primaryColor: '#3B82F6',
        targetAudience: 'B2C',
        keyDifferentiators: [],
        contentTone: 'Amichevole',
        seoKeywords: [companyContext.name.toLowerCase().replace(/\s+/g, '-')]
      };
    }

    // 6. Suggerimenti template basati su analisi
    const templateSuggestions = generateTemplateSuggestions(aiAnalysis, companyContext);

    // 7. Salva in cache per uso futuro
    const contextHash = crypto.createHash('md5')
      .update(JSON.stringify(companyContext))
      .digest('hex');

    await knex('ai_content_cache').insert({
      context_hash: contextHash,
      id_ditta: companyId,
      page_type: 'company_analysis',
      industry: aiAnalysis.industry,
      ai_prompt: aiPrompt,
      generated_content: aiAnalysis,
      ai_metadata: {
        analyzed_at: new Date().toISOString(),
        model: 'z-ai-web-analyzer',
        confidence: 0.85
      },
      confidence_score: 0.85,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ore
    }).onConflict('context_hash').merge();

    res.json({
      success: true,
      analysis: aiAnalysis,
      companyContext,
      templateSuggestions,
      contextHash
    });

  } catch (error) {
    console.error('Errore analisi azienda:', error);
    res.status(500).json({ error: 'Errore nell\'analisi aziendale' });
  }
});

/**
 * POST /api/ai-enhanced-website/generate-section-content
 * Genera contenuto AI per sezione specifica
 */
router.post('/generate-section-content', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const {
      sectionType,
      companyId,
      sectionIndex,
      totalSections,
      customPrompt = '',
      sectionData = {},
      companyContext
    } = req.body;

    // 1. Recupera context cache se disponibile
    let context = companyContext;
    if (!context) {
      const cachedContext = await knex('ai_content_cache')
        .where({ id_ditta: companyId, page_type: 'company_analysis' })
        .first();

      if (cachedContext) {
        context = cachedContext.generated_content;
      }
    }

    // 2. Genera contenuto sezione specifico
    const sectionPrompts = {
      hero: `Crea una sezione hero per l'azienda ${context?.name}. Include titolo accattivante, sottotitolo descrittivo e call-to-action.`,
      services: `Crea una sezione servizi per ${context?.name}. Elenca 3-5 servizi principali con brevi descrizioni.`,
      products: `Crea una sezione prodotti per ${context?.name}. Mostra i prodotti in modo accattivante.`,
      about: `Crea una sezione "Chi Siamo" per ${context?.name}. Includi storia, missione e valori.`,
      contact: `Crea una sezione contatti per ${context?.name}. Includi modulo, indirizzo e contatti.`,
      gallery: `Suggerisci layout e didascalie per galleria immagini di ${context?.name}.`,
      testimonial: `Crea una sezione testimonial per ${context?.name}.`,
      cta: `Crea una call-to-action finale per ${context?.name}.`
    };

    const basePrompt = sectionPrompts[sectionType] || sectionPrompts.hero;
    const fullPrompt = `
      ${basePrompt}

      Contesto aziendale:
      Nome: ${context?.name || 'Azienda'}
      Settore: ${context?.industry || context?.sector || 'Generale'}
      Stile: ${context?.contentStyle || 'Professionale'}
      Target: ${context?.targetAudience || 'B2C'}

      ${customPrompt ? `Richiesta aggiuntiva: ${customPrompt}` : ''}

      Fornisci risposta JSON con:
      {
        "title": "Titolo sezione",
        "subtitle": "Sottotitolo",
        "content": "Contenuto HTML",
        "seo": {
          "title": "SEO title",
          "description": "SEO description",
          "keywords": ["keyword1", "keyword2"]
        },
        "images": {
          "suggestions": ["descrizione immagine 1", "descrizione immagine 2"],
          "altTexts": ["alt text 1", "alt text 2"]
        },
        "callToAction": {
          "text": "Testo bottone",
          "url": "#contact"
        }
      }
    `;

    // 3. Controlla cache per contenuti simili
    const cacheKey = crypto.createHash('md5')
      .update(fullPrompt)
      .digest('hex');

    const cachedContent = await knex('ai_content_cache')
      .where({ context_hash: cacheKey })
      .first();

    if (cachedContent) {
      return res.json({
        success: true,
        content: cachedContent.generated_content,
        cached: true,
        confidence: cachedContent.confidence_score
      });
    }

    // 4. Genera nuovo contenuto AI
    let generatedContent = null;
    try {
      // Verifica se API key è configurata
      if (!ZAI_API_KEY || ZAI_API_KEY === 'undefined' || ZAI_API_KEY.trim() === '') {
        throw new Error('API Z.ai non configurata. Impostare ZAI_API_KEY nel file .env');
      }

      const response = await axios.post(`${ZAI_API_ENDPOINT}/chat/completions`, {
        model: 'glm-4.6',
        messages: [
          {
            role: 'system',
            content: 'Sei un copywriter professionista specializzato nella creazione di contenuti per siti web. Crea contenuti accattivanti, professionali e ottimizzati per SEO. Rispondi in formato JSON valido.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${ZAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      generatedContent = JSON.parse(response.data.choices[0].message.content);

    } catch (error) {
      console.error('Errore generazione contenuto AI:', error);
      // Fallback content
      generatedContent = generateFallbackContent(sectionType, context);
    }

    // 5. Salva in cache
    await knex('ai_content_cache').insert({
      context_hash: cacheKey,
      id_ditta: companyId,
      page_type: sectionType,
      industry: context?.industry,
      ai_prompt: fullPrompt,
      generated_content: generatedContent,
      ai_metadata: {
        generated_at: new Date().toISOString(),
        model: 'z-ai-content',
        section_type: sectionType,
        section_index: sectionIndex
      },
      confidence_score: 0.8,
      usage_count: 0,
      expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 ore
    }).onConflict('context_hash').merge();

    res.json({
      success: true,
      content: generatedContent,
      cached: false,
      confidence: 0.8,
      suggestions: generateSectionSuggestions(sectionType, generatedContent, context)
    });

  } catch (error) {
    console.error('Errore generazione sezione:', error);
    res.status(500).json({ error: 'Errore nella generazione del contenuto' });
  }
});

/**
 * POST /api/ai-enhanced-website/enhance-company-data
 * Enhances company data with AI insights
 */
router.post('/enhance-company-data', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { companyId } = req.body;

    // 1. Recupera dati base
    const company = await knex('ditte').where({ id: companyId }).first();
    if (!company) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    // 2. Analisi rapida AI
    const insights = {
      priority: 'medium', // basso/medio/alto
      complexity: 'standard', // semplice/standard/complesso
      recommendedFeatures: ['contact-form', 'gallery'],
      estimatedTime: '2-3 ore',
      contentGaps: [],
      strengths: [company.ragione_sociale ? 'Brand definito' : 'Nome da definire']
    };

    // 3. Template recommendation
    const recommendedTemplate = company.settore?.toLowerCase().includes('servizi')
      ? 'business-landing'
      : company.settore?.toLowerCase().includes('negozio')
      ? 'local-business'
      : 'business-landing';

    // 4. Match score
    const matchScore = 0.75 + (company.descrizione ? 0.15 : 0) + (company.citta ? 0.1 : 0);

    res.json({
      success: true,
      insights,
      recommendedTemplate,
      matchScore
    });

  } catch (error) {
    console.error('Errore enhancement dati azienda:', error);
    res.status(500).json({ error: 'Errore nell\'enhancement dei dati' });
  }
});

// Helper functions

function generateTemplateSuggestions(analysis, companyContext) {
  const suggestions = [];

  // Business Landing
  suggestions.push({
    name: 'Business Landing',
    id: 'business-landing',
    reason: 'Ideale per aziende professionali con presentazione servizi',
    matchScore: analysis.contentStyle === 'Professionale' ? 0.9 : 0.7,
    sections: ['hero', 'services', 'about', 'contact']
  });

  // Local Business
  suggestions.push({
    name: 'Attività Locale',
    id: 'local-business',
    reason: companyContext.city ? 'Perfetto per attività con sede fisica' : 'Adatto a business locali',
    matchScore: companyContext.city ? 0.8 : 0.6,
    sections: ['hero', 'about', 'map', 'contact']
  });

  // Portfolio
  suggestions.push({
    name: 'Portfolio Creativo',
    id: 'portfolio',
    reason: companyContext.imageCount > 5 ? 'Ottimo per mostrare lavori con immagini' : 'Per aziende creative',
    matchScore: companyContext.imageCount > 5 ? 0.8 : 0.5,
    sections: ['hero', 'gallery', 'about', 'contact']
  });

  // Ordina per match score
  return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}

function generateFallbackContent(sectionType, context) {
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

function generateSectionSuggestions(sectionType, content, context) {
  const suggestions = [];

  if (sectionType === 'hero') {
    suggestions.push('Aggiungi un video di sfondo per maggior impatto');
    suggestions.push('Includi statistiche o numeri chiave');
  }

  if (sectionType === 'services' && context?.products?.length > 0) {
    suggestions.push('Aggiungi icone personalizzate per ogni servizio');
    suggestions.push('Includi prezzi o richiedi preventivo');
  }

  if (sectionType === 'about') {
    suggestions.push('Aggiungi foto del team o dell\'ufficio');
    suggestions.push('Includi timeline aziendale');
  }

  return suggestions;
}

/**
 * POST /api/ai-enhanced-website/generate-global-styles
 * Genera stili globali AI basati su template e analisi aziendale
 */
router.post('/generate-global-styles', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const {
      templateId,
      templateName,
      templateDescription,
      companyId,
      customPrompt = '',
      industry = '',
      businessType = ''
    } = req.body;

    // 1. Recupera dati aziendali
    const company = await knex('ditte').where({ id: companyId }).first();
    if (!company) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    // 2. Analizza prodotti/servizi
    const products = await knex('ct_catalogo')
      .where({ id_ditta: companyId, visibile_sito: true })
      .limit(5);

    // 3. Crea contesto per generazione stili
    const companyContext = {
      name: company.ragione_sociale,
      description: company.descrizione || '',
      sector: company.settore || industry,
      city: company.citta || '',
      businessType: businessType || (company.settore?.toLowerCase().includes('servizi') ? 'service' : 'product'),
      hasProducts: products.length > 0,
      productCount: products.length,
      isModern: templateName?.toLowerCase().includes('modern') || templateName?.toLowerCase().includes('contemporaneo'),
      isCreative: templateName?.toLowerCase().includes('creative') || templateName?.toLowerCase().includes('portfolio'),
      isProfessional: templateName?.toLowerCase().includes('business') || templateName?.toLowerCase().includes('corporate'),
      isLocal: templateName?.toLowerCase().includes('local') || templateName?.toLowerCase().includes('negozio')
    };

    // 4. Genera prompt per stili basato su template
    const stylePrompt = `
      Sei un esperto designer e brand strategist. Analizza questo contesto e genera uno stile globale professionale per un sito web:

      CONTESTO AZIENDA:
      Nome: ${companyContext.name}
      Settore: ${companyContext.sector}
      Descrizione: ${companyContext.description}
      Città: ${companyContext.city}
      Tipo Business: ${companyContext.businessType}
      Prodotti: ${companyContext.productCount} prodotti/servizi disponibili

      TEMPLATE SCELTO:
      Nome: ${templateName}
      Descrizione: ${templateDescription}

      GENERA UNO STILE COMPLETO IN FORMATO JSON con queste sezioni:
      {
        "background": {
          "type": "color|gradient|image",
          "color": "#hexcode",
          "gradient": "linear-gradient(...)",
          "image": "description immagine suggerita"
        },
        "typography": {
          "fontFamily": "Inter|Roboto|Montserrat|Playfair Display|Oswald|Lato",
          "fontSize": "14|16|18|20",
          "fontColor": "#hexcode",
          "headingFont": "font per titoli",
          "headingColor": "#hexcode"
        },
        "colors": {
          "primary": "#hexcode",
          "secondary": "#hexcode",
          "accent": "#hexcode",
          "buttonBackground": "#hexcode",
          "buttonText": "#hexcode",
          "link": "#hexcode"
        },
        "layout": {
          "containerMaxWidth": "100%|1200px|1024px|768px",
          "paddingTop": "40px|60px|80px",
          "paddingBottom": "40px|60px|80px"
        },
        "customCss": "breve CSS personalizzato se necessario",
        "styleRationale": "spiegazione delle scelte stilistiche (2-3 frasi)"
      }

      CONSIGLI STILE:
      - Business/Corporate: colori blu/grigio, font professional, layout pulito
      - Creative/Portfolio: colori vivaci, font moderni, layout dinamico
      - Local/Negozio: colori caldi/accoglienti, font leggibili, layout user-friendly
      - Modern/Tech: colori audaci, font geometrici, layout minimalista
      - Servizi: colori professionali, font puliti, layout organizzato

      ${customPrompt ? `RICHIESTA SPECIFICA: ${customPrompt}` : ''}
    `;

    // 5. Genera stili con AI
    let generatedStyles = null;
    try {
      if (!ZAI_API_KEY || ZAI_API_KEY === 'undefined' || ZAI_API_KEY.trim() === '') {
        throw new Error('API Z.ai non configurata');
      }

      const response = await axios.post(`${ZAI_API_ENDPOINT}/chat/completions`, {
        model: 'glm-4.6',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto web designer e brand strategist specializzato nella creazione di stili visivi coerenti. Analizza il contesto fornito e genera stili professionali in formato JSON valido. I colori devono essere armoniosi e i font appropriati per il tipo di business.'
          },
          {
            role: 'user',
            content: stylePrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${ZAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      generatedStyles = JSON.parse(response.data.choices[0].message.content);

    } catch (error) {
      console.error('Errore generazione stili AI:', error);

      // Fallback basato su template
      generatedStyles = generateFallbackStyles(templateName, companyContext);
    }

    // 6. Aggiungi metadati
    generatedStyles.metadata = {
      generatedAt: new Date().toISOString(),
      templateId,
      templateName,
      companyId,
      aiModel: 'glm-4.6',
      confidence: 0.85
    };

    // 7. Salva in cache per uso futuro
    const cacheKey = crypto.createHash('md5')
      .update(`${templateId}-${companyId}-${customPrompt}`)
      .digest('hex');

    try {
      // Tenta inserimento con upsert compatibile
      await knex.raw(`
        INSERT INTO ai_content_cache (
          context_hash, id_ditta, page_type, industry, ai_prompt,
          generated_content, ai_metadata, confidence_score, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          generated_content = VALUES(generated_content),
          ai_metadata = VALUES(ai_metadata),
          confidence_score = VALUES(confidence_score),
          updated_at = NOW()
      `, [
        cacheKey,
        companyId,
        'global_styles',
        companyContext.sector,
        stylePrompt,
        JSON.stringify(generatedStyles),
        JSON.stringify({
          template_id: templateId,
          template_name: templateName,
          model: 'glm-4.6',
          confidence: 0.85
        }),
        0.85,
        new Date(Date.now() + 24 * 60 * 60 * 1000)
      ]);
    } catch (cacheError) {
      console.warn('Errore salvataggio cache (non critico):', cacheError.message);
      // Continua anche se il cache fallisce
    }

    res.json({
      success: true,
      styles: generatedStyles,
      companyContext,
      templateAnalysis: {
        name: templateName,
        type: getTemplateType(templateName),
        recommendedApproach: getStyleApproach(companyContext, templateName)
      },
      cacheKey
    });

  } catch (error) {
    console.error('Errore generazione stili globali:', error);
    res.status(500).json({ error: 'Errore nella generazione degli stili globali' });
  }
});

function getTemplateType(templateName) {
  const name = (templateName || '').toLowerCase();
  if (name.includes('business') || name.includes('corporate')) return 'professional';
  if (name.includes('creative') || name.includes('portfolio')) return 'creative';
  if (name.includes('local') || name.includes('negozio')) return 'local';
  if (name.includes('modern') || name.includes('tech')) return 'modern';
  return 'standard';
}

function getStyleApproach(companyContext, templateName) {
  const approaches = [];

  if (companyContext.isProfessional) approaches.push('Corporate colors (blu, grigio)');
  if (companyContext.isCreative) approaches.push('Colori audaci e font moderni');
  if (companyContext.isLocal) approaches.push('Toni caldi e design accogliente');
  if (companyContext.hasProducts) approaches.push('Layout focalizzato su prodotti');
  if (companyContext.businessType === 'service') approaches.push('Design pulito e professionale');

  return approaches.slice(0, 3);
}

function generateFallbackStyles(templateName, companyContext) {
  const templateType = getTemplateType(templateName);

  const baseStyles = {
    business: {
      background: { type: 'color', color: '#ffffff' },
      typography: { fontFamily: 'Inter', fontSize: '16', fontColor: '#1f2937', headingFont: 'Inter', headingColor: '#111827' },
      colors: { primary: '#2563eb', secondary: '#64748b', accent: '#3b82f6', buttonBackground: '#2563eb', buttonText: '#ffffff', link: '#1d4ed8' },
      layout: { containerMaxWidth: '1200px', paddingTop: '60px', paddingBottom: '60px' },
      customCss: '',
      styleRationale: 'Stile professionale e pulito per aziende corporate'
    },
    creative: {
      background: { type: 'gradient', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      typography: { fontFamily: 'Montserrat', fontSize: '16', fontColor: '#1a1a1a', headingFont: 'Playfair Display', headingColor: '#000000' },
      colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#f59e0b', buttonBackground: '#8b5cf6', buttonText: '#ffffff', link: '#7c3aed' },
      layout: { containerMaxWidth: '1200px', paddingTop: '80px', paddingBottom: '80px' },
      customCss: 'font-weight: 500;',
      styleRationale: 'Stile creativo e dinamico per portfolio e agency'
    },
    local: {
      background: { type: 'color', color: '#fef3c7' },
      typography: { fontFamily: 'Lato', fontSize: '16', fontColor: '#374151', headingFont: 'Oswald', headingColor: '#1f2937' },
      colors: { primary: '#f59e0b', secondary: '#10b981', accent: '#ef4444', buttonBackground: '#f59e0b', buttonText: '#ffffff', link: '#d97706' },
      layout: { containerMaxWidth: '1024px', paddingTop: '60px', paddingBottom: '60px' },
      customCss: 'border-radius: 8px;',
      styleRationale: 'Stile accogliente e caldo per attività locali'
    },
    modern: {
      background: { type: 'gradient', gradient: 'linear-gradient(45deg, #1e40af 0%, #3b82f6 100%)' },
      typography: { fontFamily: 'Roboto', fontSize: '16', fontColor: '#f3f4f6', headingFont: 'Oswald', headingColor: '#ffffff' },
      colors: { primary: '#3b82f6', secondary: '#6366f1', accent: '#f59e0b', buttonBackground: '#f59e0b', buttonText: '#000000', link: '#60a5fa' },
      layout: { containerMaxWidth: '100%', paddingTop: '40px', paddingBottom: '40px' },
      customCss: 'backdrop-filter: blur(10px);',
      styleRationale: 'Stile moderno e tecnologico per startup tech'
    }
  };

  return baseStyles[templateType] || baseStyles.business;
}

module.exports = router;