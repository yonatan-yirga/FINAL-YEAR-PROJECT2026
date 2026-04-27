/**
 * Add Advisor Page - Upwork-Inspired Design
 * Department Head can register new advisors
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  UserCheck, Mail, Phone, IdCard, ArrowLeft, Save, AlertTriangle,
  CheckCircle, RefreshCw, User, Building2
} from 'lucide-react';
import './AddAdvisor.css';

const AddAdvisor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    staff_id: '',
    max_students: 15,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone_number || !formData.staff_id) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await departmentService.addAdvisor(formData);

      if (response.success) {
        setSuccess(`Advisor ${formData.full_name} has been successfully registered!`);
        
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone_number: '',
          staff_id: '',
          max_students: 15,
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/department/advisors');
        }, 2000);
      } else {
        setError(response.error || 'Failed to register advisor');
      }
    } catch (err) {
      setError('An error occurred while registering advisor');
      console.error('Error registering advisor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aa-page">
      <Header 
        title="Register New Advisor" 
        subtitle="Add a new advisor to your department"
      />

      <div className="aa-content">
        {/* Back Button */}
        <button onClick={() => navigate('/department/advisors')} className="aa-back-button">
          <ArrowLeft size={16} />
          Back to Advisors
        </button>

        {/* Success Alert */}
        {success && (
          <div className="aa-alert aa-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="aa-alert aa-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="aa-container">
          {/* Info Card */}
          <div className="aa-info-card">
            <div className="aa-info-icon">
              <UserCheck size={24} />
            </div>
            <div className="aa-info-content">
              <h3>Advisor Registration</h3>
              <p>
                Register a new advisor who will supervise students during their internships. 
                The advisor will receive login credentials via email and can immediately start 
                supervising assigned students.
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="aa-form-card">
            <div className="aa-form-header">
              <User size={20} />
              <div>
                <h3>Advisor Information</h3>
                <p>Enter the advisor's details below</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="aa-form">
              <div className="aa-form-grid">
                {/* Full Name */}
                <div className="aa-form-group aa-form-group-full">
                  <label>
                    <User size={14} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div className="aa-form-group">
                  <label>
                    <Mail size={14} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="advisor@university.edu"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="aa-form-group">
                  <label>
                    <Phone size={14} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+251 912 345 678"
                    required
                  />
                </div>

                {/* Staff ID */}
                <div className="aa-form-group">
                  <label>
                    <IdCard size={14} />
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleInputChange}
                    placeholder="STAFF-2024-001"
                    required
                  />
                </div>

                {/* Max Students */}
                <div className="aa-form-group">
                  <label>
                    <Building2 size={14} />
                    Maximum Students
                  </label>
                  <input
                    type="number"
                    name="max_students"
                    value={formData.max_students}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    placeholder="15"
                  />
                  <span className="aa-form-hint">
                    Maximum number of students this advisor can supervise
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="aa-form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/department/advisors')}
                  className="aa-button aa-button-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aa-button aa-button-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Register Advisor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Card */}
          <div className="aa-help-card">
            <h4>What happens next?</h4>
            <ul>
              <li>
                <CheckCircle size={16} />
                <span>Advisor account is created with the provided information</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>Login credentials are sent to the advisor's email</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>Advisor can login and access their dashboard</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>You can assign students to this advisor</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdvisor;
