/**
 * Website Image Service
 * Servizio per gestire le immagini dei siti web e il loro collegamento con l'archivio
 */

import { api } from './api';

class WebsiteImageService {
  /**
   * Collega un'immagine esistente dall'archivio a un sito web
   * @param {number} websiteId - ID del sito web
   * @param {number} fileId - ID del file nell'archivio
   * @param {Object} options - Opzioni aggiuntive (privacy, description, etc.)
   */
  static async linkImageToWebsite(websiteId, fileId, options = {}) {
    try {
      // Verifica prima se l'immagine è già collegata a questo sito
      const existingLink = await this.checkImageLink(websiteId, fileId);

      if (existingLink) {
        console.log('Immagine già collegata al sito web');
        return existingLink;
      }

      // Collega l'immagine al sito web usando l'API di archivio
      // Usiamo FormData per simulare un upload ma passiamo l'ID del file esistente
      const formData = new FormData();
      formData.append('existingFileId', fileId);
      formData.append('entitaId', websiteId);
      formData.append('entitaTipo', 'siti_web_aziendali');
      formData.append('privacy', options.privacy || 'public');

      if (options.idDitta) {
        formData.append('idDitta', options.idDitta);
      }

      const response = await api.post('/archivio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Errore nel collegare l\'immagine al sito web:', error);
      throw error;
    }
  }

  /**
   * Verifica se un'immagine è già collegata a un sito web
   * @param {number} websiteId - ID del sito web
   * @param {number} fileId - ID del file
   */
  static async checkImageLink(websiteId, fileId) {
    try {
      const response = await api.get(`/archivio/entita/siti_web_aziendali/${websiteId}`);
      const links = response.data;
      return links.find(link => link.id_file === fileId);
    } catch (error) {
      console.error('Errore nel verificare il collegamento immagine:', error);
      return null;
    }
  }

  /**
   * Ottiene le immagini di un sito web dall'archivio
   * @param {number} websiteId - ID del sito web
   */
  static async getWebsiteImages(websiteId) {
    try {
      const response = await api.get(`/archivio/entita/siti_web_aziendali/${websiteId}`);

      // Filtra solo le immagini
      return response.data.filter(file => file.mime_type?.startsWith('image/'));
    } catch (error) {
      console.error('Errore nel caricare le immagini del sito web:', error);
      throw error;
    }
  }

  /**
   * Carica una nuova immagine per il sito web
   * @param {number} websiteId - ID del sito web
   * @param {File} file - File dell'immagine
   * @param {Object} options - Opzioni aggiuntive
   */
  static async uploadImage(websiteId, file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entitaId', websiteId);
      formData.append('entitaTipo', 'siti_web_aziendali');
      formData.append('privacy', options.privacy || 'public');

      if (options.idDitta) {
        formData.append('idDitta', options.idDitta);
      }

      const response = await api.post('/archivio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Errore nell\'upload dell\'immagine:', error);
      throw error;
    }
  }

  /**
   * Ottiene tutte le immagini disponibili nell'archivio
   * Filtra solo le immagini e aggiunge info sul collegamento con i siti
   */
  static async getAllAvailableImages() {
    try {
      const response = await api.get('/archivio/all-files');

      // Filtra solo le immagini
      const images = response.data.filter(file => file.mime_type?.startsWith('image/'));

      // Aggiungi info sui collegamenti con siti web
      return images.map(file => ({
        ...file,
        isLinkedToWebsite: file.links_descrizione?.includes('siti_web_aziendali') || false,
        linkedWebsites: this.extractLinkedWebsites(file.links_descrizione)
      }));
    } catch (error) {
      console.error('Errore nel caricare le immagini disponibili:', error);
      throw error;
    }
  }

  /**
   * Estrae i siti web collegati dalla descrizione dei link
   * @param {string} linksDescrizione - Descrizione dei link
   */
  static extractLinkedWebsites(linksDescrizione) {
    if (!linksDescrizione) return [];

    try {
      // Cerca pattern come "siti_web_aziendali:123" nella descrizione
      const matches = linksDescrizione.match(/siti_web_aziendali:(\d+)/g);
      return matches ? matches.map(match => match.split(':')[1]) : [];
    } catch (error) {
      console.error('Errore nell\'estrarre i siti web collegati:', error);
      return [];
    }
  }
}

export default WebsiteImageService;