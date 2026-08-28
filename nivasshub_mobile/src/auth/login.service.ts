import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginRepository } from './login.repository';
import { LoginRequest, LoginResponse } from './login.types';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}

  /** Parses the procedure response and preserves its status code. */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const result = await this.loginRepository.login(credentials);
      if (!result) {
        throw new InternalServerErrorException(this.internalError());
      }

      const response = JSON.parse(result) as LoginResponse;
      if (!this.isLoginResponse(response)) {
        throw new InternalServerErrorException(this.internalError());
      }

      if (response.ErrorCode !== 200) {
        throw new HttpException(response, response.ErrorCode);
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(this.internalError());
    }
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