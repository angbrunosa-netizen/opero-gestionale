const { dbPool } = require('./config/db');

async function checkBlogSchema() {
    try {
        console.log('🔍 Verifica schema tabella web_blog_posts...\n');

        const [rows] = await dbPool.query('DESCRIBE web_blog_posts');

        console.log('Campo'.padEnd(25) + '| Tipo'.padEnd(20) + '| Null | Key');
        console.log('-'.repeat(60));

        rows.forEach(row => {
            console.log(
                row.Field.padEnd(25) + '| ' +
                row.Type.padEnd(20) + '| ' +
                row.Null.padEnd(5) + '| ' +
                row.Key
            );
        });

        return rows;

    } catch (error) {
        console.error('❌ Errore:', error.message);
        return null;
    } finally {
        await dbPool.end();
    }
}

checkBlogSchema();