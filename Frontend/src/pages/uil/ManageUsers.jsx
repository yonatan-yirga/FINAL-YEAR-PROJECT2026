/**
 * ManageUsers
 * UIL: view and search all approved users across all roles.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import uilService from '../../services/uilService';
import { 
  Users, GraduationCap, Building2, UserCheck, Building, 
  Search, User, Clock, Trash2, Plus, MapPin, Phone, Mail
} from 'lucide-react';

const ROLES = [
  { key: '',                label: 'All Users',    icon: Users },
  { key: 'STUDENT',         label: 'Students',     icon: GraduationCap },
  { key: 'COMPANY',         label: 'Companies',    icon: Building2 },
  { key: 'ADVISOR',         label: 'Advisors',     icon: UserCheck },
  { key: 'DEPARTMENT_HEAD', label: 'Dept Heads',   icon: Building },
  { key: 'DEPARTMENTS',     label: 'Departments',  icon: Building },
];

const ROLE_COLORS = {
  STUDENT:         { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  COMPANY:         { bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  ADVISOR:         { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  DEPARTMENT_HEAD: { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
};

const C = {
  navy: '#0F2D5E', gold: '#C9A84C', bg: '#F0F4FA',
  white: '#FFFFFF', border: '#E8EDF4', text: '#1A202C', muted: '#5A6A7E',
};

const ManageUsers = () => {
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeRole,  setActiveRole]  = useState('');
  const [items,       setItems]       = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,        setPage]        = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [ordering,    setOrdering]    = useState('-created_at');
  const PAGE_SIZE = 20;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    
    if (activeRole === 'DEPARTMENTS') {
      const res = await uilService.getDepartments();
      if (res.success) {
        setItems(res.data.results || res.data);
        setTotalCount((res.data.results || res.data).length);
      } else {
        setError(res.error);
      }
    } else {
      const res = await uilService.getUsers(activeRole || null, search, page, ordering);
      if (res.success) {
        const data = res.data;
        setItems(data.results || data);
        setTotalCount(data.count !== undefined ? data.count : (data.results ? data.count : data.length));
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  }, [activeRole, search, page, ordering]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    const res = await uilService.deleteDepartment(id);
    if (res.success) fetchItems();
    else alert(res.error);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Manage Users & System" subtitle="Users, roles, and department configuration" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            {ROLES.map(({ key, label, icon: IconComponent }) => (
              <button key={key}
                onClick={() => { setActiveRole(key); setPage(1); setItems([]); }}
                style={{
                  padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: activeRole === key ? C.navy : C.white,
                  color:      activeRole === key ? C.white : C.text,
                  boxShadow:  activeRole === key
                    ? '0 4px 12px rgba(15,45,94,0.2)'
                    : '0 1px 4px rgba(15,45,94,0.08)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                <IconComponent size={16} />
                {label}
              </button>
            ))}
          </div>

          {activeRole === 'DEPARTMENTS' && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: C.gold, color: C.white, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(201,168,76,0.25)'
              }}
            >
              <Plus size={16} />
              Add Department
            </button>
          )}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)', color: C.muted,
            }}>
              <Search size={16} />
            </span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={activeRole === 'DEPARTMENTS' ? "Search departments..." : "Search by name, email, or ID…"}
              style={{
                width: '100%', padding: '11px 16px 11px 40px', borderRadius: 10,
                border: `1px solid ${C.border}`, fontSize: 14, background: C.white,
                color: C.text, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          
          {activeRole !== 'DEPARTMENTS' && (
            <select
              value={ordering}
              onChange={e => { setOrdering(e.target.value); setPage(1); }}
              style={{
                padding: '0 12px', borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.white, color: C.text, fontSize: 13, fontWeight: 600,
                outline: 'none', cursor: 'pointer', minWidth: 140
              }}
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="-email">Email (A-Z)</option>
              <option value="email">Email (Z-A)</option>
            </select>
          )}
        </div>

        {/* Summary */}
        {!loading && !error && (
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
            Showing {items.length} of {totalCount} {activeRole === 'DEPARTMENTS' ? 'department' : 'user'}{totalCount !== 1 ? 's' : ''}
            {activeRole ? ` · ${ROLES.find(r => r.key === activeRole)?.label}` : ''}
            {search ? ` · "${search}"` : ''}
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: 10, padding: '14px 18px', color: '#B91C1C', marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Table / List */}
        <div style={{
          background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
          boxShadow: '0 2px 12px rgba(15,45,94,0.07)', overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{
            display: 'grid', 
            gridTemplateColumns: activeRole === 'DEPARTMENTS' 
              ? '1.5fr 1.2fr 1.5fr 1fr 0.5fr'
              : '2fr 1.2fr 1fr 2fr 1fr',
            background: '#F8FAFC', borderBottom: `1px solid ${C.border}`,
          }}>
            {(activeRole === 'DEPARTMENTS' 
              ? ['Department Name', 'Head Name', 'Contact Info', 'Created', 'Action']
              : ['Name / Email', 'Role', 'Department', 'Profile Info', 'Joined']
            ).map(h => (
              <div key={h} style={{
                padding: '12px 16px', fontSize: 11, fontWeight: 700,
                color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7,
              }}>
                {h}
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                <Clock size={32} />
              </div>
              Loading...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                {activeRole === 'DEPARTMENTS' ? <Building size={40} /> : <User size={40} />}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No {activeRole === 'DEPARTMENTS' ? 'departments' : 'users'} found</div>
              <div style={{ fontSize: 13 }}>
                {search ? `No results for "${search}"` : `No ${activeRole === 'DEPARTMENTS' ? 'departments' : 'approved users'} available.`}
              </div>
            </div>
          )}

          {!loading && items.map((item, idx) => {
            if (activeRole === 'DEPARTMENTS') {
              return (
                <div key={item.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1fr 0.5fr',
                    borderBottom: idx < items.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{item.name}</div>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: 13, color: C.text, display: 'flex', alignItems: 'center' }}>
                    {item.head_name || '—'}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Mail size={12} color={C.muted} /> {item.email}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={12} color={C.muted} /> {item.phone_number}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>
                    {fmt(item.created_at)}
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleDeleteDept(item.id)}
                      style={{ 
                        background: 'none', border: 'none', color: '#EF4444', 
                        cursor: 'pointer', padding: 8, borderRadius: 8,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            }

            const rc = ROLE_COLORS[item.role] || ROLE_COLORS.STUDENT;
            return (
              <div key={item.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr 1fr',
                  borderBottom: idx < items.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>
                    {item.display_name || item.email}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{item.email}</div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                    borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {item.role?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ padding: '14px 16px', fontSize: 13, color: C.text, display: 'flex', alignItems: 'center' }}>
                  {item.department_name || '—'}
                </div>
                <div style={{ padding: '14px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>
                  {item.profile_info || '—'}
                </div>
                <div style={{ padding: '14px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>
                  {fmt(item.created_at)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && activeRole !== 'DEPARTMENTS' && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: 12, marginTop: 24,
          }}>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              style={{
                padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.white, color: page === 1 ? C.muted : C.navy,
                fontWeight: 700, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}>
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: C.muted }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              style={{
                padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.white, color: page === totalPages ? C.muted : C.navy,
                fontWeight: 700, fontSize: 13,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddDepartmentModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { setShowAddModal(false); fetchItems(); }} 
        />
      )}
    </div>
  );
};

const AddDepartmentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '', head_name: '', email: '', phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await uilService.createDepartment(formData);
    if (res.success) onSuccess();
    else setError(res.error);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,45,94,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: C.white, width: '100%', maxWidth: 450, borderRadius: 20,
        padding: 32, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Add New Department</h2>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Create a department that students can select during registration.</p>
        
        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Department Name</label>
            <input required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Computer Science"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Department Head Name</label>
            <input required
              value={formData.head_name}
              onChange={e => setFormData({...formData, head_name: e.target.value})}
              placeholder="Full name of the head"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Department Email</label>
            <input required type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="dept@university.edu"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>Phone Number</label>
            <input required
              value={formData.phone_number}
              onChange={e => setFormData({...formData, phone_number: e.target.value})}
              placeholder="+251..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '12px', borderRadius: 12, background: C.navy, color: C.white, border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageUsers;