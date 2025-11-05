import React from 'react';

import { Clock, Mail } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col">
      {/* Header */}
      {/* <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center text-green-600 hover:text-green-700">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-lg font-medium">Back to Home</span>
            </Link>
            <div className="text-xl font-bold text-green-700">
              TIP Rights Issue
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Clock className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Coming Soon</h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Dear Shareholder, Stay tuned for updates!
          </p>
          
       
          
          <div className="mt-10 flex items-center justify-center space-x-6">
            <a 
              href="mailto:registrars@apel.ng" 
              className="text-gray-500 hover:text-green-600 flex items-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              <span>registrars@apel.ng</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TIP Rights Issue. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
