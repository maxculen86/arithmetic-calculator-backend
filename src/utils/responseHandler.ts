import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Creates a response object for API Gateway proxy integration.
 * @param statusCode - The HTTP status code of the response.
 * @param body - The body of the response as an object.
 * @returns The APIGatewayProxyResult object representing the response.
 */
export function createResponse(statusCode: number, body: object): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify(body)
  };
}

/**
 * Handles errors and returns an APIGatewayProxyResult object based on the error type.
 * @param error - The error object to handle.
 * @returns An APIGatewayProxyResult object with the appropriate status code and error message.
 */
export function handleError(error: Error): APIGatewayProxyResult {
  if (error.message === 'User not found' || error.message.includes('Invalid or missing')) {
    return createResponse(400, { message: error.message });
  }
  if (error.message === 'Insufficient balance for deduction') {
    return createResponse(403, { message: error.message });
  }
  return createResponse(500, { message: 'Internal server error' });
}
