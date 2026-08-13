import './global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ScreenErrorBoundary } from '@/components/ui/ScreenErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener
          onChange={({ insets }) => {
            Uniwind.updateInsets(insets);
          }}
        >
          <GluestackUIProvider mode="light">
            <ScreenErrorBoundary>
              <RootNavigator />
            </ScreenErrorBoundary>
          </GluestackUIProvider>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
