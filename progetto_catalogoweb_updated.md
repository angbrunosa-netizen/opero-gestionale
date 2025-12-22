# **📄 Progetto Tecnico: Modulo "Vetrina Catalogo Dinamica" (Next.js + Opero API)**

Stato: **Draft Aggiornato v2.0**
Data: 22 Dicembre 2025
Autore: Opero Assistant
Destinatari: Team Backend, Team Frontend

---

## **🆕 Novità v2.0**

### **Aggiornamenti Critici:**
1. ✅ Integrazione completa con sistema **S3** e **CDN** (`https://cdn.operocloud.it`)
2. � Gestione immagini attraverso sistema esistente **dm_files** + **dm_allegati_link**
3. ✅ Integrazione come **Tab** in **SiteBuilderModule** (non modulo separato)
4. ✅ Privacy immagini: automatico utilizzo URL public per immagini catalogo

---

## **1\\. Obiettivo e Scope**

Sviluppare un componente "Tab" nel CMS Opero (SiteBuilderModule) che permetta di:
- Configurare una **Vetrina Catalogo Dinamica** sul sito web
- Pubblicare prodotti con **prezzi e disponibilità real-time**
- Gestire immagini prodotto tramite **S3 pubblico**
- Calcolare prezzi based on **listini multipli** con logiche complesse del gestionale

**Sicurezza Dati:**
- ❌ MAI esporre: prezzi di acquisto, costi, nomi fornitori
- ✅ Esporre SOLO: prezzi vendita pubblici, giacenza, descrizioni commerciali

---

## **2\\. Architettura Dati Integrata**

### **2.1 Schema Database (Esistente + Integrazioni)**

#### **Tabelle Core Catalogo:**
```
ct_catalogo         → Anagrafica articolo master
ct_categorie        → Gerarchia categorie
ct_listini          → 12 prezzi per articolo (6 Pubblico + 6 Cessione)
mg_giacenze         → Somma esistenze per articolo
ct_ean              → Codici EAN per ricerca
ct_codici_fornitore → Codici fornitori per ricerca
```

#### **Tabelle Sistema File (DMS) - INTEGRAZIONE S3:**
```
dm_files            → Metadati file fisici + chiave S3 (s3_key)
dm_allegati_link    → Collegamento file ↔ entità (polimorfico)
  - entita_tipo: 'ct_catalogo'
  - entita_id: ID articolo
  - id_file: → dm_files.id
```

### **2.2 Flusso Immagini S3**

1. **Upload Immagine:**
   - Admin uploada immagine prodotto
   - Sistema salva su **S3** con chiave: `ditta_{id}/catalogo/{uuid}.{ext}`
   - Record in **dm_files**: `s3_key`, `mime_type`, `privacy='public'`
   - Record in **dm_allegati_link**: `entita_tipo='ct_catalogo'`, `entita_id={id_articolo}`

2. **Recupero Immagine:**
   - API query: `dm_allegati_link` JOIN `dm_files` WHERE `entita_tipo='ct_catalogo'` AND `entita_id={id_articolo}`
   - Se `privacy='public'`: URL CDN → `https://cdn.operocloud.it/{bucket}/{s3_key}`
   - Se `privacy='private'`: Signed URL S3 (scade 5min) - *non usato per catalogo pubblico*

3. **Frontend Display:**
   - Componente usa direttamente `previewUrl` (CDN pubblico)
   - Cache automatico tramite CDN Cloudflare

---

## **3\\. Fase 1: Backend Core - Catalogo Service**

**File Target:** `routes/public.js` (estensione) o `services/catalogoPublicService.js` (nuovo)

### **3.1 Query Principale con JOIN Immagini**

