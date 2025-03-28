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

    // Remove Content-Type for multipart/form-data requests (e.g., file uploads)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Log the request for debugging
    console.log(
      `Making ${config.method.toUpperCase()} request to: ${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Enhanced error handling with logout on 401
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(
      `Received response from ${response.config.method.toUpperCase()} ${
        response.config.url
      }: Status ${response.status}`
    );
    return response;
  },
  (error) => {
    const status = error.response?.status || "Unknown";
    let errorMessage = error.response?.data?.message || error.message;

    // Handle network errors (e.g., ERR_CONNECTION_REFUSED)
    if (!error.response) {
      errorMessage =
        "Network error: Unable to connect to the server. Please check if the backend server is running.";
      console.error("Network Error Details:", {
        message: errorMessage,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: BASE_URL, // Log the BASE_URL for debugging
      });
    } else {
      // Handle specific status codes
      console.error(`API Error [Status: ${status}]:`, {
        message: errorMessage,
        url: error.config?.url,
        method: error.config?.method,
        responseData: error.response?.data,
      });

      if (status === 401) {
        console.warn("Unauthorized - Logging out and redirecting to login");
        localStorage.clear();
        window.location.href = "/login";
      } else if (status === 400) {
        console.warn("Bad Request - Check request data or server validation");
      } else if (status >= 500) {
        errorMessage = "Server error: Please try again later.";
      }
    }

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

// Function to test connectivity to the backend
axiosInstance.testConnectivity = async () => {
  try {
    console.log(`Testing connectivity to ${BASE_URL}/health`);
    const response = await axiosInstance.get("/health");
    console.log("Connectivity test successful:", response.data);
    return true;
  } catch (error) {
    console.error("Connectivity test failed:", error.message);
    return false;
  }
};

export default axiosInstance;
