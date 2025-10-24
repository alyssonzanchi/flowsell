import { shopifyApi, ApiVersion, type Shopify } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;

if (!apiKey || !apiSecretKey) {
  throw new Error(
    'As variáveis de ambiente SHOPIFY_API_KEY e SHOPIFY_API_SECRET são obrigatórias.',
  );
}

export const shopify: Shopify = shopifyApi({
  apiKey,
  apiSecretKey,
  scopes: ['read_orders', 'read_customers'],
  hostName: 'localhost:3000',
  hostScheme: 'http',
  apiVersion: ApiVersion.October25,
  isEmbeddedApp: false,
});
