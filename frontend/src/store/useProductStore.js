import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useProductStore = create((set, get) => ({
    products: [],
    selectedProduct: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    fetchProducts: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/products");
            set({ products: res.data });
        } catch (error) {
            toast.error("Не вдалося завантажити товари");
            console.error("Помилка завантаження товарів:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchProduct: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get(`/products/${id}`);
            set({ selectedProduct: res.data });
        } catch (error) {
            toast.error("Не вдалося завантажити товар");
            console.error("Помилка завантаження товару:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    createProduct: async (productData) => {
        set({ isCreating: true });
        try {
            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('category', productData.category);

            if (productData.image) {
                formData.append('image', productData.image);
            }

            await axiosInstance.post("/products", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Товар створено успішно!");
            get().fetchProducts(); // Оновлюємо список товарів
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Не вдалося створити товар");
            return false;
        } finally {
            set({ isCreating: false });
        }
    },

    updateProduct: async (id, productData) => {
        set({ isUpdating: true });
        try {
            const formData = new FormData();
            if (productData.name) formData.append('name', productData.name);
            if (productData.description) formData.append('description', productData.description);
            if (productData.price) formData.append('price', productData.price);
            if (productData.category) formData.append('category', productData.category);

            if (productData.image) {
                formData.append('image', productData.image);
            }

            await axiosInstance.put(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Товар оновлено успішно!");
            get().fetchProducts(); // Оновлюємо список товарів
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Не вдалося оновити товар");
            return false;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteProduct: async (id) => {
        set({ isDeleting: true });
        try {
            await axiosInstance.delete(`/products/${id}`);
            toast.success("Товар видалено успішно!");
            get().fetchProducts(); // Оновлюємо список товарів
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Не вдалося видалити товар");
            return false;
        } finally {
            set({ isDeleting: false });
        }
    },
}));