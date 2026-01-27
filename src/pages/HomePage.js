import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Search, Download, FileText, FileSpreadsheet, FileDigit, FileText } from 'lucide-react';
import { Search, Download, FileText, FileSpreadsheet, FileDigit, Info, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { searchShareholders } from '../services/api';

const HomePage = () => {
  const [searchName, setSearchName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchName.trim() || searchName.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);

    try {
      const response = await searchShareholders(searchName.trim());

      if (response.success) {
        if (response.data.length === 0) {
          toast.error('No shareholders found with that name');
        } else if (response.data.length === 1) {
          // If only one result, go directly to shareholder details
          navigate(`/shareholder/${response.data[0].id}`);
        } else {
          // Multiple results, go to search results page
          navigate('/search-results', {
            state: {
              searchResults: response.data,
              searchTerm: searchName.trim()
            }
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for shareholders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadForm = (formType) => {
    // Map form types to their corresponding Cloudinary URLs
    const formFiles = {
      'Stock Broker Docket': 'https://res.cloudinary.com/apelng/raw/upload/v1764578164/LINKAGE_ASSURANCE_PLC_2025_Right_Brokers_Docket_wurfeu.xls',
      'Dematerialization Form': 'https://res.cloudinary.com/apelng/image/upload/v1762418562/FULL-DEMATERIAL-MIGRATION-FORM-1_1_mmibqe.pdf',
      'Rights Circular': 'https://res.cloudinary.com/apelng/image/upload/v1763988769/Linkage_Rights_Circular_ledega_b_zke5hk.pdf',
      'Public Offer': 'https://res.cloudinary.com/apelng/image/upload/v1761666679/Linkage_Public_Offer_bvnzju.pdf'
    };

    const fileUrl = formFiles[formType];

    if (!fileUrl) {
      toast.error('Form not available');
      return;
    }

    // Open the PDF in a new tab
    window.open(fileUrl, '_blank');

    toast.success(`Opening ${formType} in a new tab`);
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <section className="bg-slate-900 border-b border-slate-800 relative overflow-hidden">
        <div className="container-custom section relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <h2 className="text-emerald-500 text-sm font-bold uppercase tracking-widest mb-4">
              Invest in the Future
            </h2>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              LINKAGE ASSURANCE PLC <br />
              <span className="text-emerald-400">RIGHTS ISSUE 2025</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
              Access the official portal for shareholder rights and public offer applications.
              Manage your entitlements with ease and precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary px-8 py-3.5 text-base"
              >
                Start Application
              </button>
              <button
                onClick={() => document.getElementById('downloads-section').scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline bg-transparent border-slate-700 text-white hover:bg-slate-800 px-8 py-3.5 text-base"
              >
                Download Resources
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/10 to-transparent"></div>
      </section>

      {/* Main Content Area */}
      <div id="search-section" className="bg-slate-50/50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 pointer-events-none"></div>
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[120%] h-32 bg-slate-50 rounded-[100%] pointer-events-none"></div>

        <div className="container-custom relative z-10 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

            {/* Left: Search Portal */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="card shadow-2xl border-none overflow-hidden bg-white group transition-all duration-500 hover:shadow-emerald-900/5">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600"></div>
                <div className="p-6 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                        <Search className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Shareholder Portal</h3>
                        <p className="text-sm text-slate-500 font-medium">Verify account status and begin application</p>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Secure Database</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label htmlFor="searchName" className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                          Registered Full Name
                        </label>
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Required</span>
                      </div>
                      <div className="relative group/input">
                        <input
                          type="text"
                          id="searchName"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Enter name (e.g. John Okoro)..."
                          className="form-input text-lg py-5 px-6 bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-2xl"
                          disabled={isSearching}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          {isSearching ? (
                            <div className="loading-spinner h-5 w-5 border-t-emerald-600" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                              <Search className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-[11px] text-slate-500 font-medium">
                          Use exact spelling as shown on your share certificate or CSCS statement.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSearching}
                      className="w-full btn-primary text-base py-5 font-bold tracking-widest transition-all hover:scale-[1.01] active:scale-[0.98] shadow-xl shadow-emerald-700/20 rounded-2xl flex items-center justify-center space-x-3"
                    >
                      {isSearching ? (
                        <>
                          <div className="loading-spinner h-5 w-5 border-t-white" />
                          <span>SYNCHRONIZING RECORDS...</span>
                        </>
                      ) : (
                        <>
                          <span>LOCATE MY ENTITLEMENTS</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Warning Notice */}
                  <div className="mt-10 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex items-start space-x-4">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-amber-900 mb-1 tracking-tight">Accessing your records</p>
                      <p className="text-amber-800/70 leading-relaxed font-medium">
                        If your records aren't found under your primary name, try common variations or contact our registrar support immediately at <span className="underline font-bold">registrars@apel.ng</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Resources & Sidebar */}
            <div id="downloads-section" className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Resource Card */}
              <div className="card bg-white shadow-xl shadow-slate-200/50 border-none overflow-hidden rounded-2xl">
                <div className="p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Download className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Documentation</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'Rights Circular', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { id: 'Public Offer', icon: FileDigit, color: 'text-slate-600', bg: 'bg-slate-50' },
                      { id: 'Stock Broker Docket', icon: FileDigit, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { id: 'Dematerialization Form', icon: FileSpreadsheet, color: 'text-blue-600', bg: 'bg-blue-50' }
                    ].map((form) => (
                      <button
                        key={form.id}
                        onClick={() => downloadForm(form.id)}
                        className="w-full flex items-center justify-between p-4 border border-slate-50 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${form.bg} group-hover:scale-110 transition-transform`}>
                            <form.icon className={`h-5 w-5 ${form.color}`} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{form.id}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-all translate-x-0 group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Procedure Accordion */}
              <div className="card shadow-md border-none overflow-hidden rounded-2xl transition-all hover:shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsProcedureOpen((v) => !v)}
                  className="w-full flex items-center justify-between p-6 text-left bg-slate-900 text-white transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Info className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Trading Guide</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Updated 2025 Edition</p>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full bg-white/10 border border-white/5 transition-transform duration-500 ${isProcedureOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </div>
                </button>

                {isProcedureOpen && (
                  <div className="p-8 bg-white animate-fade-in space-y-8 divide-y divide-slate-100">
                    <div className="space-y-4">
                      <h4 className="flex items-center text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md w-fit uppercase tracking-widest">
                        Seller Protocol
                      </h4>
                      <ul className="space-y-4">
                        {[
                          'Access the Rights Circular via our portal.',
                          'Endorse the units to be accepted or renounced.',
                          'Complete the Rights Demat/Migration form.',
                          'Authorize your stockbroker via a formal cover letter.'
                        ].map((step, i) => (
                          <li key={i} className="flex items-start space-x-3 text-xs text-slate-600 leading-relaxed font-medium">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8 space-y-4">
                      <h4 className="flex items-center text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md w-fit uppercase tracking-widest">
                        Buyer Protocol
                      </h4>
                      <ul className="space-y-4">
                        {[
                          'Update KYC information with your preferred stockbroker.',
                          'Ensure broker submits executed transfer form to CSCS.'
                        ].map((step, i) => (
                          <li key={i} className="flex items-start space-x-3 text-xs text-slate-600 leading-relaxed font-medium">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
