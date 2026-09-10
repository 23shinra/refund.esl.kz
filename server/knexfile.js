/**
 * Knex ESM config.
 * MySQL: задайте MYSQL_DATABASE (и при необходимости MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD).
 * Иначе используется SQLite (файл dev.sqlite3 или SQLITE_FILENAME).
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrations = {
  directory: path.join(__dirname, 'migrations'),
};

const useMysql = Boolean(process.env.MYSQL_DATABASE?.trim());

const sqliteConfig = {
  client: 'sqlite3',
  connection: {
    filename: process.env.SQLITE_FILENAME
      ? path.resolve(process.env.SQLITE_FILENAME)
      : path.join(__dirname, 'dev.sqlite3'),
  },
  useNullAsDefault: true,
  migrations,
};

const mysqlConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE,
  },
  pool: { min: 0, max: 10 },
  migrations,
};

const active = useMysql ? mysqlConfig : sqliteConfig;

export default {
  development: active,
  production: active,
};
