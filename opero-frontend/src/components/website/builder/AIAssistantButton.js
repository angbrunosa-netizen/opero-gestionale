/**
 * AI Assistant Button
 * Pulsante flottante per accesso rapido all'assistenza AI
 */

import React, { useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import AICollaborativeService from '../../../services/aiCollaborativeService';

const AIAssistantButton = ({ section, globalStyles, onSectionUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const quickSuggestions = [
    "Migliora questo testo",
    "Rendilo più professionale",
    "Aggiungi dettagli",
    "Ottimizza per SEO",
    "Suggerisci alternative"
  ];

  const handleSendMessage = async (text) => {
    if (!text.trim() || !section) return;

    setLoading(true);
    try {
      const response = await AICollaborativeService.requestSectionAssistance({
        sectionType: section.type,
        currentContent: section.content || {},
        request: text,
        context: {
          theme: 'default',
          globalStyles: globalStyles || {},
          sectionId: section.id
        }
      });

      setMessages([
        ...messages,
        { type: 'user', text },
        { type: 'ai', text: response.suggestion }
      ]);

      // Applica automaticamente i suggerimenti
      if (response.updatedContent && onSectionUpdate) {
        onSectionUpdate({
          ...section,
          content: response.updatedContent,
          aiEnhanced: true
        });
      }

    } catch (error) {
      console.error('Errore assistenza AI:', error);
      setMessages([
        ...messages,
        { type: 'user', text },
        { type: 'error', text: 'Mi dispiace, non ho potuto elaborare la richiesta.' }
      ]);
    } finally {
      setLoading(false);
      setInputText('');
    }
  };

  if (!section) return null;

  return (
    <div className="ai-assistant-button">
      {/* Pulsante principale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`ai-assistant-trigger ${isOpen ? 'active' : ''}`}
        title="Assistente AI"
      >
        <FaRobot />
      </button>

      {/* Pannello assistenza */}
      {isOpen && (
        <div className="ai-assistant-panel">
          <div className="ai-header">
            <h4><FaRobot /> Assistente AI</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              <FaTimes />
            </button>
          </div>

          {/* Suggerimenti rapidi */}
          <div className="ai-suggestions">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                disabled={loading}
                className="suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Messaggi */}
          <div className="ai-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="message ai">
                <FaRobot className="spin" /> Sto elaborando...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="ai-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && inputText.trim()) {
                  handleSendMessage(inputText);
                }
              }}
              placeholder="Chiedi all'AI di migliorare questa sezione..."
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={loading || !inputText.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-assistant-button {
          position: relative;
          z-index: 100;
        }

        .ai-assistant-trigger {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s ease;
        }

        .ai-assistant-trigger:hover {
          background: #0056b3;
          transform: scale(1.05);
        }

        .ai-assistant-trigger.active {
          background: #28a745;
        }

        .ai-assistant-panel {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 350px;
          max-height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .ai-header h4 {
          margin: 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
        }

        .ai-suggestions {
          padding: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 120px;
          overflow-y: auto;
        }

        .suggestion-btn {
          padding: 6px 12px;
          border: 1px solid #007bff;
          background: white;
          color: #007bff;
          border-radius: 16px;
          cursor: pointer;
          font-size: 12px;
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
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          max-height: 200px;
        }

        .message {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 14px;
        }

        .message.user {
          background: #e3f2fd;
          text-align: right;
          margin-left: 40px;
        }

        .message.ai {
          background: #f8f9fa;
          margin-right: 40px;
        }

        .message.error {
          background: #ffebee;
          color: #c62828;
          text-align: center;
        }

        .spin {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ai-input {
          display: flex;
          gap: 8px;
          padding: 15px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .ai-input input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
        }

        .ai-input button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-input button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AIAssistantButton;