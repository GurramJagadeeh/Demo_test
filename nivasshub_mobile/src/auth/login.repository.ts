import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
import { LoginProcedureRequest } from './login.types';

@Injectable()
export class LoginRepository {
  /** Executes the login stored procedure with the request parameters. */
  async login(credentials: LoginProcedureRequest): Promise<string | null> {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input('umail', sql.VarChar(100), credentials.umail)
      .input('pwd', sql.VarChar(100), credentials.pwd)
      .input('cont_code', sql.VarChar(20), credentials.cont_code)
      .input('ipadd', sql.VarChar(500), credentials.ipadd)
      .input('dinfo', sql.VarChar(500), credentials.dinfo)
      .execute('dbo.USP_User_login');

    if (!result.recordset?.length) {
      return null;
    }

    // Return the single JSON value produced by SQL Server.
    const row = result.recordset[0] as Record<string, unknown>;
    const response = row.Result ?? Object.values(row)[0];
    return typeof response === 'string' ? response : null;
  }
}