import { useEffect, useState } from "react";
import { getAgents, createAgent } from "../services/api";

export default function Agents() {
  const [agents, setAgents]         = useState([]);
  const [form, setForm]             = useState({ name: "", email: "" });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm]     = useState(false);

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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Sales Agents</h4>
          <p className="text-muted small mb-0">{agents.length} agent{agents.length !== 1 ? "s" : ""} in your team</p>
        </div>
        <button className="btn btn-dark btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Agent"}
        </button>
      </div>

      <div className="row g-4">
        {showForm && (
          <div className="col-lg-6">
            <div className="card border shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <span className="fw-semibold" style={{ fontSize: 14 }}>New Sales Agent</span>
              </div>
              <div className="card-body p-4">
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Agent Name *</label>
                    <input className="form-control" placeholder="Jane Smith" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Email Address *</label>
                    <input type="email" className="form-control" placeholder="jane@example.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="d-flex gap-2 justify-content-end border-top pt-3">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-dark btn-sm" disabled={submitting}>
                      {submitting ? "Creating…" : "Create Agent"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card border shadow-sm mt-3">
              <div className="card-body p-3">
                <div className="text-muted fw-semibold text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: "0.5px" }}>About agents</div>
                <p className="text-muted mb-2" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Sales agents are the people responsible for managing and closing leads. Each lead must be assigned to one agent.
                </p>
                <p className="text-muted mb-0" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Agent email addresses must be unique — they act as a login identifier.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={showForm ? "col-lg-6" : "col-lg-6"}>
          {loading ? (
            <div className="page-loading">Loading agents…</div>
          ) : agents.length === 0 && !showForm ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-2">No agents yet.</p>
              <button className="btn btn-dark btn-sm" onClick={() => setShowForm(true)}>+ Add your first agent</button>
            </div>
          ) : (
            <div className="row g-3">
              {agents.map(agent => (
                <div key={agent._id} className="col-md-6 col-xl-4">
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
      </div>
    </div>
  );
}