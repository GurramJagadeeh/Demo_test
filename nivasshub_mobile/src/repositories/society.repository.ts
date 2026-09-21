import { Injectable } from '@nestjs/common';

import { connectDB, sql } from '../config/db';

/**
 * Repository responsible for all database operations
 * related to Society.
 *
 * This repository communicates directly with SQL Server
 * through the Society stored procedure.
 */
@Injectable()
export class SocietyRepository {
  /**
   * Executes the stored procedure to retrieve the complete
   * active society structure.
   *
   * Stored Procedure:
   * dbo.USP_Registration_Get_Society_Details
   *
   * The procedure returns:
   * 1. JsonResponse - complete API response as JSON.
   * 2. @StatusCode  - HTTP status code returned by the procedure.
   *
   * @param societyId - Unique ID of the society.
   *
   * @returns JsonResponse and StatusCode from the procedure.
   */
  async getSocietyDetails(
    societyId: number,
  ): Promise<{
    jsonResponse: string | null;
    statusCode: number | null;
  }> {
    try {
      // Establish a connection with the SQL Server database.
      const pool = await connectDB();

      /**
       * Execute the Society Details stored procedure.
       *
       * @socid is BIGINT in SQL Server, therefore BIGINT
       * is used as the corresponding mssql parameter type.
       */
      const request = pool
        .request()
        .input(
          'socid',
          sql.BigInt,
          societyId,
        );

      /**
       * @StatusCode is an OUTPUT parameter.
       *
       * We initialize it with NULL because the stored procedure
       * itself determines the final status code.
       */
      request.output(
        'StatusCode',
        sql.Int,
      );

      // Execute the stored procedure.
      const result = await request.execute(
        'dbo.USP_Registration_Get_Society_Details',
      );

      /**
       * The stored procedure returns a single-row result set
       * containing one column:
       *
       * JsonResponse
       *
       * We read the column explicitly instead of rebuilding
       * the response in the repository.
       */
      const jsonResponse =
        result.recordset &&
        result.recordset.length > 0
          ? result.recordset[0].JsonResponse ?? null
          : null;

      /**
       * Read the HTTP status code returned through the
       * stored procedure OUTPUT parameter.
       */
      const statusCode =
        result.output?.StatusCode ?? null;

      // Return both values to the service layer.
      return {
        jsonResponse,
        statusCode,
      };
    } catch (error) {
      /**
       * Log the actual database error on the server.
       *
       * Internal database details should not be returned
       * directly to the frontend.
       */
      console.error(
        'Error executing USP_Registration_Get_Society_Details:',
        error,
      );

      // Pass the database error to the service layer.
      throw error;
    }
  }
}