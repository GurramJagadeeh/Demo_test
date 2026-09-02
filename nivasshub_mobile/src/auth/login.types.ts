import { LoginDto } from './login.dto';
/** JSON envelope returned by the login procedure. */
export interface LoginResponse {
  ErrorCode: number;
  ErrorMsg: string;
  RefreshToken: string | null;
}
/** Internal procedure parameters, including server-derived metadata. */
export type LoginProcedureRequest = LoginDto & {
  ipadd: string;
  dinfo: string;
};

export interface ForgotPasswordVerifyOtpRequest {
  otp_token: string;
  otp: string;
  identifier: string;
  otp_type: string;
}

export interface ForgotPasswordVerifyOtpResponse {
  statusCode: 200 | 400 | 401 | 403 | 404 | 409 | 410 | 500;
  success: boolean;
  FP_Token?: string;
  message: string;
}
