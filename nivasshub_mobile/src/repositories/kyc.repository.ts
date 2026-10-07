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
      .execute(
        'dbo.USP_User_Registration_KYC_GET',
      );
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
  documentBuffer: Buffer,
  ipAddress: string,
  userAgent: string,
): Promise<string | null> {
  try {
    const pool = await connectDB();
    console.log('KYC Upload Parameters:', {
      userId,
      docId,
      documentSize: documentBuffer.length,
      ipAddress,
      userAgent,
    });
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
  sql.VarBinary(sql.MAX),
  documentBuffer,
)
      .input(
        'ipadd',
        sql.VarChar(sql.MAX),
        ipAddress,
      )
      .input(
        'useragent',
        sql.VarChar(sql.MAX),
        userAgent,
      )
      .execute('dbo.USP_User_KYC_Upload');
    console.log(
      'KYC Upload SP Result:',
      JSON.stringify(result.recordset, null, 2),
    );
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
/**
 * Fetches the KYC documents already uploaded by the user.
 * Passes the user token, client IP address, and user-agent
 * to the stored procedure for validation and document retrieval.
 */
async getUserKycDocuments(
  userToken: string,
  ipAddress: string,
  userAgent: string,
): Promise<string | null> {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      // User's current registration/session token.
      .input(
        'user_token',
        sql.VarChar(sql.MAX),
        userToken,
      )
      // Client IP address for audit/session tracking.
      .input(
        'ipaddress',
        sql.VarChar(sql.MAX),
        ipAddress,
      )
      // Client user-agent for audit/session tracking.
      .input(
        'useragent',
        sql.VarChar(sql.MAX),
        userAgent,
      )
      // Fetches the user's uploaded KYC documents.
      .execute(
        'dbo.USP_Get_User_KYC_Documents_Json',
      );
    // The stored procedure returns its JSON response
    // as the first column of the first record.
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
      'Error executing dbo.USP_Get_User_KYC_Documents_Json:',
      error,
    );
    throw error;
  }
}
}