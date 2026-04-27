import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import './Topbar.css';

const Topbar = ({ title }) => {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="elite-topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search resources..." className="search-input" />
        </div>

        <div className="topbar-actions">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn-elite" 
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <NotificationBell />
          
          <div className="topbar-divider"></div>

          <div className="topbar-user" onClick={() => window.location.href = '/student/profile'}>
            <div className="topbar-user-info">
              <span className="topbar-username">{user?.full_name}</span>
              <span className="topbar-user-role">Student Node</span>
            </div>
            <div className="topbar-avatar">
              {(user?.full_name || 'U').charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
