import { View } from 'react-native';
import House from 'lucide-react-native/icons/house';
import Layers from 'lucide-react-native/icons/layers';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import CircleArrowUp from 'lucide-react-native/icons/circle-arrow-up';
import CircleArrowDown from 'lucide-react-native/icons/circle-arrow-down';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from '@/features/dashboard';
import { CatalogStack } from './CatalogStack';
import { WarehouseStack } from './WarehouseStack';
import { PickupStack, ReturnStack } from './OrderStacks';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE = '#ce6b69';
const INACTIVE = '#c0aa91';

type IconName = 'home' | 'catalog' | 'warehouse' | 'pickup' | 'return';

function SoftTabIcon({
  name,
  focused,
}: {
  name: IconName;
  focused: boolean;
}) {
  const color = focused ? ACTIVE : INACTIVE;
  const size = 20;
  const strokeWidth = 1.75;

  const Icon =
    name === 'home'
      ? House
      : name === 'catalog'
        ? Layers
        : name === 'warehouse'
          ? LayoutGrid
          : name === 'pickup'
            ? CircleArrowUp
            : CircleArrowDown;

  return (
    <View
      style={{
        width: 36,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(206, 107, 105, 0.16)' : 'transparent',
      }}
    >
      <Icon color={color} size={size} strokeWidth={strokeWidth} />
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFCF9',
          borderTopColor: '#e2d6c7',
          height: 68,
          paddingTop: 6,
          paddingBottom: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter_500Medium',
          fontWeight: '500',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <SoftTabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStack}
        options={{
          title: 'Catalog',
          tabBarIcon: ({ focused }) => (
            <SoftTabIcon name="catalog" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WarehouseTab"
        component={WarehouseStack}
        options={{
          title: 'Warehouse',
          tabBarIcon: ({ focused }) => (
            <SoftTabIcon name="warehouse" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PickupTab"
        component={PickupStack}
        options={{
          title: 'Pickup',
          tabBarIcon: ({ focused }) => (
            <SoftTabIcon name="pickup" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ReturnTab"
        component={ReturnStack}
        options={{
          title: 'Return',
          tabBarIcon: ({ focused }) => (
            <SoftTabIcon name="return" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
