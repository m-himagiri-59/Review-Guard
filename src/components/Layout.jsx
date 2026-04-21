import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield, Search, TrendingDown, LayoutDashboard, ClipboardEdit, Flag, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: Shield, label: 'Home' },
  { to: '/reviews', icon: Search, label: 'Reviews' },
  { to: '/price-tracker', icon: TrendingDown, label: 'Price Tracker' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/submit-review', icon: ClipboardEdit, label: 'Submit Review' },
  { to: '/flagged', icon: Flag, label: 'Flagged' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header" onClick={() => setSidebarOpen(true)} style={{ cursor: 'pointer' }}>
        <button aria-label="Open menu" style={{ pointerEvents: 'none' }}>
          <Menu size={24} />
        </button>
        <div className="sidebar-brand-text">
          <h2>ReviewGuard</h2>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Shield size={22} />
          </div>
          <div className="sidebar-brand-text">
            <h2>ReviewGuard</h2>
            <span>Smart Monitor</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>



      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
