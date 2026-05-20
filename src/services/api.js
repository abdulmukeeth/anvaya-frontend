// anvaya-frontend/src/services/api.js
const BASE_URL = "http://localhost:3000";

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
};

// LEADS
export const getLeads = async (query = "") => {
  const res = await fetch(`${BASE_URL}/leads${query}`);
  return handleResponse(res);
};

export const getLeadById = async (id) => {
  const res = await fetch(`${BASE_URL}/leads/${id}`);
  return handleResponse(res);
};

export const createLead = async (data) => {
  const res = await fetch(`${BASE_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateLead = async (id, data) => {
  const res = await fetch(`${BASE_URL}/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteLead = async (id) => {
  const res = await fetch(`${BASE_URL}/leads/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

// AGENTS
export const getAgents = async () => {
  const res = await fetch(`${BASE_URL}/agents`);
  return handleResponse(res);
};

export const createAgent = async (data) => {
  const res = await fetch(`${BASE_URL}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// COMMENTS
export const getComments = async (id) => {
  const res = await fetch(`${BASE_URL}/leads/${id}/comments`);
  return handleResponse(res);
};

export const addComment = async (id, data) => {
  const res = await fetch(`${BASE_URL}/leads/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// REPORTS
export const getLastWeekReport = async () => {
  const res = await fetch(`${BASE_URL}/report/last-week`);
  return handleResponse(res);
};

export const getPipelineReport = async () => {
  const res = await fetch(`${BASE_URL}/report/pipeline`);
  return handleResponse(res);
};

export const getClosedByAgentReport = async () => {
  const res = await fetch(`${BASE_URL}/report/closed-by-agent`);
  return handleResponse(res);
};

export const getStatusDistributionReport = async () => {
  const res = await fetch(`${BASE_URL}/report/status-distribution`);
  return handleResponse(res);
};