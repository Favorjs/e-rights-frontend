import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Info } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 group">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-bold text-[#0A4269] hover:text-[#0D507F] transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>

        </div>

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Shareholder Information
          </h1>
          <p className="text-slate-500 font-medium">Review your account status and select a processing method.</p>
        </div>

        {/* Shareholder Info Grid */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-8 border-b border-slate-50 pb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {/* Field 1: Reg Account Number */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">REG ACCOUNT NUMBER</p>
              <p className="text-xl font-bold text-[#0A4269]">{shareholder.reg_account_number}</p>
            </div>

            {/* Field 2: Rights Issue */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rights Issue</p>
              <p className="text-xl font-bold text-[#0A4269]">{shareholder.rights_issue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {/* Field 3: Name */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">NAME</p>
              <p className="text-xl font-bold text-[#0A4269] uppercase">{shareholder.name}</p>
            </div>

            {/* Field 4: Holdings After */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">HOLDINGS AFTER</p>
              <p className="text-xl font-bold text-emerald-600">{shareholder.holdings_after.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {/* Field 5: Holdings */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">HOLDINGS</p>
              <p className="text-xl font-bold text-[#0A4269]">{shareholder.holdings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {/* Field 6: Amount Payable */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AMOUNT PAYABLE</p>
              <p className="text-xl font-bold text-emerald-600">₦{shareholder.amount_due.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="relative mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Download Card */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-blue-200 p-8 flex flex-col items-center text-center shadow-sm hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100">
                <Download className="h-8 w-8 text-[#0A4269]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Download Pre-filled Form</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Download a PDF form with your details pre-filled. Print, sign, and submit with payment receipt.
              </p>
              <ul className="text-left text-sm text-slate-600 space-y-3 mb-10 w-full max-w-[280px]">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Your details automatically filled
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Print, fill form and sign manually
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Submit with payment receipt to registrars@apel.ng
                </li>
              </ul>
              <button
                onClick={handleDownloadPrefilledForm}
                disabled={downloading}
                className="mt-auto w-full bg-[#0A4269] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-[#0D507F] transition-all shadow-lg shadow-blue-900/10"
              >
                <Download className="h-4 w-4" />
                <span className="uppercase tracking-widest">{downloading ? 'Downloading...' : 'Download PDF Form'}</span>
              </button>
            </div>

            {/* OR Circle Separator */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {/* Submit Online Card */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 flex flex-col items-center text-center shadow-sm hover:border-emerald-300 transition-colors">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                <Upload className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Form Online</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Fill out the digital form online and submit electronically with your payment receipt.
              </p>
              <ul className="text-left text-sm text-slate-600 space-y-3 mb-10 w-full max-w-[280px]">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Fill form digitally
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Upload digital signature
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0"></span>
                  Upload payment receipt and submit online
                </li>
              </ul>
              <Link
                to={`/form-submission/${id}`}
                className="mt-auto w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all text-center shadow-lg shadow-emerald-900/10"
              >
                <Upload className="h-4 w-4" />
                <span className="uppercase tracking-widest">Submit Online</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 mb-1.5">
              Important: <span className="font-medium text-amber-800 tracking-tight">For the download option, please email your completed form and payment receipt to <a href="mailto:registrars@apel.ng" className="font-bold underline text-[#0A4269]">registrars@apel.ng</a>.</span>
            </p>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              For online submission, your form will be automatically submitted to us without needing to print out you will also get a copy of your form through the portal and sent to your email.
            </p>
          </div>
        </div>

        {/* Support Footer */}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between bg-slate-900 rounded-xl text-white gap-6">
          <div className="flex items-start md:items-center space-x-5">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="h-6 w-6 text-[#F58220]" />
            </div>
            <div>
              <p className="text-base font-bold">Record Discrepancy?</p>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mt-0.5">If these figures do not match your records, please contact registrar support.</p>
            </div>
          </div>
          <a
            href="mailto:registrars@apel.ng"
            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-center border border-white/5"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}