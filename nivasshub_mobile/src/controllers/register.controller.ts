import { Body,Controller, Get, HttpCode, HttpStatus,Post } from '@nestjs/common';
import { CountryService } from '../Service/country.service';
import { RegisterService } from '../Service/register.service';
import { RegistrationCheckDto } from '../dto/register.dto';
import { UserRegistrationDto } from '../dto/register.dto';
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
 //------------USER REGISTRATION PRE-CHECK--------------------
  /**
   * Checks whether the supplied email or mobile number
   * can proceed with registration.
   * POST /country-codes/registration-check
   */
  @Post('registration-check')
   async registrationCheck(
    @Body() dto: RegistrationCheckDto,
  ) {
    return this.registerService.registrationCheck(dto);
  }
  //---------------------USER REGISTRATION---------------------------
  /**
   * Registers a new user in the system.
   * POST /country-codes/user-registration
   * The stored procedure handles business validation and returns
   * an HTTP-style status code and JSON response.
   */
  @Post('user-registration')
  async userRegistration(
  @Body() dto: UserRegistrationDto,
) {
  return this.registerService.userRegistration(dto);
}
}
