/**
 * AI-Enhanced Website Builder
 * Componente che estende WebsiteBuilderUNIFIED con capacità AI generation
 * Mantiene retrocompatibilità con sistema esistente
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  SparklesIcon,
  CpuChipIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Import componenti esistenti
import WebsiteBuilderUNIFIED from './WebsiteBuilderUNIFIED';

// Import API
import { api } from '../services/api';

const AIEnhancedWebsiteBuilder = ({
  initialCompanyId,
  mode = 'hybrid', // 'ai-first', 'hybrid', 'manual'
  ...props
}) => {
  // Stati principali
  const [activeMode, setActiveMode] = useState(mode);
  const [companyData, setCompanyData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Stati per generazione AI
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPages, setGeneratedPages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Stati UI
  const [showAIModal, setShowAIModal] = useState(false);
  const [currentStep, setCurrentStep] = useState('company-selection');

  // Effetto iniziale per caricare dati
  useEffect(() => {
    if (initialCompanyId) {
      loadCompanyData(initialCompanyId);
    }
  }, [initialCompanyId]);

  // Carica dati aziendali con analisi AI
  const loadCompanyData = async (companyId) => {
    try {
      setIsAnalyzing(true);

      // 1. Carica dati base azienda
      const response = await api.get(`/website/by-company/${companyId}`);
      if (response.data.success) {
        setCompanyData(response.data.website);
        setSelectedCompany(response.data.website);
      }

      // 2. Analizza con AI se in modalità AI
      if (activeMode !== 'manual') {
        await performAIAnalysis(response.data.website);
      }

    } catch (error) {
      console.error('Errore caricamento dati azienda:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analisi AI dell'azienda
  const performAIAnalysis = async (company) => {
    try {
      setIsAnalyzing(true);

      const analysisResponse = await api.post('/ai-website-builder/analyze-company', {
        companyId: company.id_ditta,
        includeIndustryAnalysis: true,
        includeCompetitorAnalysis: false, // opzionale
        includeContentSuggestions: true
      });

      if (analysisResponse.data.success) {
        setAiAnalysis(analysisResponse.data.analysis);
        setAiSuggestions(analysisResponse.data.templateSuggestions || []);
      }

    } catch (error) {
      console.error('Errore analisi AI:', error);
      // Fallback: analisi base senza AI
      setAiAnalysis({
        industry: company.ragione_sociale ? 'Generale' : 'Sconosciuto',
        recommendedPages: ['Home', 'Chi Siamo', 'Contatti'],
        contentStyle: 'Professionale'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Selezione ditte con enhancement AI
  const handleCompanySelection = async () => {
    try {
      const response = await api.get('/website/eligible-companies');
      const companies = response.data.companies || [];

      // Se in modalità AI, ottieni suggerimenti
      if (activeMode !== 'manual') {
        const enhancedCompanies = await Promise.all(
          companies.map(async (company) => {
            try {
              const aiEnhanceResponse = await api.post('/ai-website-builder/enhance-company-data', {
                companyId: company.id
              });

              return {
                ...company,
                aiInsights: aiEnhanceResponse.data.insights || null,
                recommendedTemplate: aiEnhanceResponse.data.recommendedTemplate || null,
                matchScore: aiEnhanceResponse.data.matchScore || 0
              };
            } catch (error) {
              return { ...company, aiInsights: null };
            }
          })
        );

        // Ordina per match score se disponibile
        enhancedCompanies.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

        return enhancedCompanies;
      }

      return companies;

    } catch (error) {
      console.error('Errore caricamento ditte:', error);
      return [];
    }
  };

  // Generazione contenuto AI per template
  const generateAIContent = async (template, customPrompt = '') => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Genera contenuto per ogni sezione del template
      const enhancedSections = await Promise.all(
        template.sections.map(async (section, index) => {
          setGenerationProgress((index / template.sections.length) * 100);

          const contentResponse = await api.post('/ai-website-builder/generate-section-content', {
            sectionType: section.type,
            companyId: companyData.id_ditta,
            sectionIndex: index,
            totalSections: template.sections.length,
            customPrompt,
            sectionData: section.data,
            companyContext: aiAnalysis
          });

          return {
            ...section,
            aiGeneratedContent: contentResponse.data.content,
            aiConfidence: contentResponse.data.confidence || 0.8,
            aiSuggestions: contentResponse.data.suggestions || []
          };
        })
      );

      setGenerationProgress(100);

      // Crea template con contenuti AI
      const aiEnhancedTemplate = {
        ...template,
        sections: enhancedSections,
        aiGenerated: true,
        aiMetadata: {
          generatedAt: new Date().toISOString(),
          confidence: enhancedSections.reduce((acc, s) => acc + (s.aiConfidence || 0), 0) / enhancedSections.length,
          prompt: customPrompt
        }
      };

      setSelectedTemplate(aiEnhancedTemplate);

      // Genera pagine complete
      const pages = await generatePagesFromTemplate(aiEnhancedTemplate);
      setGeneratedPages(pages);

      return aiEnhancedTemplate;

    } catch (error) {
      console.error('Errore generazione contenuto AI:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Genera pagine dal template con AI
  const generatePagesFromTemplate = async (template) => {
    const pages = [];

    for (let i = 0; i < template.sections.length; i++) {
      const section = template.sections[i];

      const pageData = {
        slug: section.slug || `page-${i + 1}`,
        titolo: section.aiGeneratedContent?.title || section.title || `Pagina ${i + 1}`,
        contenuto_json: {
          sections: [section],
          template_type: template.id,
          ai_enhanced: true
        },
        meta_title: section.aiGeneratedContent?.seo?.title || `${section.title} - ${companyData?.ragione_sociale}`,
        meta_description: section.aiGeneratedContent?.seo?.description || section.aiGeneratedContent?.subtitle || '',
        is_published: false,
        menu_order: i,
        ai_generated: true,
        ai_generation_prompt: section.aiGeneratedContent?.prompt || '',
        ai_confidence_score: section.aiConfidence,
        ai_content_sections: [section.aiGeneratedContent],
        ai_seo_metadata: section.aiGeneratedContent?.seo || {},
        ai_optimized_for_mobile: true
      };

      pages.push(pageData);
    }

    return pages;
  };

  // Salva sito AI-generated
  const saveAIGeneratedSite = async () => {
    try {
      // 1. Crea sito web con AI metadata
      const siteResponse = await api.post('/website/create', {
        ditta_id: companyData.id_ditta,
        subdomain: `${companyData.ragione_sociale.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        site_title: `Sito Web - ${companyData.ragione_sociale}`,
        template_id: selectedTemplate.template_id || 1,
        ai_generated: true,
        ai_company_context: JSON.stringify(aiAnalysis),
        ai_template_suggestions: aiSuggestions
      });

      if (siteResponse.data.success) {
        const websiteId = siteResponse.data.sito_id;

        // 2. Crea pagine generate
        for (const page of generatedPages) {
          await api.post(`/website/${websiteId}/pages`, page);
        }

        return websiteId;
      }

    } catch (error) {
      console.error('Errore salvataggio sito AI:', error);
      throw error;
    }
  };

  // Render della selezione ditte
  const renderCompanySelection = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeMode === 'ai-first' ? '🤖' : activeMode === 'hybrid' ? '🚀' : '📋'}
            {' '}Website Builder - Selezione Azienda
          </h1>
          <p className="mt-2 text-gray-600">
            {activeMode === 'ai-first'
              ? 'L\'AI analizzerà l\'azienda e suggerirà il sito web perfetto'
              : activeMode === 'hybrid'
              ? 'Combina la potenza dell\'AI con la flessibilità manuale'
              : 'Sistema tradizionale per creazione siti web'
            }
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Modalità:</label>
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="manual">📋 Manuale</option>
            <option value="hybrid">🚀 Ibrida</option>
            <option value="ai-first">🤖 AI-First</option>
          </select>
        </div>
      </div>

      {/* AI Enhancement Panel */}
      {activeMode !== 'manual' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">AI Enhancement Attivo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-2 text-green-600" />
              Analisi contesto aziendale
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-2 text-green-600" />
              Suggerimenti template intelligenti
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 mr-2 text-green-600" />
              Generazione contenuti ottimizzati
            </div>
          </div>
        </div>
      )}

      {/* Elenco ditte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Aziende Disponibili</h2>
          <p className="text-gray-600 mt-1">Seleziona un\'azienda per creare il sito web</p>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Qui verranno mostrate le ditte caricate dinamicamente */}
          <div className="p-6 text-center text-gray-500">
            <CpuChipIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            Caricamento aziende disponibili...
          </div>
        </div>
      </div>
    </div>
  );

  // Render generazione AI
  const renderAIGeneration = () => (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
          Generazione Sito con AI
        </h1>
        <p className="mt-2 text-gray-600">
          Stiamo analizzando {companyData?.ragione_sociale} e generando contenuti personalizzati
        </p>
      </div>

      {isAnalyzing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analisi AI in corso...</h3>
            <p className="text-gray-600">Stiamo analizzando il contesto aziendale per generare contenuti perfetti</p>
          </div>
        </div>
      )}

      {aiAnalysis && !isGenerating && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Analisi AI Completata</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Settore</h4>
              <p className="text-gray-600">{aiAnalysis.industry || 'Generale'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Stile Consigliato</h4>
              <p className="text-gray-600">{aiAnalysis.contentStyle || 'Professionale'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Pagine Suggerite</h4>
              <div className="flex flex-wrap gap-1">
                {(aiAnalysis.recommendedPages || []).map((page, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {page}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Generazione Contenuti AI</h3>
              <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
          <p className="text-center text-gray-600">
            I contenuti vengono generati in base all'analisi del contesto aziendale...
          </p>
        </div>
      )}

      {/* Template suggestions */}
      {aiSuggestions.length > 0 && !selectedTemplate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Template Suggeriti dall'AI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 cursor-pointer transition-colors"
                onClick={() => generateAIContent(suggestion)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                  <span className="text-sm text-gray-500">
                    {Math.round((suggestion.matchScore || 0) * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
                <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Genera con AI
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Azioni */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Template Selezionato</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
              <p className="text-sm text-gray-600">
                {selectedTemplate.sections.length} sezioni generate con AI
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              Rig >
                Annulla
              </button>
              <button
                onClick={saveAIGeneratedSite}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Salva Sito Generato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render principale
  if (currentStep === 'company-selection') {
    return renderCompanySelection();
  }

  if (currentStep === 'ai-generation' && activeMode !== 'manual') {
    return renderAIGeneration();
  }

  // Fallback al WebsiteBuilderUNIFIED originale
  return (
    <WebsiteBuilderUNIFIED
      websiteId={selectedCompany?.id}
      site={selectedCompany}
      mode={activeMode}
      aiEnhanced={activeMode !== 'manual'}
      aiAnalysis={aiAnalysis}
      aiSuggestions={aiSuggestions}
      onCompanyChange={setSelectedCompany}
      {...props}
    />
  );
};

export default AIEnhancedWebsiteBuilder;