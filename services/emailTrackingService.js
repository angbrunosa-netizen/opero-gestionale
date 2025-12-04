// #####################################################################
// # Email Tracking Service - Strategie Multiple per Gmail Compatibility
// # File: opero/services/emailTrackingService.js
// #####################################################################

/**
 * Servizio per generare diverse strategie di tracking email
 * Progettato per massimizzare la compatibilità con Gmail e altri client
 */

const crypto = require('crypto');

class EmailTrackingService {
    constructor() {
        this.baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3001';
        this.trackingStrategies = {
            aggressive: 'aggressive',     // Multi-pixel + link + background
            standard: 'standard',         // Single pixel + link
            conservative: 'conservative', // Solo link
            minimal: 'minimal'            // Solo pixel base
        };
    }

    /**
     * Determina la strategia di tracking migliore basata sul dominio email
     * IMPORTANTE: Il tracking deve essere SEMPRE invisibile e automatico
     */
    determineStrategy(emailAddress) {
        const domain = emailAddress ? emailAddress.toLowerCase().split('@')[1] : 'unknown';

        // Dominii noti che bloccano aggressivamente i pixel - usano strategia multi-pixel
        const aggressiveBlocking = ['gmail.com', 'googlemail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

        // Tutti gli altri dominii usano strategia standard con invisibile pixel + fallback invisibile
        // MAI usare conservative che richiede conferma manuale!
        if (aggressiveBlocking.includes(domain)) {
            return this.trackingStrategies.aggressive; // Multi-pixel per Gmail/Yahoo
        } else {
            return this.trackingStrategies.standard; // Pixel invisibile + fallback invisibile per tutti gli altri
        }
    }

    /**
     * Genera tracking HTML basato sulla strategia determinata
     */
    generateTrackingHTML(trackingId, emailAddress = null) {
        const strategy = emailAddress ? this.determineStrategy(emailAddress) : this.trackingStrategies.standard;

        switch (strategy) {
            case this.trackingStrategies.aggressive:
                return this.generateAggressiveTracking(trackingId);
            case this.trackingStrategies.standard:
                return this.generateStandardTracking(trackingId);
            case this.trackingStrategies.conservative:
                return this.generateConservativeTracking(trackingId);
            case this.trackingStrategies.minimal:
                return this.generateMinimalTracking(trackingId);
            default:
                return this.generateStandardTracking(trackingId);
        }
    }

    /**
     * Strategia Aggressiva - Multi-pixel per Gmail e altri client bloccanti
     */
    generateAggressiveTracking(trackingId) {
        return `
<!-- Aggressive Email Tracking - Multi-Strategy -->
<div style="display:none; font-size:0px; line-height:0px; height:0px; width:0px; float:none; clear:both; overflow:hidden; margin:0; padding:0; border:none;">
    <!-- Strategy 1: Standard GIF pixel -->
    <img src="${this.baseUrl}/api/track/open/${trackingId}"
         alt="" width="1" height="1" border="0"
         style="display:block; width:1px; height:1px; border:none; margin:0; padding:0;" />

    <!-- Strategy 2: Base64 encoded pixel (bypass some filters) -->
    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
         onload="fetch('${this.baseUrl}/api/track/open/${trackingId}')"
         alt="" width="1" height="1" border="0"
         style="display:block; width:1px; height:1px; border:none; margin:0; padding:0;" />

    <!-- Strategy 3: CSS background image -->
    <div style="width:1px; height:1px; background-image:url('${this.baseUrl}/api/track/open/${trackingId}'); background-repeat:no-repeat; display:block;"></div>

    <!-- Strategy 4: Table-based pixel -->
    <table border="0" cellpadding="0" cellspacing="0" width="1" height="1" style="display:block;">
        <tr>
            <td style="background-image:url('${this.baseUrl}/api/track/open/${trackingId}'); background-repeat:no-repeat; width:1px; height:1px; line-height:1px; font-size:1px; mso-hide:all;">
                <img src="${this.baseUrl}/api/track/open/${trackingId}"
                     style="display:block; width:1px; height:1px; border:none; mso-hide:all;" />
            </td>
        </tr>
    </table>

    <!-- Strategy 5: Preload trick -->
    <link rel="preload" href="${this.baseUrl}/api/track/open/${trackingId}" as="image" />
</div>

<!-- Aggressive Fallback Link -->
<div style="text-align:center; font-size:11px; color:#999; margin:15px 0; padding:10px; border-top:1px solid #eee; line-height:1.4;">
    <p style="margin:0; color:#666;">Email non visualizzata correttamente?</p>
    <a href="${this.baseUrl}/api/track/open/${trackingId}"
       style="color:#007bff; text-decoration:underline; font-size:11px; font-weight:normal;">
        Clicca qui per confermare lettura
    </a>
</div>`;
    }

    /**
     * Strategia Standard - Tracking invisibile automatico per tutti i client non-Gmail
     */
    generateStandardTracking(trackingId) {
        return `
<!-- Standard Invisible Email Tracking -->
<div style="display:none !important; visibility:hidden !important; mso-hide:all !important; width:0px !important; height:0px !important; font-size:0px !important; line-height:0px !important;">
    <!-- Primary tracking pixel -->
    <img src="${this.baseUrl}/api/track/open/${trackingId}"
         width="1" height="1" alt="" border="0"
         style="display:block !important; width:1px !important; height:1px !important; border:none !important; margin:0 !important; padding:0 !important; visibility:hidden !important;" />

    <!-- Backup tracking via CSS background -->
    <div style="width:1px !important; height:1px !important; background-image:url('${this.baseUrl}/api/track/open/${trackingId}') !important; background-repeat:no-repeat !important; display:block !important; visibility:hidden !important;"></div>
</div>
<!-- End Invisible Tracking -->`;
    }

    /**
     * Strategia Conservativa - Solo link, nessun pixel
     */
    generateConservativeTracking(trackingId) {
        return `
<!-- Conservative Email Tracking - Link Only -->
<div style="text-align:center; font-size:12px; color:#666; margin-top:20px; padding:15px; border-top:1px solid #eee; background:#f9f9f9;">
    <p style="margin:0 0 5px 0; color:#333;">Per confermare la lettura di questa email:</p>
    <a href="${this.baseUrl}/api/track/open/${trackingId}"
       style="color:#007bff; text-decoration:underline; font-size:12px; font-weight:bold; padding:5px 10px; border:1px solid #007bff; border-radius:3px; display:inline-block;">
        Conferma lettura
    </a>
    <p style="margin:10px 0 0 0; font-size:10px; color:#999;">Questo aiuta a migliorare la nostra comunicazione</p>
</div>`;
    }

    /**
     * Strategia Minimale - Solo pixel base
     */
    generateMinimalTracking(trackingId) {
        return `
<!-- Minimal Email Tracking -->
<img src="${this.baseUrl}/api/track/open/${trackingId}"
     width="1" height="1" alt="" border="0"
     style="display:none; width:1px; height:1px;" />`;
    }

    /**
     * Genera tracking ID sicuro
     */
    generateTrackingId() {
        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString('hex');
        return `track_${timestamp}_${randomBytes}`;
    }

    /**
     * Log della strategia utilizzata per debugging
     */
    logTrackingStrategy(emailAddress, trackingId, strategy) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`📧 Email Tracking Strategy:`);
            console.log(`   Email: ${emailAddress}`);
            console.log(`   Tracking ID: ${trackingId}`);
            console.log(`   Strategy: ${strategy}`);
        }
    }
}

module.exports = new EmailTrackingService();