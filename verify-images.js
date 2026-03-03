const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'src/.env' });

async function verify() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Abhi@123',
        database: 'online_shop'
    });

    const [rows] = await connection.execute('SELECT product_name, image_url FROM products');
    console.log('--- Product Image Verification ---');
    const samples = rows.filter(r =>
        r.product_name === 'Smartphone X1' ||
        r.product_name === 'Neo-Glass Laptop' ||
        r.product_name === 'Graphic T-Shirt' ||
        r.product_name === 'Designer Jeans' ||
        r.product_name === 'Smart Book Light'
    );
    samples.forEach(row => {
        console.log(`${row.product_name}: ${row.image_url}`);
    });
    await connection.end();
}

verify().catch(console.error);
