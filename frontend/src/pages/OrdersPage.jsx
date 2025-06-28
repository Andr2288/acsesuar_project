import { useEffect, useState } from "react";
import { Package, Calendar, CreditCard, Eye, ArrowLeft } from "lucide-react";
import { useOrderStore } from "../store/useOrderStore.js";

const OrdersPage = () => {
    const { orders, selectedOrder, fetchOrders, fetchOrder, isLoading } = useOrderStore();
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleViewOrder = async (orderId) => {
        await fetchOrder(orderId);
        setShowOrderDetails(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <div className="badge badge-success">Оплачено</div>;
            case 'pending':
                return <div className="badge badge-warning">Очікується</div>;
            case 'failed':
                return <div className="badge badge-error">Помилка</div>;
            default:
                return <div className="badge badge-ghost">{status}</div>;
        }
    };

    if (isLoading && !showOrderDetails) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (showOrderDetails && selectedOrder) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center mb-6">
                    <button
                        className="btn btn-ghost btn-sm mr-4"
                        onClick={() => setShowOrderDetails(false)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-3xl font-bold">Деталі замовлення</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Інформація про замовлення */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <Package className="w-5 h-5" />
                                    Замовлення #{selectedOrder.order.id}
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Статус:</span>
                                        {getStatusBadge(selectedOrder.order.paymentStatus)}
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Дата:</span>
                                        <span className="text-sm">
                                            {formatDate(selectedOrder.order.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Загалом:</span>
                                        <span className="font-bold text-lg">
                                            ${selectedOrder.order.totalPrice}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Товари замовлення */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h2 className="card-title">Товари замовлення</h2>

                                <div className="space-y-4">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.product_id} className="flex items-center gap-4 p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Кількість: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    ${(item.itemPrice * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    ${item.itemPrice} за штуку
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Мої замовлення</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Замовлень поки що немає</h2>
                    <p className="text-gray-600 mb-6">
                        Ви ще не зробили жодного замовлення. Почніть робити покупки, щоб побачити свої замовлення тут!
                    </p>
                    <a href="/" className="btn btn-primary">
                        Почати покупки
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="card-title">
                                            <Package className="w-5 h-5" />
                                            Замовлення #{order.id}
                                        </h2>

                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(order.createdAt)}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <CreditCard className="w-4 h-4" />
                                                ${order.totalPrice}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(order.paymentStatus)}

                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleViewOrder(order.id)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Переглянути деталі
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;