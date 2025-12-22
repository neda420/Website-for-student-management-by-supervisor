/**
 * Axios Configuration
 * Configured axios instance with automatic token injection
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api', // Proxied to backend by Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT token to every request
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        // Debug logging to track token attachment
        console.log('[Axios Interceptor] Request:', config.url);
        console.log('[Axios Interceptor] Token exists:', !!token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[Axios Interceptor] Authorization header set');
        } else {
            console.warn('[Axios Interceptor] No token found in localStorage');
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('[Axios Interceptor] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors (unauthorized)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid - clear local storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
