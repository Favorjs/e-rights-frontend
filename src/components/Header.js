import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import logo2 from '../assets/images/lasaco.png';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-24">
          {/* Left: Logos Container */}
          <div className="flex items-center space-x-2 sm:space-x-8">
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src={logo}
                alt="APEL CAPITAL REGISTRARS"
                className="h-14 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="h-8 sm:h-12 w-px bg-slate-200 shrink-0"></div>

            <div className="flex items-center shrink-0">
              <img
                src={logo2}
                alt="LASACO Assurance"
                className="h-12 sm:h-16 w-auto object-contain transition-opacity"
              />
            </div>
          </div>

          {/* Right: Navigation/Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <a href="/faq" target="_blank" rel="noopener noreferrer" className="btn-outline text-[9px] sm:text-xs px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;