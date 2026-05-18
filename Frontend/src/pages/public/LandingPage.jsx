/**
 * Landing Page - DMU Internship Portal
 * Ultra-Modern Premium Design - World-Class Homepage
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Building2, Users, TrendingUp, Award, 
  CheckCircle, ArrowRight, Briefcase, Target, 
  Lightbulb, Shield, Star, MapPin, Moon, Sun,
  Sparkles, Zap, Globe, Rocket, ChevronRight, Play,
  GraduationCap, BarChart3, Clock, CheckCircle2, Search
} from 'lucide-react';
import publicService from '../../services/publicService';
import apiService from '../../services/api';
import dmuLogo from '../../assets/Debre_Markos_University.png';
import heroImage from '../../assets/one.jpg';
import videoPreview from '../../assets/video.png';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    students: 500,
    companies: 50,
    internships: 200,
    success_rate: 95
  });

  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []);

  useEffect(() => {
    // Filter companies when search changes
    let filtered = companies;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.description.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const fetchCompanies = async () => {
    setLoading(true);
    
    // Default companies to always show (fallback)
    const defaultCompanies = [
      {
        id: 1,
        name: 'Tech Solutions Ethiopia',
        logo: '💼',
        description: 'Leading technology company specializing in software development and IT solutions.',
        location: 'Addis Ababa',
        internships: 5,
        rating: 4.8,
        category: 'Technology'
      },
      {
        id: 2,
        name: 'Ethiopian Airlines',
        logo: '✈️',
        description: 'Africa\'s largest airline group offering diverse internship opportunities.',
        location: 'Addis Ababa',
        internships: 8,
        rating: 4.9,
        category: 'Aviation'
      },
      {
        id: 3,
        name: 'Commercial Bank of Ethiopia',
        logo: '🏦',
        description: 'Premier financial institution providing banking and financial services.',
        location: 'Addis Ababa',
        internships: 6,
        rating: 4.7,
        category: 'Finance'
      },
      {
        id: 4,
        name: 'Ethio Telecom',
        logo: '📱',
        description: 'National telecommunications provider offering cutting-edge technology internships.',
        location: 'Addis Ababa',
        internships: 7,
        rating: 4.6,
        category: 'Telecom'
      },
      {
        id: 5,
        name: 'Ethiopian Electric Power',
        logo: '⚡',
        description: 'Leading power generation and distribution company in Ethiopia.',
        location: 'Addis Ababa',
        internships: 4,
        rating: 4.5,
        category: 'Energy'
      },
      {
        id: 6,
        name: 'Awash Bank',
        logo: '💰',
        description: 'Private commercial bank offering innovative financial solutions.',
        location: 'Addis Ababa',
        internships: 3,
        rating: 4.7,
        category: 'Finance'
      }
    ];
    
    try {
      console.log('🔄 Fetching companies from backend...');
      const result = await publicService.getPublicCompanies();
      console.log('📦 Backend response:', result);
      
      if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
        console.log('✅ Using backend companies:', result.data.length);
        // Backend data is already in correct format from publicService
        setCompanies(result.data);
      } else {
        console.log('⚠️ Backend returned no data, using defaults');
        setCompanies(defaultCompanies);
      }
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      // Always show default companies on error to prevent white screen
      setCompanies(defaultCompanies);
    } finally {
      setLoading(false);
      console.log('✅ Companies loaded successfully');
    }
  };

  const fetchStats = async () => {
    const result = await publicService.getPublicStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCompanyClick = (companyId) => {
    // Navigate to a company internships page (you'll need to create this route)
    navigate(`/company/${companyId}/internships`);
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
            <button 
              onClick={toggleTheme} 
              className="landing-theme-toggle"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => navigate('/login')} className="btn-login">
              Log In
            </button>
            <button 
              onClick={() => {
                console.log('🔘 Register button clicked - navigating to /register');
                navigate('/register');
              }} 
              className="btn-signup"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Ultra-Modern Hero Section with Split Screen */}
      <section id="home" className="landing-hero-modern">
        <div className="hero-container-modern">
          {/* Left Side - Content */}
          <motion.div 
            className="hero-content-modern"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="hero-badge-modern"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span>Debre Markos University</span>
            </motion.div>
            
            <motion.h1 
              className="hero-title-modern"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="hero-title-gradient">Internship Management</span>
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle-modern"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Connect with Ethiopia's leading companies, gain hands-on experience, and build the professional network that will define your future success.
            </motion.p>
            
            <motion.div 
              className="hero-actions-modern"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                onClick={() => {
                  console.log('🚀 Hero Register button clicked - navigating to /register');
                  navigate('/register');
                }} 
                className="btn-hero-primary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Rocket size={20} strokeWidth={2.5} />
                <span>Start Your Journey</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.button>
              
              <motion.button 
                onClick={() => scrollToSection('organizations')} 
                className="btn-hero-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe size={20} strokeWidth={2.5} />
                <span>Explore Companies</span>
              </motion.button>
            </motion.div>

            <motion.div 
              className="hero-trust-modern"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              <span>Trusted by students and companies across Ethiopia</span>
            </motion.div>
          </motion.div>

          {/* Right Side - Images */}
          <motion.div 
            className="hero-visual-modern"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Main Image */}
            <motion.div 
              className="hero-image-main"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img src={heroImage} alt="Students Success" />
              <div className="hero-image-overlay"></div>
              
              {/* Floating Badge */}
              <motion.div 
                className="hero-floating-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="floating-badge-icon">
                  <Award size={24} strokeWidth={2.5} />
                </div>
                <div className="floating-badge-content">
                  <div className="floating-badge-title">Certified Programs</div>
                  <div className="floating-badge-subtitle">Industry-recognized certificates</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Video Preview Card */}
            <motion.div 
              className="hero-video-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <img src={videoPreview} alt="Platform Demo" />
              <div className="video-card-overlay">
                <motion.div 
                  className="video-play-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={24} fill="#ffffff" strokeWidth={0} />
                </motion.div>
              </div>
              <div className="video-card-label">
                <Clock size={14} strokeWidth={2.5} />
                <span>Watch Demo</span>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="hero-decoration hero-decoration-1"></div>
            <div className="hero-decoration hero-decoration-2"></div>
            <div className="hero-decoration hero-decoration-3"></div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="hero-bg-gradient hero-bg-gradient-1"></div>
        <div className="hero-bg-gradient hero-bg-gradient-2"></div>
        <div className="hero-bg-pattern"></div>
      </section>

      {/* Ultra-Premium Features Section */}
      <section className="landing-features-premium">
        <div className="landing-container">
          <motion.div 
            className="section-header-premium"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <motion.div 
              className="section-badge-premium"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Zap size={16} strokeWidth={2.5} />
              <span>Platform Features</span>
            </motion.div>
            <h2 className="section-title-premium">Everything You Need to Succeed</h2>
            <p className="section-subtitle-premium">
              A complete ecosystem designed for your internship journey
            </p>
          </motion.div>

          <motion.div 
            className="features-grid-premium"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div 
              className="feature-card-premium feature-card-blue"
              variants={fadeInUp} 
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
            >
              <div className="feature-card-glow feature-card-glow-blue"></div>
              <motion.div 
                className="feature-icon-premium feature-icon-blue"
                whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
              >
                <Briefcase size={32} strokeWidth={2.5} />
              </motion.div>
              <h3 className="feature-title-premium">Quality Opportunities</h3>
              <p className="feature-description-premium">
                Access verified internships from leading companies across various industries with real career growth potential
              </p>
              <div className="feature-badge-premium">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>200+ Active Positions</span>
              </div>
            </motion.div>

            <motion.div 
              className="feature-card-premium feature-card-purple"
              variants={fadeInUp} 
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
            >
              <div className="feature-card-glow feature-card-glow-purple"></div>
              <motion.div 
                className="feature-icon-premium feature-icon-purple"
                whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
              >
                <Users size={32} strokeWidth={2.5} />
              </motion.div>
              <h3 className="feature-title-premium">Expert Support</h3>
              <p className="feature-description-premium">
                Get guidance from dedicated advisors throughout your entire journey with personalized mentorship
              </p>
              <div className="feature-badge-premium">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>24/7 Advisor Access</span>
              </div>
            </motion.div>

            <motion.div 
              className="feature-card-premium feature-card-pink"
              variants={fadeInUp} 
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
            >
              <div className="feature-card-glow feature-card-glow-pink"></div>
              <motion.div 
                className="feature-icon-premium feature-icon-pink"
                whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
              >
                <Award size={32} strokeWidth={2.5} />
              </motion.div>
              <h3 className="feature-title-premium">Verified Certificates</h3>
              <p className="feature-description-premium">
                Earn industry-recognized certificates upon successful completion with blockchain verification
              </p>
              <div className="feature-badge-premium">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>Blockchain Verified</span>
              </div>
            </motion.div>

            <motion.div 
              className="feature-card-premium feature-card-green"
              variants={fadeInUp} 
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
            >
              <div className="feature-card-glow feature-card-glow-green"></div>
              <motion.div 
                className="feature-icon-premium feature-icon-green"
                whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
              >
                <TrendingUp size={32} strokeWidth={2.5} />
              </motion.div>
              <h3 className="feature-title-premium">Career Growth</h3>
              <p className="feature-description-premium">
                Build valuable skills and experience that employers actively seek with measurable outcomes
              </p>
              <div className="feature-badge-premium">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                <span>95% Success Rate</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Organizations Section - Premium Modern */}
      <section id="organizations" className="landing-organizations">
        <div className="landing-container">
          <motion.div 
            className="section-header"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="section-title" style={{ 
              fontSize: '54px', 
              fontWeight: 900, 
              background: 'linear-gradient(135deg, #14a800 0%, #0F2D5E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-2px',
              marginBottom: '20px'
            }}>
              Partner Organizations
            </h2>
            <p className="section-subtitle" style={{ 
              fontSize: '22px', 
              color: '#475569', 
              fontWeight: 500,
              maxWidth: '800px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              Explore opportunities across various industries and locations
            </p>
          </motion.div>

          {loading ? (
            <motion.div 
              className="loading-state"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="loading-spinner"></div>
              <p>Loading partner organizations...</p>
            </motion.div>
          ) : companies.length > 0 ? (
            <>
              {/* Search Bar */}
              <motion.div 
                className="search-bar-container"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                style={{
                  maxWidth: 600,
                  margin: '0 auto 32px',
                  position: 'relative'
                }}
              >
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7177',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search companies by name, location, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 52px',
                    fontSize: 15,
                    fontWeight: 500,
                    border: '2px solid #e4e5e7',
                    borderRadius: 16,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#14a800';
                    e.target.style.boxShadow = '0 4px 16px rgba(20, 168, 0, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e4e5e7';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e2e8f0';
                      e.target.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    Clear
                  </button>
                )}
              </motion.div>

              <motion.div 
                className="organizations-grid-modern"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
              >
                {filteredCompanies.map((company, index) => (
                  <motion.div 
                    key={company.id} 
                    className="organization-card-modern"
                    initial={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompanyClick(company.id)}
                  >
                    <div className="org-card-header">
                      <motion.div 
                        className="org-logo-modern"
                        whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
                      >
                        {company.logo && company.logo.includes('/') ? (
                          // It's a file path - render as image
                          <img 
                            src={`http://localhost:8000/media/${company.logo}`}
                            alt={company.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: '12px'
                            }}
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="org-logo-emoji">🏢</span>';
                            }}
                          />
                        ) : (
                          // It's an emoji - render as text
                          <span className="org-logo-emoji">{company.logo || '🏢'}</span>
                        )}
                      </motion.div>
                      <div className="org-badge-new">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>{company.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <div className="org-card-body">
                      <h3 className="org-name-modern">{company.name}</h3>
                      <p className="org-description-modern">{company.description}</p>
                      
                      {/* Category Badge */}
                      <div className="org-category-badge">
                        <Briefcase size={12} strokeWidth={2.5} />
                        <span>{company.category || 'Technology'}</span>
                      </div>
                    </div>
                    
                    <div className="org-card-footer">
                      <div className="org-meta">
                        <div className="org-meta-item">
                          <MapPin size={14} strokeWidth={2.5} />
                          <span>{company.location}</span>
                        </div>
                        <div className="org-meta-item">
                          <Briefcase size={14} strokeWidth={2.5} />
                          <span>{company.internships} {company.internships === 1 ? 'position' : 'positions'}</span>
                        </div>
                      </div>
                      <motion.button
                        className="org-view-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompanyClick(company.id);
                        }}
                        style={{
                          background: '#fff',
                          color: '#14a800',
                          border: '1px solid #14a800'
                        }}
                      >
                        <span>View</span>
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="empty-state-modern"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="empty-icon">
                <Building2 size={48} strokeWidth={1.5} />
              </div>
              <h3>No Organizations Yet</h3>
              <p>Partner organizations will be displayed here once they join the platform</p>
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
