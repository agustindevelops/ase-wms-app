import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiErrorMessage } from '@/api/client';
import {
  fetchDashboardActivity,
  type ActivityFeedItem,
} from '@/api/dashboard';
import { AppHeader } from '@/components/AppHeader';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { RootMainParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootMainParamList, 'ActivityList'>;

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityList() {
  const navigation = useNavigation<Props['navigation']>();
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setBusy(true);
    }
    setError(null);
    try {
      const feed = await fetchDashboardActivity({
        limit: 100,
      });
      setActivities(feed.activities);
    } catch (cause) {
      setError(apiErrorMessage(cause));
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
          <HStack className="items-center justify-between">
            <Heading size="2xl">
              Activity
            </Heading>
            <Button variant="outline" size="sm" onPress={() => navigation.goBack()}>
              <ButtonText>Back</ButtonText>
            </Button>
          </HStack>
          <Text size="sm" className="text-brown-500">
            Last 24 hours
          </Text>

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

          {busy ? <Spinner /> : null}

          {!busy && activities.length === 0 ? (
            <Text size="sm" className="text-brown-500">
              No activity in the last 24 hours.
            </Text>
          ) : null}

          {activities.map((item) => (
            <HStack
              key={item.id}
              className="items-center gap-3 rounded-2xl border border-brown-200 bg-white/60 p-3"
            >
              <Box className="h-10 w-10 rounded-full bg-green-100 items-center justify-center">
                <Text className="text-green-800 font-inter-bold">{item.actor.initial}</Text>
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
          ))}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ActivityList;
