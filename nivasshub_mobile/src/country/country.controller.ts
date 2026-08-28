import { Controller, Get } from '@nestjs/common';
import { CountryService } from './country.service';
 
@Controller('country-codes')
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
  ) {}
  /**
   * Retrieves the list of active country codes..
   * GET /country-codes
   * Delegates the request to the CountryService,
   * which handles the business logic and database response.
   */
  @Get()
  async getCountryCodes() {
    return this.countryService.getCountryCodes();
  }
}
 