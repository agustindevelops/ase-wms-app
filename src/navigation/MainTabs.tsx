import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeTabScreen } from '@/screens/HomeTabScreen';
import { PrintTabScreen } from '@/screens/PrintTabScreen';

export type MainTabParamList = {
  Home: undefined;
  Print: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Matches ASE cream / brown / green light theme. */
const tabBarStyle = {
  backgroundColor: '#FFFCF9',
  borderTopColor: '#e2d6c7',
};

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7e9570',
        tabBarInactiveTintColor: '#a89583',
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
