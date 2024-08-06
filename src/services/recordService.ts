import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { Record, SortableField } from '../models/Record';
import { getDbPool } from '../utils/database';
import { logInfo, logError } from '../utils/logger';

const pool = getDbPool();

export async function createRecord(record: Omit<Record, 'id' | 'deleted'>): Promise<Record> {
  const newRecord: Record = {
    ...record,
    id: uuidv4(),
    deleted: false,
    created_at: record.created_at,
  };

  logInfo('Creating record', { record: newRecord });

  const query = `
    INSERT INTO records (id, user_id, amount, user_balance, operation_id, operation_response, created_at, deleted)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [newRecord.id, newRecord.user_id, newRecord.amount, newRecord.user_balance,
                  newRecord.operation_id, newRecord.operation_response, newRecord.created_at, newRecord.deleted];

  try {
    const result = await pool?.query(query, values);
    return result?.rows[0];
  } catch (error) {
    logError('Error creating record', error);
    throw error;
  }
}

export async function getUserRecords(
  userId: string, 
  limit: number, 
  offset: number,
  startDate?: string, 
  endDate?: string, 
  operationType?: string,
  sortBy: SortableField = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  searchString?: string
): Promise<{ records: Record[], totalCount: number }> {
  logInfo('Fetching user records', { userId, limit, offset, startDate, endDate, operationType, sortBy, sortOrder, searchString });

  const { baseQuery, values } = buildBaseQuery(userId, startDate, endDate, operationType, searchString);
  const { dataQuery, dataValues } = buildDataQuery(baseQuery, values, sortBy, sortOrder, limit, offset);
  const countQuery = `SELECT COUNT(*) ${baseQuery}`;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool?.query(dataQuery, dataValues),
      pool?.query(countQuery, values)
    ]);

    return {
      records: dataResult?.rows,
      totalCount: parseInt(countResult?.rows[0]?.count),
    };
  } catch (error) {
    logError('Error fetching user records', error);
    throw error;
  }
}

export async function softDeleteRecord(id: string): Promise<void> {
  logInfo('Soft deleting record', { id });
  const query = 'UPDATE records SET deleted = true WHERE id = $1';
  try {
    await pool?.query(query, [id]);
  } catch (error) {
    logError('Error soft deleting record', error);
    throw error;
  }
}

function buildBaseQuery(
  userId: string,
  startDate?: string,
  endDate?: string,
  operationType?: string,
  searchString?: string
): { baseQuery: string, values: any[] } {
  let baseQuery = `
    FROM records
    JOIN operations ON records.operation_id = operations.id
    WHERE records.user_id = $1 AND records.deleted = false
  `;
  const values: any[] = [userId];
  let paramCount = 1;

  if (operationType) {
    baseQuery += ` AND operations.id = $${++paramCount}`;
    values.push(operationType);
  }

  if (startDate && endDate) {
    baseQuery += ` AND records.created_at BETWEEN $${++paramCount} AND $${++paramCount}`;
    values.push(moment(startDate).startOf('day').toISOString(), moment(endDate).endOf('day').toISOString());
  }

  if (searchString) {
    baseQuery += ` AND (
      records.id::text ILIKE $${++paramCount} OR
      records.user_id::text ILIKE $${paramCount} OR
      records.amount::text ILIKE $${paramCount} OR
      records.user_balance::text ILIKE $${paramCount} OR
      operations.type ILIKE $${paramCount} OR
      records.operation_response ILIKE $${paramCount} OR
      records.created_at::text ILIKE $${paramCount}
    )`;
    values.push(`%${searchString}%`);
  }

  return { baseQuery, values };
}

function buildDataQuery(
  baseQuery: string,
  values: any[],
  sortBy: SortableField,
  sortOrder: 'asc' | 'desc',
  limit: number,
  offset: number
): { dataQuery: string, dataValues: any[] } {
  const dataQuery = `
    SELECT 
      records.id, 
      records.user_id, 
      records.amount, 
      records.user_balance, 
      records.operation_id,
      operations.type as operation_type, 
      records.operation_response, 
      records.created_at
    ${baseQuery} 
    ORDER BY records.${sortBy} ${sortOrder} 
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  
  const dataValues = [...values, limit, offset];

  return { dataQuery, dataValues };
}
