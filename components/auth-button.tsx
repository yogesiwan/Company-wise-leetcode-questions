'use client';

import * as React from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  const isLoading = status === 'loading';
  const user = session?.user;

  if (isLoading) {
    return (
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card/70">
        <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          void signIn('google');
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground hover:bg-card/90 transition shadow-sm"
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
          G
        </span>
        <span>Sign in</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card/80 text-[11px] font-semibold text-primary uppercase hover:bg-card/95 transition shadow-sm"
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


