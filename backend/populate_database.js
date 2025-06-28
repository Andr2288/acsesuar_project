// populate_database.js
// Скрипт для заповнення бази даних товарами з фото з Unsplash

const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Підключення до бази даних
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'acsesuar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Unsplash Access Key (безкоштовний)
const UNSPLASH_ACCESS_KEY = 'ehyzecrCbLDxgeX84t7uQysvQt4UMeFaAY6L3wDynVo';

// Товари для додавання
const products = [
    // Телефони та аксесуари
    { name: 'iPhone 15 Pro Case', description: 'Premium protective case for iPhone 15 Pro with military-grade protection', price: 29.99, category: 'cases', searchTerm: 'iphone case' },
    { name: 'Samsung Galaxy S24 Case', description: 'Sleek and durable case for Samsung Galaxy S24 series', price: 24.99, category: 'cases', searchTerm: 'phone case' },
    { name: 'Wireless Charging Pad', description: 'Fast wireless charging pad compatible with all Qi-enabled devices', price: 39.99, category: 'chargers', searchTerm: 'wireless charger' },
    { name: 'USB-C to Lightning Cable', description: 'High-speed charging cable with durable braided design', price: 19.99, category: 'cables', searchTerm: 'usb cable' },
    { name: 'Phone Ring Holder', description: 'Adjustable ring holder and stand for secure grip', price: 8.99, category: 'accessories', searchTerm: 'phone ring' },
    
    // Навушники та аудіо
    { name: 'AirPods Pro Alternative', description: 'High-quality wireless earbuds with noise cancellation', price: 89.99, category: 'audio', searchTerm: 'wireless earbuds' },
    { name: 'Bluetooth Headphones', description: 'Over-ear headphones with premium sound quality', price: 129.99, category: 'audio', searchTerm: 'bluetooth headphones' },
    { name: 'Gaming Headset', description: 'Professional gaming headset with surround sound', price: 79.99, category: 'audio', searchTerm: 'gaming headset' },
    { name: 'Portable Speaker', description: 'Waterproof Bluetooth speaker with 360° sound', price: 59.99, category: 'audio', searchTerm: 'bluetooth speaker' },
    
    // Комп'ютерні аксесуари
    { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard for gaming and productivity', price: 149.99, category: 'computer', searchTerm: 'mechanical keyboard' },
    { name: 'Wireless Gaming Mouse', description: 'High-precision wireless mouse with customizable buttons', price: 69.99, category: 'computer', searchTerm: 'gaming mouse' },
    { name: 'USB-C Hub', description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card slots', price: 49.99, category: 'computer', searchTerm: 'usb hub' },
    { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand for ergonomic setup', price: 34.99, category: 'computer', searchTerm: 'laptop stand' },
    { name: 'Webcam HD', description: 'Full HD webcam with auto-focus for video calls', price: 79.99, category: 'computer', searchTerm: 'webcam' },
    
    // Зарядні пристрої
    { name: 'Power Bank 20000mAh', description: 'High-capacity power bank with fast charging support', price: 45.99, category: 'chargers', searchTerm: 'power bank' },
    { name: 'Car Charger', description: 'Dual USB car charger with fast charging technology', price: 16.99, category: 'chargers', searchTerm: 'car charger' },
    { name: 'Wall Charger 65W', description: 'GaN technology wall charger for laptops and phones', price: 54.99, category: 'chargers', searchTerm: 'wall charger' },
    { name: 'Charging Station', description: 'Multi-device charging station for phones, tablets, and watches', price: 89.99, category: 'chargers', searchTerm: 'charging station' },
    
    // Кабелі
    { name: 'HDMI Cable 4K', description: '4K HDMI cable with high-speed data transfer', price: 24.99, category: 'cables', searchTerm: 'hdmi cable' },
    { name: 'Ethernet Cable', description: 'Cat 8 ethernet cable for ultra-fast internet connection', price: 18.99, category: 'cables', searchTerm: 'ethernet cable' },
    { name: 'Audio Jack Cable', description: '3.5mm audio cable with gold-plated connectors', price: 12.99, category: 'cables', searchTerm: 'audio cable' },
    
    // Чохли та захист
    { name: 'Laptop Sleeve', description: 'Waterproof laptop sleeve with premium padding', price: 28.99, category: 'cases', searchTerm: 'laptop sleeve' },
    { name: 'Tablet Case', description: 'Folio case with keyboard for 10-inch tablets', price: 39.99, category: 'cases', searchTerm: 'tablet case' },
    { name: 'Screen Protector', description: 'Tempered glass screen protector with anti-fingerprint coating', price: 14.99, category: 'accessories', searchTerm: 'screen protector' },
    
    // Розумний дім
    { name: 'Smart LED Strip', description: 'WiFi-controlled RGB LED strip with voice control', price: 32.99, category: 'smart-home', searchTerm: 'led strip' },
    { name: 'Smart Plug', description: 'WiFi smart plug with energy monitoring', price: 15.99, category: 'smart-home', searchTerm: 'smart plug' },
    { name: 'Security Camera', description: 'Wireless security camera with night vision', price: 89.99, category: 'smart-home', searchTerm: 'security camera' },
    
    // Фітнес та спорт
    { name: 'Fitness Tracker', description: 'Waterproof fitness tracker with heart rate monitor', price: 59.99, category: 'fitness', searchTerm: 'fitness tracker' },
    { name: 'Sport Earbuds', description: 'Sweat-proof wireless earbuds for workouts', price: 49.99, category: 'fitness', searchTerm: 'sport earbuds' },
    { name: 'Phone Armband', description: 'Adjustable armband for phones during exercise', price: 13.99, category: 'fitness', searchTerm: 'phone armband' },
    
    // Автомобільні аксесуари
    { name: 'Car Phone Mount', description: 'Magnetic car phone mount with 360° rotation', price: 22.99, category: 'automotive', searchTerm: 'car phone mount' },
    { name: 'Dash Cam', description: 'Full HD dash cam with loop recording', price: 79.99, category: 'automotive', searchTerm: 'dash cam' },
    { name: 'Bluetooth FM Transmitter', description: 'Wireless FM transmitter with hands-free calling', price: 25.99, category: 'automotive', searchTerm: 'fm transmitter' }
];

// Функція для завантаження фото з Unsplash
async function downloadImage(searchTerm, filename) {
    try {
        if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
            console.log(`Пропускаємо завантаження фото для ${searchTerm} (немає Unsplash API ключа)`);
            return null;
        }

        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: {
                query: searchTerm,
                per_page: 1,
                orientation: 'landscape'
            },
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (response.data.results.length > 0) {
            const imageUrl = response.data.results[0].urls.regular;
            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const imagePath = path.join(uploadDir, filename);
            const writer = fs.createWriteStream(imagePath);
            imageResponse.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(`uploads/${filename}`));
                writer.on('error', reject);
            });
        }
    } catch (error) {
        console.error(`Помилка завантаження фото для ${searchTerm}:`, error.message);
    }
    return null;
}

