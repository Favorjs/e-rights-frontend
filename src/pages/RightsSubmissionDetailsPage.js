import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Eye, FileText, Receipt, CheckCircle, X, ZoomIn, ZoomOut} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getRightsSubmissionById } from '../services/api';

const RightsSubmissionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });


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
 // Update the Cloudinary URL generation functions
// Generate Cloudinary view URL
const getCloudinaryViewUrl = (publicId) => {
  if (!publicId) return null;
  
  // For viewing, use the direct delivery URL
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
  
  // Check if it's likely a PDF based on public_id or use direct URL
  if (publicId.includes('.pdf') || publicId.toLowerCase().endsWith('pdf')) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  }
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

// Generate Cloudinary download URL using the API format
const getCloudinaryDownloadUrl = (publicId, fileName = 'download') => {
  if (!publicId) return null;

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
  
  // Extract just the public_id without folder path if needed
  const cleanPublicId = publicId.replace(/^rights-submissions\/[^/]+\//, '');
  
  // Use the API download endpoint format you found in console
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/download?public_id=${encodeURIComponent(publicId)}&attachment=true&target_filename=${encodeURIComponent(fileName)}`;
};

// Alternative direct download URL (simpler approach)
const getDirectDownloadUrl = (publicId, fileName = 'download') => {
  if (!publicId) return null;
  
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment:${cleanFileName}/${publicId}`;
};



// Update the handleViewFile function to handle PDFs properly
const handleViewFile = (publicId, fileName) => {
  try {
    if (!publicId) {
      toast.error('File not available for viewing');
      return;
    }

    // Determine file type
    const isPDF = publicId.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.pdf');
    const viewUrl = getCloudinaryViewUrl(publicId, isPDF ? 'pdf' : 'image');

    if (!viewUrl) {
      toast.error('Could not generate view URL');
      return;
    }

    setSelectedFile({
      url: viewUrl,
      name: fileName,
      publicId: publicId,
      type: isPDF ? 'pdf' : 'image'
    });
    setShowFileViewer(true);
  } catch (error) {
    console.error('Error loading file:', error);
    toast.error('Error loading file');
  }
};
  // Generate Cloudinary download URL


  const handleDownload = (publicId, fileName) => {
    try {
      if (!publicId) {
        toast.error('File not available for download');
        return;
      }

      const downloadUrl = getCloudinaryDownloadUrl(publicId, fileName);

      if (!downloadUrl) {
        toast.error('Could not generate download URL');
        return;
      }

      // Open download URL in new tab
      window.open(downloadUrl, '_blank');

      toast.success('Download started successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
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
// Add these helper functions
const handleZoomIn = () => {
  setZoomLevel(prev => Math.min(prev + 0.2, 3));
};

const handleZoomOut = () => {
  setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
};

const handleResetZoom = () => {
  setZoomLevel(1);
  setPosition({ x: 0, y: 0 });
};

const handleMouseDown = (e) => {
  if (e.button !== 0) return; // Only left mouse button
  setIsDragging(true);
  setDragStart({
    x: e.clientX - position.x,
    y: e.clientY - position.y
  });
  document.body.style.cursor = 'grabbing';
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  
  const x = e.clientX - dragStart.x;
  const y = e.clientY - dragStart.y;
  
  setPosition({ x, y });
};

const handleMouseUp = () => {
  setIsDragging(false);
  document.body.style.cursor = 'default';
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
                  <p className="font-semibold">₦{submission.amount_payable ? parseFloat(submission.amount_payable).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <div className="inline-block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${submission.status === 'completed' ? 'bg-green-100 text-green-800' :
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

      {/* File Viewer Modal */}
{showFileViewer && selectedFile && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
    <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">{selectedFile.name || 'Document'}</h3>
        <div className="flex items-center space-x-2">
          {selectedFile.type === 'image' && (
            <>
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="text-xs text-blue-600 hover:underline ml-2"
              >
                Reset
              </button>
            </>
          )}
          <button
            onClick={closeFileViewer}
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      <div 
        className="flex-1 overflow-auto p-4 relative"
        onMouseMove={selectedFile.type === 'image' ? handleMouseMove : undefined}
      >
        {selectedFile.type === 'pdf' ? (
          <div className="w-full h-full">
            <iframe
              src={`${selectedFile.url}#toolbar=1&navpanes=1&view=FitH`}
              className="w-full h-[70vh] border-0"
              title={selectedFile.name || 'PDF Document'}
            />
          </div>
        ) : (
          <div 
            className="w-full h-full overflow-auto"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          >
            <div
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                width: 'fit-content',
                height: 'fit-content',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <img
                src={selectedFile.url}
                alt={selectedFile.name || 'Document'}
                className="max-w-none"
                style={{
                  maxWidth: 'none',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedFile.type === 'image' && (
            <span>Drag to pan | Scroll to zoom</span>
          )}
        </div>
        <div className="flex space-x-2">
          <a
            href={getCloudinaryDownloadUrl(selectedFile.publicId, selectedFile.name)}
            download
            className="btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Download started');
            }}
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
  </div>
)}
    </div>
  );
};

export default RightsSubmissionDetailsPage;