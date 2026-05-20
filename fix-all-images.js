const mysql = require('mysql2/promise');
require('dotenv').config();

// Product-name based image map. This is safer than product_id because local
// demo databases can be reseeded or edited through the admin panel.
const imagesByProductName = {
  'Smartphone X1': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
  'Neo-Glass Laptop': 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
  'Wireless Earbuds': 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80',
  'Smartwatch Pro': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80',
  'PowerPad Tablet': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80',
  'Smart Watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'Tablet Pro': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',

  'Graphic T-Shirt': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
  'Designer Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
  'Winter Bomber': 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80',
  'Tech Runners': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Polarized Shades': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',
  'Blue Denim Jeans': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80',
  'Winter Jacket': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  'Running Shoes': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
  'Silk Scarf': 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',

  'Drip Master Coffee': 'https://images.unsplash.com/photo-1517668808822-9ebe0212a36c?w=600&q=80',
  'Blender Max 500': 'https://images.unsplash.com/photo-1570222083775-5374be1559ed?w=600&q=80',
  'Smart Air Fryer': 'https://images.unsplash.com/photo-1648569498978-4f7e1c1c8534?w=600&q=80',
  'Cast Iron Skillet': 'https://images.unsplash.com/photo-1590159413203-085202613e5f?w=600&q=80',
  'Electric Kettle': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
  'Air Fryer': 'https://images.unsplash.com/photo-1648569498978-4f7e1c1c8534?w=600&q=80',
  'Knife Set': 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&q=80',
  'Ceramic Vase': 'https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=600&q=80',
  'Memory Foam Pillow': 'https://images.unsplash.com/photo-1631048500765-3a5e1dfbf76a?w=600&q=80',

  'Velvet Glow Kit': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
  'Oud Royal Perfume': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
  'Sonic Pro Dryer': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80',
  'Matte Finish Palette': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
  'Grooming Pro Set': 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80',
  'Vitamin C Serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  'Matte Lipstick': 'https://images.unsplash.com/photo-1586495777744-4e6232bf2176?w=600&q=80',
  'Hair Dryer Pro': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80',
  'Scented Candle': 'https://images.unsplash.com/photo-1602874801006-e26f75e65d65?w=600&q=80',
  'Electric Toothbrush': 'https://images.unsplash.com/photo-1559839697-aa6a8fbe99a1?w=600&q=80',

  'Aero Yoga Mat': 'https://images.unsplash.com/photo-1601925228876-6d58b88b9809?w=600&q=80',
  'Active Dumbbell Pair': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  'Summit Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  'Match Football 2.0': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  'Graphite Racket': 'https://images.unsplash.com/photo-1617083270696-0fa2efc0e58d?w=600&q=80',
  'Yoga Mat': 'https://images.unsplash.com/photo-1592433051474-55440c6c74d3?w=600&q=80',
  'Dumbbell Set': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  'Camping Tent': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
  'Hydro Flask': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',

  'Building Blocks': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
  'RC Race Car': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80',
  'Board Game': 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&q=80',
  'Stuffed Bear': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Chess Set': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80',

  'The Galaxy Guide': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'Journal Pro Slate': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
  'Precision Pen Set': 'https://images.unsplash.com/photo-1585336139118-102a5204b722?w=600&q=80',
  'Desk Organizer': 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&q=80',
  'Smart Book Light': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
  'The Great Narrative': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  'Recipe Book': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
  'Classic Literature': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80',
  'Programming Guide': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
  'Kids Fairy Tales': 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=600&q=80',

  'Dash Cam': 'https://images.unsplash.com/photo-1615840287214-7cf424104bc9?w=600&q=80',
  'Car Vacuum': 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80',
  'Leather Seat Covers': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  'Air Purifier': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  'Bluetooth FM Transmitter': 'https://images.unsplash.com/photo-1606986628425-0e1f70ef4dc0?w=600&q=80'
};

async function fixAllImages() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Abhi@123',
    database: process.env.DB_NAME || 'online_shop',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  });

  console.log('Updating product images by product name...');
  let updated = 0;
  let missing = 0;

  for (const [name, url] of Object.entries(imagesByProductName)) {
    const [result] = await connection.execute(
      'UPDATE products SET image_url = ? WHERE product_name = ?',
      [url, name]
    );

    if (result.affectedRows > 0) {
      updated += result.affectedRows;
    } else {
      missing++;
      console.log(`Not found: ${name}`);
    }
  }

  const [emptyRows] = await connection.execute(
    `SELECT product_id, product_name
     FROM products
     WHERE image_url IS NULL OR TRIM(image_url) = ''
     ORDER BY product_name`
  );

  console.log(`Done. ${updated} rows updated. ${missing} mapped names were not in this DB.`);
  if (emptyRows.length) {
    console.log('Products still missing images:');
    emptyRows.forEach(row => console.log(`- [${row.product_id}] ${row.product_name}`));
  } else {
    console.log('All products now have image URLs.');
  }

  await connection.end();
}

fixAllImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
