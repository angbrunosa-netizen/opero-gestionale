/**
 * Route Handler API per favicon dinamica
 * Percorso: opero-shop/app/api/favicon/route.js
 * Route: /api/favicon?site=nomesito
 */
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');

    // Favicon di default (puoi metterere il tuo file public/favicon.ico)
    const defaultFavicon = '/favicon.ico';

    if (!site) {
        // Reindirizza alla favicon di default
        return NextResponse.redirect(new URL(defaultFavicon, request.url));
    }

    try {
        // Chiama il backend per ottenere la configurazione del sito
        const response = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/public/shop/${site}/config`);

        if (!response.ok) {
            return NextResponse.redirect(new URL(defaultFavicon, request.url));
        }

        const data = await response.json();

        if (data.favicon) {
            // Reindirizza alla favicon personalizzata
            return NextResponse.redirect(data.favicon);
        } else {
            // Reindirizza alla favicon di default
            return NextResponse.redirect(new URL(defaultFavicon, request.url));
        }
    } catch (error) {
        console.error('Errore nel caricamento favicon:', error);
        return NextResponse.redirect(new URL(defaultFavicon, request.url));
    }
}
