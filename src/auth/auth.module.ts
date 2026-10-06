import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super_chave_secreta_site_erika_2026',
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <- JwtStrategy adicionado aqui
})
export class AuthModule {}