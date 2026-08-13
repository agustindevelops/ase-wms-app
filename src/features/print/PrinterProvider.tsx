import { createContext, useContext, type ReactNode } from 'react';
import { usePrint, type UsePrintResult } from './hook/usePrint';

const PrinterContext = createContext<UsePrintResult | null>(null);

/** One BLE printer session for Manage Warehouse (and other authenticated screens). */
export function PrinterProvider({ children }: { children: ReactNode }) {
  const value = usePrint();
  return (
    <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>
  );
}

export function usePrinter(): UsePrintResult {
  const ctx = useContext(PrinterContext);
  if (!ctx) {
    throw new Error('usePrinter must be used within PrinterProvider');
  }
  return ctx;
}
