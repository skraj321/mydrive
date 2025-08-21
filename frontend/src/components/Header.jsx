import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-gray-800 text-white px-6 py-4 shadow-md">
      {/* Left - MyDrive */}
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/profile")}
      >
        📂 MyDrive
      </div>

      {/* Right - User Profile */}
      <div className="flex items-center gap-4">
  {user ? (
    <>
      <h3 className="text-green-400">Hello!</h3>
      <span className="text-yellow-600 italic font-bold">{user.name}</span>

      <button
        onClick={() => navigate("/files")}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
      >
        Your Files
      </button>

      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => navigate("/login")}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
      >
        Sign In
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md"
      >
        Sign Up
      </button>
    </>
  )}
</div>

    </div>
  );
};

export default Header;
