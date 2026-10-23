import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PetService } from '../Service/pet.service';
@Controller('pet')
export class PetController {
  constructor(
    private readonly petService: PetService,
  ) {}
  /**
   * Retrieves reference data required by the Add Pet screen.
   * GET /pet/add-pet?user_token=YOUR_SESSION_TOKEN
   */
  @Get('add-pet')
  @HttpCode(HttpStatus.OK)
  async getAddPetReferenceData(
    @Query('user_token') userToken: string | undefined,
    @Req() req: FastifyRequest,
  ): Promise<Record<string, unknown>> {
    // Supply empty strings when metadata is unavailable so the
    // stored procedure can generate its standardized validation response.
    const ipAddress = req.ip || '';
    const deviceInfo =
      req.headers['user-agent']?.toString() || '';
    return this.petService.getAddPetReferenceData(
      userToken ?? '',
      ipAddress,
      deviceInfo,
    );
  }
}
