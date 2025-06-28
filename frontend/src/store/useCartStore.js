import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart: [],
    isLoading: false,
    isUpdating: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/cart");
            set({ cart: res.data });
        } catch (error) {
            toast.error("Failed to fetch cart");
            console.error("Error fetching cart:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId, quantity = 1) => {
        set({ isUpdating: true });
        try {
            await axiosInstance.post("/cart/add", {
                productId,
                quantity,
            });

            toast.success("Added to cart!");
            get().fetchCart(); // Refresh cart
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add to cart");
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },

    removeFromCart: async (productId) => {
        set({ isUpdating: true });
        try {
            await axiosInstance.delete(`/cart/remove/${productId}`);
            toast.success("Removed from cart!");
            get().fetchCart(); // Refresh cart
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove from cart");
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateCartItem: async (productId, quantity) => {
        if (quantity <= 0) {
            return get().removeFromCart(productId);
        }

        set({ isUpdating: true });
        try {
            await axiosInstance.post("/cart/add", {
                productId,
                quantity,
            });

            get().fetchCart(); // Refresh cart
            return true;
        } catch (error) {
            toast.error("Failed to update cart");
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },

    getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartItemsCount: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
}));