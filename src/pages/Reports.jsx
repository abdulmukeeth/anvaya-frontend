import { useEffect, useState, useRef } from "react";
import {
  getLastWeekReport, getPipelineReport,
  getClosedByAgentReport, getStatusDistributionReport,
} from "../services/api";
import {
  Chart, BarElement, BarController, ArcElement, DoughnutController,
  CategoryScale, LinearScale, Tooltip, Legend,
} from "chart.js";

Chart.register(BarElement, BarController, ArcElement, DoughnutController, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#6b7280", "#ec4899"];

const BAR_OPTIONS = {
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: "#1e1e2e", titleColor: "#fff", bodyColor: "#aaa" },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f1f5f9" } },
    x: { grid: { display: false } },
  },
};

function buildChart(canvasRef, config) {
  if (!canvasRef.current) return null;
  const existing = Chart.getChart(canvasRef.current);
  if (existing) existing.destroy();
  return new Chart(canvasRef.current, config);
}

export default function Reports() {
  const [lastWeek, setLastWeek]           = useState([]);
  const [pipeline, setPipeline]           = useState(null);
  const [closedByAgent, setClosedByAgent] = useState([]);
  const [statusDist, setStatusDist]       = useState([]);
  const [loading, setLoading]             = useState(true);

  const pipelineRef = useRef(null);
  const agentRef    = useRef(null);
  const distRef     = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      getLastWeekReport(),
      getPipelineReport(),
      getClosedByAgentReport(),
      getStatusDistributionReport(),
    ]).then(([lw, pl, cba, sd]) => {
      setLastWeek(lw);
      setPipeline(pl);
      setClosedByAgent(cba);
      setStatusDist(sd);
    }).finally(() => setLoading(false));
  }, []);

  // Build charts after data loads, rebuilds every time data changes
  useEffect(() => {
    if (loading) return;

    if (pipelineRef.current && pipeline && Object.keys(pipeline.byStatus || {}).length > 0) {
      const labels = Object.keys(pipeline.byStatus);
      buildChart(pipelineRef, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            data: labels.map(k => pipeline.byStatus[k]),
            backgroundColor: PALETTE,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: BAR_OPTIONS,
      });
    }

    if (agentRef.current && closedByAgent.length > 0) {
      buildChart(agentRef, {
        type: "bar",
        data: {
          labels: closedByAgent.map(r => r.agentName),
          datasets: [{
            data: closedByAgent.map(r => r.count),
            backgroundColor: PALETTE,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: BAR_OPTIONS,
      });
    }

    if (distRef.current && statusDist.length > 0) {
      buildChart(distRef, {
        type: "doughnut",
        data: {
          labels: statusDist.map(r => r._id),
          datasets: [{
            data: statusDist.map(r => r.count),
            backgroundColor: PALETTE,
            borderWidth: 0,
            hoverOffset: 6,
          }],
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { padding: 16, boxWidth: 12 },
            },
          },
          cutout: "68%",
        },
      });
    }
  }, [loading, pipeline, closedByAgent, statusDist]);

  if (loading) return <div className="page-loading">Loading reports…</div>;

  const totalLeads = statusDist.reduce((acc, r) => acc + r.count, 0);

  const kpis = [
    { label: "Active in Pipeline", value: pipeline?.totalLeadsInPipeline || 0, color: "#6366f1", bg: "#eef2ff" },
    { label: "Closed Last Week",   value: lastWeek.length,                      color: "#10b981", bg: "#ecfdf5" },
    { label: "Total Leads",        value: totalLeads,                            color: "#f59e0b", bg: "#fffbeb" },
  ];

  const hasPipeline    = Object.keys(pipeline?.byStatus || {}).length > 0;
  const hasAgentData   = closedByAgent.length > 0;
  const hasStatusDist  = statusDist.length > 0;

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h4 className="fw-semibold mb-1">Reports</h4>
        <p className="text-muted small mb-0">Sales performance and pipeline analytics</p>
      </div>

      <div className="row g-3 mb-4">
        {kpis.map(({ label, value, color, bg }) => (
          <div className="col-md-4" key={label}>
            <div className="card border-0 shadow-sm" style={{ background: bg, borderLeft: `3px solid ${color}` }}>
              <div className="card-body py-3 px-3">
                <div className="stat-count" style={{ color }}>{value}</div>
                <div className="text-muted" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Pipeline by Status</span>
              <p className="text-muted small mb-0">Active leads across all stages</p>
            </div>
            <div className="card-body d-flex align-items-center">
              {!hasPipeline
                ? <p className="text-muted small mb-0">No active leads in the pipeline yet.</p>
                : <div className="chart-wrap w-100"><canvas ref={pipelineRef} /></div>
              }
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Status Distribution</span>
              <p className="text-muted small mb-0">All leads by current stage</p>
            </div>
            <div className="card-body d-flex align-items-center">
              {!hasStatusDist
                ? <p className="text-muted small mb-0">No leads yet. Create some leads to see this chart.</p>
                : <div className="chart-wrap chart-wrap--doughnut w-100"><canvas ref={distRef} /></div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Closed by Agent</span>
              <p className="text-muted small mb-0">Total leads closed per sales agent</p>
            </div>
            <div className="card-body d-flex align-items-center">
              {!hasAgentData
                ? <p className="text-muted small mb-0">No closed leads yet. Close a lead to see agent performance.</p>
                : <div className="chart-wrap w-100"><canvas ref={agentRef} /></div>
              }
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <span className="fw-semibold" style={{ fontSize: 14 }}>Closed Last Week</span>
              <p className="text-muted small mb-0">
                {lastWeek.length} lead{lastWeek.length !== 1 ? "s" : ""} closed in the past 7 days
              </p>
            </div>
            <div className="card-body p-0">
              {lastWeek.length === 0 ? (
                <p className="text-muted small p-3 mb-0">No leads closed in the last 7 days.</p>
              ) : lastWeek.map(l => (
                <div key={l.id} className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                  <span className="fw-medium" style={{ fontSize: 13 }}>{l.name}</span>
                  <div className="d-flex gap-3">
                    <span className="text-muted" style={{ fontSize: 12 }}>{l.salesAgent}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>{new Date(l.closedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}