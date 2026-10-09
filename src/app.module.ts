import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module'; // 1. Importe aqui

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CouponsModule,
    OrdersModule,
    ProductsModule, // 2. Adicione aqui nos imports
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}