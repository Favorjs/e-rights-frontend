import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Receipt, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  getRightsSubmissionById,
  downloadFileFromCloudinary,
  streamFileFromCloudinary
} from '../services/api';

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

  // Generate Cloudinary view URL (for preview)
  const getCloudinaryViewUrl = (publicId) => {
    if (!publicId) return null;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  };

  // Generate Cloudinary download URL
  const getCloudinaryDownloadUrl = (publicId, fileName = 'download') => {
    if (!publicId) return null;
    
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
    
    // Remove file extension from filename for fl_attachment
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    
    // Clean filename for URL safety
    const cleanFileName = fileNameWithoutExtension
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    
    // Use the exact format that works for both images and PDFs
    return `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment:${cleanFileName}/${publicId}`;
  };

  const handleDownload = async (publicId, fileName) => {
    try {
      if (!publicId) {
        toast.error('File not available for download');
        return;
      }
  
      // Use the API endpoint for downloading files
      const response = await downloadFileFromCloudinary(publicId, fileName);
      
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Revoke the blob URL to free up memory
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };
  
  const handleViewFile = async (publicId, fileName) => {
    try {
      if (!publicId) {
        toast.error('File not available for viewing');
        return;
      }
  
      // Use the API endpoint for streaming files
      const response = await streamFileFromCloudinary(publicId, fileName);
      const fileUrl = URL.createObjectURL(response);
      
      setSelectedFile({ 
        url: fileUrl, 
        name: fileName, 
        publicId: publicId
      });
      setShowFileViewer(true);
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Error loading file');
    }
  };

  const closeFileViewer = () => {
    setShowFileViewer(false);
    setSelectedFile(null);
  };

  // Helper function to get appropriate file names
  const getFileName = (fileType, submission) => {
    const baseName = `rights-submission-${submission?.reg_account_number || submission?.id || 'unknown'}`;
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (fileType) {
      case 'filled_form':
        return `${baseName}-filled-form-${timestamp}.pdf`;
      case 'receipt':
        return `${baseName}-receipt-${timestamp}.jpg`;
      case 'signature':
        return `${baseName}-signature-${timestamp}.png`;
      default:
        return `${baseName}-document-${timestamp}.pdf`;
    }
  };

  // Debug: Log the submission data to see what's in filled_form_path
  useEffect(() => {
    if (submission) {
      console.log('Submission data:', submission);
      console.log('Filled form path:', submission.filled_form_path);
      console.log('Receipt path:', submission.receipt_path);
      console.log('Signature paths:', submission.signature_paths);
      
      // Test the URLs
      if (submission.filled_form_path) {
        const viewUrl = getCloudinaryViewUrl(submission.filled_form_path);
        const downloadUrl = getCloudinaryDownloadUrl(submission.filled_form_path, 'test.pdf');
        console.log('Filled form view URL:', viewUrl);
        console.log('Filled form download URL:', downloadUrl);
      }
    }
  }, [submission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        </div>

        {/* Submission Details */}
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rights Submission Details</h1>
            <p className="text-gray-600 mt-2">Submission ID: {submission.id}</p>
          </div>

          {/* Submission Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-blue-700 font-medium">CHN:</span>
                  <p className="font-semibold">{submission.chn || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Reg Account Number:</span>
                  <p className="font-semibold">{submission.reg_account_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <p className="font-semibold">{submission.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Holdings:</span>
                  <p className="font-semibold">{submission.holdings?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Rights Issue:</span>
                  <p className="font-semibold">{submission.rights_issue?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Acceptance Type:</span>
                  <p className="font-semibold capitalize">{(submission.action_type || '').replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Amount Payable:</span>
                  <p className="font-semibold">₦{submission.amount_payable ? parseFloat(submission.amount_payable).toLocaleString('en-NG', {minimumFractionDigits: 2}) : '0.00'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <div className="inline-block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(submission.status || 'pending').charAt(0).toUpperCase() + (submission.status || 'pending').slice(1)}
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
                {/* Filled Form - PDF */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Filled Form (PDF)</span>
                    </div>
                    {submission.filled_form_path ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-red-500 text-sm">Missing</span>
                    )}
                  </div>
                  {submission.filled_form_path ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile(submission.filled_form_path, getFileName('filled_form', submission))}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View PDF
                      </button>
                      <button
                        onClick={() => handleDownload(submission.filled_form_path, getFileName('filled_form', submission))}
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No PDF uploaded</p>
                  )}
                </div>

                {/* Receipt */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Payment Receipt</span>
                    </div>
                    {submission.receipt_path ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-red-500 text-sm">Missing</span>
                    )}
                  </div>
                  {submission.receipt_path ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile(submission.receipt_path, getFileName('receipt', submission))}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(submission.receipt_path, getFileName('receipt', submission))}
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No receipt uploaded</p>
                  )}
                </div>

                {/* Signatures */}
                {submission.signature_paths && submission.signature_paths.length > 0 ? (
                  <div className="border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Signatures ({submission.signature_paths.length})</span>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      {submission.signature_paths.map((signaturePath, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Signature {index + 1}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewFile(signaturePath, getFileName('signature', submission))}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(signaturePath, getFileName('signature', submission))}
                              className="flex items-center text-green-600 hover:text-green-800 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Signatures</span>
                      </div>
                      <span className="text-red-500 text-sm">Missing</span>
                    </div>
                    <p className="text-gray-500 text-sm">No signatures uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link to="/admin" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {showFileViewer && selectedFile && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">{selectedFile.name || 'Document'}</h3>
        <button
          onClick={closeFileViewer}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {selectedFile.url.endsWith('.pdf') ? (
          <iframe
            src={selectedFile.url}
            className="w-full h-full min-h-[70vh]"
            title={selectedFile.name || 'Document'}
          />
        ) : (
          <img
            src={selectedFile.url}
            alt={selectedFile.name || 'Document'}
            className="max-w-full max-h-[70vh] mx-auto"
            onError={(e) => {
              console.error('Error loading image:', e);
              toast.error('Error loading file. The file format may not be supported.');
            }}
          />
        )}
      </div>
      <div className="p-4 border-t flex justify-end space-x-2">
        <a
          href={selectedFile.url}
          download={selectedFile.name || 'download'}
          className="btn-secondary"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </a>
        <button
          onClick={closeFileViewer}
          className="btn-primary"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default RightsSubmissionDetailsPage;