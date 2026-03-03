const db = require('./src/config/db');

async function verify() {
    try {
        const [[{ count: catCount }]] = await db.query('SELECT COUNT(*) as count FROM categories');
        const [[{ count: prodCount }]] = await db.query('SELECT COUNT(*) as count FROM products');

        console.log(`Categories: ${catCount}`);
        console.log(`Products: ${prodCount}`);

        if (catCount === 6 && prodCount === 30) {
            console.log('Verification Success: 6 categories and 30 products found.');
        } else {
            console.log('Verification Failed: Expected 6 categories and 30 products.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verify();
