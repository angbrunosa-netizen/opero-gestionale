/**
 * @file websiteGalleryService.js
 * @description Servizio API per la gestione delle gallerie fotografiche nei siti web
 * @version 1.0
 */

import { api } from './api';

class WebsiteGalleryService {
  /**
   * Recupera tutte le gallerie di un sito web
   * @param {number} siteId - ID del sito web
   * @param {Object} options - Opzioni di filtraggio
   * @returns {Promise<Array>} Lista gallerie
   */
  async getGalleries(siteId, options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.page_id) {
        params.append('page_id', options.page_id);
      }
      if (options.include_inactive !== undefined) {
        params.append('include_inactive', options.include_inactive);
      }

      const response = await api.get(`/website/${siteId}/galleries${params.toString() ? '?' + params.toString() : ''}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nel recupero delle gallerie');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.getGalleries error:', error);
      throw error;
    }
  }

  /**
   * Recupera dettaglio galleria con immagini
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @returns {Promise<Object>} Dettaglio galleria con immagini
   */
  async getGalleryDetail(siteId, galleryId) {
    try {
      const response = await api.get(`/website/${siteId}/galleries/${galleryId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nel recupero del dettaglio galleria');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.getGalleryDetail error:', error);
      throw error;
    }
  }

  /**
   * Crea una nuova galleria
   * @param {number} siteId - ID del sito web
   * @param {Object} galleryData - Dati della galleria
   * @returns {Promise<Object>} Galleria creata
   */
  async createGallery(siteId, galleryData) {
    try {
      const response = await api.post(`/website/${siteId}/galleries`, galleryData);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nella creazione della galleria');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.createGallery error:', error);
      throw error;
    }
  }

  /**
   * Aggiorna galleria esistente
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @param {Object} updateData - Dati da aggiornare
   * @returns {Promise<Object>} Risultato aggiornamento
   */
  async updateGallery(siteId, galleryId, updateData) {
    try {
      const response = await api.put(`/website/${siteId}/galleries/${galleryId}`, updateData);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nell\'aggiornamento della galleria');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.updateGallery error:', error);
      throw error;
    }
  }

  /**
   * Elimina galleria (soft delete)
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @returns {Promise<Object>} Risultato eliminazione
   */
  async deleteGallery(siteId, galleryId) {
    try {
      const response = await api.delete(`/website/${siteId}/galleries/${galleryId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nell\'eliminazione della galleria');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.deleteGallery error:', error);
      throw error;
    }
  }

  /**
   * Aggiunge immagini a una galleria
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @param {Array} images - Array di immagini da aggiungere
   * @returns {Promise<Object>} Risultato aggiunta
   */
  async addImagesToGallery(siteId, galleryId, images) {
    try {
      const response = await api.post(`/website/${siteId}/galleries/${galleryId}/images`, {
        images: images
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nell\'aggiunta delle immagini');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.addImagesToGallery error:', error);
      throw error;
    }
  }

  /**
   * Aggiorna ordinamento immagini nella galleria
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @param {Array} imagesOrder - Array di {id, order_pos}
   * @returns {Promise<Object>} Risultato aggiornamento
   */
  async updateImagesOrder(siteId, galleryId, imagesOrder) {
    try {
      const response = await api.put(`/website/${siteId}/galleries/${galleryId}/images/order`, {
        images_order: imagesOrder
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nell\'aggiornamento dell\'ordinamento');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.updateImagesOrder error:', error);
      throw error;
    }
  }

  /**
   * Rimuove immagine dalla galleria
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @param {number} imageId - ID dell'immagine
   * @returns {Promise<Object>} Risultato rimozione
   */
  async removeImageFromGallery(siteId, galleryId, imageId) {
    try {
      const response = await api.delete(`/website/${siteId}/galleries/${galleryId}/images/${imageId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Errore nella rimozione dell\'immagine');
      }
    } catch (error) {
      console.error('WebsiteGalleryService.removeImageFromGallery error:', error);
      throw error;
    }
  }

  /**
   * Sincronizza galleria con array di immagini (operazione bulk)
   * @param {number} siteId - ID del sito web
   * @param {number} galleryId - ID della galleria
   * @param {Array} images - Nuovo array di immagini
   * @returns {Promise<Object>} Risultato sincronizzazione
   */
  async syncGalleryImages(siteId, galleryId, images) {
    try {
      // Prima recupera le immagini attuali
      const currentGallery = await this.getGalleryDetail(siteId, galleryId);
      const currentImages = currentGallery.images || [];

      // Prepara gli aggiornamenti
      const updates = [];

      // Immagini da aggiungere (nuove)
      const newImages = images.filter(img => !currentImages.find(current => current.id_file === img.id_file));
      if (newImages.length > 0) {
        updates.push(this.addImagesToGallery(siteId, galleryId, newImages));
      }

      // Aggiorna ordinamento
      const newOrder = images.map((img, index) => {
        const currentImg = currentImages.find(current => current.id_file === img.id_file);
        return currentImg ? { id: currentImg.id, order_pos: index } : null;
      }).filter(Boolean);

      if (newOrder.length > 0) {
        updates.push(this.updateImagesOrder(siteId, galleryId, newOrder));
      }

      // Immagini da rimuovere
      const imagesToRemove = currentImages.filter(current => !images.find(img => img.id_file === current.id_file));
      if (imagesToRemove.length > 0) {
        const removePromises = imagesToRemove.map(img =>
          this.removeImageFromGallery(siteId, galleryId, img.id)
        );
        updates.push(Promise.all(removePromises));
      }

      // Esegui tutti gli aggiornamenti in parallelo
      const results = await Promise.all(updates);

      return {
        success: true,
        added: newImages.length,
        updated: newOrder.length,
        removed: imagesToRemove.length,
        results
      };

    } catch (error) {
      console.error('WebsiteGalleryService.syncGalleryImages error:', error);
      throw error;
    }
  }

  /**
   * Converte immagini da AllegatiManager a formato galleria
   * @param {Array} files - Files da AllegatiManager
   * @returns {Array} Formato galleria
   */
  static convertFilesToGalleryImages(files) {
    return files.map((file, index) => ({
      id_file: file.id,
      caption: '',
      alt_text: file.file_name_originale || '',
      title_text: file.file_name_originale || '',
      order_pos: index,
      previewUrl: file.url_file || file.preview_url,
      file_name_originale: file.file_name_originale,
      url_file: file.url_file,
      mime_type: file.mime_type,
      file_size_bytes: file.file_size_bytes,
      s3_key: file.s3_key
    }));
  }

  /**
   * Valida dati galleria prima dell'invio
   * @param {Object} galleryData - Dati da validare
   * @returns {Object} Dati validati e puliti
   */
  static validateGalleryData(galleryData) {
    const cleaned = { ...galleryData };

    // Rimuovi campi non permessi
    delete cleaned.id;
    delete cleaned.created_at;
    delete cleaned.updated_at;

    // Sanitizza nome galleria
    if (cleaned.nome_galleria) {
      cleaned.nome_galleria = cleaned.nome_galleria.trim();
    }

    // Valida layout
    const validLayouts = ['grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel'];
    if (cleaned.layout && !validLayouts.includes(cleaned.layout)) {
      cleaned.layout = 'grid-3';
    }

    // Sanitizza impostazioni JSON
    if (cleaned.impostazioni && typeof cleaned.impostazioni === 'string') {
      try {
        cleaned.impostazioni = JSON.parse(cleaned.impostazioni);
      } catch (e) {
        cleaned.impostazioni = {};
      }
    }

    return cleaned;
  }
}

export default new WebsiteGalleryService();
export { WebsiteGalleryService };