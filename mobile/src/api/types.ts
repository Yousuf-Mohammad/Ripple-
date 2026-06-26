/** Shapes mirrored from the ripple-api contract (CLAUDE.md §5.3). */

/** A user as returned by the backend (password is never included). */
export interface User {
  _id: string;
  username: string;
  email: string;
  fcmTokens: string[];
  createdAt: string;
  updatedAt: string;
}

/** Success envelope for signup/login. */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Success envelope for GET /auth/me. */
export interface MeResponse {
  user: User;
}

/** A post as shaped by the feed (CLAUDE.md §5.3 — raw `likes` array is never sent). */
export interface Post {
  id: string;
  author: { id: string; username: string };
  text: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

/** A comment on a post (CLAUDE.md §5.3 — author username only). */
export interface Comment {
  id: string;
  post: string;
  author: { id: string; username: string };
  text: string;
  createdAt: string;
  updatedAt: string;
}

/** Standard paginated list envelope. */
export interface Page<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/** One entry in a VALIDATION_ERROR `details` array. */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

/** Standard backend error envelope: { error: { code, message, details } }. */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

/**
 * Normalized error thrown by the axios client so screens get a predictable
 * shape regardless of whether the failure was a backend envelope, a network
 * error, or something unexpected.
 */
export class ApiError extends Error {
  code: string;
  status?: number;
  details: ApiErrorDetail[];

  constructor(
    message: string,
    code = 'UNKNOWN',
    status?: number,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
