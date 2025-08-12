import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-2 text-center sm:text-left">
          <div className="text-sm">
            <span className="font-semibold">THE INITIATES PLC</span>
          </div>
          <span className="hidden sm:inline text-gray-400">•</span>
          <div className="text-sm text-gray-300">
            © 2025 All Rights Reserved. APEL CAPITAL REGISTRARS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 