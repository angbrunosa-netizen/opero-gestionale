/**
 * Nome File: BlogListBlock.js
 * Percorso: opero-shop/components/blocks/BlogListBlock.js
 * Data: 18/12/2025
 * Descrizione: Blocco per visualizzare le ultime news/blog in homepage
 */

"use client";
import React, { useState, useEffect } from 'react';

export default function BlogListBlock({ config }) {
    if (!config) return null;

    const {
        titolo = 'Ultime News',
        limite = 3,
        mostraData = true,
        mostraCategoria = true,
        mostraAutore = false,
        layout = 'grid', // 'grid' o 'list'
        mostRecentOnly = false,
        categoriaSlug = '' // filtra per categoria specifica
    } = config;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Recupera il sito corrente dall'URL
    const getCurrentSite = () => {
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';

            if (hostname.includes(rootDomain) && hostname !== rootDomain) {
                return hostname.replace(`.${rootDomain}`, '');
            }
        }
        return 'default';
    };

    useEffect(() => {
        loadPosts();
    }, [limite, categoriaSlug]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const site = getCurrentSite();
            let url = `${process.env.NEXT_PUBLIC_API_URL}/api/public/shop/${site}/blog/posts?limit=${limite}`;

            if (categoriaSlug) {
                url += `&category=${categoriaSlug}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                // Se mostRecentOnly è true, mostra solo il primo post
                const filteredPosts = mostRecentOnly ? [data.posts[0]] : data.posts;
                setPosts(filteredPosts || []);
            } else {
                setError('Impossibile caricare gli articoli');
            }
        } catch (err) {
            console.error('Errore caricamento posts:', err);
            setError('Errore nel caricare gli articoli');
        } finally {
            setLoading(false);
        }
    };

    // Formatta data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Componente card articolo
    const PostCard = ({ post, isFeatured = false }) => {
        return (
            <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${isFeatured ? 'md:col-span-2' : ''}`}>
                {/* Immagine copertina */}
                {post.copertina_url && (
                    <div className="relative h-48 bg-gray-200">
                        <img
                            src={post.copertina_url}
                            alt={post.titolo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />

                        {/* Badge categoria */}
                        {mostraCategoria && post.categoria_nome && (
                            <div
                                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: post.categoria_colore || '#2563eb' }}
                            >
                                {post.categoria_nome}
                            </div>
                        )}

                        {/* Badge PDF */}
                        {post.pdf_url && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                                PDF
                            </div>
                        )}
                    </div>
                )}

                <div className="p-6">
                    {/* Titolo */}
                    <h3 className={`font-bold text-gray-800 mb-2 line-clamp-2 ${isFeatured ? 'text-2xl' : 'text-lg'}`}>
                        <a
                            href={`/blog/${post.slug}`}
                            className="hover:text-blue-600 transition-colors"
                        >
                            {post.titolo}
                        </a>
                    </h3>

                    {/* Meta informazioni */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {mostraData && (
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(post.data_pubblicazione)}
                            </span>
                        )}

                        {mostraAutore && post.autore && (
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {post.autore}
                            </span>
                        )}
                    </div>

                    {/* Descrizione breve */}
                    {post.descrizione_breve && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.descrizione_breve}
                        </p>
                    )}

                    {/* Link leggi tutto */}
                    <a
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                    >
                        {post.pdf_url ? 'Leggi il PDF' : 'Leggi tutto'}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        );
    };

    // Layout Lista
    if (layout === 'list') {
        return (
            <section className="py-12 px-4">
                <div className="container mx-auto">
                    {/* Titolo sezione */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">{titolo}</h2>
                        <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                    </div>

                    {/* Contenuto */}
                    <div className="max-w-4xl mx-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Caricamento articoli...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Nessun articolo disponibile</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {posts.map((post, index) => (
                                    <PostCard key={post.id} post={post} isFeatured={index === 0 && !mostRecentOnly} />
                                ))}
                            </div>
                        )}

                        {/* Link a tutti gli articoli */}
                        {!mostRecentOnly && (
                            <div className="text-center mt-10">
                                <a
                                    href="/blog"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Vedi tutti gli articoli
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    // Layout Grid (default)
    return (
        <section className="py-12 px-4">
            <div className="container mx-auto">
                {/* Titolo sezione */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{titolo}</h2>
                    <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                </div>

                {/* Contenuto */}
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Caricamento articoli...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nessun articolo disponibile</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${mostRecentOnly ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                            {posts.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    isFeatured={index === 0 && !mostRecentOnly && posts.length > 2}
                                />
                            ))}
                        </div>
                    )}

                    {/* Link a tutti gli articoli */}
                    {!mostRecentOnly && (
                        <div className="text-center mt-10">
                            <a
                                href="/blog"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Vedi tutti gli articoli
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}