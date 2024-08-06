import { Pool } from 'pg';
import axios from 'axios';
import { Operation, OperationType } from '../models/Operation';
import { getDbPool } from '../utils/database';
import { logInfo, logError } from '../utils/logger';

type OperationParams = {
  operationParams: {
    num1: number;
    num2: number;
  }
};

const pool: Pool = getDbPool();

/**
 * Retrieves an operation by its type from the database.
 * @param type - The type of the operation.
 * @returns A promise that resolves to the operation object if found, or null if not found.
 * @throws An error if there was an issue querying the operation.
 */
export async function getOperationByType(type: Operation['type']): Promise<Operation | null> {
  const query = 'SELECT * FROM operations WHERE type = $1 LIMIT 1';
  const values = [type];

  try {
    const result = await pool.query(query, values);
    if (result?.rows[0]) {
      return {
        id: result?.rows[0].id,
        type: result?.rows[0].type as OperationType,
        cost: Number(result?.rows[0].cost)
      };
    }
    return null;
  } catch (error) {
    logError('Error querying operation', error);
    throw error;
  }
}

/**
 * Performs the specified arithmetic operation based on the given type and parameters.
 * @param type - The type of operation to perform.
 * @param params - The parameters required for the operation.
 * @returns A promise that resolves to the result of the operation as a string.
 * @throws An error if the operation type is invalid or if division by zero occurs.
 */
export async function performOperation(type: Operation['type'], params: OperationParams): Promise<string> {
  logInfo('Performing operation', { type, params });
  const { num1, num2 } = params.operationParams;
  
  switch (type) {
    case 'addition':
      return (num1 + num2).toString();
    case 'subtraction':
      return (num1 - num2).toString();
    case 'multiplication':
      return (num1 * num2).toString();
    case 'division':
      if (num2 === 0) throw new Error('Division by zero');
      return (num1 / num2).toString();
    case 'square_root':
      return Math.sqrt(num1).toString();
    case 'random_string':
      return await getRandomString();
    default:
      throw new Error('Invalid operation type');
  }
}

/**
 * Generates a random string using the random.org API.
 * @returns A promise that resolves to a randomly generated string.
 * @throws An error if the random string generation fails.
 */
export async function getRandomString(): Promise<string> {
  try {
    const response = await axios.get('https://www.random.org/strings/', {
      params: {
        num: 1,
        len: 10,
        digits: 'on',
        upperalpha: 'on',
        loweralpha: 'on',
        unique: 'on',
        format: 'plain',
        rnd: 'new',
      },
    });
    return response.data.trim();
  } catch (error) {
    logError('Error generating random string', error);
    throw new Error('Failed to generate random string');
  }
}
