// File: src/utils/axiosInstance.js
import axios from "axios";
import BASE_URL from "./constant";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json", // Default content type for JSON requests
  },
});

// Request Interceptor: Add Authorization token and adjust headers for multipart/form-data
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

    // Remove Content-Type for multipart/form-data requests (browser will set it with boundary)
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

// Response Interceptor: Enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error details
    const status = error.response?.status || "Unknown";
    let errorMessage = error.response?.data?.message || error.message;

    // Fallback for network errors or other cases where response is undefined
    if (!error.response) {
      errorMessage = "Network error: Unable to connect to the server.";
    }

    console.error(`API Error [Status: ${status}]:`, errorMessage);

    // Handle specific status codes
    if (status === 401) {
      console.warn(
        "Unauthorized - Redirecting to login or refreshing token might be needed"
      );
      // Note: Redirect is handled in components like Home.jsx (handleLogout)
      // Optional: Add token refresh logic here if supported by the backend
      /*
      if (canRefreshToken()) {
        try {
          const newToken = await refreshToken();
          localStorage.setItem("token", newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(error.config); // Retry the request
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.clear();
          window.location.href = "/login";
        }
      }
      */
    } else if (status === 400) {
      console.warn("Bad Request - Check request data or server validation");
    } else if (status >= 500) {
      errorMessage = "Server error: Please try again later.";
    }

    // Create a custom error object for easier handling in components
    const customError = new Error(errorMessage);
    customError.status = status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

export default axiosInstance;
