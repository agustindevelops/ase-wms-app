import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/types';
import { useMainMenu } from './hook/useMainMenu';
import { MainMenuView } from './ui/MainMenuView';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'MainMenu'>;

export function MainMenu() {
  const navigation = useNavigation<Navigation>();
  const menu = useMainMenu();

  useEffect(() => {
    void menu.load();
  }, [menu.load]);

  const onManageWarehouse = () => {
    if (!menu.me) return;
    // Physical warehouse path; tenant is organizationId on the token.
    navigation.navigate('WarehouseLevel', {
      warehouseId: menu.me.warehouse.id,
      warehouseName: menu.me.warehouse.name,
      level: 1,
      ancestorNames: [],
    });
  };

  const onCatalog = () => {
    if (!menu.me) return;
    navigation.navigate('CatalogMenu', {
      warehouseId: menu.me.warehouse.id,
    });
  };

  return (
    <MainMenuView
      {...menu}
      onManageWarehouse={onManageWarehouse}
      onCatalog={onCatalog}
      onPickup={() => navigation.navigate('OrderList', { mode: 'pickup' })}
      onReturn={() => navigation.navigate('OrderList', { mode: 'return' })}
      onReportIssue={() => {
        if (!menu.me) return;
        navigation.navigate('ReportIssueFind', {
          warehouseId: menu.me.warehouse.id,
        });
      }}
    />
  );
}

export default MainMenu;
