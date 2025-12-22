/**
 * Nome File: 001_advanced_page_management_seeds.js
 * Posizione: seeds/001_advanced_page_management_seeds.js
 * Data: 21/12/2025
 * Descrizione: Seed di test per il sistema avanzato di gestione pagine
 */

exports.seed = function(knex) {
    return knex('ditte')
        .where('id_tipo_ditta', 1) // Solo ditte proprietarie
        .select('id', 'ragione_sociale')
        .then(ditte => {
            if (ditte.length === 0) {
                console.log('Nessuna ditta proprietaria trovata per i seed');
                return Promise.resolve();
            }

            const dittaId = ditte[0].id;
            const dittaNome = ditte[0].ragione_sociale;

            // Pagine di esempio con configurazioni SEO avanzate
            const pagineEsempio = [
                {
                    id_ditta: dittaId,
                    slug: 'chi-siamo',
                    titolo_seo: 'Chi Siamo - ' + dittaNome + ' | Scopri la Nostra Storia',
                    titolo_pagina: 'Chi Siamo',
                    descrizione_seo: 'Scopri la storia, i valori e il team di ' + dittaNome + '. Leader nel settore con anni di esperienza e passione per l\'eccellenza.',
                    keywords_seo: 'chi siamo, storia aziendale, team, valori, ' + dittaNome.toLowerCase(),
                    immagine_social: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=Chi+Siamo+-+' + encodeURIComponent(dittaNome),
                    id_page_parent: null,
                    ordine_menu: 1,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-building',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'follow',
                    pubblicata: true
                },
                {
                    id_ditta: dittaId,
                    slug: 'servizi',
                    titolo_seo: 'Servizi Professionali - ' + dittaNome + ' | Soluzioni Complete',
                    titolo_pagina: 'I Nostri Servizi',
                    descrizione_seo: 'Offriamo una gamma completa di servizi professionali: consulenza, sviluppo, manutenzione e supporto tecnico. Soluzioni su misura per le tue esigenze.',
                    keywords_seo: 'servizi, consulenza, sviluppo, manutenzione, supporto tecnico, soluzioni',
                    immagine_social: 'https://via.placeholder.com/1200x630/10B981/FFFFFF?text=Servizi+-+' + encodeURIComponent(dittaNome),
                    id_page_parent: null,
                    ordine_menu: 2,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-cogs',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'follow',
                    pubblicata: true
                },
                {
                    id_ditta: dittaId,
                    slug: 'consulenza-aziendale',
                    titolo_seo: 'Consulenza Aziendale - Strategie di Successo | ' + dittaNome,
                    titolo_pagina: 'Consulenza Aziendale',
                    descrizione_seo: 'Servizi di consulenza aziendale per ottimizzare processi, migliorare efficienza e guidare la crescita aziendale con strategie personalizzate.',
                    keywords_seo: 'consulenza aziendale, strategie, crescita aziendale, ottimizzazione processi',
                    immagine_social: 'https://via.placeholder.com/1200x630/059669/FFFFFF?text=Consulenza+Aziendale',
                    id_page_parent: null,
                    ordine_menu: 0,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-chart-line',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'follow',
                    pubblicata: true
                },
                {
                    id_ditta: dittaId,
                    slug: 'contatti',
                    titolo_seo: 'Contatti - ' + dittaNome + ' | Sede, Telefono, Email',
                    titolo_pagina: 'Contatti',
                    descrizione_seo: 'Trova facilmente i contatti di ' + dittaNome + '. Sede centrale, telefono, email e modulo di contatto per richiedere informazioni o preventivi.',
                    keywords_seo: 'contatti, sede, telefono, email, modulo contatto, ' + dittaNome.toLowerCase(),
                    immagine_social: 'https://via.placeholder.com/1200x630/7C3AED/FFFFFF?text=Contatti+-+' + encodeURIComponent(dittaNome),
                    id_page_parent: null,
                    ordine_menu: 3,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-envelope',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'follow',
                    pubblicata: true
                },
                {
                    id_ditta: dittaId,
                    slug: 'area-clienti',
                    titolo_seo: 'Area Clienti - Login Portale Riservato | ' + dittaNome,
                    titolo_pagina: 'Area Clienti',
                    descrizione_seo: 'Accedi al portale clienti riservato di ' + dittaNome + '. Gestisci i tuoi progetti, scarica documenti e monitora lo stato dei lavori in tempo reale.',
                    keywords_seo: 'area clienti, portale riservato, login, dashboard, ' + dittaNome.toLowerCase(),
                    immagine_social: null,
                    id_page_parent: null,
                    ordine_menu: 4,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-lock',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: 'clienti123',
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'noindex',
                    robots_follow: 'nofollow',
                    pubblicata: true
                },
                {
                    id_ditta: dittaId,
                    slug: 'team',
                    titolo_seo: 'Il Nostro Team - Professionisti Esperti | ' + dittaNome,
                    titolo_pagina: 'Il Team di ' + dittaNome,
                    descrizione_seo: 'Conosci il team di professionisti esperti di ' + dittaNome + '. Persone qualificate e appassionate che lavorano per garantire i migliori risultati.',
                    keywords_seo: 'team, professionisti, esperti, ' + dittaNome.toLowerCase(),
                    immagine_social: 'https://via.placeholder.com/1200x630/0EA5E9/FFFFFF?text=Il+Nostro+Team',
                    id_page_parent: null,
                    ordine_menu: 0,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: null,
                    target_link: '_self',
                    icona_menu: 'fas fa-users',
                    data_pubblicazione: null, // Programmata per il futuro
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'follow',
                    pubblicata: false // Bozza
                },
                {
                    id_ditta: dittaId,
                    slug: 'link-esterno-partner',
                    titolo_seo: 'Partner Strategici | ' + dittaNome,
                    titolo_pagina: 'I Nostri Partner',
                    descrizione_seo: 'Scopri i partner strategici di ' + dittaNome + '. Collaborazioni che portano valore e innovazione ai nostri clienti.',
                    keywords_seo: 'partner, collaborazioni, strategici, ' + dittaNome.toLowerCase(),
                    immagine_social: null,
                    id_page_parent: null,
                    ordine_menu: 5,
                    livello_menu: 1,
                    mostra_menu: true,
                    link_esterno: 'https://partner-esempio.com',
                    target_link: '_blank',
                    icona_menu: 'fas fa-handshake',
                    data_pubblicazione: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    data_scadenza: null,
                    password_protetta: null,
                    layout_template: 'default',
                    canonical_url: null,
                    robots_index: 'index',
                    robots_follow: 'nofollow',
                    pubblicata: true
                }
            ];

            // Inserimento pagine
            return knex('web_pages').insert(pagineEsempio);
        })
        .then(() => {
            console.log('Seed pagine avanzate completato con successo');
            return Promise.resolve();
        })
        .catch(error => {
            console.error('Errore durante seed pagine avanzate:', error);
            return Promise.reject(error);
        });
};