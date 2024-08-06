import { PostConfirmationTriggerEvent, Context, Callback } from 'aws-lambda';
import { handler } from '../../handlers/v1/user/postConfirmation';
import { createUser } from '../../services/userService';
import { logError, logEvent } from '../../utils/logger';

jest.mock('../../services/userService');
jest.mock('../../utils/logger');

describe('Post Confirmation Handler', () => {
  let context: Context;
  let callback: Callback;

  beforeEach(() => {
    context = {} as Context;
    callback = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log event and call createUser on successful post-confirmation', async () => {
    const event: PostConfirmationTriggerEvent = {
      version: '1',
      triggerSource: 'PostConfirmation_ConfirmSignUp',
      request: {
        userAttributes: { email: 'user@example.com', sub: '1234' },
      },
      response: {},
      region: 'us-west-2',
      userPoolId: 'your-user-pool-id',
      userName: 'your-username',
      callerContext: {
        awsSdkVersion: '1.0',
        clientId: 'your-client-id',
      },
    };

    (createUser as jest.Mock).mockResolvedValue(undefined);
    (logEvent as jest.Mock).mockImplementation(() => {});
    (logError as jest.Mock).mockImplementation(() => {});

    await handler(event, context, callback);

    expect(logEvent).toHaveBeenCalledWith("PostConfirmation handler called", event);
    expect(createUser).toHaveBeenCalledWith(event.request.userAttributes);
    expect(callback).toHaveBeenCalledWith(null, event);
  });

  it('should handle errors in createUser and still call the callback', async () => {
    const event: PostConfirmationTriggerEvent = {
      version: '1',
      triggerSource: 'PostConfirmation_ConfirmSignUp',
      request: {
        userAttributes: { email: 'user@example.com', sub: '1234' },
      },
      response: {},
      region: 'us-west-2',
      userPoolId: 'your-user-pool-id',
      userName: 'your-username',
      callerContext: {
        awsSdkVersion: '1.0',
        clientId: 'your-client-id',
      },
    };

    (createUser as jest.Mock).mockRejectedValue(new Error('Creation error'));
    (logEvent as jest.Mock).mockImplementation(() => {});
    (logError as jest.Mock).mockImplementation(() => {});

    await handler(event, context, callback);

    expect(logEvent).toHaveBeenCalledWith("PostConfirmation handler called", event);
    expect(createUser).toHaveBeenCalledWith(event.request.userAttributes);
    expect(logError).toHaveBeenCalledWith('Error in post-confirmation handler', expect.any(Error));
    expect(callback).toHaveBeenCalledWith(null, event);
  });

  it('should not call createUser if triggerSource is not PostConfirmation_ConfirmSignUp', async () => {
    const event: PostConfirmationTriggerEvent = {
      version: '1',
      triggerSource: 'PostConfirmation_ConfirmForgotPassword',
      request: {
        userAttributes: { email: 'user@example.com', sub: '1234' },
      },
      response: {},
      region: 'us-west-2',
      userPoolId: 'your-user-pool-id',
      userName: 'your-username',
      callerContext: {
        awsSdkVersion: '1.0',
        clientId: 'your-client-id',
      },
    };

    (createUser as jest.Mock).mockResolvedValue(undefined);
    (logEvent as jest.Mock).mockImplementation(() => {});
    (logError as jest.Mock).mockImplementation(() => {});

    await handler(event, context, callback);

    expect(logEvent).toHaveBeenCalledWith("PostConfirmation handler called", event);
    expect(createUser).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, event);
  });
});
