// #####################################################################
// # Enhanced Gmail Tracking Service - Ultra-Aggressive Strategy
// # File: opero/services/enhancedGmailTracking.js
// #####################################################################

/**
 * Servizio specializzato per il tracking di Gmail con strategie ultra-aggressive
 * Implementa tecniche avanzate per bypassare i filtri Gmail più restrittivi
 */

class EnhancedGmailTracking {
    constructor() {
        this.baseUrl = process.env.PUBLIC_API_URL || 'http://192.168.1.19:3001';
    }

    /**
     * Genera tracking HTML ultra-aggressivo specifico per Gmail
     * Implementa 7+ strategie diverse per massimizzare le possibilità
     */
    generateUltraAggressiveGmailTracking(trackingId) {
        const timestamp = Date.now();
        const randomParam = Math.random().toString(36).substring(7);

        return `
<!-- Ultra-Aggressive Gmail Tracking - Multiple Bypass Strategies -->
<div style="display:none; font-size:0px; line-height:0px; height:0px; width:0px; float:none; clear:both; overflow:hidden; margin:0; padding:0; border:none; max-width:0px; max-height:0px;">

    <!-- Strategy 1: Standard GIF pixel con cache-busting -->
    <img src="${this.baseUrl}/api/track/open/${trackingId}?t=${timestamp}&r=${randomParam}"
         alt="" width="1" height="1" border="0"
         style="display:block; width:1px; height:1px; border:none; margin:0; padding:0; opacity:0.01;" />

    <!-- Strategy 2: Transparent PNG pixel -->
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
         onload="(function(){var img=new Image();img.src='${this.baseUrl}/api/track/open/${trackingId}?s=png&t=${timestamp}';this.parentNode.appendChild(img);})(this)"
         alt="" width="1" height="1" border="0"
         style="display:block; width:1px; height:1px; border:none;" />

    <!-- Strategy 3: SVG-based pixel -->
    <svg width="1" height="1" style="position:absolute;">
        <image href="${this.baseUrl}/api/track/open/${trackingId}?s=svg&t=${timestamp}" width="1" height="1" />
    </svg>

    <!-- Strategy 4: CSS background image con data URI fallback -->
    <div style="width:1px; height:1px; background-image:url('${this.baseUrl}/api/track/open/${trackingId}?s=css&t=${timestamp}'); background-repeat:no-repeat; display:block;">
        <div style="background-image:url('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); width:1px; height:1px;"
             onmouseover="fetch('${this.baseUrl}/api/track/open/${trackingId}?s=hover&t=${timestamp}')"></div>
    </div>

    <!-- Strategy 5: Table-based pixel con multiple attributi -->
    <table border="0" cellpadding="0" cellspacing="0" width="1" height="1" style="display:block; position:absolute; top:0; left:0;">
        <tr>
            <td background="${this.baseUrl}/api/track/open/${trackingId}?s=table&t=${timestamp}"
                style="background-image:url('${this.baseUrl}/api/track/open/${trackingId}?s=cell&t=${timestamp}'); width:1px; height:1px; line-height:1px; font-size:1px; mso-hide:all; -webkit-text-size-adjust:none;">
                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:1px;height:1px;">
                    <v:fill type="tile" src="${this.baseUrl}/api/track/open/${trackingId}?s=vml&t=${timestamp}" />
                </v:rect>
                <![endif]-->
                <img src="${this.baseUrl}/api/track/open/${trackingId}?s=nested&t=${timestamp}"
                     style="display:block; width:1px; height:1px; border:none; mso-hide:all;" />
            </td>
        </tr>
    </table>

    <!-- Strategy 6: JavaScript-based tracking con error handling -->
    <script>
    (function() {
        try {
            // Multi-approach JS tracking
            var trackingUrl = '${this.baseUrl}/api/track/open/${trackingId}?s=js&t=${timestamp}';

            // Method 1: fetch API
            if (typeof fetch !== 'undefined') {
                fetch(trackingUrl, {mode: 'no-cors', cache: 'no-store'});
            }

            // Method 2: XMLHttpRequest
            if (typeof XMLHttpRequest !== 'undefined') {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', trackingUrl + '&s=xhr', true);
                xhr.send();
            }

            // Method 3: Image preload
            var preloadImg = new Image();
            preloadImg.src = trackingUrl + '&s=preload';

            // Method 4: Link prefetch (HTML5)
            if ('performance' in window && 'getEntriesByName' in performance) {
                var link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = trackingUrl + '&s=prefetch';
                document.head.appendChild(link);
            }

        } catch(e) {
            // Silent fallback
        }
    })();
    </script>

    <!-- Strategy 7: Meta refresh pixel (iframe-based) -->
    <iframe src="${this.baseUrl}/api/track/open/${trackingId}?s=iframe&t=${timestamp}"
            width="1" height="1" frameborder="0"
            style="position:absolute; top:-9999px; left:-9999px; width:1px; height:1px; border:none;"></iframe>
</div>

<!-- User-Friendly Fallback Link - Gmail Compatible -->
<div style="text-align:center; font-size:10px; color:#999; margin:10px 0; padding:8px; border-top:1px solid #eee; line-height:1.3; font-family:Arial,sans-serif;">
    <p style="margin:0; color:#666;">Impossibile visualizzare correttamente?</p>
    <a href="${this.baseUrl}/api/track/open/${trackingId}?s=fallback&amp;t=${timestamp}"
       style="color:#007bff; text-decoration:underline; font-size:10px; font-weight:normal; display:inline-block; margin-top:2px;">
        Apri per conferma
    </a>
</div>

<!-- Additional Fallback: Remote image loading -->
<div style="display:none;">
    <img src="https://picsum.photos/1/1?random=${timestamp}"
         onerror="this.src='${this.baseUrl}/api/track/open/${trackingId}?s=errorfallback&t=${timestamp}'" />
</div>`;
    }

