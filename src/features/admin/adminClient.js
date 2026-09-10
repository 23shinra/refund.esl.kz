import { ADMIN_API, ADMIN_PANEL_TOKEN_KEY } from './constants.js';

/**
 * @param {string | null} token
 */
export function buildAdminHeaders(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function readAdminToken() {
  try {
    return sessionStorage.getItem(ADMIN_PANEL_TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function writeAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(ADMIN_PANEL_TOKEN_KEY, token);
    else sessionStorage.removeItem(ADMIN_PANEL_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} login
 * @param {string} password
 */
export async function adminLoginRequest(login, password) {
  const res = await fetch(ADMIN_API.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: login.trim(), password }),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}
