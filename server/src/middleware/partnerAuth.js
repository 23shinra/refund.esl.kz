import { USER_ROLE } from '../constants/userRoles.js';
import { normalizePhone } from '../phone.js';

export function partnerAuthMiddleware(db) {
  return async function requirePartner(req, res, next) {
    try {
      const phone = normalizePhone(req.header('x-user-phone') ?? '');
      if (!phone) {
        return res.status(401).json({ error: 'X-User-Phone header required' });
      }
      const user = await db('users').where({ phone }).first();
      if (!user || user.role !== USER_ROLE.PARTNER) {
        return res.status(403).json({ error: 'Требуется роль партнёра' });
      }
      req.partnerUserId = user.id;
      req.partnerPhone = phone;
      return next();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return res.status(500).json({ error: 'Internal error' });
    }
  };
}
