import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { connectDB } from '../config/db';
@Injectable()
export class AddFamilyRepository {
  // Fetch family master data using the stored procedure.
  async getAddFamilyData(
    userToken: string,
    ipAddress: string,
    deviceInfo: string,
  ): Promise<string | null> {
    try {
      // Establish a connection to SQL Server.
      const pool = await connectDB();
      // Pass the required parameters and execute the stored procedure.
      const result = await pool.request()
        .input('user_token', sql.VarChar(sql.MAX), userToken)
        .input('ipadd', sql.VarChar(250), ipAddress)
        .input('dinfo', sql.VarChar(250), deviceInfo)
        .output('JsonOutput', sql.NVarChar(sql.MAX))
        .execute('USP_Add_Family_GET');
      // Return the JSON response from the output parameter.
      return result.output.JsonOutput ?? null;
    } catch (error) {
      // Log database errors and forward them to the service layer.
      console.error('USP_Add_Family_GET error:', error);
      throw error;
    }
  }
}