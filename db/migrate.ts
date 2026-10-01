import { readFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before running migrations.');
}

const pool = new Pool({ connectionString });
try {
  await pool.query(await readFile(path.resolve('db/schema.sql'), 'utf8'));
  console.log('PostgreSQL schema is up to date.');
} finally {
  await pool.end();
}