// Головна функція
async function populateDatabase() {
    try {
        console.log('🚀 Починаємо заповнення бази даних...');
        
        // Очищуємо існуючі товари (крім тих, що створені адміном)
        console.log('🧹 Очищуємо старі тестові товари...');
        await pool.execute('DELETE FROM products WHERE description LIKE "%test%" OR name LIKE "%Sample%"');
        
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log(`📦 Обробляємо товар ${i + 1}/${products.length}: ${product.name}`);
            
            try {
                // Завантажуємо фото
                const imagePath = await downloadImage(
                    product.searchTerm, 
                    `product_${Date.now()}_${i}.jpg`
                );

                // Додаємо товар до бази
                await pool.execute(
                    'INSERT INTO products (name, description, price, category, imagePath) VALUES (?, ?, ?, ?, ?)',
                    [product.name, product.description, product.price, product.category, imagePath]
                );

                successCount++;
                console.log(`  ✅ Успішно додано: ${product.name}`);
                
                // Невелика затримка, щоб не перевантажити API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                errorCount++;
                console.log(`  ❌ Помилка з товаром ${product.name}:`, error.message);
            }
        }

        console.log('\n🎉 Завершено!');
        console.log(`✅ Успішно додано: ${successCount} товарів`);
        console.log(`❌ Помилок: ${errorCount}`);
        
        // Показуємо статистику
        const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM products');
        console.log(`📊 Загальна кількість товарів у базі: ${countResult[0].total}`);
        
        const [categoryStats] = await pool.execute(`
            SELECT category, COUNT(*) as count 
            FROM products 
            WHERE category IS NOT NULL 
            GROUP BY category 
            ORDER BY count DESC
        `);
        
        console.log('\n📈 Статистика по категоріях:');
        categoryStats.forEach(stat => {
            console.log(`  ${stat.category}: ${stat.count} товарів`);
        });

    } catch (error) {
        console.error('❌ Критична помилка:', error);
    } finally {
        await pool.end();
        console.log("\n🔚 З'єднання з базою даних закрито");
    }
}

// Запускаємо скрипт
if (require.main === module) {
    populateDatabase();
}

module.exports = { populateDatabase };