import { Module } from '@nestjs/common';
import { ShopifyAuthController } from './auth.controller';

@Module({
  controllers: [ShopifyAuthController],
})
export class ShopifyModule {}
