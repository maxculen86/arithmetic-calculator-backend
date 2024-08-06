import { Client } from 'pg';
import { User } from '../models/User';
import { getDbPool, getDbClient } from '../utils/database';
import { logInfo, logError } from '../utils/logger';

/**
 * Retrieves a user from the database by their username.
 * @param username - The username of the user to retrieve.
 * @returns A Promise that resolves to the retrieved User object, or null if the user is not found.
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const pool = getDbPool();
  try {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    
    if (result.rows[0]) {
      logInfo('Fetched user by username', { username });
      return result.rows[0];
    } else {
      logInfo('User not found by username', { username });
      return null;
    }
  } catch (error) {
    logError('Error getting user by username', error);
    return null;
  }
}

/**
 * Retrieves a user by their ID.
 * @param id - The ID of the user to retrieve.
 * @returns A promise that resolves to the user object if found, or null if not found.
 */
export async function getUserById(id: string): Promise<User | null> {
  const pool = getDbPool();
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows[0]) {
      logInfo('Fetched user by ID', { id });
      return result.rows[0];
    } else {
      logInfo('User not found by ID', { id });
      return null;
    }
  } catch (error) {
    logError('Error getting user by ID', error);
    return null;
  }
}


/**
 * Updates the balance of a user.
 * @param id - The ID of the user.
 * @param newBalance - The new balance to set for the user.
 * @throws {Error} If there is an error updating the user balance.
 */
export async function updateUserBalance(id: string, newBalance: number): Promise<void> {
  const pool = getDbPool();
  try {
    const query = 'UPDATE users SET balance = $1 WHERE id = $2';
    const result = await pool.query(query, [newBalance, id]);
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
    
    logInfo('Updated user balance', { id, newBalance });
  } catch (error) {
    logError('Error updating user balance', error);
    throw error; // Re-throw the error after logging
  }
}

/**
 * Creates a new user with the given attributes.
 * 
 * @param userAttributes - The attributes of the user to create.
 * @returns A Promise that resolves when the user is created.
 * @throws If there is an error creating the user.
 */
export async function createUser(userAttributes: any): Promise<void> {
  let client: Client | null = null;
  try {
    client = await getDbClient();

    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO users (id, email, username, balance)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `;

    await client.query(insertQuery, [
      userAttributes.sub,
      userAttributes.email,
      userAttributes.preferred_username || userAttributes.email,
      0  // initial balance
    ]);

    await client.query('COMMIT');
    logInfo('Created new user', { id: userAttributes.sub });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    logError('Error creating user', error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}
