/**
 * Parses the request body and returns an object with the userId and amount.
 * @param body - The request body to be parsed.
 * @returns An object containing the userId and amount.
 * @throws Error if the request body is missing.
 */
export function parseBody(body: string | null): { userId: string; amount: number } {
  if (!body) {
    throw new Error('Missing request body');
  }
  return JSON.parse(body);
}

/**
 * Validates the input for updating the balance.
 * @param {unknown} userId - The user ID.
 * @param {unknown} amount - The amount to update the balance.
 * @throws {Error} If the userId is invalid or missing.
 * @throws {Error} If the amount is invalid or missing.
 */
export function validateUpdateBalanceInput(userId: unknown, amount: unknown): void {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid or missing userId');
  }
  if (typeof amount !== 'number') {
    throw new Error('Invalid or missing amount');
  }
}
