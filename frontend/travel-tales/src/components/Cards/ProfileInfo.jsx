import React from "react";

const ProfileInfo = ({ userInfo, onLogOut }) => {
  return (
    <div className="flex items-center justify-between gap-3 p-2 bg-gray-100 rounded-lg shadow-sm">
      {/* User Avatar & Name */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">
          {userInfo?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <p className="text-sm font-medium text-gray-800">
          {userInfo?.name || "User"}
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
