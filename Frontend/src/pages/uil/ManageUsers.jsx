/**
 * ManageUsers - PREMIUM REDESIGN
 * UIL: view and search all approved users across all roles with modern, premium styling
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/common/Header';
import uilService from '../../services/uilService';
import { 
  Users, GraduationCap, Building2, UserCheck, Building, 
  Search, User, Clock, Trash2, Plus, MapPin, Phone, Mail,
  Filter, Calendar, Loader2, Inbox, ChevronLeft, ChevronRight,
  Edit, Eye, X
} from 'lucide-react';
import './ManageUsersPremium.css';

const ROLES = [
  { key: '',                label: 'All Users',    icon: Users },
  { key: 'STUDENT',         label: 'Students',     icon: GraduationCap },
  { key: 'COMPANY',         label: 'Companies',    icon: Building2 },
  { key: 'ADVISOR',         label: 'Advisors',     icon: UserCheck },
  { key: 'DEPARTMENT_HEAD', label: 'Dept Heads',   icon: Building },
  { key: 'DEPARTMENTS',     label: 'Departments',  icon: Building },
];

const ManageUsers = () => {
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeRole,  setActiveRole]  = useState('');
  const [items,       setItems]       = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page,        setPage]        = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [ordering,    setOrdering]    = useState('-created_at');
  const [departments, setDepartments] = useState([]);
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

  useEffect(() => {
    const fetchDepts = async () => {
      const res = await uilService.getDepartments();
      if (res.success) setDepartments(res.data.results || res.data);
    };
    fetchDepts();
  }, []);

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

  const handleEditDept = (dept) => {
    setSelectedItem(dept);
    setShowEditDeptModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.display_name || user.email}?`)) return;
    const res = await uilService.deleteUser(user.id);
    if (res.success) {
      fetchItems();
    } else {
      alert(res.error || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedItem(user);
    setShowEditModal(true);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const getRoleBadgeClass = (role) => {
    const roleMap = {
      'STUDENT': 'role-student',
      'COMPANY': 'role-company',
      'ADVISOR': 'role-advisor',
      'DEPARTMENT_HEAD': 'role-department-head',
    };
    return roleMap[role] || 'role-student';
  };

  return (
    <div className="manage-users-premium">
      <Header 
        title="Manage Users & System" 
        subtitle="Comprehensive user management, role administration, and department configuration" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-container"
      >
        {/* Role tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-controls"
        >
          <div className="premium-tabs">
            {ROLES.map(({ key, label, icon: IconComponent }) => (
              <button 
                key={key}
                onClick={() => { setActiveRole(key); setPage(1); setItems([]); }}
                className={`premium-tab ${activeRole === key ? 'active' : ''}`}
              >
                <IconComponent size={18} />
                {label}
                <span className="tab-badge">
                  {key === '' ? totalCount : items.filter(i => 
                    key === 'DEPARTMENTS' ? true : i.role === key
                  ).length}
                </span>
              </button>
            ))}
          </div>

          <div className="premium-actions-row">
            {activeRole === 'DEPARTMENTS' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="premium-btn btn-add-dept"
              >
                <Plus size={18} />
                Add Department
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedItem(null); setShowAddModal(true); }}
                className="premium-btn btn-add-user"
              >
                <Plus size={18} />
                Create User
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Search & Sort */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-search-bar"
        >
          <div className="premium-search">
            <Search size={20} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={activeRole === 'DEPARTMENTS' ? "Search departments..." : "Search by name, email, or ID…"}
            />
          </div>
          
          {activeRole !== 'DEPARTMENTS' && (
            <div className="premium-sort">
              <Filter size={18} />
              <select
                value={ordering}
                onChange={e => { setOrdering(e.target.value); setPage(1); }}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-email">Email (A-Z)</option>
                <option value="email">Email (Z-A)</option>
              </select>
            </div>
          )}
        </motion.div>

        {/* Summary */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="premium-summary"
          >
            Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> {activeRole === 'DEPARTMENTS' ? 'department' : 'user'}{totalCount !== 1 ? 's' : ''}
            {activeRole ? ` · ${ROLES.find(r => r.key === activeRole)?.label}` : ''}
            {search ? ` · "${search}"` : ''}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-error"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-content"
        >
          {loading ? (
            <div className="premium-loading">
              <div className="loader-glow"></div>
              <p>Loading system registry...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="premium-empty">
              {activeRole === 'DEPARTMENTS' ? <Building size={80} strokeWidth={1} /> : <Inbox size={80} strokeWidth={1} />}
              <h3>No {activeRole === 'DEPARTMENTS' ? 'Departments' : 'Users'} Found</h3>
              <p>
                {search 
                  ? `No results for "${search}"` 
                  : `No ${activeRole === 'DEPARTMENTS' ? 'departments' : 'approved users'} available.`}
              </p>
            </div>
          ) : activeRole === 'DEPARTMENTS' ? (
            <div className="users-table">
              <div className="table-header">
                <div>Department Name</div>
                <div>Head Name</div>
                <div>Email</div>
                <div>Phone Number</div>
                <div>Created</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>
              
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                    className="table-row dept-row"
                  >
                    <div className="dept-name-cell">
                      <div className="dept-icon-small">
                        <Building size={20} />
                      </div>
                      <div className="dept-name-text">{item.name}</div>
                    </div>
                    <div className="dept-head-cell">{item.head_name || '—'}</div>
                    <div className="dept-email-cell">
                      <Mail size={14} style={{ opacity: 0.5, marginRight: '6px' }} />
                      {item.email}
                    </div>
                    <div className="dept-phone-cell">
                      <Phone size={14} style={{ opacity: 0.5, marginRight: '6px' }} />
                      {item.phone_number}
                    </div>
                    <div className="dept-date-cell">{fmt(item.created_at)}</div>
                    <div className="dept-action-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEditDept(item)}
                        className="dept-action-btn-small btn-edit"
                        title="Edit Department"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDept(item.id)}
                        className="dept-action-btn-small btn-delete"
                        title="Delete Department"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header user-header">
                <div>Name / Email</div>
                <div>Role</div>
                <div>Department</div>
                <div>Profile Info</div>
                <div>Joined</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>
              
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                    className="table-row"
                  >
                    <div className="user-info">
                      <div className="user-avatar">
                        {(item.display_name || item.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{item.display_name || item.email}</div>
                        <div className="user-email">{item.email}</div>
                      </div>
                    </div>
                    <div>
                      <span className={`role-badge ${getRoleBadgeClass(item.role)}`}>
                        {item.role?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="user-department">{item.department_name || '—'}</div>
                    <div className="user-profile">{item.profile_info || '—'}</div>
                    <div className="user-date">{fmt(item.created_at)}</div>
                    <div className="user-action-cell" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleEditUser(item)}
                        className="dept-action-btn-small btn-edit"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(item)}
                        className="dept-action-btn-small btn-delete"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && activeRole !== 'DEPARTMENTS' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="premium-pagination"
          >
            <button 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <span className="pagination-info">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          activeRole === 'DEPARTMENTS' ? (
            <DepartmentModal 
              onClose={() => setShowAddModal(false)} 
              onSuccess={() => { setShowAddModal(false); fetchItems(); }} 
            />
          ) : (
            <UserModal 
              departments={departments}
              onClose={() => setShowAddModal(false)} 
              onSuccess={() => { setShowAddModal(false); fetchItems(); }} 
            />
          )
        )}
        
        {showEditDeptModal && selectedItem && (
          <DepartmentModal 
            dept={selectedItem}
            onClose={() => setShowEditDeptModal(false)} 
            onSuccess={() => { setShowEditDeptModal(false); fetchItems(); }} 
          />
        )}

        {showEditModal && selectedItem && (
          <UserModal 
            user={selectedItem}
            departments={departments}
            onClose={() => setShowEditModal(false)} 
            onSuccess={() => { setShowEditModal(false); fetchItems(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DepartmentModal = ({ dept, onClose, onSuccess }) => {
  const isEdit = !!dept;
  const [formData, setFormData] = useState({
    name: dept?.name || '', 
    head_name: dept?.head_name || '', 
    email: dept?.email || '', 
    phone_number: dept?.phone_number || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = isEdit 
      ? await uilService.updateDepartment(dept.id, formData)
      : await uilService.createDepartment(formData);
      
    if (res.success) onSuccess();
    else setError(res.error);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="premium-modal-overlay"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="premium-modal"
      >
        <div className="modal-header">
          <h3>{isEdit ? 'Update Department Registry' : 'Initialize New Department'}</h3>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="premium-form">
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-grid">
            <div className="form-group">
              <label>Department Name</label>
              <div className="input-with-icon">
                <Building2 size={18} />
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Department Head</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  required
                  value={formData.head_name}
                  onChange={e => setFormData({...formData, head_name: e.target.value})}
                  placeholder="Full name of the head"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input 
                  required 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="dept@university.edu"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input 
                  required
                  value={formData.phone_number}
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+251..."
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? <Loader2 className="animate-spin" /> : (isEdit ? 'Update Registry' : 'Create Department')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const UserModal = ({ user, departments, onClose, onSuccess }) => {
  const isEdit = !!user;
  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || user?.display_name || '',
    role: user?.role || 'STUDENT',
    department: user?.department || '',
    password: '', 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = { ...formData };
    if (isEdit && !payload.password) delete payload.password;
    if (!isEdit && !payload.password) {
      setError('Password is required for new users');
      setLoading(false);
      return;
    }

    const res = isEdit 
      ? await uilService.updateUser(user.id, payload)
      : await uilService.createUser(payload);
      
    if (res.success) onSuccess();
    else setError(res.error);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="premium-modal-overlay"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="premium-modal"
      >
        <div className="modal-header">
          <h3>{isEdit ? 'Update User Registry' : 'Create System User'}</h3>
          <button onClick={onClose} className="modal-close"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="premium-form">
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  disabled={isEdit}
                />
              </div>
            </div>

            <div className="form-group">
              <label>System Role</label>
              <div className="input-with-icon">
                <Building size={18} />
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  {ROLES.filter(r => r.key && r.key !== 'DEPARTMENTS').map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Department (Optional)</label>
              <div className="input-with-icon">
                <Building2 size={18} />
                <select 
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">No Department / Central UIL</option>
                  {(departments || []).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>{isEdit ? 'New Password (leave blank to keep current)' : 'Security Password'}</label>
              <div className="input-with-icon">
                <Clock size={18} />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={isEdit ? "Enter new password" : "Minimum 8 characters"}
                  required={!isEdit}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isEdit ? 'Update Entry' : 'Create User')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ManageUsers;