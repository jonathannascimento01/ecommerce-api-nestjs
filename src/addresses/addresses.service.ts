import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(createAddressDto: any) {
    try {
      return await this.prisma.tbl_addresses.create({
        data: createAddressDto,
      });
    } catch (error: any) {
      // Isto vai furar o escudo do erro 500 e atirar o erro real para o seu PowerShell!
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return this.prisma.tbl_addresses.findMany();
  }

  findOne(id: number) {
    return this.prisma.tbl_addresses.findUnique({
      where: { address_id: id },
    });
  }

  update(id: number, updateAddressDto: any) {
    return this.prisma.tbl_addresses.update({
      where: { address_id: id },
      data: updateAddressDto,
    });
  }

  remove(id: number) {
    return this.prisma.tbl_addresses.delete({
      where: { address_id: id },
    });
  }
}