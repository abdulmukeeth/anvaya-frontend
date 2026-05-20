// anvaya-frontend/src/pages/AddLead.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createLead, getAgents } from "../services/api";

const SOURCES     = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];
const STATUSES    = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const PRIORITIES  = ["High", "Medium", "Low"];
const AVAILABLE_TAGS = ["High Value", "Follow-up", "Urgent", "Long-term", "Referral", "Hot Lead"];

export default function AddLead() {
  const [form, setForm] = useState({ name: "", source: "Website", salesAgent: "", status: "New", timeToClose: "", priority: "Medium", tags: [] });
  const [agents, setAgents]   = useState([]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { getAgents().then(setAgents); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTag = (tag) => setForm(f => ({
    ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await createLead({ ...form, timeToClose: Number(form.timeToClose) });
      navigate("/leads");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-fluid p-4">
      <Link to="/leads" className="back-link">← Back to Leads</Link>
      <h4 className="fw-semibold mb-4">New Lead</h4>

      <div className="card border shadow-sm" style={{ maxWidth: 700 }}>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-semibold small text-uppercase text-muted">Lead Name *</label>
              <input name="name" className="form-control" placeholder="e.g. Acme Corp" onChange={handleChange} required />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-uppercase text-muted">Source *</label>
                <select name="source" className="form-select" onChange={handleChange} defaultValue="Website">
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-uppercase text-muted">Sales Agent *</label>
                <select name="salesAgent" className="form-select" onChange={handleChange} required>
                  <option value="">Select Agent</option>
                  {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold small text-uppercase text-muted">Status</label>
                <select name="status" className="form-select" onChange={handleChange} defaultValue="New">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small text-uppercase text-muted">Priority</label>
                <select name="priority" className="form-select" onChange={handleChange} defaultValue="Medium">
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small text-uppercase text-muted">Days to Close *</label>
                <input name="timeToClose" type="number" min="1" className="form-control" placeholder="30" onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small text-uppercase text-muted">Tags</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {AVAILABLE_TAGS.map(tag => (
                  <button key={tag} type="button" className={`tag-chip ${form.tags.includes(tag) ? "tag-chip--selected" : ""}`} onClick={() => toggleTag(tag)}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <Link to="/leads" className="btn btn-outline-secondary">Cancel</Link>
              <button type="submit" className="btn btn-dark" disabled={loading}>
                {loading ? "Creating…" : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}