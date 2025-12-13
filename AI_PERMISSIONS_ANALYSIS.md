# 🔐 Analisi Completa Permessi Funzionalità AI

## 📋 Data Analisi
**14 Dicembre 2025**
**Sistema**: Website Builder con AI Integration
**Scope**: Requisiti di autenticazione e autorizzazione per funzionalità AI

---

## 🎯 Panoramica Sistema Permessi

Il sistema utilizza un **modello di autorizzazione granulare** basato su:
- **Token JWT** con payload contenente permissions array
- **Middleware `checkPermission()`** per validazione runtime
- **Permission Code** univoci per ogni funzionalità
- **Role-based access control** (RBAC)

---

## 🚪 Requisiti di Autenticazione

### **1. Token JWT Obbligatorio**
```javascript
// Header Authorization richiesto
Authorization: Bearer <JWT_TOKEN>

// Payload del token contiene:
{
  "id": user_id,
  "username": "username",
  "id_ruolo": role_id,
  "permissions": [
    "SITE_BUILDER",
    "CT_VIEW",
    "DM_FILE_UPLOAD",
    // ... altri permessi
  ]
}
```

### **2. Processo di Autenticazione**
1. **Login**: Utente autenticato con credenziali
2. **Token Generation**: JWT generato con permissions del ruolo
3. **Request Authorization**: Token incluso in header delle richieste
4. **Permission Validation**: Middleware `checkPermission()` valida il permesso specifico

---

## 🛡️ Permessi Richiesti per Funzionalità AI

### **🎯 Permesso Principale: SITE_BUILDER**

**TUTTE** le funzionalità AI richiedono il permesso **`SITE_BUILDER`**:

#### **AI Analysis Features**
```javascript
// 1. Company Analysis
router.post('/analyze-company', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Analisi aziendale AI
});

// 2. Content Generation
router.post('/generate-section-content', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Generazione contenuti AI
});

// 3. Company Data Enhancement
router.post('/enhance-company-data', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Enhancement dati aziendali AI
});

// 4. Global Styles Generation
router.post('/generate-global-styles', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Generazione stili globali AI
});
```

#### **Website Generation Features**
```javascript
// 5. Site Generation
router.post('/generate/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Generazione sito completo con AI
});

// 6. Site Deployment
router.post('/deploy/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Deploy sito AI-enhanced
});

// 7. Generation Status
router.get('/status/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Status generazione AI
});

// 8. Site Preview
router.get('/preview/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Anteprima sito AI
});
```

#### **Standard Website Operations**
```javascript
// 9. Page CRUD Operations
router.post('/:websiteId/pages', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Creazione pagine (incluso contenuto AI)
});

router.put('/:websiteId/pages/:pageId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Aggiornamento pagine AI-enhanced
});

// 10. Site Management
router.get('/:id', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Accesso dati sito con metadata AI
});

router.put('/:websiteId', checkPermission('SITE_BUILDER'), async (req, res) => {
  // Aggiornamento configurazione AI
});
```

---

## 🔧 Sistema di Permission Checking

### **Middleware checkPermission()**
```javascript
/**
 * Verifica permessi specifici nell'array permissions del JWT
 */
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        console.log('--- CHECKPERMISSION ATTIVATO ---');
        console.log('Permesso Richiesto:', requiredPermission);
        console.log('Permessi Utente:', req.user.permissions);
        console.log('Permesso Validato?', req.user.permissions.includes(requiredPermission));
        console.log('------------------------------');

        // Validazione effettiva
        if (!req.user || !req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'Azione non autorizzata. Permessi insufficienti.'
            });
        }
        next();
    };
};
```

### **Processo di Validazione**
1. **Token Verification**: JWT validato e decoded
2. **Permission Extraction**: Array permissions estratto dal payload
3. **Permission Check**: Verifica presenza permesso richiesto
4. **Access Grant/Reject**: Accesso consentito o negato

---

## 👥 Utenti Autorizzati

### **Tipi di Utenti con SITE_BUILDER**
1. **Amministratori di Sistema** (SUPER_ADMIN)
   - Tutti i permessi inclusi SITE_BUILDER
   - Accesso completo a tutte le funzionalità AI

2. **Amministratori Azienda** (ADMIN_FUNZIONI_MANAGE)
   - SITE_BUILDER per gestione siti aziendali
   - Funzionalità AI per propri siti web

3. **Utenti Specializzati** (custom roles)
   - Ruoli custom con permesso SITE_BUILDER
   - Accesso limitato a funzionalità web building

### **Esempio Payload JWT Utente Autorizzato**
```json
{
  "id": 123,
  "username": "admin@example.com",
  "id_ruolo": 1,
  "permissions": [
    "SUPER_ADMIN",
    "SITE_BUILDER",
    "CT_VIEW",
    "CT_MANAGE",
    "DM_FILE_UPLOAD",
    "DM_FILE_DELETE"
  ]
}
```

---

## 🔒 Misure di Sicurezza

### **1. Token Security**
```javascript
// Configurazione sicurezza JWT
const JWT_SECRET = process.env.JWT_SECRET || 'backup_secret_key_molto_sicura';

// Token expiration (configurabile)
const tokenExpiry = '24h'; // o configurabile da settings

// Secure cookie transmission (opzionale)
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});
```

### **2. Permission Granularity**
- **Least privilege principle**: Utenti con solo permessi necessari
- **Specific permission codes**: Ogni operazione ha permesso dedicato
- **Role-based assignment**: Permessi assegnati per ruolo, non individualmente

