/**
 * @file opero/routes/system.js
 * @description API per configurazioni di sistema (Menu, Moduli).
 * - v1.5: Fix ER_BAD_FIELD_ERROR.
 * - Sostituito 'id' (errato) con 'codice' (corretto)
 * come chiave primaria in tutte le query (GET, PUT, POST).
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
 * (MODIFICATO v1.5)
 */
router.get('/modules/admin', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    try {
        const modules = await knex('moduli')
            .orderBy('ordine', 'asc')
            .select(
                'codice', // <-- FIX: Era 'id'
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
 * PUT /api/system/moduli/:codice (PER ADMIN PANEL)
 * (MODIFICATO v1.5)
 */
router.put('/moduli/:codice', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    const { codice } = req.params; // <-- FIX: Era 'id'
    const { descrizione, permission_required, icon_name, ordine, attivo } = req.body;

    if (!descrizione || !permission_required) {
        return res.status(400).json({ error: 'Descrizione e Permesso sono obbligatori.' });
    }

    try {
        await knex('moduli')
            .where('codice', parseInt(codice)) // <-- FIX: Era 'id'
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
 * POST /api/system/moduli (PER ADMIN PANEL)
 * (MODIFICATO v1.5)
 */
router.post('/moduli', checkPermission('ADMIN_PANEL_MDVIEW'), async (req, res) => {
    const { 
        codice, // <-- FIX: Aggiunto
        descrizione, 
        chiave_componente, 
        permission_required, 
        icon_name, 
        ordine, 
        attivo 
    } = req.body;

    // Validazione
    if (!codice || !descrizione || !chiave_componente || !permission_required) {
        return res.status(400).json({ error: 'Codice, Descrizione, Chiave Componente e Permesso sono obbligatori.' });
    }

    try {
        // Controlla se 'codice' o 'chiave_componente' esistono già
        const existing = await knex('moduli')
            .where('codice', parseInt(codice))
            .orWhere('chiave_componente', chiave_componente)
            .first();
        
        if (existing) {
            return res.status(409).json({ error: `La chiave componente o il codice esistono già.` });
        }
        
        // Crea la nuova riga
        await knex('moduli').insert({
            codice: parseInt(codice), // <-- FIX: Aggiunto
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