```javascript
const getPublicCatalog = async (dittaId, options) => {
    const {
        listino_tipo = 'pubblico',  // 'pubblico' | 'cessione'
        listino_index = 1,           // 1-6
        categoria_id = null,
        search_term = null,
        mostra_esauriti = true,
        page = 1,
        limit = 20
    } = options;

    // Colonna prezzo dinamica
    const priceColumn = `prezzo_${listino_tipo}_${listino_index}`;

    const query = knex('ct_catalogo as c')
        // JOIN Listino (prezzo valido per data)
        .join('ct_listini as l', function() {
            this.on('c.id', '=', 'l.id_articolo')
                .andOn('l.id_ditta', '=', knex.raw('?', [dittaId]))
                .andOn(knex.raw('NOW() BETWEEN l.validita_dal AND l.validita_al'));
        })
        // LEFT JOIN Giacenze
        .leftJoin('mg_giacenze as g', 'c.id', 'g.id_articolo')
        // LEFT JOIN Immagini (S3 Integration)
        .leftJoin('dm_allegati_link as al', function() {
            this.on('c.id', '=', 'al.entita_id')
                .andOn('al.entita_tipo', '=', knex.raw('?', ['ct_catalogo']))
                .andOn('al.id_ditta', '=', knex.raw('?', [dittaId]));
        })
        .leftJoin('dm_files as f', 'al.id_file', 'f.id')
        // SELECT con aggregazione immagini
        .select([
            'c.id',
            'c.codice',
            'c.descrizione',
            'c.descrizione_estesa',
            'c.id_categoria',
            knex.raw(`l.${priceColumn} as prezzo_finale`),
            knex.raw('COALESCE(SUM(g.esistenza), 0) as giacenza_totale'),
            // Aggregazione immagini come array JSON
            knex.raw(`
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', f.id,
                            'previewUrl',
                                CASE
                                    WHEN f.privacy = 'public'
                                    THEN CONCAT('${CDN_BASE_URL}/${S3_BUCKET_NAME}/', f.s3_key)
                                    ELSE NULL
                                END,
                            'file_name_originale', f.file_name_originale
                        )
                    )
                    FROM dm_allegati_link al2
                    JOIN dm_files f ON al2.id_file = f.id
                    WHERE al2.entita_tipo = 'ct_catalogo'
                    AND al2.entita_id = c.id
                    AND al2.id_ditta = ?
                    AND f.mime_type LIKE 'image/%'
                ) as immagini
            `, [dittaId])
        ])
        .where('c.id_ditta', dittaId)
        .modify(qb => {
            // Filtro categoria
            if (categoria_id) {
                qb.where('c.id_categoria', categoria_id);
            }
            // Filtro ricerca avanzata
            if (search_term) {
                const search = `%${search_term}%`;
                qb.where(function() {
                    this.where('c.codice', 'like', search)
                        .orWhere('c.descrizione', 'like', search)
                        // OR con EAN
                        .orWhereIn('c.id', function() {
                            this.select('id_articolo')
                                .from('ct_ean')
                                .where('codice', 'like', search);
                        })
                        // OR con codici fornitore
                        .orWhereIn('c.id', function() {
                            this.select('id_articolo')
                                .from('ct_codici_fornitore')
                                .where('codice', 'like', search);
                        });
                });
            }
            // Filtro esauriti
            if (!mostra_esauriti) {
                qb.having('giacenza_totale', '>', 0);
            }
        })
        .groupBy('c.id')
        .limit(limit)
        .offset((page - 1) * limit);

    const results = await query;

    // Post-processing per assicurarsi che immagini sia un array
    return results.map(item => ({
        ...item,
        immagini: item.immagini || [],
        disponibile: item.giacenza_totale > 0,
        prezzo: parseFloat(item.prezzo_finale) || 0
    }));
};
```

---

## **4\\. Fase 2: API Pubblica**

**File:** `routes/public.js`

### **Endpoint: POST /api/public/shop/:siteSlug/catalog**

