import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  }) {
    const address = await this.prisma.tbl_addresses.create({
      data: {
        user_id: userId,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
      },
    });

    return address;
  }

  async findAllByUser(userId: number) {
    return this.prisma.tbl_addresses.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}