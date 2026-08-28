import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginRepository } from './login.repository';
import { LoginProcedureRequest, LoginResponse } from './login.types';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}

  /** Parses the procedure response and preserves its status code. */
  async login(credentials: LoginProcedureRequest): Promise<LoginResponse> {
    try {
      const result = await this.loginRepository.login(credentials);
      if (!result) {
        throw new InternalServerErrorException(this.internalError());
      }

      const response = JSON.parse(result) as LoginResponse;
      if (!this.isLoginResponse(response)) {
        throw new InternalServerErrorException(this.internalError());
      }

      if (response.ErrorCode !== 200 && this.isHttpStatus(response.ErrorCode)) {
        throw new HttpException(response, response.ErrorCode);
      }

      if (response.ErrorCode !== 200) {
        throw new InternalServerErrorException(this.internalError());
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(this.internalError());
    }
  }

  /** Prevents an invalid procedure code from becoming an HTTP status. */
  private isHttpStatus(errorCode: number): boolean {
    return Number.isInteger(errorCode) && errorCode >= 100 && errorCode <= 599;
  }

  /** Checks that the procedure returned the expected JSON envelope. */
  private isLoginResponse(response: unknown): response is LoginResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

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
}