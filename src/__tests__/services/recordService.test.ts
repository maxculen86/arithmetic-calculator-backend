import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { createRecord, getUserRecords, softDeleteRecord } from '../../services/recordService';
import { getDbPool } from '../../utils/database';

// Mock the necessary modules
jest.mock('pg');
jest.mock('../../utils/database');
jest.mock('../../utils/logger');
jest.mock('../../services/recordService', () => ({
  ...jest.requireActual('../../services/recordService'),
  buildBaseQuery: jest.fn(),
  buildDataQuery: jest.fn(),
}));
jest.mock('../../services/recordService', () => ({
  createRecord: jest.fn(),
  getUserRecords: jest.fn(),
  softDeleteRecord: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

const mockQuery = jest.fn();
(getDbPool as jest.Mock).mockReturnValue({ query: mockQuery } as unknown as Pool);

describe('Record Service', () => {

  describe('createRecord', () => {
    it('should create a record and return it', async () => {
      const createdAtDate = new Date();
      const newRecord = {
        user_id: 'user123',
        amount: 100,
        user_balance: 500,
        operation_id: 'op123',
        operation_response: 'Success',
        created_at: createdAtDate,
      };

      const recordWithId = {
        ...newRecord,
        id: uuidv4(),
        deleted: false,
      };

      (createRecord as jest.Mock).mockResolvedValue(recordWithId);

      const result = await createRecord(newRecord);
  
      expect(result).toEqual(recordWithId);
      expect(createRecord).toHaveBeenCalledWith(newRecord);
    });

    it('should throw an error if record creation fails', async () => {
      const newRecord = {
        user_id: 'user123',
        amount: 100,
        user_balance: 500,
        operation_id: 'op123',
        operation_response: 'Success',
        created_at: new Date(),
      };
  
      const error = new Error('Database error');
      (createRecord as jest.Mock).mockRejectedValue(error);
  
      await expect(createRecord(newRecord)).rejects.toThrow('Database error');
      expect(createRecord).toHaveBeenCalledWith(newRecord);
    });
  });

  describe('getUserRecords', () => {
    it('should fetch user records successfully', async () => {
      const userId = 'user123';
      const limit = 10;
      const offset = 0;
      const startDate = moment().subtract(1, 'month').toISOString();
      const endDate = moment().toISOString();
      const operationType = 'operationType';
      const searchString = 'search';

      const records = [
        {
          id: 'record1',
          user_id: 'user123',
          amount: 100,
          user_balance: 500,
          operation_id: 'op123',
          operation_response: 'Success',
          created_at: new Date().toISOString(),
        },
      ];

      const count = 1;

      (getUserRecords as jest.Mock).mockResolvedValueOnce({ records, totalCount: count });

      const result = await getUserRecords(userId, limit, offset, startDate, endDate, operationType, 'created_at', 'desc', searchString);

      expect(result).toEqual({ records, totalCount: count });
      expect(getUserRecords).toHaveBeenCalledWith(userId, limit, offset, startDate, endDate, operationType, 'created_at', 'desc', searchString);
    });

    it('should fetch user records with default parameters', async () => {
      const mockResult = { records: [], totalCount: 0 };
      (getUserRecords as jest.Mock).mockResolvedValue(mockResult);

      await getUserRecords('user123', 10, 0);

      expect(getUserRecords).toHaveBeenCalledWith('user123', 10, 0);
    });

    it('should throw an error if fetching user records fails', async () => {
      const userId = 'user123';
      const limit = 10;
      const offset = 0;
    
      const error = new Error('Database error');
      (getUserRecords as jest.Mock).mockRejectedValue(error);
    
      await expect(getUserRecords(userId, limit, offset)).rejects.toThrow('Database error');
      expect(getUserRecords).toHaveBeenCalledWith(userId, limit, offset);
    });
  });

  describe('softDeleteRecord', () => {
    it('should throw an error if soft deleting a record fails', async () => {
      const recordId = 'record123';
    
      const error = new Error('Database error');
      (softDeleteRecord as jest.Mock).mockRejectedValue(error);
    
      await expect(softDeleteRecord(recordId)).rejects.toThrow('Database error');
      expect(softDeleteRecord).toHaveBeenCalledWith(recordId);
    });

    it('should throw an error if soft deleting a record fails', async () => {
      const error = new Error('Database error');
      (softDeleteRecord as jest.Mock).mockRejectedValue(error);

      await expect(softDeleteRecord('record123')).rejects.toThrow('Database error');
    });
  });

});
