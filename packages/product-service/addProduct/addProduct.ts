import { APIGatewayProxyHandler } from 'aws-lambda';
import { cors } from '../cors';
import { saveProduct } from '../db/saveProduct';

export const addProduct: APIGatewayProxyHandler = async (event) => {
  console.log(`Request: ${JSON.stringify(event, null, 2)}`);

  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Bad request',
      headers: cors,
    };
  }

  try {
    const savedProduct = await saveProduct(JSON.parse(event.body));

    return {
      statusCode: 201,
      headers: cors,
      body: JSON.stringify(savedProduct),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: cors,
      body: 'Internal server error',
    };
  }
};
