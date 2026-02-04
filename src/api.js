const API = import.meta.env.VITE_API_URL || '/api';

function authHeaders(token) {
  const h = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// —— Auth ——
export async function login(email, password) {
  const params = new URLSearchParams({ email, password });
  const res = await fetch(`${API}/auth/login?${params}`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

export async function signup(email, password, name) {
  const params = new URLSearchParams({ email, password });
  if (name) params.set('name', name);
  const res = await fetch(`${API}/auth/signup?${params}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Signup failed');
  }
  return res.json();
}

export async function forgotPassword(email) {
  const params = new URLSearchParams({ email });
  const res = await fetch(`${API}/auth/forgot?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function resetPassword(token, newPassword) {
  const params = new URLSearchParams({ token, newPassword });
  const res = await fetch(`${API}/auth/reset?${params}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Reset failed');
  }
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API}/auth/me`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// —— Posts ——
/** Upload a new post (image + optional text). */
export async function createPost(imageFile, text, token) {
  const form = new FormData();
  form.append('image', imageFile);
  if (text) form.append('text', text);
  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

/** All posts (active + inactive) for admin grid. */
export async function fetchAllPosts() {
  const res = await fetch(`${API}/posts/all`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

/** Public list: active posts only. */
export async function fetchPostsList() {
  const res = await fetch(`${API}/posts/list`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

/** Set post active or inactive. */
export async function setPostActive(postId, active) {
  const res = await fetch(`${API}/posts/${postId}/active?active=${active}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
}

/** Permanently delete a post. */
export async function deletePost(postId) {
  const res = await fetch(`${API}/posts/${postId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
}
