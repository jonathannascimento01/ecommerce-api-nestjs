import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: any) {
    return this.prisma.tbl_brands.create({
      data: createBrandDto,
    });
  }

  async findAll() {
    const brands = await this.prisma.tbl_brands.findMany();
    return brands.map(brand => ({
      ...brand,
      brand_id: brand.brand_id.toString(),
    }));
  }

  async findOne(id: number) {
    const brand = await this.prisma.tbl_brands.findUnique({
      where: { brand_id: BigInt(id) },
    });

    if (!brand) {
      throw new NotFoundException(`Marca com ID ${id} não encontrada.`);
    }

    return {
      ...brand,
      brand_id: brand.brand_id.toString(),
    };
  }

  async update(id: number, updateBrandDto: any) {
    await this.findOne(id);
    const updated = await this.prisma.tbl_brands.update({
      where: { brand_id: BigInt(id) },
      data: updateBrandDto,
    });

    return {
      ...updated,
      brand_id: updated.brand_id.toString(),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    const deleted = await this.prisma.tbl_brands.delete({
      where: { brand_id: BigInt(id) },
    });

    return {
      ...deleted,
      brand_id: deleted.brand_id.toString(),
    };
  }
}