import { ApiError } from '../api/types';
import type { LoginInput, SignupInput } from '../api/auth.api';

/**
 * Client-side auth validation. Mirrors the backend zod rules
 * (backend/src/validators/auth.schema.ts) so users get instant feedback before
 * a round-trip — the server stays the source of truth.
 */

const USERNAME_RE = /^[a-z0-9_]+$/;
// Pragmatic email check (matches the spirit of zod's .email()).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateLogin(input: LoginInput): FieldErrors<LoginInput> {
  const errors: FieldErrors<LoginInput> = {};
  if (!input.emailOrUsername.trim()) {
    errors.emailOrUsername = 'Email or username is required';
  }
  if (!input.password) {
    errors.password = 'Password is required';
  }
  return errors;
}

export function validateSignup(input: SignupInput): FieldErrors<SignupInput> {
  const errors: FieldErrors<SignupInput> = {};

  const username = input.username.trim();
  if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (username.length > 20) {
    errors.username = 'Username must be at most 20 characters';
  } else if (!USERNAME_RE.test(username.toLowerCase())) {
    errors.username = 'Username may only contain letters, numbers, and underscores';
  }

  const email = input.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Invalid email address';
  }

  if (input.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
}

/**
 * Turn a backend VALIDATION_ERROR envelope into a `{ field: message }` map for
 * inline display. Returns `{}` for any non-validation error so callers can fall
 * back to a top-level banner.
 */
export function fieldErrorsFromApiError(err: ApiError): Record<string, string> {
  if (err.code !== 'VALIDATION_ERROR') return {};
  const map: Record<string, string> = {};
  for (const detail of err.details) {
    if (detail.field && !map[detail.field]) {
      map[detail.field] = detail.message;
    }
  }
  return map;
}
