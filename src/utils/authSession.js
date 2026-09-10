import { DEFAULT_LOGIN_ROLE, isUserRole, USER_ROLE } from '../constants/userRoles.js';

const STORAGE_KEY = 'qoldau_session';

/**
 * @typedef {{ phone: string, role: import('../constants/userRoles.js').UserRole }} AuthSession
 */

/**
 * @returns {AuthSession|null}
 */
export function readAuthSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = sessionStorage.getItem('qoldau_auth_phone');
      if (legacy?.trim()) {
        const phone = legacy.trim();
        writeAuthSession({ phone, role: DEFAULT_LOGIN_ROLE });
        return { phone, role: DEFAULT_LOGIN_ROLE };
      }
      return null;
    }
    const data = JSON.parse(raw);
    if (!data || typeof data.phone !== 'string' || !isUserRole(data.role)) return null;
    return { phone: data.phone, role: data.role };
  } catch {
    return null;
  }
}

/**
 * @param {{ phone: string, role?: import('../constants/userRoles.js').UserRole }} payload
 */
export function writeAuthSession({ phone, role = DEFAULT_LOGIN_ROLE }) {
  const safeRole = isUserRole(role) ? role : DEFAULT_LOGIN_ROLE;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phone, role: safeRole }));
  } catch {
    /* ignore */
  }
}

export function clearAuthSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('qoldau_auth_phone');
  } catch {
    /* ignore */
  }
}

/** Для будущего: обновить роль без повторного входа (например, после активации партнёра). */
export function updateSessionRole(role) {
  const cur = readAuthSession();
  if (!cur || !isUserRole(role)) return;
  writeAuthSession({ phone: cur.phone, role });
}

export { USER_ROLE };
