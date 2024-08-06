import { PostConfirmationTriggerEvent, Context, Callback } from 'aws-lambda';
import { createUser } from '../../../services/userService';
import { logError, logEvent } from '../../../utils/logger';

/**
 * Handles the post-confirmation event triggered after a user signs up.
 * 
 * @param event - The PostConfirmationTriggerEvent object containing the event details.
 * @param context - The AWS Lambda context object.
 * @param callback - The callback function to be called after the handler completes.
 */
export const handler = async (
  event: PostConfirmationTriggerEvent,
  context: Context,
  callback: Callback
) => {
  logEvent("PostConfirmation handler called", event);

  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const { userAttributes } = event.request;
    
    try {
      await createUser(userAttributes);
    } catch (error) {
      logError('Error in post-confirmation handler', error);
    }
  }
  
  callback(null, event);
};
