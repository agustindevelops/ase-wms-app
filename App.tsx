import './global.css';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useLocalFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ScreenErrorBoundary } from '@/components/ui/ScreenErrorBoundary';
import { ModalProvider } from '@/components/modal/ModalContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  const [interLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [nickLoaded] = useLocalFonts({
    Nickainley: require('./assets/fonts/Nickainley-Normal.otf'),
  });

  if (!interLoaded || !nickLoaded) {
    return (
      <Box className="flex-1 items-center justify-center bg-cream">
        <Spinner />
      </Box>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener
          onChange={({ insets }) => {
            Uniwind.updateInsets(insets);
          }}
        >
          <GluestackUIProvider mode="light">
            <ModalProvider>
              <ScreenErrorBoundary>
                <RootNavigator />
              </ScreenErrorBoundary>
            </ModalProvider>
          </GluestackUIProvider>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
