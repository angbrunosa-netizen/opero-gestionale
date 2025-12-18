/**
 * Nome File: BlogManager.js
 * Percorso: opero-frontend/src/components/cms/BlogManager.js
 * Data: 18/12/2025
 * Descrizione: Componente React per la gestione completa del sistema blog
 */

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MediaPickerModal from '../../shared/MediaPickerModal';
import { api } from '../../services/api';

const BlogManager = ({ dittaId }) => {
    // Stati
    const [activeTab, setActiveTab] = useState('posts'); // posts, categories
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    // Variabile temporanea per tracciare il campo corrente nel media picker
    const [currentMediaField, setCurrentMediaField] = useState('');

    // Form post
    const [postForm, setPostForm] = useState({
        titolo: '',
        contenuto_html: '',
        descrizione_breve: '',
        id_category: '',
        pubblicato: false,
        in_evidenza: false,
        data_pubblicazione: new Date().toISOString().split('T')[0],
        autore: '',
        copertina_url: '',
        pdf_url: '',
        meta_titolo: '',
        meta_descrizione: '',
        contentType: 'html' // 'html' o 'pdf'
    });

    // Form categoria
    const [categoryForm, setCategoryForm] = useState({
        nome: '',
        slug: '',
        colore: '#2563eb',
        descrizione: '',
        ordine: 0
    });

    // Configurazione editor Quill
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    // Effetti
    useEffect(() => {
        loadCategories();
        if (activeTab === 'posts') {
            loadPosts();
        }
    }, [dittaId, activeTab]);

    // Funzioni di caricamento dati
    const loadPosts = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/blog/posts/${dittaId}`);
            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error('Errore caricamento post:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get(`/admin/blog/categories/${dittaId}`);
            if (res.data.success) {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.error('Errore caricamento categorie:', error);
        }
    };

    // Gestione form post
    const handlePostSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const formData = new FormData();

            // Aggiungi campi testo
            Object.keys(postForm).forEach(key => {
                if (key !== 'contentType') {
                    formData.append(key, postForm[key]);
                }
            });

            // Aggiungi file PDF se presente
            if (postForm.contentType === 'pdf' && postForm.pdf_file) {
                formData.append('pdf', postForm.pdf_file);
            }

            formData.append('id_ditta', dittaId);

            const res = await api.post('/admin/blog/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                window.alert(res.data.message);
                resetPostForm();
                loadPosts();
            }
        } catch (error) {
            console.error('Errore salvataggio post:', error);
            window.alert('Errore nel salvare il post');
        } finally {
            setLoading(false);
        }
    };

    const resetPostForm = () => {
        setPostForm({
            titolo: '',
            contenuto_html: '',
            descrizione_breve: '',
            id_category: '',
            pubblicato: false,
            in_evidenza: false,
            data_pubblicazione: new Date().toISOString().split('T')[0],
            autore: '',
            copertina_url: '',
            pdf_url: '',
            meta_titolo: '',
            meta_descrizione: '',
            contentType: 'html'
        });
        setEditingPost(null);
    };

    // Gestione categorie
    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await api.post('/admin/blog/categories', {
                ...categoryForm,
                id_ditta: dittaId
            });

            if (res.data.success) {
                window.alert('Categoria salvata con successo');
                resetCategoryForm();
                loadCategories();
            }
        } catch (error) {
            console.error('Errore salvataggio categoria:', error);
            window.alert('Errore nel salvare la categoria');
        } finally {
            setLoading(false);
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({
            nome: '',
            slug: '',
            colore: '#2563eb',
            descrizione: '',
            ordine: 0
        });
        setEditingCategory(null);
    };

    // Media Picker
    const openMediaPicker = (field) => {
        setCurrentMediaField(field);
        setIsMediaPickerOpen(true);
    };

    const handleMediaSelect = (files) => {
        if (files.length > 0) {
            setPostForm(prev => ({
                ...prev,
                [currentMediaField]: files[0].url
            }));
        }
        setIsMediaPickerOpen(false);
    };

    // Eliminazione
    const deletePost = async (postId) => {
        // Usa window.confirm per evitare l'errore ESLint
        if (!window.confirm('Sei sicuro di voler eliminare questo post?')) return;

        try {
            const res = await api.delete(`/admin/blog/posts/${postId}`, {
                data: { id_ditta: dittaId }
            });

            if (res.data.success) {
                window.alert(res.data.message);
                loadPosts();
            }
        } catch (error) {
            console.error('Errore eliminazione post:', error);
            window.alert('Errore nell\'eliminare il post');
        }
    };

    return (
        <div className="blog-manager p-6">
            {/* Header con tabs */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Gestione Blog & News</h2>
                <div className="flex space-x-4 border-b">
                    <button
                        className={`pb-2 px-4 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Articoli
                    </button>
                    <button
                        className={`pb-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categorie
                    </button>
                </div>
            </div>

            {/* Tab Articoli */}
            {activeTab === 'posts' && (
                <div className="space-y-6">
                    {/* Form Articolo */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingPost ? 'Modifica Articolo' : 'Nuovo Articolo'}
                        </h3>

                        <form onSubmit={handlePostSubmit} className="space-y-4">
                            {/* Tipo Contenuto */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Tipo Contenuto</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="html"
                                            checked={postForm.contentType === 'html'}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, contentType: e.target.value }))}
                                            className="mr-2"
                                        />
                                        Articolo HTML
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="pdf"
                                            checked={postForm.contentType === 'pdf'}
                                            onChange={(e) => setPostForm(prev => ({ ...prev, contentType: e.target.value }))}
                                            className="mr-2"
                                        />
                                        Documento PDF
                                    </label>
                                </div>
                            </div>

                            {/* Campi base */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Titolo *</label>
                                    <input
                                        type="text"
                                        value={postForm.titolo}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, titolo: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Autore</label>
                                    <input
                                        type="text"
                                        value={postForm.autore}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, autore: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Descrizione Breve (per preview)</label>
                                <textarea
                                    value={postForm.descrizione_breve}
                                    onChange={(e) => setPostForm(prev => ({ ...prev, descrizione_breve: e.target.value }))}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                />
                            </div>

                            {/* Contenuto basato sul tipo */}
                            {postForm.contentType === 'html' ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contenuto Articolo</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={postForm.contenuto_html}
                                        onChange={(value) => setPostForm(prev => ({ ...prev, contenuto_html: value }))}
                                        modules={quillModules}
                                        style={{ height: '200px' }}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Carica Documento PDF</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setPostForm(prev => ({ ...prev, pdf_file: e.target.files[0] }))}
                                        className="w-full border p-2 rounded"
                                    />
                                    {postForm.pdf_url && (
                                        <div className="mt-2">
                                            <a href={postForm.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                Visualizza PDF corrente
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Immagine copertina */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Immagine Copertina</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={postForm.copertina_url}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, copertina_url: e.target.value }))}
                                        className="flex-1 border p-2 rounded"
                                        placeholder="URL immagine copertina"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => openMediaPicker('copertina_url')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Scegli
                                    </button>
                                </div>
                                {postForm.copertina_url && (
                                    <img src={postForm.copertina_url} alt="Copertina" className="mt-2 h-20 rounded object-cover" />
                                )}
                            </div>

                            {/* Altri campi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <select
                                        value={postForm.id_category}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, id_category: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    >
                                        <option value="">Nessuna categoria</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Data Pubblicazione</label>
                                    <input
                                        type="date"
                                        value={postForm.data_pubblicazione}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, data_pubblicazione: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                    />
                                </div>
                            </div>

                            {/* SEO */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Meta Titolo (SEO)</label>
                                <input
                                    type="text"
                                    value={postForm.meta_titolo}
                                    onChange={(e) => setPostForm(prev => ({ ...prev, meta_titolo: e.target.value }))}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Meta Descrizione (SEO)</label>
                                <textarea
                                    value={postForm.meta_descrizione}
                                    onChange={(e) => setPostForm(prev => ({ ...prev, meta_descrizione: e.target.value }))}
                                    className="w-full border p-2 rounded"
                                    rows="2"
                                />
                            </div>

                            {/* Checkbox */}
                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={postForm.pubblicato}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, pubblicato: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    Pubblicato
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={postForm.in_evidenza}
                                        onChange={(e) => setPostForm(prev => ({ ...prev, in_evidenza: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    In evidenza
                                </label>
                            </div>

                            {/* Pulsanti */}
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Salvataggio...' : 'Salva Articolo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetPostForm}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                                >
                                    Annulla
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Lista Articoli */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Articoli Esistenti</h3>

                        {loading ? (
                            <div>Caricamento...</div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <div key={post.id} className="border rounded p-4 flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{post.titolo}</h4>
                                            <p className="text-gray-600 text-sm mb-2">{post.descrizione_breve}</p>
                                            <div className="flex space-x-4 text-sm text-gray-500">
                                                <span>Categoria: {post.categoria_nome || 'Nessuna'}</span>
                                                <span>Data: {new Date(post.data_pubblicazione).toLocaleDateString()}</span>
                                                <span>Visite: {post.visualizzazioni}</span>
                                                {post.pdf_url && <span className="text-blue-600 font-semibold">PDF</span>}
                                                {!post.pubblicato && <span className="text-orange-600">Bozza</span>}
                                                {post.in_evidenza && <span className="text-green-600 font-semibold">In evidenza</span>}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingPost(post)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                            >
                                                Elimina
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {posts.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">Nessun articolo trovato</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Categorie */}
            {activeTab === 'categories' && (
                <div className="space-y-6">
                    {/* Form Categoria */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}
                        </h3>

                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome Categoria *</label>
                                    <input
                                        type="text"
                                        value={categoryForm.nome}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, nome: e.target.value }))}
                                        className="w-full border p-2 rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Colore</label>
                                    <input
                                        type="color"
                                        value={categoryForm.colore}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, colore: e.target.value }))}
                                        className="w-full h-10 border rounded"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Descrizione</label>
                                <textarea
                                    value={categoryForm.descrizione}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, descrizione: e.target.value }))}
                                    className="w-full border p-2 rounded"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ordine</label>
                                <input
                                    type="number"
                                    value={categoryForm.ordine}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, ordine: parseInt(e.target.value) || 0 }))}
                                    className="w-full border p-2 rounded"
                                    min="0"
                                />
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {loading ? 'Salvataggio...' : 'Salva Categoria'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetCategoryForm}
                                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                                >
                                    Annulla
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Lista Categorie */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Categorie Esistenti</h3>

                        <div className="space-y-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="border rounded p-4 flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: cat.colore }}
                                        />
                                        <div>
                                            <h4 className="font-semibold">{cat.nome}</h4>
                                            <p className="text-sm text-gray-600">{cat.descrizione}</p>
                                            <p className="text-xs text-gray-500">Ordine: {cat.ordine}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingCategory(cat)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            Modifica
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-gray-500 text-center py-8">Nessuna categoria trovata</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                dittaId={dittaId}
            />
        </div>
    );
};

export default BlogManager;