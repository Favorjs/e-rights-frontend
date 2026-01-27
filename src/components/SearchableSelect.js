import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  name,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  required = false,
  label = '',
  error = ''
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
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={`relative w-full bg-white border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl shadow-sm pl-4 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-emerald-500/10 focus:border-emerald-600'} text-sm ${disabled ? 'bg-slate-50 text-slate-400' : 'text-slate-900'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={`block truncate ${!displayValue ? 'text-slate-400' : 'font-medium'}`}>
            {displayValue || placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-full bg-white shadow-xl rounded-xl py-1 text-sm ring-1 ring-slate-900/5 overflow-hidden animate-fade-in max-h-80">
            <div className="px-3 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600"
                  placeholder="Filter brokers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>
            <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const optionValue = option.id || option;
                  const optionLabel = option.name || option;
                  const isSelected = value === optionValue;

                  return (
                    <div
                      key={`${optionValue}-${index}`}
                      className={`px-4 py-2.5 text-sm transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({
                          id: optionValue, // Pass the id directly for the SearchableSelect's onChange
                        });
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{optionLabel}</span>
                        {isSelected && <CheckCircle className="h-3 w-3 text-emerald-600" />}
                      </div>
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
      {error && <p className="mt-1.5 text-[10px] font-bold text-red-600 uppercase tracking-widest">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
