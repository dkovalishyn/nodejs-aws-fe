import * as AWS from 'aws-sdk-mock';
import { cors } from '../cors';
import { importProductsFile } from './import-products-file';

describe('importProductsFile', () => {
  it('should return internal server error in case of error', async () => {
    AWS.mock('S3', 'getSignedUrl', Promise.reject('error'));

    const result = await importProductsFile(
      { queryStringParameters: { name: 'products' } } as any,
      {} as any,
      jest.fn(),
    );
    expect(result).toEqual({
      statusCode: 500,
      body: 'Internal server error',
      headers: cors,
    });

    AWS.restore('S3');
  });

  it('should return url if signed url was returned from S3 service', async () => {
    AWS.mock('S3', 'getSignedUrl', Promise.resolve('url'));

    const result = await importProductsFile(
      { queryStringParameters: { name: 'products' } } as any,
      {} as any,
      jest.fn(),
    );
    expect(result).toEqual({
      body: 'url',
      headers: cors,
      statusCode: 200,
    });

    AWS.restore('S3');
  });
});
