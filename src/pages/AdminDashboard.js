import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  ArrowLeft, 
  Search, 
  Eye, 
  ChevronDown,
  Users,
  CheckCircle,
  Clock,
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // useEffect(() => {
  //   fetchSubmissions();
  // }, [currentPage, searchTerm, statusFilter]);

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

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (statusFilter !== 'All Status') {
        params.append('status', statusFilter.toLowerCase());
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
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubmissions();
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      rejected: 'status-rejected'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // const formatCurrency = (amount) => {
  //   return new Intl.NumberFormat('en-NG', {
  //     style: 'currency',
  //     currency: 'NGN'
  //   }).format(amount);
  // };

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
              onClick={handleExport}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
            
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Forms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedForms}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Forms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingForms}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}</p>
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
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input pr-10 appearance-none"
              >
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Submissions Table */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Form Submissions</h2>
          
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>REG ACCOUNT</th>
                  <th>NAME</th>
                  <th>HOLDINGS</th>
                  <th>RIGHTS ISSUE</th>
                  <th>HOLDINGS AFTER</th>
                  <th>STATUS</th>
                  <th>SIGNATURE</th>
                  <th>RECEIPT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="table-cell text-center py-8">
                      <div className="spinner mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading submissions...</p>
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="table-cell text-center py-8">
                      <p className="text-gray-600">No submissions found</p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="table-row">
                      <td className="table-cell font-medium">
                        {submission.reg_account_number}
                      </td>
                      <td className="table-cell">{submission.name}</td>
                      <td className="table-cell">{submission.holdings.toLocaleString()}</td>
                      <td className="table-cell">{submission.rights_issue}</td>
                      <td className="table-cell">{submission.holdings_after.toLocaleString()}</td>
                      <td className="table-cell">
                        {getStatusBadge(submission.status)}
                      </td>
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
                          <button
                            onClick={() => handleExport()}
                            className="text-green-600 hover:text-green-800"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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
                
                <button
                  className="btn-primary"
                >
                  {currentPage}
                </button>
                
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