// File: src/components/Navbar.jsx
// Renders the navigation bar with search, filter, and user info
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { FaSearch, FaBars, FaTimes, FaFilter, FaUndo } from "react-icons/fa";

const Navbar = ({ userInfo, onLogOut, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const location = useLocation();

  // Select API based on current route
  const isAllStoriesPage = location.pathname === "/all-stories";
  const searchApi = isAllStoriesPage
    ? "/travel-stories/search-all-stories"
    : "/travel-stories/search-stories";

  // Get user initial for avatar
  const userInitial = userInfo?.fullName?.charAt(0)?.toUpperCase() || "U";

  // Handle search by query
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      onSearch([], null, { searchQuery: "", startDate: "", endDate: "" }); // Reset search and filters if query is empty
      setStartDate("");
      setEndDate("");
      return;
    }
    try {
      console.log("Using searchApi:", searchApi);
      const response = await axiosInstance.get(searchApi, {
        params: { query: searchQuery },
      });
      if (!response.data.error) {
        onSearch(response.data.stories, null, {
          searchQuery,
          startDate: "",
          endDate: "",
        });
        setStartDate("");
        setEndDate("");
      } else {
        console.error("Search error:", response.data.message);
        onSearch([], response.data.message || "Failed to search stories.", {
          searchQuery,
          startDate: "",
          endDate: "",
        });
      }
    } catch (error) {
      console.error("Error searching stories:", error);
      onSearch([], error.message || "Error searching stories.", {
        searchQuery,
        startDate: "",
        endDate: "",
      });
    }
  };

  // Handle "Enter" key press for search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle filter by date range
  const handleFilter = () => {
    if (!startDate || !endDate) {
      onSearch([], "Please select both start and end dates.", {
        searchQuery: "",
        startDate: "",
        endDate: "",
      });
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      onSearch([], "End date cannot be before start date.", {
        searchQuery: "",
        startDate: "",
        endDate: "",
      });
      return;
    }
    // Pass the date filters to the parent component
    onSearch([], null, { searchQuery: "", startDate, endDate });
    setSearchQuery(""); // Clear search query when applying date filter
  };

  // Reset search and filter inputs
  const handleReset = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    onSearch([], null, { searchQuery: "", startDate: "", endDate: "" });
  };

  return (
    <div className="bg-zinc-900 text-zinc-300 sticky top-0 z-20">
      {/* Desktop Navbar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-700">
        {/* App Name and Navigation */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/dashboard">
            <h1 className="text-2xl sm:text-3xl font-[cursive] tracking-wide hover:text-rose-500 transition-colors duration-200">
              Travel-Tales
            </h1>
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/dashboard"
                ? "text-rose-500"
                : "text-zinc-400 hover:text-rose-500"
            }`}
          >
            My Stories
          </Link>
          <Link
            to="/all-stories"
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/all-stories"
                ? "text-rose-500"
                : "text-zinc-400 hover:text-rose-500"
            }`}
          >
            All Stories
          </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="flex-1 mx-4 flex items-center gap-2">
          {/* Search Bar */}
          <div className="flex items-center flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search stories..."
              className="flex-grow px-4 py-2 rounded-l-full bg-zinc-800 text-zinc-300 border border-zinc-700 focus:outline-none placeholder-zinc-500 transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-rose-500 text-white rounded-r-full border border-rose-500 hover:bg-rose-600 hover:scale-105 transition-all duration-200 flex items-center gap-1"
            >
              <FaSearch />
            </button>
          </div>

          {/* Date Range Inputs with Filter and Reset Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200 w-32 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200 w-32 text-sm"
            />
            <button
              onClick={handleFilter}
              className="px-3 py-2 bg-rose-500 text-white rounded-md border border-rose-500 hover:bg-rose-600 hover:scale-105 transition-all duration-200 flex items-center gap-1"
            >
              <FaFilter />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 hover:bg-zinc-600 hover:scale-105 transition-all duration-200 flex items-center gap-1"
            >
              <FaUndo />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 text-white text-lg font-semibold hover:scale-105 transition-all duration-200">
              {userInitial}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">{userInfo.fullName}</span>
              <button
                onClick={onLogOut}
                className="text-rose-500 underline text-sm hover:text-rose-400 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navbar with Hamburger Menu */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <h1 className="text-2xl font-[cursive] tracking-wide hover:text-rose-500 transition-colors duration-200">
              Travel-Tales
            </h1>
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/dashboard"
                ? "text-rose-500"
                : "text-zinc-400 hover:text-rose-500"
            }`}
          >
            My Stories
          </Link>
          <Link
            to="/all-stories"
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname === "/all-stories"
                ? "text-rose-500"
                : "text-zinc-400 hover:text-rose-500"
            }`}
          >
            All Stories
          </Link>
        </div>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-zinc-300 hover:text-rose-500 hover:scale-110 transition-all duration-200"
        >
          <FaBars className="text-2xl" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden flex flex-col items-start px-4 py-3 bg-zinc-900 border-b border-zinc-700 absolute top-0 left-0 w-full z-30">
          <div className="flex justify-between w-full mb-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <h1 className="text-2xl font-[cursive] tracking-wide hover:text-rose-500 transition-colors duration-200">
                  Travel-Tales
                </h1>
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === "/dashboard"
                    ? "text-rose-500"
                    : "text-zinc-400 hover:text-rose-500"
                }`}
              >
                My Stories
              </Link>
              <Link
                to="/all-stories"
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === "/all-stories"
                    ? "text-rose-500"
                    : "text-zinc-400 hover:text-rose-500"
                }`}
              >
                All Stories
              </Link>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-zinc-300 hover:text-rose-500 hover:scale-110 transition-all duration-200"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          <div className="flex flex-col w-full gap-4">
            {/* Mobile Search Bar */}
            <div className="flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search stories..."
                className="flex-grow px-4 py-2 rounded-l-full bg-zinc-800 text-zinc-300 border border-zinc-700 focus:outline-none placeholder-zinc-500 transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-3 bg-rose-500 text-white rounded-r-full border border-rose-500 hover:bg-rose-600 hover:scale-105 transition-all duration-200 flex items-center gap-1"
              >
                <FaSearch />
              </button>
            </div>

            {/* Mobile Date Range Inputs with Filter and Reset Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200 w-full"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all duration-200 w-full"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 px-3 py-2 bg-rose-500 text-white rounded-md border border-rose-500 hover:bg-rose-600 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <FaFilter />
                  <span>Filter</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2 bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 hover:bg-zinc-600 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <FaUndo />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Mobile User Info */}
            {userInfo && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 text-white text-lg font-semibold hover:scale-105 transition-all duration-200">
                  {userInitial}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {userInfo.fullName}
                  </span>
                  <button
                    onClick={onLogOut}
                    className="text-rose-500 underline text-sm hover:text-rose-400 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
