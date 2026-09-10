/**
 * Первичная настройка учётных данных администратора в БД.
 *
 * Использование:
 *   node server/scripts/set-admin-credentials.mjs <логин> <пароль>
 *
 * Пример:
 *   node server/scripts/set-admin-credentials.mjs admin MyStrongPass123
 *
 * Скрипт создаёт или обновляет единственную строку (id=1) в таблице
 * admin_panel_credentials. Переменные ADMIN_PANEL_LOGIN / ADMIN_PANEL_PASSWORD*
 * после этого можно удалить из .env.
 */

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import bcrypt from 'bcryptjs';
import knexFactory from 'knex';

const __dirname = dirname(fileURLToPath(import.meta.url));

const [, , loginArg, passwordArg] = process.argv;

if (!loginArg || !passwordArg) {
  console.error('Использование: node server/scripts/set-admin-credentials.mjs <логин> <пароль>');
  process.exit(1);
}

const login = loginArg.trim();
const password = passwordArg;

if (login.length < 3) {
  console.error('Ошибка: логин должен содержать минимум 3 символа.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Ошибка: пароль должен содержать минимум 8 символов.');
  process.exit(1);
}

const { default: knexConfig } = await import('../knexfile.js');

const env = process.env.NODE_ENV ?? 'production';
const config = knexConfig[env] ?? knexConfig.production;

const db = knexFactory(config);

try {
  const hash = await bcrypt.hash(password, 12);

  const existing = await db('admin_panel_credentials').where({ id: 1 }).first();

  if (existing) {
    await db('admin_panel_credentials')
      .where({ id: 1 })
      .update({ login, password_hash: hash, updated_at: db.fn.now() });
    console.log(`✓ Учётные данные обновлены. Логин: "${login}"`);
  } else {
    await db('admin_panel_credentials').insert({
      id: 1,
      login,
      password_hash: hash,
    });
    console.log(`✓ Учётные данные созданы. Логин: "${login}"`);
  }
} catch (err) {
  console.error('Ошибка при записи в БД:', err.message);
  process.exit(1);
} finally {
  await db.destroy();
}
