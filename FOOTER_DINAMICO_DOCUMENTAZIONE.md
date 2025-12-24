# Footer Dinamico - Implementazione

## Data: 24/12/2025
## Autore: Claude Code
## Descrizione: Reso il footer dinamico con i contatti dalla tabella `ditte`

---

## 1. Backend - API Pubbliche

**File**: `routes/public.js`

### Endpoint 1: `/api/public/shop/:slug/config` (Linee 480-550)
Usato per il caricamento iniziale della configurazione sito.

### Endpoint 2: `/api/public/shop/:slug/page/:pageSlug?` (Linee 179-277)
**MODIFICATO** - Usato per caricare ogni pagina del sito (home, chi-siamo, etc.)

#### Modifiche apportate ad ENTRAMBI gli endpoint:

#### 1.1 Query Database (Linee 484-493)
Aggiunti campi contatti alla SELECT:

```javascript
const [ditte] = await dbPool.query(
    `SELECT id, ragione_sociale, url_slug, shop_colore_primario, shop_colore_secondario,
            shop_colore_sfondo_blocchi, shop_colore_header_sfondo, shop_colore_header_testo,
            shop_logo_posizione, shop_attivo, shop_banner_url, shop_descrizione_home,
            id_web_template, shop_template,
            tel1, mail_1, indirizzo, cap, citta, provincia, pec, logo_url  // ← NUOVI CAMPI
     FROM ditte
     WHERE url_slug = ? AND shop_attivo = 1`,
    [slug]
);
```

#### 1.2 Oggetto siteConfig (Linee 502-530)
Aggiunto oggetto `contact` con i dati della ditta:

```javascript
const siteConfig = {
    id: ditta.id,
    nome: ditta.ragione_sociale || slug,
    slug: ditta.url_slug,
    colors: { /* ... */ },
    banner_url: ditta.shop_banner_url,
    descrizione_home: ditta.shop_descrizione_home,
    template_code: ditta.shop_template || 'default',
    id_web_template: ditta.id_web_template,
    // Contatti dinamici per footer
    contact: {
        tel1: ditta.tel1 || null,
        mail1: ditta.mail_1 || null,
        pec: ditta.pec || null,
        indirizzo: ditta.indirizzo || null,
        cap: ditta.cap || null,
        citta: ditta.citta || null,
        provincia: ditta.provincia || null,
        logoUrl: ditta.logo_url || null
    }
};
```

---

## 2. Frontend - Template Layout

### 2.1 Template Fashion
**File**: `opero-shop/components/templates/Fashion/Layout.js`

#### Modifiche:
- **Linea 11**: Aggiunto `contact` al destructuring di `siteConfig`
- **Linee 196-239**: Footer completamente dinamico

```jsx
{/* Contatti dinamici dalla tabella ditte */}
{(contact?.tel1 || contact?.mail1) && (
    <div className="flex justify-center space-x-8 mb-8 text-sm text-gray-600">
        {contact.tel1 && (
            <a href={`tel:${contact.tel1}`} className="hover:text-black transition-colors">
                📞 {contact.tel1}
            </a>
        )}
        {contact.mail1 && (
            <a href={`mailto:${contact.mail1}`} className="hover:text-black transition-colors">
                ✉️ {contact.mail1}
            </a>
        )}
    </div>
)}

{/* Indirizzo dinamico */}
{contact?.indirizzo && (
    <div className="mb-8 text-sm text-gray-600">
        <p>
            {contact.indirizzo}
            {contact.cap && `, ${contact.cap}`}
            {contact.citta && (` ${contact.citta}`)}
            {contact.provincia && ` (${contact.provincia})`}
        </p>
    </div>
)}
```

### 2.2 Template Standard
**File**: `opero-shop/components/templates/Standard/Layout.js`

#### Modifiche:
- **Linea 11**: Aggiunto `contact` al destructuring di `siteConfig`
- **Linee 496-565**: Footer completamente dinamico

