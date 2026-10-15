'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from './auth-provider';
import { FavoritesProvider } from './favorites-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
        <Toaster richColors position="top-center" />
      </FavoritesProvider>
    </AuthProvider>
  );
}
