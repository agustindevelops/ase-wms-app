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
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { ScanConfig, ScannerKind } from '../hook/useScan';

export type ScanViewProps = {
  kind: ScannerKind;
  config: ScanConfig;
  permission: PermissionResponse | null;
  requestPermission: () => Promise<PermissionResponse>;
  result: BarcodeScanningResult | null;
  onBarcodeScanned: (scan: BarcodeScanningResult) => void;
  scanAgain: () => void;
  onClose: () => void;
};

export function ScanView({
  kind,
  config,
  permission,
  requestPermission,
  result,
  onBarcodeScanned,
  scanAgain,
  onClose,
}: ScanViewProps) {
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center p-6">
        <Text size="md" className="text-brown-500">
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
          <Heading size="xl">
            {config.title}
          </Heading>
          <Text size="md" className="text-brown-500 leading-6">
            Camera access is required to scan{' '}
            {kind === 'qr' ? 'QR codes' : 'barcodes'}.
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
        onBarcodeScanned={result ? undefined : onBarcodeScanned}
      />

      <SafeAreaView className="flex-1 justify-between">
        <VStack className="px-5 pt-3 gap-1">
          <Heading size="xl" className="text-white">
            {config.title}
          </Heading>
          <Text size="sm" className="text-cream">
            {config.hint}
          </Text>
        </VStack>

        <Box className="self-center w-[72%] aspect-square border-2 border-white/85 rounded-xl bg-transparent" />

        <VStack className="px-5 pb-5 gap-3">
          {result ? (
            <Card className="p-4 gap-2.5">
              <Text size="xs" bold className="text-brown-500 uppercase">
                Scanned ({result.type})
              </Text>
              <Text
                size="xl"
                bold
                selectable
                className="text-brown-800"
                style={{
                  fontFamily: Platform.select({
                    ios: 'Menlo',
                    android: 'monospace',
                  }),
                }}
              >
                {result.data}
              </Text>
              <VStack className="gap-2.5 mt-1">
                <Button variant="default" onPress={scanAgain}>
                  <ButtonText>Scan again</ButtonText>
                </Button>
                <Button
                  className="bg-white/20 data-[hover=true]:bg-white/30"
                  onPress={onClose}
                >
                  <ButtonText className="text-white">Done</ButtonText>
                </Button>
              </VStack>
            </Card>
          ) : (
            <Button
              className="bg-white/20 data-[hover=true]:bg-white/30"
              onPress={onClose}
            >
              <ButtonText className="text-white">Cancel</ButtonText>
            </Button>
          )}
        </VStack>
      </SafeAreaView>
    </View>
  );
}
