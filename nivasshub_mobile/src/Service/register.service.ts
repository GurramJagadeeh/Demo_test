import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterRepository } from '../repositories/register.repository';
import { RegistrationCheckDto } from '../dto/register.dto';
 
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
  //-------------USER REGISTRATION PRE-CHECK----------------------

  /**
   * Checks whether an email or mobile number can proceed
   * with user registration.
   *
   * The stored procedure returns an HTTP-style status code
   * and JSON response.
   */
  async registrationCheck(
    dto: RegistrationCheckDto,
  ) {
    try {
      // Call the repository to execute the stored procedure.
      const result =
        await this.registerRepository.registrationCheck(
          dto.umail ?? '',
          dto.mobile_cont_code ?? '',
        );
      // Handle no response from the stored procedure.
      if (!result) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      let response;
      try {
        // Parse the JSON returned by the stored procedure.
        response = JSON.parse(result);
      } catch {
        // Handle invalid JSON from the database.
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      // Validate the statusCode returned by the stored procedure.
      if (
        !response ||
        typeof response.statusCode !== 'number'
      ) {
        throw new InternalServerErrorException({
          success: false,
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred. Please try again later',
        });
      }
      // Return successful response.
      if (
        response.statusCode >= 200 &&
        response.statusCode < 300
      ) {
        return response;
      }
      /**
       * Preserve the status code and response body
       * returned by the stored procedure.
       */
      throw new HttpException(
        response,
        response.statusCode,
      );
    } catch (error) {
      // Preserve the HTTP response generated from
      // the stored procedure.
      if (error instanceof HttpException) {
        throw error;
      }
      // Convert unexpected errors into HTTP 500.
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected error occurred. Please try again later',
      });
    }
  }
}