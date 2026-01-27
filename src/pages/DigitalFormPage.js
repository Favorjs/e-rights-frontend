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
  const [paymentAccountNumber] = useState('23843234090');



  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      acceptance_type: 'full',
      apply_additional: false
    }
  });

  const acceptanceType = watch('acceptance_type', 'full');
  const applyAdditional = watch('apply_additional', false);

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
      <div className="App flex items-center justify-center p-8">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4 border-t-emerald-600"></div>
          <p className="text-slate-600 font-semibold tracking-wide">Initializing application portal...</p>
        </div>
      </div>
    );
  }

  if (!shareholder) {
    return (
      <div className="App flex items-center justify-center p-8">
        <div className="card max-w-md w-full p-12 text-center animate-fade-in shadow-xl">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-8">This application session is no longer active or valid.</p>
          <Link to="/" className="btn-secondary w-full py-3">
            Return to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-slate-50/50">
      <div className="container-custom py-12">
        {/* Navigation & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="animate-fade-in">
            <Link
              to={`/shareholder/${shareholderId}`}
              className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800 mb-4 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              BACK TO PROFILE
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight">
              Rights Application
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Acceptance and renunciation portal for <span className="text-slate-900 font-bold">{shareholder.name}</span>
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            <span className="text-emerald-600 uppercase tracking-widest">Portal Version 2.0</span>
            <span className="mx-2 opacity-30">/</span>
            <span className="uppercase tracking-widest">Secure session</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* Important Notice */}
          <div className="card border-l-4 border-l-emerald-600 shadow-sm bg-white overflow-hidden">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Financial Disclaimer</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                Rights Issue of 3,156,849,605 Ordinary Shares of 50 Kobo Each at N50 Per Share on the basis of 1 new ordinary share for every 10 ordinary shares held as at close of business on July 14, 2005. <span className="text-slate-900 font-bold underline">Payable in full on Acceptance.</span>
              </p>
            </div>
            <div className="bg-slate-50 px-8 py-3 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <span>Opening Date: July 30</span>
              <span className="text-red-500">Closing Date: Sept 06</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-8 space-y-10">

              {/* Profile Data (Read Only) */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Record Data</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Reg ID</label>
                    <p className="text-lg font-bold text-slate-900">{shareholder.reg_account_number}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Current Holdings</label>
                    <p className="text-lg font-bold text-slate-900">{shareholder.holdings.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Due Allotment</label>
                    <p className="text-lg font-bold text-emerald-700">{shareholder.rights_issue.toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {/* Acceptance Logic */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Acceptance Preferences</h3>
                </div>

                <div className="space-y-4">
                  <label className={`card p-6 cursor-pointer border-2 transition-all block ${acceptanceType === 'full' ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          value="full"
                          {...register('acceptance_type', { required: 'Please select an acceptance type' })}
                          className="h-5 w-5 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg">Full Acceptance</h4>
                        <p className="text-slate-500 text-sm mt-1">Accept the complete provisional allotment in full.</p>

                        {acceptanceType === 'full' && (
                          <div className="mt-6 pt-6 border-t border-emerald-100 flex flex-col space-y-4">
                            <label className="flex items-center space-x-3 group">
                              <input
                                type="checkbox"
                                {...register('apply_additional')}
                                className="h-5 w-5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                              />
                              <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">Also apply for additional shares</span>
                            </label>

                            {applyAdditional && (
                              <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-6 bg-white rounded-xl border border-emerald-100 shadow-inner">
                                <div className="space-y-2">
                                  <label className="label-custom">Shares Amount</label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    {...register('additional_shares', {
                                      min: { value: 1, message: 'Must be at least 1' },
                                      valueAsNumber: true
                                    })}
                                    className="input-custom"
                                  />
                                  {errors.additional_shares && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.additional_shares.message}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="label-custom">Amount Payable (₦)</label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    {...register('additional_amount', {
                                      required: 'Required',
                                      min: { value: 0.01, message: 'Invalid amount' },
                                      valueAsNumber: true
                                    })}
                                    className="input-custom"
                                  />
                                  {errors.additional_amount && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.additional_amount.message}</p>}
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <label className="label-custom">Bank</label>
                                    <input type="text" {...register('additional_payment_bank_name')} className="input-custom text-sm" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="label-custom">Cheque/Ref</label>
                                    <input type="text" {...register('additional_payment_cheque_number')} className="input-custom text-sm" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="label-custom">Branch</label>
                                    <input type="text" {...register('additional_payment_branch')} className="input-custom text-sm" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  <label className={`card p-6 cursor-pointer border-2 transition-all block ${acceptanceType === 'partial' ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          value="partial"
                          {...register('acceptance_type')}
                          className="h-5 w-5 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg">Partial Acceptance</h4>
                        <p className="text-slate-500 text-sm mt-1">Accept only a portion of your allotment.</p>

                        {acceptanceType === 'partial' && (
                          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-emerald-100">
                            <div className="space-y-2">
                              <label className="label-custom">Shares Accepted</label>
                              <input
                                type="number"
                                placeholder="0"
                                {...register('shares_accepted', {
                                  required: 'Required',
                                  min: { value: 1, message: 'Invalid' },
                                  valueAsNumber: true
                                })}
                                className="input-custom"
                              />
                              {errors.shares_accepted && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.shares_accepted.message}</p>}
                            </div>
                            <div className="space-y-2">
                              <label className="label-custom">Payment (₦)</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                {...register('amount_payable', {
                                  required: 'Required',
                                  min: { value: 0.01, message: 'Invalid' },
                                  valueAsNumber: true
                                })}
                                className="input-custom"
                              />
                              {errors.amount_payable && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.amount_payable.message}</p>}
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="label-custom">Bank</label>
                                <input type="text" {...register('partial_payment_bank_name')} className="input-custom text-sm" />
                              </div>
                              <div className="space-y-2">
                                <label className="label-custom">Cheque/Ref</label>
                                <input type="text" {...register('partial_payment_cheque_number')} className="input-custom text-sm" />
                              </div>
                              <div className="space-y-2">
                                <label className="label-custom">Branch</label>
                                <input type="text" {...register('partial_payment_branch')} className="input-custom text-sm" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Contact Information */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Registrant Contact Details</h3>
                </div>
                <div className="card p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                  <div className="md:col-span-2 space-y-2">
                    <label className="label-custom">Contact Name *</label>
                    <input type="text" {...register('contact_name', { required: 'Name is required' })} className="input-custom" placeholder="FULL LEGAL NAME" />
                    {errors.contact_name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.contact_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="label-custom">Primary Phone</label>
                    <input type="tel" {...register('mobile_phone')} className="input-custom" placeholder="+234..." />
                  </div>
                  <div className="space-y-2">
                    <label className="label-custom">Email Address *</label>
                    <input type="email" {...register('email', { required: 'Email required' })} className="input-custom" placeholder="name@domain.com" />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="label-custom">Next of Kin</label>
                    <input type="text" {...register('next_of_kin')} className="input-custom" placeholder="BENEFICIARY NAME" />
                  </div>
                </div>
              </section>

              {/* Banking Section */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">E-Dividend Mandate</h3>
                </div>
                <div className="card p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
                  <div className="space-y-2">
                    <label className="label-custom">Mandate Bank</label>
                    <input type="text" {...register('bank_name')} className="input-custom py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="label-custom">Account Number</label>
                    <input type="text" {...register('account_number')} className="input-custom py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="label-custom">BVN (Optional)</label>
                    <input type="text" {...register('bvn')} className="input-custom py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="label-custom">Bank Branch</label>
                    <input type="text" {...register('bank_branch')} className="input-custom py-3" />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Uploads & Metadata */}
            <div className="lg:col-span-4 space-y-8">

              {/* Submission Checklist */}
              <div className="card p-8 bg-slate-900 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-6">Verification Checklist</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Provisional entitlement', value: 'Verified', color: 'emerald' },
                    { label: 'Payment Receipt', value: receiptFile ? 'Uploaded' : 'Pending', color: receiptFile ? 'emerald' : 'slate' },
                    { label: 'Signature File', value: signatureFile ? 'Uploaded' : 'Pending', color: signatureFile ? 'emerald' : 'slate' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{item.label}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload Sections */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Artifact Uploads</h3>
                </div>

                {/* Signature */}
                <div className={`card p-8 border-2 border-dashed transition-all relative ${signatureFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                  <input type="file" accept="image/*,.pdf" onChange={handleSignatureUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${signatureFile ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Save className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mb-1">{signatureFile ? signatureFile.name : 'Upload Signature'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Click or drag & drop</p>
                  </div>
                </div>

                {/* Receipt */}
                <div className={`card p-8 border-2 border-dashed transition-all relative ${receiptFile ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                  <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${receiptFile ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mb-1">{receiptFile ? receiptFile.name : 'Proof of Payment'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Receipt / Transfer Screenshot</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="card p-8 bg-amber-50 border border-amber-200">
                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em] mb-4">Official Payment Account</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wider mb-1">Account Number</p>
                    <p className="text-2xl font-black text-amber-900 tracking-tighter">{paymentAccountNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wider mb-1">Corporate Bank</p>
                    <p className="text-sm font-bold text-amber-950">United Bank for Africa (UBA)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Finalization */}
          <div className="pt-12 border-t border-slate-200">
            <div className="max-w-xl mx-auto text-center">
              <label className="flex items-start justify-center space-x-3 mb-10 group cursor-pointer">
                <input
                  type="checkbox"
                  {...register('agreement', { required: 'Mandatory' })}
                  className="h-6 w-6 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-1"
                />
                <span className="text-sm text-left text-slate-600 group-hover:text-slate-900 transition-colors">
                  I hereby certify that all information provided in this digital application is accurate, and I authorize the processing of my rights allotment based on these details.
                </span>
              </label>
              {errors.agreement && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 -mt-6">Agreement is required to proceed</p>}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to={`/shareholder/${shareholderId}`} className="text-sm font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                  Review Profile
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-12 py-5 text-lg font-bold shadow-xl shadow-emerald-700/20 disabled:opacity-50 min-w-[280px]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="loading-spinner h-5 w-5 border-t-white mr-3"></div>
                      TRANSMITTING...
                    </span>
                  ) : (
                    'EXECUTE APPLICATION'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DigitalFormPage;