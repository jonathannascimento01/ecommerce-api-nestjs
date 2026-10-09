import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // Criar um novo cupão de desconto (Painel Admin)
  async createCoupon(data: {
    coupon_code: string;
    description?: string;
    discount_type: 'PERCENTAGE' | 'FIXED';
    discount_value: number;
    minimum_value?: number;
    start_date: string;
    end_date: string;
    max_uses?: number;
  }) {
    // Verificar se o código já existe
    const existing = await this.prisma.tbl_coupons.findUnique({
      where: { coupon_code: data.coupon_code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Já existe um cupão registado com este código.');
    }

    const coupon = await this.prisma.tbl_coupons.create({
      data: {
        coupon_code: data.coupon_code.toUpperCase(),
        description: data.description,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        minimum_value: data.minimum_value || 0,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        max_uses: data.max_uses,
        active: true,
      },
    });

    // Converte BigInt para string para evitar erros de serialização JSON
    return JSON.parse(
      JSON.stringify(coupon, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  // Listar todos os cupões
  async findAll() {
    const coupons = await this.prisma.tbl_coupons.findMany({
      orderBy: { coupon_id: 'desc' },
    });

    return JSON.parse(
      JSON.stringify(coupons, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }
}