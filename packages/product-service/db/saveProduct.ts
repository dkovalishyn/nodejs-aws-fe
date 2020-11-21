import { Client } from 'pg';
import { Product, ProductSchema } from '../models/product';

export const saveProduct = async (product: Product) => {
  const client = new Client();

  try {
    await ProductSchema.validate(product);
    const { title, price, description, count } = product;

    await client.connect();
    await client.query('begin');

    const insertProduct = `  
      insert into products (title, description, price) 
      values ($1, $2, $3)
      returning *
    `;
    const { rows: products } = await client.query<Product>(insertProduct, [
      title,
      description,
      price,
    ]);
    const insertStocks = `
      insert into stocks(product_id, count) 
      values ($1, $2) 
      returning count
    `;
    const { rows: stocks } = await client.query(insertStocks, [
      products[0].id,
      count,
    ]);
    await client.query('commit');
    return {
      ...products[0],
      ...stocks[0],
    };
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    await client.end();
  }
};
