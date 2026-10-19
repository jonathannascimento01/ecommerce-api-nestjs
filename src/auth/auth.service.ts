import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password_hash: string }) {
    const existingUser = await this.prisma.tbl_customers.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Este email já está registado.');
    }

    const hashedPassword = await bcrypt.hash(data.password_hash, 10);

    const user = await this.prisma.tbl_customers.create({
      data: {
        full_name: data.name,
        email: data.email,
        password_hash: hashedPassword,
      },
    });

    return {
      message: 'Utilizador registado com sucesso',
      userId: user.customer_id.toString(),
    };
  }

  async login(data: { email: string; password_hash: string }) {
    const user = await this.prisma.tbl_customers.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(data.password_hash, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.customer_id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.customer_id.toString(),
        name: user.full_name,
        email: user.email,
      },
    };
  }
}