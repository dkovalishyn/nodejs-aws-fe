import SQS from 'aws-sdk/clients/sqs';

export const sendData = async (data) => {
  console.log(data);
  try {
    const sqs = new SQS();
    await sqs
      .sendMessage({
        MessageBody: JSON.stringify(data),
        QueueUrl: process.env.SQS_QUEUE_URL,
      })
      .promise();
  } catch (e) {
    console.error(e);
  }
};
