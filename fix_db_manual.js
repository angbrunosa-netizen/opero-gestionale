/**
 * Nome File: fix_db_manual.js
 * Descrizione: Script per forzare l'aggiornamento del DB saltando il sistema di migrazioni.
 * Esecuzione: node fix_db_manual.js
 * * FIX: Aggiunta esplicita delle colonne mancanti per il CMS.
 */
require('dotenv').config();
const { dbPool } = require('./config/db');

async function fixDatabase() {
    console.log("🔧 AVVIO RIPARAZIONE MANUALE DATABASE OPERO...");
    
    let conn;
    try {
        conn = await dbPool.getConnection();
        const table = 'ditte';

        // --- 1. Fix Tabella DITTE (CMS) ---
        console.log("1️⃣  Verifica tabella 'ditte'...");
        const [cols] = await conn.query("SHOW COLUMNS FROM ditte");
        const colNames = cols.map(c => c.Field);

        // Funzione per eseguire ALTER TABLE in modo sicuro
        const safeAlter = async (columnName, sqlDefinition, alterMessage) => {
            if (!colNames.includes(columnName)) {
                console.log(`   -> ⚠️ Colonna '${columnName}' mancante. Creazione in corso...`);
                await conn.query(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${sqlDefinition}`);
                console.log(`   -> ${alterMessage} creata.`);
                // Ricarica i nomi delle colonne dopo la modifica
                const [newCols] = await conn.query("SHOW COLUMNS FROM ditte");
                colNames.splice(0, colNames.length, ...newCols.map(c => c.Field));
            } else {
                console.log(`   -> Colonna '${columnName}' OK.`);
            }
        };

        // Colonne CMS mancanti:
        await safeAlter('url_slug', 'VARCHAR(100) NULL UNIQUE COMMENT "Slug URL per il sito web"', 'url_slug');
        if (colNames.includes('url_slug')) {
            // Aggiunge l'indice solo se non esiste ancora
             try {
                 await conn.query("ALTER TABLE ditte ADD INDEX idx_url_slug (url_slug)");
             } catch {}
        }
        
        await safeAlter('shop_attivo', 'TINYINT(1) DEFAULT 0', 'shop_attivo');
        await safeAlter('shop_colore_primario', 'VARCHAR(7) DEFAULT "#000000"', 'shop_colore_primario');
        await safeAlter('shop_colore_secondario', 'VARCHAR(7) DEFAULT "#ffffff"', 'shop_colore_secondario');
        await safeAlter('shop_banner_url', 'VARCHAR(500) NULL', 'shop_banner_url');
        await safeAlter('shop_descrizione_home', 'TEXT NULL', 'shop_descrizione_home');
        
        // Colonna specifica per la rotta /config (che cercava 'shop_template' come stringa)
        await safeAlter('shop_template', 'VARCHAR(50) DEFAULT "standard"', 'shop_template');
        
        // Aggiungi la colonna id_web_template (relazione FK)
        await safeAlter('id_web_template', 'INT UNSIGNED NULL', 'id_web_template');
        
        // Tenta di aggiungere la FK (può fallire se web_templates non è stata creata, ma ignoreremo l'errore se non critico)
        if (colNames.includes('id_web_template')) {
             try {
                await conn.query("ALTER TABLE ditte ADD CONSTRAINT fk_ditte_web_template FOREIGN KEY (id_web_template) REFERENCES web_templates(id)");
                console.log("   -> Foreign Key 'fk_ditte_web_template' creata.");
             } catch(e) { 
                 // ERRORE ATTESO se FK esiste già o la tabella web_templates non è migrata
                 console.log("   -> (Nota: FK skippata o già presente.)"); 
             }
        }
        
        // --- 2. Fix Tabella ALLEGATI (Statistiche) ---
        console.log("2️⃣  Verifica tabella 'allegati_tracciati'...");
        const [colsAll] = await conn.query("SHOW COLUMNS FROM allegati_tracciati");
        const colNamesAll = colsAll.map(c => c.Field);
        
        if (!colNamesAll.includes('dimensione_file')) {
            console.log("   -> ⚠️ Colonna 'dimensione_file' mancante. Creazione in corso...");
            await conn.query("ALTER TABLE allegati_tracciati ADD COLUMN dimensione_file INT UNSIGNED DEFAULT 0");
        } else {
             console.log("   -> Colonna 'dimensione_file' OK.");
        }

        console.log("\n✅ RIPARAZIONE COMPLETATA CON SUCCESSO!");
        console.log("   Ora puoi riavviare il server.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ ERRORE CRITICO:", error.message);
        process.exit(1);
    } finally {
        if (conn) conn.release();
    }
}

fixDatabase();