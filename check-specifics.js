const mysql = require('mysql2/promise');

async function checkSpecifics() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Abhi@123',
        database: 'online_shop'
    });

    const names = [
        'Precision Pen Set',
        'Graphite Racket',
        'Aero Yoga Mat',
        'Cast Iron Skillet',
        'Smart Air Fryer',
        'Blender Max 500',
        'Drip Master Coffee'
    ];

    console.log('--- Checking Specific Products ---');
    for (const name of names) {
        const [rows] = await c.execute('SELECT product_name, image_url FROM products WHERE product_name = ?', [name]);
        if (rows.length === 0) {
            console.log(`NOT FOUND: "${name}"`);
            // Try a LIKE search to see if there are trailing spaces or case differences
            const [likeRows] = await c.execute('SELECT product_name, image_url FROM products WHERE product_name LIKE ?', [`%${name}%`]);
            if (likeRows.length > 0) {
                console.log(`  Suggestion: Found "${likeRows[0].product_name}" instead.`);
            }
        } else {
            console.log(`FOUND: "${rows[0].product_name}" -> ${rows[0].image_url}`);
        }
    }
    await c.end();
}

checkSpecifics().catch(console.error);
