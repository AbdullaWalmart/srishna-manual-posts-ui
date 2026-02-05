/**
 * API client for Srishna backend.
 * Dev: Vite proxy /api -> backend. Prod: use VITE_API_URL (must end with /api).
 */
const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '/api';

function headers(includeAuth = false, token = null) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function parseJson(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error('Server returned non-JSON (check API URL).');
  }
  return res.json().catch(() => ({}));
}

async function handleResponse(res) {
  const data = await parseJson(res);

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  if (data && data.error) {
    const err = new Error(data.error);
    err.data = data;
    throw err;
  }
  return data;
}

// --- Auth ---

export async function login(email, password) {
  const params = new URLSearchParams({ email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const data = await parseJson(res).catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Invalid email or password');
  }
  return data;
}

export async function signup(email, password, name) {
  const params = new URLSearchParams({ email, password });
  if (name) params.set('name', name);
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const data = await handleResponse(res);
  return data;
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: headers(true, token)
  });
  const data = await parseJson(res).catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Unauthorized');
  if (!data || !data.id) throw new Error('Not authenticated');
  return data;
}

export async function forgotPassword(email) {
  const params = new URLSearchParams({ email });
  const res = await fetch(`${API_BASE}/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  return handleResponse(res);
}

export async function resetPassword(token, newPassword) {
  const params = new URLSearchParams({ token, newPassword });
  const res = await fetch(`${API_BASE}/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  return handleResponse(res);
}

// --- Posts ---

/** All posts (active + inactive) for admin list. */
export async function fetchAllPosts() {
  const res = await fetch(`${API_BASE}/posts/admin/list`);
  if (!res.ok) throw new Error('Failed to load posts');
  return res.json();
}

export async function setPostActive(postId, active) {
  const res = await fetch(`${API_BASE}/posts/${postId}/active?active=${active}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update post');
  return parseJson(res);
}

export async function deletePost(postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete post');
}

export async function createPost(file, text, token) {
  const form = new FormData();
  form.append('image', file);
  if (text != null && text !== '') form.append('text', text);

  const h = {};
  if (token) h['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: h,
    body: form
  });
  const data = await handleResponse(res);
  return data;
}