```jsx
<div>
  <h4 className="font-bold text-lg mb-6 text-gray-200">Contatti</h4>
  <ul className="space-y-3 text-sm text-gray-400">
    {contact?.mail1 && (
      <li className="flex items-center gap-2">
        <span className="opacity-70">Email:</span>
        <a href={`mailto:${contact.mail1}`} className="hover:text-white transition-colors">
          {contact.mail1}
        </a>
      </li>
    )}
    {contact?.tel1 && (
      <li className="flex items-center gap-2">
        <span className="opacity-70">Tel:</span>
        <a href={`tel:${contact.tel1}`} className="hover:text-white transition-colors">
          {contact.tel1}
        </a>
      </li>
    )}
    {contact?.pec && (
      <li className="flex items-center gap-2">
        <span className="opacity-70">PEC:</span>
        <a href={`mailto:${contact.pec}`} className="hover:text-white transition-colors">
          {contact.pec}
        </a>
      </li>
    )}
  </ul>
</div>

{/* Indirizzo dinamico */}
{contact?.indirizzo && (
    <div className="mb-8 text-sm text-gray-400 text-center">
        <p>
            📍 {contact.indirizzo}
            {contact.cap && `, ${contact.cap}`}
            {contact.citta && ` ${contact.citta}`}
            {contact.provincia && ` (${contact.provincia})`}
        </p>
    </div>
)}
```

### 2.3 Template Industrial
**File**: `opero-shop/components/templates/Industrial/Layout.js`

#### Modifiche:
- **Linea 11**: Aggiunto `contact` al destructuring di `siteConfig`
- **Linee 176-231**: Footer completamente dinamico

```jsx
<div>
    <h4 className="text-white font-bold uppercase mb-4">Azienda</h4>
    <p>{name} - Soluzioni industriali.</p>

    {/* Indirizzo dinamico */}
    {contact?.indirizzo && (
        <p className="mt-2">
            📍 {contact.indirizzo}
            {contact.cap && `, ${contact.cap}`}
            {contact.citta && ` ${contact.citta}`}
            {contact.provincia && ` (${contact.provincia})`}
        </p>
    )}
</div>

<div>
    <h4 className="text-white font-bold uppercase mb-4">Contatti</h4>
    <div className="space-y-2">
        {contact?.mail1 && (
            <p className="font-mono bg-slate-800 p-2 inline-block rounded">
                <a href={`mailto:${contact.mail1}`} className="hover:text-[var(--primary-color)]">
                    ✉️ {contact.mail1}
                </a>
            </p>
        )}
        {contact?.tel1 && (
            <p className="font-mono bg-slate-800 p-2 inline-block rounded">
                <a href={`tel:${contact.tel1}`} className="hover:text-[var(--primary-color)]">
                    📞 {contact.tel1}
                </a>
            </p>
        )}
        {contact?.pec && (
            <p className="font-mono bg-slate-800 p-2 inline-block rounded text-xs">
                <a href={`mailto:${contact.pec}`} className="hover:text-[var(--primary-color)]">
                    📧 PEC: {contact.pec}
                </a>
            </p>
        )}
    </div>
</div>
```

---

## 3. Struttura Dati - Tabella `ditte`

I campi sono già presenti nel database:

```sql
CREATE TABLE `ditte` (
  `id` int(10) UNSIGNED NOT NULL,
  `ragione_sociale` varchar(255) NOT NULL,
  `tel1` varchar(30) DEFAULT NULL,       -- ← Telefono principale
  `mail_1` varchar(255) DEFAULT NULL,    -- ← Email principale
  `mail_2` varchar(255) DEFAULT NULL,    -- ← Email secondaria
  `pec` varchar(255) DEFAULT NULL,       -- ← Posta Elettronica Certificata
  `indirizzo` varchar(255) DEFAULT NULL, -- ← Indirizzo
  `cap` varchar(10) DEFAULT NULL,        -- ← CAP
  `citta` varchar(100) DEFAULT NULL,     -- ← Città
  `provincia` varchar(50) DEFAULT NULL,  -- ← Provincia
  `logo_url` varchar(255) DEFAULT NULL,  -- ← URL logo
  -- ... altri campi ...
);
```

**Nessuna migration richiesta** - i campi esistono già!

---

## 4. Funzionalità Implementate

### ✅ Contatti Visualizzati
- **Telefono**: Link cliccabile `tel:`
- **Email**: Link cliccabile `mailto:`
- **PEC**: Link cliccabile `mailto:`
- **Indirizzo**: Formattato con CAP, città e provincia

