import { HttpException, Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
  ) {}
  async getVehicleBrands(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<Record<string, unknown>> {
    try {
      const result = await this.vehicleRepository.getVehicleBrands(
        userToken,
        ipAddress,
        deviceInfo,
      );
      if (!result) {
        throw new HttpException(
          {
            success: false,
            statusCode: 500,
            message: 'Unable to retrieve vehicle brands.',
            data: null,
            errors: [
              {
                code: 'DATA_UNAVAILABLE',
                field: null,
                message: 'Unable to retrieve vehicle brands.',
              },
            ],
            meta: this.createMeta(),
          },
          500,
        );
      }
      const parsedResponse: unknown = JSON.parse(result);
      if (
        typeof parsedResponse !== 'object' ||
        parsedResponse === null ||
        Array.isArray(parsedResponse)
      ) {
        throw new Error('Invalid response from vehicle brands procedure');
      }
      const response = parsedResponse as Record<string, unknown>;
      // Return the actual stored procedure response for now.
      // We will align the response contract after checking diagnostics.
      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Vehicle Brands Service error:', error);
      throw new HttpException(
        {
          success: false,
          statusCode: 500,
          message: 'An unexpected error occurred. Please try again later.',
          data: null,
          errors: [
            {
              code: 'INTERNAL_ERROR',
              field: null,
              message: 'An unexpected error occurred. Please try again later.',
            },
          ],
          meta: this.createMeta(),
        },
        500,
      );
    }
  }
  private createMeta() {
    return {
      version: '1.0',
      requestId: crypto.randomUUID(),
      generatedAtUtc: new Date().toISOString(),
    };
  }
}