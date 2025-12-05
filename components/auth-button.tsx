'use client';

import * as React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on escape
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [menuOpen]);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Reset signing in state when session changes
  React.useEffect(() => {
    if (session?.user && isSigningIn) {
      setIsSigningIn(false);
    }
  }, [session, isSigningIn]);

  // Timeout fallback to reset signing in state after 10 seconds
  React.useEffect(() => {
    if (!isSigningIn) return;
    const timeout = setTimeout(() => {
      setIsSigningIn(false);
    }, 10000); // 10 second timeout
    return () => clearTimeout(timeout);
  }, [isSigningIn]);

  const isLoading = status === 'loading';
  const user = session?.user;

  if (isLoading) {
    return (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70">
        <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsSigningIn(true);
          void signIn('google');
        }}
        disabled={isSigningIn}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-2.5 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground hover:bg-card/90 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSigningIn ? (
          <>
            <span className="inline-flex h-5 w-5 items-center justify-center">
              <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
            </span>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[13px] text-primary">
              G
            </span>
            <span>Sign in</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-[16px] font-semibold text-primary uppercase hover:bg-card/95 transition shadow-sm"
        aria-label="Open account menu"
      >
        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
      </button>
      {menuOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-2xl border border-border/70 bg-card/95 shadow-xl py-1 text-[11px] sm:text-xs z-40"
        >
          <div className="px-3 py-1.5 text-muted-foreground border-b border-border/60 truncate">
            {user.name || user.email}
          </div>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-accent/80 hover:text-foreground transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}


