import { api } from './client';

export type DashboardSummary = {
  totalInventory: number;
  upcomingEventsThisMonth: number;
  issuesThisMonth: number;
  changesLast24Hours: number;
};

export type ActivityActor = {
  id: string;
  email: string;
  initial: string;
};

export type ActivityFeedItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: string;
  actor: ActivityActor;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<{ summary: DashboardSummary }>(
    '/dashboard/summary',
  );
  return data.summary;
}

export async function fetchDashboardActivity(options?: {
  day?: string;
  limit?: number;
}): Promise<{ day: string; activities: ActivityFeedItem[] }> {
  const { data } = await api.get<{
    day: string;
    activities: ActivityFeedItem[];
  }>('/dashboard/activity', {
    params: {
      day: options?.day,
      limit: options?.limit,
    },
  });
  return data;
}
