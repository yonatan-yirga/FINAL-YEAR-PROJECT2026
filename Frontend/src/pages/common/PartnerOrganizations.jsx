/**
 * Partner Organizations Page
 * Shows all partner companies in the system
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import partnerService from '../../services/partnerService';
import apiService from '../../services/api';
import { Building2, MapPin, Phone, Mail, Briefcase, Users, TrendingUp, Search, ExternalLink, RefreshCw, Clock, Calendar } from 'lucide-react';


// Add CSS for spin animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

const PartnerOrganizations = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Statistics Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard
              icon={<Building2 size={24} />}
              label="Total Partners"
              value={stats.total_partners}
              color="#667eea"
            />
            <StatCard
              icon={<Briefcase size={24} />}
              label="Total Internships"
              value={stats.total_internships}
              color="#14a800"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              label="Active Positions"
              value={stats.active_internships}
              color="#f59e0b"
            />
            <StatCard
              icon={<Users size={24} />}
              label="Total Applications"
              value={stats.total_applications}
              color="#6b7177"
            />
          </div>
        )}

        {/* Search Bar and Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7177'
              }}
            />
            <input
              type="text" 
              placeholder="Search by company name, city, or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                border: '1px solid #e4e5e7',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e4e5e7'}
            />
          </div>
          
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: loading ? '#f1f5f9' : '#667eea',
              color: loading ? '#6b7177' : '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
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
    border: '1px solid #e4e5e7',
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7177', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2d3d', lineHeight: 1 }}>
        {value}
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
      // Use the apiService instead of hardcoded fetch
      const response = await apiService.get('/internships/public/');
      const data = response.data || response;
      
      // Filter internships for this specific company
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
        border: '1px solid #e4e5e7',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.3s',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Logo */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
        position: 'relative',
        height: 120
      }}>
        {partner.company_logo ? (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <img
              src={partner.company_logo}
              alt={partner.company_name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Building2 size={32} color="#667eea" />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1f2d3d',
          marginBottom: 8,
          lineHeight: 1.3
        }}>
          {partner.company_name}
        </h3>

        <p style={{
          fontSize: 13,
          color: '#6b7177',
          marginBottom: 16,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {partner.description}
        </p>

        {/* Info Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <InfoItem icon={<MapPin size={14} />} text={partner.city} />
          <InfoItem icon={<Mail size={14} />} text={partner.email} />
          {partner.phone_number && (
            <InfoItem icon={<Phone size={14} />} text={partner.phone_number} />
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid #e4e5e7'
        }}>
          <MiniStat label="Internships" value={partner.total_internships} />
          <MiniStat label="Active" value={partner.active_internships} color="#14a800" />
          <MiniStat label="Applications" value={partner.total_applications} />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #e4e5e7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 11, color: '#6b7177' }}>
            Joined {partner.joined_date}
          </div>
          <button
            onClick={loadInternships}
            disabled={loadingInternships}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: '#667eea',
              background: 'none',
              border: 'none',
              cursor: loadingInternships ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !loadingInternships && (e.target.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.target.style.background = 'none')}
          >
            {loadingInternships ? (
              <>Loading...</>
            ) : showInternships ? (
              <>Hide Internships</>
            ) : (
              <>View Internships ({partner.total_internships})</>
            )}
            <ExternalLink size={12} />
          </button>
        </div>

        {/* Internships List */}
        {showInternships && (
          <div style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid #e4e5e7'
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1f2d3d',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Briefcase size={16} />
              Posted Internships ({internships.length})
            </h4>
            
            {internships.length === 0 ? (
              <div style={{
                padding: 16,
                textAlign: 'center',
                color: '#6b7177',
                fontSize: 13,
                background: '#f8f9fa',
                borderRadius: 8
              }}>
                No internships posted yet
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
    </div>
  );
};

const InfoItem = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ color: '#6b7177' }}>{icon}</div>
    <div style={{ fontSize: 13, color: '#6b7177' }}>{text}</div>
  </div>
);

const MiniStat = ({ label, value, color = '#1f2d3d' }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: '#6b7177', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
  </div>
);

const InternshipItem = ({ internship }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#dcfce7', color: '#14a800', text: 'Open' };
      case 'CLOSED': return { bg: '#fee2e2', color: '#dc2626', text: 'Closed' };
      case 'FILLED': return { bg: '#fef3c7', color: '#f59e0b', text: 'Filled' };
      default: return { bg: '#f1f5f9', color: '#6b7177', text: status };
    }
  };

  const statusConfig = getStatusColor(internship.status);

  return (
    <div style={{
      padding: 12,
      background: '#f8f9fa',
      borderRadius: 8,
      border: '1px solid #e4e5e7',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h5 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1f2d3d',
          margin: 0,
          lineHeight: 1.3,
          flex: 1
        }}>
          {internship.title}
        </h5>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: statusConfig.color,
          background: statusConfig.bg,
          padding: '4px 8px',
          borderRadius: 12,
          marginLeft: 8
        }}>
          {statusConfig.text}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7177' }}>
          <MapPin size={12} />
          <span>{internship.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7177' }}>
          <Clock size={12} />
          <span>{internship.duration_months} months</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7177' }}>
          <Users size={12} />
          <span>{internship.available_slots} slots</span>
        </div>
        {internship.start_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7177' }}>
            <Calendar size={12} />
            <span>Starts {new Date(internship.start_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {internship.application_count > 0 && (
        <div style={{ fontSize: 11, color: '#14a800', fontWeight: 500 }}>
          {internship.application_count} applications received
        </div>
      )}
    </div>
  );
};

export default PartnerOrganizations;
