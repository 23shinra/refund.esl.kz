import knex from 'knex';
import config from '../knexfile.js';

export function createDb() {
  const env = process.env.NODE_ENV ?? 'development';
  const cfg = config[env] ?? config.development;
  return knex(cfg);
}

