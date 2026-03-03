const mysql = require('mysql2/promise');

async function applyUpdates() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Abhi@123',
        database: 'online_shop'
    });

    const updates = [
        // Electronics
        ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500", "Smartphone X1"],
        ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500", "Neo-Glass Laptop"],
        ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=500", "Wireless Earbuds"],
        ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500", "Smartwatch Pro"],
        ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500", "PowerPad Tablet"],
        // Fashion
        ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=500", "Graphic T-Shirt"],
        ["https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500", "Designer Jeans"],
        ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500", "Winter Bomber"],
        ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500", "Tech Runners"],
        ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=500", "Polarized Shades"],
        // Home & Kitchen
        ["https://images.unsplash.com/photo-1517668808822-9ebe0212a36c?q=80&w=500", "Drip Master Coffee"],
        ["https://images.unsplash.com/photo-1570222083775-5374be1559ed?q=80&w=500", "Blender Max 500"],
        ["https://images.unsplash.com/photo-1621327017866-da63760920a6?q=80&w=500", "Smart Air Fryer"],
        ["https://images.unsplash.com/photo-1590159413203-085202613e5f?q=80&w=500", "Cast Iron Skillet"],
        ["https://images.unsplash.com/photo-1594212699903-ec8a3eea50f5?q=80&w=500", "Electric Kettle"],
        // Beauty
        ["https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=500", "Velvet Glow Kit"],
        ["https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500", "Oud Royal Perfume"],
        ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=500", "Sonic Pro Dryer"],
        ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=500", "Matte Finish Palette"],
        ["https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=500", "Grooming Pro Set"],
        // Sports
        ["https://images.unsplash.com/photo-1592433051474-55440c6c74d3?q=80&w=500", "Aero Yoga Mat"],
        ["https://images.unsplash.com/photo-1586401100295-7a8096fd231a?q=80&w=500", "Active Dumbbell Pair"],
        ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=500", "Summit Backpack"],
        ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500", "Match Football 2.0"],
        ["https://images.unsplash.com/photo-1617083270696-0fa2efc0e58d?q=80&w=500", "Graphite Racket"],
        // Books
        ["https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=500", "The Galaxy Guide"],
        ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500", "Journal Pro Slate"],
        ["https://images.unsplash.com/photo-1585336139118-102a5204b722?q=80&w=500", "Precision Pen Set"],
        ["https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=500", "Desk Organizer"],
        ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=500", "Smart Book Light"]
    ];

    for (const [url, name] of updates) {
        await connection.execute('UPDATE products SET image_url = ? WHERE product_name = ?', [url, name]);
    }

    console.log('Successfully updated all product images.');
    await connection.end();
}

applyUpdates().catch(console.error);
