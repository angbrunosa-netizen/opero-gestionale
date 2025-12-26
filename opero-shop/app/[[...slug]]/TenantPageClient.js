'use client';

import { useEffect, useState } from 'react';
import { BLOCK_REGISTRY } from '../../components/BlockRegistry';
import StandardLayout from '../../components/templates/Standard/Layout';
import FashionLayout from '../../components/templates/Fashion/Layout';
import IndustrialLayout from '../../components/templates/Industrial/Layout';

const TEMPLATES = {
    'standard': StandardLayout,
    'fashion': FashionLayout,
    'industrial': IndustrialLayout
};

export default function TenantPageClient({ site, slug }) {
    const [data, setData] = useState(null);
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, [site, slug]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const baseUrl = process.env.API_URL || 'http://localhost:5000';
            const pageSlug = slug || 'home';
            const apiUrl = `${baseUrl}/api/public/shop/${site}/page/${pageSlug}`;

            const res = await fetch(apiUrl, { cache: 'no-store' });
            const result = await res.json();
            setData(result);

            // Se non c'è contenuto, carica la directory per la pagina 404
            if (!result || !result.success) {
                const dirRes = await fetch(`${baseUrl}/api/public/shop/directory`, { cache: 'no-store' });
                const dirResult = await dirRes.json();
                setDirectory(dirResult.success ? dirResult.companies : []);
            }
        } catch (e) {
            console.error("Errore caricamento:", e);
            // Carica directory come fallback
            try {
                const baseUrl = process.env.API_URL || 'http://localhost:5000';
                const dirRes = await fetch(`${baseUrl}/api/public/shop/directory`, { cache: 'no-store' });
                const dirResult = await dirRes.json();
                setDirectory(dirResult.success ? dirResult.companies : []);
            } catch (err) {
                console.error("Errore caricamento directory:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
                Caricamento...
            </div>
        );
    }

    // Se il backend non risponde o il sito non esiste, mostra pagina di errore con directory
    if (!data || !data.success) {
        return (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 2rem',
                        borderRadius: '50%',
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem'
                    }}>
                        🔍
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1f2937' }}>
                        Sito non trovato
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Il sottodominio <strong>{site}</strong> non esiste o non è attivo.
                    </p>
                    <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
                        Verifica di aver digitato correttamente l'indirizzo o scegli uno dei siti disponibili:
                    </p>
                </div>

                {/* CTA per creare un nuovo sito */}
                <section style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    marginBottom: '3rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        Vuoi creare un sito per la tua azienda?
                    </h2>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.95 }}>
                        Contattaci per attivare il tuo sito e-commerce su Opero Cloud
                    </p>
                    <a
                        href="mailto:info@operocloud.it?subject=Richiesta%20nuovo%20sito%20e-commerce"
                        style={{
                            display: 'inline-block',
                            background: 'white',
                            color: '#667eea',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        📧 Contattaci ora
                    </a>
                </section>

                {/* Directory dei siti disponibili */}
                {directory.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1f2937' }}>
                            Siti disponibili sulla piattaforma
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {directory.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Link torna alla home */}
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <a
                        href={`http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost'}`}
                        style={{
                            display: 'inline-block',
                            color: '#667eea',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        ← Torna alla homepage di Opero Cloud
                    </a>
                </div>
            </div>
        );
    }

    const { siteConfig, components } = data;
    const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];

    const themeStyles = {
        '--primary-color': siteConfig.colors?.primary || '#2563eb',
        '--secondary-color': siteConfig.colors?.secondary || '#64748b',
        '--block-background-color': siteConfig.colors?.blockBackground || '#ffffff',
        '--header-background-color': siteConfig.colors?.headerBackground || '#ffffff',
        '--header-text-color': siteConfig.colors?.headerText || '#333333',
    };

    return (
        <div style={themeStyles}>
            <LayoutComponent siteConfig={siteConfig} slug={site}>
                {components && components.map((block, index) => {
                    const BlockComponent = BLOCK_REGISTRY[block.tipo_componente];

                    if (!BlockComponent) {
                        return (
                            <section key={index} className="cms-block block-unknown">
                                <div style={{
                                    padding: '1rem',
                                    border: '1px dashed #ccc',
                                    margin: '1rem 0',
                                    textAlign: 'center',
                                    color: '#666'
                                }}>
                                    ⚠️ Componente "{block.tipo_componente}" non trovato
                                </div>
                            </section>
                        );
                    }

                    let config = block.dati_config;
                    if (typeof config === 'string') {
                        try { config = JSON.parse(config); } catch(e) {
                            console.error('Errore parsing config:', e);
                            config = {};
                        }
                    }

                    return (
                        <section key={index} className={`cms-block block-${block.tipo_componente.toLowerCase()}`}>
                            <BlockComponent config={config} dittaId={site} />
                        </section>
                    );
                })}

                {(!components || components.length === 0) && (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        background: '#f8f9fa',
                        margin: '1rem 0',
                        borderRadius: '8px'
                    }}>
                        <h2>🎉 {siteConfig.name || site}</h2>
                        <p>Sito e-commerce pronto per essere configurato</p>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Aggiungi componenti dal CMS per personalizzare questa pagina.
                        </p>
                    </div>
                )}
            </LayoutComponent>
        </div>
    );
}

// Componente separato per la card con interattività
function CompanyCard({ company }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <a
            href={`http://${company.url_slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost'}`}
            style={{
                display: 'block',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: 'white',
                borderColor: isHovered ? '#667eea' : '#e5e7eb',
                boxShadow: isHovered ? '0 4px 12px rgba(102, 126, 234, 0.15)' : 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                {company.logo_url && (
                    <img
                        src={company.logo_url}
                        alt={company.ragione_sociale}
                        style={{ width: '32px', height: '32px', objectFit: 'contain', marginRight: '0.75rem' }}
                    />
                )}
                <strong style={{ color: '#1f2937', fontSize: '1rem' }}>
                    {company.ragione_sociale}
                </strong>
            </div>
            {company.citta && (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>
                    📍 {company.citta} {company.provincia && `(${company.provincia})`}
                </p>
            )}
        </a>
    );
}
