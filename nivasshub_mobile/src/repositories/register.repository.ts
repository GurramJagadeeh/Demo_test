import { Injectable } from '@nestjs/common';
import { connectDB } from '../config/db';
@Injectable()
export class RegisterRepository {
    //---------------------USER REGISTRATION GET---------------------------
 async userRegistrationget() {
try {
// Establish database connection
const pool = await connectDB();
    // Execute stored procedure
    const result = await pool
      .request()
      .execute('USP_User_Registration_Get');
    // Check whether stored procedure returned data
    if (
      !result.recordset ||
      result.recordset.length === 0 ||
      !result.recordset[0].Result
    ) {
      throw new Error(
        'No result returned from USP_User_Registration_Get',
      );
    }
    // Parse JSON returned by the stored procedure
    const response = JSON.parse(result.recordset[0].Result);
    // Return the parsed response
    return response;
  } catch (error) {
    // Log actual database error
    console.error(
      'Error executing USP_User_Registration_Get:',
      error,
    );
    // Pass error to service
    throw error;
  }
}   

}