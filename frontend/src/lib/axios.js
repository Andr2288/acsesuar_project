import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

// Add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Перевіряємо, чи це не запит на логін або реєстрацію
        const isAuthRequest = error.config?.url?.includes('/users/login') ||
            error.config?.url?.includes('/users/register');

        // Перенаправляємо тільки якщо:
        // 1. Це 401 помилка
        // 2. Це НЕ запит на авторизацію
        // 3. Користувач не на сторінці логіну
        if (error.response?.status === 401 &&
            !isAuthRequest &&
            !window.location.pathname.includes('/login')) {

            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);