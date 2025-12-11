// routes/website-generator.js
// API per la generazione e deploy di siti web statici

const express = require('express');
const router = express.Router();
const { checkPermission } = require('../utils/auth');
const SiteGenerator = require('../services/SiteGenerator');
const VPSDeployer = require('../services/VPSDeployer');
const path = require('path');

const siteGenerator = new SiteGenerator();
const vpsDeployer = new VPSDeployer();

/**
 * POST /api/website-generator/generate/:websiteId
 * Genera un sito web statico
 */
router.post('/generate/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { options = {} } = req.body;

    console.log(`🚀 Inizio generazione sito per websiteId: ${websiteId}`);

    // Genera sito statico
    const result = await siteGenerator.generateSite(websiteId, options);

    res.json({
      success: true,
      message: 'Sito generato con successo',
      data: result
    });

  } catch (error) {
    console.error('❌ Errore generazione sito:', error);
    res.status(500).json({
      success: false,
      error: 'Errore durante la generazione del sito: ' + error.message
    });
  }
});

/**
 * POST /api/website-generator/deploy/:websiteId
 * Genera e deploy del sito su VPS
 */
router.post('/deploy/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;
    const {
      vpsConfig,
      domain,
      deployOptions = {}
    } = req.body;

    console.log(`🚀 Inizio deploy sito ${websiteId} su VPS`);

    // 1. Genera sito
    const generateResult = await siteGenerator.generateSite(websiteId, deployOptions);

    if (!generateResult.success) {
      throw new Error('Generazione sito fallita');
    }

    // 2. Deploy su VPS
    const deployResult = await vpsDeployer.deploySite(
      websiteId,
      generateResult.sitePath,
      vpsConfig,
      domain
    );

    // 3. Aggiorna database con info deploy
    await updateDeployInfo(websiteId, {
      domain,
      deployed_at: new Date(),
      deploy_status: 'success',
      site_path: generateResult.sitePath
    });

    res.json({
      success: true,
      message: 'Sito generato e deploy completato',
      data: {
        generation: generateResult,
        deployment: deployResult,
        siteUrl: `https://${domain}`
      }
    });

  } catch (error) {
    console.error('❌ Errore deploy sito:', error);

    // Aggiorna stato errore
    try {
      await updateDeployInfo(req.params.websiteId, {
        deploy_status: 'error',
        deploy_error: error.message,
        deployed_at: new Date()
      });
    } catch (updateError) {
      console.error('❌ Errore aggiornamento stato deploy:', updateError);
    }

    res.status(500).json({
      success: false,
      error: 'Errore durante il deploy: ' + error.message
    });
  }
});

/**
 * GET /api/website-generator/status/:websiteId
 * Recupera stato generazione/deploy sito
 */
router.get('/status/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;

    // Recupera info deploy dal database
    const deployInfo = await getDeployInfo(websiteId);

    // Controlla se esiste sito generato
    const sitePath = await siteGenerator.getSitePath(websiteId);
    const isGenerated = sitePath && await siteExists(sitePath);

    res.json({
      success: true,
      data: {
        isGenerated,
        deployInfo,
        lastGenerated: deployInfo?.deployed_at || null
      }
    });

  } catch (error) {
    console.error('❌ Errore recupero stato sito:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dello stato: ' + error.message
    });
  }
});

/**
 * GET /api/website-generator/preview/:websiteId
 * Anteprima sito generato
 */
router.get('/preview/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { slug = '' } = req.query;

    // Genera preview HTML
    const previewHtml = await siteGenerator.generatePreview(websiteId, slug);

    res.set('Content-Type', 'text/html');
    res.send(previewHtml);

  } catch (error) {
    console.error('❌ Errore generazione preview:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nella generazione preview: ' + error.message
    });
  }
});

/**
 * DELETE /api/website-generator/cleanup/:websiteId
 * Pulisce sito generato
 */
router.delete('/cleanup/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;

    // Rimuovi sito generato
    const cleanupResult = await siteGenerator.cleanupSite(websiteId);

    // Aggiorna database
    await updateDeployInfo(websiteId, {
      deploy_status: 'cleaned',
      cleaned_at: new Date()
    });

    res.json({
      success: true,
      message: 'Sito pulito con successo',
      data: cleanupResult
    });

  } catch (error) {
    console.error('❌ Errore cleanup sito:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nella pulizia: ' + error.message
    });
  }
});

/**
 * POST /api/website-generator/template/:websiteId
 * Applica template personalizzato
 */
router.post('/template/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { templateId, customizations = {} } = req.body;

    // Applica template
    const templateResult = await siteGenerator.applyTemplate(
      websiteId,
      templateId,
      customizations
    );

    res.json({
      success: true,
      message: 'Template applicato con successo',
      data: templateResult
    });

  } catch (error) {
    console.error('❌ Errore applicazione template:', error);
    res.status(500).json({
      success: false,
      error: 'Errore applicazione template: ' + error.message
    });
  }
});

// Helper functions

/**
 * Aggiorna informazioni deploy nel database
 */
async function updateDeployInfo(websiteId, deployData) {
  const { knex } = require('../config/db');

  await knex('siti_web_aziendali')
    .where({ id: websiteId })
    .update({
      deploy_status: deployData.deploy_status,
      deploy_domain: deployData.domain,
      deploy_path: deployData.site_path,
      deployed_at: deployData.deployed_at,
      deploy_error: deployData.deploy_error,
      cleaned_at: deployData.cleaned_at
    });
}

/**
 * Recupera informazioni deploy dal database
 */
async function getDeployInfo(websiteId) {
  const { knex } = require('../config/db');

  const site = await knex('siti_web_aziendali')
    .where({ id: websiteId })
    .first([
      'deploy_status',
      'deploy_domain',
      'deploy_path',
      'deployed_at',
      'deploy_error',
      'cleaned_at'
    ]);

  return site || {};
}

/**
 * Controlla se esiste sito generato
 */
async function siteExists(sitePath) {
  const fs = require('fs').promises;
  try {
    await fs.access(sitePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = router;