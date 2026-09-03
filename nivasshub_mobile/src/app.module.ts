import { Module } from '@nestjs/common';
import { LoginModule } from './module/login.module';
import { CountryModule } from './module/country.module';
import { RegisterModule } from './module/register.module';
/**
 * Root application module.
 * Imports and registers the feature modules used
 * throughout the NestJS application.
 */
@Module({
  // Registers the CountryModule and makes its
  // controller and service available to the application.
  imports: [
    LoginModule,
    CountryModule,RegisterModule
  ],
})
export class AppModule {}
 