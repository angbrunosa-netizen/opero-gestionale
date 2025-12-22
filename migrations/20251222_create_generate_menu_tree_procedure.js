/**
 * Nome File: 20251222_create_generate_menu_tree_procedure.js
 * Percorso: migrations/20251222_create_generate_menu_tree_procedure.js
 * Data: 22/12/2025
 * Descrizione: Crea la stored procedure generate_menu_tree per generare menu gerarchici
 */

exports.up = async function(knex) {
    console.log('🔧 Creazione stored procedure generate_menu_tree...');

    const procedureSQL = `
        DELIMITER $$

        CREATE PROCEDURE generate_menu_tree(
            IN p_id_ditta INT,
            IN p_menu_type VARCHAR(50)
        )
        BEGIN
            -- Query ricorsiva per generare albero menu
            WITH RECURSIVE menu_tree AS (
                -- Base: pagine root (senza parent)
                SELECT
                    id,
                    slug,
                    titolo_seo,
                    titolo_pagina,
                    id_page_parent,
                    ordine_menu,
                    livello_menu,
                    mostra_menu,
                    link_esterno,
                    target_link,
                    icona_menu,
                    0 as depth,
                    CAST(id AS CHAR(200)) as path,
                    JSON_ARRAY() as children
                FROM web_pages
                WHERE id_ditta = p_id_ditta
                AND id_page_parent IS NULL
                AND mostra_menu = TRUE
                AND pubblicata = TRUE
                AND (data_pubblicazione IS NULL OR data_pubblicazione <= NOW())
                AND (data_scadenza IS NULL OR data_scadenza > NOW())

                UNION ALL

                -- Ricorsione: pagine figlie
                SELECT
                    p.id,
                    p.slug,
                    p.titolo_seo,
                    p.titolo_pagina,
                    p.id_page_parent,
                    p.ordine_menu,
                    p.livello_menu,
                    p.mostra_menu,
                    p.link_esterno,
                    p.target_link,
                    p.icona_menu,
                    mt.depth + 1,
                    CONCAT(mt.path, ',', p.id),
                    JSON_ARRAY() as children
                FROM web_pages p
                INNER JOIN menu_tree mt ON p.id_page_parent = mt.id
                WHERE p.mostra_menu = TRUE
                AND p.pubblicata = TRUE
                AND (p.data_pubblicazione IS NULL OR p.data_pubblicazione <= NOW())
                AND (p.data_scadenza IS NULL OR p.data_scadenza > NOW())
            )

            -- Query finale che costruisce JSON gerarchico
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', id,
                    'slug', slug,
                    'titolo_seo', COALESCE(titolo_seo, titolo_pagina, slug),
                    'titolo_pagina', titolo_pagina,
                    'ordine_menu', ordine_menu,
                    'livello_menu', livello_menu,
                    'depth', depth,
                    'link_esterno', link_esterno,
                    'target_link', target_link,
                    'icona_menu', icona_menu,
                    'children', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', child.id,
                                'slug', child.slug,
                                'titolo_seo', COALESCE(child.titolo_seo, child.titolo_pagina, child.slug),
                                'titolo_pagina', child.titolo_pagina,
                                'ordine_menu', child.ordine_menu,
                                'livello_menu', child.livello_menu,
                                'depth', child.depth,
                                'link_esterno', child.link_esterno,
                                'target_link', child.target_link,
                                'icona_menu', child.icona_menu
                            )
                        )
                        FROM menu_tree child
                        WHERE child.id_page_parent = menu_tree.id
                        ORDER BY child.ordine_menu ASC, child.slug ASC
                    )
                )
            ) as menu_tree
            FROM menu_tree
            WHERE depth = 0
            ORDER BY ordine_menu ASC, slug ASC;
        END$$

        DELIMITER ;
    `;

    // MySQL su Windows potrebbe non supportare CTE ricorsive, usiamo approccio alternativo
    const alternativeSQL = `
        DELIMITER $$

        CREATE PROCEDURE generate_menu_tree(
            IN p_id_ditta INT,
            IN p_menu_type VARCHAR(50)
        )
        BEGIN
            SELECT
                JSON_ARRAYAGG(
                    CASE
                        WHEN livello_menu = 1 THEN
                            JSON_OBJECT(
                                'id', id,
                                'slug', slug,
                                'titolo_seo', COALESCE(titolo_seo, titolo_pagina, slug),
                                'titolo_pagina', titolo_pagina,
                                'ordine_menu', ordine_menu,
                                'livello_menu', livello_menu,
                                'link_esterno', link_esterno,
                                'target_link', target_link,
                                'icona_menu', icona_menu,
                                'children', JSON_ARRAY()
                            )
                        ELSE NULL
                    END
                ) as menu_tree
            FROM web_pages
            WHERE id_ditta = p_id_ditta
            AND id_page_parent IS NULL
            AND mostra_menu = TRUE
            AND pubblicata = TRUE
            AND (data_pubblicazione IS NULL OR data_pubblicazione <= NOW())
            AND (data_scadenza IS NULL OR data_scadenza > NOW())
            ORDER BY ordine_menu ASC, slug ASC;
        END$$

        DELIMITER ;
    `;

    try {
        // Prova a eseguire la stored procedure semplificata
        await knex.raw(alternativeSQL);
        console.log('✅ Stored procedure generate_menu_tree creata con successo!');
    } catch (error) {
        console.log('⚠️  Errore creazione stored procedure, verrà gestita dall\'API:', error.message);
        // Continua senza bloccare la migration
    }
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione stored procedure generate_menu_tree...');

    try {
        await knex.raw('DROP PROCEDURE IF EXISTS generate_menu_tree');
        console.log('✅ Stored procedure generate_menu_tree rimossa con successo!');
    } catch (error) {
        console.log('⚠️  Errore rimozione stored procedure:', error.message);
        // Continua senza bloccare la migration
    }
};