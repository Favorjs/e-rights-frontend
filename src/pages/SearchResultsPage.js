import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchShareholders } from '../services/api';

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
        const response = await searchShareholders(
          searchTerm,
          pagination.page,
          pagination.limit
        );
        const data = response;

        if (data.success) {
          setSearchResults(data.data);
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages
          }));
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm, pagination.page, pagination.limit]); // All dependencies declared

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
      <div className="App flex items-center justify-center p-8">
        <div className="card max-w-md w-full p-12 text-center animate-fade-in">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No data found</h2>
          <p className="text-slate-500 mb-8">It seems you reached this page without a valid search query.</p>
          <Link to="/" className="btn-primary w-full py-3">
            Go back to search
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="App flex items-center justify-center p-8">
        <div className="text-center animate-pulse">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4 border-t-emerald-600"></div>
          <p className="text-slate-600 font-semibold tracking-wide">Syncing with database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-slate-50/50">
      <div className="container-custom py-12">
        {/* Navigation & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="animate-fade-in">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800 mb-4 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Search
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Search Results
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Found {pagination.total} shareholder(s) matching "{searchTerm}"
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            {/* <span className="text-emerald-600 uppercase tracking-widest">Database</span>
            <span className="mx-2 opacity-30">/</span> */}
            <span className="uppercase tracking-widest">Query results</span>
          </div>
        </div>

        {/* Results List */}
        <div className="grid gap-4 mb-10">
          {searchResults.length > 0 ? (
            searchResults.map((shareholder, index) => (
              <div
                key={shareholder.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="card group hover:border-[#0A4269] hover:shadow-md transition-all cursor-pointer animate-fade-in flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8"
                onClick={() => handleSelectShareholder(shareholder)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0">
                    <User className="h-6 w-6 text-slate-400 group-hover:text-[#0A4269]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0A4269] transition-colors truncate">
                      {shareholder.name}
                    </h3>
                    <div className="flex flex-wrap items-center mt-2 gap-2">
                      <div className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        <Hash className="h-3 w-3 mr-1" />
                        {shareholder.reg_account_number}
                      </div>
                      <span className="status-badge status-completed text-[9px] px-2 py-0.5">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 flex items-center space-x-4 w-full md:w-auto">
                  <div className="hidden md:block text-right mr-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account ID</p>
                    <p className="text-sm font-bold text-slate-700">{shareholder.id.toString().padStart(6, '0')}</p>
                  </div>
                  <button className="btn-outline border-slate-200 group-hover:bg-[#0A4269] group-hover:text-white group-hover:border-[#0A4269] w-full md:w-auto px-6 py-3">
                    View Records
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-16 text-center border-dashed bg-slate-50/30">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No records match your search</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                We couldn't find any shareholders matching "{searchTerm}". Please verify the spelling and try again.
              </p>
              <Link to="/" className="btn-secondary px-8">
                Return to Search Portal
              </Link>
            </div>
          )}
        </div>

        {/* Global Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200 gap-6">
            <p className="text-sm font-medium text-slate-500 order-2 md:order-1">
              Showing page <span className="text-slate-900 font-bold">{pagination.page}</span> of <span className="text-slate-900 font-bold">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center space-x-2 order-1 md:order-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (pagination.page <= 3) pageNum = i + 1;
                  else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = pagination.page - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] h-10 flex items-center justify-center px-3 rounded-md text-sm font-bold transition-all ${pagination.page === pageNum
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;