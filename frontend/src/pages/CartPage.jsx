import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "../store/useCartStore.js";
import { useOrderStore } from "../store/useOrderStore.js";
import toast from "react-hot-toast";

const CartPage = () => {
    const {
        cart,
        fetchCart,
        updateCartItem,
        removeFromCart,
        getCartTotal,
        isLoading,
        isUpdating
    } = useCartStore();

    const { createOrder, createCheckoutSession, isCreating } = useOrderStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleQuantityChange = async (productId, newQuantity) => {
        await updateCartItem(productId, newQuantity);
    };

    const handleRemoveItem = async (productId) => {
        await removeFromCart(productId);
    };

    const handleCheckout = async () => {
        try {
            // First create the order
            const orderId = await createOrder();
            if (!orderId) {
                return;
            }

            // Process payment (simplified version)
            const paymentSuccess = await createCheckoutSession(orderId);
            if (paymentSuccess) {
                toast.success("Order completed successfully!");
                // Clear cart by fetching it again (it should be empty after order creation)
                await fetchCart();
                // Redirect to orders page
                navigate("/orders");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Checkout failed. Please try again.");
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

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">
                        Add some products to your cart to get started!
                    </p>
                    <Link to="/" className="btn btn-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const total = getCartTotal();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <Link to="/" className="btn btn-ghost btn-sm mr-4">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.product_id} className="card bg-base-100 shadow-lg">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                                            {item.imagePath ? (
                                                <img
                                                    src={`http://localhost:5000/${item.imagePath}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="text-primary font-bold text-lg">
                                                ${item.price}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="btn btn-sm btn-outline btn-circle"
                                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                                disabled={isUpdating || item.quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="px-3 py-1 text-center min-w-[2rem]">
                                                {item.quantity}
                                            </span>

                                            <button
                                                className="btn btn-sm btn-outline btn-circle"
                                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                disabled={isUpdating}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            className="btn btn-sm btn-ghost btn-circle"
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            disabled={isUpdating}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right mt-2">
                                        <span className="text-sm text-gray-600">
                                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-lg sticky top-4">
                        <div className="card-body">
                            <h2 className="card-title">Order Summary</h2>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Items ({cart.length})</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="divider my-2"></div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="card-actions justify-stretch mt-6">
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleCheckout}
                                    disabled={isCreating || cart.length === 0}
                                >
                                    {isCreating ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        "Complete Order"
                                    )}
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <Link to="/" className="link link-primary text-sm">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;