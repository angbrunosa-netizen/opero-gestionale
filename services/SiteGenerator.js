// services/SiteGenerator.js
// Servizio per la generazione di siti web statici da database

const fs = require('fs').promises;
const path = require('path');
const { knex } = require('../config/db');
const S3Service = require('./s3Service');

class SiteGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../generated-sites');
    this.templateDir = path.join(__dirname, '../website-generator');
  }

  /**
   * Genera un sito web statico completo
   */
  async generateSite(websiteId, options = {}) {
    console.log(`🚀 Inizio generazione sito per websiteId: ${websiteId}`);

    try {
      // 1. Recupera dati sito e pagine
      const siteData = await this.getSiteData(websiteId);

      if (!siteData) {
        throw new Error('Sito non trovato');
      }

      // 2. Crea struttura directory
      const sitePath = await this.createSiteStructure(siteData);

      // 3. Genera pagine HTML
      await this.generatePages(siteData, sitePath);

      // 4. Copia assets (immagini, CSS, JS)
      await this.copyAssets(siteData, sitePath);

      // 5. Genera configurazione Next.js
      await this.generateNextConfig(siteData, sitePath);

      // 6. Crea package.json
      await this.createPackageJson(siteData, sitePath);

      // 7. Genera file di dati
      await this.generateDataFiles(siteData, sitePath);

      // 8. Genera stili globali
      await this.generateGlobalStyles(siteData, sitePath);

      // 9. Genera componenti base
      await this.generateBaseComponents(siteData, sitePath);

      console.log(`✅ Sito generato con successo in: ${sitePath}`);

      return {
        success: true,
        sitePath,
        siteUrl: `https://${siteData.domain || siteData.site_title}.com`,
        pagesGenerated: siteData.pages.length
      };

    } catch (error) {
      console.error('❌ Errore generazione sito:', error);
      throw error;
    }
  }

  /**
   * Recupera tutti i dati del sito dal database
   */
  async getSiteData(websiteId) {
    console.log(`📊 Recupero dati sito ${websiteId}...`);

    // Validazione input
    if (!websiteId || isNaN(websiteId)) {
      throw new Error('ID sito non valido');
    }

    // Recupera info sito
    const siteResult = await knex('siti_web_aziendali')
      .where({ id: websiteId })
      .first();

    if (!siteResult) {
      console.warn(`⚠️ Sito con ID ${websiteId} non trovato nel database`);
      return null;
    }

    // Recupera pagine pubblicate
    const pages = await knex('pagine_sito_web')
      .where({
        id_sito_web: websiteId,
        is_published: 1
      })
      .orderBy('menu_order', 'titolo');

    // Recupera immagini del sito
    const images = await this.getSiteImages(websiteId);

    // Recupera gallerie
    const galleries = await this.getSiteGalleries(websiteId);

    // Parse JSON e theme config con gestione errori
    let themeConfig = {};
    let pagesWithError = [];

    try {
      themeConfig = siteResult.theme_config ? JSON.parse(siteResult.theme_config) : {};
    } catch (error) {
      console.warn('⚠️ Errore parsing theme_config:', error.message);
    }

    const parsedPages = pages.map(page => {
      let contenutoJson = { sections: [] };
      let hasError = false;

      try {
        contenutoJson = page.contenuto_json ? JSON.parse(page.contenuto_json) : { sections: [] };
        console.log(`📄 Pagina ${page.titolo || page.id} (${page.slug}):`);
        console.log(`  - contenuto_json trovato: ${!!page.contenuto_json}`);
        console.log(`  - sezioni: ${contenutoJson.sections ? contenutoJson.sections.length : 0}`);
        if (contenutoJson.sections && contenutoJson.sections.length > 0) {
          contenutoJson.sections.forEach((section, idx) => {
            console.log(`    * Sez ${idx}: type=${section.type || 'N/D'}, title=${section.title || 'N/D'}`);
          });
        }
      } catch (error) {
        console.warn(`⚠️ Errore parsing contenuto_json per pagina ${page.id}:`, error.message);
        hasError = true;
        contenutoJson = {
          sections: [],
          _parseError: error.message
        };
      }

      if (hasError) {
        pagesWithError.push(page.id);
      }

      return {
        ...page,
        contenuto_json: contenutoJson
      };
    });

    const siteData = {
      ...siteResult,
      theme_config: themeConfig,
      pages: parsedPages,
      images,
      galleries,
      _parseErrors: pagesWithError.length > 0 ? pagesWithError : undefined
    };

    console.log(`📋 Trovati ${siteData.pages.length} pagine, ${images.length} immagini, ${galleries.length} gallerie`);
    return siteData;
  }

  /**
   * Recupera immagini collegate al sito
   */
  async getSiteImages(websiteId) {
    try {
      const images = await knex('dm_files')
        .join('wg_gallery_images gi', 'dm_files.id', 'gi.id_file')
        .join('wg_galleries g', 'gi.id_galleria', 'g.id')
        .where('g.id_sito_web', websiteId)
        .where('g.is_active', 1)
        .select(
          'dm_files.*',
          'gi.caption',
          'gi.alt_text',
          'g.nome_galleria'
        );

      return images.map(img => ({
        ...img,
        url: img.s3_key ? `https://s3.operocloud.it/${img.s3_key}` : null,
        preview_url: img.s3_key ? `https://s3.operocloud.it/${img.s3_key}` : null
      }));
    } catch (error) {
      console.warn('⚠️ Errore recupero immagini sito:', error.message);
      return [];
    }
  }

  /**
   * Recupera gallerie del sito
   */
  async getSiteGalleries(websiteId) {
    return await knex('wg_galleries')
      .where({ id_sito_web: websiteId, is_active: 1 })
      .orderBy('sort_order', 'nome_galleria');
  }

  /**
   * Crea struttura directory del sito
   */
  async createSiteStructure(siteData) {
    const siteName = this.sanitizeSiteName(siteData.site_title || `site-${siteData.id}`);
    const sitePath = path.join(this.outputDir, siteName);

    console.log(`📁 Creazione struttura in: ${sitePath}`);

    // Crea directory principali
    await fs.mkdir(sitePath, { recursive: true });
    await fs.mkdir(path.join(sitePath, 'pages'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'public'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'public', 'images'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'public', 'css'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'public', 'js'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'styles'), { recursive: true });
    await fs.mkdir(path.join(sitePath, 'components'), { recursive: true });

    return sitePath;
  }

  /**
   * Genera pagine Next.js
   */
  async generatePages(siteData, sitePath) {
    console.log(`📄 Generazione ${siteData.pages.length} pagine...`);

    for (const page of siteData.pages) {
      await this.generatePage(page, siteData, sitePath);
    }

    // Genera index.js (home page)
    await this.generateIndexPage(siteData, sitePath);

    // Genera _app.js
    await this.generateAppFile(siteData, sitePath);

    // Genera _document.js
    await this.generateDocumentFile(siteData, sitePath);
  }

  /**
   * Genera index.js (home page)
   */
  async generateIndexPage(siteData, sitePath) {
    const indexPath = path.join(sitePath, 'pages', 'index.js');

    const indexContent = `
import { getSiteData, getPageData } from '../lib/data';
import Layout from '../components/Layout';
import HomePage from '../components/pages/HomePage';

export default function HomePage({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <HomePage content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(${siteData.id});
  const pageData = await getPageData('home', ${siteData.id});

  return {
    props: {
      siteData,
      pageData
    }
  };
}
`;

    await fs.writeFile(indexPath, indexContent);
  }

  /**
   * Genera _app.js
   */
  async generateAppFile(siteData, sitePath) {
    const appPath = path.join(sitePath, 'pages', '_app.js');

    const appContent = `
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;

    await fs.writeFile(appPath, appContent);
  }

  /**
   * Genera _document.js
   */
  async generateDocumentFile(siteData, sitePath) {
    const documentPath = path.join(sitePath, 'pages', '_document.js');

    const documentContent = `
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
`;

    await fs.writeFile(documentPath, documentContent);
  }

  /**
   * Genera configurazione Next.js
   */
  async generateNextConfig(siteData, sitePath) {
    const configPath = path.join(sitePath, 'next.config.js');

    const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
`;

    await fs.writeFile(configPath, configContent);
  }

  /**
   * Crea package.json
   */
  async createPackageJson(siteData, sitePath) {
    const packagePath = path.join(sitePath, 'package.json');

    const packageContent = {
      name: "generated-website",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        export: "next build && next export"
      },
      dependencies: {
        next: "^14.0.0",
        react: "^18.2.0",
        "react-dom": "^18.2.0"
      }
    };

    await fs.writeFile(packagePath, JSON.stringify(packageContent, null, 2));
  }

  /**
   * Genera file di dati
   */
  async generateDataFiles(siteData, sitePath) {
    const libDir = path.join(sitePath, 'lib');
    await fs.mkdir(libDir, { recursive: true });

    const dataPath = path.join(libDir, 'data.js');
    const dataContent = `
// Dati statici per il sito generato
export const siteData = ${JSON.stringify(siteData, null, 2)};

export function getSiteData(websiteId) {
  return siteData;
}

export function getPageData(slug, websiteId) {
  return siteData.pages.find(page => page.slug === slug) || siteData.pages[0];
}
`;

    await fs.writeFile(dataPath, dataContent);
  }

  /**
   * Genera file CSS globali
   */
  async generateGlobalStyles(siteData, sitePath) {
    const stylesPath = path.join(sitePath, 'styles', 'globals.css');

    const cssContent = `
/* CSS Globale per il sito generato */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.section {
  padding: 80px 0;
}

.section:nth-child(even) {
  background: #f8f9fa;
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

.btn:hover {
  background: #0056b3;
}
`;

    await fs.writeFile(stylesPath, cssContent);
  }

  /**
   * Genera componenti base
   */
  async generateBaseComponents(siteData, sitePath) {
    const componentsDir = path.join(sitePath, 'components');
    await fs.mkdir(componentsDir, { recursive: true });

    // Layout component
    const layoutPath = path.join(componentsDir, 'Layout.js');
    const layoutContent = `
import React from 'react';
import Head from 'next/head';

export default function Layout({ siteData, pageData, children }) {
  return (
    <>
      <Head>
        <title>{pageData?.titolo || siteData?.site_title || 'Sito Web'}</title>
        <meta name="description" content={pageData?.descrizione || siteData?.site_description || ''} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {children}
      </div>
    </>
  );
}
`;

    await fs.writeFile(layoutPath, layoutContent);

    // HomePage component
    const homePagePath = path.join(componentsDir, 'pages', 'HomePage.js');
    await fs.mkdir(path.join(componentsDir, 'pages'), { recursive: true });

    const homePageContent = `
import React from 'react';

export default function HomePage({ content }) {
  if (!content || !content.sections) {
    return <div>Nessun contenuto disponibile</div>;
  }

  return (
    <main>
      {content.sections.map((section, index) => {
        const SectionComponent = getSectionComponent(section.type);
        return SectionComponent ? (
          <SectionComponent key={section.id || index} data={section} />
        ) : null;
      })}
    </main>
  );
}

function getSectionComponent(type) {
  // Questi componenti verranno generati dinamicamente
  const components = {
    hero: (props) => <div>Hero Section: {JSON.stringify(props)}</div>,
    text: (props) => <div>Text Section: {JSON.stringify(props)}</div>,
    image: (props) => <div>Image Section: {JSON.stringify(props)}</div>,
    contact: (props) => <div>Contact Section: {JSON.stringify(props)}</div>,
    gallery: (props) => <div>Gallery Section: {JSON.stringify(props)}</div>
  };

  return components[type];
}
`;

    await fs.writeFile(homePagePath, homePageContent);
  }

  /**
   * Genera singola pagina
   */
  async generatePage(page, siteData, sitePath) {
    const pagePath = path.join(sitePath, 'pages', `${page.slug}.js`);

    const pageContent = `
import { getSiteData, getPageData } from '../../lib/data';
import Layout from '../../components/Layout';
import ${page.slug.charAt(0).toUpperCase() + page.slug.slice(1)}Page from '../../components/pages/${page.slug.charAt(0).toUpperCase() + page.slug.slice(1)}Page';

export default function ${page.slug.charAt(0).toUpperCase() + page.slug.slice(1)}Page({ pageData, siteData }) {
  return (
    <Layout siteData={siteData} pageData={pageData}>
      <${page.slug.charAt(0).toUpperCase() + page.slug.slice(1)}Page content={pageData.contenuto_json} />
    </Layout>
  );
}

export async function getStaticProps() {
  const siteData = await getSiteData(${siteData.id});
  const pageData = await getPageData('${page.slug}', ${siteData.id});

  return {
    props: {
      siteData,
      pageData
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: '${page.slug}' } }],
    fallback: false
  };
}
`;

    await fs.writeFile(pagePath, pageContent);

    // Genera componente pagina
    await this.generatePageComponent(page, siteData, sitePath);
  }

  /**
   * Genera componente React per la pagina
   */
  async generatePageComponent(page, siteData, sitePath) {
    const componentDir = path.join(sitePath, 'components', 'pages');
    await fs.mkdir(componentDir, { recursive: true });

    const componentName = page.slug.charAt(0).toUpperCase() + page.slug.slice(1);
    const componentPath = path.join(componentDir, `${componentName}.js`);

    // Genera HTML dalle sezioni
    const sectionsHtml = await this.generateSectionsHtml(page.contenuto_json.sections || []);

    const componentContent = `
import React from 'react';
import Image from 'next/image';
import HeroSection from '../sections/HeroSection';
import TextSection from '../sections/TextSection';
import ImageSection from '../sections/ImageSection';
import ContactSection from '../sections/ContactSection';
import GallerySection from '../sections/GallerySection';

export default function ${componentName}({ content }) {
  if (!content || !content.sections) {
    return <div>Nessun contenuto disponibile</div>;
  }

  return (
    <main>
      {content.sections.map((section, index) => {
        const SectionComponent = getSectionComponent(section.type);
        return SectionComponent ? (
          <SectionComponent key={section.id || index} data={section} />
        ) : null;
      })}
    </main>
  );
}

function getSectionComponent(type) {
  const components = {
    hero: HeroSection,
    text: TextSection,
    image: ImageSection,
    contact: ContactSection,
    gallery: GallerySection
  };

  return components[type];
}
`;

    await fs.writeFile(componentPath, componentContent);
  }

  /**
   * Genera HTML dalle sezioni
   */
  async generateSectionsHtml(sections) {
    let html = '';

    for (const section of sections) {
      switch (section.type) {
        case 'hero':
          html += await this.generateHeroSection(section);
          break;
        case 'text':
          html += await this.generateTextSection(section);
          break;
        case 'image':
          html += await this.generateImageSection(section);
          break;
        case 'contact':
          html += await this.generateContactSection(section);
          break;
        case 'gallery':
          html += await this.generateGallerySection(section);
          break;
      }
    }

    return html;
  }

  /**
   * Genera sezione hero
   */
  async generateHeroSection(section) {
    return `
      <section class="hero" style="background-color: ${section.backgroundColor || '#f3f4f6'}; padding: 80px 0; text-align: center;">
        <div class="container mx-auto px-4">
          <h1 class="text-4xl font-bold mb-4">${section.title || ''}</h1>
          <p class="text-xl mb-6">${section.subtitle || ''}</p>
          ${section.buttonText ? `<a href="${section.buttonUrl || '#'}" class="bg-blue-500 text-white px-6 py-3 rounded-lg inline-block">${section.buttonText}</a>` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Genera sezione testo
   */
  async generateTextSection(section) {
    return `
      <section class="text-section" style="padding: 60px 0;">
        <div class="container mx-auto px-4">
          ${section.content || ''}
        </div>
      </section>
    `;
  }

  /**
   * Genera sezione immagine
   */
  async generateImageSection(section) {
    return `
      <section class="image-section" style="padding: 60px 0;">
        <div class="container mx-auto px-4 text-center">
          ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.altText || ''}" class="max-w-full h-auto rounded-lg">` : ''}
          ${section.caption ? `<p class="mt-4 text-gray-600">${section.caption}</p>` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Genera sezione contatti
   */
  async generateContactSection(section) {
    return `
      <section class="contact-section" style="padding: 60px 0; background-color: #f9fafb;">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-8">Contatti</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-xl font-semibold mb-4">Informazioni</h3>
              <p>Email: ${section.email || ''}</p>
              <p>Telefono: ${section.phone || ''}</p>
              <p>Indirizzo: ${section.address || ''}</p>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-4">Messaggio</h3>
              <form class="space-y-4">
                <input type="text" placeholder="Nome" class="w-full p-2 border rounded">
                <input type="email" placeholder="Email" class="w-full p-2 border rounded">
                <textarea placeholder="Messaggio" rows="4" class="w-full p-2 border rounded"></textarea>
                <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded">Invia</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Genera sezione galleria
   */
  async generateGallerySection(section) {
    const images = section.images || [];
    const imagesHtml = images.map(img =>
      `<div class="gallery-item">
        <img src="${img.url}" alt="${img.alt || ''}" class="w-full h-48 object-cover rounded">
        ${img.caption ? `<p class="mt-2 text-sm text-gray-600">${img.caption}</p>` : ''}
      </div>`
    ).join('');

    return `
      <section class="gallery-section" style="padding: 60px 0;">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-8">${section.title || 'Galleria'}</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${imagesHtml}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Genera anteprima HTML del sito
   */
  async generatePreview(websiteId, slug = '') {
    console.log(`📋 Generazione preview sito ${websiteId}, slug: ${slug}`);

    try {
      // 1. Recupera dati sito
      const siteData = await this.getSiteData(websiteId);

      if (!siteData) {
        throw new Error('Sito non trovato nel database');
      }

      // 2. Verifica che ci siano pagine
      if (!siteData.pages || siteData.pages.length === 0) {
        throw new Error('Nessuna pagina trovata per questo sito');
      }

      // 3. Genera HTML preview
      let html = this.generatePreviewHTML(siteData, slug);

      return html;

    } catch (error) {
      console.error('❌ Errore generazione preview:', error);
      // In caso di errore, genera un HTML di fallback
      return this.generateErrorHTML(error.message, websiteId);
    }
  }

  /**
   * Genera HTML per preview
   */
  generatePreviewHTML(siteData, slug = '') {
    const pages = siteData.pages || [];
    let targetPage = pages.find(p => p.slug === slug) || pages[0];

    if (!targetPage) {
      throw new Error('Nessuna pagina trovata per la preview');
    }

    // Genera CSS personalizzato per la pagina
    const pageCSS = this.generatePageCSS(targetPage);

    // Genera HTML base
    let html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${targetPage.titolo || siteData.site_title || 'Anteprima Sito'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .section { padding: 80px 0; }
        .section:nth-child(even) { background: #f8f9fa; }
        .section h2 { font-size: 2.5rem; margin-bottom: 30px; text-align: center; }
        .text-content { max-width: 800px; margin: 0 auto; text-align: center; }
        .image-section img { max-width: 100%; height: auto; border-radius: 8px; }
        .contact-form { max-width: 600px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;
        }
        .btn { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; border: none; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #0056b3; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .gallery-item { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .gallery-item img { width: 100%; height: 200px; object-fit: cover; }
        .gallery-content { padding: 20px; }

        /* Stili personalizzati pagina */
        ${pageCSS}
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <h1>${targetPage.titolo || siteData.site_title || 'Benvenuto'}</h1>
            <p>${targetPage.descrizione || siteData.site_description || 'Anteprima del tuo sito'}</p>
            ${targetPage.call_to_action ? `<a href="#contatti" class="btn">${targetPage.call_to_action}</a>` : ''}
        </div>
    </section>
`;

    // Aggiungi sezioni dinamiche
    if (targetPage.contenuto_json && targetPage.contenuto_json.sections) {
      console.log(`📄 Processando ${targetPage.contenuto_json.sections.length} sezioni per pagina ${targetPage.titolo}`);
      targetPage.contenuto_json.sections.forEach((section, index) => {
        console.log(`🔧 Sezione ${index}: tipo=${section.type}, titolo=${section.title || 'N/D'}`);
        const sectionHTML = this.generateSectionHTML(section, index);
        console.log(`📝 HTML generato sezione ${index}: ${sectionHTML.length} caratteri`);
        html += sectionHTML;
      });
    } else {
      console.log(`⚠️ Nessuna sezione trovata in contenuto_json per pagina ${targetPage.titolo}`);
      console.log(`📋 contenuto_json:`, JSON.stringify(targetPage.contenuto_json, null, 2));
    }

    // Aggiungi sezione contatti predefinita
    html += `
    <!-- Contact Section -->
    <section class="section" id="contatti">
        <div class="container">
            <h2>Contattaci</h2>
            <div class="contact-form">
                <form>
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" placeholder="Il tuo nome">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="tua@email.com">
                    </div>
                    <div class="form-group">
                        <label>Messaggio</label>
                        <textarea rows="5" placeholder="Il tuo messaggio..."></textarea>
                    </div>
                    <button type="submit" class="btn">Invia Messaggio</button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer style="background: #333; color: white; padding: 40px 0; text-align: center;">
        <div class="container">
            <p>&copy; 2024 ${siteData.site_title || 'Nome Sito'}. Tutti i diritti riservati.</p>
            <p style="margin-top: 10px; opacity: 0.7;">Questa è un'anteprima generata dal Website Builder</p>
        </div>
    </footer>

</body>
</html>`;

    return html;
  }

  /**
   * Genera HTML per una singola sezione
   */
  generateSectionHTML(section, index) {
    console.log(`🔨 Generazione HTML per sezione ${index}:`, {
      type: section.type,
      hasTitle: !!(section.data && section.data.title),
      hasContent: !!(section.data && section.data.content),
      hasImages: !!(section.data && section.data.images && section.data.images.length)
    });

    // DEBUG: Dati completi della sezione
    console.log(`🔍 DATI COMPLETI SEZIONE ${index} (${section.type}):`, JSON.stringify(section, null, 2));

    switch (section.type) {
      case 'hero':
        return `
    <section class="hero" style="background: ${section.data?.backgroundColor || '#667eea'};">
        <div class="container">
            <h1>${section.data?.title || 'Titolo Hero'}</h1>
            <p>${section.data?.subtitle || 'Sottotitolo Hero'}</p>
            ${section.data?.buttonText ? `<a href="${section.data?.buttonUrl || '#'}" class="btn">${section.data?.buttonText}</a>` : ''}
        </div>
    </section>`;

      case 'text':
        return `
    <section class="section">
        <div class="container">
            <div class="text-content">
                <h2>${section.data?.title || 'Titolo Sezione'}</h2>
                <div>${section.data?.content || 'Contenuto della sezione...'}</div>
            </div>
        </div>
    </section>`;

      case 'image':
        return `
    <section class="section image-section">
        <div class="container">
            <h2>${section.data?.title || 'Immagine'}</h2>
            <div style="text-align: center;">
                ${section.data?.imageUrl ? `<img src="${section.data?.imageUrl}" alt="${section.data?.altText || section.data?.imageName || ''}" style="max-width: 100%; border-radius: 8px;">` : '<p style="color: #999;">Nessuna immagine specificata</p>'}
                ${section.data?.description ? `<p style="margin-top: 20px; color: #666;">${section.data?.description}</p>` : ''}
            </div>
        </div>
    </section>`;

      case 'gallery':
        const images = section.data?.images || [];
        const imagesHtml = images.length > 0 ? images.map(img => `
                    <div class="gallery-item">
                        <img src="${img.url || '/placeholder.jpg'}" alt="${img.alt || ''}">
                        <div class="gallery-content">
                            <h3>${img.title || 'Immagine'}</h3>
                            <p>${img.caption || 'Descrizione immagine'}</p>
                        </div>
                    </div>
                `).join('') : '<p style="color: #999;">Nessuna immagine nella galleria</p>';

        return `
    <section class="section">
        <div class="container">
            <h2>${section.data?.title || 'Galleria'}</h2>
            <div class="gallery">
                ${imagesHtml}
            </div>
        </div>
    </section>`;

      case 'blog':
        return `
    <section class="section">
        <div class="container">
            <h2>${section.data?.title || 'Blog'}</h2>
            <div class="blog-posts">
                ${section.data?.posts && section.data?.posts.length > 0 ? section.data.posts.map(post => `
                    <article style="border-bottom: 1px solid #eee; padding: 20px 0;">
                        <h3>${post.title || 'Titolo Post'}</h3>
                        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${post.date || new Date().toLocaleDateString('it-IT')}</p>
                        <div>${post.excerpt || 'Estratto del post...'}</div>
                        ${post.link ? `<a href="${post.link}" class="btn" style="margin-top: 10px;">Leggi tutto</a>` : ''}
                    </article>
                `).join('') : '<p style="color: #999;">Nessun articolo nel blog</p>'}
            </div>
        </div>
    </section>`;

      case 'maps':
        return `
    <section class="section" style="background: #f8f9fa;">
        <div class="container">
            <h2>${section.data?.title || 'Mappa'}</h2>
            <div style="background: #ddd; height: 400px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📍</div>
                    <p>${section.data?.address || 'Indirizzo non specificato'}</p>
                    ${section.data?.embedCode ? `<div style="margin-top: 10px;">${section.data?.embedCode}</div>` : ''}
                </div>
            </div>
        </div>
    </section>`;

      case 'social':
        const platforms = section.data?.platforms || [];
        const platformConfigs = section.data?.platformConfigs || {};
        const socialHtml = platforms.length > 0 ? platforms.map(platform => {
          const config = platformConfigs[platform] || {};
          const platformData = {
            facebook: { icon: '📘', name: 'Facebook' },
            instagram: { icon: '📷', name: 'Instagram' },
            twitter: { icon: '🐦', name: 'Twitter' },
            linkedin: { icon: '💼', name: 'LinkedIn' },
            youtube: { icon: '📺', name: 'YouTube' }
          }[platform] || { icon: '🔗', name: platform };

          return `
            <a href="${config.customUrl || '#'}" target="_blank" style="
                display: inline-block;
                padding: 15px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                text-align: center;
                min-width: 120px;
            ">
                <div style="font-size: 1.5rem;">${platformData.icon}</div>
                <div>${platformData.name}</div>
            </a>
          `;
        }).join('') : '<p style="color: #999;">Nessun social specificato</p>';

        return `
    <section class="section">
        <div class="container">
            <h2>${section.data?.title || 'Social'}</h2>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                ${socialHtml}
            </div>
        </div>
    </section>`;

      case 'contact':
        return `
    <section class="section" style="background: #f8f9fa;">
        <div class="container">
            <h2>${section.title || 'Contatti'}</h2>
            <div class="contact-form">
                <form>
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" placeholder="Il tuo nome">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="tua@email.com">
                    </div>
                    <div class="form-group">
                        <label>Messaggio</label>
                        <textarea rows="5" placeholder="Il tuo messaggio..."></textarea>
                    </div>
                    <button type="submit" class="btn">Invia Messaggio</button>
                </form>
            </div>
        </div>
    </section>`;

      default:
        console.warn(`⚠️ Tipo sezione non supportato: ${section.type}`);
        return `
    <section class="section" style="background: #fff3cd; border: 1px solid #ffeaa7;">
        <div class="container">
            <h2 style="color: #856404;">Sezione non riconosciuta</h2>
            <p style="color: #856404;">
                Tipo: <strong>${section.type || 'non specificato'}</strong><br>
                Titolo: ${section.data?.title || 'N/D'}<br>
                Dati: ${JSON.stringify(section, null, 2)}
            </p>
        </div>
    </section>`;
    }
  }

  /**
   * Recupera path del sito generato
   */
  async getSitePath(websiteId) {
    try {
      const { knex } = require('../config/db');
      const site = await knex('siti_web_aziendali')
        .where({ id: websiteId })
        .first(['site_title']);

      if (!site) return null;

      const siteName = this.sanitizeSiteName(site.site_title || `site-${websiteId}`);
      return path.join(this.outputDir, siteName);
    } catch (error) {
      console.error('Errore recupero path sito:', error);
      return null;
    }
  }

  /**
   * Pulisci sito generato
   */
  async cleanupSite(websiteId) {
    console.log(`🧹 Pulizia sito ${websiteId}`);

    try {
      const sitePath = await this.getSitePath(websiteId);

      if (sitePath && await fs.access(sitePath).then(() => true).catch(() => false)) {
        await fs.rmdir(sitePath, { recursive: true });
      }

      return { success: true, message: 'Sito pulito con successo' };
    } catch (error) {
      console.error('Errore cleanup sito:', error);
      throw error;
    }
  }

  /**
   * Applica template personalizzato
   */
  async applyTemplate(websiteId, templateId, customizations = {}) {
    console.log(`🎨 Applicazione template ${templateId} al sito ${websiteId}`);

    try {
      // Update sito con template
      const { knex } = require('../config/db');
      await knex('siti_web_aziendali')
        .where({ id: websiteId })
        .update({
          template_name: templateId,
          theme_config: JSON.stringify(customizations),
          updated_at: new Date()
        });

      return {
        success: true,
        message: 'Template applicato con successo',
        templateId,
        customizations
      };
    } catch (error) {
      console.error('Errore applicazione template:', error);
      throw error;
    }
  }

  /**
   * Genera HTML di errore per preview
   */
  generateErrorHTML(errorMessage, websiteId) {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Errore Anteprima</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #f8f9fa; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .error-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                          max-width: 600px; text-align: center; }
        .error-icon { font-size: 4rem; color: #dc3545; margin-bottom: 20px; }
        h1 { color: #dc3545; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 20px; line-height: 1.6; }
        .error-details { background: #f8f9fa; padding: 20px; border-radius: 6px;
                        text-align: left; font-family: monospace; font-size: 14px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white;
               text-decoration: none; border-radius: 6px; margin: 5px; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>Errore Generazione Anteprima</h1>
        <p>Si è verificato un errore durante la generazione dell'anteprima del sito.</p>

        <div class="error-details">
            <strong>ID Sito:</strong> ${websiteId}<br>
            <strong>Errore:</strong> ${errorMessage}
        </div>

        <p><strong>Possibili cause:</strong></p>
        <ul style="text-align: left; color: #666; margin: 20px;">
            <li>Il sito non esiste nel database</li>
            <li>Non ci sono pagine pubblicate per questo sito</li>
            <li>I dati del sito sono corrotti o incompleti</li>
            <li>Permessi insufficienti per accedere al sito</li>
        </ul>

        <div>
            <a href="#" class="btn" onclick="window.close(); return false;">Chiudi</a>
            <a href="#" class="btn" onclick="location.reload(); return false;">Riprova</a>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Genera CSS personalizzato per una pagina
   */
  generatePageCSS(page) {
    let css = '';

    // Background styles
    if (page.background_type === 'color' && page.background_color) {
      css += `body { background-color: ${page.background_color}; }\n`;
    } else if (page.background_type === 'gradient' && page.background_gradient) {
      css += `body { background: ${page.background_gradient}; }\n`;
    } else if (page.background_type === 'image' && page.background_image) {
      css += `body {
        background-image: url('${page.background_image}');
        background-size: ${page.background_size || 'cover'};
        background-position: ${page.background_position || 'center'};
        background-repeat: ${page.background_repeat || 'no-repeat'};
        background-attachment: ${page.background_attachment || 'scroll'};
      }\n`;
    }

    // Typography styles
    if (page.font_family) {
      css += `body {
        font-family: '${page.font_family}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${page.font_size || '16'}px;
        color: ${page.font_color || '#333333'};
      }\n`;
    }

    // Heading styles
    let headingCSS = 'h1, h2, h3, h4, h5, h6 { ';
    if (page.heading_font) {
      headingCSS += `font-family: '${page.heading_font}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; `;
    }
    if (page.heading_color) {
      headingCSS += `color: ${page.heading_color}; `;
    }
    headingCSS += '}\n';
    css += headingCSS;

    // Container styles
    if (page.container_max_width) {
      css += `.container {
        max-width: ${page.container_max_width};
        margin: 0 auto;
        padding: 0 20px;
      }\n`;
    }

    // Page padding
    if (page.padding_top || page.padding_bottom) {
      const paddingTop = page.padding_top || '60px';
      const paddingBottom = page.padding_bottom || '60px';
      css += `main {
        padding-top: ${paddingTop};
        padding-bottom: ${paddingBottom};
      }\n`;
    }

    // Custom CSS
    if (page.custom_css) {
      css += `/* Custom CSS */\n${page.custom_css}\n`;
    }

    return css;
  }

  /**
   * Pulisce nome sito per filesystem
   */
  sanitizeSiteName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim() || 'sito-senza-titolo';
  }
}

module.exports = SiteGenerator;