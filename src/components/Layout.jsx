import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: <i className="bi bi-grid-1x2-fill"></i>, exact: true },
  { to: "/leads", label: "Leads", icon: <i className="bi bi-diagram-3-fill"></i> },
  { to: "/agents", label: "Agents", icon: <i className="bi bi-people-fill"></i> },
  { to: "/reports", label: "Reports", icon: <i className="bi bi-bar-chart-line-fill"></i> },
  { to: "/settings", label: "Settings", icon: <i className="bi bi-gear-fill"></i> },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="d-flex">
      <div className="mobile-topbar">
        <div className="d-flex align-items-center gap-2">
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
          </button>
          <Link to="/" className="text-decoration-none" onClick={close}>
            <span className="brand-name">Anvaya</span>
          </Link>
        </div>
      </div>
      <div className={`sidebar-overlay${open ? " active" : ""}`} onClick={close} />

      <aside className={`sidebar${open ? " mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="brand-mark">A</div>
            <span className="brand-name">Anvaya</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              onClick={close}
            >
              <span style={{ fontSize: 16, width: 18, textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/agents" className="nav-item" onClick={close}>
            <span style={{ fontSize: 16 }}><i className="bi bi-plus-circle-fill"></i></span>
            <span>Add Agent</span>
          </NavLink>
        </div>
      </aside>

      <main className="main-content flex-grow-1">
        {children}
      </main>
    </div>
  );
}