import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getLeads, getAgents } from "../services/api";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const SOURCES  = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];

const STATUS_COLOR = {
  New: "#6366f1", Contacted: "#f59e0b", Qualified: "#10b981",
  "Proposal Sent": "#3b82f6", Closed: "#6b7280",
};
const STATUS_BG = {
  New: "#eef2ff", Contacted: "#fffbeb", Qualified: "#ecfdf5",
  "Proposal Sent": "#eff6ff", Closed: "#f9fafb",
};
const PRIORITY_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const status     = searchParams.get("status") || "";
  const salesAgent = searchParams.get("salesAgent") || "";
  const source     = searchParams.get("source") || "";
  const sortBy     = searchParams.get("sortBy") || "createdAt";

  useEffect(() => { getAgents().then(setAgents); }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const p = new URLSearchParams();
    if (status)     p.set("status", status);
    if (salesAgent) p.set("salesAgent", salesAgent);
    if (source)     p.set("source", source);
    getLeads(p.toString() ? `?${p}` : "")
      .then(setLeads).finally(() => setLoading(false));
  }, [status, salesAgent, source]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  };

  const sorted = [...leads].sort((a, b) => {
    if (sortBy === "timeToClose") return a.timeToClose - b.timeToClose;
    if (sortBy === "priority") return ({ High: 0, Medium: 1, Low: 2 }[a.priority] || 1) - ({ High: 0, Medium: 1, Low: 2 }[b.priority] || 1);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const hasFilters = status || salesAgent || source;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Leads</h4>
          <p className="text-muted small mb-0">{leads.length} leads{hasFilters ? " (filtered)" : ""}</p>
        </div>
        <Link to="/leads/new" className="btn btn-dark btn-sm">+ New Lead</Link>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 flex-wrap mb-3 filter-bar">
        <select className="form-select form-select-sm" style={{ width: "auto" }} value={status} onChange={e => setFilter("status", e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: "auto" }} value={salesAgent} onChange={e => setFilter("salesAgent", e.target.value)}>
          <option value="">All Agents</option>
          {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: "auto" }} value={source} onChange={e => setFilter("source", e.target.value)}>
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select form-select-sm" style={{ width: "auto" }} value={sortBy} onChange={e => setFilter("sortBy", e.target.value)}>
          <option value="createdAt">Sort: Newest</option>
          <option value="timeToClose">Sort: Time to Close</option>
          <option value="priority">Sort: Priority</option>
        </select>
        {hasFilters && (
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchParams({})}>✕ Clear</button>
        )}
      </div>

      {loading ? (
        <div className="page-loading">Loading leads…</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No leads found.</p>
          {hasFilters && <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearchParams({})}>Clear filters</button>}
        </div>
      ) : (
        <div className="card border shadow-sm">
          <div className="table-scroll">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="fw-semibold" style={{ fontSize: 12 }}>NAME</th>
                <th className="fw-semibold" style={{ fontSize: 12 }}>AGENT</th>
                <th className="fw-semibold" style={{ fontSize: 12 }}>SOURCE</th>
                <th className="fw-semibold" style={{ fontSize: 12 }}>STATUS</th>
                <th className="fw-semibold" style={{ fontSize: 12 }}>PRIORITY</th>
                <th className="fw-semibold" style={{ fontSize: 12 }}>DAYS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(lead => (
                <tr key={lead._id}>
                  <td className="fw-medium align-middle" style={{ fontSize: 13 }}>{lead.name}</td>
                  <td className="text-muted align-middle" style={{ fontSize: 12 }}>{lead.salesAgent?.name || "—"}</td>
                  <td className="text-muted align-middle" style={{ fontSize: 12 }}>{lead.source}</td>
                  <td className="align-middle">
                    <span className="badge rounded-pill px-2" style={{ background: STATUS_BG[lead.status], color: STATUS_COLOR[lead.status], fontSize: 11, border: `1px solid ${STATUS_COLOR[lead.status]}40` }}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="align-middle fw-medium" style={{ fontSize: 12, color: PRIORITY_COLOR[lead.priority] }}>
                    ● {lead.priority}
                  </td>
                  <td className="text-muted align-middle" style={{ fontSize: 12 }}>{lead.timeToClose}d</td>
                  <td className="align-middle">
                    <Link to={`/leads/${lead._id}`} className="btn btn-outline-dark btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}