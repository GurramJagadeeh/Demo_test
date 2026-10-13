import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { VehicleService } from '../Service/vehicle.service';
@Controller('vehicle-brands')
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
  ) {}
  /**
   * Retrieves vehicle brand master data for 2-wheelers and 4-wheelers.
   * GET /vehicle-brands
   * The session token is read from the Authorization header.
   * Client IP and device information are obtained from the request.
   * The stored procedure determines the response status and envelope.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getVehicleBrands(
    @Headers('authorization') authorization: string | undefined,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    // Accept a Bearer token or a raw token.
    const userToken = authorization?.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization?.trim() ?? '';
    // Capture request metadata for the stored procedure.
    const ipAddress = req.ip || '';
    const deviceInfo = req.headers['user-agent']?.toString() || '';
    // Delegate the business logic to the service.
    const response = await this.vehicleService.getVehicleBrands(
      userToken,
      ipAddress,
      deviceInfo,
    );
    // Apply the status code supplied by the stored procedure.
    reply.status(Number(response.statusCode));
    // Preserve the stored procedure's JSON response envelope.
    return response;
  }
}
