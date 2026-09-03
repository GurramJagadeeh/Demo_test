import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginRepository } from '../repositories/login.repository';
import {
  ForgotPasswordVerifyOtpRequest,
  ForgotPasswordVerifyOtpResponse,
  LoginProcedureRequest,
  LoginResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
} from '../types/login.types';
import {
  ForgetPasswordDto,
  ForgotPasswordResponseDto,
  ForgotPasswordVerifyOtpDto,
  UpdatePasswordDto
} from '../dto/login.dto';
@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}
  /** Parses the procedure response and preserves its status code. */
  async login(credentials: LoginProcedureRequest): Promise<LoginResponse> {
    try {
      const result = await this.loginRepository.login(credentials);
      if (!result) throw new InternalServerErrorException(this.internalError());
      const response = JSON.parse(result) as LoginResponse;
      if (!this.isLoginResponse(response))
        throw new InternalServerErrorException(this.internalError());
      if (response.ErrorCode !== 200) {
        if (this.isHttpStatus(response.ErrorCode))
          throw new HttpException(response, response.ErrorCode);
        throw new InternalServerErrorException(this.internalError());
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(this.internalError());
    }
  }
  /** Prevents an invalid procedure code from becoming an HTTP status. */
  private isHttpStatus(errorCode: number): boolean {
    return Number.isInteger(errorCode) && errorCode >= 100 && errorCode <= 599;
  }
  /** Checks that the procedure returned the expected JSON envelope. */
  private isLoginResponse(response: unknown): response is LoginResponse {
    if (!response || typeof response !== 'object') return false;
    const value = response as Partial<LoginResponse>;
    return (
      typeof value.ErrorCode === 'number' &&
      typeof value.ErrorMsg === 'string' &&
      (typeof value.RefreshToken === 'string' || value.RefreshToken === null)
    );
  }
  /** Builds the generic response used when the procedure cannot be read. */
  private internalError(): LoginResponse {
    return {
      ErrorCode: 500,
      ErrorMsg: 'An unexpected error occurred while processing the login',
      RefreshToken: null,
    };
  }

  async verifyForgotPasswordOtp(
    body: ForgotPasswordVerifyOtpDto,
  ): Promise<ForgotPasswordVerifyOtpResponse> {
    const request = this.validateForgotPasswordOtp(body);
    if (!request) return this.throwForgotPasswordOtpValidation(body);
    try {
      const json = await this.loginRepository.verifyForgotPasswordOtp(request);
      if (!json) throw new HttpException(this.otpInternalError(), 500);
      const response = JSON.parse(json) as unknown;
      if (!this.isForgotPasswordOtpResponse(response))
        throw new HttpException(this.otpInternalError(), 500);
      if (response.statusCode === 200) {
        return {
          statusCode: 200,
          success: true,
          FP_Token: response.FP_Token,
          message: response.message,
        };
      }
      throw new HttpException(
        {
          statusCode: response.statusCode,
          success: false,
          message: response.message,
        },
        response.statusCode,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(this.otpInternalError(), 500);
    }
  }

  private validateForgotPasswordOtp(
    body: ForgotPasswordVerifyOtpDto,
  ): ForgotPasswordVerifyOtpRequest | null {
    if (
      typeof body?.otp_token !== 'string' ||
      typeof body.otp !== 'string' ||
      typeof body.identifier !== 'string' ||
      typeof body.otp_type !== 'string'
    )
      return null;
    if (
      !this.isNonEmpty(body.otp) ||
      !this.isNonEmpty(body.otp_token) ||
      !this.isNonEmpty(body.identifier) ||
      !this.isNonEmpty(body.otp_type)
    )
      return null;
    if (
      body.otp.length > 20 ||
      body.identifier.length > 10 ||
      body.otp_type.length > 20
    )
      return null;
    return {
      otp_token: body.otp_token,
      otp: body.otp,
      identifier: body.identifier,
      otp_type: body.otp_type,
    };
  }

  private throwForgotPasswordOtpValidation(
    body: ForgotPasswordVerifyOtpDto,
  ): never {
    const message = !this.isNonEmpty(body?.otp)
      ? 'Please enter OTP.'
      : !this.isNonEmpty(body.otp_token)
        ? 'Process declined - OTP token missing.'
        : !this.isNonEmpty(body.identifier)
          ? 'Process declined - identifier missing.'
          : !this.isNonEmpty(body.otp_type)
            ? 'Process declined - OTP type missing.'
            : 'Invalid request parameters.';
    throw new HttpException({ statusCode: 400, success: false, message }, 400);
  }

  private isNonEmpty(value: unknown): value is string {
    return typeof value === 'string' && value.trim() !== '';
  }

  private isForgotPasswordOtpResponse(
    value: unknown,
  ): value is ForgotPasswordVerifyOtpResponse {
    if (!value || typeof value !== 'object') return false;
    const response = value as Partial<ForgotPasswordVerifyOtpResponse>;
    const statuses = new Set([200, 400, 401, 403, 404, 409, 410, 500]);
    if (
      !statuses.has(response.statusCode as number) ||
      typeof response.success !== 'boolean' ||
      typeof response.message !== 'string'
    )
      return false;
    return response.statusCode === 200
      ? response.success &&
          typeof response.FP_Token === 'string' &&
          response.FP_Token.length > 0
      : !response.success;
  }

  private otpInternalError(): ForgotPasswordVerifyOtpResponse {
    return {
      statusCode: 500,
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
  async forgotPassword(
    dto: ForgetPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    try {
      // Call the repository to execute the Forgot Password stored procedure
      const result = await this.loginRepository.forgotPassword(dto);
      // Handle empty or undefined response from the repository
      if (!result) {
        throw new InternalServerErrorException({
          Status: 500,
          Success: false,
          OTP: null,
          Message: 'An unexpected error occurred while processing the request',
          OtpKey: null,
        });
      }
      // Preserve the status codes returned by the stored procedure
      if (
        result.Status === 400 ||
        result.Status === 403 ||
        result.Status === 404 ||
        result.Status === 409 ||
        result.Status === 429 ||
        result.Status === 500
      ) {
        throw new HttpException(result, result.Status);
      }
      // Return the successful response when the stored procedure returns 200
      if (result.Status === 200) {
        return result;
      }
      // Handle any unexpected status code returned by the stored procedure
      throw new InternalServerErrorException({
        Status: 500,
        Success: false,
        OTP: null,
        Message: 'An unexpected error occurred while processing the request',
        OtpKey: null,
      });
    } catch (error: unknown) {
      // Preserve the HTTP exception and its original status code
      if (error instanceof HttpException) {
        throw error;
      }
      // Convert unexpected errors into the standard 500 response
      throw new InternalServerErrorException({
        Status: 500,
        Success: false,
        OTP: null,
        Message: 'An unexpected error occurred while processing the request',
        OtpKey: null,
      });
    }
  }
  /**
 * Updates the user's password using the
 * USP_FP_Update_Password stored procedure.
 * The service does not directly update the database.
 * All password update logic remains inside the stored procedure.
 */
async updatePassword(
  body: UpdatePasswordDto,
): Promise<UpdatePasswordResponse> {
  // Prepare the request object expected by the repository.
  const request: UpdatePasswordRequest = {
    FP_Token: body.FP_Token,
    new_pwd: body.new_pwd,
  };
  try {
    // Call the repository to execute
    // USP_FP_Update_Password.
    const json = await this.loginRepository.updatePassword(request);
    // If the stored procedure did not return a response,
    // return a standard internal server error.
    if (!json) {
      throw new InternalServerErrorException({
        HttpStatus: 500,
        Message:
          'An unexpected error occurred while updating the password.',
      });
    }
    // Convert the JSON string returned by SQL Server
    // into a TypeScript object.
    const response = JSON.parse(json) as UpdatePasswordResponse;
    // Validate the basic response structure returned
    // by the stored procedure.
    if (
      typeof response.HttpStatus !== 'number' ||
      typeof response.Message !== 'string'
    ) {
      throw new InternalServerErrorException({
        HttpStatus: 500,
        Message:
          'An unexpected error occurred while updating the password.',
      });
    }
    // If the password was successfully updated,
    // return the response directly to the controller.
    if (response.HttpStatus === 200) {
      return response;
    }
    // For error responses, preserve the HTTP status
    // returned by the stored procedure.
    throw new HttpException(
      response,
      response.HttpStatus,
    );
  } catch (error: unknown) {
    // Do not modify an HttpException that was already
    // created using the stored procedure status code.
    if (error instanceof HttpException) {
      throw error;
    }
    // Convert unexpected application/database errors
    // into a standard 500 response.
    throw new InternalServerErrorException({
      HttpStatus: 500,
      Message:
        'An unexpected error occurred while updating the password.',
    });
  }
}
}
