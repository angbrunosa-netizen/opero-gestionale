// #####################################################################
// # File di Migrazione per la tabella 'allegati_tracciati'
// # ID: 001
// # Descrizione: Crea la tabella se non esiste e aggiunge le colonne mancanti.
// #####################################################################

require('dotenv').config();
const { dbPool } = require('../config/db');

async function runMigration() {
    let connection;
    console.log('🚀 Inizio migrazione per la tabella "allegati_tracciati"...');

    try {
        // Ottieni una connessione dal pool
        connection = await dbPool.getConnection();
        console.log('✅ Connesso al database.');

        // --- STEP 1: Verifica se la tabella esiste ---
        const [tables] = await connection.query("SHOW TABLES LIKE 'allegati_tracciati'");
        
        if (tables.length === 0) {
            // --- STEP 2A: La tabella NON esiste, creala completa ---
            console.log('📋 Tabella "allegati_tracciati" non trovata. Creazione in corso...');
            
            const createTableSQL = `
                CREATE TABLE \`allegati_tracciati\` (
                  \`id\` INT NOT NULL AUTO_INCREMENT,
                  \`id_email_inviata\` INT NOT NULL,
                  \`nome_file_originale\` VARCHAR(255) NOT NULL,
                  \`percorso_file_salvato\` VARCHAR(255) NOT NULL,
                  \`tipo_file\` VARCHAR(100) NULL,
                  \`dimensione_file\` INT NULL,
                  \`download_id\` VARCHAR(255) NOT NULL,
                  \`scaricato\` TINYINT(1) NOT NULL DEFAULT 0,
                  \`data_primo_download\` TIMESTAMP NULL,
                  \`download_count\` INT NOT NULL DEFAULT 0,
                  \`ultimo_download\` TIMESTAMP NULL,
                  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  PRIMARY KEY (\`id\`),
                  UNIQUE INDEX \`download_id_UNIQUE\` (\`download_id\` ASC),
                  INDEX \`id_email_inviata_idx\` (\`id_email_inviata\` ASC),
                  CONSTRAINT \`fk_allegati_tracciati_email_inviate\`
                    FOREIGN KEY (\`id_email_inviata\`)
                    REFERENCES \`email_inviate\` (\`id\`)
                    ON DELETE CASCADE
                    ON UPDATE NO ACTION
                ) ENGINE=InnoDB;
            `;
            await connection.query(createTableSQL);
            console.log('✅ Tabella "allegati_tracciati" creata con successo.');

        } else {
            // --- STEP 2B: La tabella esiste, aggiungi le colonne mancanti ---
            console.log('📋 Tabella "allegati_tracciati" trovata. Verifica colonne mancanti...');
            
            const columnsToAdd = [
                {
                    name: 'download_count',
                    sql: 'ADD COLUMN `download_count` INT NOT NULL DEFAULT 0 AFTER `data_primo_download`'
                },
                {
                    name: 'ultimo_download',
                    sql: 'ADD COLUMN `ultimo_download` TIMESTAMP NULL AFTER `download_count`'
                },
                {
                    name: 'created_at',
                    sql: 'ADD COLUMN `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `ultimo_download`'
                }
            ];

            for (const column of columnsToAdd) {
                const [columns] = await connection.query(`SHOW COLUMNS FROM \`allegati_tracciati\` LIKE '${column.name}'`);
                
                if (columns.length === 0) {
                    console.log(`➕ Colonna "${column.name}" mancante. Aggiunta in corso...`);
                    await connection.query(`ALTER TABLE \`allegati_tracciati\` ${column.sql}`);
                    console.log(`✅ Colonna "${column.name}" aggiunta con successo.`);
                } else {
                    console.log(`✅ Colonna "${column.name}" già presente.`);
                }
            }
        }

        console.log('🎉 Migrazione completata con successo!');

    } catch (error) {
        console.error('❌ Errore durante la migrazione:', error);
        process.exit(1); // Esci con un codice di errore
    } finally {
        if (connection) {
            connection.release(); // Rilascia la connessione
            console.log('🔌 Connessione al database rilasciata.');
        }
        // Chiudi il pool per permettere allo script di terminare
        await dbPool.end();
    }
}

// Esegui la migrazione
runMigration();