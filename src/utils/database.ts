import { Client } from 'pg';
import { Pool } from 'pg';

/**
 * Retrieves a database client instance.
 * @returns A promise that resolves to a database client.
 */
export async function getDbClient(): Promise<Client> {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await client.connect();
  return client;
}

/**
 * Returns a database connection pool.
 * @returns {Pool} The database connection pool.
 */
export function getDbPool(): Pool {
  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}