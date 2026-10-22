import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AddFamilyRepository } from '../repositories/family.repository';
@Injectable()
export class AddFamilyService {
  constructor(
    private readonly addFamilyRepository: AddFamilyRepository,
  ) {}
  // Retrieve family categories and relations from the stored procedure.
  async getAddFamilyMasterData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ) {
    try {
      // Validate the authentication token.
      if (!userToken) {
        throw new HttpException(
          {
            success: false,
            statusCode: 401,
            message: 'Authentication token is required.',
            data: null,
            error: {
              code: 'TOKEN_REQUIRED',
              field: 'user_token',
            },
            meta: {
              requestId: randomUUID(),
              timestamp: new Date().toISOString(),
            },
          },
          401,
        );
      }
      // Call the repository to execute the stored procedure.
      const result =
        await this.addFamilyRepository.getAddFamilyData(
          userToken,
          ipAddress,
          deviceInfo,
        );
      // Handle an empty response from the stored procedure.
      if (!result) {
        throw new InternalServerErrorException(
          'No response received from stored procedure.',
        );
      }
      let response: any;
      // Parse the JSON response returned by SQL Server.
      try {
        response = JSON.parse(result);
      } catch (error) {
        // Log JSON parsing errors for debugging.
        console.error('Failed to parse family SP response:', error);
        throw new InternalServerErrorException(
          'Invalid response received from stored procedure.',
        );
      }
      // Read the status code returned by the stored procedure.
      const statusCode = Number(response?.statusCode) || 500;
      // Return the stored procedure's error response when unsuccessful.
      if (statusCode !== 200) {
        throw new HttpException(response, statusCode);
      }
      // Return family categories and relations on success.
      return response;
    } catch (error) {
      // Preserve existing HTTP exceptions and their status codes.
      if (error instanceof HttpException) {
        throw error;
      }
      // Log unexpected repository or application errors.
      console.error('Get Add Family Service Error:', error);
      // Return a standardized internal server error response.
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message: 'Unable to retrieve family relations.',
        data: null,
        error: {
          code: 'DATA_UNAVAILABLE',
          field: null,
        },
        meta: {
          requestId: randomUUID(),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}