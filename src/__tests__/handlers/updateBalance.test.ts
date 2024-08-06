import { APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import { handler } from '../../handlers/user/updateBalance';
import { logError, logInfo } from '../../utils/logger';
import { parseBody, validateUpdateBalanceInput } from '../../utils/requestParser';
import { updateUserBalance } from '../../services/userService';
import { createResponse, handleError } from '../../utils/responseHandler';

jest.mock('../../utils/logger');
jest.mock('../../utils/requestParser');
jest.mock('../../services/userService');
jest.mock('../../utils/responseHandler');

describe('Update Balance Handler', () => {
  let event: any;

  let context: Context;
  let callback: Callback;
  
  beforeEach(() => {
    context = {} as Context;
    callback = jest.fn();
    event = {
      body: JSON.stringify({ userId: '1234', amount: 100 }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log info and return success response on successful balance update', async () => {
    (parseBody as jest.Mock).mockReturnValue({ userId: '1234', amount: 100 });
    (validateUpdateBalanceInput as jest.Mock).mockImplementation(() => {});
    (updateUserBalance as jest.Mock).mockResolvedValue(500); // new balance
    (createResponse as jest.Mock).mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({ message: 'Balance updated successfully', newBalance: 500 }),
    });
    (handleError as jest.Mock).mockImplementation(() => {});

    const result: APIGatewayProxyResult = await handler(event, context, callback) || { statusCode: 0, body: '' };

    expect(logInfo).toHaveBeenCalledWith('UpdateBalance handler started', { event });
    expect(parseBody).toHaveBeenCalledWith(event.body);
    expect(validateUpdateBalanceInput).toHaveBeenCalledWith('1234', 100);
    expect(updateUserBalance).toHaveBeenCalledWith('1234', 100);
    expect(createResponse).toHaveBeenCalledWith(200, { message: 'Balance updated successfully', newBalance: 500 });
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Balance updated successfully', newBalance: 500 }),
    });
  });

  it('should log error and return error response on validation error', async () => {
    (parseBody as jest.Mock).mockReturnValue({ userId: '1234', amount: 100 });
    (validateUpdateBalanceInput as jest.Mock).mockImplementation(() => { throw new Error('Validation error'); });
    (createResponse as jest.Mock).mockImplementation(() => {});
    (handleError as jest.Mock).mockReturnValue({
      statusCode: 400,
      body: JSON.stringify({ message: 'Validation error' }),
    });
    (logError as jest.Mock).mockImplementation(() => {});

    const result: APIGatewayProxyResult = await handler(event, context, callback) || { statusCode: 0, body: '' };

    expect(logInfo).toHaveBeenCalledWith('UpdateBalance handler started', { event });
    expect(parseBody).toHaveBeenCalledWith(event.body);
    expect(validateUpdateBalanceInput).toHaveBeenCalledWith('1234', 100);
    expect(logError).toHaveBeenCalledWith('Error in updateBalance handler', expect.any(Error));
    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Validation error' }),
    });
  });

  it('should log error and return error response on updateUserBalance failure', async () => {
    (parseBody as jest.Mock).mockReturnValue({ userId: '1234', amount: 100 });
    (validateUpdateBalanceInput as jest.Mock).mockImplementation(() => {});
    (updateUserBalance as jest.Mock).mockRejectedValue(new Error('Update error'));
    (createResponse as jest.Mock).mockImplementation(() => {});
    (handleError as jest.Mock).mockReturnValue({
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    });
    (logError as jest.Mock).mockImplementation(() => {});

    const result: APIGatewayProxyResult = await handler(event, context, callback) || { statusCode: 0, body: '' };

    expect(logInfo).toHaveBeenCalledWith('UpdateBalance handler started', { event });
    expect(parseBody).toHaveBeenCalledWith(event.body);
    expect(validateUpdateBalanceInput).toHaveBeenCalledWith('1234', 100);
    expect(updateUserBalance).toHaveBeenCalledWith('1234', 100);
    expect(logError).toHaveBeenCalledWith('Error in updateBalance handler', expect.any(Error));
    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    });
  });
});
