'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthButton } from '@/components/auth-button';

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeToday: number;
  activeThisWeek: number;
  totalQuestionsCompleted: number;
  totalNotesCreated: number;
}

interface UserData {
  email: string;
  name?: string;
  image?: string;
  provider: string;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [pagination, setPagination] = React.useState<Pagination | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  
  // Settings state
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState('Nov 2025');
  const [lastUpdatedDateInput, setLastUpdatedDateInput] = React.useState('Nov 2025');
  const [settingsSaving, setSettingsSaving] = React.useState(false);
  const [settingsMessage, setSettingsMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check auth and admin status
  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/');
      return;
    }
    
    if (!session.user.isAdmin) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch stats
  React.useEffect(() => {
    if (!session?.user?.isAdmin) return;
    
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [session?.user?.isAdmin]);

  // Fetch settings
  React.useEffect(() => {
    if (!session?.user?.isAdmin) return;
    
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (data.settings?.lastUpdatedDate) {
          setLastUpdatedDate(data.settings.lastUpdatedDate);
          setLastUpdatedDateInput(data.settings.lastUpdatedDate);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    
    fetchSettings();
  }, [session?.user?.isAdmin]);

  // Save settings handler
  const handleSaveSettings = async () => {
    if (!lastUpdatedDateInput.trim()) {
      setSettingsMessage({ type: 'error', text: 'Please enter a date' });
      return;
    }
    
    setSettingsSaving(true);
    setSettingsMessage(null);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'lastUpdatedDate', value: lastUpdatedDateInput.trim() }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save setting');
      }
      
      setLastUpdatedDate(lastUpdatedDateInput.trim());
      setSettingsMessage({ type: 'success', text: 'Setting saved successfully!' });
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (err) {
      setSettingsMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setSettingsSaving(false);
    }
  };

  // Fetch users with debounce for search
  React.useEffect(() => {
    if (!session?.user?.isAdmin) return;
    
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          sortBy,
          sortOrder,
        });
        if (search) {
          params.set('search', search);
        }
        
        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(debounceTimer);
  }, [session?.user?.isAdmin, currentPage, search, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/70">
            <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 dark:border-border/30 bg-gradient-to-b from-card/95 via-card/85 to-card/75 dark:from-card/90 dark:via-card/80 dark:to-card/70 backdrop-blur-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 flex items-center justify-center">
                <svg className="w-10 h-10 text-foreground" viewBox="0 0 64 64" fill="none">
                  <path d="M24 22L16 32l8 10M40 22l8 10-8 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M33 20l-4 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                DeCodeIt
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-500/30">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/main"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to App</span>
            </Link>
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor user activity and platform statistics
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-destructive/10 border border-destructive rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="p-4 sm:p-5 rounded-2xl border bg-card/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {stats.totalUsers}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border bg-card/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                +{stats.newUsersThisWeek}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">New This Week</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border bg-card/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.activeThisWeek}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active This Week</div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border bg-card/80 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.totalQuestionsCompleted}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Questions Done</div>
            </div>
          </div>
        )}

        {/* Secondary Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="p-3 sm:p-4 rounded-xl border bg-card/50">
              <div className="text-lg sm:text-xl font-semibold text-foreground">
                +{stats.newUsersToday}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">New Today</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl border bg-card/50">
              <div className="text-lg sm:text-xl font-semibold text-foreground">
                +{stats.newUsersThisMonth}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">New This Month</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl border bg-card/50">
              <div className="text-lg sm:text-xl font-semibold text-foreground">
                {stats.activeToday}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">Active Today</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl border bg-card/50">
              <div className="text-lg sm:text-xl font-semibold text-foreground">
                {stats.totalNotesCreated}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground">Notes Created</div>
            </div>
          </div>
        )}

        {/* App Settings */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl overflow-hidden mb-8">
          <div className="p-4 sm:p-5 border-b">
            <h2 className="text-lg font-semibold">App Settings</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure settings that appear throughout the app
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="flex-1 max-w-xs">
                <label htmlFor="lastUpdatedDate" className="block text-sm font-medium mb-1.5">
                  Last Updated Date
                </label>
                <input
                  id="lastUpdatedDate"
                  type="text"
                  value={lastUpdatedDateInput}
                  onChange={(e) => setLastUpdatedDateInput(e.target.value)}
                  placeholder="e.g., Nov 2025"
                  className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Current: <span className="font-medium text-foreground">{lastUpdatedDate}</span>
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving || lastUpdatedDateInput === lastUpdatedDate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {settingsSaving ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  'Save Setting'
                )}
              </button>
            </div>
            {settingsMessage && (
              <div className={`mt-3 text-sm ${settingsMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {settingsMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-semibold">All Users</h2>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-64 rounded-xl border border-border/60 bg-background/60 px-9 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 sm:p-4 text-xs font-medium text-muted-foreground">
                    User
                  </th>
                  <th 
                    className="text-left p-3 sm:p-4 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition"
                    onClick={() => handleSort('createdAt')}
                  >
                    <span className="flex items-center gap-1">
                      Joined
                      {sortBy === 'createdAt' && (
                        <svg className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </th>
                  <th 
                    className="text-left p-3 sm:p-4 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition"
                    onClick={() => handleSort('lastLoginAt')}
                  >
                    <span className="flex items-center gap-1">
                      Last Active
                      {sortBy === 'lastLoginAt' && (
                        <svg className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </th>
                  <th 
                    className="text-left p-3 sm:p-4 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition"
                    onClick={() => handleSort('loginCount')}
                  >
                    <span className="flex items-center gap-1">
                      Logins
                      {sortBy === 'loginCount' && (
                        <svg className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-medium text-muted-foreground">
                    Provider
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-primary/60 border-t-transparent" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      {search ? 'No users found matching your search.' : 'No users yet.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.email} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {user.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                        {formatRelativeTime(user.lastLoginAt)}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {user.loginCount}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs capitalize">
                          {user.provider}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-muted-foreground px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
