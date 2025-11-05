import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload } from 'lucide-react';
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
    link.setAttribute('download', `TIP_RIGHTS_${shareholder.reg_account_number}_${shareholder.name.replace(/\s+/g, '_')}.pdf`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shareholder details...</p>
        </div>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Shareholder not found'}</p>
          <Link to="/" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-600">Search</span>
            <span>/</span>
            <span>Shareholder Details</span>
          </div>
        </div>

        {/* Shareholder Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shareholder Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">REG ACCOUNT NUMBER</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.reg_account_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">NAME</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">HOLDINGS</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.holdings.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">RIGHTS ISSUE</label>
                <p className="text-lg font-semibold text-gray-900">{shareholder.rights_issue}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">HOLDINGS AFTER</label>
                <p className="text-lg font-semibold text-green-600">{shareholder.holdings_after.toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">AMOUNT PAYABLE</label>
                <p className="text-lg font-semibold text-green-600">{shareholder.amount_due.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Option - Side by Side */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Choose Your Option</h2>
          
          <div className="flex flex-col lg:flex-row items-stretch gap-8">
            {/* Download Prefilled PDF Form */}
            <div className="flex-1 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-blue-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Download Pre-filled Form</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download a PDF form with your details pre-filled. Print, sign, and submit with payment receipt.
              </p>
              
              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Your details automatically filled</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Print, fill form and sign manually</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Submit with payment receipt to <span className="font-semibold"><a href="mailto:registrars@apel.ng">registrars@apel.ng</a></span></span>
                </div>
              </div>
              
              <button
                onClick={handleDownloadPrefilledForm}
                disabled={downloading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {downloading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-small mr-2"></div>
                    Generating PDF...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Form
                  </div>
                )}
              </button>
            </div>

            {/* Vertical OR Divider - Only show on large screens */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="h-0.5 w-12 bg-gray-300"></div>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-500 my-2">OR</div>
              <div className="h-0.5 w-12 bg-gray-300"></div>
            </div>

            {/* Horizontal OR Divider - Only show on mobile */}
            <div className="lg:hidden flex items-center justify-center my-2">
              <div className="w-full flex items-center">
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <span className="px-3 text-sm font-medium text-gray-500">OR</span>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
              </div>
            </div>

            {/* Submit Form Online */}
            <div className="flex-1 border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-green-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Submit Form Online</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fill out the digital form online and submit electronically with your payment receipt.
              </p>
              
              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Fill form digitally</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Upload digital signature</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Upload payment receipt <br></br>and submit online</span>
                </div>
              </div>
              
              <Link
                to={`/form-submission/${id}`}
                className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Online
              </Link>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
               <p className="text-sm text-yellow-700">
  <strong>Important:</strong> For the download option, please email your completed form and payment receipt to{' '}
  <span className="font-semibold"><a href="mailto:registrars@apel.ng">registrars@apel.ng</a></span>. <br></br>For online submission, your form will be automatically submitted to us without needing to print out you will also get a copy of your form through the portal ansd sent to your email.
</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add spinner styles */}
      <style jsx>{`
        .spinner-small {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ShareholderDetailsPage;