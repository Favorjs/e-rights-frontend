import React, { useState, useEffect } from 'react';
import {
    X,
    ArrowRight,
    Copy,
    CheckCircle2,
    Loader2,
    Wallet,

    Clock,
} from 'lucide-react';
import { generatePaymentAccount, verifyPayment } from '../services/api';
import toast from 'react-hot-toast';

const FundWalletModal = ({ isOpen, onClose, shareholder, shareholderEmail, shareholderName, onPaymentSuccess, fixedAmount, rightsAmount = 0, additionalAmount = 0 }) => {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState(fixedAmount ? fixedAmount.toString() : '');
    const [loading, setLoading] = useState(false);
    const [bankingInfo, setBankingInfo] = useState(null);
    const [polling, setPolling] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [countdown, setCountdown] = useState(600);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setAmount(fixedAmount ? fixedAmount.toString() : '');
            setBankingInfo(null);
            setPolling(false);
            setPaymentInfo(null);
            setCountdown(600);
        }
    }, [isOpen, fixedAmount]);

    useEffect(() => {
        let timer;
        if (step === 3 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setStep(5);
                        if (bankingInfo?.txRef) {
                            onPaymentSuccess && onPaymentSuccess({ txRef: bankingInfo.txRef, isProcessing: true });
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown, onClose]);

    useEffect(() => {
        let pollInterval;
        if (polling && bankingInfo?.txRef) {
            pollInterval = setInterval(async () => {
                try {
                    const response = await verifyPayment(bankingInfo.txRef, shareholderEmail, shareholderName);
                    if (response.paymentReceived) {
                        setPolling(false);
                        setStep(4);
                        // Include txRef in callback so it can be passed to form submission
                        onPaymentSuccess && onPaymentSuccess({ ...response.data, txRef: bankingInfo.txRef });
                        toast.success('Payment verified successfully!');
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                }
            }, 5000);
        }
        return () => clearInterval(pollInterval);
    }, [polling, bankingInfo, onPaymentSuccess, shareholderEmail, shareholderName]);

    if (!isOpen) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProceedToBreakdown = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const baseAmount = parseFloat(amount);
            const response = await generatePaymentAccount(baseAmount, shareholder?.id, shareholderEmail, shareholderName);

            if (response.success) {
                const apiData = response.data;
                setBankingInfo(apiData);

                const totalFromApi = parseFloat(apiData.amountToDeposit || baseAmount);
                const processorFee = totalFromApi - baseAmount;

                setPaymentInfo({
                    baseAmount: baseAmount,
                    processorFee: processorFee,
                    totalAmount: totalFromApi
                });

                setStep(2);
            } else {
                toast.error(response.error || 'Failed to get payment details');
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Server error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = () => {
        setCountdown(600);
        setStep(3);
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const getPaymentBreakdown = () => {
        if (paymentInfo) return paymentInfo;
        const baseAmount = parseFloat(amount) || 0;
        return { baseAmount, processorFee: 0, totalAmount: baseAmount };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Wallet size={20} className="text-slate-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-slate-900">Purchase Rights</h3>
                            <p className="text-slate-400 text-xs">Step {step} of 4</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-slate-500 text-sm">
                                    {fixedAmount ? 'Amount to pay for your Rights Issue' : 'Enter the amount you want to pay'}
                                </p>
                            </div>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">₦</span>
                                {fixedAmount ? (
                                    <div className="w-full pl-8 pr-3 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-bold text-slate-900">
                                        {parseFloat(amount).toLocaleString()}
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-4 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-2xl font-bold outline-none transition-colors text-slate-900"
                                    />
                                )}
                            </div>

                            <button
                                onClick={handleProceedToBreakdown}
                                disabled={loading}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        Proceed
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                                {fixedAmount && rightsAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Rights Amount Payable</span>
                                        <span className="font-medium text-slate-900">₦{rightsAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {fixedAmount && additionalAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Additional Amount Payable</span>
                                        <span className="font-medium text-slate-900">₦{additionalAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {!fixedAmount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Application Amount</span>
                                        <span className="font-medium text-slate-900">₦{getPaymentBreakdown().baseAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Processor's Fee</span>
                                    <span className="font-medium text-slate-900">₦{getPaymentBreakdown().processorFee.toLocaleString()}</span>
                                </div>

                                <div className="h-px bg-slate-200 my-1" />

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900">Total Payable</span>
                                    <span className="text-xl font-bold text-slate-900">₦{getPaymentBreakdown().totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    className="flex-[2] py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                                >
                                    Confirm & Proceed
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && bankingInfo && (
                        <div className="space-y-4">
                            {/* Timer */}
                            <div className={`p-3 rounded-xl flex items-center justify-between ${countdown <= 120 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className={countdown <= 120 ? 'text-red-500' : 'text-amber-500'} />
                                    <span className={`text-xs font-medium ${countdown <= 120 ? 'text-red-600' : 'text-amber-600'}`}>
                                        Expires in
                                    </span>
                                    <span className={`text-sm font-mono font-bold ${countdown <= 120 ? 'text-red-600' : 'text-amber-600'}`}>
                                        {formatTime(countdown)}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">₦{getPaymentBreakdown().totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Account Number */}
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">Account Number</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">{bankingInfo.accountNo}</p>
                                    <button
                                        onClick={() => copyToClipboard(bankingInfo.accountNo, 'Account number')}
                                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-medium">Bank</p>
                                    <p className="font-semibold text-sm text-slate-900">{bankingInfo.bankingPartner}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-medium">Account Name</p>
                                    <p className="font-semibold text-sm text-slate-900 truncate">{bankingInfo.accountName}</p>
                                </div>
                            </div>

                            <div className="pt-1">
                                {!polling ? (
                                    <button
                                        onClick={() => setPolling(true)}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        I have sent the money
                                    </button>
                                ) : (
                                    <div className="text-center py-4 space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span className="font-medium text-sm">Verifying payment...</span>
                                        </div>
                                        <p className="text-xs text-slate-400">Please don't close this window</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-6 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full text-emerald-600">
                                <CheckCircle2 size={36} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">Payment Received!</h3>
                                <p className="text-slate-500 text-sm max-w-[240px] mx-auto">
                                    Your application has been successfully funded.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                            >
                                Close & Continue
                            </button>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="text-center py-6 space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full text-blue-600">
                                <Clock size={36} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">Processing</h3>
                                <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
                                    We will confirm your transaction once it has been processed and you will be notified. You can safely close this window now.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (bankingInfo?.txRef) {
                                        onPaymentSuccess && onPaymentSuccess({ txRef: bankingInfo.txRef, isProcessing: true });
                                    }
                                    onClose();
                                }}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                            >
                                Close & Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FundWalletModal;
