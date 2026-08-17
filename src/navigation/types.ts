export type MainStackParamList = {
  MainMenu: undefined;
  WarehouseLevel: {
    warehouseId: string;
    warehouseName: string;
    level: number;
    parentLocationUnitId?: string;
    parentName?: string;
    /** Names above the current unit: warehouse, then each drilled parent. */
    ancestorNames: string[];
  };
  WarehouseForm: {
    warehouseId: string;
    initialName?: string;
  };
  LocationUnitForm: {
    warehouseId: string;
    warehouseName: string;
    level: number;
    parentLocationUnitId?: string;
    locationUnitId?: string;
    initialName?: string;
    initialLabel?: string;
  };
  PrintLocationLabel: {
    warehouseId: string;
    locationUnitId: string;
    locationName: string;
  };
  LinkLocationQr: {
    warehouseId: string;
    locationUnitId: string;
    locationName: string;
  };
  CatalogMenu: {
    warehouseId: string;
  };
  CatalogPhoto: {
    warehouseId: string;
    /** Set after the first save so going back to photos still updates. */
    itemId?: string;
  };
  CatalogItemList: {
    warehouseId: string;
    mode: 'add' | 'move' | 'remove';
  };
  CatalogScanItem: {
    warehouseId: string;
    mode: 'move' | 'remove';
  };
  CatalogDetails: {
    warehouseId: string;
    photoFileIds: string[];
    itemId?: string;
  };
  CatalogPrintQr: {
    warehouseId: string;
    itemId: string;
    itemName: string;
    qrCodeId?: string | null;
  };
  CatalogGlue: {
    warehouseId: string;
    itemId: string;
    itemName: string;
  };
  CatalogScanLocation: {
    warehouseId: string;
    itemId: string;
    itemName: string;
    /** Create finishes on Main Menu; add/move return to the Catalog hub. */
    doneTarget?: 'hub' | 'main';
  };
  OrderList: {
    mode: 'pickup' | 'return';
  };
  OrderDetail: {
    orderId: string;
    mode: 'pickup' | 'return';
  };
  OrderScanItem: {
    orderId: string;
    mode: 'pickup' | 'return';
  };
  OrderQty: {
    orderId: string;
    mode: 'pickup' | 'return';
    itemId: string;
    itemName: string;
    remaining: number;
    locationLabel?: string | null;
  };
  OrderScanLocation: {
    orderId: string;
    itemId: string;
    itemName: string;
    qty: number;
    locationLabel?: string | null;
  };
  OrderIssue: {
    orderId: string;
    itemId: string;
    itemName: string;
    remaining: number;
  };
  ReportIssueFind: {
    warehouseId: string;
  };
  ReportIssueScan: {
    warehouseId: string;
  };
  ReportIssueForm: {
    warehouseId: string;
    itemId: string;
    itemName: string;
  };
};
