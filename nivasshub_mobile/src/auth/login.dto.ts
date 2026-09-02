import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
/** Validated body fields accepted by the login endpoint. */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  umail!: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pwd!: string;
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cont_code: string | null = null;
}

export class ForgetPasswordDto{
@IsString()
@IsNotEmpty()
umail?:string
@IsString()
@IsOptional()
cont_code?:string
@IsString()
@IsOptional()
action?:string
}
export class ForgotPasswordResponseDto {
Status: number;
Success: boolean;
OTP: string | null;
Message: string;
OtpKey: string | null;
}

