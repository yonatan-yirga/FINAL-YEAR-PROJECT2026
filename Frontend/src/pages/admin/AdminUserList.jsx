import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import apiService from '../../services/api';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'STUDENT' });
  const [editData, setEditData] = useState({ role: '', is_approved: false, password: '' });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/auth/admin/users/');
      setUsers(data);
    } catch (err) {
      setError('Network error loading users');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiService.delete(`/auth/admin/users/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiService.post('/auth/admin/users/', newUser);
      setShowAddModal(false);
      setNewUser({ email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
    setSubmitting(false);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditData({ role: user.role, is_approved: user.is_approved, password: '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { role: editData.role, is_approved: editData.is_approved };
      if (editData.password) payload.password = editData.password;
      
      await apiService.patch(`/auth/admin/users/${editingUser.id}/`, payload);
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
    setSubmitting(false);
  };

  const G = `
    .user-list-root { background: #EEF2F8; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .user-list-body { max-width: 1200px; margin: 0 auto; padding: 32px; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .add-btn { background: #0F2D5E; color: #fff; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .add-btn:hover { background: #0A2248; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 16px; text-align: left; border-bottom: 1px solid #DDE3EE; }
    .table th { background: #F8FAFC; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #637084; letter-spacing: 0.05em; }
    .table tr:last-child td { border-bottom: none; }
    .del-btn { background: #FEE2E2; color: #B91C1C; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; margin-left: 8px; }
    .del-btn:hover { background: #FCA5A5; }
    .edit-btn { background: #DBEAFE; color: #1D4ED8; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; }
    .edit-btn:hover { background: #BFDBFE; }
    .role-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: #fff; padding: 32px; border-radius: 16px; width: 100%; max-width: 400px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #DDE3EE; border-radius: 8px; outline: none; }
    .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
    .cancel-btn { flex: 1; padding: 10px; border: 1px solid #DDE3EE; background: #fff; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .submit-btn { flex: 1; padding: 10px; background: #0F2D5E; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
  `;

  return (
    <div className="user-list-root">
      <style>{G}</style>
      <Header title="User Directory" subtitle="System-wide user administration" />
      
      <div className="user-list-body">
        <div className="header-row">
          <h2 style={{ fontSize: '24px', color: '#111827' }}>All System Users</h2>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add User</button>
        </div>

        {error && <div style={{ padding: '16px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Display Name</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#637084' }}>No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '500', color: '#111827' }}>{u.email}</td>
                    <td>
                      <span className="role-badge" style={{ 
                        background: u.role === 'ADMIN' ? '#DBEAFE' : '#EEF2F8',
                        color: u.role === 'ADMIN' ? '#1D4ED8' : '#637084'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: '#637084' }}>{u.display_name || '—'}</td>
                    <td>
                      <span style={{ color: u.is_approved ? '#15803D' : '#B45309', fontWeight: '600', fontSize: '13px' }}>
                        {u.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#637084' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="edit-btn" onClick={() => openEditModal(u)}>Edit</button>
                      <button className="del-btn" onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 24px 0', color: '#111827' }}>Add New User</h3>
            {error && <div style={{ color: '#B91C1C', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  required 
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADVISOR">Advisor</option>
                  <option value="COMPANY">Company</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="UIL">UIL</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 24px 0', color: '#111827' }}>Edit User</h3>
            {error && <div style={{ color: '#B91C1C', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={editingUser?.email} disabled style={{ background: '#F8FAFC' }} />
              </div>
              <div className="form-group">
                <label>Reset Password (leave blank to keep current)</label>
                <input 
                  type="password" 
                  value={editData.password} 
                  onChange={e => setEditData({...editData, password: e.target.value})} 
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={editData.role} 
                  onChange={e => setEditData({...editData, role: e.target.value})}
                >
                  <option value="STUDENT">Student</option>
                  <option value="ADVISOR">Advisor</option>
                  <option value="COMPANY">Company</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="UIL">UIL</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={editData.is_approved}
                    onChange={e => setEditData({...editData, is_approved: e.target.checked})}
                    style={{ width: 'auto' }}
                  />
                  User is Approved
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
