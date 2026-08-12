import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeTabScreen } from '@/screens/HomeTabScreen';
import { PrintTabScreen } from '@/screens/PrintTabScreen';

export type MainTabParamList = {
  Home: undefined;
  Print: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabBarStyle = {
  backgroundColor: '#ffffff',
  borderTopColor: '#e5e5e5',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#18181b',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle,
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
