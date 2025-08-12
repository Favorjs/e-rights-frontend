import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Hash, ChevronLeft, ChevronRight } from 'lucide-react';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchTerm } = location.state || {};
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `/api/shareholders/search?name=${encodeURIComponent(searchTerm)}&page=${pagination.page}&limit=${pagination.limit}`
        );
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.data);
          setPagination({
            ...pagination,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          });
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm, pagination.page]);

  const handleSelectShareholder = (shareholder) => {
    navigate(`/shareholder/${shareholder.id}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  if (!searchTerm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No search term provided.</p>
          <Link to="/" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading search results...</p>
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
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="text-green-600">Search</span>
            <span>/</span>
            <span>Search Results</span>
          </div>
        </div>

        {/* Header */}
        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-600">
            Found {pagination.total} shareholder(s) matching "{searchTerm}"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Page {pagination.page} of {pagination.totalPages}
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4 mb-6">
          {searchResults.length > 0 ? (
            searchResults.map((shareholder) => (
              <div 
                key={shareholder.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectShareholder(shareholder)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {shareholder.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Hash className="h-4 w-4" />
                          <span>{shareholder.reg_account_number}</span>
                        </div>
                        {/* <span>•</span>
                        <span>{shareholder.holdings.toLocaleString()} shares</span> */}
                        {/* <span>•</span>
                        <span>{shareholder.rights_issue} rights</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shareholders Found</h3>
              <p className="text-gray-600 mb-4">
                No shareholders found matching "{searchTerm}". Please try a different search term.
              </p>
              <Link to="/" className="btn-primary">
                Try Another Search
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>
            
            <div className="hidden md:flex space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border text-sm font-medium rounded-md ${pagination.page === pageNum ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <span className="px-4 py-2 text-sm text-gray-700">...</span>
              )}
              
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  className={`px-4 py-2 border text-sm font-medium rounded-md ${pagination.page === pagination.totalPages ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                >
                  {pagination.totalPages}
                </button>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;