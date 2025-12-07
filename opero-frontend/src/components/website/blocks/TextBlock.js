/**
 * Text Block Component
 * Blocco di testo con editor WYSIWYG semplificato
 */

import React, { useState, useEffect } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const TextBlock = ({ content, onChange, preview = false }) => {
  const [editMode, setEditMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(content?.html || '');

  useEffect(() => {
    if (!editMode && htmlContent !== content?.html) {
      setHtmlContent(content?.html || '');
    }
  }, [content, editMode]);

  const handleSave = () => {
    onChange({ html: htmlContent });
    setEditMode(false);
  };

  if (preview) {
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Contenuto testo...</p>' }}
      />
    );
  }

  return (
    <div>
      {editMode ? (
        <div>
          {/* Toolbar semplice */}
          <div className="border-b border-gray-200 pb-2 mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    document.execCommand('bold', false, null);
                  }
                }}
                className="px-2 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-50"
                title="Grassetto"
              >
                B
              </button>
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    document.execCommand('italic', false, null);
                  }
                }}
                className="px-2 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-50"
                title="Corsivo"
              >
                I
              </button>
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    document.execCommand('underline', false, null);
                  }
                }}
                className="px-2 py-1 text-sm underline border border-gray-300 rounded hover:bg-gray-50"
                title="Sottolineato"
              >
                U
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    document.execCommand('formatBlock', false, 'h2');
                  }
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                title="Titolo H2"
              >
                H2
              </button>
              <button
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    document.execCommand('formatBlock', false, 'p');
                  }
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                title="Paragrafo"
              >
                P
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salva
              </button>
            </div>
          </div>

          {/* Editor contenteditable */}
          <div
            contentEditable
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            onInput={(e) => setHtmlContent(e.target.innerHTML)}
            className="min-h-[200px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            style={{ minHeight: '200px' }}
          />
        </div>
      ) : (
        <div>
          <div
            className="min-h-[100px] p-4 border border-gray-200 rounded-md cursor-pointer hover:border-blue-300 hover:bg-blue-50/50"
            onClick={() => setEditMode(true)}
          >
            {htmlContent ? (
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p className="mb-2">Clicca per aggiungere testo</p>
                <p className="text-sm">Supporta formattazione: grassetto, corsivo, titoli, ecc.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextBlock;