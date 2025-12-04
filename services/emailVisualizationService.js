// #####################################################################
// # Email Visualization Service - Multi-Aperture Display
// # File: opero/services/emailVisualizationService.js
// #####################################################################

/**
 * Servizio per la visualizzazione completa delle letture email
 * Implementa visualizzazione multi-apertura con timestamp e conteggi
 */

class EmailVisualizationService {
    constructor() {
        this.dbPool = require('../config/db').dbPool;
    }

    /**
     * Ottiene statistiche complete di apertura per una email
     */
    async getEmailOpenStats(trackingId) {
        try {
            // Dettagli email principale
            const [emailDetails] = await this.dbPool.query(`
                SELECT
                    ei.id,
                    ei.destinatari,
                    ei.oggetto,
                    ei.aperta,
                    ei.data_prima_apertura,
                    ei.open_count,
                    ei.data_invio,
                    ei.tracking_id,
                    CASE
                        WHEN ei.tracking_id LIKE 'track_%' THEN 'Nuovo Sistema'
                        ELSE 'Vecchio Sistema'
                    END as tracking_system
                FROM email_inviate ei
                WHERE ei.tracking_id = ?
            `, [trackingId]);

            if (emailDetails.length === 0) {
                return null;
            }

            const email = emailDetails[0];

            // Dettagli aperture multiple
            const [openDetails] = await this.dbPool.query(`
                SELECT
                    tracking_id,
                    ip_address,
                    user_agent,
                    opened_at,
                    open_count
                FROM email_open_tracking
                WHERE tracking_id = ?
                ORDER BY opened_at ASC
            `, [trackingId]);

            // Statistiche aggregate
            const [aggregateStats] = await this.dbPool.query(`
                SELECT
                    COUNT(*) as total_opens,
                    COUNT(DISTINCT ip_address) as unique_ips,
                    MIN(opened_at) as first_open,
                    MAX(opened_at) as last_open,
                    SUM(open_count) as sum_open_count
                FROM email_open_tracking
                WHERE tracking_id = ?
            `, [trackingId]);

            const stats = aggregateStats[0];

            return {
                email: email,
                opens: openDetails,
                statistics: {
                    total_opens: stats.total_opens || 0,
                    unique_ips: stats.unique_ips || 0,
                    first_open: stats.first_open,
                    last_open: stats.last_open,
                    sum_open_count: stats.sum_open_count || 0,
                    duration: this.calculateDuration(stats.first_open, stats.last_open)
                },
                visualization: this.generateVisualizationHTML(openDetails)
            };

        } catch (error) {
            console.error('Errore getEmailOpenStats:', error.message);
            throw error;
        }
    }

    /**
     * Ottiene statistiche per periodo
     */
    async getPeriodStats(startDate, endDate) {
        try {
            const [periodStats] = await this.dbPool.query(`
                SELECT
                    ei.id,
                    ei.destinatari,
                    ei.oggetto,
                    ei.tracking_id,
                    ei.data_invio,
                    CASE
                        WHEN ei.tracking_id LIKE 'track_%' THEN 'Nuovo Sistema'
                        ELSE 'Vecchio Sistema'
                    END as tracking_system,
                    COUNT(eot.tracking_id) as tracking_records,
                    COALESCE(SUM(eot.open_count), 0) as total_opens,
                    MAX(eot.opened_at) as last_opened,
                    CASE
                        WHEN COUNT(eot.tracking_id) > 0 THEN 'Tracciato'
                        ELSE 'Non tracciato'
                    END as tracking_status
                FROM email_inviate ei
                LEFT JOIN email_open_tracking eot ON ei.tracking_id = eot.tracking_id
                WHERE ei.data_invio BETWEEN ? AND ?
                    AND ei.tracking_id IS NOT NULL
                GROUP BY ei.id
                ORDER BY ei.data_invio DESC
            `, [startDate, endDate]);

            // Statistiche aggregate del periodo
            const totalEmails = periodStats.length;
            const trackedEmails = periodStats.filter(e => e.tracking_records > 0).length;
            const totalOpens = periodStats.reduce((sum, e) => sum + e.total_opens, 0);

            return {
                summary: {
                    total_emails: totalEmails,
                    tracked_emails: trackedEmails,
                    tracking_rate: totalEmails > 0 ? Math.round((trackedEmails / totalEmails) * 100) : 0,
                    total_opens: totalOpens,
                    avg_opens_per_email: trackedEmails > 0 ? Math.round(totalOpens / trackedEmails * 10) / 10 : 0,
                    period: { start: startDate, end: endDate }
                },
                emails: periodStats
            };

        } catch (error) {
            console.error('Errore getPeriodStats:', error.message);
            throw error;
        }
    }

    /**
     * Genera HTML visualizzazione aperture
     */
    generateVisualizationHTML(opens) {
        if (!opens || opens.length === 0) {
            return `
            <div class="no-opens" style="padding: 20px; text-align: center; color: #999;">
                <i class="fas fa-envelope-open"></i>
                <p>Nessuna apertura registrata</p>
            </div>`;
        }

        let html = `
        <div class="open-visualization" style="font-family: Arial, sans-serif; font-size: 12px;">
            <div class="opens-header" style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>📊 Dettaglio Aperture (${opens.length})</strong>
            </div>
            <div class="opens-list">`;

        opens.forEach((open, index) => {
            const openTime = new Date(open.opened_at);
            const timeStr = openTime.toLocaleString('it-IT');
            const ipAddress = open.ip_address || 'Sconosciuto';

            html += `
            <div class="open-item" style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                <div class="open-number" style="width: 30px; height: 30px; background: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; margin-right: 10px;">
                    ${open.open_count}
                </div>
                <div class="open-details" style="flex: 1;">
                    <div class="open-time" style="font-weight: bold; color: #333;">
                        ${timeStr}
                    </div>
                    <div class="open-meta" style="color: #666; font-size: 10px;">
                        IP: ${ipAddress} | Count: ${open.open_count}
                    </div>
                </div>
                <div class="open-icon" style="color: #28a745;">
                    <i class="fas fa-eye"></i>
                </div>
            </div>`;
        });

        html += `
            </div>
        </div>`;

        return html;
    }

