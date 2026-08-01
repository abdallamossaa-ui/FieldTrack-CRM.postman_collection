// Small shared helper used by every page.
// Since the frontend is served by the same Express server as the API,
// we can just call relative paths like "/api/customers".

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('crm_token');
}

function getUser() {
  const raw = localStorage.getItem('crm_user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('crm_token', token);
  localStorage.setItem('crm_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_user');
}

// Redirect to login if there's no token. Call this at the top of every
// protected page.
function requireLogin() {
  if (!getToken()) {
    window.location.href = '/index.html';
  }
}

async function apiRequest(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (res.status === 401) {
    clearSession();
    window.location.href = '/index.html';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
  del: (path) => apiRequest('DELETE', path)
};

// ---------- Toasts ----------
function showToast(message, type = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function logout() {
  clearSession();
  window.location.href = '/index.html';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(isoString) {
  if (!isoString) return 'Never';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

function statusBadgeClass(status) {
  const map = {
    'New': 'badge-new',
    'Interested': 'badge-interested',
    'Follow-up': 'badge-followup',
    'Closed': 'badge-closed',
    'Lost': 'badge-lost'
  };
  return map[status] || 'badge-new';
}
