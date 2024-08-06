import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { logError, logInfo } from "../../../utils/logger";
import { parseBody, validateUpdateBalanceInput } from "../../../utils/requestParser";
import { updateUserBalance } from "../../../services/userService";
import { createResponse, handleError } from "../../../utils/responseHandler";

/**
 * Handles the update balance request for a user.
 * 
 * @param event - The event object containing the request details.
 * @returns A promise that resolves to the APIGatewayProxyResult object.
 */
export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  logInfo('UpdateBalance handler started', { event });

  try {
    const { userId, amount } = parseBody(event.body);
    validateUpdateBalanceInput(userId, amount);

    const newBalance = await updateUserBalance(userId, amount);

    return createResponse(200, { message: 'Balance updated successfully', newBalance });
  } catch (error) {
    logError('Error in updateBalance handler', error);
    return handleError(error);
  }
};
