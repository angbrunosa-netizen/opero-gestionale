const p = require('./routes/utils/starterSitePresets.js');

const restaurant = p.restaurant;
const menuPage = restaurant.pagesStructure.menu;

if (menuPage) {
    const guideBlock = menuPage.blocks.find(b => b.tipo_componente === 'GUIDE');
    if (guideBlock) {
        const tabs = guideBlock.dati_config.tabs;
        console.log('✅ Preset Restaurant caricato!');
        console.log('Tabs nella guida menu:', tabs.length);
        tabs.forEach(tab => {
            const contentLength = tab.content ? tab.content.length : 0;
            const hasRecipes = contentLength > 5000;
            console.log(`  - ${tab.label}: ${contentLength} caratteri ${hasRecipes ? '✅ RICETTE COMPLETE' : '❌'}`);
        });
    } else {
        console.log('❌ Blocco GUIDE non trovato');
    }
} else {
    console.log('❌ Pagina menu non trovata');
}
