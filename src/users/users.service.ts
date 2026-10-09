import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; password: string }) {
    const existingUser = await this.prisma.tbl_users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Este e-mail já está registado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.tbl_users.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'customer',
        active: true,
      },
    });

    return {
      message: 'Utilizador registado com sucesso!',
      user_id: user.user_id.toString(),
      email: user.email,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.tbl_users.findUnique({
      where: { email },
    });
  }

  async findAll() {
    const users = await this.prisma.tbl_users.findMany();
    return JSON.parse(
      JSON.stringify(users, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async findOne(id: number) {
    const user = await this.prisma.tbl_users.findUnique({
      where: { user_id: id },
    });
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.');
    }
    return JSON.parse(
      JSON.stringify(user, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async update(id: number, data: { name?: string; email?: string; phone?: string; active?: boolean }) {
    await this.findOne(id);
    const updated = await this.prisma.tbl_users.update({
      where: { user_id: id },
      data,
    });
    return JSON.parse(
      JSON.stringify(updated, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.tbl_users.delete({
      where: { user_id: id },
    });
    return { message: 'Utilizador eliminado com sucesso.' };
  }
}