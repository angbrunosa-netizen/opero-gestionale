# Guida Migration Sistema Blog Multi-Tenant

## 📋 Panoramica

Questa guida spiega come eseguire la migration sicura per le tabelle del sistema blog in qualsiasi ambiente (sviluppo, test, produzione).

## 📁 File Creati

1. **Migration:** `migrations/20251218_create_web_blog_tables_safe.js`
2. **Script Utility:** `scripts/safe-migrate-blog.js`
3. **Documentazione:** `BLOG_MIGRATION_GUIDE.md` (questo file)

## 🗄️ Tabelle Create

### `web_blog_categories`
- Gestione categorie blog per tenant
- Supporto colori personalizzati
- Ordinamento personalizzato
- Soft delete (campo `attivo`)

### `web_blog_posts`
- Articoli blog multi-tenant
- Supporto categorizzazione
- Gestione PDF allegati
- SEO fields completi
- Statistiche visualizzazioni

## 🚀 Metodi di Esecuzione

### Metodo 1: Script Sicuro (Raccomandato)

```bash
# Esegui migration
node scripts/safe-migrate-blog.js

# Con opzioni specifiche
node scripts/safe-migrate-blog.js --verify  # Solo verifica
node scripts/safe-migrate-blog.js --rollback  # Rollback completo
node scripts/safe-migrate-blog.js --force    # Forza esecuzione anche se già eseguita
```

### Metodo 2: Knex Standard

```bash
# Esegui migration
npx knex migrate:latest

# Verifica stato
npx knex migrate:status

# Rollback ultima migration
npx knex migrate:rollback
```

## 🛡️ Funzionalità di Sicurezza

### Controllo Esistenza Tabelle
La migration controlla se le tabelle esistono già prima di crearle:

```javascript
const categoriesExists = await knex.schema.hasTable('web_blog_categories');
if (!categoriesExists) {
    // Crea tabella solo se non esiste
}
```

### Foreign Keys Sicure
Le foreign key includono controlli per evitare errori:

```javascript
table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
```

### Rollback Automatico
In caso di errore, la migration tenta un rollback automatico delle modifiche.

### Dati di Default
Inserisce automaticamente una categoria "Senza Categoria" se la tabella è vuota.

## 📊 Comandi Utili

### Verifica Stato Post-Migration
```bash
node scripts/safe-migrate-blog.js --verify
```

Output atteso:
```
✅ Verifica superata
📊 Statistiche:
   - Tabelle: 2/2 esistenti
   - Indici: Categories (X), Posts (X)
   - Record: Categories (X), Posts (X)
```

### Test Connessione Database
```bash
node -e "const { knex } = require('./config/db'); knex.raw('SELECT 1').then(() => console.log('✅ DB OK')).catch(console.error)"
```

### Elenco Tabelle Blog
```sql
SHOW TABLES LIKE '%web_blog%';
DESCRIBE web_blog_categories;
DESCRIBE web_blog_posts;
```

## 🔧 Configurazione Ambienti

### Sviluppo
```bash
export NODE_ENV=development
# Usa database locale
node scripts/safe-migrate-blog.js
```

### Test
```bash
export NODE_ENV=test
# Usa database di test
node scripts/safe-migrate-blog.js --verify
```

### Produzione
```bash
export NODE_ENV=production
# Backup database PRIMA dell'esecuzione
mysqldump -u username -p database_name > backup_before_blog.sql

# Esegui migration
node scripts/safe-migrate-blog.js

# Verifica
node scripts/safe-migrate-blog.js --verify
```

## ⚠️ Precauzioni Produzione

### Backup Obbligatorio
```bash
# Backup completo database
mysqldump --single-transaction --routines --triggers -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Test su Staging
Esegui sempre la migration su ambiente di staging/test prima della produzione.

### Monitoraggio
Controlla i log dell'applicazione dopo la migration per errori imprevisti.

## 🔍 Troubleshooting

### Errore "Table already exists"
La migration dovrebbe gestirlo automaticamente, ma se occorre:
```bash
node scripts/safe-migrate-blog.js --force
```

### Errore "Foreign key constraint"
Verifica che la tabella `ditte` esista e contenga dati:
```sql
SELECT COUNT(*) FROM ditte WHERE shop_attivo = 1;
```

### Errore "Permission denied"
Verifica i permessi dell'utente database:
```sql
SHOW GRANTS FOR CURRENT_USER();
```

### Rollback Completo
Se tutto va male:
```bash
# Drop manuale tabelle (USA CON CAUTELA)
DROP TABLE IF EXISTS web_blog_posts;
DROP TABLE IF EXISTS web_blog_categories;

# Rimuovi record migration
DELETE FROM knex_migrations WHERE migration_name LIKE '%blog%';
```

## 📝 Checklist Pre-Migration

- [ ] Backup database eseguito (produzione)
- [ ] Connessione database testata
- [ ] Ambiente (NODE_ENV) configurato
- [ ] Permessi utente verificati
- [ ] Test su staging completato (produzione)
- [ ] Piano di rollback definito

## 📞 Supporto

In caso di problemi:
1. Controlla i log dello script
2. Verifica la connessione database
3. Esegui il rollback se necessario
4. Contatta lo sviluppo con log dettagliati

---

**Nota:** Questa migration è progettata per essere idempotente e sicura. Tuttavia, si raccomanda sempre di fare un backup in produzione.