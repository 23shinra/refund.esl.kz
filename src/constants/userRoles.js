/**
 * Роли в системе Refund.
 * Назначение роли после входа — с бэкенда (JWT / ответ verify SMS).
 */
export const USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  PARTNER: 'partner',
  CLIENT: 'client',
});

export const USER_ROLES = Object.freeze([USER_ROLE.ADMIN, USER_ROLE.PARTNER, USER_ROLE.CLIENT]);

/**
 * @typedef {'admin'|'partner'|'client'} UserRole
 */

export function isUserRole(value) {
  return typeof value === 'string' && USER_ROLES.includes(/** @type {UserRole} */ (value));
}

/** Роль по умолчанию при входе по SMS, пока API не вернёт фактическую. */
export const DEFAULT_LOGIN_ROLE = USER_ROLE.CLIENT;
