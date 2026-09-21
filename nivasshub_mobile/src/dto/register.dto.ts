import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
/**
 * Request fields accepted by the pre-registration
 * email/mobile availability check endpoint.
 * Business validation is handled by the stored procedure
 * so that the API returns the defined response codes.
 */
export class RegistrationCheckDto {
  @IsOptional()
  @IsString()
  @MaxLength(254)
  umail?: string;
  @IsOptional()
  @IsString()
  @MaxLength(25)
  mobile_cont_code?: string;
}