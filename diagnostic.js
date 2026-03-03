const mysql = require('mysql2/promise');
const fs = require('fs');

async function diagnostic() {
    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Abhi@123',
        database: 'online_shop'
    });

    const [rows] = await c.execute('SELECT product_name, category_id, image_url FROM products');

    const categories = {};
    rows.forEach(r => {
        if (!categories[r.category_id]) categories[r.category_id] = [];
        categories[r.category_id].push(r);
    });

    let output = '--- Diagnostic Results ---\n';
    for (let cid in categories) {
        const prods = categories[cid];
        const uniqueImages = new Set(prods.map(p => p.image_url));
        output += `Category ${cid}: ${prods.length} products, ${uniqueImages.size} unique images.\n`;
        prods.forEach(p => output += `  - ${p.product_name}: ${p.image_url}\n`);
    }
    fs.writeFileSync('diagnostic_output.txt', output);
    console.log('Diagnostic results written to diagnostic_output.txt');
    await c.end();
}

diagnostic().catch(console.error);
