# **📄 Progetto Tecnico: Modulo "Vetrina Catalogo Dinamica" (Next.js \+ Opero API)**

Stato: Draft  
Data: 22 Dicembre 2025  
Autore: Opero Assistant  
Destinatari: Team Backend, Team Frontend

## **1\. Obiettivo e Scope**

Sviluppare un componente "Blocco" per il CMS Opero (Next.js) che permetta di pubblicare una selezione dinamica di prodotti. Il sistema deve calcolare prezzi e disponibilità in tempo reale basandosi sulle complesse logiche interne del gestionale (listini multipli, sconti, giacenze), garantendo al contempo che dati sensibili (prezzi di acquisto, fornitori) non vengano mai esposti al client pubblico.

## **2\. Architettura dei Dati**

### **2.1 Mappa ERD (Logica Relazionale)**

La query principale dovrà unire le seguenti entità:

* **ct\_catalogo (MASTER):** Anagrafica articolo base.  
* **ct\_categorie:** Per filtri e gerarchia.  
* **ct\_listini (PREZZI):** Contiene 12 prezzi per articolo (6 Pubblico, 6 Cessione) validi per range di date.  
* **mg\_giacenze (STOCK):** Somma delle esistenze per articolo.  
* **ct\_ean (RICERCA):** Codici a barre per ricerca avanzata.  
* **ct\_codici\_fornitore (RICERCA):** Codici articolo fornitori per ricerca avanzata.  
* **va\_matrice\_sconti (OPZIONALE):** Regole di sconto (da applicare solo se richiesto specificamente).

### **2.2 Flusso dei Dati**

1. **CMS Config:** L'admin configura il blocco scegliendo *quale* listino usare (es. "Listino Pubblico 1").  
2. **Next.js Server Component:** Legge la configurazione e chiama l'API Backend.  
3. **Express API:**  
   * Riceve i parametri di filtro e la configurazione prezzi.  
   * Esegue la query SQL complessa.  
   * Pulisce il risultato (rimuove costi e dati sensibili).  
4. **Next.js Client:** Renderizza la griglia prodotti.

## **3\. Fase 1: Backend Core \- Query Engine (Node.js/Knex)**

**File Target:** src/services/catalogoPublicService.js (Nuovo file consigliato) o estensione di routes/public.js.

### **Specifica Tecnica della Query**

La query deve gestire dinamicamente la colonna del prezzo.

