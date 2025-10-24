import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { shopify } from './shopify';
import { ApiVersion } from '@shopify/shopify-api';
import { prisma } from '@flowsell/database';
import type { Response, Request } from 'express';
import { getToken } from 'next-auth/jwt';

@Controller('shopify')
export class ShopifyAuthController {
  @Get('auth')
  async auth(
    @Query('shop') shop: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!shop) {
      return res.status(400).send('Missing shop parameter');
    }

    await shopify.auth.begin({
      shop,
      callbackPath: '/api/server/shopify/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const callback = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callback;
      if (!session || !session.accessToken) {
        return res.status(403).send('Could not validate auth callback');
      }

      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token || !token.sub) {
        return res
          .status(401)
          .send('Usuário não autenticado ou token inválido');
      }

      const userId = token.sub;

      await prisma.shopifyStore.upsert({
        where: { shopDomain: session.shop },
        update: { accessToken: session.accessToken },
        create: {
          shopDomain: session.shop,
          accessToken: session.accessToken,
          userId: userId,
        },
      });

      console.log(
        `Loja ${session.shop} salva/atualizada para o usuário ${userId}`,
      );

      return res.redirect('/dashboard');
    } catch (error) {
      console.error('Falha na autenticação da Shopify:', error);
      if (error instanceof Error) {
        return res.status(500).send(error.message);
      }
      return res.status(500).send('Authentication failed');
    }
  }

  @Get('orders')
  async getOrders(@Req() req: Request, @Res() res: Response) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) {
      return res.status(401).send('Usuário não autenticado');
    }
    const userId = token.sub;

    try {
      const shopifyStore = await prisma.shopifyStore.findFirst({
        where: { userId: userId },
      });

      if (!shopifyStore) {
        return res.status(404).send('Nenhuma loja da Shopify conectada.');
      }

      const graphqlEndpoint = `https://${shopifyStore.shopDomain}/admin/api/${ApiVersion.October25}/graphql.json`;

      const graphqlQuery = `
        query GetOrders {
          orders(first: 10, sortKey: CREATED_AT, reverse: true) {
            edges {
              node {
                id
                name
                createdAt
                displayFinancialStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                customer {
                  firstName
                  lastName
                  email
                }
              }
            }
          }
        }
      `;

      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shopifyStore.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery }),
      });

      if (!response.ok) {
        const errorBody: unknown = await response.json().catch(() => ({}));
        console.error('--- ERRO DETALHADO DA SHOPIFY (GRAPHQL) ---', errorBody);
        throw new Error(
          `Falha ao buscar pedidos via GraphQL: ${response.statusText}`,
        );
      }

      type ShopifyGraphQLOrderNode = {
        id: string;
        name: string;
        createdAt: string;
        displayFinancialStatus: string;
        totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
        customer: { firstName: string; lastName: string; email: string } | null;
      };

      type GraphQLResponse = {
        data: { orders: { edges: { node: ShopifyGraphQLOrderNode }[] } };
        errors?: unknown[];
      };

      const responseData = (await response.json()) as GraphQLResponse;

      if (responseData.errors) {
        throw new Error(
          `Erros na query GraphQL: ${JSON.stringify(responseData.errors)}`,
        );
      }

      const orders = responseData.data.orders.edges.map((edge) => edge.node);
      return res.status(200).json(orders);
    } catch (error) {
      console.error(
        'Falha ao buscar os pedidos da Shopify via GraphQL:',
        error,
      );
      return res.status(500).send('Erro ao buscar pedidos.');
    }
  }
}
