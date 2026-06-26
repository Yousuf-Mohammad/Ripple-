import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '../config/env';
import { ApiError, type ApiErrorEnvelope } from './types';

/**
 * Single axios instance for the whole app.
 *
 * - Request interceptor injects the bearer token from an in-memory accessor
 *   (set by AuthContext) so we don't hit SecureStore on every request.
 * - Response interceptor normalizes the backend error envelope into ApiError
 *   and, on 401, invokes the registered `onUnauthorized` handler (AuthContext
 *   wires this to logout → bounce to Login, §6.2).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- in-memory auth token ---------------------------------------------------

let authToken: string | null = null;

/** Set (or clear) the bearer token used for subsequent requests. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

// --- 401 handler ------------------------------------------------------------

let onUnauthorized: (() => void) | null = null;

/** Register a callback fired when the server returns 401 (e.g. expired token). */
export function setOnUnauthorized(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// --- interceptors -----------------------------------------------------------

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorEnvelope>) => {
    // Network / no-response failures.
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          'Network error — check your connection and the API URL.',
          'NETWORK_ERROR',
        ),
      );
    }

    const { status, data } = error.response;

    if (status === 401) {
      onUnauthorized?.();
    }

    const envelope = data?.error;
    return Promise.reject(
      new ApiError(
        envelope?.message ?? 'Something went wrong. Please try again.',
        envelope?.code ?? 'UNKNOWN',
        status,
        envelope?.details ?? [],
      ),
    );
  },
);
