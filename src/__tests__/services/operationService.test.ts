import { Pool } from 'pg';
import axios from 'axios';
import { getRandomString, performOperation } from '../../services/operationService';
import { getDbPool } from '../../utils/database';
import { OperationType } from '../../models/Operation';

// Mocking the modules
jest.mock('../../utils/database', () => ({
  getDbPool: jest.fn(() => ({
    query: jest.fn()
  }))
}));
jest.mock('../../utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn()
}));
jest.mock('axios');

const mockQuery = jest.fn();
const pool = { query: mockQuery } as unknown as Pool;
(getDbPool as jest.Mock).mockReturnValue(pool);

// Tests for `getOperationByType`
describe('getOperationByType', () => {
  it('should return operation object if found', async () => {
    const mockOperation = { id: '1', type: 'addition', cost: '10' };
    mockQuery.mockResolvedValue({ rows: [mockOperation] });

    const result = {
      id: '1',
      type: 'addition' as OperationType,
      cost: 10
    };
    
    expect(result).toEqual({
      id: '1',
      type: 'addition' as OperationType,
      cost: 10
    });
  });
});

// Tests for `performOperation`
describe('performOperation', () => {
  it('should return result of addition', async () => {
    const result = await performOperation('addition', { operationParams: { num1: 1, num2: 2 } });
    expect(result).toBe('3');
  });

  it('should return result of subtraction', async () => {
    const result = await performOperation('subtraction', { operationParams: { num1: 5, num2: 3 } });
    expect(result).toBe('2');
  });

  it('should return result of multiplication', async () => {
    const result = await performOperation('multiplication', { operationParams: { num1: 2, num2: 3 } });
    expect(result).toBe('6');
  });

  it('should return result of division', async () => {
    const result = await performOperation('division', { operationParams: { num1: 6, num2: 2 } });
    expect(result).toBe('3');
  });

  it('should throw error for division by zero', async () => {
    await expect(performOperation('division', { operationParams: { num1: 6, num2: 0 } }))
      .rejects.toThrow('Division by zero');
  });

  it('should return result of square root', async () => {
    const result = await performOperation('square_root', { operationParams: { num1: 9, num2: 0 } });
    expect(result).toBe('3');
  });

});

// Tests for `getRandomString`
describe('getRandomString', () => {
  it('should return a random string', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: 'randomString\n' });

    const result = await getRandomString();
    expect(result).toBe('randomString');
  });

  it('should throw error if API request fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));

    await expect(getRandomString()).rejects.toThrow('Failed to generate random string');
  });
});
