import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Receipt, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getRightsSubmissionById, downloadFile } from '../services/api';

const RightsSubmissionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await getRightsSubmissionById(id);
        
        if (response.success) {
          setSubmission(response.data);
        } else {
          toast.error('Failed to load submission details');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        toast.error('Error loading submission details');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, navigate]);

  const handleDownload = async (filePath, fileName) => {
    try {
      const response = await downloadFile(filePath);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      if (error.response?.status === 404) {
        toast.error('File not found. It may have been deleted or not uploaded properly.');
      } else {
        toast.error('Error downloading file');
      }
    }
  };

  const handleViewFile = async (filePath, fileName) => {
    try {
      const response = await downloadFile(filePath);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      setSelectedFile({ url, name: fileName, type: fileName.toLowerCase().includes('.pdf') ? 'pdf' : 'image' });
      setShowFileViewer(true);
    } catch (error) {
      console.error('Error loading file:', error);
      if (error.response?.status === 404) {
        toast.error('File not found. It may have been deleted or not uploaded properly.');
      } else {
        toast.error('Error loading file');
      }
    }
  };

  const closeFileViewer = () => {
    setShowFileViewer(false);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Submission not found</p>
          <Link to="/admin" className="btn-primary">
            Back to Admin Dashboard
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
            to="/admin"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-600">Admin Dashboard</span>
            <span>/</span>
            <span>Rights Submission Details</span>
          </div>
        </div>

        {/* Submission Details */}
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rights Submission Details</h1>
            <p className="text-gray-600 mt-2">View and manage submission information</p>
          </div>

          {/* Submission Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-blue-700 font-medium">CHN:</span>
                  <p className="font-semibold">{submission.chn}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Reg Account Number:</span>
                  <p className="font-semibold">{submission.reg_account_number}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <p className="font-semibold">{submission.name}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Holdings:</span>
                  <p className="font-semibold">{submission.holdings.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Rights Issue:</span>
                  <p className="font-semibold">{submission.rights_issue}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Acceptance Type:</span>
                  <p className="font-semibold capitalize">{submission.action_type}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Amount Payable:</span>
                  <p className="font-semibold">
                    ₦{submission.amount_payable ? 
                      new Intl.NumberFormat('en-NG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(parseFloat(submission.amount_payable)) : 
                      '0.00'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <div className="inline-block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'Pending'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Submitted:</span>
                  <p className="font-semibold">{new Date(submission.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Files Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4">Uploaded Files</h3>
              <div className="space-y-4">
                {/* Filled Form */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Filled Form</span>
                    </div>
                    {submission.filled_form_path && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {submission.filled_form_path ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile(submission.filled_form_path, 'filled-form.pdf')}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(submission.filled_form_path, 'filled-form.pdf')}
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No file uploaded</p>
                  )}
                </div>

                {/* Receipt */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Payment Receipt</span>
                    </div>
                    {submission.receipt_path && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {submission.receipt_path ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile(submission.receipt_path, 'receipt.pdf')}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(submission.receipt_path, 'receipt.pdf')}
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No file uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link
              to="/admin"
              className="btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {showFileViewer && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
              <button
                onClick={closeFileViewer}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {selectedFile.type === 'pdf' ? (
                <iframe
                  src={selectedFile.url}
                  className="w-full h-[70vh] border-0"
                  title={selectedFile.name}
                />
              ) : (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedFile.url;
                  link.download = selectedFile.name;
                  link.click();
                }}
                className="btn-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightsSubmissionDetailsPage;