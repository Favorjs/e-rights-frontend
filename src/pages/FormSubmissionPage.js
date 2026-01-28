import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Receipt, CheckCircle, Eye, Download, ChevronRight, ChevronLeft, Info, Search, X, ChevronDown, } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getShareholderById, getStockbrokers, submitRightsForm, previewRightsForm } from '../services/api';

// Internal SearchableSelect for alignment with existing structure
const InternalSearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = ''
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value || opt === value);
  const displayValue = selectedOption ? (selectedOption.name || selectedOption) : '';

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className={`relative w-full bg-white border border-slate-200 rounded-xl shadow-sm pl-4 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0A4269] text-sm ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!displayValue ? 'text-slate-400' : 'font-medium text-slate-900'}`}>
          {displayValue || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white shadow-xl rounded-xl py-1 text-sm ring-1 ring-slate-900/5 overflow-hidden animate-fade-in max-h-80">
          <div className="px-3 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0A4269]"
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
                      onChange({ target: { name: 'stockbroker', value: optionValue } });
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

const FormSubmissionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareholder, setShareholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stockbrokers, setStockbrokers] = useState([]);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [formData, setFormData] = useState({
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
  });

  const [submittedForm, setSubmittedForm] = useState(null);
  const [showFinalPreview, setShowFinalPreview] = useState(false);

  const steps = [
    { id: 1, title: 'Ownership & Records', description: 'Confirm your shareholder information' },
    { id: 2, title: 'Guidelines & Instructions', description: 'Important information for participation' },
    { id: 3, title: 'Stockbroker Information', description: 'CHN and Broker details' },
    { id: 4, title: 'Participation Type', description: 'Choose how to participate' },
    { id: 5, title: 'Payment Details', description: 'Amount and proof of payment' },
    { id: 6, title: 'Mandate & Contact', description: 'Personal and banking details' },
    { id: 7, title: 'Signature & Documentation', description: 'Sign and upload proof' },
    { id: 8, title: 'Application Summary', description: 'Review and submit' }
  ];

  useEffect(() => {
    if (formData.apply_additional && formData.additional_shares) {
      const shares = parseFloat(formData.additional_shares) || 0;
      const additionalAmount = (shares * 7).toFixed(2);
      setCalculatedAmount(parseFloat(additionalAmount));
      setFormData(prev => ({ ...prev, additional_amount: additionalAmount }));
    } else {
      setCalculatedAmount(0);
      setFormData(prev => ({ ...prev, additional_amount: '' }));
    }
  }, [formData.additional_shares, formData.apply_additional]);

  const calculateTotalPayment = (data = formData) => {
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
      case 2: return formData.instructions_read;
      case 3: return formData.stockbroker && formData.chn;
      case 4: return !!formData.action_type;
      case 5:
        if (formData.action_type === 'full_acceptance') {
          return formData.accept_full && formData.bank_name && (!formData.apply_additional || formData.additional_shares);
        }
        return formData.shares_accepted && formData.amount_payable && (formData.accept_partial || formData.renounce_rights);
      case 6:
        return formData.contact_name && formData.mobile_phone && formData.email && formData.bank_name_edividend && formData.account_number && formData.bvn;
      case 7:
        if (formData.signature_type === 'single') return formData.receipt && formData.signatures.length > 0 && !!formData.signatures[0];
        return formData.receipt && formData.signatures.length > 1 && !formData.signatures.includes(null);
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 8));
    else toast.error('Required fields missing');
  };

  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const loadingToast = toast.loading('Synchronizing application...');
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (!['receipt', 'signatures'].includes(key) && formData[key] !== null) submitData.append(key, formData[key]);
      });
      submitData.append('shareholder_id', id);
      if (formData.receipt) submitData.append('receipt', formData.receipt);
      formData.signatures.forEach((sig, idx) => { if (sig) submitData.append(`signature_${idx}`, sig); });

      const response = await submitRightsForm(submitData);
      toast.dismiss(loadingToast);
      if (response.success) {
        setSubmittedForm(response.data);
        setShowFinalPreview(true);
        toast.success('Successfully submitted');
      } else toast.error(response.message || 'Submission failed');
    } catch (error) {
      toast.error('Network synchronization error');
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
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Encrypted Registry</p>
      </div>
    </div>
  );

  if (showFinalPreview && submittedForm) return (
    <div className="App bg-slate-50/50 min-h-screen">
      <div className="container-custom py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-[#0A4269] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Application Lodged</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">Your rights issue acceptance has been recorded. Please retain your transaction document for future reference.</p>
          </div>

          <div className="card shadow-xl border-none">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="label-custom">Shareholder Name</label>
                  <p className="font-bold text-slate-900">{submittedForm.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="label-custom">Account Reference</label>
                  <p className="font-bold text-slate-900">{submittedForm.reg_account_number}</p>
                </div>
                <div className="space-y-1">
                  <label className="label-custom">Settlement Total</label>
                  <p className="text-2xl font-bold text-[#0A4269]">₦{parseFloat(calculateTotalPayment(submittedForm)).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <label className="label-custom">Execution Time</label>
                  <p className="font-bold text-slate-600">{new Date(submittedForm.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={handleViewForm} className="btn-secondary py-4 uppercase text-[10px] font-bold tracking-widest"><Eye className="h-4 w-4 mr-2" /> Preview Receipt</button>
            <button onClick={handleDownloadForm} className="btn-primary py-4 uppercase text-[10px] font-bold tracking-widest"><Download className="h-4 w-4 mr-2" /> Download Document</button>
            <Link to="/" className="sm:col-span-2 text-center text-slate-400 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest py-4">Exit Session</Link>
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
                  <p className="text-[10px] font-black uppercase text-[#0A4269] tracking-[0.2em] mb-1">Entitlement</p>
                  <p className="text-xl font-bold text-slate-900">{shareholder.rights_issue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-[#0A4269] tracking-[0.2em] mb-1">Status</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white bg-[#F58220] px-2 py-0.5 rounded">Authenticated</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0A4269] px-6 py-3 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-blue-50 gap-2">
            <div className="flex gap-4"><span>Providus: 1308407124</span><span>Taj Bank: 0013161672</span></div>
            <span className="hidden md:inline italic opacity-80">Linkage Assurance Plc Rights Issue 2025</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 md:p-12 bg-white shadow-lg min-h-[500px] flex flex-col relative overflow-hidden">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="label-custom">Registration Number</label>
                      <p className="text-xl font-bold text-slate-900">{shareholder.reg_account_number}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 md:text-right">
                      <label className="label-custom">Verified Holdings</label>
                      <p className="text-xl font-bold text-slate-900">{shareholder.holdings.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-8 bg-[#0A4269] rounded-2xl text-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      <div className="space-y-1 text-center md:text-left">
                        <span className="text-[9px] font-bold uppercase text-[#F58220] tracking-widest">Provisional Allotment</span>
                        <p className="text-4xl font-bold tracking-tighter">{shareholder.rights_issue.toLocaleString()} <span className="text-sm font-normal opacity-50 uppercase tracking-widest ml-1">Units</span></p>
                      </div>
                      <div className="md:text-right max-w-xs">
                        <p className="text-xs font-medium opacity-70 leading-relaxed">Based on 1 new share for every 10 held as at qualification date July 14, 2025.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 max-h-[350px] overflow-y-auto custom-scrollbar">
                    <div className="prose prose-sm text-slate-600 space-y-4">
                      <p><strong className="text-slate-900">1. Acceptance Method:</strong> Application must be executed through this portal including e-payment proof.</p>
                      <div className="pl-4 border-l-2 border-[#0A4269] py-1 space-y-2">
                        <p className="text-xs font-bold uppercase text-slate-900">Option A: Full Acceptance</p>
                        <p className="text-xs">Accept in full at ₦7.00 per share with additional request option.</p>
                        <p className="text-xs font-bold uppercase text-slate-900 mt-3">Option B: Partial/Renunciation</p>
                        <p className="text-xs">Accept a portion and renounce the balance for trading on NGX.</p>
                      </div>
                      <p><strong className="text-slate-900">2. Deadlines:</strong> The window remains open until Dec 12, 2025. Late entries will not be processed.</p>
                    </div>
                  </div>
                  <label className="flex items-center p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-[#0A4269] transition-colors">
                    <input type="checkbox" name="instructions_read" checked={formData.instructions_read} onChange={handleInputChange} className="h-5 w-5 rounded text-[#0A4269]" />
                    <span className="ml-4 text-xs font-bold text-slate-900 uppercase tracking-widest">I have read and agree to the participation protocols</span>
                  </label>
                </div>
              )}

              {currentStep === 3 && (
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

              {currentStep === 4 && (
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

              {currentStep === 5 && formData.action_type === 'full_acceptance' && (
                <div className="animate-fade-in space-y-8">
                  <label className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.accept_full ? 'border-[#0A4269] bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                    <input type="checkbox" name="accept_full" checked={formData.accept_full} onChange={handleInputChange} className="mt-1 h-5 w-5 text-[#0A4269]" />
                    <div className="ml-4">
                      <span className="block font-bold text-slate-900 text-sm uppercase">Accept Entitlement In Full</span>
                      <span className="text-xs text-slate-500">I/We accept in full, the provisional allotment shown on the front of this form.</span>
                    </div>
                  </label>

                  <label className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.apply_additional ? 'border-[#0A4269] bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                    <input type="checkbox" name="apply_additional" checked={formData.apply_additional} onChange={handleInputChange} className="mt-1 h-5 w-5 text-[#0A4269]" />
                    <div className="ml-4">
                      <span className="block font-bold text-slate-900 text-sm uppercase">Additional Allotment Request</span>
                      <span className="text-xs text-slate-500">Apply for shares exceeding your current entitlement.</span>
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

                  <div className="pt-8 space-y-6">
                    <div className="bg-[#0A4269] p-8 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                        <label className="text-[9px] font-bold text-blue-400/70 uppercase tracking-widest mb-1 block">Total Consideration</label>
                        <p className="text-3xl font-bold italic tracking-tighter">₦{calculateTotalPayment().toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full sm:w-auto">
                        <div className="space-y-1"><label className="label-custom text-blue-400/50">Payment Bank</label><input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white font-medium" /></div>
                        <div className="space-y-1">
                          <label className="label-custom text-blue-400/50">Cheque Number</label>
                          <input type="text" name="cheque_number" value={formData.cheque_number} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white font-medium" />
                          <p className="text-[8px] text-blue-400/40 uppercase font-bold mt-1 leading-tight">Only for cheque payments</p>
                        </div>
                        <div className="space-y-1"><label className="label-custom text-blue-400/50">Branch</label><input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-xs text-white font-medium" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && formData.action_type === 'renunciation_partial' && (
                <div className="animate-fade-in space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="label-custom">Units Accepted</label>
                      <input type="number" name="shares_accepted" value={formData.shares_accepted} onChange={handleInputChange} className="input-custom" />
                    </div>
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <label className="label-custom text-[#0A4269]">Consideration (₦)</label>
                      <input type="number" name="amount_payable" value={formData.amount_payable} onChange={handleInputChange} className="input-custom" />
                    </div>
                    <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                      <label className="label-custom text-red-600">Rights Renounced</label>
                      <input type="number" name="shares_renounced" value={formData.shares_renounced} onChange={handleInputChange} className="input-custom" />
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
                </div>
              )}

              {currentStep === 6 && (
                <div className="animate-fade-in space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="label-custom">Legal Beneficiary Name *</label><input type="text" name="contact_name" value={formData.contact_name} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Alternate Contact *</label><input type="text" name="next_of_kin" value={formData.next_of_kin} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Mobile Number *</label><input type="tel" name="mobile_phone" value={formData.mobile_phone} onChange={handleInputChange} className="input-custom" /></div>
                    <div className="space-y-2"><label className="label-custom">Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-custom" /></div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">E-Dividend Payment Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><label className="label-custom">Mandate Bank</label><input type="text" name="bank_name_edividend" value={formData.bank_name_edividend} onChange={handleInputChange} className="input-custom bg-white" /></div>
                      <div className="space-y-2"><label className="label-custom">Account Reference</label><input type="text" name="account_number" value={formData.account_number} onChange={handleInputChange} className="input-custom bg-white" /></div>
                      <div className="space-y-2 md:col-span-2"><label className="label-custom">BVN identifier</label><input type="text" name="bvn" value={formData.bvn} onChange={handleInputChange} className="input-custom bg-white" /></div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="animate-fade-in space-y-8">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="label-custom font-bold">Proof of Payment</label>
                      <div className={`relative h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${formData.receipt ? 'border-[#0A4269] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                        <input type="file" onChange={(e) => handleFileChange(e, 'receipt')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        {formData.receipt ? (
                          <div className="text-center p-4">
                            <CheckCircle className="h-8 w-8 text-[#0A4269] mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-slate-900 truncate max-w-[200px]">{formData.receipt.name}</p>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Receipt</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="label-custom font-bold">Authorized Signature(s)</label>
                      <div className="space-y-4">
                        {formData.signatures.map((sig, index) => (
                          <div key={index} className="relative group">
                            <div className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${sig ? 'border-[#0A4269] bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                              <input type="file" onChange={(e) => handleFileChange(e, 'signatures', index)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                              {sig ? (
                                <div className="text-center">
                                  <CheckCircle className="h-6 w-6 text-[#0A4269] mx-auto mb-1" />
                                  <p className="text-[9px] font-bold text-slate-900 truncate max-w-[150px]">{sig.name}</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Eye className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Signature {index + 1}</p>
                                </div>
                              )}
                            </div>
                            {formData.signature_type === 'joint' && formData.signatures.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeSignatureField(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-[#F58220] hover:text-[#F58220] transition-all text-[10px] font-bold uppercase tracking-widest"
                          >
                            + Add Signature
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="animate-fade-in space-y-12">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8">Form Summary</h2>
                  {/* Shareholder Information */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Shareholder Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Registration Account</p><p className="text-xs font-bold text-slate-900">{formData.reg_account_number}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Name</p><p className="text-xs font-bold text-slate-900">{formData.name}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Holdings</p><p className="text-xs font-bold text-slate-900">{parseFloat(formData.holdings).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Rights Issue</p><p className="text-xs font-bold text-slate-900">{parseFloat(formData.rights_issue).toLocaleString()}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Amount Due</p><p className="text-xs font-bold text-slate-900">₦{parseFloat(formData.amount_due).toLocaleString()}</p></div>
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
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Bank</p><p className="text-xs font-bold text-slate-900">{formData.bank_name}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Cheque Number</p><p className="text-xs font-bold text-slate-900">{formData.cheque_number || 'N/A'}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Branch</p><p className="text-xs font-bold text-slate-900">{formData.branch}</p></div>
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
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">E-Dividend Bank</p><p className="text-xs font-bold text-slate-900">{formData.bank_name_edividend}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Branch</p><p className="text-xs font-bold text-slate-900">{formData.bank_branch_edividend || 'N/A'}</p></div>
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
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Signature Type</p><p className="text-xs font-bold text-slate-900 uppercase">{formData.signature_type}</p></div>
                      <div className="space-y-1"><p className="text-[9px] font-bold text-slate-400 uppercase">Receipt Uploaded</p><p className="text-xs font-bold text-slate-900">{formData.receipt ? formData.receipt.name : 'No'}</p></div>
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
                <div className="hidden sm:block order-2"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Step {currentStep} / 8</span></div>
                {currentStep < 8 ? (
                  <button type="button" onClick={handleNext} className="btn-primary w-full sm:w-auto px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center order-1 sm:order-3">Continue <ChevronRight className="h-4 w-4 ml-2" /></button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary bg-slate-900 hover:bg-black w-full sm:w-auto px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center order-1 sm:order-3">
                    {submitting ? <span className="flex items-center"><div className="loading-spinner h-3 w-3 border-t-white mr-2"></div>PROCESSING</span> : <><CheckCircle className="h-4 w-4 mr-2" />Submit Application</>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSubmissionPage;