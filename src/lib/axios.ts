import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create an instance of axios
export const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Don't add token for refresh token endpoint
        if (config.url?.includes('/auth/refresh-token')) {
            return config;
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                // Create a new axios instance for refresh token request
                const response = await axios.post(`${baseURL}/auth/refresh-token/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('accessToken', access);

                // Update the failed request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);