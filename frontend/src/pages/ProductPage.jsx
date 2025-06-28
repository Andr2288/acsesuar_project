import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";
import { useCartStore } from "../store/useCartStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import toast from "react-hot-toast";

const ProductPage = () => {
    const { id } = useParams();
    const { selectedProduct, fetchProduct, isLoading } = useProductStore();
    const { addToCart, isUpdating } = useCartStore();
    const { authUser } = useAuthStore();

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id, fetchProduct]);

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!authUser) {
            toast.error("Будь ласка, увійдіть в систему для додавання товарів до кошика");
            return;
        }

        const success = await addToCart(selectedProduct.id, quantity);
        if (success) {
            setQuantity(1); // Скидаємо кількість після успішного додавання
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (!selectedProduct) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Товар не знайдено</h2>
                    <p className="text-gray-600 mb-6">
                        Товар, який ви шукаєте, не існує або був видалений.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Повернутися до товарів
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Кнопка повернення */}
            <div className="mb-6">
                <Link to="/" className="btn btn-ghost btn-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Повернутися до товарів
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Зображення товару */}
                <div className="flex justify-center">
                    <div className="w-full max-w-md">
                        {selectedProduct.imagePath ? (
                            <img
                                src={`http://localhost:5000/${selectedProduct.imagePath}`}
                                alt={selectedProduct.name}
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-lg">Зображення недоступне</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Деталі товару */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{selectedProduct.name}</h1>

                        {selectedProduct.category && (
                            <div className="badge badge-secondary mb-4">
                                {selectedProduct.category}
                            </div>
                        )}

                        <p className="text-4xl font-bold text-primary mb-4">
                            ${selectedProduct.price}
                        </p>
                    </div>

                    {selectedProduct.description && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Опис</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {selectedProduct.description}
                            </p>
                        </div>
                    )}

                    {/* Секція додавання до кошика */}
                    {authUser && (
                        <div className="bg-base-200 p-6 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Додати до кошика</h3>

                            {/* Вибір кількості */}
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-sm font-medium">Кількість:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline btn-circle"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <span className="px-4 py-2 text-center min-w-[3rem] font-semibold">
                                        {quantity}
                                    </span>

                                    <button
                                        className="btn btn-sm btn-outline btn-circle"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Загальна ціна */}
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-600">Загалом:</span>
                                <span className="text-xl font-bold">
                                    ${(selectedProduct.price * quantity).toFixed(2)}
                                </span>
                            </div>

                            {/* Кнопка додавання до кошика */}
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleAddToCart}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Додати до кошика
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Повідомлення для неавторизованих користувачів */}
                    {!authUser && (
                        <div className="bg-base-200 p-6 rounded-lg text-center">
                            <p className="mb-4">Будь ласка, увійдіть в систему для додавання товарів до кошика</p>
                            <div className="flex gap-3 justify-center">
                                <Link to="/login" className="btn btn-primary">
                                    Увійти
                                </Link>
                                <Link to="/signup" className="btn btn-outline">
                                    Зареєструватися
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Інформація про товар */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-3">Інформація про товар</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">ID товару:</span>
                                <span>#{selectedProduct.id}</span>
                            </div>
                            {selectedProduct.category && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Категорія:</span>
                                    <span>{selectedProduct.category}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Наявність:</span>
                                <span className="text-green-600 font-medium">В наявності</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;