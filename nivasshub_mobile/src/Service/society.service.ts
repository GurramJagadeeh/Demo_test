import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { SocietyDetailsDto } from '../dto/society.dto';
import { SocietyRepository } from '../repositories/society.repository';

/**
 * Service responsible for Society-related business operations.
 *
 * The service sits between the Controller and Repository.
 *
 * Controller
 *     ↓
 * SocietyService
 *     ↓
 * SocietyRepository
 *     ↓
 * Stored Procedure
 */
@Injectable()
export class SocietyService {
  constructor(
    private readonly societyRepository: SocietyRepository,
  ) {}

  /**
   * Retrieves the complete active structure of a society.
   *
   * The stored procedure is responsible for:
   * - Society validation
   * - Active society filtering
   * - Active tower filtering
   * - Active floor filtering
   * - Active unit filtering
   * - Building the response JSON
   * - Returning the status code
   *
   * Therefore, the service does not perform additional
   * database queries or rebuild the response structure.
   *
   * @param dto - Contains the society ID received from the request.
   * @returns Parsed JSON response from the stored procedure.
   */
  async getSocietyDetails(
    dto: SocietyDetailsDto,
  ) {
    try {
      /**
       * GET query parameters are received as strings because
       * transform:true is not enabled in the global ValidationPipe.
       *
       * Example:
       * ?socid=33
       *
       * dto.socid = "33"
       *
       * Convert it to a number before sending it to SQL Server.
       */
      const societyId = Number(dto.socid);

      /**
       * Validate the value before passing it to SQL Server.
       *
       * Valid range:
       * 1 to 2147483647
       *
       * This prevents invalid values from causing a SQL
       * conversion error.
       */
      if (
        !Number.isInteger(societyId) ||
        societyId < 1 ||
        societyId > 2147483647
      ) {
        throw new HttpException(
          {
            statusCode: 400,
            status: 'error',
            message: 'Invalid request.',
            data: null,
            errors: [
              {
                code: 'INVALID_SOCIETY_ID',
                field: 'societyId',
                message:
                  'societyId is required and must be a positive integer.',
              },
            ],
            meta: {
              apiVersion: 'v1',
              timestamp: new Date().toISOString(),
            },
          },
          400,
        );
      }

      /**
       * Call the repository to execute the stored procedure.
       *
       * The repository returns:
       * - jsonResponse
       * - statusCode
       */
      const result =
        await this.societyRepository.getSocietyDetails(
          societyId,
        );

      /**
       * The stored procedure should always return JsonResponse.
       *
       * If it is missing, treat it as an unexpected server error.
       */
      if (!result.jsonResponse) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }

      /**
       * The stored procedure already creates the complete
       * JSON response.
       *
       * Parse it so that we can determine the HTTP status code.
       */
      let response: any;

      try {
        response = JSON.parse(result.jsonResponse);
      } catch (error) {
        /**
         * JsonResponse should always contain valid JSON.
         * If parsing fails, treat it as an unexpected server error.
         */
        console.error(
          'Invalid JSON returned by USP_Registration_Get_Society_Details:',
          error,
        );

        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }

      /**
       * Use the statusCode returned by the stored procedure.
       *
       * The output parameter is used as a fallback in case
       * the JSON does not contain a valid statusCode.
       */
      const statusCode =
        typeof response?.statusCode === 'number'
          ? response.statusCode
          : result.statusCode;

      /**
       * If the stored procedure did not provide a valid status
       * code, we cannot safely determine the HTTP response.
       */
      if (
        typeof statusCode !== 'number' ||
        !Number.isInteger(statusCode)
      ) {
        throw new InternalServerErrorException({
          statusCode: 500,
          status: 'error',
          message:
            'An unexpected error occurred while processing the request.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_SERVER_ERROR',
              message:
                'Please contact support with this reference.',
            },
          ],
          meta: {
            apiVersion: 'v1',
            timestamp: new Date().toISOString(),
          },
        });
      }

      /**
       * For successful responses, return the JSON generated
       * by the stored procedure.
       */
      if (
        statusCode >= 200 &&
        statusCode < 300
      ) {
        return response;
      }

      /**
       * For 400, 404, and other error responses, use the
       * status code supplied by the stored procedure.
       *
       * This ensures that NestJS sends the correct HTTP status
       * instead of always returning HTTP 200.
       */
      throw new HttpException(
        response,
        statusCode,
      );
    } catch (error) {
      /**
       * If the error is already an HttpException created above,
       * preserve it exactly as it is.
       */
      if (error instanceof HttpException) {
        throw error;
      }

      /**
       * Any unexpected repository/database/application error
       * is converted into a generic 500 response.
       *
       * Internal database details are not exposed to the client.
       */
      console.error(
        'Error fetching society details:',
        error,
      );

      throw new InternalServerErrorException({
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while processing the request.',
        data: null,
        errors: [
          {
            code: 'INTERNAL_SERVER_ERROR',
            message:
              'Please contact support with this reference.',
          },
        ],
        meta: {
          apiVersion: 'v1',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}