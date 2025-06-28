import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useOrderStore = create((set, get) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    isCreating: false,

    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/orders/my");
            set({ orders: res.data });
        } catch (error) {
            toast.error("Не вдалося завантажити замовлення");
            console.error("Помилка завантаження замовлень:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchOrder: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/orders/${id}`);
            set({ selectedOrder: res.data });
        } catch (error) {
            toast.error("Не вдалося завантажити замовлення");
            console.error("Помилка завантаження замовлення:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    createOrder: async () => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("/orders");
            toast.success("Замовлення створено успішно!");
            get().fetchOrders(); // Оновлюємо список замовлень
            return res.data.orderId;
        } catch (error) {
            toast.error(error.response?.data?.message || "Не вдалося створити замовлення");
            return null;
        } finally {
            set({ isCreating: false });
        }
    },

    // Оновлено для простої обробки платежів (без Stripe)
    createCheckoutSession: async (orderId) => {
        try {
            const res = await axiosInstance.post("/pay/create-checkout-session", {
                orderId,
            });

            if (res.data.success) {
                toast.success("Оплата пройшла успішно!");
                get().fetchOrders(); // Оновлюємо замовлення
                return true;
            }

            return false;
        } catch (error) {
            toast.error("Не вдалося обробити оплату");
            return false;
        }
    },
}));