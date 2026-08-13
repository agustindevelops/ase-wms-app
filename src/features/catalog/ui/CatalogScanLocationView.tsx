import { Platform, StyleSheet, View } from 'react-native';
import {
  CameraView,
  type BarcodeScanningResult,
  type PermissionResponse,
} from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { ScanConfig } from '@/features/scan/hook/useScan';

export type CatalogScanLocationViewProps = {
  config: ScanConfig;
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse>;
  result: BarcodeScanningResult | null;
  onBarcodeScanned: (scan: BarcodeScanningResult) => void;
  scanAgain: () => void;
  binding: boolean;
  error: string | null;
  itemName: string;
  onClose: () => void;
};

export function CatalogScanLocationView({
  config,
  permission,
  requestPermission,
  result,
  onBarcodeScanned,
  scanAgain,
  binding,
  error,
  itemName,
  onClose,
}: CatalogScanLocationViewProps) {
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center p-6">
        <Text size="md" className="text-muted-foreground">
          Checking camera permission…
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center p-6">
        <StatusBar style="dark" />
        <VStack className="gap-3.5">
          <Heading size="xl" className="text-brown-900">
            {config.title}
          </Heading>
          <Text size="md" className="text-brown-500 leading-6">
            Camera access is required to scan a QR for {itemName}.
          </Text>
          <Button variant="default" onPress={requestPermission}>
            <ButtonText>Allow camera</ButtonText>
          </Button>
          <Button variant="secondary" onPress={onClose}>
            <ButtonText>Back</ButtonText>
          </Button>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: config.barcodeTypes }}
        onBarcodeScanned={result || binding ? undefined : onBarcodeScanned}
      />

      <SafeAreaView className="flex-1 justify-between">
        <VStack className="px-5 pt-3 gap-1">
          <Heading size="xl" className="text-white">
            {config.title}
          </Heading>
          <Text size="sm" className="text-zinc-300">
            {config.hint}
          </Text>
        </VStack>

        <Box className="self-center w-[72%] aspect-square border-2 border-white/85 rounded-xl bg-transparent" />

        <VStack className="px-5 pb-5 gap-3">
          {error ? (
            <Card className="p-4 gap-2.5 bg-card">
              <Text size="sm" bold className="text-destructive">
                {error}
              </Text>
              <Button variant="default" onPress={scanAgain} disabled={binding}>
                <ButtonText>Scan again</ButtonText>
              </Button>
            </Card>
          ) : null}

          {binding || result ? (
            <Card className="p-4 gap-2.5 bg-card">
              {binding ? (
                <VStack className="items-center gap-2">
                  <Spinner color="#7e9570" />
                  <Text size="sm" className="text-muted-foreground">
                    Working…
                  </Text>
                </VStack>
              ) : result ? (
                <>
                  <Text size="xs" bold className="text-muted-foreground uppercase">
                    Scanned
                  </Text>
                  <Text
                    size="sm"
                    selectable
                    className="text-foreground"
                    style={{
                      fontFamily: Platform.select({
                        ios: 'Menlo',
                        android: 'monospace',
                      }),
                    }}
                  >
                    {result.data}
                  </Text>
                </>
              ) : null}
            </Card>
          ) : (
            <Button
              className="bg-white/20 data-[hover=true]:bg-white/30"
              onPress={onClose}
              disabled={binding}
            >
              <ButtonText className="text-white">Cancel</ButtonText>
            </Button>
          )}
        </VStack>
      </SafeAreaView>
    </View>
  );
}