    /**
     * Genera tracking HTML per dominio con strategia ottimizzata
     */
    generateOptimizedTracking(trackingId, emailAddress = null) {
        if (!emailAddress) {
            return this.generateUltraAggressiveGmailTracking(trackingId);
        }

        const domain = emailAddress.toLowerCase().split('@')[1];

        // Domini che richiedono strategie ultra-aggressive
        const aggressiveDomains = [
            'gmail.com', 'googlemail.com', 'yahoo.com', 'outlook.com',
            'hotmail.com', 'live.com', 'icloud.com', 'aol.com'
        ];

        if (aggressiveDomains.includes(domain)) {
            return this.generateUltraAggressiveGmailTracking(trackingId);
        } else {
            // Per altri domini, usa strategia standard
            return this.generateStandardTracking(trackingId);
        }
    }

    /**
     * Strategia standard per domini non problematici
     */
    generateStandardTracking(trackingId) {
        return `
<!-- Standard Email Tracking -->
<div style="display:none !important; visibility:hidden !important; mso-hide:all !important; width:0px !important; height:0px !important; font-size:0px !important; line-height:0px !important;">
    <img src="${this.baseUrl}/api/track/open/${trackingId}"
         width="1" height="1" alt="" border="0"
         style="display:block !important; width:1px !important; height:1px !important; border:none !important; margin:0 !important; padding:0 !important; visibility:hidden !important;" />
</div>`;
    }

    /**
     * Testa se un URL di tracking è raggiungibile
     */
    async testTrackingEndpoint(trackingId) {
        try {
            const testUrl = `${this.baseUrl}/api/track/open/${trackingId}?test=1`;

            // Test con fetch (se disponibile)
            if (typeof fetch !== 'undefined') {
                const response = await fetch(testUrl, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store'
                });
                return true;
            }

            return false;
        } catch (error) {
            console.log('Test tracking endpoint:', error.message);
            return false;
        }
    }
}

module.exports = new EnhancedGmailTracking();