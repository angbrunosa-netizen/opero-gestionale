# 🧪 Backend Catalogo Pubblico - Guida al Testing

**Data**: 22 Dicembre 2025
**Versione Backend**: 1.0.0
**Stato**: ✅ COMPLETATO

---

## 📦 Componenti Creati

### 1. Service Layer
**File**: [`services/catalogoPublicService.js`](services/catalogoPublicService.js)

Funzioni implementate:
- ✅ `getPublicCatalog(dittaId, options)` - Query prodotti con prezzi, giacenza, immagini
- ✅ `getImmaginiProdotto(dittaId, prodottoId)` - Recupera immagini S3 per prodotto
- ✅ `getCategorie(dittaId)` - Recupera categorie gerarchiche
- ✅ `getConfigListino(dittaId)` - Recupera config listino da tabella ditte
- ✅ `saveConfigListino(dittaId, config)` - Salva config listino
- ✅ `countProdotti(dittaId, options)` - Conta totale per paginazione

### 2. API Pubbliche
**File**: [`routes/public.js`](routes/public.js)

Endpoint creati:
- ✅ `GET /api/public/shop/:siteSlug/catalog` - Catalogo prodotti
- ✅ `GET /api/public/shop/:siteSlug/catalog/categories` - Categorie filtri
- ✅ `GET /api/public/shop/:siteSlug/catalog/:prodottoId` - Dettaglio prodotto

### 3. API Admin (CMS)
**File**: [`routes/admin_cms.js`](routes/admin_cms.js)

Endpoint creati:
- ✅ `GET /api/admin/cms/:idDitta/catalog/config` - Recupera config
- ✅ `PUT /api/admin/cms/:idDitta/catalog/config` - Salva config
- ✅ `GET /api/admin/cms/:idDitta/catalog/categories` - Categorie
- ✅ `GET /api/admin/cms/:idDitta/catalog/products` - Prodotti admin

### 4. Database
**Migration**: [`20251222_add_catalog_config_to_ditte.js`](migrations/20251222_add_catalog_config_to_ditte.js)

Colonne aggiunte alla tabella `ditte`:
- ✅ `catalog_listino_tipo` ENUM('pubblico', 'cessione')
- ✅ `catalog_listino_index` INT (1-6)
- ✅ `catalog_mostra_esauriti` BOOLEAN
- ✅ `catalog_mostra_ricerca` BOOLEAN
- ✅ `catalog_mostra_filtri` BOOLEAN

---

## 🧪 Testing con Postman/Thunder Client

### Prerequisiti
1. Server backend avviato: `npm start` (porta 3001 default)
2. Database con dati di test in:
   - `ct_catalogo` - Prodotti
   - `ct_listini` - Prezzi
   - `mg_giacenze` - Giacenze
   - `ct_categorie` - Categorie
   - `dm_files` + `dm_allegati_link` - Immagini S3

### Test 1: Catalogo Pubblico

**Endpoint**: `GET http://localhost:3001/api/public/shop/{siteSlug}/catalog`

**Query Params** (opzionali):
```
categoria_id=15
search_term=trapano
prezzo_min=0
prezzo_max=500
page=1
limit=20
sort_by=descrizione
sort_order=ASC
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "codice": "TRAP-001",
      "descrizione": "Trapano a percussione 800W",
      "descrizione_estesa": "Trapano professionale...",
      "id_categoria": 15,
      "categoria_nome": "Utensili Elettrici",
      "prezzo": 125.50,
      "valuta": "EUR",
      "giacenza": 25,
      "disponibile": true,
      "stato_giacenza": "disponibile",
      "immagini": [
        {
          "id": 456,
          "file_name_originale": "trapano-001.jpg",
          "mime_type": "image/jpeg",
          "previewUrl": "https://cdn.operocloud.it/opero-storage/ditta_1/catalogo/uuid.jpg"
        }
      ]
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "listino": {
      "tipo": "pubblico",
      "index": 1
    }
  }
}
```