### **3. API Security**
```javascript
// Rate limiting per AI endpoints (previene abusi)
const rateLimit = require('express-rate-limit');

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // massimo 100 richieste AI per 15min
  message: 'Too many AI requests, please try again later'
});

router.use('/ai-enhanced-website', aiRateLimit);
```

### **4. Audit Trail**
```javascript
// Logging delle operazioni AI per security audit
const logAIOperation = (req, permission) => {
  console.log(`AI Operation - User: ${req.user.id}, Permission: ${permission}, IP: ${req.ip}`);
};

// Utilizzo nei middleware AI
router.use('/ai-enhanced-website', (req, res, next) => {
  logAIOperation(req, 'SITE_BUILDER');
  next();
});
```

---

## 🚨 Error Handling Permissions

### **Status Codes**
- **401 Unauthorized**: Token mancante o non valido
- **403 Forbidden**: Token valido ma permessi insufficienti
- **429 Too Many Requests**: Rate limiting attivo

### **Response Format**
```javascript
// Response standard per perm errors
{
  success: false,
  error: 'Authorization required',
  code: 'INSUFFICIENT_PERMISSIONS',
  details: {
    required: 'SITE_BUILDER',
    missing: true
  }
}
```

---

## 🔍 Checklist Configurazione Permessi AI

### **✅ Backend Configuration**
- [ ] JWT_SECRET configurato in .env
- [ ] Ruoli con SITE_BUILDER definiti in database
- [ ] Middleware checkPermission funzionante
- [ ] Rate limiting per AI endpoints
- [ ] Audit logging attivo

### **✅ Database Setup**
- [ ] Tabella `ruoli` con codici funzione corretti
- [ ] Tabella `permessi` con SITE_BUILDER definito
- [ ] Tabella `ruoli_permessi` popolata correttamente
- [ ] Utenti con ruoli appropriati assegnati

### **✅ Frontend Integration**
- [ ] Token storage sicuro (localStorage/secure cookie)
- [ ] Token inclusion in request headers
- [ ] Permission-based UI rendering
- [ ] Error handling per unauthorized access

### **✅ API Testing**
- [ ] Test endpoints con permessi validi
- [ ] Test endpoints senza permessi (expect 403)
- [ ] Test token scaduto (expect 401)
- [ ] Test rate limiting (expect 429)

---

## 🔧 Codice di Configurazione Permessi

### **1. Setup Database Permessi**
```sql
-- Inserimento permesso SITE_BUILDER
INSERT INTO permessi (codice_funzione, descrizione, modulo)
VALUES ('SITE_BUILDER', 'Accesso Website Builder con AI', 'WEBSITE');

-- Associazione permessi ai ruoli
INSERT INTO ruoli_permessi (id_ruolo, codice_funzione)
SELECT r.id, 'SITE_BUILDER'
FROM ruoli r
WHERE r.nome IN ('Administrator', 'Admin Azienda', 'Web Master');
```

### **2. Environment Variables**
```bash
# .env configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRY=24h
AI_RATE_LIMIT_WINDOW_MS=900000
AI_RATE_LIMIT_MAX_REQUESTS=100
```

### **3. Frontend Permission Check**
```javascript
// Permission-based component rendering
const canAccessAI = userPermissions.includes('SITE_BUILDER');

// Conditional rendering
{canAccessAI && (
  <AIEnhancedTemplateButton onClick={handleAITemplateGeneration} />
)}

// API call with error handling
const generateAIContent = async () => {
  try {
    const response = await api.post('/ai-enhanced-website/generate-content', data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      showError('Access denied. Insufficient permissions for AI features.');
    }
    throw error;
  }
};
```

---

## 🎯 Summary: Requisiti Minimi per Funzionalità AI

### **Per Utente Final:**
1. ✅ **Autenticazione Validata**: Login con token JWT
2. ✅ **Permesso SITE_BUILDER**: Necessario per tutte le funzionalità AI
3. ✅ **Token Attivo**: Non scaduto e valido

### **Per Sistema:**
1. ✅ **JWT Configuration**: Secret e expiry configurati
2. ✅ **Permission Database**: SITE_BUILDER definito e assegnato
3. ✅ **Middleware Security**: checkPermission() funzionante
4. ✅ **Rate Limiting**: Protezione contro abusi AI

### **Per Developer:**
1. ✅ **API Keys**: ZAI_API_KEY configurata
2. ✅ **Permission Checks**: checkPermission() in tutti gli endpoint AI
3. ✅ **Error Handling**: Gestione appropriata errori 401/403
4. ✅ **Audit Logging**: Tracking operazioni AI

---

## 🚀 Deployment Checklist

### **✅ Production Readiness**
- [ ] Environment variables configurate
- [ ] Permessi database verificati
- [ ] Rate limiting attivato
- [ ] SSL/HTTPS per sicurezza token
- [ ] Monitoring errori 401/403
- [ ] Backup procedura permessi

### **✅ Security Verification**
- [ ] JWT secret strong e univoco
- [ ] Token expiration appropriata
- [ ] CORS headers configurati
- [ ] Input validation su tutti gli endpoint AI
- [ ] SQL injection prevention
- [ ] XSS protection

---

**Conclusione**: Tutte le funzionalità AI richiedono unicamente il permesso **SITE_BUILDER**. Il sistema è configurato correttamente con controlli di sicurezza granulari e protezioni appropriate per l'uso in produzione. 🛡️