// Esempio logico di costruzione query (Pseudocodice Knex)  
const getPublicCatalog \= async (dittaId, options) \=\> {  
    // options.priceType \= 'pubblico' | 'cessione'  
    // options.priceIndex \= 1..6  
    const priceColumn \= \`prezzo\_${options.priceType}\_${options.priceIndex}\`; // es: prezzo\_pubblico\_1

    const query \= knex('ct\_catalogo as c')  
        .join('ct\_listini as l', function() {  
            this.on('c.id', '=', 'l.id\_articolo')  
                .andOn('l.id\_ditta', '=', knex.raw('?', \[dittaId\]))  
                .andOn(knex.raw('NOW() BETWEEN l.validita\_dal AND l.validita\_al'));  
        })  
        .leftJoin('mg\_giacenze as g', 'c.id', 'g.id\_articolo')  
        .select(\[  
            'c.id',  
            'c.codice',  
            'c.descrizione',  
            'c.descrizione\_estesa', // o descrizione\_web se esiste  
            'c.immagini',  
            'c.id\_categoria',  
            \`l.${priceColumn} as prezzo\_finale\`, // Alias dinamico fondamentale  
            knex.raw('COALESCE(SUM(g.esistenza), 0\) as giacenza\_totale')  
        \])  
        .where('c.id\_ditta', dittaId)  
        .groupBy('c.id');

    // ... Aggiunta filtri ricerca testuale (EAN, Codici fornitore) ...  
    // ... Aggiunta filtro Categoria ...  
      
    return query;  
};

**Requisiti Backend:**

1. **Gestione Date Listini:** La query DEVE verificare validita\_dal e validita\_al. Se esistono più listini validi (errore dati), prendere il più recente (ORDER BY id DESC LIMIT 1).  
2. **Ricerca Avanzata:** Se l'utente cerca "12345", la query deve cercare in OR su: c.codice, c.descrizione, ct\_ean.codice, ct\_codici\_fornitore.codice.

## **4\. Fase 2: Definizione API Pubblica (Express)**

**File Target:** routes/public.js

### **Endpoint: POST /api/public/catalogo/search**

Usiamo POST per permettere payload di filtri complessi.

**Request Body:**

{  
  "id\_ditta": 1,  
  "config": {  
    "listino\_tipo": "pubblico", // o "cessione"  
    "listino\_index": 1,         // 1-6  
    "mostra\_esauriti": false  
  },  
  "filters": {  
    "categoria\_id": 15,  
    "search\_term": "trapano",  
    "prezzo\_min": 0,  
    "prezzo\_max": 500  
  },  
  "pagination": {  
    "page": 1,  
    "limit": 20  
  }  
}

**Response:**

{  
  "data": \[  
    {  
      "id": 101,  
      "codice": "TRAP-01",  
      "descrizione": "Trapano a percussione",  
      "prezzo": 125.50,  
      "valuta": "EUR",  
      "disponibile": true, // calcolato backend se giacenza \> 0  
      "immagini": \["url1.jpg"\]  
    }  
  \],  
  "meta": {  
    "total": 50,  
    "page": 1  
  }  
}

## **5\. Fase 3: Frontend \- Pannello Configurazione CMS**

Obiettivo: Permettere all'utente che costruisce il sito di configurare il blocco.  
File Target: components/blocks/CatalogBlock/Config.js (da creare per il Site Builder).  
**Controlli UI Richiesti:**

1. **Selezione Sorgente Dati:**  
   * Dropdown: "Tutte le categorie" o "Categoria Specifica" (Select con albero categorie da ct\_categorie).  
2. **Configurazione Prezzi (CRITICO):**  
   * Select: "Tipo Listino" (Opzioni: Pubblico, Cessione).  
   * Slider/Select: "Numero Listino" (1, 2, 3, 4, 5, 6).  
   * *Tooltip:* "Seleziona quale colonna del listino utilizzare per il prezzo pubblico."  
3. **Filtri Visualizzazione:**  
   * Switch: "Nascondi articoli con giacenza 0".  
   * Switch: "Mostra barra di ricerca".  
   * Switch: "Mostra filtri laterali".

## **6\. Fase 4: Frontend \- Componente Visualizzatore (Next.js)**

**File Target:** components/blocks/CatalogBlock.js

**Funzionalità UI:**

1. **Layout:**  
   * Sidebar sinistra (facoltativa) con albero categorie e filtro range prezzo.  
   * Area principale con Griglia Prodotti (responsive).  
2. **Product Card Component:**  
   * Immagine (con placeholder se assente).  
   * Titolo (max 2 righe).  
   * Codice Articolo (piccolo, grigio).  
   * **Prezzo:** Formattato con Intl.NumberFormat.  
   * **Stato:** Pallino Verde (Disponibile) / Rosso (Esaurito) / Giallo (Ultimi pezzi \- se giacenza \< soglia).  
3. **Gestione Stato:**  
   * Utilizzare SWR (già presente nel progetto) per il fetching dei dati lato client quando l'utente cambia pagina o applica filtri.  
   * URL Sync: Aggiornare i query params URL (es. ?cat=15\&q=trapano) per permettere la condivisione dei link.

## **7\. Tabella di Marcia (Checklist)**

* \[ \] **Backend:** Creare migrazione (se necessaria per indici mancanti su ct\_catalogo o ct\_listini).  
* \[ \] **Backend:** Implementare la logica SQL dinamica per la selezione della colonna prezzo in routes/public.js.  
* \[ \] **Backend:** Testare la query con casi limite (articolo senza listino, articolo con listino scaduto).  
* \[ \] **Frontend (CMS):** Creare i campi di configurazione nel Block Registry per salvare le preferenze di listino.  
* \[ \] **Frontend (Public):** Sviluppare il componente CatalogBlock.js con fetch all'API pubblica.  
* \[ \] **Frontend (Public):** Implementare la barra di ricerca con *debounce* (ritardo input) per non sovraccaricare il DB.

\#\#\# Prossimi Passi  
Dimmi quale fase vuoi avviare. Posso generare immediatamente il codice per:  
1\.  La \*\*rotta API Backend\*\* (\`routes/public.js\`) con la query Knex complessa.  
2\.  Il \*\*Componente React\*\* di base per il frontend.  
