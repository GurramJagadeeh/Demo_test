import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { connectDB } from '../config/db';
@Injectable()
export class AddFamilyRepository {
 async getAddFamilyData(
  userToken: string,
  ipAddress: string,
  deviceInfo: string,
): Promise<string | null> {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input('user_token', sql.VarChar(sql.MAX), userToken)
      .input('ipadd', sql.VarChar(250), ipAddress)
      .input('dinfo', sql.VarChar(250), deviceInfo)
      .output('JsonOutput', sql.NVarChar(sql.MAX))
      .execute('USP_Add_Family_GET');

    console.log('SP output:', result.output.JsonOutput);

    return result.output.JsonOutput ?? null;
  } catch (error) {
    console.error('USP_Add_Family_GET error:', error);
    throw error;
  }
}
}