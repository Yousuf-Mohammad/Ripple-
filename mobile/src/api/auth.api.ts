import { apiClient } from './client';
import type { AuthResponse, MeResponse } from './types';

export interface SignupInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

/** POST /auth/signup → 201 { user, token } */
export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', input);
  return data;
}

/** POST /auth/login → 200 { user, token } */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
  return data;
}

/** GET /auth/me 🔒 → 200 { user } */
export async function me(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me');
  return data;
}
