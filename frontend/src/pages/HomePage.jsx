import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShoppingCart, Grid, List, Star, Zap, Shield, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../store/useProductStore.js";
import { useCartStore } from "../store/useCartStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import Pagination from "../components/Pagination.jsx";

const HomePage = () => {
    const { products, fetchProducts, isLoading } = useProductStore();
    const { addToCart, isUpdating } = useCartStore();
    const { authUser } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    // Стан для пагінації
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState("grid"); // grid або list

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Отримуємо унікальні категорії
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

    // Фільтруємо та сортуємо товари
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Сортування
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'price':
                    aValue = parseFloat(a.price);
                    bValue = parseFloat(b.price);
                    break;
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'category':
                    aValue = a.category || '';
                    bValue = b.category || '';
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === "asc") {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

    // Товари для поточної сторінки
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedProducts.slice(startIndex, endIndex);
    }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

    // Загальна кількість сторінок
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

    // Перевіряємо, чи поточна сторінка не перевищує загальну кількість сторінок
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // Скидання на першу сторінку при зміні фільтрів
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortBy, sortOrder, itemsPerPage]);

    const handleAddToCart = async (productId) => {
        if (!authUser) {
            toast.error("Будь ласка, увійдіть в систему для додавання товарів до кошика");
            return;
        }
        await addToCart(productId, 1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Прокрутка до початку списку товарів
        document.getElementById('products-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        // Обчислюємо поточний індекс першого елемента на сторінці
        const currentFirstItemIndex = (currentPage - 1) * itemsPerPage;

        // Обчислюємо нову сторінку для збереження позиції
        const newPage = Math.floor(currentFirstItemIndex / newItemsPerPage) + 1;

        setItemsPerPage(newItemsPerPage);
        setCurrentPage(newPage);
    };

    // Статистика для Hero секції
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const avgPrice = products.length > 0 ?
        (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(0) : 0;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Hero Skeleton */}
                <div className="h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-8 animate-pulse"></div>

                {/* Filter Panel Skeleton */}
                <div className="bg-gray-200 rounded-2xl p-8 mb-8 animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                    <div className="h-12 bg-gray-300 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-300 rounded"></div>
                        ))}
                    </div>
                </div>

                {/* Products Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse overflow-hidden">
                            <div className="h-48 bg-gray-300"></div>
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                                    <div className="flex gap-2">
                                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                                        <div className="h-8 bg-gray-300 rounded w-8"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-full">
                        <span className="loading loading-spinner loading-md text-blue-600"></span>
                        <p className="text-blue-700 font-medium">Завантаження товарів...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Розширена Hero секція */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-blue-800 to-indigo-900 rounded-2xl mb-8 shadow-2xl">
                {/* Фоновий патерн */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>
                </div>

                <div className="relative z-10 hero min-h-[500px]">
                    <div className="hero-content text-center text-white max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                            {/* Лівий бік - Основний контент */}
                            <div className="text-left lg:text-left space-y-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                                        <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                                        Нові надходження щотижня
                                    </div>

                                    <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                                        Світ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">аксесуарів</span>
                                        <br />для ваших пристроїв
                                    </h1>

                                    <p className="text-xl text-gray-200 leading-relaxed max-w-lg">
                                        Відкрийте для себе преміальні аксесуари, що поєднують стиль і функціональність.
                                        Від захисних чохлів до зарядних пристроїв – все для вашого цифрового життя.
                                    </p>
                                </div>

                                {/* Кнопки CTA */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn btn-lg bg-gradient-to-r from-cyan-500 to-blue-500 border-0 text-white hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-xl"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Переглянути каталог
                                    </button>

                                    {!authUser && (
                                        <Link
                                            to="/signup"
                                            className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white hover:text-slate-800 transition-all duration-200"
                                        >
                                            Приєднатися безкоштовно
                                        </Link>
                                    )}
                                </div>

                                {/* Особливості */}
                                <div className="grid grid-cols-3 gap-4 pt-6">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-2">
                                            <Shield className="w-8 h-8 text-green-400" />
                                        </div>
                                        <div className="text-sm text-gray-300">Гарантія якості</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-2">
                                            <Truck className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div className="text-sm text-gray-300">Швидка доставка</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex justify-center mb-2">
                                            <Star className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <div className="text-sm text-gray-300">Преміум якість</div>
                                    </div>
                                </div>
                            </div>

                            {/* Правий бік - Статистика та інформація */}
                            <div className="space-y-6">
                                {/* Основна статистика */}
                                <div className="stats shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <div className="stat text-center">
                                        <div className="stat-title text-gray-300">Товарів у каталозі</div>
                                        <div className="stat-value text-white">{totalProducts}</div>
                                        <div className="stat-desc text-cyan-300">Постійно поповнюємо</div>
                                    </div>
                                </div>

                                {/* Додаткова статистика */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="stats shadow-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                        <div className="stat text-center py-4">
                                            <div className="stat-value text-2xl text-blue-400">{totalCategories}</div>
                                            <div className="stat-title text-gray-300 text-xs">Категорій</div>
                                        </div>
                                    </div>

                                    <div className="stats shadow-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                        <div className="stat text-center py-4">
                                            <div className="stat-value text-2xl text-green-400">${avgPrice}</div>
                                            <div className="stat-title text-gray-300 text-xs">Середня ціна</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Перегляд популярних категорій */}
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                    <h3 className="text-lg font-semibold mb-3 text-white">Популярні категорії</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.slice(0, 6).map((category, index) => (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="badge badge-lg bg-white/10 text-gray-200 border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Анімовані елементи */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-20 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
            </div>

            {/* Покращена панель фільтрів та пошуку */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                {/* Заголовок панелі */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Знайти товари</h2>
                        <p className="text-gray-600">Використовуйте фільтри для швидкого пошуку</p>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                        <Filter className="w-4 h-4" />
                        <span>Результатів: <span className="font-semibold text-blue-600">{filteredAndSortedProducts.length}</span></span>
                    </div>
                </div>

                {/* Пошукова строка */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Що ви шукаєте? Введіть назву товару або опис..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setSearchTerm("")}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Фільтри та налаштування */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    {/* Категорії */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Категорія товарів
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">🏷️ Всі категорії</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    📦 {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Сортування */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Сортування
                        </label>
                        <select
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none cursor-pointer"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                        >
                            <option value="name-asc">📝 Назва А-Я</option>
                            <option value="name-desc">📝 Назва Я-А</option>
                            <option value="price-asc">💰 Ціна ↗️</option>
                            <option value="price-desc">💰 Ціна ↘️</option>
                            <option value="category-asc">📂 Категорія А-Я</option>
                        </select>
                    </div>

                    {/* Режим перегляду */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Відображення
                        </label>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                            <button
                                className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm font-medium ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setViewMode('grid')}
                                title="Сітка"
                            >
                                <Grid className="w-4 h-4" />
                                Сітка
                            </button>
                            <button
                                className={`flex-1 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm font-medium ${
                                    viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setViewMode('list')}
                                title="Список"
                            >
                                <List className="w-4 h-4" />
                                Список
                            </button>
                        </div>
                    </div>

                    {/* Дії */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Дії
                        </label>
                        {(searchTerm || selectedCategory) ? (
                            <button
                                className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("");
                                }}
                            >
                                🔄 Скинути
                            </button>
                        ) : (
                            <div className="w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-medium text-center border-2 border-dashed border-gray-300">
                                Фільтри не активні
                            </div>
                        )}
                    </div>
                </div>

                {/* Активні фільтри */}
                {(searchTerm || selectedCategory) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600">Активні фільтри:</span>
                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    🔍 "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    📦 {selectedCategory}
                                    <button
                                        onClick={() => setSelectedCategory("")}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Секція товарів */}
            <div id="products-section">
                {viewMode === 'grid' ? (
                    // Вид сітки
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                        {paginatedProducts.map(product => (
                            <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <figure className="h-48 bg-gray-100">
                                    {product.imagePath ? (
                                        <img
                                            src={`http://localhost:5000/${product.imagePath}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                                            <div className="text-center">
                                                <div className="text-3xl mb-1">📦</div>
                                                <div className="text-xs">Без фото</div>
                                            </div>
                                        </div>
                                    )}
                                </figure>

                                <div className="card-body">
                                    <h2 className="card-title text-sm">
                                        {product.name}
                                        {product.category && (
                                            <div className="badge badge-secondary badge-sm">
                                                {product.category}
                                            </div>
                                        )}
                                    </h2>

                                    {product.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-lg font-bold text-primary">
                                            ${product.price}
                                        </span>

                                        <div className="card-actions">
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="btn btn-sm btn-outline"
                                            >
                                                Переглянути
                                            </Link>
                                            {authUser && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleAddToCart(product.id)}
                                                    disabled={isUpdating}
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Вид списку
                    <div className="space-y-6 mb-8">
                        {paginatedProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Зображення */}
                                        <div className="w-full md:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group">
                                            {product.imagePath ? (
                                                <img
                                                    src={`http://localhost:5000/${product.imagePath}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-1">📦</div>
                                                        <div className="text-xs">Без фото</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Контент */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col lg:flex-row lg:items-start gap-4 h-full">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <h3 className="text-xl font-bold text-gray-800 leading-tight flex-1">
                                                            {product.name}
                                                        </h3>
                                                        {product.category && (
                                                            <div className="badge bg-blue-100 text-blue-800 border-0 px-3 py-1">
                                                                📦 {product.category}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {product.description && (
                                                        <p className="text-gray-600 line-clamp-2 leading-relaxed">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col lg:items-end gap-4 lg:text-right">
                                                    <span className="text-3xl font-bold text-blue-600">
                                                        ${product.price}
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className="btn btn-outline hover:btn-primary transition-all duration-200 flex-1 lg:flex-none"
                                                        >
                                                            👁️ Переглянути
                                                        </Link>
                                                        {authUser && (
                                                            <button
                                                                className="btn btn-primary hover:btn-primary-focus transition-all duration-200 flex-1 lg:flex-none"
                                                                onClick={() => handleAddToCart(product.id)}
                                                                disabled={isUpdating}
                                                            >
                                                                <ShoppingCart className="w-4 h-4" />
                                                                Додати
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Повідомлення про відсутність товарів */}
                {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Товарів не знайдено</h3>
                                <p className="text-gray-600 mb-6 max-w-md">
                                    На жаль, за вашим запитом товарів не знайдено. Спробуйте змінити параметри пошуку або скиньте фільтри.
                                </p>
                                {(searchTerm || selectedCategory) && (
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("");
                                        }}
                                    >
                                        🔄 Скинути всі фільтри
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Пагінація */}
                {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredAndSortedProducts.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;