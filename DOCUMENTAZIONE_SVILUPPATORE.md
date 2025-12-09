# Documentazione per Sviluppatori - Progetto Opero

## 1. Introduzione

Questo documento fornisce una guida tecnica per gli sviluppatori che lavorano sul progetto **Opero**. L'obiettivo è descrivere l'architettura, le tecnologie utilizzate e le procedure necessarie per configurare l'ambiente di sviluppo e contribuire al progetto.

Opero è un'applicazione gestionale complessa con funzionalità che includono, ma non si limitano a:
- Gestione anagrafiche e rubrica
- Gestione documentale e archiviazione (con integrazione S3)
- Modulo di posta elettronica (invio e ricezione)
- Gestione catalogo, magazzino, vendite e acquisti
- Contabilità e amministrazione
- Un Website Builder integrato

L'architettura è basata su un backend **Node.js/Express** che espone API RESTful e un frontend **React** separato.

## 2. Architettura Tecnologica

- **Backend:** Node.js
- **Framework Backend:** Express.js
- **Database ORM/Query Builder:** Knex.js
- **Database:** MySQL (utilizza il driver `mysql2`)
- **Autenticazione:** Basata su token JWT (JSON Web Tokens)
- **Gestione Upload/File:** Multer per l'upload locale, AWS SDK per l'integrazione con storage a oggetti S3 (Aruba Cloud).
- **Invio Email:** Nodemailer
- **Esecuzione task schedulati:** node-cron
- **Frontend:** React (situato nella cartella `opero-frontend`)
- **Gestione Dipendenze:** npm

## 3. Struttura del Progetto

La codebase è organizzata nelle seguenti directory principali:

- **/config**: Contiene file di configurazione, come la connessione al database (`db.js`).
- **/dbopero**: Contiene dump del database, file .sql e .csv utili per l'analisi e il setup iniziale.
- **/migrations**: Contiene le migrazioni del database gestite da Knex. Ogni file definisce una modifica allo schema del database.
- **/opero-frontend**: Contiene il codice sorgente dell'applicazione frontend React.
- **/routes**: Contiene i file che definiscono le rotte dell'API. Ogni file raggruppa endpoint correlati a una specifica funzionalità (es. `auth.js`, `catalogo.js`).
- **/services**: Contiene logica di business più complessa o interazioni con servizi esterni (es. `cleanupService.js` per S3).
- **/uploads**: Directory temporanea per i file caricati tramite `multer` prima di un eventuale spostamento su S3.
- **/utils**: Contiene funzioni di utilità riutilizzabili in diverse parti dell'applicazione (es. `auth.js` per la verifica dei token).
- **server.js**: È il file di avvio principale del backend. Inizializza l'app Express, carica i middleware e registra le rotte.
- **knexfile.js**: File di configurazione per Knex, definisce le connessioni al database per gli ambienti di sviluppo e produzione.
- **package.json**: Definisce i metadati del progetto, le dipendenze npm e gli script.
- **.env**: File (da creare localmente) per memorizzare le variabili d'ambiente (secret, configurazioni specifiche).

## 4. Setup dell'Ambiente di Sviluppo

Per eseguire il progetto in locale, seguire questi passaggi:

1.  **Clonare il repository** (se non già fatto).
2.  **Installare Node.js** (se non presente nel sistema).
3.  **Installare le dipendenze:**
    ```bash
    npm install
    ```
4.  **Configurare il Database:**
    - Assicurarsi di avere un'istanza di MySQL in esecuzione.
    - Creare un database per il progetto.
5.  **Creare il file di configurazione `.env`:**
    - Copiare il file `.env.example` e rinominarlo in `.env`.
    - Aprire il file `.env` e compilare le variabili richieste, in particolare quelle relative al database:
      ```
      DB_HOST=127.0.0.1
      DB_USER=root
      DB_PASSWORD=latuapassword
      DB_NAME=opero_db
      PORT=3001 
      # Assicurarsi che la porta non sia già in uso
      ```
    - Aggiungere anche le altre variabili d'ambiente necessarie (es. `JWT_SECRET`, configurazioni S3, etc.) basandosi sul file `server.js` e sui file di configurazione.

## 5. Database

Il progetto utilizza **Knex.js** per gestire lo schema del database e le query.

- **Eseguire le Migrazioni:** Per aggiornare lo schema del database all'ultima versione, eseguire il comando (se configurato negli script di `package.json`, altrimenti usare `npx`):
  ```bash
  npx knex migrate:latest --knexfile knexfile.js
  ```
  Questo comando creerà le tabelle necessarie nel database configurato nel file `.env`.

## 6. Avvio dell'Applicazione

Una volta completata la configurazione, è possibile avviare il server di backend:

```bash
npm start
```

Il server si avvierà in modalità sviluppo sulla porta specificata nel file `.env` (o sulla porta di default 3000/3001).

Per il frontend, navigare nella directory `opero-frontend` e seguire le istruzioni presenti nel suo `README.md` (tipicamente `npm install` e `npm start`).

