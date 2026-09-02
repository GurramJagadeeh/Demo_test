import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginRepository } from './login.repository';
import { LoginProcedureRequest, LoginResponse } from './login.types';
import { ForgetPasswordDto,ForgotPasswordResponseDto } from './login.dto';
@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}
  /** Parses the procedure response and preserves its status code. */
  async login(credentials: LoginProcedureRequest): Promise<LoginResponse> {
    try {
      const result = await this.loginRepository.login(credentials);
      if (!result) throw new InternalServerErrorException(this.internalError());
      const response = JSON.parse(result) as LoginResponse;
      if (!this.isLoginResponse(response)) throw new InternalServerErrorException(this.internalError());
      if (response.ErrorCode !== 200) {
        if (this.isHttpStatus(response.ErrorCode)) throw new HttpException(response, response.ErrorCode);
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
result.Status === 400 ||result.Status === 403 ||result.Status === 404 ||
result.Status === 409 ||
result.Status === 429 ||
result.Status === 500
) {
throw new HttpException(
result,
result.Status,
);
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
}

