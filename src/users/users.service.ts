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

    const user = await this.prisma.tbl_users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

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
    });
    
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
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