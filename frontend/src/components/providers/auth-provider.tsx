'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage } from '@/lib/api-client';
import type { LoginValues, RegisterValues } from '@/lib/validations/auth';
import type { AuthResponse, User } from '@/types';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (values: LoginValues) => Promise<User>;
  register: (values: RegisterValues) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStorage.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await api<User>('/auth/me'));
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleAuth = useCallback(
    async (res: AuthResponse) => {
      tokenStorage.set(res.accessToken);
      await refresh();
      return res.user;
    },
    [refresh],
  );

  const login = useCallback(
    async (values: LoginValues) => handleAuth(await api<AuthResponse>('/auth/login', { method: 'POST', body: values })),
    [handleAuth],
  );

  const register = useCallback(
    async ({ confirmPassword: _confirm, phone, ...values }: RegisterValues) =>
      handleAuth(
        await api<AuthResponse>('/auth/register', {
          method: 'POST',
          body: { ...values, phone: phone || undefined },
        }),
      ),
    [handleAuth],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
