/**
 * @file WebsiteBuilderUNIFIED.js
 * @description Componente SEMPLIFICATO per generazione pagine da template
 * - Creazione pagine con sezioni predefinite
 * - Gestione componenti: Immagine, Blog, Maps, Social, Galleria
 * - Integrazione con Next.js per rendering finale
 * @version 3.0 - Semplificato per template generation
 */

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  RocketLaunchIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

// Import componenti semplificati
import TemplatePageBuilder from './website/builder/TemplatePageBuilder';
import StyleEditor from './StyleEditor';
import NavigationBuilder from './website/builder/NavigationBuilder';
import CollaborativeTemplateBuilder from './website/builder/CollaborativeTemplateBuilder';
import AIAssistantButton from './website/builder/AIAssistantButton';
import { api } from '../services/api';

// Import AI services
import AIService from '../services/aiService';

const WebsiteBuilderUNIFIED = ({
  site: initialSite,
  websiteId,
  onSave,
  onCancel
}) => {
  // Stati principali semplificati
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Stati per navigazione
  const [activeView, setActiveView] = useState('template'); // 'template' | 'pages' | 'builder' | 'collaborative'
  const [saving, setSaving] = useState(false);
  const [useCollaborativeMode, setUseCollaborativeMode] = useState(false);
  const [selectedAISection, setSelectedAISection] = useState(null);

  // Stati per pagine
  const [pages, setPages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentBuilderTemplate, setCurrentBuilderTemplate] = useState(null);
  const [editingPage, setEditingPage] = useState(null);

  // Stati AI enhancement
  const [aiMode, setAiMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiEnhancedTemplate, setAiEnhancedTemplate] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Stati per generazione sito
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [showVpsConfig, setShowVpsConfig] = useState(false);

  // Stati per navigazione multi-pagina
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Stili globali del sito
  const [globalStyles, setGlobalStyles] = useState({
    background_type: 'color',
    background_color: '#ffffff',
    font_family: 'Inter',
    font_size: '16',
    font_color: '#333333',
    heading_font: 'Inter',
    heading_color: '#1a1a1a',
    primary_color: '#3B82F6',
    secondary_color: '#64748B',
    accent_color: '#EF4444',
    button_background_color: '#3B82F6',
    button_text_color: '#ffffff',
    link_color: '#2563EB',
    container_max_width: '1200px',
    padding_top: '60px',
    padding_bottom: '60px',
    custom_css: ''
  });

  const [isGeneratingStyles, setIsGeneratingStyles] = useState(false);
  const [stylePrompt, setStylePrompt] = useState('');
  const [showStylePrompt, setShowStylePrompt] = useState(false);

  const [vpsConfig, setVpsConfig] = useState({
    host: '',
    username: '',
    password: '',
    sshKey: '',
    deployPath: '/var/www/sites',
    domain: ''
  });
  const [site, setSite] = useState(initialSite || {});

  // Template predefiniti
  const templates = [
    {
      id: 'business-landing',
      name: 'Business Landing',
      description: 'Landing page professionale per aziende',
      icon: '🏢',
      sections: [
        {
          id: 'hero-1',
          type: 'image',
          data: {
            title: 'Scopri la Nostra Azienda',
            subtitle: 'Soluzioni innovative per il tuo business',
            description: 'Siamo leader nel settore da oltre 10 anni, offrendo servizi di alta qualità personalizzati per le esigenze dei nostri clienti.',
            layout: 'center',
            buttonText: 'Scopri di più',
            buttonUrl: '#contact',
            imageBorder: 'rounded',
            buttonStyle: 'primary'
          }
        },
        {
          id: 'services-1',
          type: 'blog',
          data: {
            title: 'I Nostri Servizi',
            layout: 'grid',
            postsToShow: 3,
            columns: 3,
            showAuthor: false,
            showDate: false,
            showReadTime: false,
            showMeta: false
          }
        },
        {
          id: 'gallery-1',
          type: 'gallery',
          data: {
            layout: 'grid',
            columns: 3,
            gap: 'medium',
            showCaptions: true,
            enableLightbox: true,
            transition: 'fade',
            images: []
          }
        },
        {
          id: 'contact-1',
          type: 'maps',
          data: {
            address: '',
            zoom: 15,
            height: '400px',
            showInfoWindow: true,
            markerTitle: 'La Nostra Sede',
            markerDescription: 'Vieni a trovarci!',
            mapStyle: 'default',
            markerColor: 'red'
          }
        },
        {
          id: 'social-1',
          type: 'social',
          data: {
            platforms: ['facebook', 'instagram', 'linkedin'],
            layout: 'horizontal',
            iconStyle: 'rounded',
            showFollowers: true,
            showFeed: false
          }
        }
      ]
    },
    {
      id: 'creative-portfolio',
      name: 'Portfolio Creativo',
      description: 'Portfolio per creativi e designer',
      icon: '🎨',
      sections: [
        {
          id: 'hero-2',
          type: 'gallery',
          data: {
            layout: 'carousel',
            images: [],
            autoplay: true,
            interval: 4000,
            showNavigation: true
          }
        },
        {
          id: 'blog-2',
          type: 'blog',
          data: {
            title: 'Ultimi Lavori',
            layout: 'masonry',
            postsToShow: 6,
            showAuthor: true,
            showDate: true,
            showMeta: true
          }
        },
        {
          id: 'social-2',
          type: 'social',
          data: {
            platforms: ['instagram', 'tiktok', 'youtube'],
            layout: 'grid',
            iconSize: 'large',
            showFeed: true
          }
        }
      ]
    },
    {
      id: 'local-business',
      name: 'Attività Locale',
      description: 'Pagina per negozi e attività locali',
      icon: '🏪',
      sections: [
        {
          id: 'hero-3',
          type: 'image',
          data: {
            title: 'Benvenuti nel Nostro Negozio',
            subtitle: 'Prodotti di qualità dal 1990',
            layout: 'left',
            imageBorder: 'shadow',
            buttonText: 'Scopri i prodotti',
            buttonUrl: '#products'
          }
        },
        {
          id: 'map-3',
          type: 'maps',
          data: {
            address: '',
            height: '500px',
            showDirections: true,
            showStreetView: true,
            markerColor: 'blue'
          }
        },
        {
          id: 'gallery-3',
          type: 'gallery',
          data: {
            layout: 'masonry',
            columns: 4,
            gap: 'small',
            showCaptions: false,
            enableLightbox: true
          }
        },
        {
          id: 'social-3',
          type: 'social',
          data: {
            platforms: ['facebook', 'instagram'],
            layout: 'vertical',
            showFollowers: true,
            openInNewTab: true
          }
        }
      ]
    },
    {
      id: 'blog-magazine',
      name: 'Blog Magazine',
      description: 'Sito dedicato a blog e articoli',
      icon: '📰',
      sections: [
        {
          id: 'blog-4',
          type: 'blog',
          data: {
            title: 'Articoli Recenti',
            layout: 'list',
            postsToShow: 8,
            showAuthor: true,
            showDate: true,
            showReadTime: true,
            showMeta: true,
            showReadMore: true
          }
        },
        {
          id: 'categories-4',
          type: 'blog',
          data: {
            title: 'Esplora per Categoria',
            layout: 'grid',
            postsToShow: 6,
            columns: 2,
            category: 'all'
          }
        },
        {
          id: 'social-4',
          type: 'social',
          data: {
            platforms: ['twitter', 'facebook'],
            layout: 'horizontal',
            iconSize: 'medium',
            showFeed: true
          }
        }
      ]
    }
  ];

  // Carica pagine esistenti e stato sito
  useEffect(() => {
    console.log('🚀 WebsiteBuilderUNIFIED MONTATO - websiteId:', websiteId);
    console.log('🚀 STATI INIZIALI:', {
      activeView,
      useCollaborativeMode,
      hasTemplate: !!currentBuilderTemplate,
      hasPages: pages.length
    });

    if (websiteId) {
      loadPages();
      loadSiteStatus();
      // Se è un sito AI-generated, carica anche l'analisi AI
      if (initialSite?.ai_generated) {
        loadAIAnalysis();
      }
    }
  }, [websiteId]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/website/${websiteId}/pages`);
      if (response.data.success) {
        setPages(response.data.pages || []);
      }
    } catch (error) {
      console.error('Errore caricamento pagine:', error);
      setError('Impossibile caricare le pagine esistenti');
    } finally {
      setLoading(false);
    }
  };

  // Funzioni AI
  const loadAIAnalysis = async () => {
    if (!websiteId || !initialSite?.id_ditta) return;

    try {
      setIsAnalyzing(true);
      const analysis = await AIService.analyzeCompany(initialSite.id_ditta);
      setAiAnalysis(analysis.analysis);
      setAiSuggestions(analysis.templateSuggestions || []);
    } catch (error) {
      console.error('Errore caricamento analisi AI:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleAIMode = async () => {
    const newAiMode = !aiMode;
    setAiMode(newAiMode);

    if (newAiMode && !aiAnalysis && websiteId) {
      await loadAIAnalysis();
    }
  };

  const generateAIEnhancedTemplate = async (template, customPrompt = '') => {
    if (!websiteId || !initialSite?.id_ditta) {
      setError('Seleziona prima un\'azienda');
      return;
    }

    try {
      setIsGeneratingAI(true);
      setError(null);

      const enhancedTemplate = await AIService.generateAITemplate(
        template,
        initialSite.id_ditta,
        customPrompt,
        (progress, message) => {
          setAiGenerationProgress(progress || 0);
          if (message) {
            setProgressMessage(message);
          }
        }
      );

      setAiEnhancedTemplate(enhancedTemplate);
      setSuccess('Template generato con AI con successo!');

      // Crea le pagine dal template AI-enhanced con generazione guidata
      const pages = await AIService.createPagesFromAITemplateWithAI(
        enhancedTemplate,
        websiteId,
        globalStyles,
        (progress) => {
          // Callback di progresso per UI
          setAiGenerationProgress(progress.progress || 0);
          setProgressMessage(progress.message || 'Generazione sezioni in corso...');
        }
      );

      // Salva il sito AI-generated
      await AIService.saveAIGeneratedSite(websiteId, enhancedTemplate, pages);

      setSuccess(`Sito AI-generated creato con ${pages.length} pagine!`);
      setActiveView('pages');
      await loadPages();

    } catch (error) {
      console.error('Errore generazione template AI:', error);
      setError('Errore nella generazione del template con AI: ' + error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const enhanceWithAI = async (template) => {
    if (!aiMode) {
      openTemplateBuilder(template);
      return;
    }

    await generateAIEnhancedTemplate(template);
  };

  // Apre il builder con template selezionato
  const openTemplateBuilder = (template) => {
    setCurrentBuilderTemplate(template);
    setEditingPage(null);
    setActiveView('builder');
  };

  // Apre il builder per modificare una pagina esistente
  const editPage = (page) => {
    try {
      // Parse del contenuto JSON della pagina
      let sections = [];

      // 1. Prova prima con il formato JSON nuovo
      if (page.contenuto_json) {
        const jsonData = JSON.parse(page.contenuto_json);
        sections = jsonData.sections || [];
        console.log('Caricate', sections.length, 'sezioni dal JSON:', sections);
      }
      // 2. Se non c'è JSON, prova a convertire da HTML vecchio
      else if (page.contenuto_html) {
        sections = convertHtmlToSections(page.contenuto_html);
        console.log('Convertite', sections.length, 'sezioni da HTML');
      }
      // 3. Se non c'è nulla, parti da array vuoto
      else {
        console.log('Nessun contenuto trovato, partendo da array vuoto');
        sections = [];
      }

      // Crea un template virtuale basato sulla pagina esistente
      const pageTemplate = {
        id: `edit_${page.id}`,
        name: `Modifica: ${page.titolo}`,
        description: 'Modifica pagina esistente',
        icon: '✏️',
        sections: sections
      };

      setCurrentBuilderTemplate(pageTemplate);
      setEditingPage(page);
      setActiveView('builder');
    } catch (error) {
      console.error('Errore caricamento pagina per modifica:', error);
      setError('Impossibile caricare la pagina per la modifica');
    }
  };

  // Funzione per convertire HTML vecchio in sezioni template
  const convertHtmlToSections = (htmlContent) => {
    try {
      const sections = [];

      // Prova a estrarre immagini
      const imgMatches = htmlContent.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g);
      if (imgMatches && imgMatches.length > 0) {
        imgMatches.forEach((match, index) => {
          const srcMatch = match.match(/src="([^"]+)"/);
          const altMatch = match.match(/alt="([^"]*)"/);

          if (srcMatch) {
            sections.push({
              id: `imported_image_${Date.now()}_${index}`,
              type: 'image',
              data: {
                imageUrl: srcMatch[1],
                altText: altMatch ? altMatch[1] : '',
                title: '',
                description: '',
                layout: 'center',
                buttonText: '',
                buttonUrl: '',
                imageBorder: 'rounded'
              }
            });
          }
        });
      }

      // Se non troviamo sezioni, crea una sezione vuota
      if (sections.length === 0) {
        sections.push({
          id: `empty_${Date.now()}`,
          type: 'image',
          data: {
            imageUrl: '',
            altText: '',
            title: '',
            description: '',
            layout: 'left',
            buttonText: '',
            buttonUrl: '',
            imageBorder: 'rounded'
          }
        });
      }

      return sections;
    } catch (error) {
      console.error('Errore conversione HTML in sezioni:', error);
      return [{
        id: `fallback_${Date.now()}`,
        type: 'image',
        data: {
          imageUrl: '',
          altText: '',
          title: '',
          description: '',
          layout: 'left',
          buttonText: '',
          buttonUrl: '',
          imageBorder: 'rounded'
        }
      }];
    }
  };

  // Gestisce salvataggio pagina dal builder
  const handleSaveFromTemplate = async (pageData) => {
    console.log('🔥 WebsiteBuilderUNIFIED - handleSaveFromTemplate chiamato');
    console.log('🔥 WebsiteBuilderUNIFIED - pageData:', pageData);
    console.log('🔥 WebsiteBuilderUNIFIED - editingPage:', editingPage);
    console.log('🔥 WebsiteBuilderUNIFIED - websiteId:', websiteId);

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let response;

      if (editingPage) {
        // Modifica pagina esistente
        console.log('🔥 WebsiteBuilderUNIFIED - Chiamata PUT a:', `/website/${websiteId}/pages/${editingPage.id}`);
        console.log('🔥 WebsiteBuilderUNIFIED - Dati inviati:', JSON.stringify(pageData, null, 2));

        response = await api.put(`/website/${websiteId}/pages/${editingPage.id}`, pageData);
        console.log('🔥 WebsiteBuilderUNIFIED - Response ricevuta:', response);
      } else {
        // Creazione nuova pagina
        console.log('🔥 WebsiteBuilderUNIFIED - Chiamata POST a:', `/website/${websiteId}/pages`);
        console.log('🔥 WebsiteBuilderUNIFIED - Dati inviati:', JSON.stringify(pageData, null, 2));

        response = await api.post(`/website/${websiteId}/pages`, pageData);
        console.log('🔥 WebsiteBuilderUNIFIED - Response ricevuta:', response);
      }

      console.log('🔥 WebsiteBuilderUNIFIED - Response API:', response);

      if (response.data.success) {
        const action = editingPage ? 'modificata' : 'creata';
        setSuccess(`Pagina ${action} con successo!`);

        // Ricarica pagine
        await loadPages();
        // Rimani nella vista pagine (non tornare ai template)
        setActiveView('pages');
        setCurrentBuilderTemplate(null);
        setEditingPage(null);

        // NOTA: Non chiamiamo onCancel() perché vogliamo rimanere nel contesto del WebsiteBuilder

        if (onSave) {
          onSave(response.data.page);
        }
      } else {
        setError(response.data.error || 'Errore nel salvataggio');
      }
    } catch (error) {
      console.error('❌ WebsiteBuilderUNIFIED - Errore salvataggio pagina:', error);
      console.error('❌ WebsiteBuilderUNIFIED - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Errore nel salvataggio della pagina: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Chiudi builder e torna ai template
  const closeBuilder = () => {
    setActiveView('template');
    setCurrentBuilderTemplate(null);
    setEditingPage(null);
  };

  // Carica stato del sito
  const loadSiteStatus = async () => {
    if (!websiteId) return;

    try {
      const response = await api.get(`/website-generator/status/${websiteId}`);
      if (response.data.success) {
        setDeployStatus(response.data.data.deployInfo?.deploy_status || 'pending');
      }
    } catch (error) {
      console.error('Errore caricamento stato sito:', error);
    }
  };

  // Anteprima sito generato
  const handlePreviewSite = async () => {
    if (!websiteId) {
      setError('Nessun sito selezionato per l\'anteprima');
      return;
    }

    try {
      const response = await api.get(`/website-generator/preview/${websiteId}`, {
        responseType: 'blob'
      });

      // Crea URL temporaneo e apre in nuova finestra
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const previewWindow = window.open(url, '_blank');

      // Cleanup dopo 5 minuti
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 300000);
    } catch (error) {
      console.error('Errore anteprima sito:', error);
      setError('Errore nella generazione dell\'anteprima: ' + error.message);
    }
  };

  // Deploy su VPS
  const handleDeploySite = async () => {
    if (!websiteId) {
      setError('Nessun sito selezionato per il deploy');
      return;
    }

    if (!vpsConfig.host || !vpsConfig.username || (!vpsConfig.password && !vpsConfig.sshKey)) {
      setError('Configurazione VPS incompleta. Inserisci host, username e password/chiave SSH.');
      setShowVpsConfig(true);
      return;
    }

    if (!vpsConfig.domain) {
      setError('Inserisci il dominio dove deployare il sito.');
      setShowVpsConfig(true);
      return;
    }

    setIsDeploying(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 Inizio deploy sito per websiteId:', websiteId);

      const response = await api.post(`/website-generator/deploy/${websiteId}`, {
        vpsConfig: {
          host: vpsConfig.host,
          username: vpsConfig.username,
          password: vpsConfig.password,
          sshKey: vpsConfig.sshKey,
          deployPath: vpsConfig.deployPath
        },
        domain: vpsConfig.domain,
        deployOptions: {
          buildStatic: true,
          minify: true,
          generateSitemap: true
        }
      });

      if (response.data.success) {
        setSuccess(`Sito deployato con successo! Visita: ${response.data.data.siteUrl}`);
        setDeployStatus('deployed');
        setShowVpsConfig(false);

        // Aggiorna lo stato del sito nel database
        await loadSiteStatus();
      } else {
        setError(response.data.error || 'Errore durante il deploy');
      }
    } catch (error) {
      console.error('❌ Errore deploy sito:', error);
      setError('Errore durante il deploy: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsDeploying(false);
    }
  };

  // Genera anteprima HTML della pagina
  const handlePreviewPage = (page) => {
    try {
      let pageContent = '';

      if (page.contenuto_json) {
        const jsonData = JSON.parse(page.contenuto_json);
        console.log('Preview: sezioni trovate', jsonData.sections?.length || 0);
        pageContent = generateHtmlFromSections(jsonData.sections || []);
      } else {
        console.log('Preview: nessun contenuto_json trovato');
        pageContent = '<p>Nessun contenuto disponibile</p>';
      }

      const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.meta_title || page.titolo || 'Anteprima Pagina'}</title>
    <meta name="description" content="${page.meta_description || ''}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem 0; }
        .header h1 { font-size: 1.5rem; color: #111827; }
        .preview-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.5rem; text-align: center; font-size: 0.875rem; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
        .hero { background: #3b82f6; color: white; padding: 4rem 0; text-align: center; margin-top: 2rem; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.25rem; opacity: 0.9; }
        .btn { background: white; color: #3b82f6; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; margin-top: 1rem; }
        section { padding: 4rem 0; }
        section:nth-child(even) { background: #f9fafb; }
        h2 { font-size: 2.5rem; margin-bottom: 1rem; color: #111827; }
        .text-xl { font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem; }
        img { max-width: 100%; height: auto; border-radius: 0.5rem; }
        .footer { background: #111827; color: white; padding: 2rem 0; text-align: center; margin-top: 2rem; }
        .section-margin { margin-top: 2rem; }
        .image-section { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; }
        .image-section img { flex: 1; max-width: 50%; }
        .image-section .content { flex: 1; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .gallery-grid img { width: 100%; height: 200px; object-fit: cover; }
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .blog-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="preview-notice">
        📋 Modalità anteprima - Questa è un'anteprima della pagina generata dal template
    </div>

    <header class="header">
        <div class="container">
            <h1>${initialSite?.ragione_sociale || 'Nome Azienda'}</h1>
        </div>
    </header>

    <main style="margin-top: 2rem;">
        <div class="container">
            ${pageContent}
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${initialSite?.ragione_sociale || 'Nome Azienda'}. Tutti i diritti riservati.</p>
            <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 0.5rem;">Creato con Opero Cloud Website Builder</p>
        </div>
    </footer>
</body>
</html>`;

      // Apre l'HTML in una nuova finestra
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(html);
      previewWindow.document.close();

    } catch (error) {
      console.error('Errore generazione anteprima:', error);
      alert('Errore nella generazione dell\'anteprima');
    }
  };

  // Funzione per generare HTML dalle sezioni
  const generateHtmlFromSections = (sections) => {
    return sections.map(section => {
      switch (section.type) {
        case 'image':
          return generateImageSection(section.data);
        case 'gallery':
          return generateGallerySection(section.data);
        case 'blog':
          return generateBlogSection(section.data);
        case 'maps':
          return generateMapsSection(section.data);
        case 'social':
          return generateSocialSection(section.data);
        default:
          return '';
      }
    }).join('');
  };

  // Genera sezione immagine
  const generateImageSection = (data) => {
    const imageUrl = data.imageUrl || '';
    const title = data.title || '';
    const description = data.description || '';
    const buttonText = data.buttonText || '';
    const buttonUrl = data.buttonUrl || '';

    return `
      <div class="section-margin">
        <div class="image-section">
          ${imageUrl ? `<img src="${imageUrl}" alt="${title}" />` : ''}
          <div class="content">
            ${title ? `<h2>${title}</h2>` : ''}
            ${description ? `<p>${description}</p>` : ''}
            ${buttonText && buttonUrl ? `<a href="${buttonUrl}" class="btn">${buttonText}</a>` : ''}
          </div>
        </div>
      </div>
    `;
  };

  // Genera sezione galleria
  const generateGallerySection = (data) => {
    const images = data.images || [];
    return `
      <div class="section-margin">
        <h2>Galleria Fotografica</h2>
        <div class="gallery-grid">
          ${images.map(img => `<img src="${img.url}" alt="${img.alt || ''}" />`).join('')}
        </div>
      </div>
    `;
  };

  // Genera sezione blog
  const generateBlogSection = (data) => {
    return `
      <div class="section-margin">
        <h2>${data.title || 'Articoli Recenti'}</h2>
        <p style="color: #6b7280; font-size: 1.25rem;">Questa sezione mostrerà gli articoli più recenti del blog.</p>
      </div>
    `;
  };

  // Genera sezione maps
  const generateMapsSection = (data) => {
    return `
      <div class="section-margin">
        <h2>${data.markerTitle || 'La Nostra Sede'}</h2>
        <p>${data.markerDescription || 'Vieni a trovarci!'}</p>
        <div style="background: #e5e7eb; height: 400px; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; margin-top: 1rem;">
          Mappa interattiva (richiede Google Maps API)
        </div>
      </div>
    `;
  };

  // Genera sezione social
  const generateSocialSection = (data) => {
    return `
      <div class="section-margin">
        <h2>Seguici sui Social</h2>
        <p style="color: #6b7280;">Questa sezione mostrerà i link ai profili social.</p>
      </div>
    `;
  };

  // Genera HTML statico per Next.js
  const generateStaticHTML = async (pageData) => {
    try {
      const response = await api.post(`/website/${websiteId}/generate-html`, pageData);
      return response.data.html;
    } catch (error) {
      console.error('Errore generazione HTML:', error);
      return null;
    }
  };

  // Genera stili globali con AI
  const handleGenerateAIStyles = async (template, customPrompt = '') => {
    if (!template || !site.id_ditta) {
      setError('Template o azienda mancanti per generare stili');
      return;
    }

    setIsGeneratingStyles(true);
    setError(null);

    try {
      const generatedStyles = await AIService.generateGlobalStyles(template, site.id_ditta, customPrompt);

      setGlobalStyles(generatedStyles);

      // Salva automaticamente gli stili generati
      await handleSaveGlobalStyles(generatedStyles);

      const message = generatedStyles.aiGenerated
        ? `Stili AI generati con successo!${generatedStyles.templateAnalysis?.rationale ? ' ' + generatedStyles.templateAnalysis.rationale : ''}`
        : 'Stili di default applicati';

      setSuccess(message);

    } catch (error) {
      console.error('Errore generazione stili AI:', error);
      setError('Errore nella generazione degli stili AI: ' + error.message);
    } finally {
      setIsGeneratingStyles(false);
    }
  };

  // Salva stili globali del sito
  const handleSaveGlobalStyles = async (styles) => {
    if (!websiteId) {
      setError('Nessun sito selezionato per salvare gli stili');
      return;
    }

    try {
      // Recupera il tema configurato attuale
      const siteResponse = await api.get(`/website/${websiteId}`);
      const existingThemeConfig = siteResponse.data.theme_config || {};

      const response = await api.put(`/website/${websiteId}`, {
        section: 'global_styles',
        data: {
          ...styles,
          existingThemeConfig: JSON.stringify(existingThemeConfig)
        }
      });

      if (response.data.success) {
        setGlobalStyles(styles);
        return response.data;
      }
    } catch (error) {
      console.error('Errore salvataggio stili globali:', error);
      setError('Errore nel salvataggio degli stili globali: ' + error.message);
    }
  };

  // Genera sito statico completo
  const handleGenerateSite = async () => {
    if (!websiteId) {
      setError('Nessun sito selezionato per la generazione');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 Inizio generazione sito per websiteId:', websiteId);

      const response = await api.post(`/website-generator/generate/${websiteId}`, {
        options: {
          buildStatic: true,
          minify: true,
          generateSitemap: true
        }
      });

      if (response.data.success) {
        setSuccess(`Sito generato con successo! ${response.data.data.pagesGenerated} pagine create.`);
        setDeployStatus('generated');

        // Aggiorna lo stato del sito nel database
        await loadSiteStatus();
      } else {
        setError(response.data.error || 'Errore nella generazione del sito');
      }
    } catch (error) {
      console.error('❌ Errore generazione sito:', error);
      setError('Errore durante la generazione: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  // Gestisce anteprima completa del sito
  const handleFullPreviewClose = () => {
    setShowFullPreview(false);
  };

  // handlePreviewSite è già dichiarata sopra alla linea 590

  // Render vista template selection
  const renderTemplateSelection = () => (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          {onCancel && (
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Crea Pagina da Template {aiMode && '� AI-Enhanced'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Scegli un template e personalizzalo con le sezioni disponibili
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setActiveView('pages')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Pagine Esistenti ({pages.length})
          </button>

          <button
            onClick={() => setActiveView('styles')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            Stile Globale
          </button>

          {/* DEBUG: Pulsante diretto per il builder */}
          <button
            onClick={() => {
              console.log('🔥 CLICK - Apro vista builder diretta');
              setActiveView('builder');
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🔧 DEBUG Builder
          </button>

          {/* AI Mode Toggle */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiMode}
                onChange={toggleAIMode}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                🤖 AI Mode
              </span>
            </label>
          </div>

          {/* Pulsanti generazione sito */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-3">
            {/* Pulsante AI Preview - più visibile */}
            {aiEnhancedTemplate && pages.length > 0 && (
              <button
                onClick={() => setShowFullPreview(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 shadow-lg"
                disabled={loading || isGenerating || isDeploying}
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                🤖 Anteprima Sito AI ({pages.length} pagine)
              </button>
            )}

            <button
              onClick={() => setShowFullPreview(true)}
              className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={loading || isGenerating || isDeploying}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Anteprima Completa
            </button>

            <button
              onClick={handlePreviewSite}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || isGenerating || isDeploying}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Anteprima Singola
            </button>

            <button
              onClick={handleGenerateSite}
              className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || isGenerating || isDeploying}
            >
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generazione...' : 'Genera Sito'}
            </button>

            <button
              onClick={() => setShowVpsConfig(true)}
              className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={loading || isGenerating || isDeploying}
            >
              <ServerIcon className="h-4 w-4 mr-2" />
              {isDeploying ? 'Deploy...' : 'Deploy su VPS'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {aiMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">
              🤖 AI Analysis{aiAnalysis ? ' Complete' : ' Running...'}
            </h3>
            {isAnalyzing && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>

          {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Settore:</span> {aiAnalysis.industry || 'Generale'}
              </div>
              <div>
                <span className="font-medium">Stile:</span> {aiAnalysis.contentStyle || 'Professionale'}
              </div>
              <div>
                <span className="font-medium">Target:</span> {aiAnalysis.targetAudience || 'B2C'}
              </div>
            </div>
          )}

          {aiSuggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Template Suggeriti AI:</p>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {suggestion.name} ({Math.round((suggestion.matchScore || 0) * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generation Progress */}
      {isGeneratingAI && (
        <div className="bg-white rounded-lg border-2 border-blue-200 p-6 mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-blue-900">
                🚀 AI Generation in Progress...
              </h3>
              <span className="text-sm text-gray-600">{Math.round(aiGenerationProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiGenerationProgress}%` }}
              ></div>
            </div>
            {progressMessage && (
              <p className="text-sm text-gray-600 mt-2">{progressMessage}</p>
            )}
          </div>
          <p className="text-center text-gray-600">
            I contenuti vengono generati dall'IA in base all'analisi del contesto aziendale...
          </p>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {templates.map((template) => {
          // Find AI suggestion for this template
          const aiSuggestion = aiSuggestions.find(s => s.id === template.id);

          return (
            <div
              key={template.id}
              className={`bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer ${
                selectedTemplate?.id === template.id ? 'border-blue-500 shadow-lg' : ''
              } ${aiSuggestion ? 'ring-2 ring-blue-100' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    {template.name}
                    {aiSuggestion && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        AI Match {Math.round((aiSuggestion.matchScore || 0) * 100)}%
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
              </div>

              {/* Preview sections */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500">Sezioni incluse:</div>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section) => (
                    <span
                      key={section.id}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                    >
                      {section.type === 'image' && '🖼️ Immagine'}
                      {section.type === 'blog' && '📝 Blog'}
                      {section.type === 'maps' && '🗺️ Mappa'}
                      {section.type === 'social' && '📱 Social'}
                      {section.type === 'gallery' && '🎨 Galleria'}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI suggestion info */}
              {aiSuggestion && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-green-700">{aiSuggestion.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Crea template personalizzato */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Crea Template Personalizzato
        </h3>
        <p className="text-gray-600 mb-4">
          Parti da zero e aggiungi le sezioni che preferisci
        </p>
        <button
          onClick={() => setSelectedTemplate({ id: 'custom', name: 'Personalizzato', sections: [] })}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <SparklesIcon className="h-5 w-5 mr-2" />
          Inizia da Zero
        </button>
      </div>

      {/* Actions */}
      {selectedTemplate && (
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Annulla Selezione
          </button>

          {/* Pulsante Genera Stili AI */}
          <button
            onClick={() => handleGenerateAIStyles(selectedTemplate, stylePrompt)}
            className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            disabled={isGeneratingStyles || !site.id_ditta}
          >
            {isGeneratingStyles ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generazione Stili...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Genera Stili AI
              </>
            )}
          </button>

          {aiMode ? (
            <>
              <button
                onClick={() => generateAIEnhancedTemplate(selectedTemplate)}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isGeneratingAI || !websiteId}
              >
                {isGeneratingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generazione AI...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Genera con AI
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => openTemplateBuilder(selectedTemplate)}
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Usa Questo Template
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Render vista elenco pagine
  const renderPagesList = () => (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => setActiveView('template')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Le Tue Pagine
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci le pagine create dai template
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('template')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuova Pagina
        </button>
      </div>

      {/* AI Status Panel */}
      {aiEnhancedTemplate && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                🤖 Sito Generato con AI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-purple-700">Pagine create:</span>
                  <span className="ml-2 text-purple-900">{pages.length}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Sezioni totali:</span>
                  <span className="ml-2 text-purple-900">
                    {pages.reduce((total, page) => {
                      try {
                        const content = JSON.parse(page.contenuto_json);
                        return total + (content.sections?.length || 1);
                      } catch {
                        return total + 1;
                      }
                    }, 0)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Stili globali:</span>
                  <span className="ml-2 text-purple-900">
                    {globalStyles?.aiGenerated ? '✅ Generati' : '📝 Standard'}
                  </span>
                </div>
              </div>
              {aiEnhancedTemplate.aiMetadata && (
                <div className="mt-3 text-xs text-purple-700">
                  Generato il: {new Date(aiEnhancedTemplate.aiMetadata.generatedAt).toLocaleString('it-IT')}
                  {aiEnhancedTemplate.aiMetadata.missingSectionsGenerated > 0 && (
                    <span className="ml-4">
                      • {aiEnhancedTemplate.aiMetadata.missingSectionsGenerated} sezioni mancanti generate
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFullPreview(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 shadow-md"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Anteprima Completa
              </button>
              <button
                onClick={() => setActiveView('styles')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-md"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Modifica Stili
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Caricamento pagine...</div>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessuna pagina creata
          </h3>
          <p className="text-gray-600 mb-4">
            Crea la tua prima pagina utilizzando i template disponibili
          </p>
          <button
            onClick={() => setActiveView('template')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Crea Prima Pagina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {page.titolo}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                  page.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {page.is_published ? 'Pubblicata' : 'Bozza'}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <div>Slug: <code className="bg-gray-100 px-1 rounded">/{page.slug}</code></div>
                <div>Sezioni: {JSON.parse(page.contenuto_json || '{}').sections?.length || 0}</div>
                <div>Modificato: {new Date(page.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreviewPage(page)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  Anteprima
                </button>
                <button
                  onClick={() => editPage(page)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Modifica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render main content
  const renderContent = () => {
    if (activeView === 'template') {
      return renderTemplateSelection();
    } else if (activeView === 'pages') {
      return renderPagesList();
    } else if (activeView === 'styles') {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <StyleEditor
            styles={globalStyles}
            onStyleChange={setGlobalStyles}
            onSave={handleSaveGlobalStyles}
            title="Configurazione Stile Globale"
            showGlobalStyles={true}
            showPageStyles={false}
          />
        </div>
      );
    } else if (activeView === 'builder') {
      return (
        <div>
          {pages.length > 1 && (
            <NavigationBuilder
              pages={pages}
              currentPage={currentPageIndex}
              globalStyles={globalStyles}
              onNavigate={setCurrentPageIndex}
            />
          )}

          {/* Header con opzioni collaborative */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Page Builder
                {useCollaborativeMode && (
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    🤖 Modalità AI Collaborativa
                  </span>
                )}
              </h2>

              <div className="flex items-center gap-3">
                {/* DEBUG LOGS */}
                {console.log('🐛 RENDER DEBUG - activeView:', activeView)}
                {console.log('🐛 RENDER DEBUG - useCollaborativeMode:', useCollaborativeMode)}
                {console.log('🐛 RENDER DEBUG - TemplatePageBuilder exists:', !!TemplatePageBuilder)}
                {console.log('🐛 RENDER DEBUG - CollaborativeTemplateBuilder exists:', !!CollaborativeTemplateBuilder)}

                <button
                  onClick={() => setUseCollaborativeMode(!useCollaborativeMode)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    useCollaborativeMode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <span className="mr-2">🤖</span>
                  {useCollaborativeMode ? 'Disattiva AI' : 'Attiva AI Collaborativa'}
                </button>
              </div>
            </div>
          </div>

          {/* Builder Component */}
          {useCollaborativeMode ? (
            <CollaborativeTemplateBuilder
              initialTemplate={currentBuilderTemplate}
              websiteId={websiteId}
              globalStyles={globalStyles}
              onSave={handleSaveFromTemplate}
              theme="default"
            />
          ) : (
            <>
              <TemplatePageBuilder
                initialTemplate={currentBuilderTemplate}
                websiteId={websiteId}
                site={site}
                onSave={handleSaveFromTemplate}
                onCancel={closeBuilder}
                editingPage={editingPage}
                globalStyles={globalStyles}
                onSectionClick={(index) => {
                  // Seleziona sezione per assistenza AI
                  if (currentBuilderTemplate?.sections?.[index]) {
                    setSelectedAISection(currentBuilderTemplate.sections[index]);
                  }
                }}
                previewMode={true}
              />

              {/* Pulsante assistenza AI */}
              {!useCollaborativeMode && selectedAISection && (
                <AIAssistantButton
                  section={selectedAISection}
                  globalStyles={globalStyles}
                  onSectionUpdate={(updatedSection) => {
                    // Aggiorna la sezione nel template
                    if (currentBuilderTemplate) {
                      const updatedSections = [...currentBuilderTemplate.sections];
                      const sectionIndex = currentBuilderTemplate.sections.findIndex(
                        s => s.id === updatedSection.id
                      );
                      if (sectionIndex >= 0) {
                        updatedSections[sectionIndex] = updatedSection;
                        setCurrentBuilderTemplate({
                          ...currentBuilderTemplate,
                          sections: updatedSections
                        });
                      }
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      );
    }
  };

  // Render main component
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error/Success messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      {/* Modal configurazione VPS */}
      {showVpsConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Configurazione Deploy VPS
              </h2>
              <button
                onClick={() => setShowVpsConfig(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Stato deploy corrente */}
            {deployStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                deployStatus === 'deployed' ? 'bg-green-50 text-green-800' :
                deployStatus === 'deploying' ? 'bg-blue-50 text-blue-800' :
                deployStatus === 'error' ? 'bg-red-50 text-red-800' :
                'bg-gray-50 text-gray-800'
              }`}>
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 mr-2" />
                  Stato attuale: {
                    deployStatus === 'deployed' ? 'Deploy completato' :
                    deployStatus === 'deploying' ? 'Deploy in corso' :
                    deployStatus === 'error' ? 'Errore nel deploy' :
                    'Non mai deployato'
                  }
                </div>
              </div>
            )}

            {/* Form configurazione */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Host VPS *
                </label>
                <input
                  type="text"
                  value={vpsConfig.host}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="es. 192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={vpsConfig.username}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="es. root o ubuntu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (lascia vuoto per usare chiave SSH)
                </label>
                <input
                  type="password"
                  value={vpsConfig.password}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password VPS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chiave SSH (opzionale)
                </label>
                <textarea
                  value={vpsConfig.sshKey}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, sshKey: e.target.value }))}
                  placeholder="Incolla qui la tua chiave SSH privata"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dominio *
                </label>
                <input
                  type="text"
                  value={vpsConfig.domain}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="es. tuodominio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path Deploy
                </label>
                <input
                  type="text"
                  value={vpsConfig.deployPath}
                  onChange={(e) => setVpsConfig(prev => ({ ...prev, deployPath: e.target.value }))}
                  placeholder="/var/www/sites"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pulsanti azione */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVpsConfig(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleDeploySite}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                disabled={isDeploying || !vpsConfig.host || !vpsConfig.username || (!vpsConfig.password && !vpsConfig.sshKey) || !vpsConfig.domain}
              >
                {isDeploying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deploy in corso...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    Deploy Ora
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Full Preview del Sito */}
      {showFullPreview && pages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
          {/* Custom CSS styles */}
          {globalStyles?.custom_css && (
            <style>{globalStyles.custom_css}</style>
          )}
          <div className="min-h-screen">
            {/* Header Preview con controlli */}
            <div className="sticky top-0 bg-gray-900 text-white p-4 flex items-center justify-between z-60">
              <h3 className="text-lg font-semibold">Anteprima Completa del Sito</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Pagina {currentPageIndex + 1} di {pages.length}
                </span>
                <button
                  onClick={handleFullPreviewClose}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigazione tra pagine */}
            <NavigationBuilder
              pages={pages}
              currentPage={currentPageIndex}
              globalStyles={globalStyles}
              onNavigate={setCurrentPageIndex}
            />

            {/* Contenuto pagina corrente con stili applicati */}
            <div
              className="p-8"
              style={{
                backgroundColor: globalStyles?.background_color || '#ffffff',
                fontFamily: globalStyles?.font_family || 'Inter, sans-serif',
                fontSize: globalStyles?.font_size ? `${globalStyles.font_size}px` : '16px',
                color: globalStyles?.font_color || '#333333',
                backgroundImage: globalStyles?.background_gradient || globalStyles?.background_image ?
                  globalStyles?.background_gradient || `url(${globalStyles?.background_image})` : 'none',
                backgroundSize: globalStyles?.background_size || 'cover',
                backgroundPosition: globalStyles?.background_position || 'center',
                backgroundRepeat: globalStyles?.background_repeat || 'no-repeat',
                backgroundAttachment: globalStyles?.background_attachment || 'scroll',
                minHeight: 'calc(100vh - 200px)'
              }}
            >
              <h1
                className="text-4xl font-bold mb-8"
                style={{
                  fontFamily: globalStyles?.heading_font || 'Inter, sans-serif',
                  color: globalStyles?.heading_color || '#1a1a1a'
                }}
              >
                {pages[currentPageIndex]?.titolo || 'Pagina'}
              </h1>

              <div className="prose max-w-none">
                {pages[currentPageIndex]?.contenuto_html && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: pages[currentPageIndex].contenuto_html
                    }}
                    style={{
                      lineHeight: '1.6',
                      marginBottom: '2rem'
                    }}
                  />
                )}

                {/* Sezioni pagina */}
                {pages[currentPageIndex]?.contenuto_json && (
                  <div className="space-y-8">
                    {(() => {
                      try {
                        const contentData = JSON.parse(pages[currentPageIndex].contenuto_json);
                        if (contentData.sections && contentData.sections.length > 0) {
                          return contentData.sections.map((section, index) => (
                            <div
                              key={section.id || index}
                              className="border-b pb-8 last:border-0"
                              style={{ borderColor: globalStyles?.border_color || '#e5e7eb' }}
                            >
                              <h2
                                className="text-2xl font-semibold mb-4"
                                style={{
                                  color: globalStyles?.primary_color || '#3b82f6',
                                  fontFamily: globalStyles?.heading_font || 'Inter, sans-serif'
                                }}
                              >
                                {(typeof section.aiGeneratedContent?.title === 'string' ? section.aiGeneratedContent.title : section.data?.title) || `Sezione ${index + 1}`}
                              </h2>
                              {(typeof section.aiGeneratedContent?.subtitle === 'string' ? section.aiGeneratedContent.subtitle : section.data?.subtitle) && (
                                <p
                                  className="text-lg mb-4"
                                  style={{ color: globalStyles?.secondary_color || '#64748b' }}
                                >
                                  {typeof section.aiGeneratedContent?.subtitle === 'string' ? section.aiGeneratedContent.subtitle : section.data?.subtitle}
                                </p>
                              )}

                              {/* Contenuto AI-generated o fallback */}
                              <div className="mb-6" style={{ color: globalStyles?.font_color || '#333333' }}>
                                {section.aiGeneratedContent?.content && typeof section.aiGeneratedContent.content === 'string' ? (
                                  <div dangerouslySetInnerHTML={{ __html: section.aiGeneratedContent.content }} />
                                ) : section.aiGeneratedContent?.description && typeof section.aiGeneratedContent.description === 'string' ? (
                                  <p>{section.aiGeneratedContent.description}</p>
                                ) : (
                                  <div className="space-y-4">
                                    {section.type === 'hero' && (
                                      <div className="text-center">
                                        <h3 className="text-2xl font-bold mb-4">
                                          {typeof section.aiGeneratedContent?.title === 'string' ? section.aiGeneratedContent.title : 'Titolo Hero'}
                                        </h3>
                                        <p className="text-lg">
                                          {typeof section.aiGeneratedContent?.subtitle === 'string' ? section.aiGeneratedContent.subtitle : 'Sottotitolo Hero'}
                                        </p>
                                        {section.aiGeneratedContent?.callToAction?.text && (
                                          <button className="mt-4 px-6 py-3 rounded text-white font-semibold"
                                            style={{ backgroundColor: globalStyles?.primary_color || '#3b82f6' }}>
                                            {section.aiGeneratedContent.callToAction.text}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {section.type === 'services' && (
                                      <div>
                                        <h3 className="text-2xl font-bold mb-6">I Nostri Servizi</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {(section.aiGeneratedContent?.services || ['Servizio 1', 'Servizio 2']).map((service, idx) => (
                                            <div key={idx} className="p-4 border rounded"
                                              style={{ borderColor: globalStyles?.border_color || '#e5e7eb' }}>
                                              <h4 className="font-semibold">{service}</h4>
                                              <p className="text-sm mt-2">{typeof section.aiGeneratedContent?.descriptions?.[idx] === 'string' ? section.aiGeneratedContent.descriptions[idx] : `Descrizione ${service}`}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Debug info - mostra solo se è contentuto AI */}
                              {section.aiGeneratedContent && (
                                <div
                                  className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-800 mb-4"
                                >
                                  ✅ Contenuto generato dall'AI
                                </div>
                              )}
                            </div>
                          ));
                        }
                      } catch (e) {
                        return (
                          <div className="text-yellow-600">
                            Errore nel parsing del contenuto della pagina
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicatore stato generazione/deploy */}
      {(isGenerating || isDeploying) && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-40">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">
              {isGenerating ? 'Generazione sito in corso...' : 'Deploy su VPS in corso...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteBuilderUNIFIED;