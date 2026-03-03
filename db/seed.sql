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

INSERT INTO products (product_name, description, price, stock, category_id) VALUES
-- Electronics (ID 1)
('Smartphone X1', 'Latest 5G smartphone with stunning camera', 699.99, 50, 1),
('Neo-Glass Laptop', 'Slim, powerful, sleek glass-finish pro laptop', 1249.99, 30, 1),
('Wireless Earbuds', 'Noise-canceling premium sound', 149.50, 100, 1),
('Smartwatch Pro', 'Health tracking and always-on display', 199.99, 80, 1),
('PowerPad Tablet', 'Versatile tablet for work and play', 499.00, 45, 1),

-- Fashion (ID 2)
('Graphic T-Shirt', 'Premium cotton casual oversized tee', 24.99, 200, 2),
('Designer Jeans', 'Slim-fit stretch denim for daily wear', 59.90, 120, 2),
('Winter Bomber', 'Lined warm jacket with modern aesthetic', 89.99, 60, 2),
('Tech Runners', 'Ultra-comfortable city walking shoes', 75.00, 90, 2),
('Polarized Shades', 'Sleek UV-protection sunglasses', 45.00, 150, 2),

-- Home & Kitchen (ID 3)
('Drip Master Coffee', 'Automatic programmable coffee brewer', 79.99, 40, 3),
('Blender Max 500', 'High-speed professional food processor', 120.00, 25, 3),
('Smart Air Fryer', 'Low-oil digital easy-cooking system', 110.00, 35, 3),
('Cast Iron Skillet', 'Heavy-duty pre-seasoned cooking pan', 45.99, 80, 3),
('Electric Kettle', 'Rapid-boil stainless steel kettle', 34.50, 60, 3),

-- Beauty & Personal Care (ID 4)
('Velvet Glow Kit', 'Premium skincare set for face and body', 65.00, 100, 4),
('Oud Royal Perfume', 'Long-lasting signature luxury fragrance', 85.00, 50, 4),
('Sonic Pro Dryer', 'High-speed ion hair drying technology', 129.00, 30, 4),
('Matte Finish Palette', 'Vibrant eyeshadow and contour kit', 39.99, 200, 4),
('Grooming Pro Set', 'Electric trimmer with precision attachments', 55.00, 75, 4),

-- Sports & Outdoors (ID 5)
('Aero Yoga Mat', 'Non-slip extra thick comfort mat', 29.50, 150, 5),
('Active Dumbbell Pair', 'Adjustable weights for home workout', 49.99, 40, 5),
('Summit Backpack', 'Water-resistant hiking and travel bag', 65.00, 80, 5),
('Match Football 2.0', 'Durable pro-surface training ball', 25.00, 300, 5),
('Graphite Racket', 'Lightweight pro-balance tennis racket', 110.00, 25, 5),

-- Books & Stationery (ID 6)
('The Galaxy Guide', 'Best-selling sci-fi epic novel', 18.99, 500, 6),
('Journal Pro Slate', 'Premium leather-bound archival notebook', 22.00, 250, 6),
('Precision Pen Set', 'Set of 5 gel pens for sleek writing', 15.00, 400, 6),
('Desk Organizer', 'Modular wooden stationery holder', 35.00, 70, 6),
('Smart Book Light', 'Clip-on adjustable LED reading lamp', 12.50, 150, 6);

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