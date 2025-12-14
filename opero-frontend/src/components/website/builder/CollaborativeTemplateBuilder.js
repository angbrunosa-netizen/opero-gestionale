/**
 * Collaborative Template Builder
 * Template builder con editing collaborativo AI-enhanced
 */

import React, { useState, useEffect } from 'react';
import { FaRobot, FaEdit, FaSave, FaUndo, FaEye, FaTrash, FaMagic } from 'react-icons/fa';
import TemplatePageBuilder from './TemplatePageBuilder';
import SectionEditor from './SectionEditor';
import AICollaborativeService from '../../../services/aiCollaborativeService';

const CollaborativeTemplateBuilder = ({
  initialTemplate,
  websiteId,
  globalStyles,
  onSave,
  theme = 'default'
}) => {
  const [template, setTemplate] = useState(initialTemplate || { sections: [] });
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    if (initialTemplate) {
      // Assicura che tutte le sezioni abbiano ID univoci
      const templateWithIds = {
        ...initialTemplate,
        sections: (initialTemplate.sections || []).map((section, index) => ({
          ...section,
          id: section.id || `collab_section_${Date.now()}_${index}` // Assicura ID univoco
        }))
      };
      setTemplate(templateWithIds);
    } else {
      setTemplate({ sections: [] });
    }
  }, [initialTemplate]);

  // Seleziona una sezione per l'editing
  const selectSection = (index) => {
    setSelectedSectionIndex(index);
    setPreviewMode(false);
  };

  // Aggiorna sezione
  const updateSection = (updatedSection) => {
    const newSections = [...template.sections];
    newSections[selectedSectionIndex] = updatedSection;

    setTemplate({
      ...template,
      sections: newSections,
      lastModified: new Date().toISOString()
    });

    setIsDirty(true);
  };

  // Aggiungi nuova sezione
  const addSection = async (sectionType) => {
    try {
      setAiLoading(true);

      // Genera contenuto base con AI
      const companyInfo = {
        name: 'Azienda Cliente',
        description: 'Descrizione aziendale',
        industry: 'Tecnologia'
      };

      const sectionTemplate = await AICollaborativeService.generateSectionTemplate({
        sectionType,
        companyInfo,
        theme
      });

      const newSection = {
        id: `section_${Date.now()}`,
        type: sectionType,
        content: sectionTemplate.content,
        aiGenerated: true,
        createdAt: new Date().toISOString(),
        ...sectionTemplate
      };

      setTemplate({
        ...template,
        sections: [...template.sections, newSection]
      });

      setIsDirty(true);

    } catch (error) {
      console.error('Errore aggiunta sezione:', error);

      // Fallback: sezione vuota
      const newSection = {
        id: `section_${Date.now()}`,
        type: sectionType,
        content: {},
        aiGenerated: false,
        createdAt: new Date().toISOString()
      };

      setTemplate({
        ...template,
        sections: [...template.sections, newSection]
      });

      setIsDirty(true);
    } finally {
      setAiLoading(false);
    }
  };

  // Elimina sezione
  const deleteSection = (index) => {
    if (window.confirm('Sei sicuro di voler eliminare questa sezione?')) {
      const newSections = template.sections.filter((_, i) => i !== index);
      setTemplate({
        ...template,
        sections: newSections
      });

      if (selectedSectionIndex === index) {
        setSelectedSectionIndex(null);
        setPreviewMode(true);
      }

      setIsDirty(true);
    }
  };

  // Richiedi suggerimenti AI per l'intero template
  const requestAISuggestions = async () => {
    try {
      setAiLoading(true);

      const suggestions = [];

      // Analizza coerenza
      const consistency = await AICollaborativeService.analyzeConsistency({
        sections: template.sections,
        globalStyle: globalStyles
      });

      suggestions.push({
        type: 'consistency',
        title: 'Analisi Coerenza',
        icon: <FaMagic />,
        content: consistency,
        action: 'fix-consistency'
      });

      // Per ogni sezione, genera suggerimenti
      for (let i = 0; i < template.sections.length; i++) {
        const section = template.sections[i];

        // Valuta qualità
        const quality = await AICollaborativeService.evaluateContentQuality({
          content: section.content,
          sectionType: section.type,
          targetAudience: 'B2B'
        });

        if (quality.overallScore < 70) {
          suggestions.push({
            type: 'quality',
            sectionIndex: i,
            title: `Migliora ${section.type}`,
            icon: <FaEdit />,
            content: quality,
            action: 'improve-section'
          });
        }

        // SEO suggestions per le sezioni testuali
        if (['hero', 'about', 'services'].includes(section.type)) {
          const seo = await AICollaborativeService.suggestSEOImprovements({
            content: JSON.stringify(section.content),
            keywords: [],
            targetAudience: 'B2B'
          });

          if (seo.overallScore < 80) {
            suggestions.push({
              type: 'seo',
              sectionIndex: i,
              title: `Ottimizza SEO ${section.type}`,
              icon: <FaRobot />,
              content: seo,
              action: 'optimize-seo'
            });
          }
        }
      }

      setAiSuggestions(suggestions);
      setAiSuggestionsOpen(true);

    } catch (error) {
      console.error('Errore suggerimenti AI:', error);
      alert('Impossibile generare suggerimenti AI: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Applica suggerimento AI
  const applyAISuggestion = async (suggestion) => {
    try {
      setAiLoading(true);

      switch (suggestion.action) {
        case 'fix-consistency':
          // Applica correzioni di coerenza
          for (const issue of suggestion.content.styleIssues) {
            const sectionIndex = template.sections.findIndex(s => s.type === issue.section);
            if (sectionIndex >= 0) {
              const section = template.sections[sectionIndex];
              // Applica correzione suggerita
              const updatedSection = { ...section };
              // Logica per applicare correzioni...
              updateSection(updatedSection);
            }
          }
          break;

        case 'improve-section':
          // Migliora sezione specifica
          const improveResponse = await AICollaborativeService.requestSectionAssistance({
            sectionType: template.sections[suggestion.sectionIndex].type,
            currentContent: template.sections[suggestion.sectionIndex].content,
            request: "Migliora la qualità generale del contenuto basandoti sui suggerimenti forniti",
            context: { theme, globalStyles }
          });

          const improvedSection = {
            ...template.sections[suggestion.sectionIndex],
            content: improveResponse.updatedContent,
            aiEnhanced: true,
            lastAIGenerated: new Date().toISOString()
          };

          updateSection(improvedSection);
          break;

        case 'optimize-seo':
          // Ottimizza SEO sezione
          const seoResponse = await AICollaborativeService.requestSectionAssistance({
            sectionType: template.sections[suggestion.sectionIndex].type,
            currentContent: template.sections[suggestion.sectionIndex].content,
            request: "Ottimizza il contenuto per SEO basandoti sui suggerimenti forniti",
            context: { theme, globalStyles }
          });

          const seoOptimizedSection = {
            ...template.sections[suggestion.sectionIndex],
            content: seoResponse.updatedContent,
            seoOptimized: true,
            lastSEOUpdate: new Date().toISOString()
          };

          updateSection(seoOptimizedSection);
          break;

        default:
          console.log('Suggerimento non riconosciuto:', suggestion.action);
      }

      setAiSuggestionsOpen(false);

    } catch (error) {
      console.error('Errore applicazione suggerimento:', error);
      alert('Impossibile applicare il suggerimento: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Salva template completo
  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave({
          ...template,
          lastModified: new Date().toISOString(),
          manuallyEdited: true
        });
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio: ' + error.message);
    }
  };

  // Annulla modifiche
  const handleReset = () => {
    if (window.confirm('Sei sicuro di voler annullare tutte le modifiche?')) {
      setTemplate(initialTemplate || { sections: [] });
      setSelectedSectionIndex(null);
      setPreviewMode(true);
      setIsDirty(false);
      setAiSuggestions([]);
    }
  };

  const availableSectionTypes = [
    { type: 'hero', label: 'Hero', icon: '🏠' },
    { type: 'about', label: 'Chi Siamo', icon: '👥' },
    { type: 'services', label: 'Servizi', icon: '⚡' },
    { type: 'contact', label: 'Contatti', icon: '📞' },
    { type: 'gallery', label: 'Galleria', icon: '🖼️' },
    { type: 'testimonials', label: 'Testimonianze', icon: '⭐' },
    { type: 'cta', label: 'Call to Action', icon: '🚀' }
  ];

  return (
    <div className="collaborative-template-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="builder-title">
          <h2>Website Builder Collaborativo</h2>
          {isDirty && <span className="dirty-indicator">● Modifiche non salvate</span>}
        </div>

        <div className="builder-actions">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn ${previewMode ? 'btn-secondary' : 'btn-primary'}`}
          >
            <FaEye /> {previewMode ? 'Modifica' : 'Anteprima'}
          </button>

          <button
            onClick={requestAISuggestions}
            disabled={aiLoading || template.sections.length === 0}
            className="btn btn-info"
          >
            <FaRobot /> {aiLoading ? 'Analizzando...' : 'Suggerimenti AI'}
          </button>

          {isDirty && (
            <>
              <button
                onClick={handleSave}
                className="btn btn-success"
              >
                <FaSave /> Salva
              </button>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
              >
                <FaUndo /> Annulla
              </button>
            </>
          )}
        </div>
      </div>

      <div className="builder-content">
        {/* Sidebar */}
        <div className="builder-sidebar">
          <div className="section-list">
            <h3>Sezioni</h3>

            {template.sections.map((section, index) => (
              <div
                key={section.id}
                className={`section-item ${selectedSectionIndex === index ? 'active' : ''}`}
                onClick={() => selectSection(index)}
              >
                <div className="section-info">
                  <span className="section-icon">
                    {availableSectionTypes.find(t => t.type === section.type)?.icon || '📄'}
                  </span>
                  <div>
                    <div className="section-title">
                      {section.type} {section.manuallyEdited && '✏️'}
                    </div>
                    <div className="section-status">
                      {section.aiGenerated && '🤖'}
                      {section.aiEnhanced && '✨'}
                      {section.seoOptimized && '🔍'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(index);
                  }}
                  className="delete-section"
                  title="Elimina sezione"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            {template.sections.length === 0 && (
              <div className="empty-state">
                <p>Nessuna sezione aggiunta</p>
                <p>Clicca su "Aggiungi Sezione" per iniziare</p>
              </div>
            )}
          </div>

          {/* Aggiungi sezione */}
          <div className="add-section">
            <h4>Aggiungi Sezione</h4>
            <div className="section-types">
              {availableSectionTypes.map(sectionType => (
                <button
                  key={sectionType.type}
                  onClick={() => addSection(sectionType.type)}
                  disabled={aiLoading}
                  className="section-type-btn"
                  title={sectionType.label}
                >
                  <span className="section-icon">{sectionType.icon}</span>
                  <span className="section-label">{sectionType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="builder-main">
          {previewMode || selectedSectionIndex === null ? (
            // Modalità anteprima
            <div className="preview-container">
              <TemplatePageBuilder
                initialTemplate={template}
                websiteId={websiteId}
                globalStyles={globalStyles}
                onSectionClick={selectSection}
                previewMode={true}
              />
            </div>
          ) : (
            // Modalità editing sezione
            <div className="section-editor-container">
              <SectionEditor
                section={template.sections[selectedSectionIndex]}
                onUpdate={updateSection}
                onAIAssist={async (request) => {
                  try {
                    return await AICollaborativeService.requestSectionAssistance({
                      ...request,
                      context: {
                        theme,
                        globalStyles,
                        sectionId: template.sections[selectedSectionIndex].id,
                        websiteId
                      }
                    });
                  } catch (error) {
                    throw new Error('Errore assistenza AI: ' + error.message);
                  }
                }}
                globalStyles={globalStyles}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {aiSuggestionsOpen && (
        <div className="ai-suggestions-modal">
          <div className="modal-overlay" onClick={() => setAiSuggestionsOpen(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3><FaRobot /> Suggerimenti AI</h3>
              <button
                onClick={() => setAiSuggestionsOpen(false)}
                className="close-modal"
              >
                ×
              </button>
            </div>

            <div className="suggestions-list">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  <div className="suggestion-header">
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    <h4>{suggestion.title}</h4>
                    <span className="suggestion-type">{suggestion.type}</span>
                  </div>

                  <div className="suggestion-details">
                    {suggestion.type === 'quality' && (
                      <div>
                        <p>Score: {suggestion.content.overallScore}/100</p>
                        {suggestion.content.suggestions.length > 0 && (
                          <ul>
                            {suggestion.content.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {suggestion.type === 'seo' && (
                      <div>
                        <p>SEO Score: {suggestion.content.overallScore}/100</p>
                        <p><strong>Meta Description:</strong> {suggestion.content.metaDescription}</p>
                        {suggestion.content.readabilityImprovements.length > 0 && (
                          <div>
                            <strong>Miglioramenti:</strong>
                            <ul>
                              {suggestion.content.readabilityImprovements.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {suggestion.type === 'consistency' && (
                      <div>
                        <p>Coerenza: {suggestion.content.overallConsistency}%</p>
                        {suggestion.content.recommendations.length > 0 && (
                          <ul>
                            {suggestion.content.recommendations.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="suggestion-actions">
                    <button
                      onClick={() => applyAISuggestion(suggestion)}
                      disabled={aiLoading}
                      className="btn btn-primary"
                    >
                      <FaMagic /> Applica Suggerimento
                    </button>
                  </div>
                </div>
              ))}

              {aiSuggestions.length === 0 && !aiLoading && (
                <div className="no-suggestions">
                  <p>🎉 Ottimo lavoro! Non ci sono suggerimenti di miglioramento al momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .collaborative-template-builder {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f5f5f5;
        }

        .builder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: white;
          border-bottom: 1px solid #ddd;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .builder-title h2 {
          margin: 0;
          color: #333;
        }

        .dirty-indicator {
          color: #dc3545;
          font-size: 12px;
          margin-left: 10px;
        }

        .builder-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .builder-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .builder-sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #ddd;
          display: flex;
          flex-direction: column;
        }

        .section-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .section-list h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .section-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .section-item:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }

        .section-item.active {
          border-color: #007bff;
          background: #e3f2fd;
        }

        .section-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .section-icon {
          font-size: 20px;
        }

        .section-title {
          font-weight: 600;
          color: #333;
        }

        .section-status {
          font-size: 12px;
          color: #666;
        }

        .delete-section {
          background: none;
          border: none;
          color: #dc3545;
          cursor: pointer;
          padding: 4px;
        }

        .empty-state {
          text-align: center;
          color: #666;
          padding: 20px;
        }

        .add-section {
          border-top: 1px solid #ddd;
          padding: 20px;
        }

        .add-section h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .section-types {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .section-type-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .section-type-btn:hover {
          border-color: #007bff;
          background: #e3f2fd;
        }

        .section-label {
          font-size: 10px;
          color: #666;
        }

        .builder-main {
          flex: 1;
          overflow: auto;
          background: white;
        }

        .preview-container {
          height: 100%;
        }

        .section-editor-container {
          height: 100%;
          overflow: auto;
        }

        .ai-suggestions-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .suggestions-list {
          padding: 20px;
          overflow-y: auto;
        }

        .suggestion-card {
          border: 1px solid #ddd;
          border-radius: 6px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }

        .suggestion-icon {
          font-size: 20px;
        }

        .suggestion-header h4 {
          flex: 1;
          margin: 0;
          color: #333;
        }

        .suggestion-type {
          background: #007bff;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .suggestion-details {
          padding: 15px;
        }

        .suggestion-details ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .suggestion-actions {
          padding: 15px;
          border-top: 1px solid #ddd;
          background: #f8f9fa;
        }

        .no-suggestions {
          text-align: center;
          padding: 40px;
          color: #28a745;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default CollaborativeTemplateBuilder;