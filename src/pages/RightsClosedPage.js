import React from 'react';
import { Mail, Clock, AlertCircle } from 'lucide-react';

const RightsClosedPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-12 text-center relative z-10 border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0A4269] to-[#0D507F] mb-8 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <Clock className="h-10 w-10 text-white" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Rights Issue <span className="text-[#F58220]">Closed</span>
          </h1>

          <div className="h-1 w-20 bg-[#F58220] mx-auto rounded-full"></div>

          <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
            The Rights Issue application period has officially ended. We appreciate your interest and participation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5 text-[#0A4269]" />
            </div>
            <span className="text-sm font-medium text-gray-500 mb-1">Support</span>
            <a href="mailto:registrars@apel.ng" className="text-gray-900 font-semibold hover:text-[#0A4269] transition-colors">
              registrars@apel.ng
            </a>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center group hover:bg-white hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 text-[#F58220]" />
            </div>
            <span className="text-sm font-medium text-gray-500 mb-1">Status</span>
            <span className="text-gray-900 font-semibold">Offer Expired</span>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
          © {new Date().getFullYear()} Linkage Assurance Plc. All rights reserved.
        </div>
      </div>

      <div className="mt-8 text-gray-400 text-sm font-medium">
        APEL Registrars Limited
      </div>
    </div>
  );
};

export default RightsClosedPage;
