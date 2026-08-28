import { Module } from '@nestjs/common';
import { LoginModule } from './auth/login.module';
import { CountryModule } from './country/country.module';
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
    CountryModule,
  ],
})
export class AppModule {}
 