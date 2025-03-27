// File: frontend/travel-tales/src/components/ProfileInfo.jsx
// Displays user profile info and logout button
import React from "react";

const ProfileInfo = ({ userInfo, onLogOut }) => {
  return (
    <div className="flex items-center justify-between gap-3 p-2 bg-gray-100 rounded-lg shadow-sm">
      {/* User Avatar & Name */}
      <div className="flex items-center gap-4">
        {/* Show user's initial in avatar */}
        <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">
          {userInfo?.fullName?.charAt(0).toUpperCase() || "U"}
        </div>
        <p className="text-sm font-medium text-gray-800">
          {userInfo?.fullName || "User"}
        </p>
      </div>

      {/* Logout Button */}
      <button
        className="bg-red-500 text-white px-4 py-2 text-sm rounded-md hover:bg-red-600 transition"
        onClick={onLogOut}
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileInfo;
