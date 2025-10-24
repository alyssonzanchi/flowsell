import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopifyModule } from './shopify/shopify.module';
import { SequencesModule } from './sequences/sequences.module';
import { SequencesController } from './sequences/sequences.controller';

@Module({
  imports: [ShopifyModule, SequencesModule],
  controllers: [AppController, SequencesController],
  providers: [AppService],
})
export class AppModule {}
