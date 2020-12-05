import { SQSEvent } from 'aws-lambda';
import * as AwsMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';

import { saveProduct } from '../db/saveProduct';
import { Product } from '../models/product';
import { catalogBatchProcess } from './catalogBatchProcess';

jest.mock('../db/saveProduct');

describe('catalogBatchProcess', () => {
  let product: Product;
  let snsPublishMock: jest.Mock;

  beforeEach(() => {
    process.env.SNS_ARN = 'arn';
    product = {
      id: '1',
      description: 'desc',
      title: 'title',
      count: 10,
      price: 100,
    };
    (saveProduct as jest.Mock).mockResolvedValue(product);
    snsPublishMock = jest.fn();
    AwsMock.setSDKInstance(AWS);
    AwsMock.mock('SNS', 'publish', (params: any, callback: any) => {
      snsPublishMock(params);
      callback(null, 'success');
    });
  });

  afterEach(() => {
    AwsMock.restore('SNS');
  });

  it('should save product to db', async () => {
    await catalogBatchProcess(
      ({
        Records: [
          {
            body: JSON.stringify(product),
          },
        ],
      } as unknown) as SQSEvent,
      {} as any,
      jest.fn(),
    );
    expect(saveProduct).toHaveBeenCalledWith(product);
  });

  it('should publish parsed data to email', async () => {
    await catalogBatchProcess(
      ({
        Records: [
          {
            body: JSON.stringify(product),
          },
        ],
      } as unknown) as SQSEvent,
      {} as any,
      jest.fn(),
    );

    expect(snsPublishMock).toHaveBeenCalledWith({
      Subject: 'New product was uploaded',
      Message: JSON.stringify(product),
      TopicArn: process.env.SNS_ARN,
    });
  });
});
