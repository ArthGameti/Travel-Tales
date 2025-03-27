// File: src/utils/axiosInstance.js
// Configures Axios instance with interceptors for API requests
import axios from "axios";
import BASE_URL from "./constant";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout to handle slower responses
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add Authorization token and adjust headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add Authorization token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        "No token found in localStorage - request may fail if authentication is required"
      );
    }

    // Remove Content-Type for multipart/form-data requests
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Enhanced error handling with logout on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || "Unknown";
    let errorMessage = error.response?.data?.message || error.message;

    if (!error.response) {
      errorMessage = "Network error: Unable to connect to the server.";
    }

    console.error(`API Error [Status: ${status}]:`, {
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle specific status codes
    if (status === 401) {
      console.warn("Unauthorized - Logging out and redirecting to login");
      localStorage.clear();
      window.location.href = "/login";
    } else if (status === 400) {
      console.warn("Bad Request - Check request data or server validation");
    } else if (status >= 500) {
      errorMessage = "Server error: Please try again later.";
    }

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

export default axiosInstance;
