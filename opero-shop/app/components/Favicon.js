/**
 * Componente per favicon personalizzata per tenant
 * Percorso: opero-shop/app/components/Favicon.js
 */
import React from 'react';

export default function Favicon({ faviconUrl }) {
    if (!faviconUrl) {
        return null; // Usa la favicon di default
    }

    return (
        <>
            <link rel="icon" type="image/x-icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            {/* Apple Touch Icon */}
            <link rel="apple-touch-icon" href={faviconUrl} />
            {/* Icon per diverse dimensioni */}
            <link rel="icon" type="image/png" sizes="32x32" href={faviconUrl} />
            <link rel="icon" type="image/png" sizes="16x16" href={faviconUrl} />
        </>
    );
}