## 7. API, Routing e Sicurezza

Le API sono definite nella cartella `/routes`. L'accesso alla maggior parte delle rotte è protetto da un sistema di autenticazione e autorizzazione a più livelli.

### 7.1 Autenticazione e Gestione Sessione

L'autenticazione è gestita tramite **JSON Web Tokens (JWT)**. Il flusso principale è gestito in `routes/auth.js`.

- **Login (`POST /api/auth/login`)**: Endpoint primario per l'autenticazione.
    - Verifica email e password.
    - Implementa protezione da attacchi brute-force (blocco account dopo N tentativi).
    - Impedisce login multipli per lo stesso utente.
    - Supporta utenti multi-ditta, richiedendo una selezione se necessario (`needsDittaSelection: true`).
    - Alla riuscita, genera un token JWT contenente `id_utente`, `id_ditta`, `id_ruolo` e una lista di `permissions`.
- **Selezione Ditta (`POST /api/auth/select-ditta`)**: Endpoint per utenti multi-ditta per completare il login dopo aver scelto una ditta.
- **Logout (`POST /api/auth/logout`)**: Invalida la sessione corrente dell'utente.
- **Heartbeat (`POST /api/auth/heartbeat`)**: Endpoint che il frontend chiama periodicamente per mantenere attiva la sessione utente.
- **Recupero Password**: Un flusso a due passaggi per il reset della password (`/request-password-reset` e `/reset-password`).

### 7.2 Autorizzazione e Permessi

L'autorizzazione si basa su due meccanismi principali:

1.  **Token JWT**: Il middleware `verifyToken` (da `utils/auth.js`) viene applicato a quasi tutte le rotte non pubbliche. Verifica la validità del token JWT inviato nell'header `Authorization`.
2.  **Permessi Granulari**: Molte rotte effettuano un secondo controllo sul payload del token per verificare la presenza di permessi specifici. Questi permessi sono stringhe (es. `CT_VIEW`, `CT_MANAGE`) che definiscono azioni precise.

    *Esempio da `routes/catalogo.js`:*
    ```javascript
    // L'utente deve avere il permesso 'CT_MANAGE' per creare una categoria
    if (!req.user.permissions || !req.user.permissions.includes('CT_MANAGE')) {
        return res.status(403).json({ success: false, message: 'Azione non autorizzata. Permessi insufficienti.' });
    }
    ```
3.  **Livello Utente**: Per alcune aree critiche (come l'amministrazione S3), viene controllato anche un `livello` numerico dell'utente.

    *Esempio da `routes/admin-s3.js`:*
    ```javascript
    // L'utente deve avere un livello >= 90
    if (livello < 90) {
        return res.status(403).json({
            success: false,
            message: 'Permessi insufficienti. Richiesto livello admin (90+).'
        });
    }
    ```

### 7.3 Struttura delle API: Esempi

Le API seguono un design RESTful e sono raggruppate per modulo funzionale.

- **Modulo Catalogo (`routes/catalogo.js`)**:
    - Gestisce l'intero ciclo di vita di entità come categorie, prodotti, listini, unità di misura, etc.
    - **`GET /api/catalogo/categorie`**: Restituisce la struttura ad albero delle categorie.
    - **`POST /api/catalogo/categorie`**: Crea una nuova categoria, gestendo la logica complessa di codifica gerarchica.
    - **`GET /api/catalogo/entita`**: Restituisce un elenco paginato dei prodotti a catalogo.
    - **`POST /api/catalogo/import-csv`**: API per l'importazione massiva di dati da file CSV, con logica di *upsert* (aggiorna o inserisce).
    - **`GET /api/catalogo/search`**: Un potente endpoint di ricerca unificata che cerca un termine su più campi e tabelle correlate (prodotti, EAN, codici fornitore).

- **Modulo Amministrazione S3 (`routes/admin-s3.js`)**:
    - Fornisce endpoint per la gestione dello storage di file (allegati email) su S3.
    - **`GET /api/admin-s3/status`**: Fornisce una panoramica dello stato del servizio e statistiche di utilizzo.
    - **`GET /api/admin-s3/files`**: Elenca i file su S3, arricchendoli con informazioni dal database (es. a quale email sono associati).
    - **`DELETE /api/admin-s3/files/:s3Key`**: Elimina un file da S3 e il record corrispondente nel database.
    - **`POST /api/admin-s3/cleanup`**: Avvia un processo di pulizia per rimuovere file vecchi e non utilizzati.

### 7.4 Principi Generali

- **Transazioni Database**: Le operazioni che modificano più tabelle sono quasi sempre avvolte in transazioni Knex (`trx.commit()`, `trx.rollback()`) per garantire l'integrità dei dati.
- **Logging delle Azioni**: Le azioni significative (creazione, modifica, eliminazione) vengono registrate nella tabella `log_azioni` per scopi di audit.
- **Gestione Errori**: Le risposte di errore cercano di utilizzare codici di stato HTTP appropriati (400, 401, 403, 404, 500) e forniscono messaggi chiari.
