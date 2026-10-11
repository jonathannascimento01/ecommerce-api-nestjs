import { ProductsModule } from './products/products.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './orders/orders.module';
import { WishlistModule } from './wishlist/wishlist.module'; // 1. Importar o módulo aqui

@Module({
  imports: [
    PrismaModule,
    CartModule,
    OrderModule,
    WishlistModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}