### Test 2: Categorie

**Endpoint**: `GET http://localhost:3001/api/public/shop/{siteSlug}/catalog/categories`

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Elettroutensili",
      "parent_id": null,
      "children": [
        {
          "id": 15,
          "nome": "Trapani",
          "parent_id": 1,
          "children": []
        }
      ]
    }
  ]
}
```

### Test 3: Dettaglio Prodotto

**Endpoint**: `GET http://localhost:3001/api/public/shop/{siteSlug}/catalog/123`

**Expected Response**: Singolo prodotto con tutte le immagini

### Test 4: Configurazione Admin (GET)

**Endpoint**: `GET http://localhost:3001/api/admin/cms/1/catalog/config`

**Headers**:
```
Authorization: Bearer {token}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "catalog_listino_tipo": "pubblico",
    "catalog_listino_index": 1,
    "catalog_mostra_esauriti": true,
    "catalog_mostra_ricerca": true,
    "catalog_mostra_filtri": true
  }
}
```

### Test 5: Salvataggio Configurazione Admin (PUT)

**Endpoint**: `PUT http://localhost:3001/api/admin/cms/1/catalog/config`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "listino_tipo": "cessione",
  "listino_index": 2,
  "mostra_esauriti": false,
  "mostra_ricerca": true,
  "mostra_filtri": true
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Configurazione catalogo aggiornata con successo"
}
```

### Test 6: Prodotti Admin

**Endpoint**: `GET http://localhost:3001/api/admin/cms/1/catalog/products?page=1&limit=50`

**Headers**:
```
Authorization: Bearer {token}
```

---

## 🔍 Debug & Troubleshooting

### Errore: "Sito non trovato"
- **Causa**: `url_slug` non trovato in tabella `ditte`
- **Fix**: Verifica slug e `id_tipo_ditta = 1`

### Errore: "Shop non attivo"
- **Causa**: `shop_attivo = 0` in tabella `ditte`
- **Fix**: `UPDATE ditte SET shop_attivo = 1 WHERE id = ?`

### Immagini Vuote
- **Causa**: Nessun record in `dm_allegati_link` con `entita_tipo='ct_catalogo'`
- **Fix**: Carica immagini tramite modulo archivio

### Prezzo 0 o NULL
- **Causa**: Nessun listino valido per la data corrente
- **Fix**: Verifica `ct_listini` abbia record con `validita_dal <= NOW() <= validita_al`

---

## 📊 Query SQL Utilizzate

La query principale esegue:

```sql
SELECT
    c.id, c.codice, c.descrizione,
    COALESCE(l.prezzo_pubblico_1, 0) as prezzo_finale,
    COALESCE(SUM(g.esistenza), 0) as giacenza_totale
FROM ct_catalogo c
JOIN ct_listini l ON c.id = l.id_articolo
    AND l.id_ditta = ?
    AND NOW() BETWEEN l.validita_dal AND l.validita_al
LEFT JOIN mg_giacenze g ON c.id = g.id_articolo
LEFT JOIN ct_categorie cat ON c.id_categoria = cat.id
WHERE c.id_ditta = ?
GROUP BY c.id
```

Immagini recuperate con subquery separata:

```sql
SELECT previewUrl FROM dm_allegati_link al
JOIN dm_files f ON al.id_file = f.id
WHERE al.entita_tipo = 'ct_catalogo'
  AND al.entita_id = ?
  AND f.mime_type LIKE 'image/%'
  AND f.privacy = 'public'
```

---

## ✅ Checklist Pre-Production

- [ ] Migration eseguita con successo
- [ ] Service caricato senza errori
- [ ] API pubbliche rispondono correttamente
- [ ] API admin funzionano con autenticazione
- [ ] Query performance accettabile (< 1s per 20 prodotti)
- [ ] Immagini S3 CDN funzionanti
- [ ] Test con dati reali (non di test)

---

**Prossimi Passi**: Implementazione Frontend (CatalogManager + CatalogBlock)
