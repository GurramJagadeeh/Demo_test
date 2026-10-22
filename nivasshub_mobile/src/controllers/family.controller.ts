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
  // Handle the GET request to retrieve family master data.
  @Get()
  async getAddFamilyMasterData(@Req() req: Request) {
    // Extract the session token from the Authorization header.
    const userToken =
      req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
    // Get the client's IP address from the request.
    const ipAddress = req.ip || '';
    // Get device information from the User-Agent header.
    const deviceInfo = String(req.headers['user-agent'] || '');
    // Call the service and return the family details response.
    return this.addFamilyService.getAddFamilyMasterData(
      userToken,
      ipAddress,
      deviceInfo,
    );
  }
}