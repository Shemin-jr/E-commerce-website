import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to include the auth token automatically
API.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user") || localStorage.getItem("currentUser");
        const storedUser = userRaw ? JSON.parse(userRaw) : null;

        const finalToken = (token && token !== "undefined") ? token : (storedUser && storedUser.token);

        if (finalToken && finalToken !== "undefined") {
            config.headers.Authorization = `Bearer ${finalToken}`;
        }
    } catch (err) {
        console.error("Auth interceptor error:", err);
        // If parsing fails, we continue without the token to allow public requests to work
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
