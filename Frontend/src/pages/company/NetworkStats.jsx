/**
 * Network Stats Page
 * Comprehensive partnership statistics and insights for companies
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import partnerService from '../../services/partnerService';
import internshipService from '../../services/internshipService';
import applicationService from '../../services/applicationService';
import { 
  Building2, Users, Briefcase, TrendingUp, TrendingDown, 
  MapPin, Award, Target, BarChart3, PieChart, Activity,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight, Minus, Eye, ExternalLink, Trophy
} from 'lucide-react';

const NetworkStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [partners, setPartners] = useState([]);
  const [topPartners, setTopPartners] = useState([]);
  const [cityDistribution, setCityDistribution] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // all, month, quarter, year

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [partnersRes, statsRes] = await Promise.all([
      partnerService.getPartnerOrganizations(),
      partnerService.getPartnerOrganizationsStats()
    ]);

    if (partnersRes.success) {
      const partnerData = Array.isArray(partnersRes.data) ? partnersRes.data : [];
      setPartners(partnerData);

      
      // Calculate top partners by internships
      const sorted = [...partnerData].sort((a, b) => b.total_internships - a.total_internships);
      setTopPartners(sorted.slice(0, 5));
      
      // Calculate city distribution
      const cityMap = {};
      partnerData.forEach(partner => {
        const city = partner.city || 'Unknown';
        cityMap[city] = (cityMap[city] || 0) + 1;
      });
      const cityData = Object.entries(cityMap)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
      setCityDistribution(cityData);
    }

    if (statsRes.success) {
      setStats(statsRes.data);
    }

    setLoading(false);
  };

  // Calculate derived metrics
  const avgInternshipsPerPartner = stats && stats.total_partners > 0 
    ? (stats.total_internships / stats.total_partners).toFixed(1) 
    : 0;
  
  const avgApplicationsPerInternship = stats && stats.total_internships > 0
    ? (stats.total_applications / stats.total_internships).toFixed(1)
    : 0;

  const activeRate = stats && stats.total_internships > 0
    ? ((stats.active_internships / stats.total_internships) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header 
        title="Network Statistics" 
        subtitle="Comprehensive insights into partnership network performance"
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Activity size={48} color="#667eea" style={{ marginBottom: 16, animation: 'spin 2s linear infinite' }} />
            <div style={{ fontSize: 16, color: '#6b7177' }}>Loading network statistics...</div>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
              <MetricCard
                icon={<Building2 size={24} />}
                label="Total Partners"
                value={stats?.total_partners || 0}
                trend={null}
                color="#667eea"
              />
              <MetricCard
                icon={<Briefcase size={24} />}
                label="Total Internships"
                value={stats?.total_internships || 0}
                trend={null}
                color="#14a800"
              />
              <MetricCard
                icon={<TrendingUp size={24} />}
                label="Active Positions"
                value={stats?.active_internships || 0}
                subtitle={`${activeRate}% of total`}
                color="#f59e0b"
              />
              <MetricCard
                icon={<Users size={24} />}
                label="Total Applications"
                value={stats?.total_applications || 0}
                trend={null}
                color="#6b7177"
              />
            </div>

            {/* Key Performance Indicators */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2d3d', marginBottom: 16 }}>
                Key Performance Indicators
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <KPICard
                  icon={<Target size={20} />}
                  label="Avg Internships per Partner"
                  value={avgInternshipsPerPartner}
                  description="Average number of internship positions per company"
                  color="#667eea"
                />
                <KPICard
                  icon={<Activity size={20} />}
                  label="Avg Applications per Position"
                  value={avgApplicationsPerInternship}
                  description="Average student interest per internship"
                  color="#14a800"
                />
                <KPICard
                  icon={<Award size={20} />}
                  label="Active Position Rate"
                  value={`${activeRate}%`}
                  description="Percentage of internships currently open"
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              
              {/* Top Partners */}
              <div style={{
                background: '#fff',
                border: '1px solid #e4e5e7',
                borderRadius: 12,
                padding: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2d3d', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy size={20} color="#f59e0b" />
                    Top Partners by Internships
                  </h3>
                </div>
                
                {topPartners.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#6b7177' }}>
                    No partner data available
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {topPartners.map((partner, index) => (
                      <TopPartnerRow 
                        key={partner.id} 
                        partner={partner} 
                        rank={index + 1}
                        onClick={() => navigate('/partner-organizations')}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Geographic Distribution */}
              <div style={{
                background: '#fff',
                border: '1px solid #e4e5e7',
                borderRadius: 12,
                padding: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2d3d', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={20} color="#667eea" />
                    Geographic Distribution
                  </h3>
                </div>
                
                {cityDistribution.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#6b7177' }}>
                    No location data available
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cityDistribution.map((item, index) => (
                      <CityDistributionRow 
                        key={index} 
                        city={item.city} 
                        count={item.count}
                        total={partners.length}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Network Health Indicators */}
            <div style={{
              background: '#fff',
              border: '1px solid #e4e5e7',
              borderRadius: 12,
              padding: 24,
              marginBottom: 32
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2d3d', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={20} color="#14a800" />
                Network Health Indicators
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <HealthIndicator
                  label="Partner Engagement"
                  value={stats?.total_partners > 0 ? "High" : "Low"}
                  status={stats?.total_partners > 3 ? "good" : "warning"}
                  description={`${stats?.total_partners || 0} active partners`}
                />
                <HealthIndicator
                  label="Position Availability"
                  value={activeRate > 30 ? "Excellent" : activeRate > 15 ? "Good" : "Low"}
                  status={activeRate > 30 ? "good" : activeRate > 15 ? "warning" : "alert"}
                  description={`${stats?.active_internships || 0} open positions`}
                />
                <HealthIndicator
                  label="Student Interest"
                  value={avgApplicationsPerInternship > 3 ? "High" : avgApplicationsPerInternship > 1 ? "Medium" : "Low"}
                  status={avgApplicationsPerInternship > 3 ? "good" : avgApplicationsPerInternship > 1 ? "warning" : "alert"}
                  description={`${avgApplicationsPerInternship} avg per position`}
                />
                <HealthIndicator
                  label="Network Growth"
                  value="Stable"
                  status="good"
                  description="Consistent partner base"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 12,
              padding: 24,
              color: '#fff'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                Explore Network
              </h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
                View detailed information about partner organizations and their internship programs
              </p>
              <button
                onClick={() => navigate('/partner-organizations')}
                style={{
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                View All Partners <ExternalLink size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, label, value, subtitle, trend, color }) => (
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
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7177', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2d3d', lineHeight: 1 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#6b7177', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

// KPI Card Component
const KPICard = ({ icon, label, value, description, color }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e4e5e7',
    borderRadius: 12,
    padding: 20
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7177' }}>
        {label}
      </div>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: '#1f2d3d', marginBottom: 8 }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: '#6b7177', lineHeight: 1.5 }}>
      {description}
    </div>
  </div>
);

// Top Partner Row Component
const TopPartnerRow = ({ partner, rank, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getRankColor = (rank) => {
    if (rank === 1) return '#f59e0b';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#cd7f32';
    return '#6b7177';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 8,
        background: isHovered ? '#f8f9fa' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: `${getRankColor(rank)}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        color: getRankColor(rank)
      }}>
        {rank}
      </div>
      
      {partner.company_logo ? (
        <img
          src={partner.company_logo}
          alt={partner.company_name}
          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain' }}
        />
      ) : (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: '#667eea15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Building2 size={20} color="#667eea" />
        </div>
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2d3d' }}>
          {partner.company_name}
        </div>
        <div style={{ fontSize: 12, color: '#6b7177' }}>
          {partner.city}
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2d3d' }}>
          {partner.total_internships}
        </div>
        <div style={{ fontSize: 11, color: '#6b7177' }}>
          internships
        </div>
      </div>
    </div>
  );
};

// City Distribution Row Component
const CityDistributionRow = ({ city, count, total }) => {
  const percentage = ((count / total) * 100).toFixed(0);
  
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2d3d' }}>
          {city}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7177' }}>
          {count} ({percentage}%)
        </div>
      </div>
      <div style={{
        height: 8,
        background: '#e4e5e7',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          borderRadius: 4,
          transition: 'width 0.6s ease-out'
        }} />
      </div>
    </div>
  );
};

// Health Indicator Component
const HealthIndicator = ({ label, value, status, description }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'good':
        return { icon: <CheckCircle size={20} />, color: '#14a800', bg: '#dcfce7' };
      case 'warning':
        return { icon: <AlertCircle size={20} />, color: '#f59e0b', bg: '#fef3c7' };
      case 'alert':
        return { icon: <XCircle size={20} />, color: '#dc2626', bg: '#fee2e2' };
      default:
        return { icon: <Minus size={20} />, color: '#6b7177', bg: '#f1f5f9' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div style={{
      padding: 16,
      borderRadius: 8,
      background: config.bg,
      border: `1px solid ${config.color}30`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ color: config.color }}>
          {config.icon}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2d3d' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: config.color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#6b7177' }}>
        {description}
      </div>
    </div>
  );
};

export default NetworkStats;
