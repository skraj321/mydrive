import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = ({ user, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Search Submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm); // Pass search term to parent
    }
  };

  return (
    <div className="bg-gray-800 text-white shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left - MyDrive */}
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          📂 MyDrive
        </div>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-gray-700 px-3 py-1 rounded-md mx-4 flex-1 max-w-md"
        >
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-white w-full"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md"
          >
            Search
          </button>
        </form>

        {/* Right - User Profile (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <h3 className="text-green-400">Hello!</h3>
              <span className="text-yellow-600 italic font-bold">
                {user.name}
              </span>

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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-4 bg-gray-700 py-4">
          {/* Search bar (Mobile) */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-600 px-3 py-1 rounded-md w-11/12"
          >
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-white w-full"
            />
            <button
              type="submit"
              className="ml-2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md"
            >
              Search
            </button>
          </form>

          {user ? (
            <>
            
              <span className="text-yellow-400 font-bold italic">Hello! {user.name}</span>
              
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md w-11/12"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md w-11/12"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md w-11/12"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
