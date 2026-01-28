import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">APEL CAPITAL REGISTRARS</h3>
            <p className="text-sm leading-relaxed max-w-sm">
              Providing world-class registrar services and solutions.
              We are committed to excellence in shareholder management and corporate registration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link></li>
              <li><a href="https://apel.com.ng" className="hover:text-emerald-500 transition-colors">Main Website</a></li>
              <li><a href="mailto:registrar@apel.com.ng" className="hover:text-emerald-500 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Legal/Regulatory */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-6">Regulatory</h4>
            <ul className="space-y-4 text-sm">
              <li><span className="text-slate-500">APEL is registered and regulated by the Securities and Exchange Commission, Nigeria.</span></li>

            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} APEL Capital Registrars Limited. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs">
            {/* <a href="" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="" className="hover:text-white transition-colors">Terms of Service</a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;