import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { CountryRepository } from './country.repository';
 
/**
 * Country Module
 * Groups all components related to the country-code API,
 * including the controller, service, and repository.
 */
@Module({
  // Handles HTTP requests for country-code endpoints.
  controllers: [CountryController],
  // Provides the business logic and database access layers.
  providers: [
    CountryService,
    CountryRepository,
  ],
})
export class CountryModule {}
 