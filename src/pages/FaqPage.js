import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'What is a Rights Issue?',
    answer:
      'A Rights Issue is a way for a company to raise additional capital by offering existing shareholders the right to purchase new shares at a discounted price, in proportion to their existing holdings. It gives you — as an existing shareholder — the first opportunity to maintain your percentage ownership in the company before new shares are offered to the public.',
  },
  {
    id: 2,
    question: 'What is the Record Date or Qualification Date?',
    answer:
      'The Record Date is the cut-off date used to determine which shareholders are eligible to participate in the Rights Issue. Only shareholders whose names appear on the company\'s register on or before the Record Date are entitled to receive rights. If you purchased shares after this date, you will not be eligible to participate in the current Rights Issue.',
  },
  {
    id: 3,
    question: 'What are my Rights Entitlements?',
    answer:
      'Your Rights Entitlement is the number of new shares you are eligible to subscribe for, calculated based on your existing shareholding as at the Record Date. For example, if the offer is on a 1-for-2 basis, you are entitled to buy 1 new share for every 2 shares you currently hold. Your specific entitlement is pre-filled on your Provisional Allotment Letter (PAL) or displayed on this portal when you search your account.',
  },
  {
    id: 4,
    question: 'What are my options as a Shareholder?',
    answer: (
      <ul className="space-y-3 mt-1">
        {[
          { label: 'Full Acceptance', desc: 'Subscribe to all the new shares you are entitled to.' },
          { label: 'Partial Acceptance', desc: 'Subscribe to only a portion of your entitlement.' },
          { label: 'Renunciation', desc: 'Transfer (renounce) your rights entitlement to another person or entity who wishes to subscribe in your place.' },
          { label: 'Apply for Additional Shares (Excess Application)', desc: 'In addition to your entitlement, you may apply for shares in excess of your rights allocation, subject to availability after all entitlements have been satisfied.' },
          { label: 'Do Nothing', desc: 'If you take no action before the offer closes, your rights will lapse and you will not receive new shares. Note that your existing shareholding will be diluted if the company issues new shares to others.' },
        ].map((item) => (
          <li key={item.label} className="flex items-start space-x-3">
            <span className="w-2 h-2 rounded-full bg-[#1B2B45] mt-2 flex-shrink-0"></span>
            <span>
              <span className="font-semibold text-slate-800">{item.label}:</span>{' '}
              <span className="text-slate-600">{item.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 5,
    question: 'How do I Apply?',
    answer: (
      <ol className="space-y-3 mt-1 list-none">
        {[
          'Search for your name or account number on this portal.',
          'Confirm your details on the Shareholder Information page.',
          'Choose your preferred application option (Full Acceptance, Partial, Renunciation, etc.).',
          'Complete and submit the digital form online — or download the pre-filled PDF, sign it manually, and email it with your payment receipt to registrars@apel.ng.',
          'Make payment to the designated collection account provided on your application form.',
          'Upload or attach proof of payment (bank teller or transfer receipt).',
        ].map((step, i) => (
          <li key={i} className="flex items-start space-x-3">
            <span className="w-6 h-6 rounded-full bg-[#1B2B45]/10 text-[#1B2B45] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-slate-600">{step}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    id: 6,
    question: 'Can I apply for more shares than my entitlement?',
    answer:
      'Yes. You may apply for shares in excess of your entitlement — this is called an Excess Application. If there are unsubscribed shares after all entitled shareholders have taken up their rights, excess applicants will be allotted shares at the discretion of the company and its advisers, on a pro-rata or first-come, first-served basis. There is no guarantee that your excess application will be fully or partially satisfied.',
  },
  {
    id: 7,
    question: 'What happens if I do nothing?',
    answer:
      'If you do not respond before the offer closes, your rights will lapse and you will not be allotted any new shares. Your existing shares remain yours, but your ownership percentage in the company will be diluted if other shareholders and new investors subscribe. The rights cannot be recovered after the closing date, so it is in your interest to act promptly.',
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        isOpen ? 'border-[#1B2B45]/30 shadow-md shadow-blue-900/5' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-6 text-left bg-white group"
      >
        <div className="flex items-start space-x-4 flex-1 pr-4">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black transition-colors ${
              isOpen ? 'bg-[#1B2B45] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}
          >
            {String(faq.id).padStart(2, '0')}
          </span>
          <span className={`text-base font-bold leading-snug pt-1 transition-colors ${isOpen ? 'text-[#1B2B45]' : 'text-slate-800'}`}>
            {faq.question}
          </span>
        </div>
        <span className={`flex-shrink-0 mt-1 transition-colors ${isOpen ? 'text-[#1B2B45]' : 'text-slate-400'}`}>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 bg-white border-t border-slate-50">
          <div className="pl-12 pt-4 text-sm text-slate-600 leading-relaxed">
            {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero */}
      <div className="bg-[#1B2B45] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-6 border border-white/10">
            <HelpCircle className="h-7 w-7 text-white" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300 mb-3">
            LASACO Assurance PLC
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-blue-200 font-medium max-w-xl mx-auto leading-relaxed">
            Everything you need to know about the Rights Issue and how to participate.
          </p>
        </div>
      </div>

      {/* Divider accent */}
      <div className="h-1 bg-gradient-to-r from-[#1B2B45] via-[#29B5C8] to-[#1E9BAA]" />

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-14 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <p className="text-base font-bold text-slate-900 mb-1">Still have questions?</p>
            <p className="text-sm text-slate-500">
              Our registrar support team is available to assist you.
            </p>
          </div>
          <a
            href="mailto:registrars@apel.ng"
            className="flex items-center space-x-2 px-6 py-3 bg-[#1B2B45] text-white text-sm font-bold rounded-xl hover:bg-[#243A5E] transition-colors shadow-lg shadow-blue-900/10 whitespace-nowrap"
          >
            <span className="uppercase tracking-widest">Email Support</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          LASACO Assurance PLC Rights Issue &mdash; For informational purposes only.
        </p>
      </div>
    </div>
  );
}
