import { IsNotEmpty, IsString } from 'class-validator';
/**
 * DTO used to receive the society ID from the GET request.
 * Example:
 * GET /society/details?socid=33
 * Query parameters are received as strings by default,
 * so socid is intentionally defined as a string here.
 *
 * The actual numeric validation is handled before calling
 * the stored procedure so that invalid values do not cause
 * a SQL conversion error.
 */
export class SocietyDetailsDto {
  @IsNotEmpty()
  @IsString()
  socid!: string;
}