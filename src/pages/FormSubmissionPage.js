import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Eye, Download, ChevronRight, ChevronLeft, Info, Search, X, ChevronDown, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getShareholderById, getStockbrokers, submitRightsForm, previewRightsForm } from '../services/api';
import FundWalletModal from '../components/FundWalletModal';
import bankData from '../utils/banks.json';
import linkageLogo from '../assets/images/linkage.png';
import apelLogo from '../assets/images/Apel-ASSET-Logo.png';
import capitalExpressLogo from '../assets/images/capital express.png';

// Internal SearchableSelect for alignment with existing structure
const InternalSearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  name // field name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      String(option.name || option).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => String(opt.id || opt) === String(value));
  const displayValue = selectedOption ? (selectedOption.name || (typeof selectedOption === 'string' ? selectedOption : '')) : '';

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className={`relative w-full min-w-[240px] md:min-w-[320px] border rounded-xl shadow-sm pl-4 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0A4269] text-sm ${className || 'bg-white border-slate-200 text-slate-900'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!displayValue ? 'text-slate-400' : 'font-medium'}`}>
          {displayValue || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white shadow-2xl rounded-xl py-1 text-sm ring-1 ring-slate-900/5 overflow-hidden animate-fade-in max-h-[80vh] md:max-h-80">
          <div className="px-3 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0A4269]"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = option.id || option;
                const optionLabel = option.name || option;
                return (
                  <div
                    key={`${optionValue}-${index}`}
                    className={`px-4 py-2.5 text-sm transition-colors cursor-pointer ${value === optionValue ? 'bg-blue-50 text-[#0A4269] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ target: { name: name || 'stockbroker', value: optionValue } });
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {optionLabel}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-xs text-slate-400 font-medium">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const steps = [
  { id: 1, title: 'Instructions', description: 'Read and accept instructions' },
  { id: 2, title: 'Stockbroker & CHN', description: 'Enter stockbroker and CHN details' },
  { id: 3, title: 'Action Choice', description: 'Select your action type' },
  { id: 4, title: 'Action Details', description: 'Complete your selected action' },
  { id: 5, title: 'Personal & Bank Info', description: 'Contact and banking information' },
  { id: 6, title: 'Signature & Receipt', description: 'Upload documents' },
  { id: 7, title: 'Summary & Submit', description: 'Review and final submission' }
];
const totalSteps = steps.length;
const banks = bankData.data ? bankData.data.map(b => ({ id: b.bankname, name: b.bankname })) : [];

const FormSubmissionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBalance, setPendingBalance] = useState(() => {
    const saved = sessionStorage.getItem(`e_rights_payment_${id}_balance`);
    return saved ? parseFloat(saved) : null;
  });
  const handleUnderpayment = useCallback((balance) => {
    const val = parseFloat(balance);
    setPendingBalance(val);
    sessionStorage.setItem(`e_rights_payment_${id}_balance`, val.toString());
  }, [id]);
  const storageKey = `e_rights_form_${id}`;
  const paymentStorageKey = `e_rights_payment_${id}`;

  const [paymentVerified, setPaymentVerified] = useState(() => {
    const saved = sessionStorage.getItem(paymentStorageKey);
    return saved === 'true';
  });
  const [paymentTxRef, setPaymentTxRef] = useState(() => {
    const saved = sessionStorage.getItem(`${paymentStorageKey}_txRef`);
    return saved || null;
  });
  const [paymentProcessing, setPaymentProcessing] = useState(() => {
    return sessionStorage.getItem(`${paymentStorageKey}_processing`) === 'true';
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.currentStep || 1;
      } catch (e) { return 1; }
    }
    return 1;
  });

  const [stockbrokers, setStockbrokers] = useState([]);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [formData, setFormData] = useState(() => {
    const baseState = {
      reg_account_number: '',
      name: '',
      holdings: '',
      rights_issue: '',
      holdings_after: '',
      amount_due: '',
      instructions_read: false,
      stockbroker: '',
      chn: '',
      action_type: '',
      accept_full: false,
      apply_additional: false,
      additional_shares: '',
      additional_amount: '',
      accept_smaller_allotment: false,
      payment_amount: '',
      bank_name: '',
      cheque_number: '',
      branch: '',
      shares_accepted: '',
      amount_payable: '',
      shares_renounced: '',
      accept_partial: false,
      renounce_rights: false,
      trade_rights: false,
      contact_name: '',
      next_of_kin: '',
      daytime_phone: '',
      mobile_phone: '',
      email: '',
      bank_name_edividend: '',
      bank_branch_edividend: '',
      account_number: '',
      bvn: '',
      corporate_signatory_names: '',
      corporate_designations: '',
      signature_type: 'single',
      receipt: null,
      signatures: [null]
    };

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).formData || {};
        // Merge saved data but ensure files are null
        return {
          ...baseState,
          ...parsed,
          receipt: null,
          signatures: parsed.signatures ? parsed.signatures.map(() => null) : [null]
        };
      } catch (e) {
        return baseState;
      }
    }
    return baseState;
  });

  // Auto-save effect
  useEffect(() => {
    const dataToSave = {
      currentStep,
      formData: {
        ...formData,
        receipt: null,
        signatures: formData.signatures.map(() => null)
      }
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }, [currentStep, formData, storageKey]);

  const [submittedForm, setSubmittedForm] = useState(null);
  const [showFinalPreview, setShowFinalPreview] = useState(false);

  // Persist payment status to sessionStorage
  useEffect(() => {
    if (paymentVerified) {
      sessionStorage.setItem(paymentStorageKey, 'true');
    }
  }, [paymentVerified, paymentStorageKey]);


  useEffect(() => {
    if (formData.apply_additional && formData.additional_shares) {
      const shares = parseFloat(formData.additional_shares) || 0;
      const additionalAmount = (shares * 1.32).toFixed(2);
      setCalculatedAmount(parseFloat(additionalAmount));
      setFormData(prev => ({ ...prev, additional_amount: additionalAmount }));
    } else {
      setCalculatedAmount(0);
      setFormData(prev => ({ ...prev, additional_amount: '' }));
    }
  }, [formData.additional_shares, formData.apply_additional]);

  // Auto-calculate renunciation fields when shares_accepted changes
  useEffect(() => {
    if (formData.action_type !== 'renunciation_partial') return;
    const accepted = parseFloat(formData.shares_accepted) || 0;
    const totalRights = parseFloat(formData.rights_issue) || 0;
    const consideration = (accepted * 1.32).toFixed(2);
    const renounced = Math.max(0, totalRights - accepted);
    setFormData(prev => ({
      ...prev,
      amount_payable: consideration,
      shares_renounced: renounced.toString(),
    }));
  }, [formData.shares_accepted, formData.action_type, formData.rights_issue]);

  const calculateTotalPayment = (data = formData) => {
    if (data.action_type === 'renunciation_partial') {
      return (parseFloat(data.amount_payable) || 0).toFixed(2);
    }
    const amountDue = parseFloat(data.amount_due) || 0;
    const additionalAmount = parseFloat(data.additional_amount) || 0;
    return (amountDue + additionalAmount).toFixed(2);
  };

  useEffect(() => {
    const fetchShareholder = async () => {
      try {
        setLoading(true);
        const response = await getShareholderById(id);
        if (response.success) {
          const shareholderData = response.data;
          setShareholder(shareholderData);
          setFormData(prev => ({
            ...prev,
            reg_account_number: shareholderData.reg_account_number,
            name: shareholderData.name,
            holdings: shareholderData.holdings,
            rights_issue: shareholderData.rights_issue,
            holdings_after: shareholderData.holdings_after,
            amount_due: shareholderData.amount_due,
            contact_name: shareholderData.name,
          }));
        } else {
          toast.error('Failed to load shareholder details');
          navigate('/');
        }
      } catch (error) {
        toast.error('Error loading shareholder details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    const fetchStockbrokers = async () => {
      try {
        const response = await getStockbrokers();
        if (response.success) setStockbrokers(response.data);
      } catch (error) {
        setStockbrokers([]);
      }
    };
    fetchShareholder();
    fetchStockbrokers();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. JPG, PNG or PDF only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB');
      return;
    }

    if (field === 'signatures' && index !== null) {
      const newSignatures = [...formData.signatures];
      newSignatures[index] = file;
      setFormData(prev => ({ ...prev, signatures: newSignatures }));
    } else {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
    toast.success('File uploaded successfully');
  };

  const addSignatureField = () => {
    setFormData(prev => ({
      ...prev,
      signatures: [...prev.signatures, null]
    }));
  };

  const removeSignatureField = (index) => {
    if (formData.signatures.length <= 1) return;
    const newSignatures = formData.signatures.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      signatures: newSignatures
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: return formData.instructions_read;
      case 2: return formData.stockbroker && formData.chn;
      case 3: return !!formData.action_type;
      case 4:
        if (formData.action_type === 'full_acceptance') {
          return formData.accept_full && formData.bank_name && (!formData.apply_additional || formData.additional_shares);
        }
        return formData.shares_accepted && formData.amount_payable && formData.bank_name && (formData.accept_partial || formData.renounce_rights);
      case 5:
        return formData.contact_name && formData.mobile_phone && formData.email && formData.account_number && formData.bvn;
      case 6:
        if (formData.signature_type === 'single') return (formData.receipt || paymentVerified) && formData.signatures.length > 0 && !!formData.signatures[0];
        return (formData.receipt || paymentVerified) && formData.signatures.length > 1 && !formData.signatures.includes(null);
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    else toast.error('Required fields missing');
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const loadingToast = toast.loading('Submitting application...');
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (!['receipt', 'signatures'].includes(key) && formData[key] !== null) submitData.append(key, formData[key]);
      });
      submitData.append('shareholder_id', id);
      if (formData.receipt) submitData.append('receipt', formData.receipt);
      if (paymentVerified) submitData.append('payment_verified', 'true');
      if (paymentTxRef) submitData.append('payment_ref', paymentTxRef);
      formData.signatures.forEach((sig, idx) => { if (sig) submitData.append(`signature_${idx}`, sig); });

      const response = await submitRightsForm(submitData);
      toast.dismiss(loadingToast);
      if (response.success) {
        localStorage.removeItem(storageKey); // Clear persistence on success
        setSubmittedForm(response.data);
        setShowFinalPreview(true);
        toast.success('Successfully submitted');
      } else toast.error(response.message || 'Submission failed');
    } catch (error) {
      toast.dismiss(); // Dismiss loading toast
      const serverError = error.response?.data?.message || error.response?.data?.error || 'Submission failed. Please check your connection.';
      toast.error(serverError);
    } finally {
      setSubmitting(false);
    }
  };

  const generatePreviewUrl = async () => {
    try {
      const response = await previewRightsForm({ ...formData, shareholder_id: id });
      return URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
    } catch (error) {
      toast.error('Preview generation failed');
      return null;
    }
  };

  const handleViewForm = async () => {
    const url = await generatePreviewUrl();
    if (url) window.open(url, '_blank');
  };

  const handleDownloadForm = async () => {
    const url = await generatePreviewUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `rights-allotment-${formData.reg_account_number}.pdf`;
      link.click();
    }
  };

  if (loading) return (
    <div className="App flex items-center justify-center min-h-screen bg-slate-50/50">
      <div className="text-center">
        <div className="loading-spinner h-10 w-10 mx-auto mb-4 border-[#0A4269]"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitting Application...</p>
      </div>
    </div>
  );

  if (showFinalPreview && submittedForm) return (
    <div className="App bg-slate-50/50 min-h-screen font-sans pb-20">
      <div className="container-custom py-6 md:py-12">
        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Link
            to={`/shareholder/${id}`}
            className="inline-flex items-center text-xs font-bold text-[#0A4269] hover:text-[#0D507F] transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            BACK TO PROFILE
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              Session Active
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="bg-[#0A4269] p-6 md:p-10 text-white relative rounded-t-2xl md:rounded-t-[1.4rem] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight mb-1 uppercase">Electronic Allotment Form</h1>
                  <p className="text-blue-200/70 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Step {currentStep} of {totalSteps}</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 hidden sm:block">
                  <p className="text-[10px] text-blue-200/50 font-black uppercase mb-0.5">Reference ID</p>
                  <p className="text-xs font-mono font-bold">LAK-{id?.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              {/* Enhanced Stepper */}
              <div className="flex items-center justify-between relative px-2 mb-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2"></div>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${i + 1 <= currentStep ? 'bg-[#F58220] text-white scale-110 shadow-lg shadow-orange-500/20' : 'bg-white/10 text-white/40 border border-white/10'
                      }`}
                  >
                    {i + 1 < currentStep ? '✓' : i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-[#0A4269] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Application Lodged</h1>
              <p className="text-slate-500 text-sm max-w-md mx-auto">Your Rights Issue acceptance has been recorded. Please retain your transaction document for future reference.</p>
            </div>

            <div className="card shadow-xl border-none mt-8">
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="label-custom">Shareholder Name</label>
                    <p className="font-bold text-slate-900">{submittedForm.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="label-custom">Registrars Account Number</label>
                    <p className="font-bold text-slate-900">{submittedForm.reg_account_number}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="label-custom">Total Amount Payable</label>
                    <p className="text-2xl font-bold text-[#0A4269]">₦{parseFloat(calculateTotalPayment(submittedForm)).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="label-custom">Submission Time</label>
                    <p className="font-bold text-slate-600">{new Date(submittedForm.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <button onClick={handleViewForm} className="btn-secondary py-4 uppercase text-[10px] font-bold tracking-widest"><Eye className="h-4 w-4 mr-2" /> Preview Document</button>
              <button onClick={handleDownloadForm} className="btn-primary py-4 uppercase text-[10px] font-bold tracking-widest"><Download className="h-4 w-4 mr-2" /> Download Document</button>
              <Link to="/" className="sm:col-span-2 text-center text-slate-400 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest py-4">Exit Session</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App bg-slate-50/50 min-h-screen">
      <div className="container-custom py-8 md:py-12">
        {/* Progress Stepper */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="hidden md:flex items-center justify-between px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > step.id ? 'bg-[#0A4269] border-[#0A4269] text-white' : currentStep === step.id ? 'bg-white border-[#0A4269] text-[#0A4269] shadow-md' : 'bg-white border-slate-200 text-slate-300'}`}>
                    {currentStep > step.id ? <CheckCircle className="h-6 w-6" /> : <span className="text-sm font-bold">{step.id}</span>}
                  </div>
                  <span className={`text-[9px] mt-2 font-bold uppercase tracking-widest text-center ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-300'}`}>{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-[2px] mx-2 ${currentStep > step.id ? 'bg-[#0A4269]' : 'bg-slate-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="md:hidden px-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentStep} / {steps.length}</span>
              <span className="text-[10px] font-bold text-[#0A4269] uppercase tracking-widest">{steps[currentStep - 1].title}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#0A4269] transition-all duration-500" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Global Context Bar */}
        <div className="card bg-blue-50 text-slate-900 mb-8 overflow-hidden shadow-lg border-blue-100">
          <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-[#0A4269]">
                <Info className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Application Record</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">{shareholder.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                <span>Account: {shareholder.reg_account_number}</span>
                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Holdings: {shareholder.holdings.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-5 self-start lg:self-center w-full lg:w-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#0A4269] tracking-[0.2em] mb-1">Rights Issue</p>
                  <p className="text-xl font-bold text-slate-900">{shareholder.rights_issue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0A4269] px-6 py-3 flex flex-col md:flex-row justify-between items-center text-[13px] font-bold uppercase tracking-widest text-blue-50 gap-2">
            <div className="flex gap-4"><span>Stanbic IBTC Bank: 0080935824</span></div>
            <span className="hidden md:inline italic opacity-80">LINKAGE ASSURANCE PLC RIGHT ISSUE PROCEED ACCOUNT</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 md:p-12 bg-white shadow-lg min-h-[500px] flex flex-col relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
              <span className="text-[140px] font-bold italic leading-none">{currentStep}</span>
            </div>

            <div className="flex-1 space-y-8 relative z-10">
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-tight">{steps[currentStep - 1].title}</h3>
                <p className="text-slate-500 text-sm">{steps[currentStep - 1].description}</p>
              </div>

              {currentStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                  {/* Official Document Header */}
                  <div className="bg-white border-b border-slate-100 pb-8 space-y-8">
                    {/* logos and issuing houses */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <span className="text-[8px] font-black uppercase text-[#0A4269] tracking-widest mb-2">Issuing Houses</span>
                        <div className="flex flex-col items-center md:items-start">
                          <img src={capitalExpressLogo} alt="Capital Express Logo" className="h-10 md:h-12 object-contain" />
                          <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RC: 15808</span>
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">On behalf of</span>
                      </div>

                      <div className="flex flex-col items-center md:items-end text-center md:text-right">
                        <span className="text-[8px] font-black uppercase text-[#0A4269] tracking-widest mb-2">Issuing Houses</span>
                        <div className="flex flex-col items-center md:items-end">
                          <img src={apelLogo} alt="Apel Logo" className="h-10 md:h-12 object-contain" />
                          <span className="text-[7px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RC: 606031</span>
                        </div>
                      </div>
                    </div>

                    {/* Central Brand */}
                    <div className="flex flex-col items-center text-center space-y-4">
                      <span className="md:hidden text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">On behalf of</span>
                      <div className="flex flex-col items-center">
                        <img src={linkageLogo} alt="Linkage Logo" className="h-12 md:h-16 object-contain" />
                        <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">RC: 162306</span>
                      </div>
                      <div className="max-w-2xl">
                        <p className="text-[11px] md:text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                          Rights Issue of 12,320,000,000 Ordinary Shares of 50 kobo each at N1.32 per share on the basis of 2 new for every 3 Ordinary Shares held as at the close of business on 22 January, 2026.
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] border-y border-slate-100 py-3">PAYABLE IN FULL ON ACCEPTANCE</h4>
                    </div>
                  </div>

                  {/* Detailed Instructions */}
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-[#0A4269] uppercase tracking-widest border-b-2 border-[#0A4269] pb-1 w-fit">
                      INSTRUCTIONS FOR COMPLETING THE PARTICIPATION FORM
                    </h3>

                    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 md:p-10 space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          "Acceptance and/or renunciation must be made on this Participation Form.",
                          "Allottees should complete only ONE of the boxes marked A and B on the reverse of this form. Shareholders accepting the provisional allotment in full should complete box A and submit their Participation Forms to any of the Receiving Agents listed on page 54 of the Rights Circular together with a cheque or bank draft made payable to the Receiving Agent for the full amount payable on acceptance. If payment is not received by 13 January 2026, the provisional allotment will be deemed to have been declined and will be cancelled.",
                          "Shareholders accepting their provisional allotment partially should complete box B and submit their Participation Forms together with the evidence of payment transfer for the partial acceptance in accordance with 2 above.",
                          "Shareholders who wish to trade their rights partially or in full on the floor of The Exchange should complete item (iii) of box B. They should obtain a Transfer Form from their stockbroker, complete it in accordance with these instructions and return it to the stockbroker together with evidence of transfer for any partial acceptance.",
                          "Shareholders who wish to acquire additional shares over and above their provisional allotment should apply for additional shares by completing items (i) and (ii) of box A.",
                          "All cheques or bank drafts for amounts below N10 million will be presented for payment on receipt and all acceptances/applications in respect of which cheques are returned unpaid for any reason will be rejected and cancelled.",
                          "Joint allottees must sign on separate lines in the appropriate section of the Participation Form.",
                          "Participation Forms of corporate allottees must bear their incorporation numbers and corporate seals and must be completed under the hands of duly authorized officials who should also state their designations."
                        ].map((text, i) => (
                          <div key={i} className="flex items-start space-x-4">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#0A4269] text-white flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                            <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed font-semibold">
                              {text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center p-6 bg-blue-50/50 border border-blue-100 rounded-2xl cursor-pointer hover:border-[#0A4269] transition-all group shadow-sm">
                      <input
                        type="checkbox"
                        name="instructions_read"
                        checked={formData.instructions_read}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded-md text-[#0A4269] border-slate-300 focus:ring-[#0A4269]"
                      />
                      <span className="ml-4 text-[11px] font-black text-[#0A4269] uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                        I have read and agree to the participation protocols
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fade-in space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-custom">Assigned Stockbroker *</label>
                      <InternalSearchableSelect options={stockbrokers} value={formData.stockbroker} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="label-custom">CHN Identifier *</label>
                      <input type="text" name="chn" value={formData.chn} onChange={handleInputChange} placeholder="CHN Number" className="input-custom" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['full_acceptance', 'renunciation_partial'].map((type) => (
                    <label key={type} className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.action_type === type ? 'border-[#0A4269] bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="radio" name="action_type" value={type} checked={formData.action_type === type} onChange={handleInputChange} className="absolute top-6 right-6 h-5 w-5 text-[#0A4269]" />
                      <h4 className="font-bold text-slate-900 uppercase tracking-tight mb-2">{type.replace('_', ' ')}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{type === 'full_acceptance' ? 'Secure your entire assigned allotment with option to request more.' : 'Exercise part of your rights and renounce the remainder.'}</p>
                    </label>
                  ))}
                </div>
              )}

              {currentStep === 4 && formData.action_type === 'full_acceptance' && (
                <div className="animate-fade-in space-y-8">
                  <label className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.accept_full ? 'border-[#0A4269] bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                    <input type="checkbox" name="accept_full" checked={formData.accept_full} onChange={handleInputChange} className="mt-1 h-5 w-5 text-[#0A4269]" />
                    <div className="ml-4">
                      <span className="block font-bold text-slate-900 text-sm uppercase">Accept Rights Issue In Full</span>
                      <span className="text-xs text-slate-500">I/We accept in full, the provisional allotment shown on the front of this form.</span>
                    </div>
                  </label>

                  <label className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.apply_additional ? 'border-[#0A4269] bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                    <input type="checkbox" name="apply_additional" checked={formData.apply_additional} onChange={handleInputChange} className="mt-1 h-5 w-5 text-[#0A4269]" />
                    <div className="ml-4">
                      <span className="block font-bold text-slate-900 text-sm uppercase">Additional Allotment Request</span>
                      <span className="text-xs text-slate-500">Apply for shares exceeding your current Rights Issue.</span>
                    </div>
                  </label>

                  {formData.apply_additional && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="space-y-2">
                        <label className="label-custom">Units Requested</label>
                        <input type="number" name="additional_shares" value={formData.additional_shares} onChange={handleInputChange} className="input-custom" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <label className="label-custom">Value (₦)</label>
                        <input type="text" value={calculatedAmount.toLocaleString()} readOnly className="input-custom bg-blue-50 text-[#0A4269] font-bold" />
                      </div>
                    </div>
                  )}

                  <div className="pt-8">
                    <div className="bg-[#0A4269] p-8 md:p-12 rounded-3xl text-white space-y-8 shadow-2xl">
                      <div className="border-b border-white/10 pb-6">
                        <div className="text-center sm:text-left">
                          <label className="text-[10px] font-black text-blue-400/50 uppercase tracking-[0.2em] mb-2 block">Total Amount Payable: the bank you are paying from</label>
                          <p className="text-4xl md:text-5xl font-black italic tracking-tighter">₦{calculateTotalPayment().toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="w-full">
                          <label className="label-custom text-blue-400/50">Payment Bank *</label>
                          <InternalSearchableSelect
                            options={banks}
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            name="bank_name"
                            className="bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white font-medium w-full"
                            placeholder="Select Bank"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
                          <div className="space-y-2">
                            <label className="label-custom text-blue-400/50">Cheque Number</label>
                            <input type="text" name="cheque_number" value={formData.cheque_number} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-xs text-white font-medium" placeholder="Optional" />
                            <p className="text-[10px] text-blue-400/40 uppercase font-bold mt-2 leading-tight">Only for cheque payments</p>
                          </div>
                          <div className="space-y-2">
                            <label className="label-custom text-blue-400/50">Branch (Optional)</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-xs text-white font-medium" placeholder="Optional" />
                            <p className="text-[10px] text-blue-400/40 uppercase font-bold mt-2 leading-tight">If payment made by cheque</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && formData.action_type === 'renunciation_partial' && (
                <div className="animate-fade-in space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="label-custom">Rights Accepted</label>
                      <input type="number" name="shares_accepted" value={formData.shares_accepted} onChange={handleInputChange} className="input-custom" />
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <label className="label-custom text-[#0A4269]">Amount Payable (₦)</label>
                      <input type="text" name="amount_payable" value={parseFloat(formData.amount_payable || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })} readOnly className="input-custom bg-blue-100 text-[#0A4269] font-bold cursor-default" />
                    </div>
                    <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                      <label className="label-custom text-red-600">Rights Renounced</label>
                      <input type="text" name="shares_renounced" value={parseFloat(formData.shares_renounced || 0).toLocaleString()} readOnly className="input-custom bg-red-100 text-red-700 font-bold cursor-default" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
                      <input type="checkbox" name="accept_partial" checked={formData.accept_partial} onChange={handleInputChange} className="h-5 w-5 text-[#0A4269]" />
                      <span className="ml-3 text-[10px] font-bold text-slate-600 uppercase">Confirm Partial Allotment</span>
                    </label>
                    <label className="flex items-center p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
                      <input type="checkbox" name="renounce_rights" checked={formData.renounce_rights} onChange={handleInputChange} className="h-5 w-5 text-red-600" />
                      <span className="ml-3 text-[10px] font-bold text-slate-600 uppercase">Authorize Rights Trading</span>
                    </label>
                  </div>

                  {/* Payment Details for partial acceptance */}
                  <div className="bg-[#0A4269] p-8 md:p-12 rounded-3xl text-white space-y-10 shadow-2xl">
                    <div className="border-b border-white/10 pb-8">
                      <div className="text-center sm:text-left">
                        <label className="text-[10px] font-black text-blue-400/50 uppercase tracking-[0.2em] mb-2 block">Total Amount Payable</label>
                        <p className="text-4xl md:text-5xl font-black italic tracking-tighter">₦{(parseFloat(formData.amount_payable) || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="w-full">
                        <label className="label-custom text-blue-400/50">Payment Bank *</label>
                        <InternalSearchableSelect
                          options={banks}
                          value={formData.bank_name}
                          onChange={handleInputChange}
                          name="bank_name"
                          className="bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white font-medium w-full"
                          placeholder="Select Bank"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
                        <div className="space-y-2">
                          <label className="label-custom text-blue-400/50">Cheque Number</label>
                          <input type="text" name="cheque_number" value={formData.cheque_number} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-xs text-white font-medium shadow-inner" placeholder="Optional" />
                          <p className="text-[10px] text-blue-400/40 uppercase font-bold mt-2 leading-tight">Only for cheque payments</p>
                        </div>
                        <div className="space-y-2">
                          <label className="label-custom text-blue-400/50">Branch (Optional)</label>
                          <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-xs text-white font-medium shadow-inner" placeholder="Optional" />
                          <p className="text-[10px] text-blue-400/40 uppercase font-bold mt-2 leading-tight">If payment made by cheque</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="animate-fade-in space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="label-custom">Contact Name *</label><input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Next of Kin *</label><input type="text" name="next_of_kin" value={formData.next_of_kin} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Daytime Phone(optional)</label><input type="tel" name="daytime_phone" value={formData.daytime_phone} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Mobile Number *</label><input type="tel" name="mobile_phone" value={formData.mobile_phone} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-custom" /></div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">E-Dividend Payment Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label-custom">Mandate Bank</label>
                        <InternalSearchableSelect
                          options={banks}
                          value={formData.bank_name_edividend}
                          onChange={handleInputChange}
                          name="bank_name_edividend"
                          placeholder="Select Bank"
                        />
                      </div>
                      <div className="space-y-2"><label className="label-custom">Mandate Bank Branch (Optional)</label><input type="text" name="bank_branch_edividend" value={formData.bank_branch_edividend} onChange={handleInputChange} className="input-custom bg-white" placeholder="Optional" /></div>
                      <div className="space-y-2"><label className="label-custom">Account Number</label><input type="text" name="account_number" value={formData.account_number} onChange={handleInputChange} className="input-custom bg-white" /></div>
                      <div className="space-y-2"><label className="label-custom">BVN</label><input type="text" name="bvn" value={formData.bvn} onChange={handleInputChange} className="input-custom bg-white" /></div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="animate-fade-in space-y-10">
                  {/* Signature Type Selection */}
                  <div className="space-y-4">
                    <label className="label-custom">Signature Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, signature_type: 'single', signatures: [null] }))}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.signature_type === 'single' ? 'border-[#0A4269] bg-blue-50 text-[#0A4269]' : 'border-slate-200 bg-white text-slate-500'}`}
                      >
                        <span className="text-xs font-bold uppercase">Individual</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, signature_type: 'joint', signatures: [null, null] }))}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.signature_type === 'joint' ? 'border-[#0A4269] bg-blue-50 text-[#0A4269]' : 'border-slate-200 bg-white text-slate-500'}`}
                      >
                        <span className="text-xs font-bold uppercase">Joint/Corporate</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment and Receipt Section - Side by Side */}
                  <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                    {/* Make Payment Online Card */}
                    <div className="bg-white border-2 border-slate-200 hover:border-[#0A4269] p-6 rounded-2xl shadow-sm transition-all group flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#0A4269] rounded-xl flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Make Payment Online</h4>
                          <p className="text-[10px] text-slate-400 font-medium">Secure payment gateway</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed flex-grow">
                        Pay directly through our secure payment gateway. Your transaction will be verified automatically.
                      </p>
                      <div className="mt-auto">
                        {paymentVerified ? (
                          <div className={`flex items-center gap-3 p-4 border rounded-xl ${paymentProcessing ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                            <CheckCircle className={`h-6 w-6 ${paymentProcessing ? 'text-amber-500' : 'text-green-500'}`} />
                            <div>
                              <p className={`text-xs font-bold uppercase ${paymentProcessing ? 'text-amber-700' : 'text-green-700'}`}>
                                {paymentProcessing ? 'Transaction Processing' : 'Payment Verified'}
                              </p>
                              <p className={`text-[10px] ${paymentProcessing ? 'text-amber-600' : 'text-green-600'}`}>
                                {paymentProcessing ? 'Processing your payment...' : 'Transaction complete'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsPaymentModalOpen(true);
                            }}
                            className="w-full px-6 py-4 bg-[#0A4269] hover:bg-[#0D507F] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Authorized Signatures Section - Full Width Below */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#0A4269] rounded-xl flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Authorized Signature(s)</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Upload clear images of signatures</p>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${formData.signature_type === 'joint' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {formData.signatures.map((sig, index) => (
                        <div key={index} className="relative group">
                          <div className={`relative h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all bg-white ${sig ? 'border-[#0A4269] bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png"
                              onChange={(e) => handleFileChange(e, 'signatures', index)}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {sig ? (
                              <div className="text-center">
                                <CheckCircle className="h-8 w-8 text-[#0A4269] mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-900 truncate max-w-[150px]">{sig.name}</p>
                              </div>
                            ) : (
                              <div className="text-center px-2">
                                <Eye className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signature {index + 1}</p>
                                <p className="text-[8px] text-slate-400 font-medium mt-1">Click or tap to upload</p>
                                <p className="text-[8px] text-[#0A4269] font-bold mt-1 uppercase tracking-wide">JPG · JPEG · PNG only</p>
                              </div>
                            )}
                          </div>
                          {formData.signature_type === 'joint' && formData.signatures.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeSignatureField(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {formData.signature_type === 'joint' && (
                        <button
                          type="button"
                          onClick={addSignatureField}
                          className="h-36 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-[#F58220] hover:text-[#F58220] hover:bg-orange-50/30 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">+</span> Add Signature
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === totalSteps && (
                <div className="animate-fade-in space-y-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Form Summary</h2>
                  {/* Shareholder Information */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Shareholder Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">REG ACCOUNT:</p><p className="text-xs font-bold text-slate-900">{formData.reg_account_number}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Name</p><p className="text-xs font-bold text-slate-900">{formData.name}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Holdings</p><p className="text-xs font-bold text-slate-900">{parseFloat(formData.holdings).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Rights Issue</p><p className="text-xs font-bold text-slate-900">{parseFloat(formData.rights_issue).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">AMOUNT PAYABLE:</p><p className="text-xs font-bold text-slate-900">₦{parseFloat(formData.amount_due).toLocaleString()}</p></div>
                    </div>
                  </div>

                  {/* Stockbroker & CHN Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Stockbroker & CHN Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Stockbroker</p>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {stockbrokers.find(s => s.id === formData.stockbroker || s === formData.stockbroker)?.name || formData.stockbroker}
                        </p>
                      </div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">CHN</p><p className="text-xs font-bold text-slate-900">{formData.chn}</p></div>
                    </div>
                  </div>

                  {/* Action Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Action Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1 md:col-span-2"><p className="text-[9px] font-bold text-slate-400 uppercase">Action Type</p><p className="text-xs font-bold text-slate-900 uppercase">{formData.action_type.replace('_', ' ')}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Accept Full Allotment</p><p className="text-xs font-bold text-slate-900">{formData.accept_full ? 'Yes' : 'No'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Additional Shares Applied</p><p className="text-xs font-bold text-slate-900">{formData.apply_additional ? formData.additional_shares.toLocaleString() : '0'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Additional Amount Payable</p><p className="text-xs font-bold text-slate-900">₦{parseFloat(formData.additional_amount || 0).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Payment Amount</p><p className="text-xs font-bold text-[#0A4269]">₦{parseFloat(calculateTotalPayment()).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Bank</p><p className="text-xs font-bold text-slate-900">{formData.bank_name || 'NOT SPECIFIED'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Cheque Number</p><p className="text-xs font-bold text-slate-900">{formData.cheque_number || 'N/A'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Branch</p><p className="text-xs font-bold text-slate-900">{formData.branch || 'N/A'}</p></div>
                    </div>
                  </div>

                  {/* Personal & Bank Information */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Personal & Bank Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Contact Name</p><p className="text-xs font-bold text-slate-900">{formData.contact_name}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Next of Kin</p><p className="text-xs font-bold text-slate-900">{formData.next_of_kin}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Daytime Phone</p><p className="text-xs font-bold text-slate-900">{formData.daytime_phone}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Mobile Phone</p><p className="text-xs font-bold text-slate-900">{formData.mobile_phone}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Email</p><p className="text-xs font-bold text-slate-900 truncate">{formData.email}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">E-Dividend Bank</p><p className="text-xs font-bold text-slate-900">{formData.bank_name_edividend || 'N/A'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">E-Dividend Branch</p><p className="text-xs font-bold text-slate-900">{formData.bank_branch_edividend || 'N/A'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Account Number</p><p className="text-xs font-bold text-slate-900">{formData.account_number}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">BVN</p><p className="text-xs font-bold text-slate-900">{formData.bvn}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Corporate Signatories</p><p className="text-xs font-bold text-slate-900">{formData.corporate_signatory_names || 'N/A'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Designations</p><p className="text-xs font-bold text-slate-900">{formData.corporate_designations || 'N/A'}</p></div>
                    </div>
                  </div>

                  {/* Signature & Receipt */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Signature & Receipt</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Receipt Uploaded</p><p className="text-xs font-bold text-slate-900">{formData.receipt ? formData.receipt.name : paymentVerified ? (paymentProcessing ? 'Processing Gateway Payment' : 'Payment Verified') : 'No'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Signature(s) Uploaded</p><p className="text-xs font-bold text-slate-900">{formData.signatures.filter(s => s !== null).length} file(s)</p></div>
                    </div>
                  </div>

                  {/* Disclaimer Section */}
                  <div className="mt-12 p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">C. TRADING IN RIGHTS</h5>
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        (i) Shareholders who wish to trade in their rights, partially or in full may trade such rights on the floor of NGX. The rights will be traded actively on the floor of NGX.
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        (ii) Shareholders who wish to acquire additional shares over and above their provisional allotment should apply for additional shares by completing items (v) and (vi) of box A above.
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        (iii) Shareholders who purchase rights on the floor of NGX are guaranteed the number of shares purchased; they will not be subject to the allotment process with respect to shares so purchased. Those that apply for additional shares by completing items (vi) of box A will be subject to the allotment process i.e. they may be allotted a smaller number of additional shares than what they applied for.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="btn-outline w-full sm:w-auto px-10 py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-30 flex items-center justify-center order-3 sm:order-1"><ChevronLeft className="h-4 w-4 mr-2" /> Back</button>
                <div className="hidden sm:block order-2"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Step {currentStep} / {totalSteps}</span></div>
                {currentStep < totalSteps ? (
                  <button type="button" onClick={handleNext} className="btn-primary w-full sm:w-auto px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center order-1 sm:order-3">Continue <ChevronRight className="h-4 w-4 ml-2" /></button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary bg-slate-900 hover:bg-black w-full sm:w-auto px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center order-1 sm:order-3">
                    {submitting ? <span className="flex items-center"><div className="loading-spinner h-3 w-3 border-t-white mr-2"></div>SUBMITTING</span> : <><CheckCircle className="h-4 w-4 mr-2" />Submit Application</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FundWalletModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        shareholder={shareholder}
        shareholderEmail={formData.email}
        shareholderName={formData.name || shareholder?.name}
        fixedAmount={pendingBalance ?? parseFloat(calculateTotalPayment())}
        onUnderpayment={handleUnderpayment}
        rightsAmount={parseFloat(formData.amount_due) || 0}
        additionalAmount={parseFloat(formData.additional_amount) || 0}
        onPaymentSuccess={(data) => {
          setPendingBalance(null);
          sessionStorage.removeItem(`${paymentStorageKey}_balance`);
          setPaymentVerified(true);
          const isProc = !!data?.isProcessing;
          setPaymentProcessing(isProc);
          sessionStorage.setItem(`${paymentStorageKey}_processing`, isProc ? 'true' : 'false');

          if (data?.txRef) {
            setPaymentTxRef(data.txRef);
            sessionStorage.setItem(`${paymentStorageKey}_txRef`, data.txRef);
          }
          if (isProc) {
            toast.success('Payment initiated! We will verify it in the background.');
          } else {
            toast.success('Online payment recorded!');
          }
        }}
      /> 
    </div>
  );
};

export default FormSubmissionPage;