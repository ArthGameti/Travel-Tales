// File: src/components/Login.jsx
// Handles user login with form validation
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Validate email format
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      const response = await axiosInstance.post("/login", { email, password });
      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-zinc-900 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-zinc-800 shadow-lg rounded-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-zinc-100 mb-6">
          Login
        </h2>
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-zinc-500 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Password input with show/hide toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 bg-zinc-700 text-zinc-300 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-zinc-500 transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-zinc-400 hover:text-rose-500 transition-all duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-rose-500 text-white py-2 rounded-md hover:bg-rose-600 hover:scale-105 transition-all duration-200"
          >
            Login
          </button>
          <p className="text-center text-zinc-400">Or</p>
          <button
            type="button"
            className="w-full bg-zinc-600 text-zinc-300 py-2 rounded-md hover:bg-zinc-500 hover:scale-105 transition-all duration-200"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
