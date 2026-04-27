/**
 * Landing Page - DMU Internship Portal
 * Modern, professional landing page inspired by Upwork
 * Features: Hero, Organizations, About sections
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, TrendingUp, Award, 
  CheckCircle, ArrowRight, Briefcase, Target, Globe,
  BookOpen, Lightbulb, Shield, Star, MapPin, Mail, Phone
} from 'lucide-react';
import publicService from '../../services/publicService';
import dmuLogo from '../../assets/logodmu.jpg';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    students: 500,
    companies: 50,
    internships: 200,
    success_rate: 95
  });

  useEffect(() => {
    // Fetch companies for Organizations section
    fetchCompanies();
    // Fetch stats
    fetchStats();
  }, []);

  const fetchCompanies = async () => {
    const result = await publicService.getPublicCompanies();
    if (result.success) {
      setCompanies(result.data);
    } else {
      console.error('Failed to fetch companies:', result.error);
      // Keep empty array if fetch fails
      setCompanies([]);
    }
  };

  const fetchStats = async () => {
    const result = await publicService.getPublicStats();
    if (result.success) {
      setStats(result.data);
    } else {
      console.error('Failed to fetch stats:', result.error);
      // Keep default stats if fetch fails
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <img src={dmuLogo} alt="DMU Logo" className="landing-logo-img" />
            <span>DMU Internship Portal</span>
          </div>
          
          <div className="landing-nav-links">
            <button 
              onClick={() => scrollToSection('home')}
              className={activeSection === 'home' ? 'active' : ''}
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('organizations')}
              className={activeSection === 'organizations' ? 'active' : ''}
            >
              Organizations
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className={activeSection === 'about' ? 'active' : ''}
            >
              About
            </button>
          </div>

          <div className="landing-nav-actions">
            <button onClick={() => navigate('/login')} className="btn-login">
              Log In
            </button>
            <button onClick={() => navigate('/register')} className="btn-signup">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="landing-hero">
        <div className="landing-hero-container">
          <div className="hero-content-wrapper">
            <div className="hero-badge">
              <span className="badge-icon">🎓</span>
              <span className="badge-text">Debre Markos University</span>
            </div>
            
            <h1 className="landing-hero-title">
              Your Gateway to<br />
              <span className="highlight">Professional Success</span>
            </h1>
            
            <p className="landing-hero-subtitle">
              Connect with leading companies, gain real-world experience, and build 
              the career you've always dreamed of through our comprehensive internship platform.
            </p>
            
            <div className="landing-hero-actions">
              <button onClick={() => navigate('/register')} className="btn-primary-large">
                <span>Get Started</span>
                <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary-large">
                <span>Sign In</span>
              </button>
            </div>

            <div className="hero-trust-badge">
              <CheckCircle size={18} />
              <span>Trusted by students and companies across Ethiopia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">
              A complete platform designed for your internship journey
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Briefcase size={28} />
              </div>
              <h3>Quality Opportunities</h3>
              <p>Access verified internships from leading companies across various industries</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users size={28} />
              </div>
              <h3>Expert Support</h3>
              <p>Get guidance from dedicated advisors throughout your entire journey</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Award size={28} />
              </div>
              <h3>Verified Certificates</h3>
              <p>Earn industry-recognized certificates upon successful completion</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <TrendingUp size={28} />
              </div>
              <h3>Career Growth</h3>
              <p>Build valuable skills and experience that employers actively seek</p>
            </div>
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section id="organizations" className="landing-organizations">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Partner Organizations</h2>
            <p className="section-subtitle">
              Join students working with leading companies
            </p>
          </div>

          {companies.length > 0 ? (
            <div className="organizations-grid">
              {companies.map(company => (
                <div 
                  key={company.id} 
                  className="organization-card"
                  onClick={() => navigate(`/company/${encodeURIComponent(company.name)}`)}
                >
                  <div className="org-header">
                    <div className="org-logo">{company.logo}</div>
                    <div className="org-rating">
                      <Star size={14} fill="#14a800" color="#14a800" />
                      <span>{company.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="org-name">{company.name}</h3>
                  <p className="org-description">{company.description}</p>
                  
                  <div className="org-footer">
                    <div className="org-meta">
                      <MapPin size={14} />
                      <span>{company.location}</span>
                    </div>
                    <div className="org-meta">
                      <Briefcase size={14} />
                      <span>{company.internships} positions</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Building2 size={48} />
              <p>Partner organizations will be displayed here</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">About the Platform</h2>
            <p className="section-subtitle">
              Empowering students through meaningful internship experiences
            </p>
          </div>
          
          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon-wrapper">
                <Target size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>
                Bridging the gap between academic learning and professional practice 
                by connecting DMU students with quality internship opportunities that 
                prepare them for successful careers.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper">
                <Lightbulb size={32} />
              </div>
              <h3>Why Internships Matter</h3>
              <ul className="about-list">
                <li><CheckCircle size={16} /> Gain real-world work experience</li>
                <li><CheckCircle size={16} /> Build professional networks</li>
                <li><CheckCircle size={16} /> Develop industry skills</li>
                <li><CheckCircle size={16} /> Enhance career prospects</li>
              </ul>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper">
                <Shield size={32} />
              </div>
              <h3>Platform Features</h3>
              <ul className="about-list">
                <li><CheckCircle size={16} /> Streamlined application process</li>
                <li><CheckCircle size={16} /> Real-time advisor support</li>
                <li><CheckCircle size={16} /> Comprehensive evaluation system</li>
                <li><CheckCircle size={16} /> Secure certificate verification</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img src={dmuLogo} alt="DMU Logo" className="footer-logo-img" />
                <span>DMU Internship Portal</span>
              </div>
              <p>Connecting students with opportunities for professional growth and development.</p>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#organizations">Organizations</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="/verify">Verify Certificate</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>For Students</h4>
              <ul>
                <li><a href="/register">Register</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="#organizations">Browse Companies</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact</h4>
              <ul>
                <li>Debre Markos University</li>
                <li>Debre Markos, Ethiopia</li>
                <li>info@dmu.edu.et</li>
                <li>+251-58-771-1144</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Debre Markos University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
