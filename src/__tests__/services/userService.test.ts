import { Pool, Client } from 'pg';
import { getUserByUsername, getUserById, updateUserBalance, createUser } from '../../services/userService';
import { getDbPool, getDbClient } from '../../utils/database';
import { logInfo, logError } from '../../utils/logger';

jest.mock('../../utils/database');
jest.mock('../../utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

type LogErrorFn = (message: string, error: unknown) => void;

interface MockPool extends Partial<Pool> {
  query: jest.Mock;
}

interface MockClient extends Partial<Client> {
  query: jest.Mock;
  end: jest.Mock;
}

describe('User Service', () => {
  let mockPool: MockPool;
  let mockClient: MockClient;
  let mockLogError: jest.MockedFunction<LogErrorFn>;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
    } as MockPool;
    (getDbPool as jest.Mock).mockReturnValue(mockPool);

    mockClient = {
      query: jest.fn(),
      end: jest.fn(),
    } as MockClient;
    (getDbClient as jest.Mock).mockResolvedValue(mockClient);

    mockLogError = logError as jest.MockedFunction<LogErrorFn>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUserByUsername', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await getUserByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE username = $1', ['testuser']);
      expect(logInfo).toHaveBeenCalledWith('Fetched user by username', { username: 'testuser' });
    });

    it('should return null when user is not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getUserByUsername('testuser');

      expect(result).toBeNull();
      expect(logInfo).toHaveBeenCalledWith('User not found by username', { username: 'testuser' });
    });

    it('should return null and log error when query fails', async () => {
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      const result = await getUserByUsername('testuser');

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith('Error getting user by username', error);
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      mockPool.query.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
      expect(logInfo).toHaveBeenCalledWith('Fetched user by ID', { id: '1' });
    });

    it('should return null when user id is not found', async () => {
      (getDbPool() as any).query.mockResolvedValueOnce({ rows: [] });
    
      const result = await getUserById('nonexistent');
    
      expect(result).toBeNull();
      expect(logInfo).toHaveBeenCalledWith('User not found by ID', { id: 'nonexistent' });
    });

    it('should return null when user name is not found', async () => {
      (getDbPool() as any).query.mockResolvedValueOnce({ rows: [] });
    
      const result = await getUserByUsername('testuser');
    
      expect(result).toBeNull();
      expect(logInfo).toHaveBeenCalledWith('User not found by username', { username: 'testuser' });
    });

    it('should return null and log error when query fails', async () => {
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      const result = await getUserById('1');

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith('Error getting user by ID', error);
    });
  });

  describe('updateUserBalance', () => {
    it('should update user balance successfully', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await updateUserBalance('1', 100);

      expect(mockPool.query).toHaveBeenCalledWith('UPDATE users SET balance = $1 WHERE id = $2', [100, '1']);
      expect(logInfo).toHaveBeenCalledWith('Updated user balance', { id: '1', newBalance: 100 });
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Database error');
      mockPool.query = jest.fn().mockRejectedValueOnce(error);
    
      await expect(updateUserBalance('1', 100)).rejects.toThrow('Database error');
      expect(logError).toHaveBeenCalledWith('Error updating user balance', error);
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userAttributes = {
        sub: '123',
        email: 'test@example.com',
        preferred_username: 'testuser',
      };

      await createUser(userAttributes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), [
        '123',
        'test@example.com',
        'testuser',
        0,
      ]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.end).toHaveBeenCalled();
      expect(logInfo).toHaveBeenCalledWith('Created new user', { id: '123' });
    });

    it('should use email as username if preferred_username is not provided', async () => {
      const userAttributes = {
        sub: '123',
        email: 'test@example.com',
      };

      await createUser(userAttributes);

      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), [
        '123',
        'test@example.com',
        'test@example.com',
        0,
      ]);
    });

    it('should rollback and throw error when insertion fails', async () => {
      const error = new Error('Database error');
      mockClient.query.mockRejectedValueOnce(error);

      await expect(createUser({ sub: '123', email: 'test@example.com' })).rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.end).toHaveBeenCalled();
      expect(logError).toHaveBeenCalledWith('Error creating user', error);
    });
  });
});
