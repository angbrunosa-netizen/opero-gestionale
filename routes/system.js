/**
 * @file opero/routes/system.js
 * @description API per configurazioni di sistema (Menu, Moduli).
 * - v1.4: Aggiunta API POST /moduli per CREARE nuovi moduli
 * (usata da ModuliManager v1.1).
 */
const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { authenticate, checkPermission } = require('../utils/auth');

router.use(authenticate);

/**
 * GET /api/system/modules (PER FRONTEND)
 * (Invariato v1.3)
 */
router.get('/modules', async (req, res) => {
    try {
        const modules = await knex('moduli')
            .where('attivo', true)
            .orderBy('ordine', 'asc')
            .select(
                'descrizione as label',
                'chiave_componente',
                'icon_name',
                'permission_required'
            );
        
        res.json(modules);
    } catch (error) {
        console.error("Errore nel recupero moduli:", error);
        res.status(500).json({ error: 'Errore interno.' });
    }
});

/**
 * GET /api/system/modules/admin (PER ADMIN PANEL)
 * (Invariato v1.3)
 */
router.get('/modules/admin', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    try {
        const modules = await knex('moduli')
            .orderBy('ordine', 'asc')
            .select(
                'id',
                'descrizione as label',
                'chiave_componente',
                'icon_name',
                'permission_required',
                'ordine',
                'attivo'
            );
        
        res.json(modules);
    } catch (error) {
        console.error("Errore nel recupero moduli admin:", error);
        res.status(500).json({ error: 'Errore interno.' });
    }
});

/**
 * PUT /api/system/moduli/:id (PER ADMIN PANEL)
 * (Invariato v1.3)
 */
router.put('/moduli/:id', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    const { id } = req.params;
    const { descrizione, permission_required, icon_name, ordine, attivo } = req.body;

    if (!descrizione || !permission_required) {
        return res.status(400).json({ error: 'Descrizione e Permesso sono obbligatori.' });
    }

    try {
        await knex('moduli')
            .where('id', id)
            .update({
                descrizione: descrizione,
                permission_required: permission_required,
                icon_name: icon_name,
                ordine: parseInt(ordine) || 0,
                attivo: Boolean(attivo)
            });
        
        res.json({ success: true, message: 'Modulo aggiornato.' });
    } catch (error) {
         console.error("Errore aggiornamento modulo:", error);
        res.status(500).json({ error: 'Errore interno.' });
    }
});

/**
 * --- (NUOVA API v1.4) ---
 * POST /api/system/moduli (PER ADMIN PANEL)
 * Crea un nuovo modulo.
 */
router.post('/moduli', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    const { 
        descrizione, 
        chiave_componente, 
        permission_required, 
        icon_name, 
        ordine, 
        attivo 
    } = req.body;

    // Validazione
    if (!descrizione || !chiave_componente || !permission_required) {
        return res.status(400).json({ error: 'Descrizione, Chiave Componente e Permesso sono obbligatori.' });
    }

    try {
        // Controlla se la chiave_componente esiste già (UNIQUE)
        const existing = await knex('moduli')
            .where('chiave_componente', chiave_componente)
            .first();
        
        if (existing) {
            return res.status(409).json({ error: `La chiave componente '${chiave_componente}' esiste già.` });
        }
        
        // Crea la nuova riga
        await knex('moduli').insert({
            descrizione: descrizione,
            chiave_componente: chiave_componente,
            permission_required: permission_required,
            icon_name: icon_name,
            ordine: parseInt(ordine) || 100,
            attivo: Boolean(attivo)
        });

        res.status(201).json({ success: true, message: 'Modulo creato.' });

    } catch (error) {
        console.error("Errore creazione modulo:", error);
        res.status(500).json({ error: 'Errore interno.' });
    }
});


module.exports = router;