import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { LoginService } from './login.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  /** POST /auth/login derives network metadata on the server. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() credentials: LoginDto,
    @Req() request: FastifyRequest,
  ) {
    const ipadd = request.ip ?? request.socket.remoteAddress ?? '';
    const dinfo = this.getDeviceInfo(request);

    return this.loginService.login({
      umail: credentials.umail,
      pwd: credentials.pwd,
      cont_code: credentials.cont_code ?? null,
      ipadd,
      dinfo,
    });
  }

  /** Reads device information from trusted request metadata. */
  private getDeviceInfo(request: FastifyRequest): string {
    const deviceInfo =
      request.headers['x-device-info'] ?? request.headers['user-agent'];

    return Array.isArray(deviceInfo) ? deviceInfo[0] ?? '' : deviceInfo ?? '';
  }
}