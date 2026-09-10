/**
 * @param {string} phone
 * @param {RequestInit} [init]
 */
export function partnerFetch(phone, path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('X-User-Phone', phone);
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(path, { ...init, headers });
}
