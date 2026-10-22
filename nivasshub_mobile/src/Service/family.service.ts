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

  async getAddFamilyMasterData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ) {
    try {
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

      const result =
        await this.addFamilyRepository.getAddFamilyData(
          userToken,
          ipAddress,
          deviceInfo,
        );

      if (!result) {
        throw new InternalServerErrorException(
          'No response received from stored procedure.',
        );
      }

      let response: any;

      try {
        response = JSON.parse(result);
      } catch (error) {
        console.error('Failed to parse family SP response:', error);

        throw new InternalServerErrorException(
          'Invalid response received from stored procedure.',
        );
      }

      const statusCode = Number(response?.statusCode) || 500;

      if (statusCode !== 200) {
        throw new HttpException(response, statusCode);
      }

      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Get Add Family Service Error:', error);

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