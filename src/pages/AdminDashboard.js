import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Search,
  Eye,
  Users,
  CheckCircle,
  FileText,
  Percent,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  X,
  Loader2,
  LayoutDashboard,
  TrendingUp,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getDashboardStats,
  getSubmissions,
  getRightsSubmissions,
  exportSubmissions,
  exportRightsSubmissions
} from '../services/api';

/* ─── Styles ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');

  .admin-dash {
    --bg: #F4F3F0;
    --surface: #FFFFFF;
    --surface-alt: #FAFAF8;
    --border: #E8E6E1;
    --border-hover: #D4D1CA;
    --text: #1A1A1A;
    --text-secondary: #5C5C5C;
    --text-muted: #9B9B9B;
    --accent: #2D5BFF;
    --accent-light: #EEF2FF;
    --accent-hover: #1D4AE8;
    --green: #16A34A;
    --green-bg: #F0FDF4;
    --green-border: #BBF7D0;
    --amber: #D97706;
    --amber-bg: #FFFBEB;
    --amber-border: #FDE68A;
    --red: #DC2626;
    --red-bg: #FEF2F2;
    --red-border: #FECACA;
    --purple: #7C3AED;
    --purple-bg: #F5F3FF;
    --purple-border: #DDD6FE;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'DM Sans', -apple-system, sans-serif;
    --radius: 16px;
    --radius-md: 12px;
    --radius-sm: 8px;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  }

  .admin-dash, .admin-dash * {
    font-family: var(--font-body);
    box-sizing: border-box;
    margin: 0;
  }

  .admin-dash {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .anim { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-d1 { animation-delay: 40ms; }
  .anim-d2 { animation-delay: 80ms; }
  .anim-d3 { animation-delay: 120ms; }
  .anim-d4 { animation-delay: 160ms; }
  .anim-d5 { animation-delay: 200ms; }

  /* ── Header ── */
  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 0 24px;
    margin-bottom: 28px;
  }
  .dash-brand { display: flex; align-items: center; gap: 14px; }
  .dash-brand-icon {
    width: 42px; height: 42px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 2px 8px rgba(45,91,255,0.25);
  }
  .dash-brand-title {
    font-family: var(--font-display);
    font-size: 24px; font-weight: 600; color: var(--text);
    line-height: 1.1;
  }
  .dash-brand-sub {
    font-size: 13px; color: var(--text-muted);
    margin-top: 1px;
  }

  .btn-logout {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px;
    border: 1px solid var(--red-border);
    background: var(--red-bg);
    color: var(--red);
    border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-logout:hover {
    background: #FEE2E2; border-color: #F87171;
    transform: translateY(-1px); box-shadow: var(--shadow);
  }

  /* ── Stat Cards ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 24px;
  }
  @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    position: relative;
    box-shadow: var(--shadow-sm);
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-hover);
  }

  .stat-card-inner {
    padding: 24px 24px 20px;
    display: flex;
    flex-direction: column;
  }

  .stat-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .stat-icon {
    width: 46px; height: 46px;
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .stat-icon.blue { background: var(--accent-light); color: var(--accent); }
  .stat-icon.green { background: var(--green-bg); color: var(--green); }
  .stat-icon.purple { background: var(--purple-bg); color: var(--purple); }

  .stat-trend-badge {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    padding: 4px 9px; border-radius: 20px;
  }
  .stat-trend-badge.green { background: var(--green-bg); color: var(--green); }
  .stat-trend-badge.blue { background: var(--accent-light); color: var(--accent); }

  .stat-label {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 4px;
    letter-spacing: 0.01em;
  }
  .stat-value {
    font-family: var(--font-display);
    font-size: 34px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .stat-card-footer {
    padding: 12px 24px;
    background: var(--surface-alt);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .stat-card-footer svg { flex-shrink: 0; }

  /* ── Search & Filter ── */
  .filters-bar {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 18px;
    margin-bottom: 18px;
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap;
    box-shadow: var(--shadow-sm);
  }
  .search-wrap {
    flex: 1; min-width: 240px;
    position: relative;
  }
  .search-wrap > svg {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text);
    outline: none; transition: all 0.2s;
  }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
    background: var(--surface);
  }
  .filter-wrap { position: relative; }
  .filter-wrap > svg {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  .filter-select {
    padding: 10px 32px 10px 36px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text);
    cursor: pointer; outline: none; transition: all 0.2s;
    -webkit-appearance: none; min-width: 175px;
  }
  .filter-select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-light);
  }

  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px;
    background: var(--accent); color: white; border: none;
    border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(45,91,255,0.2);
  }
  .btn-primary:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(45,91,255,0.25);
  }

  .btn-ghost {
    display: flex; align-items: center; gap: 5px;
    padding: 10px 14px;
    background: transparent; color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-ghost:hover { background: var(--surface-alt); border-color: var(--border-hover); color: var(--text); }

  .btn-export {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px;
    background: var(--green-bg); color: var(--green);
    border: 1px solid var(--green-border);
    border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .btn-export:hover {
    background: #DCFCE7; border-color: #86EFAC;
    transform: translateY(-1px); box-shadow: var(--shadow);
  }

  /* ── Table ── */
  .table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .table-top {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 22px;
    border-bottom: 1px solid var(--border);
  }
  .table-title-row { display: flex; align-items: center; gap: 10px; }
  .table-title {
    font-family: var(--font-display);
    font-size: 19px; font-weight: 600; color: var(--text);
  }
  .table-badge {
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px;
    background: var(--accent-light); color: var(--accent);
  }

  .table-note {
    padding: 10px 22px;
    background: var(--accent-light);
    border-bottom: 1px solid #DAE2FF;
    font-size: 12px; color: var(--accent);
    display: flex; align-items: center; gap: 7px;
  }

  .table-scroll {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border-hover) transparent;
  }
  .table-scroll::-webkit-scrollbar { height: 5px; }
  .table-scroll::-webkit-scrollbar-track { background: transparent; }
  .table-scroll::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }

  .data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
  .data-table thead th {
    padding: 11px 16px;
    font-size: 10.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--text-muted);
    background: var(--surface-alt);
    border-bottom: 1px solid var(--border);
    text-align: left;
    position: sticky; top: 0; z-index: 1;
  }
  .data-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background 0.12s;
  }
  .data-table tbody tr:last-child { border-bottom: none; }
  .data-table tbody tr:hover { background: #FAFAF8; }

  .data-table td {
    padding: 13px 16px;
    font-size: 13px; color: var(--text-secondary);
  }
  .data-table td.primary { color: var(--text); font-weight: 500; }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 600; white-space: nowrap;
    border: 1px solid transparent;
  }
  .badge-green { background: var(--green-bg); color: var(--green); border-color: var(--green-border); }
  .badge-amber { background: var(--amber-bg); color: var(--amber); border-color: var(--amber-border); }
  .badge-red { background: var(--red-bg); color: var(--red); border-color: var(--red-border); }
  .badge-purple { background: var(--purple-bg); color: var(--purple); border-color: var(--purple-border); }
  .badge-gray { background: #F5F5F4; color: #78716C; border-color: #E7E5E4; }

  .check-icon { color: var(--green); }
  .muted { color: var(--text-muted); }

  .btn-view {
    width: 30px; height: 30px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--accent-light); color: var(--accent);
    border: 1px solid #C7D2FE; border-radius: var(--radius-sm);
    cursor: pointer; transition: all 0.2s;
  }
  .btn-view:hover {
    background: var(--accent); color: white; border-color: var(--accent);
    transform: scale(1.06);
  }

  /* Empty / loading */
  .empty-state { padding: 56px 20px; text-align: center; }
  .empty-state p { font-size: 14px; color: var(--text-muted); }
  .spinner { animation: spin 0.7s linear infinite; color: var(--accent); }

  /* Pagination */
  .pag-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 22px;
    border-top: 1px solid var(--border);
  }
  .pag-info { font-size: 13px; color: var(--text-muted); }
  .pag-info b { color: var(--text-secondary); font-weight: 600; }
  .pag-controls { display: flex; align-items: center; gap: 6px; }
  .pag-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 13px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 500; color: var(--text-secondary);
    cursor: pointer; transition: all 0.15s;
  }
  .pag-btn:hover:not(:disabled) { background: var(--surface-alt); border-color: var(--border-hover); color: var(--text); }
  .pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .pag-current {
    padding: 7px 13px; min-width: 38px; text-align: center;
    background: var(--accent-light); color: var(--accent);
    border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 700;
  }

  /* Loading screen */
  .loading-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: var(--bg); gap: 14px;
  }
  .loading-screen .icon-box {
    width: 48px; height: 48px;
    background: var(--accent); border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    color: white; animation: pulse-soft 1.4s ease infinite;
    box-shadow: 0 2px 12px rgba(45,91,255,0.3);
  }
  .loading-screen p { font-size: 14px; color: var(--text-muted); }

  @media (max-width: 640px) {
    .dash-header { flex-direction: column; align-items: flex-start; gap: 14px; }
    .filters-bar { flex-direction: column; }
    .search-wrap { min-width: 100%; }
    .table-top { flex-direction: column; align-items: flex-start; gap: 10px; }
    .pag-bar { flex-direction: column; gap: 10px; }
    .stat-value { font-size: 28px; }
  }
