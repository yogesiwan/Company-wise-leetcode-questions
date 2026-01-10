'use client';

import * as React from 'react';

export function DynamicFooterText() {
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState('Nov 2025');

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.lastUpdatedDate) {
            setLastUpdatedDate(data.settings.lastUpdatedDate);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <span className="text-[11px] sm:text-xs text-muted-foreground/70">
      All Questions from LeetCode premium upto {lastUpdatedDate}.
    </span>
  );
}
