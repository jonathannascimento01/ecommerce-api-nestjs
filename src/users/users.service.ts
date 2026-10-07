import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 1. Cria o utilizador na tabela tbl_users
    const user = await this.prisma.tbl_users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

   // 2. Cria automaticamente o registo correspondente na tabela tbl_customers para satisfazer a FK do carrinho
   // 2. Cria automaticamente o registo correspondente na tabela tbl_customers
    try {
      await this.prisma.tbl_customers.create({
        data: {
          customer_id: user.user_id,
          full_name: createUserDto.name,
          email: createUserDto.email,
          password_hash: hashedPassword,
        },
      });
    } catch (e) {
      // Ignora caso já exista
    }

    const { password, ...result } = user;
    return result;
  }
  async findAll() {
    const users = await this.prisma.tbl_users.findMany();
    
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.tbl_users.findUnique({
      where: { user_id: id },
      include: { addresses: true }, // Traz os endereços associados ao utilizador
    });

    if (!user) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.tbl_users.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.tbl_users.update({
      where: { user_id: id },
      data: updateUserDto,
    });
    
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number) {
    const user = await this.prisma.tbl_users.delete({
      where: { user_id: id },
    });
    
    const { password, ...result } = user;
    return result;
  }
}