#!/usr/bin/env node
/**
 * Генерация ADMIN_PANEL_PASSWORD_HASH для .env
 * Usage: node server/scripts/hash-admin-password.mjs "your-strong-password"
 */
import bcrypt from 'bcryptjs';

const p = process.argv[2];
if (!p || p.length < 8) {
  // eslint-disable-next-line no-console
  console.error('Usage: node server/scripts/hash-admin-password.mjs "<password min 8 chars>"');
  process.exit(1);
}
const hash = await bcrypt.hash(p, 12);
// eslint-disable-next-line no-console
console.log('\nДобавьте в .env API:\nADMIN_PANEL_PASSWORD_HASH=' + hash + '\n');
