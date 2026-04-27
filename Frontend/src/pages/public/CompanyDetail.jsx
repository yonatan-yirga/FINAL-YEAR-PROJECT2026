/**
 * Public Company Detail Page
 * Shows company information and available internships
 * Allows unauthenticated users to view and prompts registration for applying
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Mail, Phone, Globe, Users, Briefcase,
  Calendar, Clock, ArrowLeft, CheckCircle, AlertCircle, Star,
  TrendingUp, Award, Target
} from 'lucide-react';
import publicService from '../../services/publicService';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { id } = useParams(); // This is actually the company name (URL encoded)
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Decode company name from URL
      const companyName = decodeURIComponent(id);
      
      console.log('Fetching company details for:', companyName);
      
      // Fetch real company data
      const result = await publicService.getPublicCompanyByName(companyName);
      
      console.log('Company fetch result:', result);
      
      if (result.success) {
        setCompany(result.data.company);
        setInternships(result.data.internships);
      } else {
        setError(result.error || 'Failed to load company details');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching company details:', err);
      setError('Failed to load company details');
      setLoading(false);
    }
  };

  const handleApply = (internshipId) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Not logged in - redirect to register with return URL
      navigate(`/register?returnTo=/student/internships/${internshipId}&action=apply`);
    } else {
      // Logged in - navigate to internship detail page
      navigate(`/student/internships/${internshipId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="company-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading company details...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-detail-error">
        <AlertCircle size={48} />
        <h2>Company Not Found</h2>
        <p>{error || 'The company you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      {/* Header */}
      <div className="company-detail-header">
        <div className="company-detail-container">
          <button onClick={() => navigate('/')} className="btn-back-header">
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>

      {/* Company Info Section */}
      <section className="company-info-section">
        <div className="company-detail-container">
          <div className="company-info-card">
            <div className="company-header">
              <div className="company-logo-large">{company.logo}</div>
              <div className="company-header-content">
                <h1>{company.name}</h1>
                <div className="company-meta">
                  <div className="meta-item">
                    <MapPin size={18} />
                    <span>{company.location}</span>
                  </div>
                  <div className="meta-item">
                    <Building2 size={18} />
                    <span>{company.industry}</span>
                  </div>
                  <div className="meta-item">
                    <Star size={18} fill="#C9A84C" color="#C9A84C" />
                    <span>{company.rating} Rating</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="company-description">
              <h3>About the Company</h3>
              <p>{company.description}</p>
            </div>

            <div className="company-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">Founded {company.founded}</div>
                  <div className="stat-label">Established</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{company.employees}</div>
                  <div className="stat-label">Employees</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Briefcase size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{company.active_internships}</div>
                  <div className="stat-label">Active Internships</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{company.success_rate}%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="company-contact">
              <h3>Contact Information</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <MapPin size={20} />
                  <div>
                    <div className="contact-label">Address</div>
                    <div className="contact-value">{company.address}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail size={20} />
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-value">{company.email}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone size={20} />
                  <div>
                    <div className="contact-label">Phone</div>
                    <div className="contact-value">{company.phone}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <Globe size={20} />
                  <div>
                    <div className="contact-label">Website</div>
                    <div className="contact-value">{company.website}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Internships Section */}
      <section className="internships-section">
        <div className="company-detail-container">
          <div className="section-header">
            <h2>Available Internship Opportunities</h2>
            <p>{internships.length} open positions</p>
          </div>

          {internships.length === 0 ? (
            <div className="no-internships">
              <Briefcase size={48} />
              <h3>No Open Positions</h3>
              <p>This company currently has no open internship positions. Check back later!</p>
            </div>
          ) : (
            <div className="internships-grid">
              {internships.map(internship => (
                <div key={internship.id} className="internship-card">
                  <div className="internship-header">
                    <h3>{internship.title}</h3>
                    <span className={`status-badge status-${internship.status.toLowerCase()}`}>
                      {internship.status}
                    </span>
                  </div>

                  <p className="internship-description">{internship.description || 'No description available'}</p>

                  <div className="internship-details">
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{internship.location || 'Location not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{internship.duration_months || 'N/A'} months</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Starts {internship.start_date ? formatDate(internship.start_date) : 'TBD'}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={16} />
                      <span>{internship.available_slots || 0} of {internship.max_applicants || 0} slots available</span>
                    </div>
                  </div>

                  <div className="internship-skills">
                    <strong>Required Skills:</strong>
                    <div className="skills-tags">
                      {internship.required_skills && internship.required_skills.split(',').map((skill, index) => (
                        <span key={index} className="skill-tag">{skill.trim()}</span>
                      ))}
                      {!internship.required_skills && (
                        <span className="skill-tag">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div className="internship-deadline">
                    <AlertCircle size={16} />
                    <span>Application deadline: {internship.application_deadline ? formatDate(internship.application_deadline) : 'Not specified'}</span>
                  </div>

                  <button 
                    onClick={() => handleApply(internship.id)}
                    className="btn-apply"
                    disabled={internship.available_slots === 0}
                  >
                    {internship.available_slots === 0 ? 'No Slots Available' : 'Apply Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Join Section */}
      <section className="why-join-section">
        <div className="company-detail-container">
          <h2>Why Join {company.name}?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Target size={32} />
              </div>
              <h3>Real-World Experience</h3>
              <p>Work on actual projects that impact real users and businesses</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Users size={32} />
              </div>
              <h3>Expert Mentorship</h3>
              <p>Learn from experienced professionals in the industry</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Award size={32} />
              </div>
              <h3>Career Growth</h3>
              <p>Build skills and connections that advance your career</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Verified Certificate</h3>
              <p>Receive an official certificate upon successful completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="company-detail-container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Create an account to apply for internship opportunities</p>
          <button onClick={() => navigate('/register')} className="btn-cta">
            Create Account Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default CompanyDetail;
