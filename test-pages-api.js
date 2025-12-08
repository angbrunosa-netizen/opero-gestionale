const { dbPool } = require('./config/db');

async function testAPIFixed() {
  try {
    console.log('🧪 Test API Pages endpoint (FIXED)...\n');

    const testDittaId = '1';

    console.log(`Test con id_ditta=${testDittaId}`);

    // Simula chiamata API con id_ditta
    let siteId;
    let isDittaId = false;

    const [directSite] = await dbPool.execute(
      'SELECT id, id_ditta FROM siti_web_aziendali WHERE id = ?',
      [testDittaId]
    );

    if (directSite.length > 0) {
      siteId = directSite[0].id;
      console.log(`   ✅ Trovato sito diretto: siteId=${siteId}`);
    } else {
      const [website] = await dbPool.execute(
        'SELECT id, id_ditta FROM siti_web_aziendali WHERE id_ditta = ? LIMIT 1',
        [testDittaId]
      );

      if (website.length > 0) {
        siteId = website[0].id;
        isDittaId = true;
        console.log(`   ✅ Trovato sito tramite ditta: siteId=${siteId}, id_ditta=${testDittaId}`);
      }
    }

    if (siteId) {
      const [pages] = await dbPool.execute(`
        SELECT
          id,
          titolo,
          slug,
          contenuto_html as contenuto,
          meta_title,
          meta_description,
          is_published,
          menu_order as sort_order,
          created_at,
          updated_at
        FROM pagine_sito_web
        WHERE id_sito_web = ?
        ORDER BY menu_order, titolo
      `, [siteId]);

      console.log(`   📄 Pagine trovate: ${pages.length}`);
      pages.forEach(page => {
        console.log(`      - ${page.titolo} (ID: ${page.id}, Pubblicata: ${page.is_published}, Ordine: ${page.sort_order})`);
      });

      console.log(`\n   📋 Response API simulata:`);
      console.log(`   {`);
      console.log(`     success: true,`);
      console.log(`     pages: [${pages.length} pagine],`);
      console.log(`     meta: {`);
      console.log(`       site_id: ${siteId},`);
      console.log(`       is_ditta_id: ${isDittaId},`);
      console.log(`       pages_count: ${pages.length}`);
      console.log(`     }`);
      console.log(`   }`);
    }

    console.log('\n✅ Test API completato con successo!');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    process.exit(0);
  }
}

testAPIFixed();