```javascript
/**
 * GET /api/public/shop/:siteSlug/catalog
 * Query params:
 *   - categoria_id: number
 *   - search_term: string
 *   - listino_tipo: 'pubblico' | 'cessione'
 *   - listino_index: 1-6
 *   - page: number
 *   - limit: number
 *   - mostra_esauriti: boolean
 */
router.get('/shop/:siteSlug/catalog', async (req, res) => {
    try {
        const { siteSlug } = req.params;
        const {
            categoria_id,
            search_term,
            listino_tipo = 'pubblico',
            listino_index = 1,
            page = 1,
            limit = 20,
            mostra_esauriti = true
        } = req.query;

        // Recupera ID ditta da slug
        const [ditta] = await dbPool.query(
            'SELECT id FROM ditte WHERE url_slug = ?',
            [siteSlug]
        );

        if (!ditta.length) {
            return res.status(404).json({ error: 'Sito non trovato' });
        }

        const dittaId = ditta[0].id;

        // Recupera configurazione listino dal sito (se salvata)
        const [config] = await dbPool.query(
            'SELECT catalog_listino_tipo, catalog_listino_index FROM siti_web WHERE id_ditta = ?',
            [dittaId]
        );

        // Usa config salvata o fallback
        const listinoTipo = config[0]?.catalog_listino_tipo || listino_tipo;
        const listinoIndex = config[0]?.catalog_listino_index || listino_index;

        // Fetch prodotti
        const prodotti = await catalogoPublicService.getPublicCatalog(dittaId, {
            listino_tipo: listinoTipo,
            listino_index: listinoIndex,
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            search_term,
            page: parseInt(page),
            limit: parseInt(limit),
            mostra_esauriti: mostra_esauriti === 'true'
        });

        // Fetch categorie per filtri
        const [categorie] = await dbPool.query(
            `SELECT id, nome, parent_id
             FROM ct_categorie
             WHERE id_ditta = ?
             ORDER BY nome ASC`,
            [dittaId]
        );

        res.json({
            success: true,
            data: prodotti,
            meta: {
                total: prodotti.length,
                page: parseInt(page),
                limit: parseInt(limit),
                listino: { tipo: listinoTipo, index: listinoIndex }
            },
            filters: {
                categorie: categorie
            }
        });

    } catch (error) {
        console.error('Errore catalogo pubblico:', error);
        res.status(500).json({ error: 'Errore recupero catalogo' });
    }
});
```

---

## **5\\. Fase 3: CMS Integration - SiteBuilderModule Tab**

**File:** `src/components/SiteBuilderModule.js`

### **5.1 Aggiungi Nuova Tab**

```javascript
import CatalogManager from './cms/CatalogManager'; // Nuovo componente
import { ShoppingBagIcon } from '@heroicons/react/24/outline'; // Icona catalogo

// Nel componente, aggiungi nuovo stato tab
const tabs = [
    { id: 'config', label: 'Configurazione Base', icon: GlobeAltIcon },
    { id: 'pages', label: 'Pagine & Contenuti', icon: DocumentDuplicateIcon },
    { id: 'page-seo', label: 'Configurazione SEO', icon: Cog6ToothIcon },
    { id: 'blog', label: 'Blog', icon: NewspaperIcon },
    { id: 'catalog', label: 'Vetrina Catalogo', icon: ShoppingBagIcon }, // NUOVO
];
```

### **5.2 Rendering Condizionale**

```javascript
// In area contenuto
{activeTab === 'catalog' && (
    <CatalogManager
        dittaId={targetDitta.id}
        key={`catalog-${targetDitta.id}`}
    />
)}
```

---

## **6\\. Fase 4: CatalogManager Component**

**File Target:** `src/components/cms/CatalogManager.js`

