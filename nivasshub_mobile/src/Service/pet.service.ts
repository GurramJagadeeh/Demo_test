import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PetRepository } from '../repositories/pet.repository';
@Injectable()
export class PetService {
  constructor(
    private readonly petRepository: PetRepository,
  ) {}
  /**
   * Retrieves reference data required for the Add Pet screen.
   * The stored procedure validates the token, IP and device info.
   */
  async getAddPetReferenceData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<Record<string, unknown>> {
    try {
      // Execute the stored procedure through the repository.
      const jsonResponse =
        await this.petRepository.getAddPetReferenceData(
          userToken,
          ipAddress,
          deviceInfo,
        );
      // A missing response means the procedure did not return usable data.
      if (!jsonResponse) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Parse the JSON without changing the stored procedure's response.
      let response: unknown;
      try {
        response = JSON.parse(jsonResponse);
      } catch {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Ensure the procedure returned a JSON object.
      if (
        typeof response !== 'object' ||
        response === null ||
        Array.isArray(response)
      ) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      const body = response as Record<string, unknown>;
      const statusCode = Number(body.status_code);
      // Accept only valid HTTP status codes from the stored procedure.
      if (
        !Number.isInteger(statusCode) ||
        statusCode < 100 ||
        statusCode > 599
      ) {
        throw new InternalServerErrorException({
          success: false,
          status_code: 500,
          message: 'An unexpected error occurred.',
          data: null,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
          },
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          },
        });
      }
      // Preserve the original response and its status code.
      if (statusCode >= 200 && statusCode < 300) {
        return body;
      }
      // Send SP-generated validation and authentication errors with
      // the matching HTTP status code.
      throw new HttpException(body, statusCode);
    } catch (error: unknown) {
      // Preserve the response and status of known HTTP exceptions.
      if (error instanceof HttpException) {
        throw error;
      }
      // Do not expose database or internal implementation details.
      console.error('Error retrieving Add Pet reference data:', error);
      throw new InternalServerErrorException({
        success: false,
        status_code: 500,
        message: 'An unexpected error occurred.',
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.',
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
