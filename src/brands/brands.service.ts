import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  create(createBrandDto: CreateBrandDto) {
    return this.prisma.tbl_brands.create({
      data: createBrandDto as any,
    });
  }

  findAll() {
    return this.prisma.tbl_brands.findMany();
  }

  findOne(id: number) {
    return this.prisma.tbl_brands.findUnique({
      where: { brand_id: id } as any,
    });
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return this.prisma.tbl_brands.update({
      where: { brand_id: id } as any,
      data: updateBrandDto as any,
    });
  }

  remove(id: number) {
    return this.prisma.tbl_brands.delete({
      where: { brand_id: id } as any,
    });
  }
}