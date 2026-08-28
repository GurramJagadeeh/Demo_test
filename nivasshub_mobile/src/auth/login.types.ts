/** Login request parameters accepted by the API. */
export interface LoginRequest {
  umail: string;
  pwd: string;
  cont_code: string | null;
  ipadd: string;
  dinfo: string;
}

/** JSON envelope returned by the login procedure. */
export interface LoginResponse {
  ErrorCode: number;
  ErrorMsg: string;
  RefreshToken: string | null;
}