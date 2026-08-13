import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Keeps a render crash from taking down the app; shows the message with retry. */
export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(error.message, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <SafeAreaView className="flex-1 bg-cream">
        <Box className="flex-1 items-center justify-center px-6 gap-3">
          <Text size="sm" bold className="text-destructive text-center">
            {this.state.error.message}
          </Text>
          <Button onPress={() => this.setState({ error: null })}>
            <ButtonText>Try again</ButtonText>
          </Button>
        </Box>
      </SafeAreaView>
    );
  }
}
