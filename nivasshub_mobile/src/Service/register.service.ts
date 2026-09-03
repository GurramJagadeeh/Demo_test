import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterRepository } from '../repositories/register.repository';
 
@Injectable()
export class RegisterService {
  constructor(
    private readonly registerRepository: RegisterRepository,
  ) {}
  //-------------USER REGISTRATION GET----------------------
  async userregistrationget() {
  try {
    // Call the repository to execute the country and state stored procedure
    const result =
      await this.registerRepository.userRegistrationget();
    // Handle empty or undefined response from the repository
    if (!result) {
      throw new InternalServerErrorException({
        StatusCode: 500,
        StatusMessage:
          'An error occurred while fetching the country list.',
        TotalCountries: 0,
        ActiveCountries: [],
      });
    }
    // Handle 404 response returned by the stored procedure
    if (result.StatusCode === 404) {
      throw new HttpException(
        result,
        result.StatusCode,
      );
    }
    // Handle 500 response returned by the stored procedure
    if (result.StatusCode === 500) {
      throw new HttpException(
        result,
        result.StatusCode,
      );
    }
    // Return the response when the stored procedure is successful
    if (result.StatusCode === 200) {
      return result;
    }
    // Handle any unexpected status code
    throw new InternalServerErrorException({
      StatusCode: 500,
      StatusMessage:
        'An error occurred while fetching the country list',
      TotalCountries: 0,
      ActiveCountries: [],
    });
  } catch (error) {
    // Preserve the original HTTP exception and status code
    if (error instanceof HttpException) {
      throw error;
    }
    // Convert any unexpected error into a standard 500 response
    throw new InternalServerErrorException({
      StatusCode: 500,
      StatusMessage:
        'An error occurred while fetching the country list',
      TotalCountries: 0,
      ActiveCountries: [],
    });
  }
}
}