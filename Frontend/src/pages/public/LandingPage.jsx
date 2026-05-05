/**
 * Landing Page - DMU Internship Portal
 * Modern, professional landing page inspired by Upwork
 * Features: Hero, Organizations, About sections with animations
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, Users, TrendingUp, Award, 
  CheckCircle, ArrowRight, Briefcase, Target, 
  Lightbulb, Shield, Star, MapPin
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
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
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="badge-icon">🎓</span>
              <span className="badge-text">Debre Markos University</span>
            </motion.div>
            
            <motion.h1 
              className="landing-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Your Gateway to<br />
              <motion.span 
                className="highlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Professional Success
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="landing-hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Connect with leading companies, gain real-world experience, and build 
              the career you've always dreamed of through our comprehensive internship platform.
            </motion.p>
            
            <motion.div 
              className="landing-hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button 
                onClick={() => navigate('/register')} 
                className="btn-primary-large"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                onClick={() => navigate('/login')} 
                className="btn-secondary-large"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Sign In</span>
              </motion.button>
            </motion.div>

            <motion.div 
              className="hero-trust-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <CheckCircle size={18} />
              <span>Trusted by students and companies across Ethiopia</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">
              A complete platform designed for your internship journey
            </p>
          </motion.div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
              >
                <Briefcase size={28} />
              </motion.div>
              <h3>Quality Opportunities</h3>
              <p>Access verified internships from leading companies across various industries</p>
            </motion.div>

            <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
              >
                <Users size={28} />
              </motion.div>
              <h3>Expert Support</h3>
              <p>Get guidance from dedicated advisors throughout your entire journey</p>
            </motion.div>

            <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
              >
                <Award size={28} />
              </motion.div>
              <h3>Verified Certificates</h3>
              <p>Earn industry-recognized certificates upon successful completion</p>
            </motion.div>

            <motion.div className="feature-card" variants={fadeInUp} whileHover={{ y: -8, transition: { duration: 0.3 } }}>
              <motion.div 
                className="feature-icon-wrapper"
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
              >
                <TrendingUp size={28} />
              </motion.div>
              <h3>Career Growth</h3>
              <p>Build valuable skills and experience that employers actively seek</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Organizations Section */}
      <section id="organizations" className="landing-organizations">
        <div className="landing-container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="section-title">Partner Organizations</h2>
            <p className="section-subtitle">
              Join students working with leading companies
            </p>
          </motion.div>

          {companies.length > 0 ? (
            <motion.div 
              className="organizations-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {companies.map((company, index) => (
                <motion.div 
                  key={company.id} 
                  className="organization-card"
                  variants={scaleIn}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/company/${encodeURIComponent(company.name)}`)}
                >
                  <div className="org-header">
                    <motion.div 
                      className="org-logo"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                    >
                      {company.logo}
                    </motion.div>
                    <div className="org-rating">
                      <Star size={14} fill="#14a800" color="#14a800" />
                      <span>{company.rating.toFixed(1)}</span>
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
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="empty-state"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <Building2 size={48} />
              <p>Partner organizations will be displayed here</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <div className="landing-container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="section-title">About the Platform</h2>
            <p className="section-subtitle">
              Empowering students through meaningful internship experiences
            </p>
          </motion.div>
          
          <motion.div 
            className="about-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div className="about-card" variants={slideInLeft} whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}>
              <motion.div 
                className="about-icon-wrapper"
                whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
              >
                <Target size={32} />
              </motion.div>
              <h3>Our Mission</h3>
              <p>
                Bridging the gap between academic learning and professional practice 
                by connecting DMU students with quality internship opportunities that 
                prepare them for successful careers.
              </p>
            </motion.div>

            <motion.div className="about-card" variants={fadeInUp} whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}>
              <motion.div 
                className="about-icon-wrapper"
                whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
              >
                <Lightbulb size={32} />
              </motion.div>
              <h3>Why Internships Matter</h3>
              <ul className="about-list">
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Gain real-world work experience
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Build professional networks
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Develop industry skills
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Enhance career prospects
                </motion.li>
              </ul>
            </motion.div>

            <motion.div className="about-card" variants={slideInRight} whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}>
              <motion.div 
                className="about-icon-wrapper"
                whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
              >
                <Shield size={32} />
              </motion.div>
              <h3>Platform Features</h3>
              <ul className="about-list">
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Streamlined application process
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Real-time advisor support
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Comprehensive evaluation system
                </motion.li>
                <motion.li whileHover={{ x: 5, transition: { duration: 0.2 } }}>
                  <CheckCircle size={16} /> Secure certificate verification
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
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
