import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Home, Search, FileText, Briefcase, MessageSquare, User, Rocket } from 'lucide-react';
import brandLogo from '../../assets/Debre_Markos_University.png';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const role = user?.role;
    
    if (role === 'ADVISOR') {
      return [
        { icon: Home, label: 'Dashboard', path: '/advisor/dashboard' },
        { icon: User, label: 'My Students', path: '/advisor/my-students' },
        { icon: FileText, label: 'Reports', path: '/advisor/reports' },
        { icon: Briefcase, label: 'Evaluation', path: '/advisor/final-reports' },
        { icon: MessageSquare, label: 'Messages', path: '/advisor/messages' },
        { icon: User, label: 'Profile', path: '/advisor/profile' },
      ];
    }
    
    if (role === 'COMPANY') {
      return [
        { icon: Home, label: 'Dashboard', path: '/company/dashboard' },
        { icon: Rocket, label: 'Post Internship', path: '/company/post-internship' },
        { icon: Briefcase, label: 'My Postings', path: '/company/my-internships' },
        { icon: User, label: 'Applications', path: '/company/applications' },
        { icon: MessageSquare, label: 'Messages', path: '/company/messages' },
        { icon: User, label: 'Profile', path: '/settings' },
      ];
    }

    if (role === 'DEPARTMENT_HEAD') {
      return [
        { icon: Home, label: 'Dashboard', path: '/department/dashboard' },
        { icon: User, label: 'Students', path: '/department/students' },
        { icon: Briefcase, label: 'Advisors', path: '/department/advisors' },
        { icon: FileText, label: 'Reports', path: '/department/reports' },
        { icon: MessageSquare, label: 'Messages', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/settings' },
      ];
    }

    // Default to Student links
    return [
      { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
      { icon: Search, label: 'Search', path: '/student/search-internships' },
      { icon: FileText, label: 'My Reports', path: '/student/reports' },
      { icon: Briefcase, label: 'Internship', path: '/student/active-internship' },
      { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
      { icon: User, label: 'Profile', path: '/student/profile' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="elite-sidebar">
      <div className="sidebar-brand">
        <img src={brandLogo} alt="Logo" className="sidebar-logo-img" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span className="brand-name">Internship</span>
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
