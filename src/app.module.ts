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
    WishlistModule, // 2. Registar o módulo aqui
    // ... outros módulos que possa ter (Products, Auth, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}