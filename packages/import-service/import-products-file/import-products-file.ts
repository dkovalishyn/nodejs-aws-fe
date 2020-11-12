import { APIGatewayProxyHandler } from 'aws-lambda';
import S3 from 'aws-sdk/clients/s3';
import { BUCKET } from '../bucket';
import { cors } from '../cors';

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  _context,
) => {
  console.log('Request: ', JSON.stringify(event, null, 2));
  const s3 = new S3({ region: 'eu-central-1' });
  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET,
      Key: `uploaded/${event.queryStringParameters.name}`,
      Expires: 60,
      ContentType: 'text/csv',
    });
    return {
      statusCode: 200,
      body: url,
      headers: cors,
    };
  } catch (e) {
    console.error(e);

    return {
      statusCode: 500,
      body: 'Internal server error',
      headers: cors,
    };
  }
};
