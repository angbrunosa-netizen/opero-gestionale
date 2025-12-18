# Sistema Blog Multi-Tenant - Documentazione Completa

## 📋 Panoramica

Sistema blog completo e integrato per gestire articoli, categorie e news in ambiente multi-tenant.

## 🏗️ Architettura

### Frontend (Next.js)
```
opero-shop/components/blocks/BlogListBlock.js     # Componente principale blog
opero-shop/components/BlockRegistry.js             # Registro componenti CMS
```

### Backend (Node.js/Express)
```
opero/routes/public.js                             # API pubbliche blog
opero/routes/admin_blog.js                         # API amministrazione blog
opero/migrations/20251218_create_web_blog_tables_safe.js  # Migration database
```

### Database
```
web_blog_categories                                # Categorie blog
web_blog_posts                                    # Articoli blog
```

## 🚀 Quick Start

### 1. Setup Database
```bash
# Esegui migration sicura
node scripts/safe-migrate-blog.js

# Oppure con Knex
npx knex migrate:latest
```

### 2. Verifica Installazione
```bash
# Verifica tabelle
node scripts/safe-migrate-blog.js --verify

# Test API
curl "http://localhost:3001/api/public/shop/mia-azienda/blog/posts"
```

### 3. Configura Componente Frontend
Il BlogListBlock è già registrato in BlockRegistry con codice `BLOG_LIST`.

## 📝 API Endpoints

### Pubbliche (Frontend)

#### Lista Articoli
```
GET /api/public/shop/:slug/blog/posts?limit=10&category=slug-categoria
```

#### Dettaglio Articolo
```
GET /api/public/shop/:slug/blog/post/:postSlug
```

#### Lista Categorie
```
GET /api/public/shop/:slug/blog/categories
```

### Admin (Backend)

#### Gestione Categorie
```
GET    /api/admin/blog/categories/:idDitta        # Lista categorie
POST   /api/admin/blog/categories                  # Nuova categoria
PUT    /api/admin/blog/categories/:id              # Aggiorna categoria
DELETE /api/admin/blog/categories/:id              # Elimina categoria
```

#### Gestione Articoli
```
GET    /api/admin/blog/posts/:idDitta?limit=10&category=1&published=true
POST   /api/admin/blog/posts                        # Nuovo articolo
PUT    /api/admin/blog/posts/:id                    # Aggiorna articolo
DELETE /api/admin/blog/posts/:id                    # Elimina articolo
```

## 🎨 Componenti Frontend

### BlogListBlock Props
```javascript
{
  titolo: 'Ultime News',           // Titolo sezione
  limite: 3,                     // Numero articoli
  mostraData: true,               // Mostra data pubblicazione
  mostraCategoria: true,          // Mostra categoria
  mostraAutore: false,            // Mostra autore
  layout: 'grid',                // 'grid' o 'list'
  mostRecentOnly: false,          // Mostra solo articolo più recente
  categoriaSlug: 'news'          // Filtra per categoria
}
```

### Esempio Utilizzo
```javascript
// Configurazione CMS per BlogListBlock
{
  "tipo_componente": "BLOG_LIST",
  "dati_config": {
    "titolo": "Le Ultime Notizie",
    "limite": 6,
    "mostraData": true,
    "mostraCategoria": true,
    "layout": "grid",
    "categoriaSlug": "aziendali"
  }
}
```

## 🗄️ Schema Database

### web_blog_categories
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INT | Primary Key |
| id_ditta | INT | Foreign Key ditte |
| nome | VARCHAR(255) | Nome categoria |
| slug | VARCHAR(255) | Slug URL |
| colore | VARCHAR(7) | Colore esadecimale |
| descrizione | TEXT | Descrizione categoria |
| ordine | INT | Ordinamento |
| attivo | BOOLEAN | Stato attivo |
| timestamps | - | Created/Updated |

### web_blog_posts
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INT | Primary Key |
| id_ditta | INT | Foreign Key ditte |
| id_category | INT | Foreign Key categoria |
| titolo | VARCHAR(255) | Titolo articolo |
| slug | VARCHAR(255) | Slug URL |
| descrizione_breve | TEXT | Descrizione breve |
| contenuto | LONGTEXT | Contenuto completo |
| autore | VARCHAR(255) | Autore articolo |
| copertina_url | VARCHAR(500) | URL immagine copertina |
| pdf_url | VARCHAR(500) | URL PDF allegato |
| pubblicato | BOOLEAN | Stato pubblicazione |
| in_evidenza | BOOLEAN | Articolo in evidenza |
| data_pubblicazione | DATETIME | Data pubblicazione |
| visualizzazioni | INT | Conteggio visite |
| meta_* | VARIE | Campi SEO |

## 🔧 Configurazione

### Variabili Environment
```bash
# Database
DB_HOST=localhost
DB_NAME=operodb
DB_USER=root
DB_PASSWORD=

# File Upload (S3)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=nome-bucket
```

## 🧪 Testing

### Test API Manuale
```bash
# Test articoli
curl "http://localhost:3001/api/public/shop/mia-azienda/blog/posts?limit=3"

# Test categorie
curl "http://localhost:3001/api/public/shop/mia-azienda/blog/categories"

# Test singolo articolo (dopo averne creato uno)
curl "http://localhost:3001/api/public/shop/mia-azienda/blog/post/primo-articolo"
```

### Test Frontend
1. Configura una pagina CMS con un blocco `BLOG_LIST`
2. Accedi alla pagina del sottodominio
3. Verifica che gli articoli vengano visualizzati

## 📊 Performance

### Ottimizzazioni Implementate
- **Lazy Loading**: Componenti caricati dinamicamente
- **Indici Database**: Indici ottimizzati per query comuni
- **Caching**: Headers cache per API pubbliche
- **Immagini**: Gestione errori caricamento immagini

### Monitoring
```javascript
// Monitoring visualizzazioni (automatico)
await dbPool.query(
  'UPDATE web_blog_posts SET visualizzazioni = visualizzazioni + 1 WHERE id = ?',
  [postId]
);
```

## 🔒 Sicurezza

### Protezioni Implementate
- **SQL Injection**: Uso di prepared statements con Knex
- **XSS**: Sanitizzazione input backend
- **CSRF**: Protezione su API admin
- **CORS**: Configurazione accessi consentiti

### Permessi
- **API Pubbliche**: Accesso libero solo articoli pubblicati
- **API Admin**: Richiedono autenticazione token JWT
- **Multi-tenant**: Isolamento dati per ditta

## 🚨 Troubleshooting

### Errori Comuni

#### "Table doesn't exist"
```bash
# Esegui migration
node scripts/safe-migrate-blog.js

# Verifica
node scripts/safe-migrate-blog.js --verify
```

#### "Cannot read properties of undefined (reading 'query')"
```javascript
// Verifica import nel file admin_blog.js
const { dbPool } = require('../config/db');
// Usa dbPool invece di req.dbPool
```

#### "No posts found"
```sql
-- Verifica dati
SELECT COUNT(*) FROM web_blog_posts WHERE pubblicato = 1;
-- Inserisci dati di test se necessario
```

## 📚 Riferimenti

- [Documentazione Migration](./BLOG_MIGRATION_GUIDE.md)
- [Documentazione Sviluppo](./DOCUMENTAZIONE_SVILUPPATORE.md)
- [API Admin](./routes/admin_blog.js)
- [API Public](./routes/public.js)

---

## 📧 Supporto

Per problemi o domande:
1. Controlla i log dell'applicazione
2. Verifica la documentazione troubleshooting
3. Contatta il team di sviluppo con dettagli completi