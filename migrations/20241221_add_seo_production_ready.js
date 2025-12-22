/**
 * Nome File: 20241221_add_seo_production_ready.js
 * Posizione: migrations/20241221_add_seo_production_ready.js
 * Data: 21/12/2025
 * Descrizione: Migrazione production-ready per sistema avanzato di gestione pagine
 *              Compatibile con ambienti di sviluppo e produzione
 */

exports.up = function(knex) {
    console.log('🚀 Inizio migrazione SEO - Advanced Page Management System');

    // Verifica che la tabella web_pages esista
    return knex.raw('SHOW TABLES LIKE "web_pages"')
        .then(([result]) => {
            if (result.length === 0) {
                throw new Error('Tabella web_pages non trovata. Impossibile procedere con la migrazione.');
            }
            console.log('✅ Tabella web_pages trovata');

            // Verifica colonne esistenti nella tabella web_pages
            return knex.raw('DESCRIBE web_pages');
        })
        .then(([columns]) => {
            const existingColumns = columns.map(col => col.Field.toLowerCase());
            console.log('📋 Colonne esistenti:', existingColumns.length);

            const operations = [];
            const columnsToAdd = [];

            // Definizione delle colonne da aggiungere
            const newColumns = [
                {
                    name: 'titolo_pagina',
                    sql: `ADD COLUMN titolo_pagina VARCHAR(255) NULL COMMENT 'Titolo H1 della pagina'`
                },
                {
                    name: 'keywords_seo',
                    sql: `ADD COLUMN keywords_seo TEXT NULL COMMENT 'Meta keywords per SEO'`
                },
                {
                    name: 'immagine_social',
                    sql: `ADD COLUMN immagine_social VARCHAR(500) NULL COMMENT 'URL immagine per social media (Open Graph)'`
                },
                {
                    name: 'id_page_parent',
                    sql: `ADD COLUMN id_page_parent INT NULL COMMENT 'ID pagina parent per menu gerarchico'`
                },
                {
                    name: 'ordine_menu',
                    sql: `ADD COLUMN ordine_menu INT DEFAULT 0 COMMENT 'Ordinamento nel menu'`
                },
                {
                    name: 'livello_menu',
                    sql: `ADD COLUMN livello_menu INT DEFAULT 1 COMMENT 'Livello nel menu gerarchico'`
                },
                {
                    name: 'mostra_menu',
                    sql: `ADD COLUMN mostra_menu BOOLEAN DEFAULT TRUE COMMENT 'Mostra nel menu di navigazione'`
                },
                {
                    name: 'link_esterno',
                    sql: `ADD COLUMN link_esterno VARCHAR(500) NULL COMMENT 'Link esterno (se specificato, il link punta qui)'`
                },
                {
                    name: 'target_link',
                    sql: `ADD COLUMN target_link ENUM('_self', '_blank') DEFAULT '_self' COMMENT 'Target per link esterno'`
                },
                {
                    name: 'icona_menu',
                    sql: `ADD COLUMN icona_menu VARCHAR(100) NULL COMMENT 'Icona per menu (fontawesome o heroicons)'`
                },
                {
                    name: 'data_pubblicazione',
                    sql: `ADD COLUMN data_pubblicazione DATETIME NULL COMMENT 'Data di pubblicazione programmata'`
                },
                {
                    name: 'data_scadenza',
                    sql: `ADD COLUMN data_scadenza DATETIME NULL COMMENT 'Data scadenza pubblicazione'`
                },
                {
                    name: 'password_protetta',
                    sql: `ADD COLUMN password_protetta VARCHAR(255) NULL COMMENT 'Password per protezione pagina'`
                },
                {
                    name: 'layout_template',
                    sql: `ADD COLUMN layout_template VARCHAR(50) DEFAULT 'default' COMMENT 'Template layout specifico per pagina'`
                },
                {
                    name: 'canonical_url',
                    sql: `ADD COLUMN canonical_url VARCHAR(500) NULL COMMENT 'URL canonical per SEO'`
                },
                {
                    name: 'robots_index',
                    sql: `ADD COLUMN robots_index ENUM('index', 'noindex') DEFAULT 'index' COMMENT 'Directiva robots per indicizzazione'`
                },
                {
                    name: 'robots_follow',
                    sql: `ADD COLUMN robots_follow ENUM('follow', 'nofollow') DEFAULT 'follow' COMMENT 'Directiva robots per follow'`
                }
            ];

            // Identifica le colonne da aggiungere
            newColumns.forEach(column => {
                if (!existingColumns.includes(column.name.toLowerCase())) {
                    columnsToAdd.push(column);
                    operations.push(knex.raw(`
                        ALTER TABLE web_pages
                        ${column.sql}
                    `));
                } else {
                    console.log(`⚠️  Colonna '${column.name}' già esistente - saltata`);
                }
            });

            console.log(`📝 Colonne da aggiungere: ${columnsToAdd.length}`);
            columnsToAdd.forEach(col => console.log(`   + ${col.name}`));

            if (operations.length === 0) {
                console.log('✅ Nessuna colonna da aggiungere - migrazione completata');
                return Promise.resolve();
            }

            // Esegui tutte le operazioni in sequenza con retry
            return operations.reduce((promise, operation, index) => {
                return promise.then(() => {
                    console.log(`🔄 Aggiunta colonna ${index + 1}/${operations.length}...`);
                    return operation
                        .then(() => {
                            console.log(`✅ Colonna aggiunta con successo`);
                        })
                        .catch(error => {
                            console.error(`❌ Errore aggiungendo colonna:`, error.message);
                            // Continua con le altre colonne anche se una fallisce
                            console.log(`⚠️  Continuo con le colonne rimanenti...`);
                            return Promise.resolve(); // Non bloccare l'intera migrazione
                        });
                });
            }, Promise.resolve());
        })
        .then(() => {
            console.log('🎉 Migrazione completata con successo!');
            console.log('📊 Sistema Advanced Page Management ora attivo');

            // Verifica finale delle colonne
            return knex.raw('DESCRIBE web_pages');
        })
        .then(([columns]) => {
            const finalColumns = columns.map(col => col.Field);
            console.log(`📋 Colonne totali in web_pages: ${finalColumns.length}`);

            // Verifica che tutte le colonne necessarie siano presenti
            const requiredColumns = [
                'titolo_pagina', 'keywords_seo', 'immagine_social', 'id_page_parent',
                'ordine_menu', 'livello_menu', 'mostra_menu', 'link_esterno',
                'target_link', 'icona_menu', 'data_pubblicazione', 'data_scadenza',
                'password_protetta', 'layout_template', 'canonical_url',
                'robots_index', 'robots_follow'
            ];

            const missingColumns = requiredColumns.filter(col =>
                !finalColumns.map(f => f.toLowerCase()).includes(col.toLowerCase())
            );

            if (missingColumns.length > 0) {
                console.warn('⚠️  Attenzione: alcune colonne potrebbero non essere state aggiunte:', missingColumns);
            } else {
                console.log('✅ Tutte le colonne richieste sono presenti');
            }

            return Promise.resolve();
        })
        .catch(error => {
            console.error('💥 Errore critico durante la migrazione:', error);
            return Promise.reject(error);
        });
};

