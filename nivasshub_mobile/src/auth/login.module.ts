import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginRepository } from './login.repository';
import { LoginService } from './login.service';

/** Groups the login controller, service, and repository. */
@Module({
  controllers: [LoginController],
  providers: [LoginService, LoginRepository],
})
export class LoginModule {}