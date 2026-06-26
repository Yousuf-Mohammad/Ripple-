import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth.api';
import { setAuthToken, setOnUnauthorized } from '../api/client';
import type { User } from '../api/types';
import { deleteToken, getToken, setToken } from './tokenStore';

export type AuthStatus = 'loading' | 'authed' | 'unauthed';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  signup: (input: authApi.SignupInput) => Promise<void>;
  login: (input: authApi.LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  /** Persist a successful auth result everywhere it needs to live. */
  const applySession = useCallback(async (nextToken: string, nextUser: User) => {
    await setToken(nextToken);
    setAuthToken(nextToken);
    setTokenState(nextToken);
    setUser(nextUser);
    setStatus('authed');
  }, []);

  /** Tear down the session (logout, expired token, or failed restore). */
  const clearSession = useCallback(async () => {
    await deleteToken();
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    setStatus('unauthed');
  }, []);

  // Keep a stable ref so the 401 handler always calls the latest clearSession.
  const clearSessionRef = useRef(clearSession);
  clearSessionRef.current = clearSession;

  // Register the global 401 handler once (response interceptor → logout).
  useEffect(() => {
    setOnUnauthorized(() => {
      void clearSessionRef.current();
    });
    return () => setOnUnauthorized(null);
  }, []);

  // On launch: restore a stored token and validate it via /auth/me.
  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await getToken();
      if (!stored) {
        if (active) setStatus('unauthed');
        return;
      }
      setAuthToken(stored);
      try {
        const { user: me } = await authApi.me();
        if (!active) return;
        setTokenState(stored);
        setUser(me);
        setStatus('authed');
      } catch {
        // Invalid/expired token → drop it.
        if (active) await clearSession();
      }
    })();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const signup = useCallback(
    async (input: authApi.SignupInput) => {
      const { token: t, user: u } = await authApi.signup(input);
      await applySession(t, u);
    },
    [applySession],
  );

  const login = useCallback(
    async (input: authApi.LoginInput) => {
      const { token: t, user: u } = await authApi.login(input);
      await applySession(t, u);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, status, signup, login, logout }),
    [user, token, status, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
