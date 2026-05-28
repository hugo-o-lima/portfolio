export interface TokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshTokenRow {
  id: string;
  admin_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}
