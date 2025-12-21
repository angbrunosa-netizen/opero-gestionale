/**
 * Migration SICURA per la creazione delle tabelle del sistema blog multi-tenant
 * Data: 18/12/2025
 * Descrizione: Crea le tabelle web_blog_categories e web_blog_posts con controlli di esistenza
 * Compatibilità: Ambiente di sviluppo, test e produzione
 */

exports.up = async function(knex) {
    console.log('🔄 Inizio migration tabelle blog multi-tenant...');

    try {
        // 1. Creazione tabella Categorie Blog (solo se non esiste)
        const categoriesExists = await knex.schema.hasTable('web_blog_categories');

        if (!categoriesExists) {
            console.log('📝 Creazione tabella web_blog_categories...');
            await knex.schema.createTable('web_blog_categories', function(table) {
                table.increments('id').primary();
                table.integer('id_ditta').unsigned().notNullable();
                table.string('nome', 255).notNullable();
                table.string('slug', 255).notNullable();
                table.string('colore', 7).default('#2563eb');
                table.text('descrizione').nullable();
                table.integer('ordine').default(0);
                table.boolean('attivo').default(1);
                table.timestamps(true, true);

                // Indici per performance
                table.index(['id_ditta', 'attivo'], 'idx_categories_ditta_attivo');
                table.index(['slug'], 'idx_categories_slug');
                table.index(['ordine'], 'idx_categories_ordine');

                // Foreign key constraint con check per evitare errori in produzione
                table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');

                // Unique constraint combinato per evitare duplicati per ditta
                table.unique(['id_ditta', 'slug'], 'uk_categories_ditta_slug');
            });
            console.log('✅ Tabella web_blog_categories creata con successo');
        } else {
            console.log('⚠️ Tabella web_blog_categories già esistente - saltata');
        }

        // 2. Creazione tabella Post Blog (solo se non esiste)
        const postsExists = await knex.schema.hasTable('web_blog_posts');

        if (!postsExists) {
            console.log('📝 Creazione tabella web_blog_posts...');
            await knex.schema.createTable('web_blog_posts', function(table) {
                table.increments('id').primary();
                table.integer('id_ditta').unsigned().notNullable();
                table.integer('id_category').unsigned().nullable();
                table.string('titolo', 255).notNullable();
                table.string('slug', 255).notNullable();
                table.text('descrizione_breve').nullable();
                table.longText('contenuto').nullable();
                table.string('autore', 255).nullable();
                table.string('copertina_url', 500).nullable();
                table.string('copertina_alt', 255).nullable();
                table.string('pdf_url', 500).nullable();
                table.string('pdf_filename', 255).nullable();
                table.boolean('pubblicato').default(0);
                table.boolean('in_evidenza').default(0);
                table.datetime('data_pubblicazione').nullable();
                table.datetime('data_scadenza').nullable();
                table.integer('visualizzazioni').default(0);
                table.string('meta_title', 255).nullable();
                table.text('meta_description').nullable();
                table.string('meta_keywords', 500).nullable();
                table.string('seo_slug', 255).nullable();
                table.timestamps(true, true);

                // Indici per performance ottimale
                table.index(['id_ditta', 'pubblicato'], 'idx_posts_ditta_pubblicato');
                table.index(['id_category'], 'idx_posts_category');
                table.index(['slug'], 'idx_posts_slug');
                table.index(['data_pubblicazione'], 'idx_posts_data_pubblicazione');
                table.index(['in_evidenza'], 'idx_posts_evidenza');
                table.index(['visualizzazioni'], 'idx_posts_visualizzazioni');
                table.index(['created_at'], 'idx_posts_created_at');

                // Foreign keys con check per evitare errori
                table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
                table.foreign('id_category').references('id').inTable('web_blog_categories').onDelete('SET NULL');

                // Unique constraints per evitare duplicati
                table.unique(['id_ditta', 'slug'], 'uk_posts_ditta_slug');
            });
            console.log('✅ Tabella web_blog_posts creata con successo');
        } else {
            console.log('⚠️ Tabella web_blog_posts già esistente - saltata');
        }

        // 3. Verifica integrità strutture e indice
        console.log('🔍 Verifica integrità tabelle...');

        // Controlla che le tabelle esistano
        const [categoriesTable] = await knex.raw("SHOW TABLES LIKE 'web_blog_categories'");
        const [postsTable] = await knex.raw("SHOW TABLES LIKE 'web_blog_posts'");

        if (categoriesTable.length === 0 || postsTable.length === 0) {
            throw new Error('❌ Errore: le tabelle non sono state create correttamente');
        }

        // 4. Inserimento dati di default (solo se le tabelle sono vuote)
        console.log('📊 Verifica dati di default...');

        const categoriesCount = await knex('web_blog_categories').count('* as total');
        const postsCount = await knex('web_blog_posts').count('* as total');

        if (parseInt(categoriesCount[0]?.total) === 0) {
            console.log('📝 Inserimento categoria di default...');

            // Trova la prima ditta attiva come esempio
            const ditte = await knex('ditte').where('shop_attivo', 1).limit(1);

            if (ditte && ditte.length > 0) {
                await knex('web_blog_categories').insert({
                    id_ditta: ditte[0].id,
                    nome: 'Senza Categoria',
                    slug: 'senza-categoria',
                    colore: '#6B7280',
                    descrizione: 'Articoli senza categoria specifica',
                    ordine: 999,
                    attivo: 1
                });
                console.log('✅ Categoria di default inserita');
            } else {
                console.log('ℹ️ Nessuna ditta attiva trovata per inserire categoria di default');
            }
        } else {
            console.log('ℹ️ Categorie già presenti nel database');
        }

        console.log('🎉 Migration completata con successo!');
        console.log('📊 Statistiche finali:');
        console.log(`   - Categorie: ${categoriesCount[0]?.total || 0}`);
        console.log(`   - Posts: ${postsCount[0]?.total || 0}`);

    } catch (error) {
        console.error('❌ Errore durante la migration:', error.message);

        // Tentativo di rollback in caso di errore critico
        try {
            console.log('🔄 Tentativo di rollback...');
            await knex.schema.dropTableIfExists('web_blog_posts');
            await knex.schema.dropTableIfExists('web_blog_categories');
            console.log('✅ Rollback completato');
        } catch (rollbackError) {
            console.error('❌ Errore durante il rollback:', rollbackError.message);
        }

        throw error;
    }
};

