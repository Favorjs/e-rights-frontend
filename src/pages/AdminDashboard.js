import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  ArrowLeft, 
  Search, 
  Eye, 
  Users,
  CheckCircle,
  FileText,
  Percent,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [rightsSubmissions, setRightsSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rightsClaimingFilter, setRightsClaimingFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('rights'); // 'rights' or 'forms'

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);



  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error loading dashboard statistics');
    }
  };

  // const fetchSubmissions = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams({
  //       page: currentPage,
  //       limit: 10
  //     });

  //     if (searchTerm) {
  //       params.append('search', searchTerm);
  //     }

  //     const response = await axios.get(`/api/admin/submissions?${params}`);
      
  //     if (response.data.success) {
  //       setSubmissions(response.data.data);
  //       setTotalPages(response.data.pagination.totalPages);
  //       setTotalCount(response.data.pagination.totalCount);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching submissions:', error);
  //     toast.error('Error loading submissions');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchRightsSubmissions = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams({
  //       page: currentPage,
  //       limit: 10
  //     });

  //     if (searchTerm) {
  //       params.append('search', searchTerm);
  //     }

  //     if (rightsClaimingFilter) {
  //       params.append('rightsClaiming', rightsClaimingFilter);
  //     }

  //     const response = await axios.get(`/api/admin/rights-submissions?${params}`);
      
  //     if (response.data.success) {
  //       setRightsSubmissions(response.data.data);
  //       setTotalPages(response.data.pagination.totalPages);
  //       setTotalCount(response.data.pagination.totalCount);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching rights submissions:', error);
  //     toast.error('Error loading rights submissions');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/admin/submissions?${params}`);
      
      if (response.data.success) {
        setSubmissions(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Error loading submissions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]); // Add dependencies here

  const fetchRightsSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (rightsClaimingFilter) {
        params.append('rightsClaiming', rightsClaimingFilter);
      }

      const response = await axios.get(`/api/admin/rights-submissions?${params}`);
      
      if (response.data.success) {
        setRightsSubmissions(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching rights submissions:', error);
      toast.error('Error loading rights submissions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, rightsClaimingFilter]); // Add dependencies here

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'rights') {
      fetchRightsSubmissions();
    } else {
      fetchSubmissions();
    }
  }, [currentPage, searchTerm, activeTab, rightsClaimingFilter, fetchRightsSubmissions, fetchSubmissions]); // Add the functions to dependencies


  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeTab === 'rights') {
      fetchRightsSubmissions();
    } else {
      fetchSubmissions();
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/admin/export?format=csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data');
    }
  };

  const handleExportRights = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv'
      });

      if (rightsClaimingFilter) {
        params.append('rightsClaiming', rightsClaimingFilter);
      }

      const response = await axios.get(`/api/admin/export-rights?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rights_submissions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Rights data exported successfully');
    } catch (error) {
      console.error('Error exporting rights data:', error);
      toast.error('Error exporting rights data');
    }
  };

  const handleFilterChange = (value) => {
    setRightsClaimingFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setRightsClaimingFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Rights Issue Submissions Management</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="btn-outline flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Portal</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shareholders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShareholders}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rights Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rightsSubmissions || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submission Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalShareholders > 0 
                    ? (((stats.rightsSubmissions || 0) / stats.totalShareholders) * 100).toFixed(2) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, reg number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            
            {activeTab === 'rights' && (
              <div className="w-full sm:w-48">
                <div className="relative">
                  <select
                    value={rightsClaimingFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="form-input pl-10"
                  >
                    <option value="">All Rights Status</option>
                    <option value="full">Full Rights Claimed</option>
                    <option value="renounced">Rights Renounced</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {(searchTerm || rightsClaimingFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-outline"
              >
                Clear Filters
              </button>
            )}
            
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('rights');
                  setRightsClaimingFilter('');
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rights'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rights Issue Submissions
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'forms'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Regular Forms
              </button>
            </nav>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'rights' ? 'Rights Issue Submissions' : 'Form Submissions'}
            </h2>
            <button
              onClick={() => activeTab === 'rights' ? handleExportRights() : handleExport()}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export {activeTab === 'rights' ? 'Rights' : 'Forms'}</span>
            </button>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  {activeTab === 'rights' ? (
                    <>
                      <th>CHN</th>
                      <th>REG ACCOUNT</th>
                      <th>NAME</th>
                      <th>HOLDINGS</th>
                      <th>RIGHTS ISSUE</th>
                      <th>HOLDINGS AFTER</th>
                      <th>ACCEPTANCE TYPE</th>
                      <th>AMOUNT DUE</th>
                      <th>FILLED FORM</th>
                      <th>RECEIPT</th>
                      <th>ACTIONS</th>
                      
                    </>
                  ) : (
                    <>
                      <th>REG ACCOUNT</th>
                      <th>NAME</th>
                      <th>HOLDINGS</th>
                      <th>RIGHTS ISSUE</th>
                      <th>HOLDINGS AFTER</th>
                      <th>SIGNATURE</th>
                      <th>RECEIPT</th>
                      <th>ACTIONS</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="table-body">
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'rights' ? 11 : 8} className="table-cell text-center py-8">
                      <div className="spinner mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading submissions...</p>
                    </td>
                  </tr>
                ) : (activeTab === 'rights' ? rightsSubmissions : submissions).length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'rights' ? 11 : 8} className="table-cell text-center py-8">
                      <p className="text-gray-600">No submissions found</p>
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'rights' ? rightsSubmissions : submissions).map((submission) => (
                    <tr key={submission.id} className="table-row">
                      {activeTab === 'rights' ? (
                        <>
                          <td className="table-cell font-medium">{submission.chn}</td>
                          <td className="table-cell font-medium">{submission.reg_account_number}</td>
                          <td className="table-cell">{submission.name}</td>
                          <td className="table-cell">{submission.holdings.toLocaleString()}</td>
                          <td className="table-cell">{submission.rights_issue}</td>
                          {/* <td className="table-cell">{submission.amount_due || '-'}</td> */}
                          <td className="table-cell">{submission.holdings_after.toLocaleString()}</td>
                          <td className="table-cell">{submission.action_type}</td>
                          <td className="table-cell">₦{submission.amount_due.toLocaleString()}</td>
                          
                          <td className="table-cell">
                            {submission.filled_form_path ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="table-cell">
                            {submission.receipt_path ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/rights-submission/${submission.id}`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="table-cell font-medium">
                            {submission.reg_account_number}
                          </td>
                          <td className="table-cell">{submission.name}</td>
                          <td className="table-cell">{submission.holdings.toLocaleString()}</td>
                          <td className="table-cell">{submission.rights_issue}</td>
                          <td className="table-cell">{submission.holdings_after.toLocaleString()}</td>
                          <td className="table-cell">
                            {submission.signature_file ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="table-cell">
                            {submission.receipt_file ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/submission/${submission.id}`)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;