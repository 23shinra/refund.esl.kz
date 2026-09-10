import express from 'express';
import { USER_ROLE } from '../constants/userRoles.js';
import { normalizePhone } from '../phone.js';

export function authUsersRouter(db) {
  const r = express.Router();

  /** После SMS: создать пользователя с ролью client или вернуть сохранённую роль. */
  r.post('/auth/ensure-user', async (req, res) => {
    try {
      const phone = normalizePhone(req.body?.phone ?? '');
      if (!phone) return res.status(400).json({ error: 'Invalid phone' });

      let row = await db('users').where({ phone }).first();
      if (!row) {
        await db('users').insert({
          phone,
          role: USER_ROLE.CLIENT,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
        row = await db('users').where({ phone }).first();
      }
      return res.json({ id: row?.id, phone: row?.phone, role: row?.role });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return r;
}