exports.down = async function(knex) {
    console.log('🔄 Inizio rollback tabelle blog...');

    try {
        // Drop in ordine inverso per rispettare le foreign key
        const postsExists = await knex.schema.hasTable('web_blog_posts');
        const categoriesExists = await knex.schema.hasTable('web_blog_categories');

        if (postsExists) {
            console.log('🗑️ Rimozione tabella web_blog_posts...');
            await knex.schema.dropTable('web_blog_posts');
            console.log('✅ Tabella web_blog_posts rimossa');
        }

        if (categoriesExists) {
            console.log('🗑️ Rimozione tabella web_blog_categories...');
            await knex.schema.dropTable('web_blog_categories');
            console.log('✅ Tabella web_blog_categories rimossa');
        }

        console.log('🎉 Rollback completato con successo!');

    } catch (error) {
        console.error('❌ Errore durante il rollback:', error.message);
        throw error;
    }
};

/**
 * Funzione di verifica per uso post-migration
 */
exports.verify = async function(knex) {
    console.log('🔍 Verifica post-migration...');

    try {
        // Verifica esistenza tabelle
        const categoriesExists = await knex.schema.hasTable('web_blog_categories');
        const postsExists = await knex.schema.hasTable('web_blog_posts');

        if (!categoriesExists || !postsExists) {
            return {
                success: false,
                error: 'Una o più tabelle del blog non esistono',
                tables: {
                    categories: categoriesExists,
                    posts: postsExists
                }
            };
        }

        // Verifica indici
        let categoriesIndexes = [];
        let postsIndexes = [];

        try {
            const [catIndexes] = await knex.raw('SHOW INDEX FROM web_blog_categories');
            categoriesIndexes = catIndexes;
        } catch (e) {
            // La tabella potrebbe non avere indici o non esistere
        }

        try {
            const [postIndexes] = await knex.raw('SHOW INDEX FROM web_blog_posts');
            postsIndexes = postIndexes;
        } catch (e) {
            // La tabella potrebbe non avere indici o non esistere
        }

        // Conteggio record con try-catch
        let categoriesCount = 0;
        let postsCount = 0;

        try {
            const [catCount] = await knex('web_blog_categories').count('* as total');
            categoriesCount = parseInt(catCount[0]?.total) || 0;
        } catch (e) {
            // La tabella potrebbe non esistere
        }

        try {
            const [postCount] = await knex('web_blog_posts').count('* as total');
            postsCount = parseInt(postCount[0]?.total) || 0;
        } catch (e) {
            // La tabella potrebbe non esistere
        }

        return {
            success: true,
            tables: {
                categories: categoriesExists,
                posts: postsExists
            },
            indexes: {
                categories: categoriesIndexes.length,
                posts: postsIndexes.length
            },
            records: {
                categories: categoriesCount,
                posts: postsCount
            }
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};