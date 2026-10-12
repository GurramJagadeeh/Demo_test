import {
  Body,
  Post,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AddUserToSocietyDto } from '../dto/society.dto';
import { FastifyRequest } from 'fastify';
import { SocietyService } from '../Service/society.service';
import {SocietyDetailsDto,AddSocietyMasterDataDto,} from '../dto/society.dto';
/**
 * Controller responsible for Society-related APIs.
 * The controller handles HTTP requests and delegates
 * the actual processing to SocietyService.
 */
@Controller('society')
export class SocietyController {
  constructor(
    private readonly societyService: SocietyService,
  ) {}
  /**
   * Get the complete active structure of a society.
   * Example:
   * GET /society/details?socid=33
   * The response contains:
   * Society
   *   └── Towers
   *        └── Floors
   *             └── Units
   */
  @Get('details')
  @HttpCode(HttpStatus.OK)
  async getSocietyDetails(
    @Query() dto: SocietyDetailsDto,
  ) {
    // Pass the request data to the service layer.
    return this.societyService.getSocietyDetails(dto);
  }
  /**
 * Get all master data required for the Add Society screen.
 * Example:
 * GET /society/add-master-data?user_token=YOUR_SESSION_TOKEN
 * The IP address and device information are obtained
 * directly from the incoming request.
 */
@Get('add-master-data')
@HttpCode(HttpStatus.OK)
async getAddSocietyMasterData(
  @Query() dto: AddSocietyMasterDataDto,
  @Req() req: FastifyRequest,
) {
  // Get the client IP address from the Fastify request.
  const ipAddress = req.ip || '';
  // Use the User-Agent header as device/client information.
  const deviceInfo =
    req.headers['user-agent']?.toString() || '';
  // Pass all required values to the service layer.
  return this.societyService.getAddSocietyMasterData(
    dto.user_token,
    ipAddress,
    deviceInfo,
  );
}
  /**
   * Adds a registered user to a society unit.
   * POST /society/add-user
   */
  @Post('add-user')
  async addUserToSociety(
    @Body() dto: AddUserToSocietyDto,
    @Req() req: Request,
  ) {
    // Get request metadata on the server.
    const ipAddress = req.ip || '';
    const deviceInfo = req.headers['user-agent'] || '';
    return this.societyService.addUserToSociety(
      dto,
      ipAddress,
      deviceInfo,
    );
  }
}