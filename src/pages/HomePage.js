import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Search, Download, FileText, FileSpreadsheet, FileDigit, FileText } from 'lucide-react';
import { Search, Download, FileText, FileSpreadsheet, FileDigit} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const HomePage = () => {
  const [searchName, setSearchName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchName.trim() || searchName.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await axios.get(`/api/shareholders/search?name=${encodeURIComponent(searchName.trim())}`);
      
      if (response.data.success) {
        if (response.data.data.length === 0) {
          toast.error('No shareholders found with that name');
        } else if (response.data.data.length === 1) {
          // If only one result, go directly to shareholder details
          navigate(`/shareholder/${response.data.data[0].id}`);
        } else {
          // Multiple results, go to search results page
          navigate('/search-results', { 
            state: { 
              searchResults: response.data.data,
              searchTerm: searchName.trim()
            }
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for shareholders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadForm = (formType) => {
    // Map form types to their corresponding file names
    const formFiles = {
      'Stock Broker Form': 'TIP RIGHTS ISSUE SAMPLE.pdf',
      'Dematerialization Form': 'TIP RIGHTS ISSUE SAMPLE.pdf',
      'Rights Circular': 'TIP RIGHTS ISSUE SAMPLE.pdf',
      'Public Offer': 'TIP RIGHTS ISSUE SAMPLE.pdf'
    };

    const fileName = formFiles[formType];
    
    if (!fileName) {
      toast.error('Form not available');
      return;
    }

    // Create a temporary anchor tag to trigger download
    const link = document.createElement('a');
    link.href = `/forms/${fileName}`;
    link.download = fileName;
    
    // Append to body, trigger click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${formType} download started`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Title Section */}
              <div className="text-center mb-8">
                <h2 className="text-sm text-gray-600 mb-2">APEL CAPITAL REGISTRARS</h2>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">THE INITIATES PLC RIGHTS ISSUE</h1>
                <div className="w-24 h-1 bg-green-600 mx-auto"></div>
              </div>

              {/* Important Note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                  </div>
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Important Note</p>
                    <p>
                      Please search using your full name as it appears in our records. 
                      You can download the stock broker and docket dematerialization forms from the sidebar on the right.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label htmlFor="searchName" className="form-label">
                    Search for your name
                  </label>
                  <input
                    type="text"
                    id="searchName"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search name..."
                    className="form-input text-lg"
                    disabled={isSearching}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full btn-primary text-lg py-3 flex items-center justify-center space-x-2"
                >
                  {isSearching ? (
                    <>
                      <div className="spinner"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Download Forms */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <Download className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Download Forms</h3>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => downloadForm('Stock Broker Form')}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Stock Broker Form</span>
                    <FileDigit className="h-4 w-4 text-red-500" />
                  </button>
                  
                  <button
                    onClick={() => downloadForm('Dematerialization Form')}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Dematerialization Form</span>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </button>
                  
                  <button
                    onClick={() => downloadForm('Rights Circular')}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Rights Circular</span>
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  </button>
                  
                  <button
                    onClick={() => downloadForm('Public Offer')}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium">Public Offer</span>
                    <FileDigit className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Trading Procedure */}
              <div className="card">
                <button
                  type="button"
                  aria-expanded={isProcedureOpen}
                  aria-controls="procedure-content"
                  onClick={() => setIsProcedureOpen((v) => !v)}
                  className="w-full flex items-center justify-between mb-2 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">RIGHTS TRADING PROCEDURE 2025</h3>
                  <svg
                    className={`w-5 h-5 text-green-600 transition-transform duration-200 ${isProcedureOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7 7 7-7" />
                  </svg>
                </button>
                
                {isProcedureOpen && (
                  <div id="procedure-content" className="space-y-4 text-sm text-gray-700 mt-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">SELLER/EXISTING SHAREHOLDER:</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>You can Download the Rights Circular on our website using this link <a href="https://tip.apel.com.ng" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">https://tip.apel.com.ng</a></li>
                        <li>Endorse the Rights Circular stating the units accepted and the units renounced.</li>
                        <li>Download the Branded IB Plc Rights Demat/Migration from our website</li>
                        <li>Endorse the Dematerialization/Migration form</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">BUYER/NEW SHAREHOLDER:</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Ensure K.Y.C information is updated with your stockbroker</li>
                        <li>Ensure your stockbroker submits an executed transfer form to C.S.C.S for onward transfer</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 