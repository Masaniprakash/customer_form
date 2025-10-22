import * as admin from 'firebase-admin';

export const sendNotificationsToMultipleDevices = async (
  tokens: string[],
  title: string,
  messageBody: string,
  id: string,
) => {
  const successfulTokens: string[] = [];
  const failedTokens: string[] = [];
  const failedTokensErrMsg: string[] = [];

  for (const token of tokens) {
    const message = {
      token,
      notification: {
        title,
        body: messageBody,
      },
      data:{
        id: id
      }
    };

    try {
      await admin.messaging().send(message);
      successfulTokens.push(token);
    } catch (error: any) {
      console.error(`Failed to send notification to ${token}`, error.message);
      failedTokensErrMsg.push(error.message)
      failedTokens.push(token);
    }
  }

  return { success: successfulTokens.length > 0, message: "notification send success", data: { successfulTokens, failedTokens, failedTokensErrMsg } };
};
