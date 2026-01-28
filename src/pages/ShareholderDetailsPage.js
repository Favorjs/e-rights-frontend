import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Info, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getShareholderById, downloadBasicPdf } from '../services/api';

export default function ShareholderDetailsPage() {
  const { id } = useParams();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchShareholder = async () => {
      try {
        setLoading(true);
        const response = await getShareholderById(id);

        if (response.success) {
          setShareholder(response.data);
        } else {
          setError('Failed to load shareholder details');
        }
      } catch (error) {
        console.error('Error details:', error);
        setError('Error loading shareholder details');
        toast.error('Error loading shareholder details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShareholder();
    }
  }, [id]);

  const handleDownloadPrefilledForm = async () => {
    if (!shareholder) return;

    try {
      setDownloading(true);
      toast.loading('Generating your pre-filled form...');

      const formData = {
        reg_account_number: shareholder.reg_account_number,
        name: shareholder.name,
        holdings: shareholder.holdings,
        rights_issue: shareholder.rights_issue,
        amount_due: shareholder.amount_due
      };

      const pdfBlob = await downloadBasicPdf(formData);
      const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LINKAGE_RIGHTS_${shareholder.reg_account_number}_${shareholder.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        toast.dismiss();
        toast.success('Pre-filled form downloaded successfully!');
      }, 100);

    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to download form. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="App flex items-center justify-center p-8 min-h-screen">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4 border-t-[#0A4269]"></div>
          <p className="text-slate-600 font-semibold tracking-wide">Retrieving records...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="App flex items-center justify-center p-8 min-h-screen">
        <div className="card max-w-md w-full p-12 text-center animate-fade-in shadow-xl bg-white rounded-2xl">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Record not found</h2>
          <p className="text-slate-500 mb-8">{error || "We couldn't locate the requested shareholder file."}</p>
          <Link to="/" className="btn-secondary w-full py-3 block rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            Back to portal hero
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-slate-50/50 min-h-screen font-sans">
      <div className="container-custom py-12">
        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 group">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-bold text-[#0A4269] hover:text-[#0D507F] transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO PORTAL
          </Link>
          <div className="mt-4 md:mt-0 px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-[#0A4269] shadow-sm uppercase tracking-widest flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F58220] mr-2"></div>
            Verified Account
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Shareholder Profile
          </h1>
          <p className="text-slate-500 font-medium">Review your account status and select a processing method.</p>
        </div>

        {/* 1. Identity & Current Holdings - Full Width */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                <User className="h-7 w-7 text-[#0A4269]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">{shareholder.name}</h2>
                <div className="flex items-center mt-1 space-x-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID: {shareholder.reg_account_number}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider">Linkage Assurance Plc</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-6 rounded-2xl border border-slate-100 flex flex-col items-center md:items-end md:min-w-[200px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Portfolio Holding</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-[#0A4269]">{shareholder.holdings.toLocaleString()}</p>
                <span className="text-xs font-bold text-slate-400 uppercase">Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Processing Methods - Side by Side */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-1 w-8 bg-[#F58220] rounded-full"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Application Options</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Digital Portal */}
            <div className="bg-white rounded-xl border-2 border-[#0A4269] shadow-md relative overflow-hidden group transition-all hover:shadow-xl">
              <div className="bg-[#0A4269] py-2.5 px-4 flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F58220] animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Recommended Process</span>
              </div>
              <div className="p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <Upload className="h-6 w-6 text-[#0A4269]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Electronic Submission</h3>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                  Process your rights issue completely online. Seamless, instant, and secure with no paperwork required.
                </p>
                <Link
                  to={`/form-submission/${id}`}
                  className="w-full bg-[#0A4269] text-white py-5 text-sm font-bold tracking-widest rounded-xl block text-center uppercase shadow-lg shadow-blue-500/10 hover:bg-[#0D507F] transition-colors"
                >
                  START DIGITAL PORTAL
                </Link>
              </div>
            </div>

            {/* Manual Submission */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 group transition-all hover:border-[#F58220]/20 hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-orange-50 transition-colors">
                  <Download className="h-6 w-6 text-slate-400 group-hover:text-[#F58220]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Traditional</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Paper Records</h3>
              <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                Download a pre-filled PDF document for manual signature, printing, and physical filing.
              </p>
              <button
                onClick={handleDownloadPrefilledForm}
                disabled={downloading}
                className="w-full bg-slate-900 text-white py-5 rounded-xl font-bold text-sm flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
              >
                {downloading ? (
                  <span className="animate-pulse">GENERATING DOCUMENT...</span>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span className="tracking-widest uppercase">DOWNLOAD PRE-FILLED PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Financial Audit - Below Processing */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
          <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Financial Audit Table</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assessment Details</span>
          </div>
          <div className="p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">Provisional Units</label>
                  <p className="text-2xl font-black text-slate-900">{shareholder.rights_issue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">Offer Price</label>
                  <p className="text-xl font-bold text-slate-700">₦1.32 <span className="text-xs text-slate-400 font-normal">/ Share</span></p>
                </div>
              </div>

              <div className="bg-[#0A4269] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <label className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-4 block">Payable Amount</label>
                <div className="flex items-baseline space-x-1.5 mb-6">
                  <span className="text-sm font-bold text-blue-300">NGN</span>
                  <span className="text-4xl font-black">{shareholder.amount_due.toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-blue-200">
                  <span>Balance Status</span>
                  <span className="text-[#F58220]">Unpaid</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <label className="text-[10px] font-bold text-[#0A4269] uppercase tracking-widest mb-2 block">Post-Offer Holding</label>
                  <p className="text-2xl font-black text-slate-900">{shareholder.holdings_after.toLocaleString()} <span className="text-xs font-bold text-slate-400">UNITS</span></p>
                </div>
                <div className="flex items-center space-x-3 px-2">
                  <Info className="h-4 w-4 text-[#F58220]" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Figures are subject to final verification by the registrar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between bg-slate-900 rounded-xl text-white gap-6">
          <div className="flex items-start md:items-center space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="h-5 w-5 text-[#F58220]" />
            </div>
            <div>
              <p className="text-sm font-bold">Record Discrepancy?</p>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">If these figures do not match your records, please contact registrar support.</p>
            </div>
          </div>
          <a
            href="mailto:registrars@apel.ng"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-center"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}