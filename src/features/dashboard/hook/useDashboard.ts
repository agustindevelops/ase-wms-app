import { useCallback, useEffect, useState } from 'react';
import { apiErrorMessage } from '@/api/client';
import {
  fetchDashboardActivity,
  fetchDashboardSummary,
  type ActivityFeedItem,
  type DashboardSummary,
} from '@/api/dashboard';

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setBusy(true);
    }
    setError(null);
    try {
      const [nextSummary, feed] = await Promise.all([
        fetchDashboardSummary(),
        fetchDashboardActivity({ limit: 3 }),
      ]);
      setSummary(nextSummary);
      setActivities(feed.activities);
    } catch (cause) {
      setSummary(null);
      setActivities([]);
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { summary, activities, error, busy, refreshing, load };
}

export type UseDashboardResult = ReturnType<typeof useDashboard>;
