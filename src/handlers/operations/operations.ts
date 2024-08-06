import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { getUserById, updateUserBalance } from '../../services/userService';
import { getOperationByType, performOperation } from '../../services/operationService';
import { createRecord } from '../../services/recordService';
import moment from 'moment';

/**
 * Handles a new operation request.
 * 
 * @param event - The event object containing the request details.
 * @returns A promise that resolves to the APIGatewayProxyResult.
 */
export const newOperation: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const { userId, operationType, ...operationParams } = JSON.parse(event.body || '{}');

    const user = await getUserById(userId);
    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid user' })
      };
    }

    const operation = await getOperationByType(operationType);
    if (!operation) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid operation type' })
      };
    }

    if (user.balance < operation.cost) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Insufficient balance' })
      };
    }

    const result = await performOperation(operationType, operationParams);
    const newBalance = user.balance - operation.cost;

    await updateUserBalance(userId, newBalance);

    const record = await createRecord({
      operation_id: operation.id,
      user_id: userId,
      amount: operation.cost,
      user_balance: newBalance,
      operation_response: result,
      created_at: new Date(moment().format('YYYY-MM-DD HH:mm:ss')),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result, newBalance, recordId: record.id })
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Division by zero') {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid operation: Division by zero' })
        };
      }
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
