import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogIn, LogOut, Menu, X, Settings, UserCircle } from 'lucide-react';
import { useAuth, useAuthOperations } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    user, 
    logout,
    isAdmin,
    isTeacher 
  } = useAuth();
  
  const {
    getUserDisplayName, 
    getUserInitials,
    getUserRoleDisplay
  } = useAuthOperations();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenus}>
              <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Quizora</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/features"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Features
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                {/* User Avatar/Menu */}
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{getUserDisplayName()}</div>
                    <div className="text-xs text-gray-500">{getUserRoleDisplay()}</div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{getUserRoleDisplay()}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenus}
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        Profile
                      </Link>

                      {(isAdmin() || isTeacher()) && (
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={closeMenus}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Link>
                      )}

                      <div className="border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenus}
              >
                Home
              </Link>

              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
              )}

              <Link
                to="/about"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenus}
              >
                About
              </Link>
              <Link
                to="/features"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={closeMenus}
              >
                Features
              </Link>

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {getUserInitials()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                          <div className="text-sm text-gray-500">{getUserRoleDisplay()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={closeMenus}
                    >
                      <UserCircle className="h-5 w-5 mr-3" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-base font-medium transition-colors mx-3"
                    onClick={closeMenus}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={closeMenus}
        ></div>
      )}
    </header>
  );
};

export default Header;
