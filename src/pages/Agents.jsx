// anvaya-frontend/src/pages/Agents.jsx
import { useEffect, useState } from "react";
import { getAgents, createAgent } from "../services/api";

export default function Agents() {
  const [agents, setAgents]     = useState([]);
  const [form, setForm]         = useState({ name: "", email: "" });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => getAgents().then(setAgents).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await createAgent(form);
      setForm({ name: "", email: "" });
      setShowForm(false);
      load();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Sales Agents</h4>
          <p className="text-muted small mb-0">{agents.length} agents in your team</p>
        </div>
        <button className="btn btn-dark btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Agent"}
        </button>
      </div>

      {showForm && (
        <div className="card border shadow-sm mb-4" style={{ maxWidth: 600 }}>
          <div className="card-body p-4">
            <h6 className="fw-semibold mb-3">New Sales Agent</h6>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Agent Name *</label>
                  <input className="form-control" placeholder="Jane Smith" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Email Address *</label>
                  <input type="email" className="form-control" placeholder="jane@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-dark btn-sm" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading agents…</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No agents yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="row g-3">
          {agents.map(agent => (
            <div key={agent._id} className="col-md-4 col-lg-3">
              <div className="card border shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div className="agent-avatar">
                    {agent.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: 14 }}>{agent.name}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: 12 }}>{agent.email}</div>
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      Since {new Date(agent.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}