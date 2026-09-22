import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SocietyDetailsDto } from '../dto/society.dto';
import { SocietyService } from '../Service/society.service';
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
}