`;

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
  const [activeTab] = useState('rights');

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error loading dashboard statistics');
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      const response = await getSubmissions(params);
      if (response.success) {
        setSubmissions(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Error loading submissions');
    } finally { setLoading(false); }
  }, [currentPage, searchTerm]);

  const fetchRightsSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (rightsClaimingFilter) params.rightsClaiming = rightsClaimingFilter;
      const response = await getRightsSubmissions(params);
      if (response.success) {
        setRightsSubmissions(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching rights submissions:', error);
      toast.error('Error loading rights submissions');
    } finally { setLoading(false); }
  }, [currentPage, searchTerm, rightsClaimingFilter]);

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => {
    if (activeTab === 'rights') fetchRightsSubmissions();
    else fetchSubmissions();
  }, [currentPage, searchTerm, activeTab, rightsClaimingFilter, fetchRightsSubmissions, fetchSubmissions]);

  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(1); };

  const handleExport = async () => {
    try {
      const response = await exportSubmissions({ format: 'csv' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'submissions.csv');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('Data exported successfully');
    } catch (error) { console.error('Error exporting data:', error); toast.error('Error exporting data'); }
  };

  const handleExportRights = async () => {
    try {
      const params = { format: 'csv' };
      if (rightsClaimingFilter) params.rightsClaiming = rightsClaimingFilter;
      const response = await exportRightsSubmissions(params);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'rights_submissions.csv');
      document.body.appendChild(link); link.click(); link.remove();
      toast.success('Rights data exported successfully');
    } catch (error) { console.error('Error exporting rights data:', error); toast.error('Error exporting rights data'); }
  };

  const handleFilterChange = (v) => { setRightsClaimingFilter(v); setCurrentPage(1); };
  const clearFilters = () => { setRightsClaimingFilter(''); setSearchTerm(''); setCurrentPage(1); };

  const dataList = activeTab === 'rights' ? rightsSubmissions : submissions;
  const colCount = activeTab === 'rights' ? 7 : 8;

  if (!stats) {
    return (
      <><style>{styles}</style>
        <div className="admin-dash loading-screen">
          <div className="icon-box"><LayoutDashboard size={22} /></div>
          <p>Loading dashboard…</p>
        </div>
      </>
    );
  }

  const rate = stats.totalShareholders > 0
    ? (((stats.rightsSubmissions || 0) / stats.totalShareholders) * 100).toFixed(2)
    : 0;

  return (
    <><style>{styles}</style>
      <div className="admin-dash">
        <div style={{ maxWidth: 1340, margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <div className="dash-header anim">
            <div className="dash-brand">
              <div className="dash-brand-icon"><LayoutDashboard size={20} /></div>
              <div>
                <div className="dash-brand-title">Admin Dashboard</div>
                <div className="dash-brand-sub">Rights Issue Submissions Management</div>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>

          {/* Stat Cards */}
          <div className="stats-row">
            <div className="stat-card anim anim-d1">
              <div className="stat-card-inner">
                <div className="stat-card-top">
                  <div className="stat-icon blue"><Users size={21} /></div>
                  <div className="stat-trend-badge green"><TrendingUp size={11} /> Active</div>
                </div>
                <div className="stat-label">Total Shareholders </div>
                <div className="stat-value">{stats.totalShareholders?.toLocaleString()}</div>
              </div>
              <div className="stat-card-footer">
                <Activity size={13} color="var(--text-muted)" />
                Registered shareholder accounts
              </div>
            </div>

            <div className="stat-card anim anim-d2">
              <div className="stat-card-inner">
                <div className="stat-card-top">
                  <div className="stat-icon green"><FileText size={21} /></div>
                  <div className="stat-trend-badge green"><ArrowUpRight size={11} /> Growing</div>
                </div>
                <div className="stat-label">Rights Submissions</div>
                <div className="stat-value">{(stats.rightsSubmissions || 0).toLocaleString()}</div>
              </div>
              <div className="stat-card-footer">
                <Activity size={13} color="var(--text-muted)" />
                Total processed submissions
              </div>
            </div>

            <div className="stat-card anim anim-d3">
              <div className="stat-card-inner">
                <div className="stat-card-top">
                  <div className="stat-icon purple"><Percent size={21} /></div>
                  <div className="stat-trend-badge blue"><TrendingUp size={11} /> Rate</div>
                </div>
                <div className="stat-label">Submission Rate</div>
                <div className="stat-value">{rate}%</div>
              </div>
              <div className="stat-card-footer">
                <Activity size={13} color="var(--text-muted)" />
                Participation vs total shareholders
              </div>
            </div>
          </div>

          {/* Filters */}
          <form onSubmit={handleSearch} className="filters-bar anim anim-d4">
            <div className="search-wrap">
              <Search size={16} />
              <input type="text" placeholder="Search by name, reg number, or email…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
            </div>
            {activeTab === 'rights' && (
              <div className="filter-wrap">
                <Filter size={15} />
                <select value={rightsClaimingFilter} onChange={(e) => handleFilterChange(e.target.value)} className="filter-select">
                  <option value="">All Rights Status</option>
                  <option value="full">Full Rights Claimed</option>
                  <option value="renounced">Rights Renounced</option>
                </select>
              </div>
            )}
            {(searchTerm || rightsClaimingFilter) && (
              <button type="button" onClick={clearFilters} className="btn-ghost"><X size={14} /> Clear</button>
            )}
            <button type="submit" className="btn-primary"><Search size={15} /> Search</button>
          </form>

          {/* Table */}
          <div className="table-wrap anim anim-d5">
            <div className="table-top">
              <div className="table-title-row">
                <span className="table-title">{activeTab === 'rights' ? 'Rights Issue Submissions' : 'Form Submissions'}</span>
                <span className="table-badge">{totalCount} total</span>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/14_3wZB8Jtn6hQ7w7seG00POoi-FXq2-FyZG6sgEtlYo/edit?gid=0#gid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-export"
                style={{ background: '#E8F5E9', color: '#1E7E34', borderColor: '#A5D6A7', textDecoration: 'none' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                Google Sheet
              </a>
              <button onClick={() => activeTab === 'rights' ? handleExportRights() : handleExport()} className="btn-export">
                <Download size={15} /> Export CSV
              </button>
            </div>

            {activeTab === 'rights' && (
              <div className="table-note">
                <FileText size={14} /> Click the <Eye size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> View button to see full submission details. All data is included in the CSV export.
              </div>
            )}

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {activeTab === 'rights' ? (
                      <>
                        <th>Date</th><th>CHN</th><th>Reg Account</th><th>Name</th>
                        <th>Acceptance Type</th><th>Amount Payable</th><th>Actions</th>
                      </>
                    ) : (
                      <>
                        <th>Reg Account</th><th>Name</th><th>Holdings</th><th>Rights Issue</th>
                        <th>Holdings After</th><th>Signature</th><th>Receipt</th><th>Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={colCount} className="empty-state">
                      <Loader2 size={22} className="spinner" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <p>Loading submissions…</p>
                    </td></tr>
                  ) : dataList.length === 0 ? (
                    <tr><td colSpan={colCount} className="empty-state"><p>No submissions found</p></td></tr>
                  ) : dataList.map((s) => (
                    <tr key={s.id}>
                      {activeTab === 'rights' ? (
                        <>
                          <td className="primary">{s.created_at ? new Date(s.created_at).toLocaleString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                          <td className="primary">{s.chn || '-'}</td>
                          <td className="primary">{s.reg_account_number || '-'}</td>
                          <td className="primary">{s.name || '-'}</td>
                          <td><span className={`badge ${s.action_type === 'full_acceptance' ? 'badge-green' : 'badge-amber'}`}>{s.action_type === 'full_acceptance' ? 'Full' : 'Partial/Ren.'}</span></td>
                          <td className="primary">₦{s.amount_payable ? parseFloat(s.amount_payable).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                          <td><button onClick={() => navigate(`/admin/rights-submission/${s.id}`)} className="btn-view" title="View Details"><Eye size={14} /></button></td>
                        </>
                      ) : (
                        <>
                          <td className="primary">{s.reg_account_number}</td>
                          <td className="primary">{s.name}</td>
                          <td>{s.holdings.toLocaleString()}</td>
                          <td>{s.rights_issue}</td>
                          <td>{s.holdings_after.toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>{s.signature_file ? <CheckCircle size={17} className="check-icon" /> : <span className="muted">—</span>}</td>
                          <td style={{ textAlign: 'center' }}>{s.receipt_file ? <CheckCircle size={17} className="check-icon" /> : <span className="muted">—</span>}</td>
                          <td><button onClick={() => navigate(`/admin/submission/${s.id}`)} className="btn-view" title="View Details"><Eye size={14} /></button></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pag-bar">
                <div className="pag-info">Showing <b>{((currentPage - 1) * 10) + 1}</b> to <b>{Math.min(currentPage * 10, totalCount)}</b> of <b>{totalCount}</b></div>
                <div className="pag-controls">
                  <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pag-btn" title="First page"><ChevronLeft size={14} /><ChevronLeft size={14} /></button>
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pag-btn"><ChevronLeft size={14} /> Previous</button>
                  <span className="pag-current">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pag-btn">Next <ChevronRight size={14} /></button>
                  <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="pag-btn" title="Last page"><ChevronRight size={14} /><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;