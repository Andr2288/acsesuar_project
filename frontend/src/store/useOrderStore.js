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
            toast.error("Failed to fetch orders");
            console.error("Error fetching orders:", error);
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
            toast.error("Failed to fetch order");
            console.error("Error fetching order:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    createOrder: async () => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("/orders");
            toast.success("Order created successfully!");
            get().fetchOrders(); // Refresh orders list
            return res.data.orderId;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create order");
            return null;
        } finally {
            set({ isCreating: false });
        }
    },

    createCheckoutSession: async (orderId) => {
        try {
            const res = await axiosInstance.post("/pay/create-checkout-session", {
                orderId,
            });
            return res.data.id; // Stripe session ID
        } catch (error) {
            toast.error("Failed to create payment session");
            return null;
        }
    },
}));