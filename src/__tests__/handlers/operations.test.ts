import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';
import { newOperation } from '../../handlers/operations/operations';
import { getUserById, updateUserBalance } from '../../services/userService';
import { getOperationByType, performOperation } from '../../services/operationService';
import { createRecord } from '../../services/recordService';

jest.mock('../../services/userService');
jest.mock('../../services/operationService');
jest.mock('../../services/recordService');

describe('newOperation', () => {
  let context: Context;
  let callback: Callback<APIGatewayProxyResult>;

  beforeEach(() => {
    context = {} as Context;
    callback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if the user is invalid', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'invalidUser', operationType: 'ADD' })
    };

    (getUserById as jest.Mock).mockResolvedValue(null);

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid user' });
  });

  it('should return 400 if the operation type is invalid', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'validUser', operationType: 'INVALID_TYPE' })
    };

    (getUserById as jest.Mock).mockResolvedValue({ balance: 100 });
    (getOperationByType as jest.Mock).mockResolvedValue(null);

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid operation type' });
  });

  it('should return 403 if the user has insufficient balance', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'validUser', operationType: 'ADD' })
    };

    (getUserById as jest.Mock).mockResolvedValue({ balance: 10 });
    (getOperationByType as jest.Mock).mockResolvedValue({ cost: 20 });

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({ message: 'Insufficient balance' });
  });

  it('should return 200 and perform the operation successfully', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'validUser', operationType: 'ADD', operationParams: { a: 1, b: 2 } })
    };

    const mockUser = { balance: 100 };
    const mockOperation = { id: 'op123', cost: 20 };
    const mockResult = { sum: 3 };
    const mockRecord = { id: 'rec123' };

    (getUserById as jest.Mock).mockResolvedValue(mockUser);
    (getOperationByType as jest.Mock).mockResolvedValue(mockOperation);
    (performOperation as jest.Mock).mockResolvedValue(mockResult);
    (updateUserBalance as jest.Mock).mockResolvedValue(null);
    (createRecord as jest.Mock).mockResolvedValue(mockRecord);

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ result: mockResult, newBalance: 80, recordId: mockRecord.id });
    expect(updateUserBalance).toHaveBeenCalledWith('validUser', 80);
    expect(createRecord).toHaveBeenCalledWith({
      operation_id: 'op123',
      user_id: 'validUser',
      amount: 20,
      user_balance: 80,
      operation_response: mockResult,
      created_at: expect.any(Date)
    });
  });

  it('should return 400 for division by zero error', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'validUser', operationType: 'DIVIDE', operationParams: { a: 1, b: 0 } })
    };

    const mockUser = { balance: 100 };
    const mockOperation = { id: 'op123', cost: 20 };

    (getUserById as jest.Mock).mockResolvedValue(mockUser);
    (getOperationByType as jest.Mock).mockResolvedValue(mockOperation);
    (performOperation as jest.Mock).mockRejectedValue(new Error('Division by zero'));

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid operation: Division by zero' });
  });

  it('should return 500 for any other errors', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({ userId: 'validUser', operationType: 'ADD' })
    };

    (getUserById as jest.Mock).mockRejectedValue(new Error('Unknown error'));

    const response = await newOperation(event as APIGatewayProxyEvent, context, callback) as APIGatewayProxyResult;

    // Ensure response is an object
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
});