```javascript
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    ShoppingBagIcon,
    Cog6ToothIcon,
    PhotoIcon,
    TagIcon
} from '@heroicons/react/24/outline';

const CatalogManager = ({ dittaId }) => {
    const [activeTab, setActiveTab] = useState('products');
    const [config, setConfig] = useState({
        listino_tipo: 'pubblico',
        listino_index: 1,
        mostra_esauriti: false,
        mostra_ricerca: true,
        mostra_filtri: true
    });
    const [categorie, setCategorie] = useState([]);

    // Fetch categorie e config
    useEffect(() => {
        fetchCategorie();
        fetchConfig();
    }, [dittaId]);

    const fetchCategorie = async () => {
        try {
            const res = await api.get(`/catalogo/categories/${dittaId}`);
            setCategorie(res.data);
        } catch (error) {
            console.error('Errore categorie:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await api.get(`/catalogo/config/${dittaId}`);
            setConfig(res.data || config);
        } catch (error) {
            console.error('Errore config:', error);
        }
    };

    const saveConfig = async () => {
        try {
            await api.put(`/catalogo/config/${dittaId}`, config);
            alert('Configurazione salvata!');
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore salvataggio configurazione');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vetrina Catalogo</h2>
                    <p className="text-gray-600">Configura la visualizzazione prodotti sul sito web</p>
                </div>
                <button
                    onClick={saveConfig}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Salva Configurazione
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {[
                        { id: 'products', label: 'Prodotti', icon: ShoppingBagIcon },
                        { id: 'config', label: 'Configurazione', icon: Cog6ToothIcon },
                        { id: 'images', label: 'Immagini', icon: PhotoIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenuto Tabs */}
            {activeTab === 'products' && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Gestione Prodotti</h3>
                    <ProductsList dittaId={dittaId} />
                </div>
            )}

            {activeTab === 'config' && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Configurazione Listino</h3>

                    {/* Tipo Listino */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo Listino
                        </label>
                        <select
                            value={config.listino_tipo}
                            onChange={(e) => setConfig({...config, listino_tipo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="pubblico">Listino Pubblico</option>
                            <option value="cessione">Listino Cessione</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Seleziona quale tipo di listino utilizzare per i prezzi visualizzati sul sito
                        </p>
                    </div>

                    {/* Numero Listino */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numero Listino (1-6)
                        </label>
                        <select
                            value={config.listino_index}
                            onChange={(e) => setConfig({...config, listino_index: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n}>Listino {n}</option>
                            ))}
                        </select>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3">
                        {[
                            { key: 'mostra_esauriti', label: 'Mostra prodotti esauriti' },
                            { key: 'mostra_ricerca', label: 'Mostra barra di ricerca' },
                            { key: 'mostra_filtri', label: 'Mostra filtri laterali categorie' }
                        ].map(option => (
                            <label key={option.key} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {option.label}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={config[option.key]}
                                    onChange={(e) => setConfig({...config, [option.key]: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'images' && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">
                        Gestione Immagini Prodotti
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Le immagini vengono gestite attraverso il sistema archivio.
                        Carica un'immagine e verrà automaticamente collegata al prodotto.
                    </p>
                    <ImageUploader dittaId={dittaId} entitaTipo="ct_catalogo" />
                </div>
            )}
        </div>
    );
};

export default CatalogManager;
```

---

## **7\\. Tabella di Marcia Aggiornata**

### **Backend (Node.js/Express/Knex):**
- [x] Analizzare sistema esistente S3 + dm_files + dm_allegati_link
- [ ] Creare service `catalogoPublicService.js` con query JOIN immagini
- [ ] Implementare endpoint `GET /api/public/shop/:siteSlug/catalog`
- [ ] Testare query con immagini CDN (verify URL pubblici)
- [ ] Aggiungere indici performance su `dm_allegati_link(entita_tipo, entita_id)`

### **Frontend CMS (React):**
- [ ] Creare componente `CatalogManager.js` (tab in SiteBuilderModule)
- [ ] Creare configurazione listino (tipo + index + toggle visualizzazioni)
- [ ] Integrazione con `ImageUploader` esistente per upload immagini prodotto
- [ ] Salvataggio configurazione in tabella `siti_web`

### **Frontend Public (Next.js):**
- [ ] Creare `components/blocks/CatalogBlock.js` (visualizzatore pubblico)
- [ ] Implementare fetch con SWR da API pubblica
- [ ] Grid prodotti con immagini CDN
- [ ] Filtri: categorie, ricerca testo, range prezzo
- [ ] Product card con: immagine, titolo, codice, prezzo, disponibilità

---

## **8\\. Prossimi Passi**

Dimmi quale vuoi implementare per primo:

1. **Backend completo** (service + API) → Per avere dati pronti
2. **CatalogManager Tab** (CMS UI) → Per configrazione listino
3. **CatalogBlock.js** (Frontend public) → Per visualizzazione prodotti

---

## **🔒 Considerazioni Sicurezza**

- ✅ Privacy immagini: **SOLO `privacy='public'`** esposti via CDN
- ❌ Prezzi acquisto/costi: **MAI** inclusi in query pubblica
- ✅ Query pubblica: **Nessuna JOIN** con tabelle fornitori/costi
- ✅ Rate limiting: Implementare su endpoint catalogo pubblico

---

## **📊 Performance Note**

- CDN caching automatico per immagini (`Cache-Control` header S3)
- Query ottimizzata con indici: `dm_allegati_link(entita_tipo, entita_id)`
- Paginazione obbligatoria (max 50 prodotti per pagina)
- Implementare cache Redis per risultati frequenti (opzionale)

---

**Versione**: v2.0 - Updated for S3 + DMS Integration + SiteBuilderModule Tab
