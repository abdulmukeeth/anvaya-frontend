import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeads, getPipelineReport } from "../services/api";

const STATUS_CONFIG = [
  { key: "New",           color: "#6366f1", bg: "#eef2ff" },
  { key: "Contacted",     color: "#f59e0b", bg: "#fffbeb" },
  { key: "Qualified",     color: "#10b981", bg: "#ecfdf5" },
  { key: "Proposal Sent", color: "#3b82f6", bg: "#eff6ff" },
  { key: "Closed",        color: "#6b7280", bg: "#f9fafb" },
];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeads(), getPipelineReport()])
      .then(([l, p]) => { setLeads(l); setPipeline(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading…</div>;

  const countByStatus = (s) => leads.filter((l) => l.status === s).length;
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Dashboard</h4>
          <p className="text-muted small mb-0">Your sales pipeline at a glance</p>
        </div>
        <Link to="/leads/new" className="btn btn-dark btn-sm">+ New Lead</Link>
      </div>

      <div className="row g-3 mb-4">
        {STATUS_CONFIG.map(({ key, color, bg }) => (
          <div className="col-6 col-md" key={key}>
            <Link to={`/leads?status=${encodeURIComponent(key)}`} className="stat-card-link">
              <div className="card border-0 shadow-sm stat-card" style={{ background: bg, borderLeft: `3px solid ${color}` }}>
                <div className="card-body py-3 px-3">
                  <div className="stat-count" style={{ color }}>{countByStatus(key)}</div>
                  <div className="text-muted" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{key}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Recent Leads</span>
              <Link to="/leads" className="text-decoration-none small text-primary">View all →</Link>
            </div>
            <div className="card-body p-0">
              {recentLeads.length === 0 ? (
                <p className="p-3 text-muted small">No leads yet. <Link to="/leads/new">Create one →</Link></p>
              ) : recentLeads.map((lead) => {
                const sc = STATUS_CONFIG.find((s) => s.key === lead.status);
                return (
                  <Link key={lead._id} to={`/leads/${lead._id}`} className="text-decoration-none">
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8f9fa"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <span className="fw-medium text-dark" style={{ fontSize: 13 }}>{lead.name}</span>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill" style={{ background: sc?.bg, color: sc?.color, fontSize: 11, border: `1px solid ${sc?.color}40` }}>{lead.status}</span>
                        <span className="text-muted" style={{ fontSize: 12 }}>{lead.salesAgent?.name || "—"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Pipeline Summary</span>
              <Link to="/reports" className="text-decoration-none small text-primary">Full report →</Link>
            </div>
            <div className="card-body">
              {pipeline && pipeline.totalLeadsInPipeline === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center text-center py-4" style={{ minHeight: 140 }}>
                  <span style={{ fontSize: 32, marginBottom: 10 }}><i className="bi bi-inbox"></i></span>
                  <p className="fw-medium mb-1" style={{ fontSize: 14 }}>No active leads yet</p>
                  <p className="text-muted small mb-3">Leads you create will appear here as pipeline progress.</p>
                  <Link to="/leads/new" className="btn btn-dark btn-sm">+ Create your first lead</Link>
                </div>
              ) : pipeline && (
                <>
                  <div className="mb-3">
                    <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{pipeline.totalLeadsInPipeline}</span>
                    <span className="text-muted ms-2 small">active leads</span>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {STATUS_CONFIG.filter(s => s.key !== "Closed").map(({ key, color }) => {
                      const count = pipeline.byStatus?.[key] || 0;
                      const pct = pipeline.totalLeadsInPipeline > 0 ? (count / pipeline.totalLeadsInPipeline) * 100 : 0;
                      return (
                        <div key={key} className="d-flex align-items-center gap-2">
                          <span className="text-muted" style={{ fontSize: 12, width: 110 }}>{key}</span>
                          <div className="pipeline-bar-track">
                            <div className="pipeline-bar-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <span className="text-muted" style={{ fontSize: 12, width: 20, textAlign: "right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}