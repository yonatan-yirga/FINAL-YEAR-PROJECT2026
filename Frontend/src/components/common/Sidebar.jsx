import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Home, Search, FileText, Briefcase, MessageSquare, User, Rocket } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
    { icon: Search, label: 'Search', path: '/student/search-internships' },
    { icon: FileText, label: 'My Reports', path: '/student/reports' },
    { icon: Briefcase, label: 'Internship', path: '/student/active-internship' },
    { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <aside className="elite-sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon"><Rocket size={24} /></span>
        <span className="brand-name">DMU Link</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><IconComponent size={20} /></span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-short-info">
          <div className="user-avatar-small">
            {(user?.full_name || 'U').charAt(0)}
          </div>
          <div className="user-details-small">
            <div className="user-name-small">{user?.full_name?.split(' ')[0]}</div>
            <div className="user-status-small">Online</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
