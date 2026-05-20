-- Seed data for the full schema
INSERT INTO users (full_name, email, hashed_password, role, status) VALUES
('Admin User', 'admin@example.com', '$2b$10$7R9Ju97xX8lS6jHkK5k5Ke5k5k5k5k5k5k5k5k5k5k5k5k5k5', 'admin', 'active'),
('John Doe', 'john@example.com', '$2b$10$7R9Ju97xX8lS6jHkK5k5Ke5k5k5k5k5k5k5k5k5k5k5k5k5k', 'user', 'active');

INSERT INTO categories (category_name, description) VALUES
('Electronics', 'Gadgets and devices'),
('Fashion', 'Clothing and accessories'),
('Home & Kitchen', 'Home appliances and decor'),
('Beauty & Personal Care', 'Skincare, makeup, and grooming'),
('Sports & Outdoors', 'Fitness gear, outdoor equipment'),
('Books & Stationery', 'Must-reads, journals, and pens');

INSERT INTO products (product_name, description, price, stock, category_id, image_url) VALUES
-- Electronics (ID 1)
('Smartphone X1',    'Latest 5G smartphone with stunning camera',       699.99,  50,  1, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80'),
('Neo-Glass Laptop', 'Slim, powerful, sleek glass-finish pro laptop',   1249.99, 30,  1, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&q=80'),
('Wireless Earbuds', 'Noise-canceling premium sound',                   149.50,  100, 1, 'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=500&q=80'),
('Smartwatch Pro',   'Health tracking and always-on display',           199.99,  80,  1, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'),
('PowerPad Tablet',  'Versatile tablet for work and play',              499.00,  45,  1, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80'),

-- Fashion (ID 2)
('Graphic T-Shirt',   'Premium cotton casual oversized tee',             24.99,  200, 2, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80'),
('Designer Jeans',    'Slim-fit stretch denim for daily wear',           59.90,  120, 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80'),
('Winter Bomber',     'Lined warm jacket with modern aesthetic',         89.99,  60,  2, 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&q=80'),
('Tech Runners',      'Ultra-comfortable city walking shoes',            75.00,  90,  2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'),
('Polarized Shades',  'Sleek UV-protection sunglasses',                  45.00,  150, 2, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80'),

-- Home & Kitchen (ID 3)
('Drip Master Coffee', 'Automatic programmable coffee brewer',           79.99,  40,  3, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80'),
('Blender Max 500',    'High-speed professional food processor',        120.00,  25,  3, 'https://images.unsplash.com/photo-1570222083775-5374be1559ed?w=500&q=80'),
('Smart Air Fryer',    'Low-oil digital easy-cooking system',           110.00,  35,  3, 'https://images.unsplash.com/photo-1648569498978-4f7e1c1c8534?w=500&q=80'),
('Cast Iron Skillet',  'Heavy-duty pre-seasoned cooking pan',            45.99,  80,  3, 'https://images.unsplash.com/photo-1590159413203-085202613e5f?w=500&q=80'),
('Electric Kettle',    'Rapid-boil stainless steel kettle',              34.50,  60,  3, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80'),

-- Beauty & Personal Care (ID 4)
('Velvet Glow Kit',      'Premium skincare set for face and body',      65.00,  100, 4, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80'),
('Oud Royal Perfume',    'Long-lasting signature luxury fragrance',     85.00,  50,  4, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80'),
('Sonic Pro Dryer',      'High-speed ion hair drying technology',      129.00,  30,  4, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&q=80'),
('Matte Finish Palette', 'Vibrant eyeshadow and contour kit',           39.99,  200, 4, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80'),
('Grooming Pro Set',     'Electric trimmer with precision attachments', 55.00,  75,  4, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80'),

-- Sports & Outdoors (ID 5)
('Aero Yoga Mat',        'Non-slip extra thick comfort mat',            29.50,  150, 5, 'https://images.unsplash.com/photo-1601925228876-6d58b88b9809?w=500&q=80'),
('Active Dumbbell Pair', 'Adjustable weights for home workout',         49.99,  40,  5, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80'),
('Summit Backpack',      'Water-resistant hiking and travel bag',       65.00,  80,  5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'),
('Match Football 2.0',   'Durable pro-surface training ball',          25.00,  300, 5, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&q=80'),
('Graphite Racket',      'Lightweight pro-balance tennis racket',      110.00,  25,  5, 'https://images.unsplash.com/photo-1617083270696-0fa2efc0e58d?w=500&q=80'),

-- Books & Stationery (ID 6)
('The Galaxy Guide',   'Best-selling sci-fi epic novel',               18.99,  500, 6, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80'),
('Journal Pro Slate',  'Premium leather-bound archival notebook',      22.00,  250, 6, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80'),
('Precision Pen Set',  'Set of 5 gel pens for sleek writing',          15.00,  400, 6, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&q=80'),
('Desk Organizer',     'Modular wooden stationery holder',             35.00,  70,  6, 'https://images.unsplash.com/photo-1593642632599-35525a3f4578?w=500&q=80'),
('Smart Book Light',   'Clip-on adjustable LED reading lamp',          12.50,  150, 6, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80');

INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 1, 1),
(2, 3, 2);

INSERT INTO wishlist (user_id, product_id) VALUES
(2, 2);

INSERT INTO orders (user_id, total_amount, order_status, shipping_address, payment_method) VALUES
(2, 739.97, 'PLACED', '123 Main St, Anytown', 'Credit Card');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 699.99),
(1, 3, 2, 19.99);

INSERT INTO user_history (user_id, action) VALUES
(2, 'login'),
(2, 'add_to_cart:1');