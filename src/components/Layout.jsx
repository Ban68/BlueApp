
import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, BookOpen, UserCheck, Briefcase, Menu, X, Rocket } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { path: '/market', label: 'Mercado', icon: <TrendingUp size={20} /> },
    { path: '/technical', label: 'Técnico', icon: <BookOpen size={20} /> },
    { path: '/visit', label: 'Visita Finca', icon: <UserCheck size={20} /> },
    { path: '/business', label: 'Negocio', icon: <Briefcase size={20} /> },
  ];

  return (
    <div className="layout">
      {/* Sidebar (Desktop) */}
      <aside className="sidebar hide-mobile">
        <div className="logo-container">
          <Rocket size={28} className="logo-icon" />
          <span className="logo-text">BlueInvest</span>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx('nav-item', isActive && 'active')}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-profile">
          <div className="avatar">C</div>
          <div className="user-info">
            <span className="name">Carlos Inversionista</span>
            <span className="role">Plan Premium</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header show-mobile">
        <div className="logo-container">
          <Rocket size={24} className="logo-icon" />
          <span className="logo-text">BlueInvest</span>
        </div>
        <button
          className="menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay show-mobile animate-fade-in-down">
          <nav className="mobile-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx('mobile-nav-item', isActive && 'active')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Chat Widget (Global) */}
      <ChatWidget />
    </div>
  );
};

export default Layout;
