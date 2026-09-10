import bcrypt from 'bcryptjs';
import express from 'express';
import { isUserRole, USER_ROLES } from '../constants/userRoles.js';
import { adminPanelLogin, createAdminPanelJwtMiddleware } from '../adminPanelAuth.js';
import { seedCatalog } from '../seed.js';
import { registerAdminCatalogRoutes } from './adminCatalog.js';

const CREDENTIAL_ROW_ID = 1;
const MIN_PASSWORD_LENGTH = 8;
const MIN_LOGIN_LENGTH = 3;

export function adminRouter(db) {
  const r = express.Router();

  r.post('/admin/auth/login', async (req, res) => {
    try {
      const result = await adminPanelLogin(db, req.body?.login ?? '', req.body?.password ?? '');
      if (!result.ok) {
        const msg = result.error ?? 'Ошибка';
        const status =
          /не задан|ADMIN_JWT|Пароль админки/i.test(msg) || msg.includes('ADMIN_PANEL') ? 503 : 401;
        return res.status(status).json({ error: msg });
      }
      return res.json({ token: result.token, expiresIn: result.expiresIn });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  const needAdmin = createAdminPanelJwtMiddleware();
  registerAdminCatalogRoutes(r, db, needAdmin);

  r.post('/admin/seed', needAdmin, async (req, res) => {
    try {
      const result = await seedCatalog(db, { force: true });
      return res.json(result);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Seed failed' });
    }
  });

  r.get('/admin/users', needAdmin, async (_req, res) => {
    try {
      const users = await db('users')
        .select('id', 'phone', 'role', 'created_at', 'updated_at')
        .orderBy('updated_at', 'desc');
      return res.json({ users });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.patch('/admin/credentials', needAdmin, async (req, res) => {
    try {
      const { currentPassword, newLogin, newPassword } = req.body ?? {};

      if (typeof currentPassword !== 'string' || !currentPassword) {
        return res.status(400).json({ error: 'Укажите текущий пароль (currentPassword)' });
      }

      if (!newLogin && !newPassword) {
        return res
          .status(400)
          .json({ error: 'Укажите хотя бы одно поле для изменения: newLogin или newPassword' });
      }

      const row = await db('admin_panel_credentials').where({ id: CREDENTIAL_ROW_ID }).first();
      if (!row?.password_hash) {
        return res.status(503).json({ error: 'Учётная запись администратора не настроена' });
      }

      const currentOk = await bcrypt.compare(currentPassword, row.password_hash);
      if (!currentOk) {
        return res.status(401).json({ error: 'Неверный текущий пароль' });
      }

      const updates = { updated_at: db.fn.now() };

      if (newLogin) {
        const login = String(newLogin).trim();
        if (login.length < MIN_LOGIN_LENGTH) {
          return res
            .status(400)
            .json({ error: `Логин должен содержать минимум ${MIN_LOGIN_LENGTH} символа` });
        }
        updates.login = login;
      }

      if (newPassword) {
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
          return res
            .status(400)
            .json({ error: `Пароль должен содержать минимум ${MIN_PASSWORD_LENGTH} символов` });
        }
        updates.password_hash = await bcrypt.hash(newPassword, 12);
      }

      await db('admin_panel_credentials').where({ id: CREDENTIAL_ROW_ID }).update(updates);

      return res.json({ ok: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  r.patch('/admin/users/:id', needAdmin, async (req, res) => {
    try {
      const id = Number.parseInt(String(req.params.id), 10);
      if (!Number.isFinite(id) || id < 1) return res.status(400).json({ error: 'Invalid id' });

      const role = req.body?.role;
      if (!isUserRole(role)) {
        return res.status(400).json({ error: 'Invalid role', allowed: [...USER_ROLES] });
      }

      const n = await db('users').where({ id }).update({ role, updated_at: db.fn.now() });
      if (!n) return res.status(404).json({ error: 'User not found' });

      const user = await db('users').where({ id }).first();
      return res.json({ user });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return r;
}

