import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⬡", exact: true },
  { to: "/leads", label: "Leads", icon: "◈" },
  { to: "/agents", label: "Agents", icon: "◉" },
  { to: "/reports", label: "Reports", icon: "◫" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="d-flex">
      <div className="mobile-topbar">
        <div className="d-flex align-items-center gap-2">
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
          <span className="brand-name">Anvaya</span>
        </div>
      </div>
      <div className={`sidebar-overlay${open ? " active" : ""}`} onClick={close} />

      <aside className={`sidebar${open ? " mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">A</div>
          <span className="brand-name">Anvaya</span>
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
            <span style={{ fontSize: 16 }}>＋</span>
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