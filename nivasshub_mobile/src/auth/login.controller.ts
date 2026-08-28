import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginRequest } from './login.types';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  /** POST /auth/login accepts the five login parameters only. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: LoginRequest) {
    return this.loginService.login({
      umail: credentials.umail,
      pwd: credentials.pwd,
      cont_code: credentials.cont_code ?? null,
      ipadd: credentials.ipadd,
      dinfo: credentials.dinfo,
    });
  }
}