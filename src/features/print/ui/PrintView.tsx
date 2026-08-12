import { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme, type Colors } from '@/theme';
import type { UsePrintResult } from '../hook/usePrint';

export type PrintViewProps = Omit<
  UsePrintResult,
  'scannerKind' | 'closeScanner' | 'status'
>;

export function PrintView({
  labelId,
  message,
  deviceName,
  printerSummary,
  busy,
  connect,
  printBarcode,
  printQr,
  openBarcodeScanner,
  openQrScanner,
}: PrintViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>D110 Print PoC</Text>
        <Text style={styles.subtitle}>
          Print · scan Code 128 · scan QR · ID {labelId}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>
            {deviceName ? `Connected: ${deviceName}` : 'Not connected'}
          </Text>
          {printerSummary ? (
            <Text style={styles.meta}>{printerSummary}</Text>
          ) : null}
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.id}>ID: {labelId}</Text>
        </View>

        {busy ? <ActivityIndicator size="large" color={colors.text} /> : null}

        <Pressable
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={connect}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {deviceName ? 'Reconnect printer' : 'Connect printer'}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.buttonPrimary,
            (busy || !deviceName) && styles.buttonDisabled,
          ]}
          onPress={printBarcode}
          disabled={busy || !deviceName}
        >
          <Text style={styles.buttonText}>Print Code 128 + digits</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.buttonPrimary,
            (busy || !deviceName) && styles.buttonDisabled,
          ]}
          onPress={printQr}
          disabled={busy || !deviceName}
        >
          <Text style={styles.buttonText}>Print max QR + digits</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={[styles.button, styles.buttonScan, busy && styles.buttonDisabled]}
          onPress={openBarcodeScanner}
          disabled={busy}
        >
          <Text style={styles.buttonText}>Scan barcode</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonScan, busy && styles.buttonDisabled]}
          onPress={openQrScanner}
          disabled={busy}
        >
          <Text style={styles.buttonText}>Scan QR code</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
      gap: 14,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textLabel,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    meta: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    id: {
      fontSize: 14,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
      color: colors.text,
    },
    button: {
      backgroundColor: colors.button,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonPrimary: {
      backgroundColor: colors.buttonPrimary,
    },
    buttonScan: {
      backgroundColor: colors.buttonScan,
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
  });
}
