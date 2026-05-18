/**
 * InternshipDetail Page
 * Company: View full details of a specific internship posting
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Briefcase, MapPin, Calendar, Clock, Users,
  CheckCircle, Lock, FileCheck, Edit, Trash2, Unlock,
  Building2, DollarSign, BookOpen, ListChecks, AlertTriangle
} from 'lucide-react';
import Header from '../../components/common/Header';
import internshipService from '../../services/internshipService';

const InternshipDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  const C = {
    green: '#14a800', greenLight: '#e8f5e9', greenBorder: '#d5e0d5',
    border: '#e4e5e7', bg: '#f7f8f9', white: '#ffffff',
    text: '#1f2d3d', muted: '#6b7177', error: '#c53030',
  };

  useEffect(() => {
    const fetchInternship = async () => {
      setLoading(true);
      const result = await internshipService.getById(id);
      if (result.success) {
        setInternship(result.data);
      } else {
        setError('Could not load internship details. It may have been deleted.');
      }
      setLoading(false);
    };
    fetchInternship();
  }, [id]);

  const handleToggleStatus = async () => {
    const result = internship.status === 'OPEN'
      ? await internshipService.close(internship.id)
      : await internshipService.reopen(internship.id);
    if (result.success) {
      setInternship(prev => ({
        ...prev,
        status: prev.status === 'OPEN' ? 'CLOSED' : 'OPEN',
      }));
    }
  };

  const handleDelete = async () => {
    const result = await internshipService.delete(internship.id);
    if (result.success) {
      navigate('/company/my-internships', { state: { message: 'Internship deleted successfully' } });
    }
    setDeleteModal(false);
  };

  const statusColor = {
    OPEN: C.green,
    CLOSED: C.muted,
    FILLED: '#2563EB',
  };

  const StatusIcon = ({ s }) => {
    if (s === 'OPEN') return <CheckCircle size={14} />;
    if (s === 'CLOSED') return <Lock size={14} />;
    return <FileCheck size={14} />;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Internship Details" subtitle="View and manage your posting" />
      <div style={{ padding: '80px', textAlign: 'center', color: C.muted }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `4px solid ${C.green}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        Loading internship details...
      </div>
    </div>
  );

  if (error || !internship) return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Internship Details" subtitle="View and manage your posting" />
      <div style={{ padding: '40px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: C.white, borderRadius: 16, padding: '48px 32px', border: `1px solid ${C.border}` }}>
          <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: 16 }} />
          <h2 style={{ color: C.text, marginBottom: 8 }}>Internship Not Found</h2>
          <p style={{ color: C.muted, marginBottom: 24 }}>{error || 'This internship does not exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/company/my-internships')}
            style={{ padding: '12px 24px', background: C.green, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
          >
            ← Back to My Internships
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Internship Details" subtitle="View and manage your posting" />

      <div style={{ padding: '0 40px 48px', maxWidth: 1080, margin: '0 auto' }}>

        {/* Back nav + action buttons */}
        <div style={{ paddingTop: 22, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <button
            onClick={() => navigate('/company/my-internships')}
            style={{ padding: '8px 18px', background: 'transparent', color: C.green, border: `1.5px solid ${C.green}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Back to My Internships
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/company/post-internship', { state: { internship, isEdit: true } })}
              style={{ padding: '9px 18px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #93C5FD', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Edit size={15} /> Edit
            </button>
            <button
              onClick={handleToggleStatus}
              style={{ padding: '9px 18px', background: internship.status === 'OPEN' ? '#FEF2F2' : C.greenLight, color: internship.status === 'OPEN' ? '#DC2626' : C.green, border: `1px solid ${internship.status === 'OPEN' ? '#FCA5A5' : C.greenBorder}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {internship.status === 'OPEN' ? <><Lock size={15} /> Close Listing</> : <><Unlock size={15} /> Reopen Listing</>}
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              style={{ padding: '9px 18px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: Main Detail Card ── */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Header Banner */}
            <div style={{ padding: '28px 32px', borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${C.green} 0%, #108a00 100%)` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>{internship.title}</h1>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {internship.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                        <MapPin size={14} /> {internship.location}
                      </span>
                    )}
                    {internship.duration_months && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                        <Clock size={14} /> {internship.duration_months} Month{internship.duration_months !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <StatusIcon s={internship.status} />
                  {internship.status || 'OPEN'}
                </span>
              </div>
            </div>

            <div style={{ padding: '28px 32px' }}>

              {/* Description */}
              {internship.description && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ margin: '0 0 10px', color: C.text, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <BookOpen size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Description
                  </h3>
                  <p style={{ margin: 0, color: C.muted, lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap' }}>{internship.description}</p>
                </div>
              )}

              {/* Requirements */}
              {internship.requirements && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ margin: '0 0 10px', color: C.text, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ListChecks size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Requirements
                  </h3>
                  <p style={{ margin: 0, color: C.muted, lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap' }}>{internship.requirements}</p>
                </div>
              )}

              {/* Responsibilities */}
              {internship.responsibilities && (
                <div style={{ marginBottom: 0 }}>
                  <h3 style={{ margin: '0 0 10px', color: C.text, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Briefcase size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Responsibilities
                  </h3>
                  <p style={{ margin: 0, color: C.muted, lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap' }}>{internship.responsibilities}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Stats Card */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: C.green }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Posting Statistics</div>
              </div>
              <div style={{ padding: 18 }}>
                {[
                  { icon: <Users size={16} />, label: 'Applications', value: internship.application_count ?? 0, color: '#2563EB' },
                  { icon: <Calendar size={16} />, label: 'Start Date', value: internship.start_date ? new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Flexible', color: C.green },
                  { icon: <Clock size={16} />, label: 'Duration', value: internship.duration_months ? `${internship.duration_months} Month${internship.duration_months !== 1 ? 's' : ''}` : 'N/A', color: '#f59e0b' },
                  { icon: <Building2 size={16} />, label: 'Type', value: internship.type || 'Full-time', color: C.muted },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13 }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      {item.label}
                    </div>
                    <span style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Quick Actions</div>
              {[
                { label: 'View Applications', icon: <Users size={15} />, onClick: () => navigate('/company/applications'), color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
                { label: 'Submit Monthly Report', icon: <FileCheck size={15} />, onClick: () => navigate('/company/report-submission'), color: C.green, bg: C.greenLight, border: C.greenBorder },
                { label: 'Messages', icon: <Users size={15} />, onClick: () => navigate('/company/messages'), color: '#8b5cf6', bg: '#F5F3FF', border: '#C4B5FD' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  style={{ width: '100%', padding: '10px 14px', marginBottom: 8, background: a.bg, color: a.color, border: `1px solid ${a.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div
          onClick={() => setDeleteModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.white, borderRadius: 16, padding: '32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <h2 style={{ margin: '0 0 8px', color: C.text }}>Delete Internship</h2>
            <p style={{ color: C.muted, marginBottom: 8 }}>Are you sure you want to delete <strong>{internship.title}</strong>?</p>
            <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 24 }}>⚠️ This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteModal(false)} style={{ padding: '10px 20px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipDetail;
