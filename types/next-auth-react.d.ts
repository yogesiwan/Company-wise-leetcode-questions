declare module 'next-auth/react' {
  import type * as React from 'react';

  export interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    } | null;
  }

  export interface UseSessionResult {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  }

  export function useSession(): UseSessionResult;

  export interface SignInOptions {
    callbackUrl?: string;
    redirect?: boolean;
    [key: string]: any;
  }

  export function signIn(
    provider?: string,
    options?: SignInOptions,
    authorizationParams?: Record<string, string>,
  ): Promise<void>;

  export interface SignOutParams {
    callbackUrl?: string;
    redirect?: boolean;
  }

  export function signOut(options?: SignOutParams): Promise<void>;

  export interface SessionProviderProps {
    children: React.ReactNode;
    session?: Session | null;
  }

  export const SessionProvider: React.ComponentType<SessionProviderProps>;
}


