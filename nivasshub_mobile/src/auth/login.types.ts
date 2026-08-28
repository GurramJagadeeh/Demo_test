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
