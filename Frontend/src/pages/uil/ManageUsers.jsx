/**
 * ManageUsers
 * UIL: view and search all approved users across all roles.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import uilService from '../../services/uilService';
import { 
  Users, GraduationCap, Building2, UserCheck, Building, 
  Search, User, Clock 
} from 'lucide-react';

const ROLES = [
  { key: '',                label: 'All Users',  icon: Users },
  { key: 'STUDENT',         label: 'Students',   icon: GraduationCap },
  { key: 'COMPANY',         label: 'Companies',  icon: Building2 },
  { key: 'ADVISOR',         label: 'Advisors',   icon: UserCheck },
  { key: 'DEPARTMENT_HEAD', label: 'Dept Heads', icon: Building },
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
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeRole,  setActiveRole]  = useState('');
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,        setPage]        = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const PAGE_SIZE = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await uilService.getUsers(activeRole || null, search, page);
    if (res.success) {
      const data = res.data;
      setUsers(data.results || data);
      setTotalCount(data.count !== undefined ? data.count : (data.results ? data.count : data.length));
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [activeRole, search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Manage Users" subtitle="All approved users across the system" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {ROLES.map(({ key, label, icon: IconComponent }) => (
            <button key={key}
              onClick={() => { setActiveRole(key); setPage(1); }}
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

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)', color: C.muted,
          }}>
            <Search size={16} />
          </span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by email…"
            style={{
              width: '100%', padding: '11px 16px 11px 40px', borderRadius: 10,
              border: `1px solid ${C.border}`, fontSize: 14, background: C.white,
              color: C.text, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Summary */}
        {!loading && !error && (
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
            Showing {users.length} of {totalCount} user{totalCount !== 1 ? 's' : ''}
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

        {/* Table */}
        <div style={{
          background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
          boxShadow: '0 2px 12px rgba(15,45,94,0.07)', overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr 1fr',
            background: '#F8FAFC', borderBottom: `1px solid ${C.border}`,
          }}>
            {['Name / Email', 'Role', 'Department', 'Profile Info', 'Joined'].map(h => (
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
              Loading users…
            </div>
          )}

          {!loading && users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                <User size={40} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No users found</div>
              <div style={{ fontSize: 13 }}>
                {search ? `No results for "${search}"` : 'No approved users in this category.'}
              </div>
            </div>
          )}

          {!loading && users.map((user, idx) => {
            const rc = ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT;
            return (
              <div key={user.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2fr 1fr',
                  borderBottom: idx < users.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 2 }}>
                    {user.display_name || user.email}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{user.email}</div>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                    borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ padding: '14px 16px', fontSize: 13, color: C.text, display: 'flex', alignItems: 'center' }}>
                  {user.department_name || '—'}
                </div>
                <div style={{ padding: '14px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>
                  {user.profile_info || '—'}
                </div>
                <div style={{ padding: '14px 16px', fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>
                  {fmt(user.created_at)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
    </div>
  );
};

export default ManageUsers;