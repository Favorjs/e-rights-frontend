import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Eye, FileText, Receipt, CheckCircle, X,
  ZoomIn, ZoomOut, LayoutDashboard, Shield, CreditCard, Calendar,
  Hash, User, BarChart3, Banknote, Pen, Phone, Mail, Building2,
  TrendingUp, MinusCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getRightsSubmissionById } from '../services/api';

/* ─── Styles (matching AdminDashboard theme) ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');

  .details-page {
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

  .details-page, .details-page * {
    font-family: var(--font-body);
    box-sizing: border-box;
    margin: 0;
  }

  .details-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-soft {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .anim { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-d1 { animation-delay: 40ms; }
  .anim-d2 { animation-delay: 80ms; }
  .anim-d3 { animation-delay: 120ms; }
  .anim-d4 { animation-delay: 160ms; }

  /* ── Layout ── */
  .details-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Back Link ── */
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    text-decoration: none;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
    margin: 28px 0 24px;
  }
  .back-link:hover {
    background: var(--accent-light);
    color: var(--accent-hover);
    transform: translateX(-2px);
  }

  /* ── Page Header ── */
  .page-header {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 32px;
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .page-header-left { display: flex; align-items: center; gap: 16px; }
  .page-header-icon {
    width: 48px; height: 48px;
    background: var(--accent-light); color: var(--accent);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .page-title {
    font-family: var(--font-display);
    font-size: 22px; font-weight: 600; color: var(--text);
    line-height: 1.2;
  }
  .page-subtitle {
    font-size: 13px; color: var(--text-muted); margin-top: 2px;
  }
  .page-subtitle code {
    font-family: 'DM Sans', monospace;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    padding: 1px 7px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  /* ── Status Badge (header) ── */
  .status-badge-lg {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 24px;
    font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.04em;
    border: 1px solid transparent;
  }
  .status-badge-lg.completed { background: var(--green-bg); color: var(--green); border-color: var(--green-border); }
  .status-badge-lg.pending { background: var(--amber-bg); color: var(--amber); border-color: var(--amber-border); }
  .status-badge-lg.rejected { background: var(--red-bg); color: var(--red); border-color: var(--red-border); }

  /* ── Info Grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }

  .info-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s;
  }
  .info-card:hover { box-shadow: var(--shadow-md); }

  .info-card-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    background: var(--surface-alt);
  }
  .info-card-header-icon {
    width: 32px; height: 32px;
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .info-card-header-icon.blue { background: var(--accent-light); color: var(--accent); }
  .info-card-header-icon.green { background: var(--green-bg); color: var(--green); }

  .info-card-title {
    font-family: var(--font-display);
    font-size: 16px; font-weight: 600; color: var(--text);
  }

  .info-card-body { padding: 20px 22px; }

  /* ── Detail Rows ── */
  .detail-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }
  .detail-row:last-child { border-bottom: none; }

  .detail-label {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; color: var(--text-muted); font-weight: 500;
    white-space: nowrap; min-width: 0;
  }
  .detail-label svg { flex-shrink: 0; width: 14px; height: 14px; opacity: 0.5; }

  .detail-value {
    font-size: 13px; font-weight: 600; color: var(--text);
    text-align: right;
    word-break: break-all;
  }

  /* ── Badge (inline) ── */
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

  /* ── File Cards ── */
  .file-item {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    margin-bottom: 12px;
    transition: all 0.2s;
    background: var(--surface);
  }
  .file-item:last-child { margin-bottom: 0; }
  .file-item:hover { border-color: var(--border-hover); box-shadow: var(--shadow); }

  .file-item-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .file-item-label {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600; color: var(--text);
  }
  .file-item-label svg { width: 18px; height: 18px; }
  .file-item-label .icon-green { color: var(--green); }
  .file-item-label .icon-amber { color: var(--amber); }

  .file-check { color: var(--green); }
  .file-missing { font-size: 12px; font-weight: 600; color: var(--red); }

  .file-actions {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .file-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid transparent;
  }
  .file-btn-view {
    background: var(--accent-light); color: var(--accent);
    border-color: #C7D2FE;
  }
  .file-btn-view:hover {
    background: var(--accent); color: white;
    border-color: var(--accent);
    transform: translateY(-1px); box-shadow: var(--shadow);
  }
  .file-btn-dl {
    background: var(--green-bg); color: var(--green);
    border-color: var(--green-border);
  }
  .file-btn-dl:hover {
    background: #DCFCE7; border-color: #86EFAC;
    transform: translateY(-1px); box-shadow: var(--shadow);
  }

  .file-empty { font-size: 12px; color: var(--text-muted); }

  .file-processing {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px;
    background: var(--amber-bg);
    border: 1px solid var(--amber-border);
    border-radius: var(--radius-sm);
    font-size: 11px; font-weight: 700;
    color: var(--amber);
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  /* Signature sub-row */
  .sig-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .sig-row:last-child { border-bottom: none; }
  .sig-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }

  /* ── Payment Section ── */
  .payment-block {
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    margin-top: 4px;
  }
  .payment-ref {
    font-family: 'DM Sans', monospace;
    font-size: 12px; font-weight: 600;
    color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 4px;
    display: inline-block; margin-top: 6px;
    word-break: break-all;
  }
  .payment-date {
    font-size: 11px; color: var(--text-muted); margin-top: 4px;
  }

  /* ── Footer Actions ── */
  .footer-actions {
    display: flex; justify-content: center; gap: 12px;
    margin: 24px 0 40px;
  }
  .btn-back {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 11px 24px;
    background: var(--surface); color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 600;
    cursor: pointer; text-decoration: none;
    transition: all 0.2s;
  }
  .btn-back:hover {
    background: var(--surface-alt); border-color: var(--border-hover);
    color: var(--text); transform: translateY(-1px); box-shadow: var(--shadow);
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal-panel {
    background: var(--surface);
    border-radius: var(--radius);
    max-width: 1100px; width: 100%;
    max-height: 90vh;
    display: flex; flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: fadeUp 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 22px;
    border-bottom: 1px solid var(--border);
  }
  .modal-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .modal-controls { display: flex; align-items: center; gap: 8px; }
  .modal-zoom-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface-alt); border: 1px solid var(--border);
    border-radius: var(--radius-sm); cursor: pointer;
    color: var(--text-secondary); transition: all 0.15s;
  }
  .modal-zoom-btn:hover:not(:disabled) { background: var(--bg); color: var(--text); }
  .modal-zoom-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .modal-zoom-label { font-size: 12px; font-weight: 600; color: var(--text-muted); min-width: 36px; text-align: center; }
  .modal-reset-btn {
    font-size: 11px; font-weight: 600; color: var(--accent);
    background: none; border: none; cursor: pointer;
    padding: 4px 8px;
  }
  .modal-reset-btn:hover { text-decoration: underline; }
  .modal-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: var(--red-bg); border: 1px solid var(--red-border);
    border-radius: var(--radius-sm); cursor: pointer;
    color: var(--red); margin-left: 8px; transition: all 0.15s;
  }
  .modal-close:hover { background: #FEE2E2; border-color: #F87171; }

  .modal-body {
    flex: 1; overflow: auto; padding: 16px;
    position: relative;
  }
  .modal-body iframe {
    width: 100%; height: 70vh; border: none;
    border-radius: var(--radius-sm);
  }

  .modal-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 22px;
    border-top: 1px solid var(--border);
  }
  .modal-hint { font-size: 12px; color: var(--text-muted); }
  .modal-footer-btns { display: flex; gap: 8px; }
  .btn-modal-dl {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 8px 16px;
    background: var(--green-bg); color: var(--green);
    border: 1px solid var(--green-border);
    border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 600;
    cursor: pointer; text-decoration: none; transition: all 0.2s;
  }
  .btn-modal-dl:hover { background: #DCFCE7; border-color: #86EFAC; }
  .btn-modal-close {
    padding: 8px 18px;
    background: var(--accent); color: white;
    border: none; border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(45,91,255,0.2);
  }
  .btn-modal-close:hover { background: var(--accent-hover); }

  /* ── Loading ── */
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
    .page-header { flex-direction: column; align-items: flex-start; }
    .detail-row { flex-direction: column; gap: 2px; }
    .detail-value { text-align: left; }
  }
`;

const RightsSubmissionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await getRightsSubmissionById(id);
        if (response.success) {
          setSubmission(response.data);
        } else {
          toast.error('Failed to load submission details');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        toast.error('Error loading submission details');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id, navigate]);

  const getCloudinaryViewUrl = (publicId, fileType = 'auto') => {
    if (!publicId) return null;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  };

  const getCloudinaryDownloadUrl = (publicId, fileName = 'download') => {
    if (!publicId) return null;
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'apelng';
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    return `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment:${cleanFileName}/${publicId}`;
  };

  const handleViewFile = (publicId, fileName) => {
    try {
      if (!publicId) { toast.error('File not available for viewing'); return; }
      const isPDF = publicId.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.pdf');
      const viewUrl = getCloudinaryViewUrl(publicId, isPDF ? 'pdf' : 'image');
      if (!viewUrl) { toast.error('Could not generate view URL'); return; }
      setSelectedFile({ url: viewUrl, name: fileName, publicId, type: isPDF ? 'pdf' : 'image' });
      setShowFileViewer(true);
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Error loading file');
    }
  };

  const handleDownload = (publicId, fileName) => {
    try {
      if (!publicId) { toast.error('File not available for download'); return; }
      const downloadUrl = getCloudinaryDownloadUrl(publicId, fileName);
      if (!downloadUrl) { toast.error('Could not generate download URL'); return; }
      window.open(downloadUrl, '_blank');
      toast.success('Download started successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  const closeFileViewer = () => { setShowFileViewer(false); setSelectedFile(null); };

  const getFileName = (fileType, sub) => {
    const baseName = `rights-submission-${sub?.reg_account_number || sub?.id || 'unknown'}`;
    const ts = new Date().toISOString().split('T')[0];
    switch (fileType) {
      case 'filled_form': return `${baseName}-filled-form-${ts}.pdf`;
      case 'receipt': return `${baseName}-receipt-${ts}.jpg`;
      case 'signature': return `${baseName}-signature-${ts}.png`;
      default: return `${baseName}-document-${ts}.pdf`;
    }
  };

  const handleZoomIn = () => setZoomLevel(p => Math.min(p + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(p => Math.max(p - 0.2, 0.5));
  const handleResetZoom = () => { setZoomLevel(1); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    document.body.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => { setIsDragging(false); document.body.style.cursor = 'default'; };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <><style>{styles}</style>
        <div className="details-page loading-screen">
          <div className="icon-box"><LayoutDashboard size={22} /></div>
          <p>Loading submission details…</p>
        </div>
      </>
    );
  }

  if (!submission) {
    return (
      <><style>{styles}</style>
        <div className="details-page loading-screen">
          <p>Submission not found</p>
          <Link to="/admin" className="btn-back" style={{ marginTop: 12 }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
        </div>
      </>
    );
  }

  const statusClass = submission.status === 'completed' ? 'completed'
    : submission.status === 'rejected' ? 'rejected' : 'pending';
  const statusLabel = (submission.status || 'pending').charAt(0).toUpperCase() + (submission.status || 'pending').slice(1);

  return (
    <><style>{styles}</style>
      <div className="details-page">
        <div className="details-container">

          {/* Back */}
          <Link to="/admin" className="back-link anim">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="page-header anim anim-d1">
            <div className="page-header-left">
              <div className="page-header-icon"><FileText size={22} /></div>
              <div>
                <div className="page-title">Rights Submission Details</div>
                <div className="page-subtitle">Submission <code>#{submission.id}</code></div>
              </div>
            </div>
            <span className={`status-badge-lg ${statusClass}`}>
              <CheckCircle size={13} /> {statusLabel}
            </span>
          </div>

          {/* Row 1: Shareholder Info | Rights Details */}
          <div className="info-grid">

            {/* ── Shareholder Information ── */}
            <div className="info-card anim anim-d2">
              <div className="info-card-header">
                <div className="info-card-header-icon blue"><User size={16} /></div>
                <span className="info-card-title">Shareholder Information</span>
              </div>
              <div className="info-card-body">
                <div className="detail-row">
                  <span className="detail-label"><Hash /> CHN</span>
                  <span className="detail-value">{submission.chn || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Hash /> Reg Account</span>
                  <span className="detail-value">{submission.reg_account_number || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><User /> Name</span>
                  <span className="detail-value">{submission.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Shield /> BVN</span>
                  <span className="detail-value">{submission.bvn || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Phone /> Phone</span>
                  <span className="detail-value">{submission.phone_number || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Mail /> Email</span>
                  <span className="detail-value">{submission.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Calendar /> Submitted</span>
                  <span className="detail-value">{new Date(submission.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ── Rights Details ── */}
            <div className="info-card anim anim-d3">
              <div className="info-card-header">
                <div className="info-card-header-icon blue"><BarChart3 size={16} /></div>
                <span className="info-card-title">Rights Details</span>
              </div>
              <div className="info-card-body">
                <div className="detail-row">
                  <span className="detail-label"><BarChart3 /> Current Holdings</span>
                  <span className="detail-value">{submission.holdings?.toLocaleString() || '0'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><TrendingUp /> Allotted Rights</span>
                  <span className="detail-value">{submission.rights_issue?.toLocaleString() || '0'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><CheckCircle /> Shares Accepted</span>
                  <span className="detail-value">{submission.shares_accepted?.toLocaleString() || '0'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><BarChart3 /> Additional Shares</span>
                  <span className="detail-value">
                    {submission.apply_additional
                      ? <span className="badge badge-green"><CheckCircle size={11} /> {submission.additional_shares?.toLocaleString() || '0'}</span>
                      : <span className="badge badge-gray">None</span>}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><MinusCircle /> Shares Renounced</span>
                  <span className="detail-value">
                    {submission.shares_renounced && submission.shares_renounced > 0
                      ? <span className="badge badge-red">{submission.shares_renounced.toLocaleString()}</span>
                      : <span className="badge badge-gray">None</span>}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><TrendingUp /> Holdings After</span>
                  <span className="detail-value">{submission.holdings_after?.toLocaleString() || (() => {
                    const t = parseFloat(submission.holdings || 0) + parseFloat(submission.shares_accepted || 0) + parseFloat(submission.additional_shares || 0) - parseFloat(submission.shares_renounced || 0);
                    return t.toLocaleString();
                  })()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Shield /> Acceptance Type</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                    {(submission.action_type || '').replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Payment & Financial | Uploaded Files */}
          <div className="info-grid">

            {/* ── Payment & Financial ── */}
            <div className="info-card anim anim-d3">
              <div className="info-card-header">
                <div className="info-card-header-icon green"><Banknote size={16} /></div>
                <span className="info-card-title">Payment &amp; Financial</span>
              </div>
              <div className="info-card-body">
                <div className="detail-row">
                  <span className="detail-label"><Banknote /> Amount Payable</span>
                  <span className="detail-value">
                    ₦{submission.amount_payable
                      ? parseFloat(submission.amount_payable).toLocaleString('en-NG', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Banknote /> Value of Shares (₦)</span>
                  <span className="detail-value">
                    ₦{(parseFloat(submission.amount_due || 0) + parseFloat(submission.additional_amount || 0))
                      .toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Building2 /> Payment Bank</span>
                  <span className="detail-value">{submission.bank_name_edividend || 'N/A'}</span>
                </div>

                {/* Payment Method */}
                <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
                  <span className="detail-label"><CreditCard /> Payment Method</span>
                  {submission.payment_ref ? (
                    <div className="payment-block">
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge badge-purple">
                          <CreditCard size={11} /> Online Payment
                        </span>
                        {submission.payment_status && (
                          <span className={`badge ${submission.payment_status === 'successful' ? 'badge-green'
                              : submission.payment_status === 'failed' ? 'badge-red' : 'badge-amber'
                            }`}>
                            {submission.payment_status === 'successful' ? 'Verified' :
                              submission.payment_status.charAt(0).toUpperCase() + submission.payment_status.slice(1)}
                          </span>
                        )}
                      </div>
                      <div className="payment-ref">{submission.payment_ref}</div>
                      {submission.payment_date && (
                        <div className="payment-date">
                          Paid: {new Date(submission.payment_date).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="badge badge-gray" style={{ alignSelf: 'flex-start' }}>
                      Manual / Bank Transfer
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Uploaded Files ── */}
            <div className="info-card anim anim-d4">
              <div className="info-card-header">
                <div className="info-card-header-icon green"><Download size={16} /></div>
                <span className="info-card-title">Uploaded Files</span>
              </div>
              <div className="info-card-body">

                {/* Filled Form */}
                <div className="file-item">
                  <div className="file-item-top">
                    <span className="file-item-label">
                      <FileText className="icon-green" /> Filled Form (PDF)
                    </span>
                    {submission.filled_form_path
                      ? <CheckCircle size={17} className="file-check" />
                      : <span className="file-missing">Missing</span>}
                  </div>
                  {submission.filled_form_path ? (
                    <div className="file-actions">
                      <button className="file-btn file-btn-view"
                        onClick={() => handleViewFile(submission.filled_form_path, getFileName('filled_form', submission))}>
                        <Eye size={13} /> View PDF
                      </button>
                      <button className="file-btn file-btn-dl"
                        onClick={() => handleDownload(submission.filled_form_path, getFileName('filled_form', submission))}>
                        <Download size={13} /> Download
                      </button>
                    </div>
                  ) : <span className="file-empty">No PDF uploaded</span>}
                </div>

                {/* Receipt */}
                <div className="file-item">
                  <div className="file-item-top">
                    <span className="file-item-label">
                      <Receipt className="icon-green" /> Payment Receipt
                    </span>
                    {submission.receipt_path
                      ? <CheckCircle size={17} className="file-check" />
                      : submission.payment_ref
                        ? <CheckCircle size={17} style={{ color: 'var(--purple)' }} />
                        : <span className="file-missing">Missing</span>}
                  </div>
                  {submission.receipt_path ? (
                    <div className="file-actions">
                      <button className="file-btn file-btn-view"
                        onClick={() => handleViewFile(submission.receipt_path, getFileName('receipt', submission))}>
                        <Eye size={13} /> View
                      </button>
                      <button className="file-btn file-btn-dl"
                        onClick={() => handleDownload(submission.receipt_path, getFileName('receipt', submission))}>
                        <Download size={13} /> Download
                      </button>
                    </div>
                  ) : submission.payment_ref ? (
                    <div className="file-processing">
                      <CreditCard size={12} /> Processing via gateway
                    </div>
                  ) : <span className="file-empty">No receipt uploaded</span>}
                </div>

                {/* Signatures */}
                <div className="file-item">
                  <div className="file-item-top">
                    <span className="file-item-label">
                      <Pen className="icon-green" />
                      Signatures
                      {submission.signature_paths?.length > 0 &&
                        <span className="badge badge-green" style={{ marginLeft: 4 }}>
                          {submission.signature_paths.length}
                        </span>}
                    </span>
                    {submission.signature_paths?.length > 0
                      ? <CheckCircle size={17} className="file-check" />
                      : <span className="file-missing">Missing</span>}
                  </div>
                  {submission.signature_paths?.length > 0 ? (
                    <div>
                      {submission.signature_paths.map((sigPath, i) => (
                        <div key={i} className="sig-row">
                          <span className="sig-label">Signature {i + 1}</span>
                          <div className="file-actions">
                            <button className="file-btn file-btn-view"
                              onClick={() => handleViewFile(sigPath, getFileName('signature', submission))}>
                              <Eye size={12} /> View
                            </button>
                            <button className="file-btn file-btn-dl"
                              onClick={() => handleDownload(sigPath, getFileName('signature', submission))}>
                              <Download size={12} /> Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <span className="file-empty">No signatures uploaded</span>}
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer-actions anim anim-d4">
            <Link to="/admin" className="btn-back">
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
          </div>

        </div>
      </div>

      {/* ── File Viewer Modal ── */}
      {showFileViewer && selectedFile && (
        <div className="modal-overlay"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}>
          <div className="modal-panel">

            <div className="modal-header">
              <span className="modal-title">{selectedFile.name || 'Document'}</span>
              <div className="modal-controls">
                {selectedFile.type === 'image' && (
                  <>
                    <button className="modal-zoom-btn" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                      <ZoomOut size={15} />
                    </button>
                    <span className="modal-zoom-label">{Math.round(zoomLevel * 100)}%</span>
                    <button className="modal-zoom-btn" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                      <ZoomIn size={15} />
                    </button>
                    <button className="modal-reset-btn" onClick={handleResetZoom}>Reset</button>
                  </>
                )}
                <button className="modal-close" onClick={closeFileViewer}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="modal-body"
              onMouseMove={selectedFile.type === 'image' ? handleMouseMove : undefined}>
              {selectedFile.type === 'pdf' ? (
                <iframe
                  src={`${selectedFile.url}#toolbar=1&navpanes=1&view=FitH`}
                  title={selectedFile.name || 'PDF Document'}
                />
              ) : (
                <div style={{ cursor: isDragging ? 'grabbing' : 'grab', overflow: 'auto', width: '100%', height: '100%' }}
                  onMouseDown={handleMouseDown}>
                  <div style={{
                    transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: 'center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                    width: 'fit-content', height: 'fit-content',
                    maxWidth: '100%', maxHeight: '100%'
                  }}>
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.name || 'Document'}
                      style={{ maxWidth: 'none', pointerEvents: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <span className="modal-hint">
                {selectedFile.type === 'image' ? 'Drag to pan · Use zoom controls' : ''}
              </span>
              <div className="modal-footer-btns">
                <a href={getCloudinaryDownloadUrl(selectedFile.publicId, selectedFile.name)}
                  download className="btn-modal-dl"
                  onClick={(e) => { e.stopPropagation(); toast.success('Download started'); }}>
                  <Download size={13} /> Download
                </a>
                <button className="btn-modal-close" onClick={closeFileViewer}>Close</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default RightsSubmissionDetailsPage;