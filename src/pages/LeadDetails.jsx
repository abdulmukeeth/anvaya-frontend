// anvaya-frontend/src/pages/LeadDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getLeadById, getComments, addComment, deleteLead, updateLead, getAgents } from "../services/api";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const PRIORITIES = ["High", "Medium", "Low"];
const SOURCES = ["Website", "Referral", "Cold Call", "Advertisement", "Email", "Other"];
const AVAILABLE_TAGS = ["High Value", "Follow-up", "Urgent", "Long-term", "Referral", "Hot Lead"];

const STATUS_COLOR = { New: "#6366f1", Contacted: "#f59e0b", Qualified: "#10b981", "Proposal Sent": "#3b82f6", Closed: "#6b7280" };
const STATUS_BG    = { New: "#eef2ff", Contacted: "#fffbeb", Qualified: "#ecfdf5", "Proposal Sent": "#eff6ff", Closed: "#f9fafb" };
const PRIORITY_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead]       = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents]   = useState([]);
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const loadData = async () => {
    const [leadData, commentData, agentData] = await Promise.all([
      getLeadById(id), getComments(id), getAgents()
    ]);
    setLead(leadData);
    setComments(commentData);
    setAgents(agentData);
    setEditForm({
      name: leadData.name, source: leadData.source,
      salesAgent: leadData.salesAgent?._id || "",
      status: leadData.status, priority: leadData.priority,
      timeToClose: leadData.timeToClose, tags: leadData.tags || [],
    });
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData().finally(() => setLoading(false)); }, [id]);

  const handleComment = async () => {
    if (!text.trim()) return;
    try {
      await addComment(id, { author: lead?.salesAgent?._id, commentText: text });
      setText("");
      setComments(await getComments(id));
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    await deleteLead(id);
    navigate("/leads");
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const updated = await updateLead(id, { ...editForm, timeToClose: Number(editForm.timeToClose) });
      setLead(updated); setEditing(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const toggleTag = (tag) => setEditForm(f => ({
    ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }));

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!lead)   return <div className="page-loading">Lead not found.</div>;

  return (
    <div className="container-fluid p-4">
      <Link to="/leads" className="back-link">← Back to Leads</Link>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h4 className="fw-semibold mb-0">{lead.name}</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      <div className="row g-3">
        {/* Lead details card */}
        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Lead Details</span>
            </div>
            <div className="card-body">
              {!editing ? (
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    {[
                      ["Status", <span className="badge rounded-pill px-2" style={{ background: STATUS_BG[lead.status], color: STATUS_COLOR[lead.status], fontSize: 11, border: `1px solid ${STATUS_COLOR[lead.status]}40` }}>{lead.status}</span>],
                      ["Sales Agent", lead.salesAgent?.name || "—"],
                      ["Source", lead.source],
                      ["Priority", <span style={{ color: PRIORITY_COLOR[lead.priority], fontWeight: 600 }}>{lead.priority}</span>],
                      ["Days to Close", `${lead.timeToClose} days`],
                      ["Tags", lead.tags?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">{lead.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}</div>
                      ) : <span className="text-muted">—</span>],
                      ...(lead.closedAt ? [["Closed At", new Date(lead.closedAt).toLocaleDateString()]] : []),
                    ].map(([label, value]) => (
                      <tr key={label} className="border-bottom">
                        <td className="text-muted fw-medium" style={{ width: 130 }}>{label}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Lead Name</label>
                    <input className="form-control form-control-sm" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Status</label>
                      <select className="form-select form-select-sm" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Priority</label>
                      <select className="form-select form-select-sm" value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                        {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Source</label>
                      <select className="form-select form-select-sm" value={editForm.source} onChange={e => setEditForm({ ...editForm, source: e.target.value })}>
                        {SOURCES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Sales Agent</label>
                      <select className="form-select form-select-sm" value={editForm.salesAgent} onChange={e => setEditForm({ ...editForm, salesAgent: e.target.value })}>
                        {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Days to Close</label>
                      <input type="number" className="form-control form-control-sm" value={editForm.timeToClose} onChange={e => setEditForm({ ...editForm, timeToClose: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Tags</label>
                    <div className="d-flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map(tag => (
                        <button key={tag} type="button" className={`tag-chip ${editForm.tags?.includes(tag) ? "tag-chip--selected" : ""}`} onClick={() => toggleTag(tag)}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-dark btn-sm" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments card */}
        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Comments</span>
              <span className="badge bg-secondary rounded-pill">{comments.length}</span>
            </div>
            <div className="card-body d-flex flex-column gap-3">
              <div className="comments-list d-flex flex-column gap-2">
                {comments.length === 0 && (
                  <p className="text-muted small">No comments yet. Add the first one below.</p>
                )}
                {comments.map(c => (
                  <div key={c._id} className="bg-light rounded p-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold" style={{ fontSize: 12 }}>{c.author?.name || "Unknown"}</span>
                      <span className="text-muted" style={{ fontSize: 11 }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mb-0 text-muted" style={{ fontSize: 13 }}>{c.commentText}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="form-control form-control-sm mb-2"
                  placeholder="Add a comment or update…"
                  rows={3}
                />
                <button onClick={handleComment} className="btn btn-dark btn-sm w-100" disabled={!text.trim()}>
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}