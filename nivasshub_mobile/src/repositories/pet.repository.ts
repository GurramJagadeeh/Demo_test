import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
@Injectable()
export class PetRepository {
  /**
   * Executes the Add Pet reference-data stored procedure.
   * The procedure validates the session and request metadata,
   * then returns its complete JSON response.
   */
  async getAddPetReferenceData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<string | null> {
    try {
      const pool = await connectDB();
      const result = await pool
        .request()
        .input('user_token', sql.VarChar(sql.MAX), userToken)
        .input('ipadd', sql.VarChar(250), ipAddress)
        .input('dinfo', sql.VarChar(250), deviceInfo)
        .execute('dbo.USP_Add_Pet_GET');
      // The stored procedure returns one row with ResponseJson.
      const responseJson: unknown =
        result.recordset?.[0]?.ResponseJson;
      if (
        typeof responseJson !== 'string' ||
        responseJson.trim().length === 0
      ) {
        return null;
      }
      return responseJson;
    } catch (error: unknown) {
      // Log the database error internally; never log the session token.
      console.error('Error executing dbo.USP_Add_Pet_GET:', error);
      throw error;
    }
  }
}
