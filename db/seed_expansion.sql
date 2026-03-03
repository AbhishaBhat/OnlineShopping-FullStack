-- Expansion Seed Data for Online Shopping App

-- 1. New Categories
INSERT INTO categories (category_name, description) VALUES
('Beauty & Personal Care', 'Skincare, makeup, and wellness'),
('Sports & Outdoors', 'Athletic gear and outdoor equipment'),
('Toys & Games', 'Fun for all ages'),
('Books', 'Bestsellers, fiction, and educational'),
('Automotive', 'Car accessories and maintenance');

-- 2. More Products for Existing Categories (ID 1: Electronics, 2: Fashion, 3: Home & Kitchen)
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
-- Electronics (ID 1)
('Wireless Earbuds', 'Noise-cancelling bluetooth earbuds', 129.99, 100, 1),
('Smart Watch', 'Fitness tracker and notification hub', 199.50, 80, 1),
('Tablet Pro', '11-inch high-res display for creators', 799.00, 45, 1),
-- Fashion (ID 2)
('Blue Denim Jeans', 'Classic straight-fit denim jeans', 49.95, 150, 2),
('Winter Jacket', 'Warm insulated puffer jacket', 89.00, 60, 2),
('Running Shoes', 'Breathable mesh lightweight shoes', 65.00, 120, 2),
('Silk Scarf', 'Premium hand-painted silk scarf', 25.00, 200, 2),
-- Home & Kitchen (ID 3)
('Air Fryer', 'Healthy oil-free cooking appliance', 119.99, 70, 3),
('Knife Set', 'Professional 7-piece stainless steel set', 149.00, 30, 3),
('Ceramic Vase', 'Minimalist hand-crafted decor', 35.00, 90, 3),
('Memory Foam Pillow', 'Ergonomic support for better sleep', 45.00, 110, 3);

-- 3. Products for New Categories (IDs 4-8)
-- Category 4: Beauty & Personal Care
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
('Vitamin C Serum', 'Brightening facial serum for glowing skin', 24.99, 150, 4),
('Matte Lipstick', 'Long-lasting vibrant red lipstick', 15.00, 200, 4),
('Hair Dryer Pro', 'Ionic hair dryer with multiple settings', 55.00, 80, 4),
('Scented Candle', 'Lavender and vanilla calming aroma', 18.00, 300, 4),
('Electric Toothbrush', 'Gentle cleaning with pressure sensors', 45.00, 120, 4);

-- Category 5: Sports & Outdoors
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
('Yoga Mat', 'Non-slip eco-friendly exercise mat', 29.99, 200, 5),
('Dumbbell Set', 'Adjustable 20kg weight set', 75.00, 50, 5),
('Camping Tent', '2-person waterproof dome tent', 120.00, 30, 5),
('Basketball', 'Official size and weight outdoor ball', 25.00, 100, 5),
('Hydro Flask', 'Insulated vacuum stainless steel bottle', 35.00, 150, 5);

-- Category 6: Toys & Games
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
('Building Blocks', 'Creative 500-piece plastic blocks', 39.99, 100, 6),
('RC Race Car', 'High-speed remote control sports car', 45.00, 60, 6),
('Board Game', 'Strategy game for 2-4 players', 30.00, 150, 6),
('Stuffed Bear', 'Soft 12-inch plush teddy bear', 20.00, 250, 6),
('Chess Set', 'Magnetic folding travel chess set', 15.00, 120, 6);

-- Category 7: Books
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
('The Great Narrative', 'Modern fiction about society and tech', 19.99, 300, 7),
('Recipe Book', '101 quick and healthy meal ideas', 25.00, 200, 7),
('Classic Literature', 'Premium collection of 19th-century works', 35.00, 100, 7),
('Programming Guide', 'Master Javascript in 30 days', 45.00, 150, 7),
('Kids Fairy Tales', 'Illustrated stories for children', 15.00, 400, 7);

-- Category 8: Automotive
INSERT INTO products (product_name, description, price, stock, category_id) VALUES
('Dash Cam', '1080p car dashboard camera', 59.99, 80, 8),
('Car Vacuum', 'Portable high-suction interior cleaner', 35.00, 120, 8),
('Leather Seat Covers', 'Universal fit waterproof covers', 89.00, 40, 8),
('Air Purifier', 'USB-powered car air freshener', 20.00, 200, 8),
('Bluetooth FM Transmitter', 'Hands-free calling and music player', 15.00, 150, 8);
