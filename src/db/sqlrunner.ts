import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Initializes the database tables if they don't exist.
 * @param event - The API Gateway event object.
 * @param context - The Lambda context object.
 * @returns A promise resolving to an API Gateway proxy result.
 */
export const handler: APIGatewayProxyHandler = async (event, context) => {
  let client: Client | null = null;

  try {
    // Initialize database client
    client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await client.connect();

    // Read the initialization script
    const initializationSQL = readFileSync(join('src/db', 'init.sql'), 'utf8');

    // Check existing tables and determine which ones need to be created
    const tablesToCheck = ['users', 'operations', 'records'];
    const tableStatuses = await Promise.all(tablesToCheck.map(async (table) => {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [table]);
      
      return { table, exists: result.rows[0].exists };
    }));

    const existingTables = tableStatuses.filter(status => status.exists).map(status => status.table);
    const tablesToCreate = tableStatuses.filter(status => !status.exists).map(status => status.table);

    // Create tables if necessary
    if (tablesToCreate.length > 0) {
      await client.query(initializationSQL);

      // Verify that tables were created
      for (const table of tablesToCreate) {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          );
        `, [table]);
        
        if (!result.rows[0].exists) {
          throw new Error(`Table '${table}' was not created.`);
        }
      }
    }

    // Prepare response message
    const message = {
      existingTables: existingTables,
      createdTables: tablesToCreate,
      summary: tablesToCreate.length > 0
        ? `Database initialized successfully. Created tables: ${tablesToCreate.join(', ')}`
        : 'All tables already exist. No initialization needed.'
    };

    return {
      statusCode: 200,
      body: JSON.stringify(message),
    };

  } catch (error) {
    console.error('Database initialization error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to initialize database', 
        error: error.message,
      }),
    };

  } finally {
    if (client) {
      await client.end();
    }
  }
};
