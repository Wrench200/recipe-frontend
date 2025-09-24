import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, User, LogOut, ChefHat, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>
          {isAuthenticated && (
            <Link to="/add-recipe" className="nav-link">Add Recipe</Link>
          )}
        </div>

        <div className="nav-actions">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pr-10 w-48"
              />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <User size={20} />
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-red-600"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          <button
            onClick={toggleMenu}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex flex-col gap-4">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/search" className="nav-link" onClick={() => setIsMenuOpen(false)}>Search</Link>
            {isAuthenticated ? (
              <>
                <Link to="/add-recipe" className="nav-link" onClick={() => setIsMenuOpen(false)}>Add Recipe</Link>
                <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="nav-link text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
