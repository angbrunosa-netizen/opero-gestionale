/**
 * Section Editor Component
 * Editor avanzato per modificare sezioni create dall'AI con assistenza collaborativa
 */

import React, { useState, useEffect } from 'react';
import {
  FaEdit,
  FaSave,
  FaUndo,
  FaRobot,
  FaMagic,
  FaPalette,
  FaFont,
  FaImage,
  FaComments,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const SectionEditor = ({
  section,
  onUpdate,
  onAIAssist,
  globalStyles,
  theme = 'default'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(section?.content || {});
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [currentAiRequest, setCurrentAiRequest] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    setEditedContent(section?.content || {});
  }, [section]);

  // Salva le modifiche
  const handleSave = () => {
    onUpdate({
      ...section,
      content: editedContent,
      lastModified: new Date().toISOString(),
      manuallyEdited: true
    });
    setIsEditing(false);
    setActiveField(null);
  };

  // Annulla le modifiche
  const handleCancel = () => {
    setEditedContent(section?.content || {});
    setIsEditing(false);
    setActiveField(null);
  };

  // Richiedi assistenza AI
  const requestAIAssistance = async (request) => {
    setAiLoading(true);
    try {
      const response = await onAIAssist({
        sectionType: section.type,
        currentContent: editedContent,
        request: request,
        context: {
          theme,
          globalStyles,
          sectionId: section.id
        }
      });

      setAiMessages([
        ...aiMessages,
        { type: 'user', text: request },
        { type: 'ai', text: response.suggestion, content: response.updatedContent }
      ]);

      // Applica automaticamente i suggerimenti AI
      if (response.updatedContent) {
        setEditedContent(response.updatedContent);
      }
    } catch (error) {
      console.error('Errore assistenza AI:', error);
      setAiMessages([
        ...aiMessages,
        { type: 'user', text: request },
        { type: 'error', text: 'Mi dispiace, non ho potuto elaborare la richiesta. Riprova.' }
      ]);
    } finally {
      setAiLoading(false);
      setCurrentAiRequest('');
    }
  };

  // Modifica campo specifico
  const updateField = (fieldPath, value) => {
    const paths = fieldPath.split('.');
    const newContent = { ...editedContent };

    let current = newContent;
    for (let i = 0; i < paths.length - 1; i++) {
      if (!current[paths[i]]) current[paths[i]] = {};
      current = current[paths[i]];
    }

    current[paths[paths.length - 1]] = value;
    setEditedContent(newContent);
  };

  // Renderizza il contenuto della sezione in modalità editing
  const renderEditableContent = () => {
    const { type } = section;

    switch (type) {
      case 'hero':
        return (
          <div className="hero-editor">
            <div className="form-group">
              <label><FaFont /> Titolo Principale</label>
              <input
                type="text"
                value={editedContent.headline || ''}
                onChange={(e) => updateField('headline', e.target.value)}
                onFocus={() => setActiveField('headline')}
                className="form-control"
                placeholder="Inserisci titolo principale"
              />
            </div>

            <div className="form-group">
              <label><FaFont /> Sottotitolo</label>
              <textarea
                value={editedContent.subheadline || ''}
                onChange={(e) => updateField('subheadline', e.target.value)}
                onFocus={() => setActiveField('subheadline')}
                className="form-control"
                rows={3}
                placeholder="Inserisci sottotitolo"
              />
            </div>

            <div className="form-group">
              <label><FaImage /> Testo Pulsante CTA</label>
              <input
                type="text"
                value={editedContent.ctaText || ''}
                onChange={(e) => updateField('ctaText', e.target.value)}
                className="form-control"
                placeholder="Testo pulsante"
              />
            </div>

            <div className="form-group">
              <label><FaImage /> URL Background</label>
              <input
                type="text"
                value={editedContent.backgroundImage || ''}
                onChange={(e) => updateField('backgroundImage', e.target.value)}
                className="form-control"
                placeholder="URL immagine di sfondo"
              />
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="services-editor">
            <div className="form-group">
              <label><FaFont /> Titolo Sezione</label>
              <input
                type="text"
                value={editedContent.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="form-control"
                placeholder="Titolo della sezione servizi"
              />
            </div>

            <div className="services-list">
              {editedContent.services?.map((service, index) => (
                <div key={index} className="service-item">
                  <h4>Servizio {index + 1}</h4>
                  <div className="form-group">
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => updateField(`services.${index}.title`, e.target.value)}
                      className="form-control"
                      placeholder="Titolo servizio"
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      value={service.description || ''}
                      onChange={(e) => updateField(`services.${index}.description`, e.target.value)}
                      className="form-control"
                      rows={2}
                      placeholder="Descrizione servizio"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      value={service.icon || ''}
                      onChange={(e) => updateField(`services.${index}.icon`, e.target.value)}
                      className="form-control"
                      placeholder="Icona (es: fa-cog)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="about-editor">
            <div className="form-group">
              <label><FaFont /> Titolo</label>
              <input
                type="text"
                value={editedContent.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="form-control"
                placeholder="Titolo sezione chi siamo"
              />
            </div>

            <div className="form-group">
              <label><FaFont /> Descrizione</label>
              <textarea
                value={editedContent.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="form-control"
                rows={5}
                placeholder="Descrizione aziendale"
              />
            </div>

            <div className="form-group">
              <label><FaImage /> URL Immagine</label>
              <input
                type="text"
                value={editedContent.imageUrl || ''}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                className="form-control"
                placeholder="URL immagine aziendale"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="contact-editor">
            <div className="form-group">
              <label><FaFont /> Titolo</label>
              <input
                type="text"
                value={editedContent.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="form-control"
                placeholder="Titolo sezione contatti"
              />
            </div>

            <div className="form-group">
              <label>Indirizzo</label>
              <input
                type="text"
                value={editedContent.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="form-control"
                placeholder="Via, numero, città"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editedContent.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                className="form-control"
                placeholder="email@azienda.it"
              />
            </div>

            <div className="form-group">
              <label>Telefono</label>
              <input
                type="tel"
                value={editedContent.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                className="form-control"
                placeholder="+39 0XX XXXXXXX"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="generic-editor">
            <div className="form-group">
              <label>Contenuto (JSON)</label>
              <textarea
                value={JSON.stringify(editedContent, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditedContent(parsed);
                  } catch (err) {
                    // JSON non valido, non aggiorno
                  }
                }}
                className="form-control"
                rows={10}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        );
    }
  };

  // Suggerimenti AI predefiniti
  const aiSuggestions = [
    {
      icon: <FaMagic />,
      text: "Migliora il testo",
      request: "Puoi migliorare il testo rendendolo più professionale e coinvolgente?"
    },
    {
      icon: <FaPalette />,
      text: "Suggerisci colori",
      request: "Puoi suggerire una combinazione di colori più adatta a questo tipo di azienda?"
    },
    {
      icon: <FaFont />,
      text: "Ottimizza titoli",
      request: "Puoi rendere i titoli più accattivanti e SEO-friendly?"
    },
    {
      icon: <FaComments />,
      text: "Aggiungi contenuti",
      request: "Puoi suggerire altri contenuti che potrebbero interessare in questa sezione?"
    }
  ];

  return (
    <div className="section-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="editor-title">
          <h3>Modifica Sezione: {section?.type}</h3>
          {section?.manuallyEdited && (
            <span className="edited-badge">✓ Modificato</span>
          )}
        </div>

        <div className="editor-actions">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <FaEdit /> Modifica
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="btn btn-success"
              >
                <FaSave /> Salva
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                <FaUndo /> Annulla
              </button>
            </>
          )}

          <button
            onClick={() => setAiChatOpen(!aiChatOpen)}
            className="btn btn-info ai-assist-btn"
          >
            <FaRobot /> Assistenza AI
          </button>
        </div>
      </div>

      {/* Contenuto Editor */}
      <div className={`editor-content ${isEditing ? 'editing' : 'preview'}`}>
        {isEditing ? (
          renderEditableContent()
        ) : (
          <div className="preview-content">
            <p>Modalità anteprima. Clicca su "Modifica" per apportare cambiamenti.</p>
          </div>
        )}
      </div>

      {/* AI Assistant Chat */}
      {aiChatOpen && (
        <div className="ai-assistant-chat">
          <div className="ai-chat-header">
            <h4><FaRobot /> Assistente AI</h4>
            <button
              onClick={() => setAiChatOpen(false)}
              className="close-chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Suggerimenti rapidi */}
          <div className="ai-suggestions">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => requestAIAssistance(suggestion.request)}
                disabled={aiLoading}
                className="suggestion-btn"
              >
                {suggestion.icon}
                {suggestion.text}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="ai-messages">
            {aiMessages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="message ai">
                <div className="message-content loading">
                  <FaRobot className="spin" /> Sto elaborando...
                </div>
              </div>
            )}
          </div>

          {/* Input personalizzato */}
          <div className="ai-input">
            <input
              type="text"
              value={currentAiRequest}
              onChange={(e) => setCurrentAiRequest(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && currentAiRequest.trim()) {
                  requestAIAssistance(currentAiRequest);
                }
              }}
              placeholder="Chiedi all'AI di migliorare questa sezione..."
              className="form-control"
              disabled={aiLoading}
            />
            <button
              onClick={() => {
                if (currentAiRequest.trim()) {
                  requestAIAssistance(currentAiRequest);
                }
              }}
              disabled={aiLoading || !currentAiRequest.trim()}
              className="btn btn-primary"
            >
              <FaComments /> Invia
            </button>
          </div>
        </div>
      )}

      <style>{`
        .section-editor {
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 20px 0;
          background: #fff;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #ddd;
        }

        .editor-title h3 {
          margin: 0;
          color: #333;
        }

        .edited-badge {
          background: #28a745;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: 10px;
        }

        .editor-actions {
          display: flex;
          gap: 10px;
        }

        .ai-assist-btn {
          background: #007bff;
          color: white;
          border: none;
        }

        .editor-content {
          padding: 20px;
        }

        .editor-content.editing {
          background: #f8f9fa;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .services-list {
          display: grid;
          gap: 20px;
        }

        .service-item {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          background: white;
        }

        .service-item h4 {
          margin: 0 0 15px 0;
          color: #007bff;
        }

        .ai-assistant-chat {
          border-top: 1px solid #ddd;
          background: #f8f9fa;
        }

        .ai-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: #e9ecef;
          border-bottom: 1px solid #ddd;
        }

        .ai-chat-header h4 {
          margin: 0;
          color: #333;
        }

        .close-chat {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
        }

        .ai-suggestions {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          flex-wrap: wrap;
        }

        .suggestion-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          border: 1px solid #007bff;
          background: white;
          color: #007bff;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;
        }

        .suggestion-btn:hover {
          background: #007bff;
          color: white;
        }

        .suggestion-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ai-messages {
          padding: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        .message {
          margin-bottom: 15px;
        }

        .message.user {
          text-align: right;
        }

        .message.ai {
          text-align: left;
        }

        .message.error {
          text-align: center;
        }

        .message-content {
          display: inline-block;
          padding: 10px 15px;
          border-radius: 18px;
          max-width: 70%;
        }

        .message.user .message-content {
          background: #007bff;
          color: white;
        }

        .message.ai .message-content {
          background: white;
          border: 1px solid #ddd;
        }

        .message.error .message-content {
          background: #dc3545;
          color: white;
        }

        .message.loading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ai-input {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          background: white;
          border-top: 1px solid #ddd;
        }

        .ai-input .form-control {
          flex: 1;
        }

        .btn {
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background 0.3s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SectionEditor;