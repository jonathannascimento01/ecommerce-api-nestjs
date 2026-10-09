import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req: any, @Body() body: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.addressesService.create(userId, body);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = Number(req.user.userId || req.user.sub || req.user.id);
    return this.addressesService.findAllByUser(userId);
  }
}