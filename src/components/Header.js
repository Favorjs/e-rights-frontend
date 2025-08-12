import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/images/logo.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-100 text-gray-900 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="APEL CAPITAL REGISTRARS"
              className="h-20 sm:h-20 md:h-22 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center space-x-6">
            <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-green-800">
              FAQ
            </Link>
            <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-green-800">
              Contact Us
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <nav className="px-4 py-3 space-y-2">
            <Link
              to="/faq"
              className="block text-sm font-medium text-gray-700 hover:text-green-800"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              to="/contact"
              className="block text-sm font-medium text-gray-700 hover:text-green-800"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 