    /**
     * Genera tabella HTML completa per visualizzazione email
     */
    async generateEmailTableHTML(startDate, endDate) {
        try {
            const periodStats = await this.getPeriodStats(startDate, endDate);

            let html = `
            <div class="email-tracking-dashboard" style="font-family: Arial, sans-serif; margin: 20px;">

                <!-- Riepilogo Periodo -->
                <div class="period-summary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0;">📊 Riepilogo Tracking Email</h3>
                    <div class="summary-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 24px; font-weight: bold;">${periodStats.summary.total_emails}</div>
                            <div class="stat-label" style="opacity: 0.8;">Email Inviate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 24px; font-weight: bold;">${periodStats.summary.tracked_emails}</div>
                            <div class="stat-label" style="opacity: 0.8;">Email Tracciate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 24px; font-weight: bold;">${periodStats.summary.tracking_rate}%</div>
                            <div class="stat-label" style="opacity: 0.8;">Tracking Rate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 24px; font-weight: bold;">${periodStats.summary.total_opens}</div>
                            <div class="stat-label" style="opacity: 0.8;">Aperture Totali</div>
                        </div>
                    </div>
                </div>

                <!-- Tabella Email -->
                <div class="email-table-container" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8f9fa;">
                            <tr>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Destinatario</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Oggetto</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Stato</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Aperture</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Sistema</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Inviata</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>`;

            periodStats.emails.forEach((email, index) => {
                const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
                const statusColor = email.tracking_records > 0 ? '#28a745' : '#dc3545';
                const statusText = email.tracking_records > 0 ? '✅ Tracciato' : '❌ Non tracciato';

                html += `
                <tr class="${rowClass}" style="background: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                        <div style="font-weight: 500;">${email.destinatari}</div>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                        <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email.oggetto}</div>
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                        <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                        <div style="font-weight: bold; color: #007bff;">${email.total_opens}</div>
                        ${email.last_opened ? `<div style="font-size: 10px; color: #666;">Ultima: ${new Date(email.last_opened).toLocaleDateString('it-IT')}</div>` : ''}
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                        <span class="system-badge" style="background: ${email.tracking_system === 'Nuovo Sistema' ? '#007bff' : '#6c757d'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">
                            ${email.tracking_system}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6; font-size: 12px;">
                        ${new Date(email.data_invio).toLocaleDateString('it-IT')}
                    </td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                        <button onclick="showEmailDetails('${email.tracking_id}')" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            👁️ Dettagli
                        </button>
                    </td>
                </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                </div>

                <!-- JavaScript per dettagli dinamici -->
                <script>
                async function showEmailDetails(trackingId) {
                    // Modal per mostrare dettagli aperture
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';

                    const content = document.createElement('div');
                    content.style.cssText = 'background: white; padding: 20px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;';

                    content.innerHTML = '<h3>Caricamento dettagli...</h3>';
                    modal.appendChild(content);
                    document.body.appendChild(modal);

                    try {
                        const response = await fetch('/api/email/tracking-details/' + trackingId);
                        const details = await response.json();

                        content.innerHTML = \`
                            <h3>📧 Dettagli Tracking Email</h3>
                            <p><strong>Destinatario:</strong> \${details.email.destinatari}</p>
                            <p><strong>Oggetto:</strong> \${details.email.oggetto}</p>
                            <p><strong>Totale Aperture:</strong> \${details.statistics.total_opens}</p>
                            <p><strong>IP Unici:</strong> \${details.statistics.unique_ips}</p>
                            \${details.visualization}
                        \`;
                    } catch (error) {
                        content.innerHTML = '<p style="color: red;">Errore caricamento dettagli</p>';
                    }

                    modal.addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });

                    content.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
                </script>
            </div>`;

            return html;

        } catch (error) {
            console.error('Errore generateEmailTableHTML:', error.message);
            throw error;
        }
    }

    /**
     * Calcola durata tra prima e ultima apertura
     */
    calculateDuration(firstOpen, lastOpen) {
        if (!firstOpen || !lastOpen) return null;

        const first = new Date(firstOpen);
        const last = new Date(lastOpen);
        const diff = last - first;

        if (diff < 60000) return '< 1 minuto';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' minuti';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' ore';
        return Math.floor(diff / 86400000) + ' giorni';
    }

    /**
     * Ottiene statistiche per dominio
     */
    async getDomainStats(days = 30) {
        try {
            const [domainStats] = await this.dbPool.query(`
                SELECT
                    SUBSTRING_INDEX(ei.destinatari, '@', -1) as domain,
                    COUNT(*) as total_emails,
                    COUNT(DISTINCT eot.tracking_id) as tracked_emails,
                    COALESCE(SUM(eot.open_count), 0) as total_opens,
                    COUNT(DISTINCT eot.ip_address) as unique_ips,
                    MAX(eot.opened_at) as last_open
                FROM email_inviate ei
                LEFT JOIN email_open_tracking eot ON ei.tracking_id = eot.tracking_id
                WHERE ei.data_invio >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    AND ei.tracking_id IS NOT NULL
                GROUP BY domain
                ORDER BY total_emails DESC
            `, [days]);

            return domainStats.map(stat => ({
                ...stat,
                tracking_rate: stat.total_emails > 0 ? Math.round((stat.tracked_emails / stat.total_emails) * 100) : 0,
                avg_opens_per_email: stat.tracked_emails > 0 ? Math.round((stat.total_opens / stat.tracked_emails) * 10) / 10 : 0
            }));

        } catch (error) {
            console.error('Errore getDomainStats:', error.message);
            throw error;
        }
    }
}

module.exports = new EmailVisualizationService();