import axios from "axios";

const API = axios.create({
  baseURL: "https://jersey-backend-pl21.onrender.com",
});

// Add token automatically
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      const userRaw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser");

      const storedUser = userRaw ? JSON.parse(userRaw) : null;

      const finalToken =
        token && token !== "undefined"
          ? token
          : storedUser?.token;

      if (finalToken && finalToken !== "undefined") {
        config.headers.Authorization = `Bearer ${finalToken}`;
      }
    } catch (err) {
      console.error("Auth interceptor error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;