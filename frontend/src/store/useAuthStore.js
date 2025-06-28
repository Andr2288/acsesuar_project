import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isCheckingAuth: true,

    signup: async ({ login, password }) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/users/register", {
                login,
                password,
            });
            toast.success("Акаунт створено успішно!");
            return true;
        } catch (error) {
            console.error("Signup error:", error);
            const errorMessage = error.response?.data?.message || "Помилка реєстрації";
            toast.error(errorMessage);
            return false;
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async ({ login, password }) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/users/login", {
                login,
                password,
            });

            // Save token
            localStorage.setItem('token', res.data.token);

            // Get user profile
            const profileRes = await axiosInstance.get("/users/profile");
            set({ authUser: profileRes.data });

            toast.success("Успішний вхід в систему!");
            return true;
        } catch (error) {
            console.error("Login error:", error);

            // Детальніша обробка помилок
            let errorMessage = "Помилка входу в систему";

            if (error.response?.status === 401) {
                errorMessage = "Невірний логін або пароль";
            } else if (error.response?.status === 400) {
                errorMessage = "Необхідно ввести логін та пароль";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = `Помилка мережі: ${error.message}`;
            }

            toast.error(errorMessage);
            return false;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ authUser: null });
        toast.success("Вихід виконано успішно");
    },

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ isCheckingAuth: false });
                return;
            }

            const res = await axiosInstance.get("/users/profile");
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            localStorage.removeItem('token');
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    updateProfile: async ({ login, password }) => {
        try {
            const updateData = {};
            if (login) updateData.login = login;
            if (password) updateData.password = password;

            await axiosInstance.patch("/users/update", updateData);

            // Refresh profile
            const res = await axiosInstance.get("/users/profile");
            set({ authUser: res.data });

            toast.success("Профіль оновлено успішно!");
            return true;
        } catch (error) {
            console.error("Update profile error:", error);
            const errorMessage = error.response?.data?.message || "Помилка оновлення профілю";
            toast.error(errorMessage);
            return false;
        }
    },
}));