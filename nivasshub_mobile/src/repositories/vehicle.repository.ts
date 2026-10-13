import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
@Injectable()
export class VehicleRepository {
  /**
   * Retrieves vehicle brand master data from SQL Server.
   * @param userToken - Valid session or refresh token.
   * @param ipAddress - Client IPv4 or IPv6 address.
   * @param deviceInfo - Client device/browser information.
   * @returns JSON response from the stored procedure, or null
   *          if no result is returned.
   */
async getVehicleBrands(
  userToken: string,
  ipAddress: string,
  deviceInfo: string,
): Promise<string | null> {
  try {
    // Connect to SQL Server.
    const pool = await connectDB();
    // Execute the stored procedure.
    const result = await pool
      .request()
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      .input('ipadd', sql.VarChar(500), ipAddress)
      .input('dinfo', sql.VarChar(500), deviceInfo)
      .execute('dbo.USP_Get_Vehicle_Brands_Json');
    // Read the JSON response.
    const response: unknown = result.recordset?.[0]?.Result;
    if (typeof response !== 'string' || !response.trim()) {
      return null;
    }
    return response;
  } catch (error: unknown) {
    // Log the underlying error without exposing the session token.
    console.error('Vehicle repository error:', error);
    throw error;
  }
}
}