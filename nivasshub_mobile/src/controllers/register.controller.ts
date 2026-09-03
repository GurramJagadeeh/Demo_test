import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CountryService } from '../Service/country.service';
import { RegisterService } from '../Service/register.service'; 
@Controller('country-codes')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
  ) {}
  //------------USER REGISTRATION GET--------------------
  @Get('user-registration')
  @HttpCode(HttpStatus.OK)
  async userregistrationget(
  ) {
    // Call the service to fetch user registration details
    return this.registerService.userregistrationget()
  }
}