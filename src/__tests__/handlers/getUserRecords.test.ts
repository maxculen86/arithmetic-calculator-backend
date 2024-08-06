import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Callback, Context } from 'aws-lambda';
import { handler } from '../../handlers/v1/records/getUserRecords';
import { getUserRecords } from '../../services/recordService';

jest.mock('../../services/recordService');

describe('handler', () => {
  let context: Context;
  let callback: Callback<APIGatewayProxyResultV2>;

  beforeEach(() => {
    context = {} as Context;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if userId is missing', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: { page: '1', pageSize: '10', sortBy: 'created_at', sortOrder: 'asc' }
    };

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'userId is required' });
  });

  it('should return 200 and fetch user records successfully', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: { userId: 'validUser', page: '1', pageSize: '10', sortBy: 'created_at', sortOrder: 'asc' }
    };

    const mockRecords = [{ id: '1', created_at: '2024-08-05T23:27:50.086Z', deleted: false }];
    const mockTotalCount = 1;

    (getUserRecords as jest.Mock).mockResolvedValue({ records: mockRecords, totalCount: mockTotalCount });

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      items: mockRecords.map(record => ({
        ...record,
        date: expect.any(String),
        deleted: false,
      })),
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      totalCount: mockTotalCount,
      sortBy: 'created_at',
      sortOrder: 'asc'
    });
  });

  it('should return 500 if there is an internal server error', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: { userId: 'validUser', page: '1', pageSize: '10', sortBy: 'created_at', sortOrder: 'asc' }
    };

    (getUserRecords as jest.Mock).mockRejectedValue(new Error('Internal error'));

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
});