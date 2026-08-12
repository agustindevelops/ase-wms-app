import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Login } from '@/features/auth';
import { getFirebaseAuth } from '@/firebase/config';
import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Route gate only — listens to the SDK; does not own tokens or session state.
 */
export function RootNavigator() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), setUser);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <Box className="flex-1 items-center justify-center bg-cream">
        <Spinner />
      </Box>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
