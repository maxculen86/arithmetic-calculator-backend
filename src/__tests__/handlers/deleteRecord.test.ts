import { APIGatewayProxyEventV2, Context, Callback, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handler } from '../../handlers/v1/records/deleteRecord';
import { softDeleteRecord } from '../../services/recordService';

jest.mock('../../services/recordService');

describe('handler', () => {
  let context: Context;
  let callback: Callback<APIGatewayProxyResultV2>;

  beforeEach(() => {
    context = {} as Context;
    callback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if userId or recordId is missing', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: {}
    };

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Both userId and recordId are required' });
  });

  it('should return 200 and soft delete the record successfully', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: {
        userId: 'testUserId',
        recordId: 'testRecordId'
      }
    };

    const softDeleteRecordMock = softDeleteRecord as jest.Mock;
    softDeleteRecordMock.mockResolvedValue(null);

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'Record soft deleted successfully' });
    expect(softDeleteRecordMock).toHaveBeenCalledWith('testRecordId');
  });

  it('should return 500 if there is an error in soft deleting the record', async () => {
    const event: Partial<APIGatewayProxyEventV2> = {
      queryStringParameters: {
        userId: 'testUserId',
        recordId: 'testRecordId'
      }
    };

    const softDeleteRecordMock = softDeleteRecord as jest.Mock;
    softDeleteRecordMock.mockRejectedValue(new Error('Test error'));

    const response = await handler(event as APIGatewayProxyEventV2, context, callback) as APIGatewayProxyResultV2;

    // Ensure response is not a string
    if (typeof response !== 'object' || response === null) {
      throw new Error('Response is not an object');
    }

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
    expect(softDeleteRecordMock).toHaveBeenCalledWith('testRecordId');
  });
});