### ✅ Comportamento Condizionale
I contatti vengono visualizzati SOLO se esistono:
- `contact?.tel1` - mostra solo se presente
- `contact?.mail1` - mostra solo se presente
- `contact?.pec` - mostra solo se presente
- `contact?.indirizzo` - mostra solo se presente

### ✅ Design Responsive
Ogni template ha il proprio stile:
- **Fashion**: Minimalista, centrato, con emoji
- **Standard**: Grid 3 colonne, sfondo colorato
- **Industrial**: Monospace, tech style, icone emoji

---

## 5. API Response Example

**Request**: `GET /api/public/shop/mia-azienda/config`

**Response**:
```json
{
  "success": true,
  "siteConfig": {
    "id": 1,
    "nome": "Mia Azienda SRL",
    "slug": "mia-azienda",
    "colors": {
      "primary": "#06215b",
      "secondary": "#1e40af",
      "blockBackground": "#ffffff",
      "headerBackground": "#ffffff",
      "headerText": "#333333",
      "logoPosition": "left"
    },
    "banner_url": null,
    "descrizione_home": null,
    "template_code": "standard",
    "id_web_template": null,
    "navigation": [
      { "slug": "home", "titolo_seo": "Home" },
      { "slug": "chi-siamo", "titolo_seo": "Chi Siamo" }
    ],
    "logo": null,
    "contact": {
      "tel1": "+39 012 3456789",
      "mail1": "info@miaazienda.it",
      "pec": "posta@pec.it",
      "indirizzo": "Via Roma 123",
      "cap": "20100",
      "citta": "Milano",
      "provincia": "MI",
      "logoUrl": "https://example.com/logo.png"
    }
  }
}
```

---

## 6. Test

### Test 1: Verifica API
```bash
curl http://localhost:5000/api/public/shop/mia-azienda/config
```

Expected: Response con `siteConfig.contact` popolato

### Test 2: Visualizzazione Footer
1. Accedi a `http://mia-azienda.localhost:3000`
2. Scorri fino al footer
3. Verifica che:
   - [ ] Telefono è visualizzato e cliccabile
   - [ ] Email è visualizzata e cliccabile
   - [ ] PEC è visualizzata (se presente)
   - [ ] Indirizzo completo è visualizzato

### Test 3: Aggiornamento Dati
1. Modifica i dati nella tabella `ditte` (es. tel1, mail_1)
2. Ricarica la pagina
3. Verifica che il footer mostri i nuovi dati

---

## 7. Vantaggi

### ✅ Prima (Hardcoded)
- Contatti statici in ogni template
- Modifiche richiedono更改 codice
- Duplicazione in 3 file
- Impossibile aggiornare dal CMS

### ✅ Dopo (Dinamico)
- Contatti presi dal database
- Modifiche immediate aggiornando ditte
- Single source of truth
- Possibilità futura di modifica dal CMS

---

## 8. Possibili Miglioramenti Futuri

1. **CMS Integration**: Aggiungere interfaccia nel CMS per modificare contatti senza database
2. **Social Links**: Aggiungere social media (Facebook, Instagram, LinkedIn)
3. **Orari Apertura**: Campo aggiuntivo nella tabella `ditte`
4. **Multi-language**: Supporto contatti in più lingue
5. **Format Validation**: Validazione automatica numeri telefono (formato italiano)

---

## 9. Note Importanti

1. **Null Safety**: Tutti i campi usano optional chaining (`contact?.tel1`)
2. **Fallback**: Se `siteConfig` non esiste, fallback a oggetto vuoto
3. **Link attivi**: Tutti i contatti sono link cliccabili (mailto, tel)
4. **Responsive**: Footer responsive su tutti i template
5. **Performance**: Nessuna query aggiuntiva (dati già in siteConfig)

---

## File Modificati

1. ✅ `routes/public.js` - API pubblica
2. ✅ `opero-shop/components/templates/Fashion/Layout.js`
3. ✅ `opero-shop/components/templates/Standard/Layout.js`
4. ✅ `opero-shop/components/templates/Industrial/Layout.js`

## File di Riferimento

- Database: `dbopero/ditte.sql`
- API Pubblica: `routes/public.js`
- Template Fashion: `opero-shop/components/templates/Fashion/Layout.js`
- Template Standard: `opero-shop/components/templates/Standard/Layout.js`
- Template Industrial: `opero-shop/components/templates/Industrial/Layout.js`
