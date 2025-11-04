import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
        
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`hover:text-indigo-200 transition ${
                  isActive('/dashboard') ? 'font-semibold' : ''
                }`}
              >
                My Events
              </Link>
              <Link
                to="/marketplace"
                className={`hover:text-indigo-200 transition ${
                  isActive('/marketplace') ? 'font-semibold' : ''
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/requests"
                className={`hover:text-indigo-200 transition ${
                  isActive('/requests') ? 'font-semibold' : ''
                }`}
              >
                Requests
              </Link>
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-indigo-400">
                <span className="text-sm">Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="hover:text-indigo-200 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
