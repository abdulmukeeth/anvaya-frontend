import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createLead, getAgents } from "../services/api";

const SOURCES     = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];
const STATUSES    = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const PRIORITIES  = ["High", "Medium", "Low"];
const AVAILABLE_TAGS = ["High Value", "Follow-up", "Urgent", "Long-term", "Referral", "Hot Lead"];

const TIPS = [
  { icon: <i className="bi bi-person-fill"></i>, title: "Assign an agent", body: "Every lead needs an owner. Assign a sales agent so someone is accountable for follow-up." },
  { icon: <i className="bi bi-clock-fill"></i>, title: "Set realistic timelines", body: "Days to Close helps track urgency. Be honest — overdue leads clutter your pipeline." },
  { icon: <i className="bi bi-tag-fill"></i>, title: "Use tags wisely", body: "Tags like 'High Value' or 'Follow-up' make filtering your lead list much faster." },
  { icon: <i className="bi bi-bar-chart-fill"></i>, title: "Priority matters", body: "High priority leads surface first in reports. Reserve it for leads with real urgency." },
];

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
    setError(""); 
    const trimmedName = form.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Lead name must be at least 2 characters.");
      return;
    }
    if (!form.salesAgent) {
      setError("Please select a sales agent.");
      return;
    }
    setLoading(true);
    try {
      await createLead({ ...form, name: trimmedName, timeToClose: Number(form.timeToClose) });
      navigate("/leads");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container-fluid p-4">
      <Link to="/leads" className="back-link">← Back to Leads</Link>
      <h4 className="fw-semibold mb-4">New Lead</h4>

      <div className="row g-4">
        {/* Left: form */}
        <div className="col-lg-7">
          <div className="card border shadow-sm">
            <div className="card-body p-4">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Lead Name *</label>
                  <input name="name" className="form-control" placeholder="e.g. Acme Corp" minLength={2} onChange={handleChange} required />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Source *</label>
                    <select name="source" className="form-select" onChange={handleChange} defaultValue="Website">
                      {SOURCES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Sales Agent *</label>
                    <select name="salesAgent" className="form-select" onChange={handleChange} required>
                      <option value="">Select Agent</option>
                      {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Status</label>
                    <select name="status" className="form-select" onChange={handleChange} defaultValue="New">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Priority</label>
                    <select name="priority" className="form-select" onChange={handleChange} defaultValue="Medium">
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-semibold small text-uppercase text-muted">Days to Close *</label>
                    <input name="timeToClose" type="number" min="1" className="form-control" placeholder="30" onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-uppercase text-muted">Tags</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {AVAILABLE_TAGS.map(tag => (
                      <button key={tag} type="button"
                        className={`tag-chip ${form.tags.includes(tag) ? "tag-chip--selected" : ""}`}
                        onClick={() => toggleTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end border-top pt-3">
                  <Link to="/leads" className="btn btn-outline-secondary">Cancel</Link>
                  <button type="submit" className="btn btn-dark" disabled={loading}>
                    {loading ? "Creating…" : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: tips panel */}
        <div className="col-lg-5">
          <div className="card border shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Tips for a great lead</span>
            </div>
            <div className="card-body p-0">
              {TIPS.map((tip, i) => (
                <div key={i} className="d-flex gap-3 p-3 border-bottom" style={{ borderBottom: i === TIPS.length - 1 ? "none" : undefined }}>
                  <span style={{ fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>{tip.icon}</span>
                  <div>
                    <div className="fw-semibold mb-1" style={{ fontSize: 13 }}>{tip.title}</div>
                    <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>{tip.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border shadow-sm mt-3">
            <div className="card-body p-3">
              <div className="text-muted small mb-2 fw-semibold text-uppercase" style={{ fontSize: 11, letterSpacing: "0.5px" }}>Lead statuses</div>
              {[
                { s: "New", desc: "Just added, not yet contacted" },
                { s: "Contacted", desc: "Reached out, awaiting reply" },
                { s: "Qualified", desc: "Confirmed interest or fit" },
                { s: "Proposal Sent", desc: "Quote or proposal delivered" },
                { s: "Closed", desc: "Deal won or lost" },
              ].map(({ s, desc }) => (
                <div key={s} className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-medium" style={{ fontSize: 12, width: 110, flexShrink: 0 }}>{s}</span>
                  <span className="text-muted" style={{ fontSize: 12 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}