export type CreateUserDetails = {
  name: string;
  email: string;
  password: string;
};

export type TokenData = {
  sub: string;
  email: string;
  name: string;
  refreshToken?: string;
};

export interface AuthenticatedRequest extends Request {
  user: TokenData;
}
