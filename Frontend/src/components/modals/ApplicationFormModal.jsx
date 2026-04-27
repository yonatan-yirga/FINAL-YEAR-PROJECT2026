/**
 * ApplicationFormModal component
 * Premium glassmorphic application form for students
 * Pre-fills from student profile, supports certificate upload
 */
import React, { useState, useEffect } from 'react';
import './ApplicationFormModal.css';

const ApplicationFormModal = ({ isOpen, onClose, onSubmit, internship, userProfile, applying }) => {
  const [formData, setFormData] = useState({
    about_me: '',
    experience: '',
    education_level: '',
    projects: '',
    certificate: null,
    cover_letter: ''
  });

  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Pre-fill from userProfile when modal opens
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData(prev => ({
        ...prev,
        about_me: userProfile.about || '',
        experience: userProfile.experience || '',
        education_level: userProfile.education || '',
      }));
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, certificate: file }));
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, certificate: file }));
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, certificate: null }));
    setFileName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <div className="app-modal-title">
            <h2>Apply for {internship?.title}</h2>
            <p>At {internship?.company_name} — Review and tailor your application</p>
          </div>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="app-modal-body">
            <div className="app-form-section">
              <h3><span>👤</span> About Me</h3>
              <div className="app-input-group">
                <label>Tell the company about yourself (Introduction)</label>
                <textarea
                  name="about_me"
                  className="app-textarea"
                  value={formData.about_me}
                  onChange={handleChange}
                  placeholder="Share a brief summary of who you are and what you're passionate about..."
                />
              </div>
            </div>

            <div className="app-form-section">
              <h3><span>💼</span> Relevant Experience</h3>
              <div className="app-input-group">
                <label>Past internships, volunteer work, or roles</label>
                <textarea
                  name="experience"
                  className="app-textarea"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Describe your relevant experience for this role..."
                />
              </div>
            </div>

            <div className="app-form-section">
              <h3><span>🎓</span> Education & Level</h3>
              <div className="app-input-group">
                <label>Current Study Level</label>
                <input
                  type="text"
                  name="education_level"
                  className="app-input"
                  value={formData.education_level}
                  onChange={handleChange}
                  placeholder="e.g. 4th Year Bachelor Student, Master in CS..."
                />
              </div>
            </div>

            <div className="app-form-section">
              <h3><span>🚀</span> Projects</h3>
              <div className="app-input-group">
                <label>Highlight specific projects you've worked on</label>
                <textarea
                  name="projects"
                  className="app-textarea"
                  value={formData.projects}
                  onChange={handleChange}
                  placeholder="List keys projects, technologies used, and your contribution..."
                />
              </div>
            </div>

            <div className="app-form-section">
              <h3><span>📜</span> Certificate & Support Documents</h3>
              <div className="app-input-group">
                <label>Upload a relevant certificate or transcript (Optional)</label>
                {!fileName ? (
                  <div 
                    className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('cert-upload').click()}
                  >
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">Drag & drop or click to upload</span>
                    <span className="upload-hint">PDF or Images (Max 5MB)</span>
                    <input 
                      id="cert-upload"
                      type="file" 
                      hidden 
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                    />
                  </div>
                ) : (
                  <div className="selected-file-badge">
                    <div className="file-info">
                      <span>📄</span>
                      <span>{fileName}</span>
                    </div>
                    <button type="button" className="remove-file-btn" onClick={removeFile}>×</button>
                  </div>
                )}
              </div>
            </div>

            <div className="app-form-section">
              <h3><span>✉️</span> Additional Note</h3>
              <div className="app-input-group">
                <label>Cover Letter / Additional Notes (Optional)</label>
                <textarea
                  name="cover_letter"
                  className="app-textarea"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  placeholder="Anything else you'd like to share with the recruiter?"
                />
              </div>
            </div>
          </div>

          <div className="app-modal-footer">
            <button type="button" className="cancel-submit-btn" onClick={onClose} disabled={applying}>
              Cancel
            </button>
            <button type="submit" className="submit-application-btn" disabled={applying}>
              {applying ? (
                <>⏳ Submitting Application...</>
              ) : (
                <>🚀 Submit Application</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationFormModal;
