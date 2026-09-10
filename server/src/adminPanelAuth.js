import { timingSafeEqual } from 'crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SCOPE = 'admin_panel';
const CREDENTIAL_ROW_ID = 1;

function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET?.trim() ?? '';
}

function safeEqualString(a, b) {
  const x = Buffer.from(a, 'utf8');
  const y = Buffer.from(b, 'utf8');
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/**
 * @param {import('knex').Knex} db
 * @param {string} login
 * @param {string} password
 * @returns {Promise<{ ok: true, token: string, expiresIn: string } | { ok: false, error: string }>}
 */
export async function adminPanelLogin(db, login, password) {
  const l = typeof login === 'string' ? login.trim() : '';
  const p = typeof password === 'string' ? password : '';
  if (!l || !p) {
    return { ok: false, error: 'Укажите логин и пароль' };
  }

  let row;
  try {
    row = await db('admin_panel_credentials').where({ id: CREDENTIAL_ROW_ID }).first();
  } catch {
    return { ok: false, error: 'Ошибка базы данных при проверке учётных данных' };
  }

  if (!row?.login || !row?.password_hash) {
    return {
      ok: false,
      error:
        'Учётная запись администратора не настроена. Запустите: node server/scripts/set-admin-credentials.mjs <логин> <пароль>',
    };
  }

  if (!safeEqualString(l, row.login)) {
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(p, row.password_hash);
  } catch {
    passwordOk = false;
  }

  if (!passwordOk) {
    return { ok: false, error: 'Неверный логин или пароль' };
  }

  const secret = getJwtSecret();
  if (!secret || secret.length < 16) {
    return { ok: false, error: 'На сервере не задан ADMIN_JWT_SECRET (мин. 16 символов)' };
  }

  const expiresIn = process.env.ADMIN_JWT_EXPIRES ?? '12h';
  const token = jwt.sign({ scope: JWT_SCOPE, sub: row.login }, secret, { expiresIn });
  return { ok: true, token, expiresIn };
}

export function createAdminPanelJwtMiddleware() {
  return function requireAdminPanelJwt(req, res, next) {
    const secret = getJwtSecret();
    if (!secret || secret.length < 16) {
      return res.status(503).json({ error: 'ADMIN_JWT_SECRET is not configured' });
    }
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
    if (!token) {
      return res.status(401).json({ error: 'Нет доступа: войдите в админку' });
    }
    try {
      const payload = jwt.verify(token, secret);
      if (payload.scope !== JWT_SCOPE) {
        return res.status(401).json({ error: 'Недействительный токен' });
      }
      req.adminPanelLogin = typeof payload.sub === 'string' ? payload.sub : '';
      return next();
    } catch {
      return res.status(401).json({ error: 'Сессия истекла — войдите снова' });
    }
  };
}
