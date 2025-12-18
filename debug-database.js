const { dbPool } = require('./config/db');

(async () => {
  try {
    console.log('🔍 Analisi database per debug blog...\n');

    // 1. Verifica struttura tabella ditte
    const [columns] = await dbPool.query('DESCRIBE ditte');
    console.log('Struttura tabella ditte:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });

    // 2. Verifica dati ditte attive
    const [ditte] = await dbPool.query('SELECT * FROM ditte WHERE shop_attivo = 1 LIMIT 3');
    console.log('\nDitte attive:');
    ditte.forEach(d => {
      console.log(`  ID: ${d.id}, Nome: ${d.nome || 'N/A'}, Shop attivo: ${d.shop_attivo}`);
    });

    // 3. Verifica blog posts
    const [posts] = await dbPool.query('SELECT COUNT(*) as total FROM web_blog_posts WHERE pubblicato = 1');
    console.log(`\nPosts pubblicati: ${posts[0].total}`);

    // 4. Verifica blog categories
    const [categories] = await dbPool.query('SELECT COUNT(*) as total FROM web_blog_categories WHERE attivo = 1');
    console.log(`Categorie attive: ${categories[0].total}`);

    // 5. Verifica se esistono posts di test
    const [testPosts] = await dbPool.query('SELECT titolo, slug, id_ditta FROM web_blog_posts LIMIT 3');
    if (testPosts.length > 0) {
      console.log('\nPosts di esempio:');
      testPosts.forEach(p => {
        console.log(`  - ${p.titolo} (slug: ${p.slug}, ditta: ${p.id_ditta})`);
      });
    }

    // 6. Verifica slug delle ditte attive
    const [ditteSlug] = await dbPool.query('SELECT id, url_slug, ragione_sociale FROM ditte WHERE shop_attivo = 1');
    console.log('\nSlug delle ditte attive:');
    ditteSlug.forEach(d => {
      console.log(`  ID: ${d.id} -> Slug: "${d.url_slug}" (R.Soc: ${d.ragione_sociale || 'N/A'})`);
    });

    await dbPool.end();
    console.log('\n✅ Analisi completata');

  } catch (error) {
    console.error('❌ Errore:', error.message);
    process.exit(1);
  }
})();