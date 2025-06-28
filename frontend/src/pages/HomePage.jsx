import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ShoppingCart, Grid, List } from "lucide-react";
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

    // Get unique categories
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

    // Filter and sort products
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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card bg-base-100 shadow-xl animate-pulse">
                            <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                            <div className="card-body">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="hero min-h-[400px] bg-gradient-to-r from-primary to-secondary rounded-lg mb-8">
                <div className="hero-content text-center text-primary-content">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold">Вітаємо в AcsesuarStore</h1>
                        <p className="mb-5">
                            Знайдіть найкращі аксесуари для ваших пристроїв. Якісні товари за чудовими цінами!
                        </p>
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title text-primary-content opacity-75">Всього товарів</div>
                                <div className="stat-value text-primary-content">{products.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Фільтри та пошук */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Верхній ряд - пошук */}
                    <div className="form-control">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Пошук товарів..."
                                className="input input-bordered flex-1"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-square">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Нижній ряд - фільтри та сортування */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Фільтр категорій */}
                        <div className="form-control w-full lg:w-auto">
                            <select
                                className="select select-bordered"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Всі категорії</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Сортування */}
                        <div className="form-control w-full lg:w-auto">
                            <select
                                className="select select-bordered"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="name-asc">Назва А-Я</option>
                                <option value="name-desc">Назва Я-А</option>
                                <option value="price-asc">Ціна: від дешевих</option>
                                <option value="price-desc">Ціна: від дорогих</option>
                                <option value="category-asc">Категорія А-Я</option>
                            </select>
                        </div>

                        {/* Режим перегляду */}
                        <div className="join">
                            <button
                                className={`btn join-item ${viewMode === 'grid' ? 'btn-active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Сітка"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                className={`btn join-item ${viewMode === 'list' ? 'btn-active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="Список"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Скидання фільтрів */}
                        {(searchTerm || selectedCategory) && (
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("");
                                }}
                            >
                                Скинути фільтри
                            </button>
                        )}

                        {/* Результати пошуку */}
                        <div className="text-sm text-gray-600 lg:ml-auto">
                            Знайдено: {filteredAndSortedProducts.length} товарів
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div id="products-section">
                {viewMode === 'grid' ? (
                    // Grid View
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
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            Без зображення
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
                    // List View
                    <div className="space-y-4 mb-8">
                        {paginatedProducts.map(product => (
                            <div key={product.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="card-body">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Image */}
                                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {product.imagePath ? (
                                                <img
                                                    src={`http://localhost:5000/${product.imagePath}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    Без зображення
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                                                    {product.category && (
                                                        <div className="badge badge-secondary badge-sm mb-2">
                                                            {product.category}
                                                        </div>
                                                    )}
                                                    {product.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-col lg:items-end gap-3">
                                                    <span className="text-2xl font-bold text-primary">
                                                        ${product.price}
                                                    </span>
                                                    <div className="flex gap-2">
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Товарів не знайдено</h3>
                                <p className="text-gray-600 mb-6">
                                    Спробуйте змінити пошуковий запит або параметри фільтрації.
                                </p>
                                {(searchTerm || selectedCategory) && (
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("");
                                        }}
                                    >
                                        Скинути фільтри
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