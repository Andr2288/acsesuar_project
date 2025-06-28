import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Upload, X, Save, Image as ImageIcon, Search } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import Pagination from "../components/Pagination.jsx";
import toast from "react-hot-toast";

const AdminPage = () => {
    const {
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
    } = useProductStore();

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Стан для пагінації та фільтрації
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Фільтровані товари
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Фільтр пошуку
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(search) ||
                (product.description && product.description.toLowerCase().includes(search))
            );
        }

        // Фільтр категорії
        if (categoryFilter) {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        return filtered;
    }, [products, searchTerm, categoryFilter]);

    // Товари для поточної сторінки
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Загальна кількість сторінок
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Скидання на першу сторінку при зміні фільтрів
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, itemsPerPage]);

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            image: null,
        });
        setImagePreview(null);
        setEditingProduct(null);
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                category: product.category || "",
                image: null,
            });
            // Set current image as preview if exists
            if (product.imagePath) {
                setImagePreview(`http://localhost:5000/${product.imagePath}`);
            }
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });

        // Create preview
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.price) {
            toast.error("Назва та ціна є обов'язковими");
            return;
        }

        const productData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price),
            category: formData.category,
            image: formData.image,
        };

        let success;
        if (editingProduct) {
            success = await updateProduct(editingProduct.id, productData);
        } else {
            success = await createProduct(productData);
        }

        if (success) {
            handleCloseModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей товар?")) {
            await deleteProduct(id);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
    };

    const categories = [
        { value: "electronics", label: "Електроніка" },
        { value: "accessories", label: "Аксесуари" },
        { value: "cables", label: "Кабелі" },
        { value: "cases", label: "Чохли" },
        { value: "chargers", label: "Зарядні пристрої" },
        { value: "audio", label: "Аудіо" },
        { value: "computer", label: "Комп'ютерні аксесуари" },
        { value: "smart-home", label: "Розумний дім" },
        { value: "fitness", label: "Фітнес" },
        { value: "automotive", label: "Автомобільні" },
        { value: "other", label: "Інше" }
    ];

    // Отримуємо унікальні категорії з товарів
    const availableCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Панель адміністратора</h1>
                    <p className="text-gray-600 mt-1">
                        Управління товарами магазину ({filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : filteredProducts.length < 5 ? 'товари' : 'товарів'})
                    </p>
                </div>
                <button
                    className="btn btn-primary gap-2"
                    onClick={() => handleOpenModal()}
                >
                    <Plus className="w-5 h-5" />
                    Додати товар
                </button>
            </div>

            {/* Фільтри та пошук */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Пошук */}
                    <div className="form-control flex-1">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Пошук товарів за назвою або описом..."
                                className="input input-bordered flex-1"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-square">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Фільтр по категорії */}
                    <div className="form-control w-full lg:w-64">
                        <select
                            className="select select-bordered"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">Всі категорії</option>
                            {availableCategories.map(category => {
                                const categoryLabel = categories.find(cat => cat.value === category)?.label || category;
                                return (
                                    <option key={category} value={category}>
                                        {categoryLabel}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Скидання фільтрів */}
                    {(searchTerm || categoryFilter) && (
                        <button
                            className="btn btn-ghost"
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("");
                            }}
                        >
                            Скинути фільтри
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-gray-500">Завантаження товарів...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="font-semibold text-gray-700">Зображення</th>
                                <th className="font-semibold text-gray-700">Назва</th>
                                <th className="font-semibold text-gray-700">Категорія</th>
                                <th className="font-semibold text-gray-700">Ціна</th>
                                <th className="font-semibold text-gray-700">Дії</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td>
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.imagePath ? (
                                                <img
                                                    src={`http://localhost:5000/${product.imagePath}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="font-semibold text-gray-800">{product.name}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {product.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="badge badge-outline">
                                            {categories.find(cat => cat.value === product.category)?.label || product.category || "Не вказано"}
                                        </div>
                                    </td>
                                    <td className="font-bold text-green-600">${product.price}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline hover:btn-info"
                                                onClick={() => handleOpenModal(product)}
                                                disabled={isUpdating}
                                                title="Редагувати товар"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline hover:btn-error"
                                                onClick={() => handleDelete(product.id)}
                                                disabled={isDeleting}
                                                title="Видалити товар"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {filteredProducts.length === 0 && !isLoading && (
                            <div className="text-center py-16">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        {searchTerm || categoryFilter ? (
                                            <Search className="w-8 h-8 text-gray-400" />
                                        ) : (
                                            <Plus className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                            {searchTerm || categoryFilter ? "Товарів не знайдено" : "Товарів поки що немає"}
                                        </h3>
                                        <p className="text-gray-500">
                                            {searchTerm || categoryFilter
                                                ? "Спробуйте змінити пошуковий запит або фільтри"
                                                : "Додайте перший товар до вашого магазину!"
                                            }
                                        </p>
                                    </div>
                                    {searchTerm || categoryFilter ? (
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setCategoryFilter("");
                                            }}
                                        >
                                            Скинути фільтри
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Пагінація */}
                    {filteredProducts.length > 0 && (
                        <div className="border-t p-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredProducts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Покращене модальне вікно (залишається без змін) */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Заголовок модального вікна */}
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-100 pb-4 border-b">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">
                                    {editingProduct ? "Редагування товару" : "Додавання нового товару"}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingProduct ? "Змініть інформацію про товар" : "Заповніть всі необхідні поля"}
                                </p>
                            </div>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={handleCloseModal}
                                disabled={isCreating || isUpdating}
                            >
                                <X className="w-5 h-5 z-10" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Основна інформація */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Зображення товару */}
                                <div className="md:col-span-2">
                                    <label className="label">
                                        <span className="label-text font-semibold">Зображення товару</span>
                                    </label>

                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        {/* Прев'ю зображення */}
                                        <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-8 h-8 mb-1" />
                                                    <span className="text-xs">Прев'ю</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Завантаження файлу */}
                                        <div className="flex-1 w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="file-input file-input-bordered w-full"
                                                onChange={handleFileChange}
                                            />
                                            <div className="text-sm text-gray-500 mt-2">
                                                {editingProduct && !formData.image && (
                                                    <p>Залишіть порожнім, щоб зберегти поточне зображення</p>
                                                )}
                                                <p>Рекомендований розмір: 800x600px. Формати: JPG, PNG, GIF</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Назва товару */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">
                                            Назва товару <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input input-bordered focus:input-primary"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Введіть назву товару"
                                        required
                                    />
                                </div>

                                {/* Категорія */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Категорія</span>
                                    </label>
                                    <select
                                        name="category"
                                        className="select select-bordered focus:select-primary"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Оберіть категорію</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ціна */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">
                                            Ціна <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            step="0.01"
                                            min="0"
                                            className="input input-bordered focus:input-primary pl-8"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Опис товару */}
                            <div className="form-control flex flex-col gap-0.5">
                                <label className="label">
                                    <span className="label-text font-semibold">Опис товару</span>
                                </label>
                                <textarea
                                    name="description"
                                    className="textarea textarea-bordered focus:textarea-primary h-24 resize-none"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Детальний опис товару, його переваги та характеристики..."
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">
                                        {formData.description.length}/500 символів
                                    </span>
                                </label>
                            </div>

                            {/* Кнопки дій */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
                                <button
                                    type="button"
                                    className="btn btn-ghost order-2 sm:order-1"
                                    onClick={handleCloseModal}
                                    disabled={isCreating || isUpdating}
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary gap-2 order-1 sm:order-2"
                                    disabled={isCreating || isUpdating}
                                >
                                    {(isCreating || isUpdating) ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            {editingProduct ? "Оновлення..." : "Створення..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingProduct ? "Оновити товар" : "Створити товар"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;