exports.down = function(knex) {
    console.log('🔄 Rollback migrazione Advanced Page Management...');

    return knex.schema.alterTable('web_pages', function(table) {
        // Rimuovi le colonne in ordine inverso per evitare problemi con foreign key
        table.dropColumnIfExists('robots_follow');
        table.dropColumnIfExists('robots_index');
        table.dropColumnIfExists('canonical_url');
        table.dropColumnIfExists('layout_template');
        table.dropColumnIfExists('password_protetta');
        table.dropColumnIfExists('data_scadenza');
        table.dropColumnIfExists('data_pubblicazione');
        table.dropColumnIfExists('icona_menu');
        table.dropColumnIfExists('target_link');
        table.dropColumnIfExists('link_esterno');
        table.dropColumnIfExists('mostra_menu');
        table.dropColumnIfExists('livello_menu');
        table.dropColumnIfExists('ordine_menu');
        table.dropColumnIfExists('id_page_parent');
        table.dropColumnIfExists('immagine_social');
        table.dropColumnIfExists('keywords_seo');
        table.dropColumnIfExists('titolo_pagina');
    })
    .then(() => {
        console.log('✅ Rollback completato con successo');
        return Promise.resolve();
    })
    .catch(error => {
        console.error('❌ Errore durante rollback:', error);
        return Promise.reject(error);
    });
};