import { SQSHandler } from 'aws-lambda';
import { saveProduct } from '../db/saveProduct';
import AWS from 'aws-sdk';

export const catalogBatchProcess: SQSHandler = async (event) => {
  console.log(JSON.stringify(event, null, 2));

  const sns = new AWS.SNS();
  await Promise.all(
    event.Records.map(async (record) => {
      try {
        const product = JSON.parse(record.body);
        const { id, description, title, price, count } = await saveProduct(
          product,
        );
        await sns
          .publish({
            Subject: 'Product-service',
            Message: 'New product was successfully uploaded from the ui',
            MessageAttributes: {
              id: {
                DataType: 'String',
                StringValue: id,
              },
              description: {
                DataType: 'String',
                StringValue: description,
              },
              title: {
                DataType: 'String',
                StringValue: title,
              },
              price: {
                DataType: 'Number',
                StringValue: JSON.stringify(price),
              },
              count: {
                DataType: 'Number',
                StringValue: JSON.stringify(count),
              },
            },
            TopicArn: process.env.SNS_ARN,
          })
          .promise();
      } catch (e) {
        console.error(e);
      }
    }),
  );
};
