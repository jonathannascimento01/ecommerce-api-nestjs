import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { CartModule } from './cart/cart.module'; // Import do carrinho aqui

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
    StockModule,
    CartModule, // Registado aqui
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}