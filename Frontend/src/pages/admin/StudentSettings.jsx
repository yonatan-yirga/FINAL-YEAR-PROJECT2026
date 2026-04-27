/**
 * Admin Student Settings Page - Upwork-Inspired Design
 * Manage student account settings and permissions
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  User, Mail, Phone, MapPin, Building2, Lock, Shield,
  AlertTriangle, CheckCircle, ArrowLeft, Save, RefreshCw,
  Eye, Trash2, UserX, UserCheck
} from 'lucide-react';
import './StudentSettings.css';

const StudentSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    city: '',
    address: '',
    is_active: true,
  });

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await departmentService.getStudents();
      
      if (response.success) {
        const studentData = response.data.find(s => s.id === parseInt(id));
        if (studentData) {
          setStudent(studentData);
          setFormData({
            full_name: studentData.full_name || studentData.student_name || '',
            email: studentData.email || '',
            phone_number: studentData.phone_number || studentData.phone || '',
            city: studentData.city || '',
            address: studentData.address || '',
            is_active: studentData.is_active !== false,
          });
        } else {
          setError('Student not found');
        }
      } else {
        setError(response.error || 'Failed to load student details');
      }
    } catch (err) {
      setError('An error occurred while loading student details');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      is_active: !prev.is_active
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Student settings updated successfully!');
      setTimeout(() => {
        setSuccess('');
        navigate(`/admin/student/${id}`);
      }, 2000);
    } catch (err) {
      setError('Failed to update student settings');
      console.error('Error updating student:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Are you sure you want to reset this student\'s password? A temporary password will be sent to their email.')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password reset email sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete this student account? This action cannot be undone!')) {
      return;
    }

    const confirmText = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="ss-page">
        <Header title="Student Settings" subtitle="Loading..." />
        <div className="ss-content">
          <div className="ss-loading">
            <div className="ss-spinner" />
            <p>Loading student settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="ss-page">
        <Header title="Student Settings" subtitle="Error" />
        <div className="ss-content">
          <div className="ss-error">
            <AlertTriangle size={48} />
            <h3>{error || 'Student not found'}</h3>
            <button onClick={() => navigate('/admin/dashboard')} className="ss-back-btn">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <Header 
        title="Student Settings" 
        subtitle={`Managing settings for ${student?.full_name || student?.student_name}`}
      />

      <div className="ss-content">
        {/* Back Button */}
        <button onClick={() => navigate(`/admin/student/${id}`)} className="ss-back-button">
          <ArrowLeft size={16} />
          Back to Student Details
        </button>

        {/* Success Alert */}
        {success && (
          <div className="ss-alert ss-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="ss-alert ss-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="ss-grid">
          {/* Profile Settings */}
          <div className="ss-section">
            <div className="ss-section-header">
              <User size={20} />
              <div>
                <h3>Profile Information</h3>
                <p>Update student's personal information</p>
              </div>
            </div>

            <form onSubmit={handleSaveChanges} className="ss-form">
              <div className="ss-form-group">
                <label>
                  <User size={14} />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="ss-form-group">
                <label>
                  <Mail size={14} />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div className="ss-form-group">
                <label>
                  <Phone size={14} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="ss-form-group">
                <label>
                  <MapPin size={14} />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City name"
                />
              </div>

              <div className="ss-form-group">
                <label>
                  <Building2 size={14} />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  rows="3"
                />
              </div>

              <button type="submit" className="ss-save-btn" disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Account Settings */}
          <div className="ss-section">
            <div className="ss-section-header">
              <Shield size={20} />
              <div>
                <h3>Account Settings</h3>
                <p>Manage account status and security</p>
              </div>
            </div>

            <div className="ss-settings-list">
              {/* Account Status */}
              <div className="ss-setting-item">
                <div className="ss-setting-info">
                  <div className="ss-setting-icon">
                    {formData.is_active ? <UserCheck size={20} /> : <UserX size={20} />}
                  </div>
                  <div>
                    <h4>Account Status</h4>
                    <p>
                      {formData.is_active 
                        ? 'Account is active and can access the system' 
                        : 'Account is deactivated and cannot login'}
                    </p>
                  </div>
                </div>
                <label className="ss-toggle">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleToggleActive}
                  />
                  <span className="ss-toggle-slider"></span>
                </label>
              </div>

              {/* Reset Password */}
              <div className="ss-setting-item">
                <div className="ss-setting-info">
                  <div className="ss-setting-icon">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4>Reset Password</h4>
                    <p>Send a password reset email to the student</p>
                  </div>
                </div>
                <button onClick={handleResetPassword} className="ss-action-btn ss-action-primary">
                  <Lock size={14} />
                  Reset Password
                </button>
              </div>

              {/* View Activity */}
              <div className="ss-setting-item">
                <div className="ss-setting-info">
                  <div className="ss-setting-icon">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4>View Details</h4>
                    <p>View complete student profile and activity</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/admin/student/${id}`)} 
                  className="ss-action-btn ss-action-secondary"
                >
                  <Eye size={14} />
                  View Profile
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="ss-danger-zone">
              <div className="ss-danger-header">
                <AlertTriangle size={18} />
                <h4>Danger Zone</h4>
              </div>
              <p>Irreversible actions that permanently affect the student account</p>
              <button onClick={handleDeleteAccount} className="ss-delete-btn">
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
