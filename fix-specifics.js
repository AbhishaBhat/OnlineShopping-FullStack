const mysql = require('mysql2/promise');

async function fixSpecifics() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Abhi@123',
        database: 'online_shop'
    });

    const updates = [
        ["https://images.unsplash.com/photo-1585336139118-102a5204b722?q=80&w=500", "Precision Pen Set"],
        ["https://images.unsplash.com/photo-1617083270696-0fa2efc0e58d?q=80&w=500", "Graphite Racket"],
        ["https://images.unsplash.com/photo-1592433051474-55440c6c74d3?q=80&w=500", "Aero Yoga Mat"],
        ["https://images.unsplash.com/photo-1590159413203-085202613e5f?q=80&w=500", "Cast Iron Skillet"],
        ["https://images.unsplash.com/photo-1621327017866-da63760920a6?q=80&w=500", "Smart Air Fryer"],
        ["https://images.unsplash.com/photo-1570222083775-5374be1559ed?q=80&w=500", "Blender Max 500"],
        ["https://images.unsplash.com/photo-1517668808822-9ebe0212a36c?q=80&w=500", "Drip Master Coffee"]
    ];

    for (const [url, name] of updates) {
        // Using LIKE to be safe against trailing spaces
        await connection.execute('UPDATE products SET image_url = ? WHERE product_name LIKE ?', [url, `%${name}%`]);
    }

    console.log('Successfully fixed the specific product images.');
    await connection.end();
}

fixSpecifics().catch(console.error);
