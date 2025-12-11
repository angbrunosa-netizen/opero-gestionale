// routes/aiWebsiteBuilder.js
// Rotte per la generazione di pagine web tramite AI Z.ai
//10/12/2025 ver i z.a

const express = require('express');
const router = express.Router();
const { checkPermission } = require('../utils/auth');
const { knex } = require('../config/db');
const S3Service = require('../services/S3Service');
const axios = require('axios');

// Configurazione API Z.ai
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_API_ENDPOINT = process.env.ZAI_API_ENDPOINT || 'https://api.z.ai/v1';

/**
 * Genera contenuto pagina tramite AI Z.ai
 */
router.post('/generate-page', checkPermission('WS_EDIT'), async (req, res) => {
  try {
    const { id_ditta, pageType, prompt, customInstructions } = req.body;
    
    // Verifica che la ditta abbia id_tipo_ditta = 1
    const ditta = await knex('ditte')
      .where({ id: id_ditta, id_tipo_ditta: 1 })
      .first();
    
    if (!ditta) {
      return res.status(404).json({ error: 'Azienda non trovata o non abilitata al website builder' });
    }
    
    // Recupera informazioni aziendali per il contesto
    const companyInfo = await getCompanyInfo(id_ditta);
    
    // Prepara il prompt per l'API Z.ai
    const aiPrompt = `
      Crea contenuti per una pagina ${pageType} per l'azienda "${companyInfo.nome}".
      Descrizione azienda: ${companyInfo.descrizione}
      Settore: ${companyInfo.settore}
      
      Richiesta specifica: ${prompt}
      Istruzioni aggiuntive: ${customInstructions || 'Nessuna'}
      
      Formatta la risposta in JSON con la seguente struttura:
      {
        "title": "Titolo della pagina",
        "subtitle": "Sottotitolo",
        "sections": [
          {
            "type": "hero|text|gallery|contact|products",
            "title": "Titolo sezione",
            "content": "Contenuto HTML",
            "images": ["url1", "url2"] // solo per gallery
          }
        ]
      }
    `;
    
    // Chiama l'API Z.ai
    const response = await axios.post(`${ZAI_API_ENDPOINT}/generate`, {
      prompt: aiPrompt,
      model: 'z-ai-web-builder',
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${ZAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Salva la pagina generata nel database
    const pageData = JSON.parse(response.data.content);
    const [pageId] = await knex('siti_web_pagine').insert({
      id_ditta,
      titolo: pageData.title,
      sottotitolo: pageData.subtitle,
      tipo: pageType,
      contenuto: JSON.stringify(pageData.sections),
      creato_da: req.user.id,
      created_at: new Date()
    });
    
    res.json({
      success: true,
      pageId,
      content: pageData
    });
    
  } catch (error) {
    console.error('Errore nella generazione della pagina:', error);
    res.status(500).json({ error: 'Errore nella generazione della pagina' });
  }
});

/**
 * Recupera le immagini dallo storage aziendale per la galleria
 */
router.get('/gallery-images/:id_ditta', async (req, res) => {
  try {
    const { id_ditta } = req.params;
    
    // Recupera i file associati alla ditta dal dm_files
    const files = await knex('dm_files')
      .where({ id_ditta, visibile_sito: true })
      .orderBy('created_at', 'desc');
    
    // Genera URL firmati per ogni immagine
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        if (file.mime_type.startsWith('image/')) {
          const url = await S3Service.getSignedUrl(file.s3_key);
          return {
            id: file.id,
            url,
            titolo: file.titolo || file.nome_file,
            descrizione: file.descrizione
          };
        }
        return null;
      })
    );
    
    // Filtra i null e invia la risposta
    res.json({
      success: true,
      images: imageUrls.filter(Boolean)
    });
    
  } catch (error) {
    console.error('Errore nel recupero delle immagini:', error);
    res.status(500).json({ error: 'Errore nel recupero delle immagini' });
  }
});

/**
 * Salva una pagina pubblicata
 */
router.post('/publish-page', checkPermission('WS_PUBLISH'), async (req, res) => {
  try {
    const { pageId, publishData } = req.body;
    
    // Aggiorna lo stato della pagina
    await knex('siti_web_pagine')
      .where({ id: pageId })
      .update({
        pubblicato: true,
        data_pubblicazione: new Date(),
        contenuto_pubblicato: JSON.stringify(publishData),
        updated_at: new Date()
      });
    
    // Genera i file statici della pagina
    await generateStaticPage(pageId);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Errore nella pubblicazione della pagina:', error);
    res.status(500).json({ error: 'Errore nella pubblicazione della pagina' });
  }
});

/**
 * Funzione helper per recuperare informazioni aziendali
 */
async function getCompanyInfo(id_ditta) {
  const ditta = await knex('ditte').where({ id: id_ditta }).first();
  
  // Recupera anche prodotti se esistono
  const prodotti = await knex('ct_catalogo')
    .where({ id_ditta, visibile_sito: true })
    .limit(5);
  
  return {
    nome: ditta.nome,
    descrizione: ditta.descrizione || '',
    settore: ditta.settore || '',
    prodotti: prodotti.map(p => ({
      nome: p.nome,
      descrione: p.descrizione_breve,
      prezzo: p.prezzo
    }))
  };
}

/**
 * Genera i file statici della pagina per Next.js
 */
async function generateStaticPage(pageId) {
  // Recupera i dati della pagina
  const page = await knex('siti_web_pagine')
    .where({ id: pageId })
    .first();
  
  const ditta = await knex('ditte')
    .where({ id: page.id_ditta })
    .first();
  
  // Crea il percorso per la pagina statica
  const pagePath = `websites/${ditta.slug}/${page.tipo}.js`;
  
  // Genera il contenuto del file Next.js
  const pageContent = `
import React from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import ImageGallery from '../../components/ImageGallery';
import { fetchPageData } from '../../lib/api';

const ${page.tipo.charAt(0).toUpperCase() + page.tipo.slice(1)}Page = ({ pageData, companyInfo, galleryImages }) => {
  return (
    <>
      <Head>
        <title>${page.titolo} - ${companyInfo.nome}</title>
        <meta name="description" content="${page.sottotitolo}" />
      </Head>
      
      <div className="company-website">
        <header className="company-header">
          <h1>${companyInfo.nome}</h1>
        </header>
        
        <main className="page-content">
          ${JSON.parse(page.contenuto_pubblicato).map(section => {
            if (section.type === 'gallery') {
              return `<ImageGallery images={galleryImages} transitionEffect="fade" autoPlay={true} />`;
            } else if (section.type === 'hero') {
              return `<section className="hero-section">
                <h2>${section.title}</h2>
                <div>${section.content}</div>
              </section>`;
            } else {
              return `<section className="${section.type}-section">
                <h2>${section.title}</h2>
                <div>${section.content}</div>
              </section>`;
            }
          }).join('\n          ')}
        </main>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const pageData = await fetchPageData('${page.id}');
  const companyInfo = await fetchCompanyInfo('${page.id_ditta}');
  const galleryImages = await fetchGalleryImages('${page.id_ditta}');
  
  return {
    props: {
      pageData,
      companyInfo,
      galleryImages
    },
    revalidate: 3600 // Rigenera ogni ora
  };
};

export default ${page.tipo.charAt(0).toUpperCase() + page.tipo.slice(1)}Page;
`;
  
  // Salva il file nel percorso appropriato per Next.js
  // Questa parte dipende dalla configurazione specifica del tuo progetto
  // Potrebbe essere necessario usare fs.writeFile o un sistema simile
  
  return pagePath;
}

module.exports = router;