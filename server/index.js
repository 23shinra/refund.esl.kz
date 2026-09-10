import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { createDb } from './src/db.js';
import { getEnv } from './src/env.js';
import { catalogRouter } from './src/routes/catalog.js';
import { applicationsRouter } from './src/routes/applications.js';
import { adminRouter } from './src/routes/admin.js';
import { authUsersRouter } from './src/routes/authUsers.js';
import { partnerRouter } from './src/routes/partner.js';
import { onboardingRouter } from './src/routes/onboarding.js';
import { seedCatalog } from './src/seed.js';
import { normalizePhone } from './src/phone.js';
import { USER_ROLE } from './src/constants/userRoles.js';

const env = getEnv();
const app = express();
const db = createDb();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.use('/api', catalogRouter(db));
app.use('/api', applicationsRouter(db));
app.use('/api', authUsersRouter(db));
app.use('/api', partnerRouter(db));
app.use('/api', adminRouter(db));
app.use('/api', onboardingRouter(db, env));

async function start() {
  try {
    await db.migrate.latest();
    const bootPhone = process.env.ADMIN_BOOTSTRAP_PHONE?.trim();
    if (bootPhone) {
      const phone = normalizePhone(bootPhone);
      if (phone) {
        const n = await db('users').where({ phone }).update({ role: USER_ROLE.ADMIN, updated_at: db.fn.now() });
        if (n) {
          // eslint-disable-next-line no-console
          console.log('[api] ADMIN_BOOTSTRAP_PHONE: роль admin выдана');
        }
      }
    }
    await seedCatalog(db);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api] seed failed', e);
  }

  app.listen(env.apiPort, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.apiPort}`);
  });
}

start();

