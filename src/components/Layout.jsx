
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Sprout, ClipboardCheck, Briefcase } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: <Home size={20} />, label: 'Inicio', path: '/' },
        { icon: <TrendingUp size={20} />, label: 'Mercado', path: '/market' },
        { icon: <Sprout size={20} />, label: 'Técnico', path: '/technical' },
        { icon: <ClipboardCheck size={20} />, label: 'Visita Finca', path: '/visit' },
        { icon: <Briefcase size={20} />, label: 'Negocio', path: '/business' },
    ];

    return (
        <div className="layout">
            <nav className="sidebar">
                <div className="logo">
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🫐</span>
                    BlueInvest
                </div>
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`}>
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <main className="content">
                {children}
            </main>

            {/* Mobile Nav */}
            <nav className="mobile-nav">
                {navItems.map((item) => (
                    <Link key={item.path} to={item.path} className={`mobile-link ${isActive(item.path) ? 'active' : ''}`}>
                        {item.icon}
                    </Link>
                ))}
            </nav>

            <style>{`
        .layout { display: flex; min-height: 100vh; }
        .sidebar { 
          width: 250px; 
          background: white; 
          border-right: 1px solid var(--border); 
          padding: 1.5rem; 
          display: flex; flex-direction: column;
          position: fixed; height: 100vh;
        }
        .content { 
          flex: 1; 
          margin-left: 250px; 
          padding: 2rem; 
          background: var(--background);
          min-height: 100vh;
        }
        .logo { 
          font-weight: 800; 
          font-size: 1.25rem; 
          color: var(--primary); 
          margin-bottom: 2rem;
          display: flex; align-items: center;
        }
        .nav-list { list-style: none; }
        .nav-link { 
          display: flex; align-items: center; gap: 0.75rem; 
          padding: 0.75rem 1rem; 
          border-radius: var(--radius); 
          color: var(--text-muted); 
          font-weight: 500;
          transition: all 0.2s;
        }
        .nav-link:hover { background: var(--background); color: var(--primary); }
        .nav-link.active { 
          background: var(--primary); 
          color: white; 
          box-shadow: var(--shadow-sm);
        }
        .mobile-nav { display: none; }

        @media (max-width: 768px) {
          .sidebar { display: none; }
          .content { margin-left: 0; padding: 1rem; padding-bottom: 5rem; }
          .mobile-nav { 
            position: fixed; bottom: 0; left: 0; right: 0; 
            height: 60px; background: white; border-top: 1px solid var(--border);
            display: flex; justify-content: space-around; align-items: center;
            z-index: 100;
          }
          .mobile-link { color: var(--text-muted); padding: 0.5rem; }
          .mobile-link.active { color: var(--primary); }
        }
      `}</style>
        </div>
    );
};

export default Layout;
