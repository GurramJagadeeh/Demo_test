import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AddFamilyService } from '../Service/family.service';

@Controller('get-family')
export class AddFamilyController {
  constructor(
    private readonly addFamilyService: AddFamilyService,
  ) {}
  @Get()
  async getAddFamilyMasterData(@Req() req: Request) {
    const userToken =
      req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
    const ipAddress = req.ip || '';
    const deviceInfo = String(req.headers['user-agent'] || '');
    return this.addFamilyService.getAddFamilyMasterData(
      userToken,
      ipAddress,
      deviceInfo,
    );
  }
}