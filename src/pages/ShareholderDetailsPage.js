import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getShareholderById } from '../services/api';
//  import axios from 'axios';
import { downloadBasicPdf } from '../services/api';
// import { downloadFile } from '../services/api';
const ShareholderDetailsPage = () => {
  const { id } = useParams();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchShareholder = async () => {
      try {
        setLoading(true);
        console.log('Fetching shareholder with ID:', id);

        const response = await getShareholderById(id);

        console.log('Response:', response);

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

    fetchShareholder();
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

      // Get the PDF blob from the API
      const pdfBlob = await downloadBasicPdf(formData);

      // Create a blob URL for the PDF
      const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LINKAGE_RIGHTS_${shareholder.reg_account_number}_${shareholder.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Cleanup
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
      <div className="App flex items-center justify-center p-8">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4 border-t-[#0A4269]"></div>
          <p className="text-slate-600 font-semibold tracking-wide">Retrieving records...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="App flex items-center justify-center p-8">
        <div className="card max-w-md w-full p-12 text-center animate-fade-in shadow-xl">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Record not found</h2>
          <p className="text-slate-500 mb-8">{error || "We couldn't locate the requested shareholder file."}</p>
          <Link to="/" className="btn-secondary w-full py-3">
            Back to portal hero
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-slate-50/50">
      <div className="container-custom py-12">
        {/* Breadcrumb & Global Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="animate-fade-in">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-bold text-[#0A4269] hover:text-[#0D507F] mb-4 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              BACK TO PORTAL
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Shareholder Profile
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Review holdings and entitlement for <span className="text-slate-900 font-bold">{shareholder.name}</span>
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            <span className="text-[#0A4269] uppercase tracking-widest">Verified Record</span>
            <span className="mx-2 opacity-30">/</span>
            <span className="uppercase tracking-widest">Portal access</span>
          </div>
        </div>

        {/* Shareholder Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">

          {/* Main Info Card */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="card shadow-sm">
              <div className="card-header bg-white flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Financial Overview</h3>
                <span className="status-badge bg-orange-50 text-[#F58220] text-[10px]">Verified Account</span>
              </div>

              <div className="card-body p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                  <div className="space-y-8">
                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Registration ID</label>
                      <p className="text-xl font-bold text-slate-900 bg-slate-50 p-3 rounded-md border border-slate-100 group-hover:bg-white group-hover:border-blue-200 transition-all">
                        {shareholder.reg_account_number}
                      </p>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Registered Name</label>
                      <p className="text-xl font-bold text-slate-900 border-l-4 border-l-[#0A4269] pl-4 py-1">
                        {shareholder.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block text-right">Current Units</label>
                        <p className="text-2xl font-bold text-slate-900 text-right">{shareholder.holdings.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block text-right">Rights Entitlement</label>
                        <p className="text-2xl font-bold text-[#0A4269] text-right">{shareholder.rights_issue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-[#0A4269] text-white rounded-xl p-6 shadow-lg shadow-blue-500/10">
                      <label className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em] mb-3 block">Total Payable Amount</label>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-bold text-blue-400">NGN</span>
                        <span className="text-3xl font-extrabold">{shareholder.amount_due.toLocaleString()}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-blue-300">Target Holdings</span>
                        <span className="text-sm font-bold">{shareholder.holdings_after.toLocaleString()} Units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Alert */}
            <div className="mt-8 p-6 bg-slate-900 rounded-xl flex items-start space-x-5 text-white shadow-xl">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="h-6 w-6 text-[#F58220]" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Need assistance with your records?</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Our professional support team is available to help clarify your entitlement or resolve discrepancies.
                  Reach out to <a href="mailto:registrars@apel.ng" className="text-[#F58220] hover:underline">registrars@apel.ng</a> referencing your Registration ID.
                </p>
              </div>
            </div>
          </div>

          {/* Action Cards Segment */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">

            {/* Online Submission - Preferred */}
            <div className="card shadow-md border-[#0A4269] bg-white group hover:shadow-xl transition-all h-full flex flex-col">
              <div className="p-1 uppercase text-[9px] font-extrabold tracking-[0.3em] text-white bg-[#0A4269] text-center rounded-t-sm">
                Recommended Solution
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-[#0A4269]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Electronic Portal</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Fastest way to process your rights. Fill, sign, and submit everything digitally through our secure environment.
                </p>

                <div className="space-y-4 mb-10 mt-auto">
                  {[
                    'Instant validation check',
                    'Biometric-ready signature',
                    'Cloud receipt storage'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center text-xs font-bold text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-[#0A4269]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  to={`/form-submission/${id}`}
                  className="btn-primary w-full py-4 text-base font-bold tracking-wide shadow-blue-500/20 shadow-lg"
                >
                  START SECURE PORTAL
                </Link>
              </div>
            </div>

            {/* Offline Submission */}
            <div className="card shadow-sm border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                    <Download className="h-6 w-6 text-slate-700" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">Standard</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Paper Records</h3>
                <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                  Generate a pre-filled PDF document for manual processing and physical filing.
                </p>
                <button
                  onClick={handleDownloadPrefilledForm}
                  disabled={downloading}
                  className="btn-outline w-full py-3 font-bold text-sm bg-white"
                >
                  {downloading ? (
                    'GENERATING PDF...'
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      DOWNLOAD DOCUMENT
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareholderDetailsPage;