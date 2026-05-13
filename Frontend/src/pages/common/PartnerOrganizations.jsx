/**
 * Partner Organizations Page
 * Shows all partner companies in the system
 */
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import partnerService from '../../services/partnerService';
import apiService from '../../services/api';
import { Building2, MapPin, Briefcase, Users, TrendingUp, Search, ExternalLink, RefreshCw, Clock, Calendar } from 'lucide-react';


// Add CSS for spin animation and responsive styles
const responsiveStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Responsive container padding */
  @media (max-width: 768px) {
    .partner-container {
      padding: 16px !important;
    }
  }

  @media (max-width: 480px) {
    .partner-container {
      padding: 12px !important;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = responsiveStyles;
  document.head.appendChild(style);
}

const PartnerOrganizations = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter partners based on search query
    if (searchQuery.trim() === '') {
      setFilteredPartners(partners);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = partners.filter(partner =>
        partner.company_name.toLowerCase().includes(query) ||
        partner.city.toLowerCase().includes(query) ||
        partner.description.toLowerCase().includes(query)
      );
      setFilteredPartners(filtered);
    }
  }, [searchQuery, partners]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [partnersRes, statsRes] = await Promise.all([
        partnerService.getPartnerOrganizations(),
        partnerService.getPartnerOrganizationsStats()
      ]);

      console.log('Partners response:', partnersRes);
      console.log('Stats response:', statsRes);

      if (partnersRes.success) {
        const data = Array.isArray(partnersRes.data) ? partnersRes.data : [];
        setPartners(data);
        setFilteredPartners(data);
      } else {

        console.error('Failed to fetch partners:', partnersRes.error);
        setPartners([]);
        setFilteredPartners([]);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        console.error('Failed to fetch stats:', statsRes.error);
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setPartners([]);
      setFilteredPartners([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header title="Partner Organizations" subtitle="Companies partnered with the university for internships" />

      <div className="partner-container" style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Statistics Cards */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16, 
            marginBottom: 28 
          }}>
            <StatCard
              icon={<Building2 size={22} />}
              label="Total Partners"
              value={stats.total_partners}
              color="#14a800"
            />
            <StatCard
              icon={<Briefcase size={22} />}
              label="Total Positions"
              value={stats.total_internships}
              color="#14a800"
            />
            <StatCard
              icon={<TrendingUp size={22} />}
              label="Active Now"
              value={stats.active_internships}
              color="#14a800"
            />
            <StatCard
              icon={<Users size={22} />}
              label="Total Applicants"
              value={stats.total_applications}
              color="#14a800"
            />
          </div>
        )}

        {/* Search Bar and Refresh */}
        <div style={{ 
          display: 'flex', 
          flexDirection: windowWidth <= 640 ? 'column' : 'row',
          alignItems: windowWidth <= 640 ? 'stretch' : 'center',
          gap: 12, 
          marginBottom: 24 
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: windowWidth <= 640 ? '100%' : 500 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#5e6d55'
              }}
            />
            <input
              type="text" 
              placeholder="Search companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 44px',
                border: '1px solid #d5e0d5',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                background: '#fff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#14a800';
                e.target.style.boxShadow = '0 0 0 3px rgba(20, 168, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d5e0d5';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 18px',
              background: loading ? '#f1f5f9' : '#14a800',
              color: loading ? '#5e6d55' : '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              width: windowWidth <= 640 ? '100%' : 'auto'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#108900')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#14a800')}
          >
            <RefreshCw 
              size={16} 
              style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>


        {/* Partners Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 16, color: '#6b7177' }}>Loading partner organizations...</div>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px solid #e4e5e7' }}>
            <Building2 size={48} color="#6b7177" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2d3d', marginBottom: 8 }}>
              {searchQuery ? 'No partners found' : 'No partner organizations yet'}
            </div>
            <div style={{ fontSize: 14, color: '#6b7177' }}>
              {searchQuery ? 'Try a different search term' : 'Partner companies will appear here once they register'}
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', 
            gap: 16 
          }}>
            {filteredPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #d5e0d5',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0
  }}>
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 10,
      background: `${color}10`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#001e00', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 13, 
        fontWeight: 500, 
        color: '#5e6d55',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </div>
    </div>
  </div>
);

const PartnerCard = ({ partner }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showInternships, setShowInternships] = useState(false);
  const [internships, setInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(false);

  const loadInternships = async () => {
    if (internships.length > 0) {
      setShowInternships(!showInternships);
      return;
    }

    setLoadingInternships(true);
    try {
      const response = await apiService.get('/internships/public/');
      const data = response.data || response;
      
      const companyInternships = data.filter(internship => 
        internship.company_name === partner.company_name
      );
      setInternships(companyInternships);
      setShowInternships(true);
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoadingInternships(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #d5e0d5',
        borderRadius: 16,
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 6px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header - Company Info */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Logo */}
        {partner.company_logo ? (
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '1px solid #e4e5e7',
            flexShrink: 0
          }}>
            <img
              src={partner.company_logo}
              alt={partner.company_name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #14a800 0%, #108900 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Building2 size={28} color="#fff" />
          </div>
        )}

        {/* Company Name and Location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#001e00',
            marginBottom: 4,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {partner.company_name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5e6d55', fontSize: 13 }}>
            <MapPin size={13} />
            <span>{partner.city}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 14,
        color: '#5e6d55',
        lineHeight: 1.5,
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {partner.description}
      </p>

      {/* Stats Row - Upwork Style */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 12,
        borderTop: '1px solid #e4e5e7'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} color="#14a800" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#001e00' }}>
            {partner.total_internships}
          </span>
          <span style={{ fontSize: 13, color: '#5e6d55' }}>
            {partner.total_internships === 1 ? 'position' : 'positions'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} color="#14a800" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#14a800' }}>
            {partner.active_internships}
          </span>
          <span style={{ fontSize: 13, color: '#5e6d55' }}>active</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={14} color="#5e6d55" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#001e00' }}>
            {partner.total_applications}
          </span>
          <span style={{ fontSize: 13, color: '#5e6d55' }}>applicants</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={loadInternships}
        disabled={loadingInternships}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: isHovered ? '#14a800' : '#fff',
          color: isHovered ? '#fff' : '#14a800',
          border: '1px solid #14a800',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: loadingInternships ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        {loadingInternships ? (
          <>Loading...</>
        ) : showInternships ? (
          <>
            Hide Positions
            <ExternalLink size={14} />
          </>
        ) : (
          <>
            View {partner.total_internships} {partner.total_internships === 1 ? 'Position' : 'Positions'}
            <ExternalLink size={14} />
          </>
        )}
      </button>

      {/* Internships List */}
      {showInternships && (
        <div style={{
          marginTop: 8,
          paddingTop: 16,
          borderTop: '1px solid #e4e5e7'
        }}>
          {internships.length === 0 ? (
            <div style={{
              padding: 16,
              textAlign: 'center',
              color: '#5e6d55',
              fontSize: 13,
              background: '#f8f9fa',
              borderRadius: 8
            }}>
              No positions posted yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {internships.map((internship) => (
                <InternshipItem key={internship.id} internship={internship} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InternshipItem = ({ internship }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#d4f4dd', color: '#14a800', text: 'Open' };
      case 'CLOSED': return { bg: '#fee2e2', color: '#dc2626', text: 'Closed' };
      case 'FILLED': return { bg: '#fef3c7', color: '#f59e0b', text: 'Filled' };
      default: return { bg: '#f1f5f9', color: '#6b7177', text: status };
    }
  };

  const statusConfig = getStatusColor(internship.status);

  return (
    <div style={{
      padding: 14,
      background: '#f8f9fa',
      borderRadius: 12,
      border: '1px solid #e4e5e7',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <h5 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#001e00',
          margin: 0,
          lineHeight: 1.4,
          flex: 1
        }}>
          {internship.title}
        </h5>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: statusConfig.color,
          background: statusConfig.bg,
          padding: '4px 10px',
          borderRadius: 12,
          marginLeft: 8,
          whiteSpace: 'nowrap'
        }}>
          {statusConfig.text}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5e6d55' }}>
          <MapPin size={12} />
          <span>{internship.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5e6d55' }}>
          <Clock size={12} />
          <span>{internship.duration_months} months</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5e6d55' }}>
          <Users size={12} />
          <span>{internship.available_slots} slots</span>
        </div>
        {internship.start_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5e6d55' }}>
            <Calendar size={12} />
            <span>Starts {new Date(internship.start_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {internship.application_count > 0 && (
        <div style={{ fontSize: 12, color: '#14a800', fontWeight: 500 }}>
          {internship.application_count} {internship.application_count === 1 ? 'application' : 'applications'} received
        </div>
      )}
    </div>
  );
};

export default PartnerOrganizations;
