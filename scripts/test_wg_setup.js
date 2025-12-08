/**
 * Test setup tabelle wg_galleries
 */

const { dbPool } = require('../config/db');

async function testSetup() {
  try {
    console.log('🔍 Test setup gallerie...');

    // 1. Verifica siti esistenti
    const [sites] = await dbPool.execute('SELECT id, subdomain FROM siti_web_aziendali LIMIT 3');
    console.log('Siti disponibili:', sites.length);

    if (sites.length === 0) {
      console.log('⚠️  Nessun sito trovato');
      return;
    }

    const siteId = sites[0].id;
    console.log('Uso sito ID:', siteId);

    // 2. Test creazione galleria
    const [result] = await dbPool.execute(`
      INSERT INTO wg_galleries (
        id_sito_web, nome_galleria, layout, descrizione, sort_order
      ) VALUES (?, ?, ?, ?, ?)
    `, [siteId, 'Test Galleria Setup', 'grid-3', 'Galleria test completo setup', 1]);

    console.log('✅ Galleria creata, ID:', result.insertId);

    // 3. Verifica struttura tabelle
    const [structure] = await dbPool.execute('DESCRIBE wg_galleries');
    console.log('✅ Colonne wg_galleries:', structure.length);

    const [imagesStructure] = await dbPool.execute('DESCRIBE wg_gallery_images');
    console.log('✅ Colonne wg_gallery_images:', imagesStructure.length);

    // 4. Test vista
    const [viewTest] = await dbPool.execute(`
      SELECT COUNT(*) as total FROM v_wg_gallery_images_complete
    `);
    console.log('✅ Vista funzionante, totali:', viewTest[0].total);

    console.log('🎉 SETUP TEST COMPLETATO CON SUCCESSO!');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

testSetup().then(() => process.exit(0));