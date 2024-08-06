/**
 * Logs an event with an optional data payload.
 * @param message - The message to be logged.
 * @param data - Optional data payload to be logged.
 */
export function logEvent(message: string, data?: any) {
  console.log(message, data ? JSON.stringify(data, null, 2) : '');
}

/**
 * Logs an error message along with the error details.
 * @param message - The error message to be logged.
 * @param error - The error object or message to be logged.
 */
export function logError(message: string, error: any) {
  console.error(message);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } else {
    console.error('Error:', error);
  }
}

/**
 * Logs an informational message with optional data.
 * @param message - The message to be logged.
 * @param data - Optional data to be included in the log.
 */
export function logInfo(message: string, data?: object): void {
  console.log(JSON.stringify({ message, ...data }));
}