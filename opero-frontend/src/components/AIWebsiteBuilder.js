// components/AIWebsiteBuilder.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import api from '../services/api';
import ImageGallery from './ImageGallery';
import { hasPermission } from '../auth';

const AIWebsiteBuilder = ({ id_ditta }) => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [pages, setPages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [newPageForm, setNewPageForm] = useState({
    pageType: 'home',
    prompt: '',
    customInstructions: ''
  });
  const [editingPage, setEditingPage] = useState(null);

  useEffect(() => {
    fetchCompanyInfo();
    fetchPages();
    fetchGalleryImages();
  }, [id_ditta]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await api.get(`/ditte/${id_ditta}`);
      setCompanyInfo(response.data);
    } catch (error) {
      console.error('Errore nel recupero delle informazioni aziendali:', error);
      toast.error('Errore nel recupero delle informazioni aziendali');
    }
  };

  const fetchPages = async () => {
    try {
      const response = await api.get(`/ai-website-builder/pages/${id_ditta}`);
      setPages(response.data.pages || []);
    } catch (error) {
      console.error('Errore nel recupero delle pagine:', error);
      toast.error('Errore nel recupero delle pagine');
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await api.get(`/ai-website-builder/gallery-images/${id_ditta}`);
      setGalleryImages(response.data.images || []);
    } catch (error) {
      console.error('Errore nel recupero delle immagini:', error);
      toast.error('Errore nel recupero delle immagini');
    }
  };

  const handleGeneratePage = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/ai-website-builder/generate-page', {
        id_ditta,
        ...newPageForm
      });

      toast.success('Pagina generata con successo!');
      setPages([...pages, response.data]);
      setNewPageForm({
        pageType: 'home',
        prompt: '',
        customInstructions: ''
      });
    } catch (error) {
      console.error('Errore nella generazione della pagina:', error);

      // Gestione specifica degli errori 400/403
      if (error.response) {
        if (error.response.status === 400) {
          toast.error('Richiesta non valida: ' + (error.response.data?.message || 'Controlla i dati inseriti'));
        } else if (error.response.status === 403) {
          toast.error('Non hai i permessi per eseguire questa operazione');
        } else if (error.response.status === 429) {
          toast.error('Troppe richieste. Attendi qualche secondo prima di riprovare.');
        } else {
          toast.error('Errore nel server: ' + (error.response.data?.message || 'Riprova più tardi'));
        }
      } else {
        toast.error('Errore nella generazione della pagina: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPage = async (pageId) => {
    try {
      const page = pages.find(p => p.id === pageId);
      await api.post('/ai-website-builder/publish-page', {
        pageId,
        publishData: JSON.parse(page.contenuto)
      });

      toast.success('Pagina pubblicata con successo!');
      fetchPages();
    } catch (error) {
      console.error('Errore nella pubblicazione della pagina:', error);

      // Gestione specifica degli errori 400/403
      if (error.response) {
        if (error.response.status === 400) {
          toast.error('Dati non validi: ' + (error.response.data?.message || 'Controlla i dati della pagina'));
        } else if (error.response.status === 403) {
          toast.error('Non hai i permessi per pubblicare questa pagina');
        } else if (error.response.status === 404) {
          toast.error('Pagina non trovata');
        } else {
          toast.error('Errore durante la pubblicazione: ' + (error.response.data?.message || 'Riprova più tardi'));
        }
      } else {
        toast.error('Errore nella pubblicazione della pagina: ' + error.message);
      }
    }
  };

  const handleEditPage = (page) => {
    setEditingPage({
      ...page,
      contenuto: JSON.parse(page.contenuto)
    });
  };

  const handleSavePage = async () => {
    try {
      await api.put(`/ai-website-builder/pages/${editingPage.id}`, {
        titolo: editingPage.titolo,
        sottotitolo: editingPage.sottotitolo,
        contenuto: JSON.stringify(editingPage.contenuto)
      });

      toast.success('Pagina salvata con successo!');
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      console.error('Errore nel salvataggio della pagina:', error);

      // Gestione specifica degli errori 400/403
      if (error.response) {
        if (error.response.status === 400) {
          toast.error('Dati non validi: ' + (error.response.data?.message || 'Controlla il contenuto della pagina'));
        } else if (error.response.status === 403) {
          toast.error('Non hai i permessi per modificare questa pagina');
        } else if (error.response.status === 404) {
          toast.error('Pagina non trovata');
        } else {
          toast.error('Errore durante il salvataggio: ' + (error.response.data?.message || 'Riprova più tardi'));
        }
      } else {
        toast.error('Errore nel salvataggio della pagina: ' + error.message);
      }
    }
  };

  const handleUpdateSection = (sectionIndex, field, value) => {
    const updatedContent = [...editingPage.contenuto];
    updatedContent[sectionIndex] = {
      ...updatedContent[sectionIndex],
      [field]: value
    };
    setEditingPage({
      ...editingPage,
      contenuto: updatedContent
    });
  };

  if (!companyInfo) {
    return <div className="loading">Caricamento informazioni aziendali...</div>;
  }

  return (
    <div className="ai-website-builder">
      <div className="builder-header">
        <h1>AI Website Builder per {companyInfo.nome}</h1>
        <div className="builder-tabs">
          <button 
            className={`tab-button ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => setActiveTab('pages')}
          >
            Pagine
          </button>
          <button 
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Galleria Immagini
          </button>
        </div>
      </div>

      {activeTab === 'pages' && (
        <div className="pages-container">
          <div className="new-page-form">
            <h3>Crea Nuova Pagina con AI</h3>
            <form onSubmit={handleGeneratePage}>
              <div className="form-group">
                <label htmlFor="pageType">Tipo di Pagina</label>
                <select
                  id="pageType"
                  value={newPageForm.pageType}
                  onChange={(e) => setNewPageForm({...newPageForm, pageType: e.target.value})}
                >
                  <option value="home">Home</option>
                  <option value="chi-siamo">Chi Siamo</option>
                  <option value="prodotti">Prodotti</option>
                  <option value="servizi">Servizi</option>
                  <option value="contatti">Contatti</option>
                  <option value="gallery">Galleria</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prompt">Descrizione per l'AI</label>
                <textarea
                  id="prompt"
                  value={newPageForm.prompt}
                  onChange={(e) => setNewPageForm({...newPageForm, prompt: e.target.value})}
                  placeholder="Descrivi cosa vuoi nella pagina..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="customInstructions">Istruzioni Aggiuntive</label>
                <textarea
                  id="customInstructions"
                  value={newPageForm.customInstructions}
                  onChange={(e) => setNewPageForm({...newPageForm, customInstructions: e.target.value})}
                  placeholder="Istruzioni specifiche per la generazione..."
                  rows={2}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Generazione in corso...' : 'Genera Pagina'}
              </button>
            </form>
          </div>

          <div className="pages-list">
            <h3>Pagine Esistenti</h3>
            {pages.length === 0 ? (
              <p>Nessuna pagina creata. Usa il modulo sopra per generarne una nuova.</p>
            ) : (
              <div className="pages-grid">
                {pages.map(page => (
                  <div key={page.id} className="page-card">
                    <h4>{page.titolo}</h4>
                    <p>{page.sottotitolo}</p>
                    <div className="page-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEditPage(page)}
                      >
                        Modifica
                      </button>
                      {!page.pubblicato && (
                        <button 
                          className="btn-primary"
                          onClick={() => handlePublishPage(page.id)}
                        >
                          Pubblica
                        </button>
                      )}
                      {page.pubblicato && (
                        <span className="published-badge">Pubblicata</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="gallery-container">
          <h3>Galleria Immagini</h3>
          <p>Queste immagini sono disponibili per l'uso nelle pagine del sito web.</p>
          <ImageGallery 
            images={galleryImages} 
            transitionEffect="fade" 
            showControls={true}
            selectable={true}
            onSelectionChange={(selectedImages) => {
              // Gestisci la selezione delle immagini per l'uso nelle pagine
              console.log('Immagini selezionate:', selectedImages);
            }}
          />
        </div>
      )}

      {editingPage && (
        <div className="page-editor-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Modifica Pagina: {editingPage.titolo}</h2>
              <button 
                className="close-button"
                onClick={() => setEditingPage(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Titolo</label>
                <input
                  type="text"
                  value={editingPage.titolo}
                  onChange={(e) => setEditingPage({...editingPage, titolo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Sottotitolo</label>
                <input
                  type="text"
                  value={editingPage.sottotitolo}
                  onChange={(e) => setEditingPage({...editingPage, sottotitolo: e.target.value})}
                />
              </div>
              
              <h3>Sezioni</h3>
              {editingPage.contenuto.map((section, index) => (
                <div key={index} className="section-editor">
                  <h4>Sezione {index + 1}</h4>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      value={section.type}
                      onChange={(e) => handleUpdateSection(index, 'type', e.target.value)}
                    >
                      <option value="hero">Hero</option>
                      <option value="text">Testo</option>
                      <option value="gallery">Galleria</option>
                      <option value="contact">Contatti</option>
                      <option value="products">Prodotti</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Titolo</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contenuto</label>
                    <textarea
                      value={section.content}
                      onChange={(e) => handleUpdateSection(index, 'content', e.target.value)}
                      rows={5}
                    />
                  </div>
                  {section.type === 'gallery' && (
                    <div className="form-group">
                      <label>Immagini della Galleria</label>
                      <ImageGallery 
                        images={galleryImages} 
                        selectable={true}
                        selectedImages={section.images || []}
                        onSelectionChange={(selectedImages) => 
                          handleUpdateSection(index, 'images', selectedImages)
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setEditingPage(null)}
              >
                Annulla
              </button>
              <button 
                className="btn-primary"
                onClick={handleSavePage}
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWebsiteBuilder;