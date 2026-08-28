import { Module } from '@nestjs/common';
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
    CountryModule,
  ],
})
export class AppModule {}
 