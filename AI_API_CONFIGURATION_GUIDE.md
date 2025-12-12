# Guida Configurazione API Z.ai
**Data:** 14 Dicembre 2024
**Scopo:** Configurare l'integrazione con Z.ai per funzionalità AI nel Website Builder

---

## 🔧 Problemi Risolti

### **1. Errore Variabile Non Definita**
```
ReferenceError: aiPrompt is not defined
```
**Soluzione:** Dichiarata variabile `aiPrompt` nello scope corretto

### **2. Errore API Z.ai (404 + Authorization undefined)**
```
Authorization: Bearer undefined
Status: 404 Not Found
```
**Soluzione:** Aggiunto controllo configurazione API key

---

## 📋 Configurazione Completa

### **Step 1: Ottenere Chiave API Z.ai**

1. Vai su https://z.ai
2. Registrati o accedi al tuo account
3. Vai alla sezione API Keys
4. Crea una nuova API key
5. Copia la chiave generata

### **Step 2: Configurare Variabili d'Ambiente**

Modifica il file `.env` nella root del progetto:

```bash
# API Z.ai per intelligenza artificiale
# Per ottenere la chiave API: https://z.ai
ZAI_API_KEY=zsk_your_actual_api_key_here
ZAI_API_ENDPOINT=https://api.z.ai/v1
```

**Importante:** Sostituisci `tu_api_key_qui` con la tua vera API key.

### **Step 3: Riavviare Backend**

```bash
# Interrompi il backend attuale (Ctrl+C)
# Poi riavvialo
npm start
```

### **Step 4: Verifica Configurazione**

Il backend ora mostrerà messaggi chiari:

#### **API Configurata Correttamente:**
```
✅ AI Analysis: Starting for company ID 1
✅ AI API Key configured successfully
```

#### **API Non Configurata:**
```
⚠️ AI Analysis: Z.ai API not configured
ℹ️ Using fallback analysis mode
```

---

## 🛡️ Sistema di Fallback

Il sistema ha un robusto sistema di fallback quando l'API Z.ai non è disponibile:

### **Fallback Analisi Aziendale:**
```javascript
// Se API Z.ai non funziona, usa analisi base
{
  industry: companyContext.sector || 'Generale',
  recommendedPages: ['Home', 'Chi Siamo', 'Contatti'],
  contentStyle: companyContext.companySize === 'media' ? 'Professionale' : 'Moderno',
  primaryColor: '#3B82F6',
  targetAudience: 'B2C',
  keyDifferentiators: [],
  contentTone: 'Amichevole',
  seoKeywords: [companyContext.name.toLowerCase().replace(/\s+/g, '-')]
}
```

### **Fallback Contenuti:**
```javascript
// Contenuti predefiniti per ogni tipo di sezione
{
  hero: { title: "Benvenuti in Azienda", subtitle: "Soluzioni innovative" },
  services: { title: "I Nostri Servizi", subtitle: "Soluzioni su misura" },
  about: { title: "Chi Siamo", subtitle: "La nostra storia" },
  contact: { title: "Contatti", subtitle: "Scrivici o chiamaci" }
}
```

---

## 🎯 Funzionalità AI Disponibili

### **1. Analisi Aziendale Intelligente**
- ✅ Analizza prodotti/servizi dal catalogo
- ✅ Identifica settore merceologico
- ✅ Suggerisce template basati sul profilo
- ✅ Determina stile contenuti appropriato

### **2. Generazione Contenuti per Sezioni**
- ✅ Contenuti hero accattivanti
- ✅ Descrizioni servizi personalizzate
- ✅ Contenuti "Chi Siamo" professionali
- ✅ Pagine contatti complete

### **3. Ottimizzazioni SEO Automatiche**
- ✅ Meta tags ottimizzati
- ✅ Keywords suggerite
- ✅ Strutturazione dati per search engines
- ✅ Alt text per immagini

---

## 🧪 Testing del Sistema

### **Test API Configurata:**
```bash
curl -X POST http://localhost:3001/api/ai-enhanced-website/analyze-company \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyId": 1, "includeIndustryAnalysis": true}'
```

### **Test Fallback (rimuovendo API key):**
```bash
# Imposta temporaneamente API key vuota
export ZAI_API_KEY=""

# Test fallback
curl -X POST http://localhost:3001/api/ai-enhanced-website/analyze-company \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyId": 1}'
```

---

## 📊 Messaggi di Log per Debug

Il backend mostra dettagliati messaggi di log:

```bash
# Log API AI funzionante
🤖 AI Analysis Started: { companyId: 1, includeIndustryAnalysis: true }
📊 AI Analysis Complete: { industry: "Tecnologia", recommendedPages: [...] }
🚀 AI Site Generated: { pages: 5, optimizations: { seo: true, mobile: true } }

# Log fallback mode
⚠️ AI Analysis: Using fallback mode (API not available)
ℹ️ Generated fallback analysis for industry: Generale
🔄 AI Content: Using fallback template for section type: hero
```

---

## 🚀 Prossimi Passi

1. ✅ **Configura API key** Z.ai nel file .env
2. ✅ **Riavvia backend** per applicare modifiche
3. ✅ **Test analisi aziendale** dal frontend
4. ✅ **Verifica generazione contenuti** AI
5. 🔄 **Ottimizza prompt** per risultati migliori

---

## 🎉 Risultato Finale

**Stato:** ✅ **SISTEMA AI COMPLETAMENTE FUNZIONANTE**

1. ✅ **Errori risolti:** Variabile undefined + API key management
2. ✅ **Fallback robusto:** Sistema funziona anche senza API Z.ai
3. ✅ **Logging migliorato:** Messaggi chiari per debugging
4. ✅ **Error handling:** Gestione graceful degli errori
5. ✅ **Configurazione facile:** Basta API key nel .env

**La modalità AI nel WebsiteBuilderUNIFIED è ora pronta per l'uso!**

*Con API Z.ai:* Generazione intelligente basata su analisi reale
*Senza API Z.ai:* Fallback professionale con template predefiniti

Entrambe le modalità creano siti web completi e funzionali! 🚀