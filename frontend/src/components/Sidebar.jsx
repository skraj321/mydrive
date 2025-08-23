// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-60 bg-gray-100 border-r p-4 flex flex-col gap-4">
      {/* + New Button */}
      

      {/* Menu Items */}
      <nav className="flex flex-col gap-3 mt-10 text-gray-700 font-medium">
        <button
          onClick={() => navigate("/profile")}
          className="hover:bg-gray-200 px-3 py-2 rounded-md text-left"
        >
          🏠 Home
        </button>
        <button
          onClick={() => navigate("/files")}
          className="hover:bg-gray-200 px-3 py-2 rounded-md text-left"
        >
          📂 My Files
        </button>
        <button
          onClick={() => navigate("/recent")}
          className="hover:bg-gray-200 px-3 py-2 rounded-md text-left"
        >
          ⏰ Recent
        </button>
        <button
          onClick={() => navigate("/bin")}
          className="hover:bg-gray-200 px-3 py-2 rounded-md text-left"
        >
          🗑️ Bin
        </button>
        <button
          onClick={() => navigate("/storage")}
          className="hover:bg-gray-200 px-3 py-2 rounded-md text-left"
        >
          💾 Storage
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
