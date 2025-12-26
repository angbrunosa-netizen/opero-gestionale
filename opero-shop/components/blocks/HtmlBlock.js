"use client";
import React, { useState, useEffect } from 'react';

export default function HtmlBlock({ config }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Esegui script personalizzati dopo il rendering
        if (!isClient || !config?.scripts || config.scripts.length === 0) return;

        config.scripts.forEach(scriptConfig => {
            if (scriptConfig.type === 'inline' && scriptConfig.content) {
                try {
                    // eslint-disable-next-line no-eval
                    eval(scriptConfig.content);
                } catch (error) {
                    console.error('Errore esecuzione script inline:', error);
                }
            }
        });
    }, [isClient, config?.scripts]);

    // Debug log
    useEffect(() => {
        console.log('[HtmlBlock] Render con config:', config);
    }, [config]);

    if (!config) {
        console.log('[HtmlBlock] Nessuna config fornita, rendering placeholder');
        return (
            <div className="html-block p-4 border border-dashed border-gray-300 bg-gray-50 text-center">
                <p className="text-gray-500 text-sm">HTML Block - Configurazione mancante</p>
            </div>
        );
    }

    const {
        // HTML personalizzato (editor WYSIWYG)
        html = '',

        // Codice HTML personalizzato (raw code inserito manualmente)
        rawHtmlCode = '',

        // Stili di base
        fontFamily = 'Arial, sans-serif',
        fontSize = '16px',
        textColor = '#333333',
        backgroundColor = null,
        textAlign = 'left',
        padding = '0',
        margin = '0',

        // Integrazioni Social
        socialEmbed = null, // { type: 'facebook|instagram|twitter|youtube|tiktok', url: '', ...options }

        // Widget e Mappe
        widget = null, // { type: 'google-map|youtube-video|vimeo-video|calendly|typeform', ...options }

        // Azioni Quick
        quickActions = [], // [{ type: 'whatsapp|phone|email|download', ...options }]

        // Tracking e Analytics
        tracking = [], // [{ type: 'ga4|fbpixel|hotjar|custom', id: '', ...options }]

        // Script personalizzati
        scripts = [], // [{ type: 'inline|external', content: '', src: '', async: true }]

        // Layout
        maxWidth = '100%',
        minHeight = 'auto'
    } = config;

    // Genera codice embed per social media
    const generateSocialEmbed = () => {
        if (!socialEmbed) return null;

        switch (socialEmbed.type) {
            case 'facebook':
                return generateFacebookEmbed(socialEmbed);
            case 'instagram':
                return generateInstagramEmbed(socialEmbed);
            case 'twitter':
            case 'x':
                return generateTwitterEmbed(socialEmbed);
            case 'youtube':
                return generateYouTubeEmbed(socialEmbed);
            case 'tiktok':
                return generateTikTokEmbed(socialEmbed);
            case 'linkedin':
                return generateLinkedInEmbed(socialEmbed);
            case 'pinterest':
                return generatePinterestEmbed(socialEmbed);
            default:
                return null;
        }
    };

    // Facebook Post/Page Embed
    const generateFacebookEmbed = (embedConfig) => {
        const { url, width = '100%', height = 'auto', showText = true } = embedConfig;
        const actualWidth = width === 'custom' ? (embedConfig.widthCustom || '100%') : width;
        const actualHeight = height === 'custom' ? (embedConfig.heightCustom || '500') : height;

        return (
            <div className="facebook-embed" style={{ overflow: 'hidden', width: actualWidth, height: actualHeight === 'auto' ? 'auto' : actualHeight }}>
                <iframe
                    src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=${showText}&width=${actualWidth}`}
                    width={actualWidth}
                    height={actualHeight === 'auto' ? '500' : actualHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        );
    };

    // Instagram Embed
    const generateInstagramEmbed = (embedConfig) => {
        const { url, width = '100%' } = embedConfig;
        const actualWidth = width === 'custom' ? (embedConfig.widthCustom || '100%') : width;

        return (
            <div className="instagram-embed" style={{ width: actualWidth }}>
                <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    style={{
                        background: '#FFF',
                        border: '0',
                        borderRadius: '3px',
                        boxShadow: '0 0 1px 0 rgba(0,0,0,0.3), 0 1px 0 rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
                        margin: '1px',
                        maxWidth: actualWidth === '100%' ? '540px' : actualWidth,
                        minWidth: '326px',
                        padding: '0',
                        width: actualWidth === '100%' ? '99.375%' : actualWidth,
                        width: '-webkit-calc(100% - 2px)',
                        width: 'calc(100% - 2px)'
                    }}
                />
                {isClient && (
                    <script
                        async
                        src="https://www.instagram.com/embed.js"
                        charSet="utf-8"
                    />
                )}
            </div>
        );
    };

    // Twitter/X Embed
    const generateTwitterEmbed = (embedConfig) => {
        const { url, theme = 'light', width = '100%' } = embedConfig;
        const actualWidth = width === 'custom' ? (embedConfig.widthCustom || '100%') : width;

        return (
            <div className="twitter-embed" style={{ width: actualWidth }}>
                <blockquote className="twitter-tweet" data-theme={theme} style={{ maxWidth: actualWidth === '100%' ? '550px' : actualWidth }}>
                    <a href={url}>Carica il Tweet</a>
                </blockquote>
                {isClient && (
                    <script
                        async
                        src="https://platform.twitter.com/widgets.js"
                        charSet="utf-8"
                    />
                )}
            </div>
        );
    };

    // YouTube Embed
    const generateYouTubeEmbed = (embedConfig) => {
        const { url, width = '100%', height = 'auto', autoplay = false, controls = true, loop = false } = embedConfig;
        const actualWidth = width === 'custom' ? (embedConfig.widthCustom || '100%') : width;
        const actualHeight = height === 'custom' ? (embedConfig.heightCustom || '500') : height;

        // Estrai video ID dall'URL
        let videoId = '';
        try {
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                videoId = urlObj.searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
            }
        } catch (e) {
            console.error('Errore estrazione YouTube ID:', e);
        }

        if (!videoId) return null;

        const params = new URLSearchParams({
            autoplay: autoplay ? 1 : 0,
            controls: controls ? 1 : 0,
            loop: loop ? 1 : 0,
            rel: 0
        });

        return (
            <div
                className="youtube-embed"
                style={{
                    position: 'relative',
                    width: actualWidth,
                    height: actualHeight === 'auto' ? '0' : actualHeight,
                    paddingBottom: actualHeight === 'auto' ? '56.25%' : '0',
                    overflow: 'hidden'
                }}
            >
                <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    };

    // TikTok Embed
    const generateTikTokEmbed = (embedConfig) => {
        const { url } = embedConfig;
        return (
            <div className="tiktok-embed">
                <blockquote
                    className="tiktok-embed"
                    cite={url}
                    data-video-id={url.split('/video/')[1]?.split('?')[0]}
                    style={{ maxWidth: '605px', minWidth: '325px' }}
                >
                    <section>
                        <a target="_blank" rel="noopener" href={url}>
                            Carica video TikTok
                        </a>
                    </section>
                </blockquote>
                {isClient && (
                    <script
                        async
                        src="https://www.tiktok.com/embed.js"
                        charSet="utf-8"
                    />
                )}
            </div>
        );
    };

    // LinkedIn Embed
    const generateLinkedInEmbed = (embedConfig) => {
        const { url, width = '100%', height = '500' } = embedConfig;
        return (
            <div className="linkedin-embed">
                <iframe
                    src={`https://www.linkedin.com/embed/feed/update/urn:li:share:${url.split(':').pop()}`}
                    height={height}
                    width={width}
                    frameBorder="0"
                    allowFullScreen
                    title="Post LinkedIn"
                />
            </div>
        );
    };

    // Pinterest Embed
    const generatePinterestEmbed = (embedConfig) => {
        const { url } = embedConfig;
        return (
            <div className="pinterest-embed">
                <a
                    data-pin-do="embedPin"
                    href={url}
                    style={{ borderRadius: '3px', boxSizing: 'border-box', textDecoration: 'none' }}
                >
                    Immagine Pinterest
                </a>
                {isClient && (
                    <script
                        async
                        defer
                        src="//assets.pinterest.com/js/pinit.js"
                    />
                )}
            </div>
        );
    };

    // Genera Widget (Mappe, Video, Form)
    const generateWidget = () => {
        if (!widget) return null;

        switch (widget.type) {
            case 'google-map':
                return generateGoogleMap(widget);
            case 'youtube-video':
                return generateYouTubeEmbed(widget);
            case 'vimeo-video':
                return generateVimeoVideo(widget);
            case 'calendly':
                return generateCalendlyWidget(widget);
            case 'typeform':
                return generateTypeformWidget(widget);
            default:
                return null;
        }
    };

    // Google Maps
    const generateGoogleMap = (mapConfig) => {
        const { address = '', zoom = 15, width = '100%', height = '400', mapType = 'roadmap' } = mapConfig;
        const encodedAddress = encodeURIComponent(address);
        return (
            <div className="google-map" style={{ width, height }}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodedAddress}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        );
    };

    // Vimeo Video
    const generateVimeoVideo = (videoConfig) => {
        const { videoId, autoplay = false, controls = true } = videoConfig;
        const params = new URLSearchParams({
            autoplay: autoplay ? 1 : 0,
            controls: controls ? 1 : 0
        });

        return (
            <div className="vimeo-embed" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://player.vimeo.com/video/${videoId}?${params.toString()}`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    };

    // Calendly Widget
    const generateCalendlyWidget = (calendlyConfig) => {
        const { url, width = '100%', height = '700' } = calendlyConfig;
        return (
            <div className="calendly-widget" style={{ minWidth: '320px', height }}>
                <iframe
                    src={url}
                    width={width}
                    height={height}
                    frameBorder="0"
                    title="Calendly"
                />
            </div>
        );
    };

    // Typeform Widget
    const generateTypeformWidget = (typeformConfig) => {
        const { formId, width = '100%', height = '500' } = typeformConfig;
        return (
            <div className="typeform-widget" style={{ width, height }}>
                <iframe
                    src={`https://form.typeform.com/to/${formId}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    frameBorder="0"
                />
            </div>
        );
    };

    // Genera Quick Actions (WhatsApp, Phone, Email, Download)
    const generateQuickActions = () => {
        if (!quickActions || quickActions.length === 0) return null;

        return (
            <div className="quick-actions flex flex-wrap gap-4 mt-4">
                {quickActions.map((action, index) => {
                    const { type, label, value, icon, style = 'primary', size = 'md' } = action;

                    const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 hover:scale-105";

                    const sizeClasses = {
                        sm: "px-3 py-1.5 text-sm",
                        md: "px-4 py-2 text-base",
                        lg: "px-6 py-3 text-lg"
                    };

                    const styleClasses = {
                        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
                        success: "bg-green-600 text-white hover:bg-green-700 shadow-md",
                        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md",
                        danger: "bg-red-600 text-white hover:bg-red-700 shadow-md",
                        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    };

                    const handleClick = () => {
                        switch (type) {
                            case 'whatsapp':
                                window.open(`https://wa.me/${value.replace(/\D/g, '')}`, '_blank');
                                break;
                            case 'phone':
                                window.open(`tel:${value}`);
                                break;
                            case 'email':
                                window.open(`mailto:${value}`);
                                break;
                            case 'download':
                                window.open(value, '_blank');
                                break;
                            case 'link':
                                window.open(value, '_blank');
                                break;
                            default:
                                break;
                        }
                    };

                    return (
                        <button
                            key={index}
                            onClick={handleClick}
                            className={`${baseClasses} ${sizeClasses[size]} ${styleClasses[style]}`}
                        >
                            {icon && <span className="text-lg">{icon}</span>}
                            {label}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Inietta script di tracking
    useEffect(() => {
        if (!isClient || !tracking || tracking.length === 0) return;

        tracking.forEach(tracker => {
            const { type, id } = tracker;

            try {
                switch (type) {
                    case 'ga4':
                        // Google Analytics 4
                        if (!document.querySelector(`script[src*="gtag/js?id=${id}"]`)) {
                            const script1 = document.createElement('script');
                            script1.async = true;
                            script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
                            document.head.appendChild(script1);

                            const script2 = document.createElement('script');
                            script2.innerHTML = `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${id}');
                            `;
                            document.head.appendChild(script2);
                        }
                        break;

                    case 'fbpixel':
                        // Facebook Pixel
                        if (!document.querySelector(`script[data-fbpixel="${id}"]`)) {
                            const script = document.createElement('script');
                            script.setAttribute('data-fbpixel', id);
                            script.innerHTML = `
                                !function(f,b,e,v,n,t,s)
                                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                                n.queue=[];t=b.createElement(e);t.async=!0;
                                t.src=v;s=b.getElementsByTagName(e)[0];
                                s.parentNode.insertBefore(t,s)}(window, document,'script',
                                'https://connect.facebook.net/en_US/fbevents.js');
                                fbq('init', '${id}');
                                fbq('track', 'PageView');
                            `;
                            document.head.appendChild(script);

                            const noscript = document.createElement('noscript');
                            noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/>`;
                            document.body.appendChild(noscript);
                        }
                        break;

                    case 'hotjar':
                        // Hotjar
                        if (!document.querySelector(`script[id*="hotjar"]`)) {
                            const script = document.createElement('script');
                            script.innerHTML = `
                                (function(h,o,t,j,a,r){
                                    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                                    h._hjSettings={hjid:${id},hjsv:6};
                                    a=o.getElementsByTagName('head')[0];
                                    r=o.createElement('script');r.async=1;
                                    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                                    a.appendChild(r);
                                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                            `;
                            document.head.appendChild(script);
                        }
                        break;

                    case 'custom':
                        // Script personalizzato
                        if (tracker.src && !document.querySelector(`script[src="${tracker.src}"]`)) {
                            const script = document.createElement('script');
                            script.src = tracker.src;
                            script.async = tracker.async !== false;
                            if (tracker.position === 'body') {
                                document.body.appendChild(script);
                            } else {
                                document.head.appendChild(script);
                            }
                        }
                        break;

                    default:
                        break;
                }
            } catch (error) {
                console.error(`Errore iniezione tracking ${type}:`, error);
            }
        });
    }, [isClient, tracking]);

    // Stile dinamico basato sulla configurazione
    const containerStyle = {
        fontFamily: fontFamily,
        fontSize: fontSize,
        color: textColor,
        backgroundColor: backgroundColor || 'transparent',
        textAlign: textAlign,
        padding: padding,
        margin: margin,
        maxWidth: maxWidth,
        minHeight: minHeight,
        lineHeight: '1.6'
    };

    // Placeholder quando non c'è contenuto
    const hasContent = html || rawHtmlCode || socialEmbed || widget || (quickActions && quickActions.length > 0);

    if (!hasContent) {
        return (
            <div style={containerStyle} className="html-block">
                <div className="text-gray-400 italic text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <p className="text-lg font-medium">Contenuto HTML / Widget / Social</p>
                    <p className="text-sm mt-2">Configura questo blocco dal CMS</p>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle} className="html-block">
            {/* HTML Personalizzato (da editor WYSIWYG) */}
            {html && (
                <div dangerouslySetInnerHTML={{ __html: html }} />
            )}

            {/* Codice HTML personalizzato (Raw Code - inserito manualmente) */}
            {rawHtmlCode && isClient && (
                <div className="raw-html-code">
                    <div dangerouslySetInnerHTML={{ __html: rawHtmlCode }} />
                </div>
            )}

            {/* Social Media Embed */}
            {socialEmbed && generateSocialEmbed()}

            {/* Widget (Mappe, Video, Form) */}
            {widget && generateWidget()}

            {/* Quick Actions */}
            {generateQuickActions()}
        </div>
    );
}
