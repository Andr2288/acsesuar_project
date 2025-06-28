-- extended_database.sql
-- Розширена схема бази даних з додатковими полями

-- Використовуємо базу
USE acsesuar;

-- Розширюємо таблицю products додатковими полями
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.5,
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags JSON,
ADD COLUMN IF NOT EXISTS specifications JSON;

-- Додаємо таблицю для відгуків
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Додаємо таблицю для категорій
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_path VARCHAR(255),
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Вставляємо основні категорії
INSERT IGNORE INTO categories (name, description) VALUES
('electronics', 'Electronic devices and gadgets'),
('accessories', 'Phone and device accessories'),
('cables', 'Various types of cables and connectors'),
('cases', 'Protective cases for devices'),
('chargers', 'Charging solutions and power adapters'),
('audio', 'Headphones, speakers, and audio equipment'),
('computer', 'Computer accessories and peripherals'),
('smart-home', 'Smart home devices and automation'),
('fitness', 'Fitness trackers and sport accessories'),
('automotive', 'Car accessories and electronics');

-- Додаємо таблицю для знижок та промокодів
CREATE TABLE IF NOT EXISTS discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Додаємо деякі промокоди
INSERT IGNORE INTO discounts (code, type, value, min_order_amount, max_uses) VALUES
('SAVE10', 'percentage', 10.00, 50.00, 100),
('WELCOME20', 'percentage', 20.00, 30.00, 50),
('FREESHIP', 'fixed', 5.99, 25.00, NULL);

-- Додаємо таблицю для улюблених товарів
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_favorite (user_id, product_id)
);

-- Додаємо таблицю для історії переглядів
CREATE TABLE IF NOT EXISTS product_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    product_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Оновлюємо існуючі товари з додатковими даними
UPDATE products SET 
    stock = FLOOR(RAND() * 200) + 50,
    rating = ROUND(3.5 + RAND() * 1.5, 1),
    reviews_count = FLOOR(RAND() * 100) + 10,
    featured = (RAND() > 0.8)
WHERE stock IS NULL OR stock = 100;

-- Додаємо бренди для існуючих товарів
UPDATE products SET brand = 
    CASE 
        WHEN name LIKE '%iPhone%' OR name LIKE '%Apple%' THEN 'Apple'
        WHEN name LIKE '%Samsung%' THEN 'Samsung'
        WHEN name LIKE '%Google%' THEN 'Google'
        WHEN name LIKE '%AirPods%' THEN 'Apple'
        WHEN category = 'audio' THEN 
            CASE FLOOR(RAND() * 4)
                WHEN 0 THEN 'Sony'
                WHEN 1 THEN 'Bose'
                WHEN 2 THEN 'JBL'
                ELSE 'Beats'
            END
        WHEN category = 'computer' THEN
            CASE FLOOR(RAND() * 4)
                WHEN 0 THEN 'Logitech'
                WHEN 1 THEN 'Razer'
                WHEN 2 THEN 'Corsair'
                ELSE 'SteelSeries'
            END
        WHEN category = 'chargers' THEN
            CASE FLOOR(RAND() * 3)
                WHEN 0 THEN 'Anker'
                WHEN 1 THEN 'Belkin'
                ELSE 'Aukey'
            END
        ELSE 
            CASE FLOOR(RAND() * 5)
                WHEN 0 THEN 'Generic'
                WHEN 1 THEN 'TechGear'
                WHEN 2 THEN 'ProCase'
                WHEN 3 THEN 'EliteHub'
                ELSE 'PowerMax'
            END
    END
WHERE brand IS NULL;

-- Додаємо теги для товарів
UPDATE products SET tags = JSON_ARRAY(
    CASE category
        WHEN 'electronics' THEN 'electronics'
        WHEN 'accessories' THEN 'accessories' 
        WHEN 'cables' THEN 'connectivity'
        WHEN 'cases' THEN 'protection'
        WHEN 'chargers' THEN 'power'
        WHEN 'audio' THEN 'sound'
        WHEN 'computer' THEN 'computing'
        WHEN 'smart-home' THEN 'smart'
        WHEN 'fitness' THEN 'health'
        WHEN 'automotive' THEN 'automotive'
        ELSE 'general'
    END,
    'popular',
    CASE WHEN featured = 1 THEN 'featured' ELSE 'standard' END
) WHERE tags IS NULL;

-- Створюємо індекси для кращої продуктивності
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON cart(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, createdAt);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

-- Створюємо view для популярних товарів
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.*,
    COALESCE(pv.view_count, 0) as view_count,
    COALESCE(oi.order_count, 0) as order_count
FROM products p
LEFT JOIN (
    SELECT product_id, COUNT(*) as view_count
    FROM product_views
    WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY product_id
) pv ON p.id = pv.product_id
LEFT JOIN (
    SELECT product_id, COUNT(*) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY product_id
) oi ON p.id = oi.product_id
ORDER BY (COALESCE(pv.view_count, 0) + COALESCE(oi.order_count, 0) * 5) DESC;

-- Статистика по завершенню
SELECT 
    'База даних успішно розширена!' as message,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM discounts) as total_discounts;