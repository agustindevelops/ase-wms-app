import { StatusBar } from 'expo-status-bar';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { AppHeader } from '@/components/AppHeader';
import { useMe } from '@/auth/MeContext';
import type { UseDashboardResult } from '../hook/useDashboard';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60_000));
  if (mins < 1) return 'Just Now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export type DashboardViewProps = UseDashboardResult & {
  onSeeAll: () => void;
};

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Box className="flex-1 min-w-[46%] rounded-2xl border border-brown-200 bg-white/70 p-4">
      <Text size="xs" className="text-brown-500 mb-1">
        {label}
      </Text>
      <Heading size="xl">
        {value}
      </Heading>
    </Box>
  );
}

export function DashboardView({
  summary,
  activities,
  error,
  busy,
  refreshing,
  load,
  onSeeAll,
}: DashboardViewProps) {
  const { me } = useMe();

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <AppHeader />
      <ScrollView
        contentContainerClassName="px-6 pt-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor="#7e9570"
          />
        }
      >
        <VStack className="gap-4">
          <VStack className="gap-1">
            <Heading size="2xl">
              {greeting()}!
            </Heading>
            <Text size="sm" className="text-brown-500">
              {me
                ? `${me.organization.name}${me.warehouse ? ` · ${me.warehouse.name}` : ''}`
                : "Here's what's happening today."}
            </Text>
          </VStack>

          {error ? (
            <VStack className="gap-2">
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
              <Button variant="secondary" onPress={() => void load()}>
                <ButtonText>Retry</ButtonText>
              </Button>
            </VStack>
          ) : null}

          {busy && !summary ? (
            <Spinner />
          ) : summary ? (
            <HStack className="flex-wrap gap-3">
              <MetricCard label="Total inventory" value={summary.totalInventory} />
              <MetricCard
                label="Upcoming events"
                value={summary.upcomingEventsThisMonth}
              />
              <MetricCard label="Issues this month" value={summary.issuesThisMonth} />
              <MetricCard label="Last 24 hours" value={summary.changesLast24Hours} />
            </HStack>
          ) : null}

          <VStack className="gap-3 mt-2">
            <HStack className="items-center justify-between">
              <Heading size="xl">
                Recent Activity
              </Heading>
              <Pressable onPress={onSeeAll}>
                <Text size="sm" className="text-green-700 font-inter-semibold">
                  See all
                </Text>
              </Pressable>
            </HStack>

            {activities.length === 0 && !busy ? (
              <Text size="sm" className="text-brown-500">
                No changes in the last 24 hours.
              </Text>
            ) : (
              activities.map((item) => (
                <HStack
                  key={item.id}
                  className="items-center gap-3 rounded-2xl border border-brown-200 bg-white/60 p-3"
                >
                  <Box className="h-10 w-10 rounded-full bg-green-100 items-center justify-center">
                    <Text className="text-green-800 font-inter-bold">
                      {item.actor.initial}
                    </Text>
                  </Box>
                  <VStack className="flex-1 gap-0.5">
                    <Text size="sm" bold className="text-brown-800">
                      {item.summary}
                    </Text>
                    <Text size="xs" className="text-brown-500">
                      {item.actor.email}
                    </Text>
                  </VStack>
                  <Text size="xs" className="text-brown-500">
                    {timeAgo(item.createdAt)}
                  </Text>
                </HStack>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
