import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { startSessionSync, useSessionStatus } from '@/auth/session';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Login } from '@/features/auth';
import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Route gate only: reads the session flag, never the backend. The flag is fed
 * by the SDK and cleared by the axios 401 handler.
 */
export function RootNavigator() {
  const status = useSessionStatus();

  useEffect(() => startSessionSync(), []);

  if (status === 'loading') {
    return (
      <Box className="flex-1 items-center justify-center bg-cream">
        <Spinner />
      </Box>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {status === 'authenticated' ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
