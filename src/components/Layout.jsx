import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⬡", exact: true },
  { to: "/leads", label: "Leads", icon: "◈" },
  { to: "/agents", label: "Agents", icon: "◉" },
  { to: "/reports", label: "Reports", icon: "◫" },
];

export default function Layout({ children }) {
  return (
    <div className="d-flex">
      <aside className="sidebar">
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
            >
              <span style={{ fontSize: 16, width: 18, textAlign: "center" }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/agents" className="nav-item">
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