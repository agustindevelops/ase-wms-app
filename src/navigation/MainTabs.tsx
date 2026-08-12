import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';
import { HomeTabScreen } from '@/screens/HomeTabScreen';
import { PrintTabScreen } from '@/screens/PrintTabScreen';

export type MainTabParamList = {
  Home: undefined;
  Print: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarIcon: () => null,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTabScreen}
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Print"
        component={PrintTabScreen}
        options={{ title: 'Print', tabBarLabel: 'Print' }}
      />
    </Tab.Navigator>
  );
}
