const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function request(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  return data;
}

export function chatWithAgent(payload) {
  return request("/api/agent/chat", payload);
}

export function generateText(payload) {
  return request("/api/generate/text", payload);
}

export function generateImage(payload) {
  return request("/api/generate/image", payload);
}

export function generateVideo(payload) {
  return request("/api/generate/video", payload);
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}
