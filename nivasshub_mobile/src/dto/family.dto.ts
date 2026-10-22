import { IsNotEmpty, IsString } from 'class-validator';

export class GetFamilyRelationsDto {
  @IsString()
  @IsNotEmpty()
  user_token: string;
}