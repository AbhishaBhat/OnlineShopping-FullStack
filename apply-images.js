const mysql = require('mysql2/promise');
require('dotenv').config();

async function applyUpdates() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Abhi@123',
        database: process.env.DB_NAME || 'online_shop'
    });

    // Carefully curated Unsplash photo IDs — verified, high-quality, product-relevant images
    const updates = [
        // ── Electronics ──
        // Smartphone X1 — clean modern smartphone
        ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80", "Smartphone X1"],
        // Neo-Glass Laptop — slim silver laptop on desk
        ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&q=80", "Neo-Glass Laptop"],
        // Wireless Earbuds — white AirPods-style earbuds
        ["https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=500&q=80", "Wireless Earbuds"],
        // Smartwatch Pro — smartwatch on wrist
        ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", "Smartwatch Pro"],
        // PowerPad Tablet — tablet with keyboard
        ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80", "PowerPad Tablet"],

        // ── Fashion ──
        // Graphic T-Shirt — folded white tee
        ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80", "Graphic T-Shirt"],
        // Designer Jeans — denim jeans flat lay
        ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80", "Designer Jeans"],
        // Winter Bomber — black bomber jacket
        ["https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&q=80", "Winter Bomber"],
        // Tech Runners — modern running shoes
        ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", "Tech Runners"],
        // Polarized Shades — stylish sunglasses
        ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80", "Polarized Shades"],

        // ── Home & Kitchen ──
        // Drip Master Coffee — drip coffee maker
        ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80", "Drip Master Coffee"],
        // Blender Max 500 — kitchen blender
        ["https://images.unsplash.com/photo-1570222083775-5374be1559ed?w=500&q=80", "Blender Max 500"],
        // Smart Air Fryer — digital air fryer
        ["https://images.unsplash.com/photo-1648569498978-4f7e1c1c8534?w=500&q=80", "Smart Air Fryer"],
        // Cast Iron Skillet — cast iron pan with food
        ["https://images.unsplash.com/photo-1590159413203-085202613e5f?w=500&q=80", "Cast Iron Skillet"],
        // Electric Kettle — modern electric kettle
        ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80", "Electric Kettle"],

        // ── Beauty & Personal Care ──
        // Velvet Glow Kit — skincare products flatlay
        ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80", "Velvet Glow Kit"],
        // Oud Royal Perfume — luxury perfume bottle
        ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80", "Oud Royal Perfume"],
        // Sonic Pro Dryer — professional hair dryer
        ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80", "Sonic Pro Dryer"],
        // Matte Finish Palette — eyeshadow makeup palette
        ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80", "Matte Finish Palette"],
        // Grooming Pro Set — men's grooming/trimmer set
        ["https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80", "Grooming Pro Set"],

        // ── Sports & Outdoors ──
        // Aero Yoga Mat — purple yoga mat rolled out
        ["https://images.unsplash.com/photo-1601925228876-6d58b88b9809?w=500&q=80", "Aero Yoga Mat"],
        // Active Dumbbell Pair — pair of dumbbells
        ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80", "Active Dumbbell Pair"],
        // Summit Backpack — hiking backpack outdoors
        ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", "Summit Backpack"],
        // Match Football 2.0 — football on green grass
        ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80", "Match Football 2.0"],
        // Graphite Racket — tennis racket on court
        ["https://images.unsplash.com/photo-1617083270696-0fa2efc0e58d?w=500&q=80", "Graphite Racket"],

        // ── Books & Stationery ──
        // The Galaxy Guide — sci-fi / open book
        ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80", "The Galaxy Guide"],
        // Journal Pro Slate — leather notebook/journal
        ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80", "Journal Pro Slate"],
        // Precision Pen Set — pens on paper
        ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80", "Precision Pen Set"],
        // Desk Organizer — wooden desk organizer
        ["https://images.unsplash.com/photo-1593642632599-35525a3f4578?w=500&q=80", "Desk Organizer"],
        // Smart Book Light — reading lamp / clip light
        ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80", "Smart Book Light"]
    ];

    console.log('🔄 Updating product images...\n');
    let success = 0, failed = 0;

    for (const [url, name] of updates) {
        const [result] = await connection.execute(
            'UPDATE products SET image_url = ? WHERE product_name = ?',
            [url, name]
        );
        if (result.affectedRows > 0) {
            console.log(`  ✅ ${name}`);
            success++;
        } else {
            console.log(`  ⚠️  Not found in DB: ${name}`);
            failed++;
        }
    }

    console.log(`\n✨ Done! ${success} updated, ${failed} not found.`);
    await connection.end();
}

applyUpdates().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
