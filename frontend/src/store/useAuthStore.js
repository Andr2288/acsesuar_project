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
            toast.success("Account created successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
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

            toast.success("Login successful!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            return false;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ authUser: null });
        toast.success("Logged out successfully");
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

            toast.success("Profile updated successfully!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
            return false;
        }
    },
}));