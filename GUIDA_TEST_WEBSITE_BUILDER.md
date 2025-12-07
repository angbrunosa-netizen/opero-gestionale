# 🚀 GUIDA TEST WEBSITE BUILDER

## 📋 PREREQUISITI

1. **Backend attivo**: `npm start` nella cartella principale
2. **Frontend attivo**: `cd opero-frontend && npm start`
3. **Database con migration eseguite**: `npx knex migrate:latest`
4. **Ditte con `id_tipo_ditta = 1`** nel database

## 🎯 FLUSSO DI TEST COMPLETO

### 1. Creazione Sito Web

1. **Accedi al modulo Website Builder** nel frontend
2. **Clicca "Crea Nuovo Sito"**
3. **Seleziona azienda**:
   - L'API filtra solo ditte con `id_tipo_ditta = 1`
   - Verifica che l'azienda non abbia già un sito
   - Controlla dati visualizzati (ragione sociale, P.IVA, contatti)

4. **Configura sito**:
   - Subdomain (es: `nomeditta`)
   - Titolo sito
   - Template (Professional/Modern/Classic/Creative)
   - Anteprima URL: `https://nomeditta.operocloud.it`

5. **Conferma creazione**:
   - Verifica inserimento in tabella `siti_web_aziendali`
   - Controlla `domain_status = 'pending'`
   - Verifica log in `website_activity_log`

### 2. Gestione Sito Esistente

1. **Torna alla lista siti** e verifica il sito creato
2. **Clicca sull'icona matita** per modificare
3. **Dovresti vedere le tabs**:
   - ✅ **Impostazioni Base** - Configurazione generale
   - ✅ **Pagine Sito** - Gestione contenuti
   - ✅ **SEO & Contenuti** - Meta tags
   - ✅ **Media & Brand** - Logo, favicon
   - ✅ **Social & Analytics** - Social, GA
   - ✅ **Catalogo** - Vetrina prodotti
   - ✅ **Avanzate** - Impostazioni tecniche

### 3. Gestione Pagine

1. **Clicca tab "Pagine Sito"**
2. **Dovresti vedere**:
   - Info sito con URL completo
   - Pulsante "Anteprima Sito"
   - Elenco pagine (inizialmente vuoto)
   - Contatore pagine totali/pubblicate

3. **Crea nuova pagina**:
   - Clicca "Nuova Pagina"
   - Compila titolo (es: "Chi Siamo")
   - Slug generato automaticamente
   - Spunta "Pubblica immediatamente"
   - Imposta ordine menu
   - Salva

4. **Verifica backend**:
   - INSERT in `pagine_sito_web`
   - Controlla `is_published = true`
   - Verifica `id_sito_web` corretto

5. **Gestisci pagine esistenti**:
   - Toggle pubblicazione (👁️)
   - Modifica contenuto (✏️)
   - Elimina pagina (🗑️)

### 4. Salvataggio Impostazioni

1. **Tab "Impostazioni Base"**:
   - Modifica titolo sito
   - Cambia template
   - Aggiorna stato dominio
   - Salva

2. **Verifica API call**:
   - PUT `/api/website/:id`
   - Body con `section: 'basic'`
   - Aggiornamento tabella `siti_web_aziendali`

## 🔍 DEBUG E TROUBLESHOOTING

### Errori Comuni

1. **"Unknown column 'cp.stato'"**: ✅ RISOLTO
   - Rimossa referenza colonna inesistente

2. **"Ditta eleggibile non trovata"**:
   - Verifica `id_tipo_ditta = 1` in tabella `ditte`
   - Controlla che non esista già sito in `siti_web_aziendali`

3. **"Subdomain già in uso"**:
   - Verifica unicità in `siti_web_aziendali.subdomain`

4. **API non respondono**:
   - Controlla log backend per errori DB
   - Verifica connessione database

### Verifiche Database

```sql
-- Verifica ditte eleggibili
SELECT id, ragione_sociale, id_tipo_ditta FROM ditte WHERE id_tipo_ditta = 1;

-- Verifica siti creati
SELECT sw.*, d.ragione_sociale
FROM siti_web_aziendali sw
JOIN ditte d ON sw.id_ditta = d.id;

-- Verifica pagine create
SELECT p.*, sw.site_title, sw.subdomain
FROM pagine_sito_web p
JOIN siti_web_aziendali sw ON p.id_sito_web = sw.id;

-- Verifica activity log
SELECT * FROM website_activity_log ORDER BY created_at DESC LIMIT 10;
```

### API Endpoints Test

```bash
# Elenco siti
curl http://localhost:3001/api/website/list

# Ditte eleggibili
curl http://localhost:3001/api/website/eligible-companies

# Pagine sito (sostituire SITE_ID)
curl http://localhost:3001/api/website/SITE_ID/pages

# Creazione sito (POST)
curl -X POST http://localhost:3001/api/website/create \
  -H "Content-Type: application/json" \
  -d '{"ditta_id": 1, "subdomain": "test", "site_title": "Test Site"}'
```

## 📋 CHECKLIST FUNZIONALITÀ

### ✅ Completate

- [x] Selezione ditte eleggibili (id_tipo_ditta = 1)
- [x] Creazione sito con configurazione base
- [x] Inserimento in database `siti_web_aziendali`
- [x] Lista siti con stato e azioni
- [x] Modifica sito con tabs multiple
- [x] Gestione pagine (CRUD)
- [x] Toggle pubblicazione pagine
- [x] Salvataggio configurazione sito

### 🔄 In Sviluppo

- [ ] Page builder drag & drop per contenuti
- [ ] Upload immagini/logo tramite S3
- [ ] Preview live del sito
- [ ] Sistema pubblicazione automatica
- [ ] Template personalizzabili
- [ ] Integrazione catalogo prodotti

### 🚨 Da Implementare

- [ ] Eliminazione sito (cascade delete pagine)
- [ ] Export/backup siti
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] SEO audit tools

## 🎯 PROSSIMI PASSI

1. **Test completo flusso** seguendo questa guida
2. **Segnalare bug** o problemi riscontrati
3. **Sviluppare Page Builder** per editing contenuti
4. **Integrare upload immagini** con S3
5. **Implementare preview live** dei siti

## 📞 SUPPORTO

Per problemi durante il test:

1. Controlla console browser (errori JavaScript)
2. Verifica log backend (errori API)
3. Controlla stato tabelle database
4. Verifica configurazione `.env`

**Happy Testing! 🚀**