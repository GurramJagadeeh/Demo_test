import { Injectable } from '@nestjs/common';
import { connectDB, sql } from '../config/db';
@Injectable()
export class KycRepository {
  /**
   * Fetch KYC documents applicable to the user.
   * The encrypted user token is passed directly to the
   * stored procedure. Decryption and validation are handled
   * inside the stored procedure.
   */
  async getKycDocuments(
    userToken: string,
  ): Promise<string | null> {
    try {
      const pool = await connectDB();
      const result = await pool
        .request()
        .input(
          'user_token',
          sql.VarChar(sql.MAX),
          userToken,
        )
        .execute('dbo.USP_User_Registration_KYC_GET');
      if (
        !result.recordset ||
        result.recordset.length === 0
      ) {
        return null;
      }
      const firstRow = result.recordset[0];
      const firstColumn = Object.keys(firstRow)[0];
      return firstColumn
        ? firstRow[firstColumn] ?? null
        : null;
    } catch (error) {
      console.error(
        'Error executing dbo.USP_User_Registration_KYC_GET:',
        error,
      );
      throw error;
    }
  }
  /**
   * Upload or re-upload a KYC document.
   * The stored procedure handles:
   * - User validation
   * - Society validation
   * - Document validation
   * - Pending/rejected validation
   * - Insert/update operation
   * - Version management
   */
  async uploadKycDocument(
    userId: string,
    docId: string,
    docUrl: string,
  ): Promise<string | null> {
    try {
      const pool = await connectDB();
      const result = await pool
        .request()
        .input(
          'user_id',
          sql.VarChar(sql.MAX),
          userId,
        )
        .input(
          'doc_id',
          sql.VarChar(10),
          docId,
        )
        .input(
          'doc_url',
          sql.VarChar(sql.MAX),
          docUrl,
        )
        .execute('dbo.USP_User_KYC_Upload');
      if (
        !result.recordset ||
        result.recordset.length === 0
      ) {
        return null;
      }
      const firstRow = result.recordset[0];
      const firstColumn = Object.keys(firstRow)[0];
      return firstColumn
        ? firstRow[firstColumn] ?? null
        : null;
    } catch (error) {
      console.error(
        'Error executing dbo.USP_User_KYC_Upload:',
        error,
      );
      throw error;
    }
  }
}