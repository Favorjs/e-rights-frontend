import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, DollarSign, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const DigitalFormPage = () => {
  const { shareholderId } = useParams();
  const navigate = useNavigate();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('23843234090');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  // const acceptanceType = watch('acceptance_type', 'full');

  useEffect(() => {
    const fetchShareholder = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/shareholders/${shareholderId}`);
        
        if (response.data.success) {
          setShareholder(response.data.data);
          // Pre-fill form with shareholder data
          setValue('contact_name', response.data.data.name);
        } else {
          toast.error('Failed to load shareholder details');
        }
      } catch (error) {
        console.error('Error fetching shareholder:', error);
        toast.error('Error loading shareholder details');
      } finally {
        setLoading(false);
      }
    };

    fetchShareholder();
  }, [shareholderId, setValue]);

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Signature file must be less than 5MB');
        return;
      }
      setSignatureFile(file);
    }
  };

  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Receipt file must be less than 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!signatureFile || !receiptFile) {
      toast.error('Please upload both signature and receipt files');
      return;
    }

    setSubmitting(true);

    try {
      // Upload files first
      const formData = new FormData();
      formData.append('signature', signatureFile);
      formData.append('receipt', receiptFile);

      const uploadResponse = await axios.post('/api/uploads/both', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadResponse.data.success) {
        // Submit form data
        const formDataToSubmit = {
          ...data,
          shareholder_id: parseInt(shareholderId),
          signature_file: uploadResponse.data.data.signature.filePath,
          receipt_file: uploadResponse.data.data.receipt.filePath
        };

        const submitResponse = await axios.post('/api/forms', formDataToSubmit);

        if (submitResponse.data.success) {
          toast.success('Form submitted successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!shareholder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Shareholder not found</p>
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
            to={`/shareholder/${shareholderId}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Shareholder Details
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-600">Search</span>
            <span>/</span>
            <span>Shareholder Details</span>
            <span>/</span>
            <span>Digital Form</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Form Header */}
          <div className="card">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ACCEPTANCE/RENUNCIATION FORM</h1>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Application List Open: July 30, 2005</span>
                <span>Application List Close: September 06, 2005</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-700 mb-6">
              <p>
                Rights Issue of 3,156,849,605 Ordinary Shares of 50 Kobo Each at N50 Per Share 
                on the basis of 1 new ordinary share for every 10 ordinary shares held as at 
                close of business on July 14, 2005. Payable in full on Acceptance.
              </p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">REG. ACCOUNT NUMBER</label>
                <input
                  type="text"
                  value={shareholder.reg_account_number}
                  className="form-input bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="form-label">NAME</label>
                <input
                  type="text"
                  value={shareholder.name}
                  className="form-input bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="form-label">UNITS HELD</label>
                <input
                  type="text"
                  value={shareholder.holdings.toLocaleString()}
                  className="form-input bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="form-label">RIGHTS DUE</label>
                <input
                  type="text"
                  value={shareholder.rights_issue}
                  className="form-input bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="form-label">AMOUNT</label>
                <input
                  type="text"
                  value={`N${(shareholder.rights_issue * 50).toLocaleString()}.00`}
                  className="form-input bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Acceptance Options */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acceptance Options</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="full"
                  {...register('acceptance_type', { required: 'Please select an acceptance type' })}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-900">
                  We accept in full, the provisional allotment shown on the front of this form.
                </span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="partial"
                  {...register('acceptance_type')}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-900">
                  We accept only partial shares and enclose payment accordingly.
                </span>
              </label>
            </div>
            
            {errors.acceptance_type && (
              <p className="text-red-600 text-sm mt-2">{errors.acceptance_type.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Name(s) (in block letters)</label>
                <input
                  type="text"
                  {...register('contact_name', { required: 'Contact name is required' })}
                  className="form-input"
                />
                {errors.contact_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.contact_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Next of Kin</label>
                <input
                  type="text"
                  {...register('next_of_kin')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Daytime Telephone Number</label>
                <input
                  type="tel"
                  {...register('daytime_phone')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Mobile (GSM) Telephone Number</label>
                <input
                  type="tel"
                  {...register('mobile_phone')}
                  className="form-input"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="form-input"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Details (For E-Dividend)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Name of Bank</label>
                <input
                  type="text"
                  {...register('bank_name')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  {...register('bank_branch')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  {...register('account_number')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Bank Verification Number</label>
                <input
                  type="text"
                  {...register('bvn')}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Signature Upload */}
              <div>
                <label className="form-label">Upload Signature *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload your signature</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSignatureUpload}
                    className="file-upload"
                  />
                  <button type="button" className="btn-primary text-sm">
                    Choose File
                  </button>
                  {signatureFile && (
                    <p className="text-sm text-green-600 mt-2">{signatureFile.name}</p>
                  )}
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="form-label">Upload Payment Receipt *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload your payment receipt</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="file-upload"
                  />
                  <button type="button" className="btn-primary text-sm">
                    Choose File
                  </button>
                  {receiptFile && (
                    <p className="text-sm text-green-600 mt-2">{receiptFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Payment Account Numbers :</h3>
                  <div className="space-y-1 text-sm text-yellow-700">
                    <p><strong>Account Number:</strong> {paymentAccountNumber}</p>
                    <p><strong>Bank:</strong> United Bank for Africa</p>
                    <p>Please use this account number for payment and upload the receipt above.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement and Submit */}
          <div className="card">
            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                {...register('agreement', { required: 'You must agree to the terms and conditions' })}
                className="mt-1 text-green-600 focus:ring-green-500"
              />
              <label className="text-sm text-gray-700">
                I agree to the terms and conditions and confirm that all information provided is accurate.
              </label>
            </div>
            
            {errors.agreement && (
              <p className="text-red-600 text-sm mb-4">{errors.agreement.message}</p>
            )}

            <div className="flex justify-between items-center">
              <Link to={`/shareholder/${shareholderId}`} className="text-green-600 hover:text-green-700">
                Back
              </Link>
              
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DigitalFormPage; 