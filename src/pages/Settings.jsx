import { useEffect, useState } from "react";
import { getLeads, deleteLead, getAgents, deleteAgent } from "../services/api";

function ConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
          zIndex: 1000,
        }}
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: 12,
          padding: "28px 28px 24px",
          width: "min(420px, 90vw)",
          zIndex: 1001,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#fef2f2", display: "flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 20 }}><i className="bi bi-trash3-fill"></i></span>
        </div>

        <h6 className="fw-semibold mb-1" style={{ fontSize: 15 }}>
          Delete {item.type === "lead" ? "Lead" : "Agent"}
        </h6>
        <p className="text-muted mb-4" style={{ fontSize: 13, lineHeight: 1.6 }}>
          Are you sure you want to delete{" "}
          <span className="fw-semibold text-dark">"{item.name}"</span>?
          {item.type === "agent" && (
            <> Their leads will remain but become unassigned.</>
          )}
          {" "}This cannot be undone.
        </p>

        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-outline-secondary btn-sm px-4"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger btn-sm px-4"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function Settings() {
  const [leads, setLeads]     = useState([]);
  const [agents, setAgents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState("");
  const [pending, setPending] = useState(null); // { type, _id, name }

  const load = () =>
    Promise.all([getLeads(), getAgents()])
      .then(([l, a]) => { setLeads(l); setAgents(a); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      if (pending.type === "lead") {
        await deleteLead(pending._id);
      } else {
        await deleteAgent(pending._id);
      }
      flash(`"${pending.name}" deleted.`);
      load();
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setPending(null);
    }
  };

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="container-fluid p-4" style={{ maxWidth: 860 }}>
      <ConfirmModal
        item={pending}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Settings</h4>
        <p className="text-muted small mb-0">Manage and delete leads and agents</p>
      </div>

      {msg && <div className="alert alert-success py-2 small mb-3">{msg}</div>}

      <div className="card border shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <span className="fw-semibold" style={{ fontSize: 14 }}>All Leads</span>
          <span className="text-muted small ms-2">({leads.length})</span>
        </div>
        {leads.length === 0 ? (
          <div className="p-4 text-muted small">No leads yet.</div>
        ) : leads.map(lead => (
          <div key={lead._id} className="danger-item">
            <div>
              <div className="fw-medium" style={{ fontSize: 13 }}>{lead.name}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                {lead.status} · {lead.salesAgent?.name || "Unassigned"} · {lead.source}
              </div>
            </div>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => setPending({ type: "lead", _id: lead._id, name: lead.name })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="card border shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <span className="fw-semibold" style={{ fontSize: 14 }}>All Agents</span>
          <span className="text-muted small ms-2">({agents.length})</span>
        </div>
        {agents.length === 0 ? (
          <div className="p-4 text-muted small">No agents yet.</div>
        ) : agents.map(agent => (
          <div key={agent._id} className="danger-item">
            <div className="d-flex align-items-center gap-3">
              <div className="agent-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                {agent.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="fw-medium" style={{ fontSize: 13 }}>{agent.name}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>{agent.email}</div>
              </div>
            </div>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => setPending({ type: "agent", _id: agent._id, name: agent.name })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}