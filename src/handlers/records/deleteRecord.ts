import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { softDeleteRecord } from '../../services/recordService';

/**
 * Handles the soft deletion of a record.
 * 
 * @param event - The API Gateway event object.
 * @returns A promise resolving to an API Gateway proxy result.
 */
export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const { userId, recordId } = event.queryStringParameters || {};

    if (!userId || !recordId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both userId and recordId are required' })
      };
    }

    await softDeleteRecord(recordId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Record soft deleted successfully' })
    };

  } catch (error) {
    console.error('Error soft deleting record:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
