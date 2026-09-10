/**
 * Роли пользователей (согласовано с фронтом).
 * Проверка прав в админ-/партнёр-API по JWT или сессии.
 */
export const USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  PARTNER: 'partner',
  CLIENT: 'client',
});

export const USER_ROLES = Object.freeze(['admin', 'partner', 'client']);

export function isUserRole(value) {
  return typeof value === 'string' && USER_ROLES.includes(value);
}
