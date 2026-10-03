import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  // Injetamos o Prisma para podermos utilizá-lo
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.tbl_categories.create({
      data: createCategoryDto as any,
    });
  }

  findAll() {
    return this.prisma.tbl_categories.findMany();
  }

  findOne(id: number) {
    return this.prisma.tbl_categories.findUnique({
      where: { category_id: id } as any,
    });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.tbl_categories.update({
      where: { category_id: id } as any,
      data: updateCategoryDto as any,
    });
  }

  remove(id: number) {
    return this.prisma.tbl_categories.delete({
      where: { category_id: id } as any,
    });
  }
}