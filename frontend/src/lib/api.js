const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

/**
 * Normalizes HTTP response errors into a consistent structure: { status, message }.
 * Reads JSON detail or message field from backend error responses.
 */
async function handleResponse(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Response had no JSON body
  }

  if (!response.ok) {
    const message = body?.detail || body?.message || response.statusText || 'An unexpected error occurred';
    const error = new Error(message);
    error.status = response.status;
    error.message = message;
    error.data = body;
    throw error;
  }

  return body;
}

/**
 * GET /events/{eventId}
 */
export async function getEvent(eventId) {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(res);
}

/**
 * POST /events/{eventId}/claim
 * Payload: { name, device_token }
 */
export async function claimCertificate(eventId, { name, device_token }) {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ name, device_token }),
  });
  return handleResponse(res);
}

/**
 * GET /events/{eventId}/registrations
 */
export async function getRegistrations(eventId) {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}/registrations`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  return handleResponse(res);
}

/**
 * Gets or generates a persistent device token from localStorage.
 */
export function getDeviceToken() {
  let token = localStorage.getItem('device_token');
  if (!token) {
    token = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'device-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('device_token', token);
  }
  return token;
}
