import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: process.cwd(),
      exclude: ['/products{/*path}'],
    }),
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}