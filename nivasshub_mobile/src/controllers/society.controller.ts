import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,Headers
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
  // GET Countries → States → Societies hierarchy
@Get('countries-states-societies')
async getCountriesStatesSocieties(
  // Read the Authorization header from the request
  @Headers('authorization') authorization: string,
) {
  // Extract the token by removing the Bearer prefix if present
  const sessionToken = authorization?.startsWith('Bearer ')
    ? authorization.substring(7)
    : authorization;
  // Pass the token to the service and return the response
  return this.societyService.getCountriesStatesSocieties(sessionToken);
}
}