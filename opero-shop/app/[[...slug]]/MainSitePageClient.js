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

export default function MainSitePageClient({ slug }) {
    const [data, setData] = useState(null);
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, [slug]);

    const loadContent = async () => {
        setLoading(true);
        try {
            // Usa percorso relativo per client-side (nginx reverse proxy)
            const pageSlug = slug || 'home';

            // Fetch pagina principale
            const res = await fetch(`/api/public/shop/main-site/page/${pageSlug}`, { cache: 'no-store' });
            const result = await res.json();
            setData(result);

            // Se non c'è contenuto, carica la directory
            if (!result || !result.success) {
                const dirRes = await fetch(`/api/public/shop/directory`, { cache: 'no-store' });
                const dirResult = await dirRes.json();
                setDirectory(dirResult.success ? dirResult.companies : []);
            }
        } catch (e) {
            console.error("Errore caricamento:", e);
            // Carica directory come fallback
            try {
                const dirRes = await fetch(`/api/public/shop/directory`, { cache: 'no-store' });
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

    // Se non c'è contenuto del sito principale, mostra la landing page con directory
    if (!data || !data.success) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2563eb' }}>
                        Benvenuto in Opero Cloud
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
                        La piattaforma completa per gestire la tua azienda
                    </p>
                </header>

                {/* Sezione CTA */}
                <section style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '3rem',
                    borderRadius: '12px',
                    marginBottom: '3rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        Crea il tuo sito e-commerce
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.95 }}>
                        Unisciti alla nostra piattaforma e crea il tuo sito professionale in pochi minuti
                    </p>
                    <a
                        href="mailto:info@operocloud.it"
                        style={{
                            display: 'inline-block',
                            background: 'white',
                            color: '#667eea',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                        }}
                    >
                        Contattaci per iniziare
                    </a>
                </section>

                {/* Directory ditte */}
                {directory.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Siti presenti sulla piattaforma
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {directory.map((company) => (
                                <CompanyCard key={company.id} company={company} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Informazioni */}
                {directory.length === 0 && (
                    <section style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px' }}>
                        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                            Nessun sito presente al momento. Contattaci per creare il tuo!
                        </p>
                    </section>
                )}
            </div>
        );
    }

    // Renderizza il sito principale con il CMS
    const { siteConfig, components } = data;
    const LayoutComponent = TEMPLATES[siteConfig.template] || TEMPLATES['standard'];

    const themeStyles = {
        '--primary-color': siteConfig.colors?.primary || '#2563eb',
        '--secondary-color': siteConfig.colors?.secondary || '#64748b',
    };

    return (
        <div style={themeStyles}>
            <LayoutComponent siteConfig={siteConfig} slug="main">
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
                            <BlockComponent config={config} dittaId="main" />
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
                        <h2>🎉 {siteConfig.name || 'Opero Cloud'}</h2>
                        <p>Sito principale pronto per essere configurato</p>
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
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s',
                background: 'white',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.1)' : 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                {company.logo_url && (
                    <img
                        src={company.logo_url}
                        alt={company.ragione_sociale}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', marginRight: '1rem' }}
                    />
                )}
                <h3 style={{ fontSize: '1.2rem', color: '#1f2937', margin: 0 }}>
                    {company.ragione_sociale}
                </h3>
            </div>
            {company.directory_description && (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {company.directory_description}
                </p>
            )}
            {company.citta && (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                    📍 {company.citta} {company.provincia && `(${company.provincia})`}
                </p>
            )}
        </a>
    );
}
