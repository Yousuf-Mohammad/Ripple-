import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  sub: string;
}

/** Sign a JWT carrying the user id as `sub`. */
export function signToken(userId: string): string {
  const options: SignOptions = {
    // JWT_EXPIRES_IN comes from env as a string (e.g. "7d"); cast to satisfy the typing.
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: userId }, env.JWT_SECRET, options);
}

/** Verify a JWT and return its payload. Throws if invalid/expired. */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Malformed token payload');
  }
  return { sub: String(decoded.sub) };
}
